import type {PoolClient} from 'pg';
import {transaction} from './postgres';
import {RequestError} from './http';

type EventSession={
 id:string;metadata:Record<string,string>|null;mode:string;
 payment_status:string;currency:string|null;amount_subtotal:number|null;
 amount_total:number|null;payment_intent:string|null;
 shipping_cost?:{amount_total:number}|null;
};

export async function reserveCollectorOrder(
 itemId:string,quantity:number,email:string,requestKey:string,id:string
){
 return transaction(async c=>{
  const existing=await c.query('SELECT * FROM collector_orders WHERE request_key=$1 FOR UPDATE',[requestKey]);
  if(existing.rowCount){
   const o=existing.rows[0];
   if(o.item_id!==itemId||o.quantity!==quantity||o.email!==email||o.status!=='pending'||new Date(o.hold_expires).getTime()<=Date.now())throw new RequestError('Checkout request already used',409);
   return o;
  }
  const r=await c.query(
   `UPDATE collector_inventory SET reserved=reserved+$2,updated=now()
    WHERE id=$1 AND sellable=true AND verified_photos=true AND unit_price_cents>=50
    AND on_hand-reserved >= $2
    RETURNING id,name,unit_price_cents`,[itemId,quantity]);
  if(!r.rowCount)throw new RequestError('This product is unavailable or not yet verified.',409);
  const item=r.rows[0];
  const order=await c.query(
   `INSERT INTO collector_orders(id,item_id,quantity,unit_price_cents,email,request_key,hold_expires)
    VALUES($1,$2,$3,$4,$5,$6,now()+interval '65 minutes') RETURNING *`,
   [id,itemId,quantity,item.unit_price_cents,email,requestKey]);
  return order.rows[0];
 });
}

export async function attachCollectorSession(id:string,sessionId:string){
 const r=await transaction(c=>c.query(
  `UPDATE collector_orders SET session_id=$2 WHERE id=$1
   AND status='pending' AND (session_id IS NULL OR session_id=$2) RETURNING id`,[id,sessionId]));
 if(!r.rowCount)throw new RequestError('Order session cannot be assigned',409);
}

export async function finalizeCollectorEvent(eventId:string,type:string,s:EventSession){
 return transaction(async c=>{
  const claim=await c.query(
   'INSERT INTO collector_stripe_events(id,type) VALUES($1,$2) ON CONFLICT DO NOTHING RETURNING id',
   [eventId,type]);
  if(!claim.rowCount)return {duplicate:true};
  if(s.metadata?.purpose!=='collector-physical'||!s.metadata.order_id)return {ignored:true};
  const id=s.metadata.order_id;
  const r=await c.query('SELECT * FROM collector_orders WHERE id=$1 FOR UPDATE',[id]);
  if(!r.rowCount)throw new Error('Collector order missing');
  const o=r.rows[0];
  if(o.session_id&&o.session_id!==s.id)throw new Error('Unexpected Stripe session');
  if(s.metadata.item_id!==o.item_id||s.metadata.quantity!==String(o.quantity)||s.metadata.request_key!==o.request_key)throw new Error('Collector order mismatch');
  const price=o.unit_price_cents*o.quantity;
  if(type==='checkout.session.expired'){
   if(o.status==='pending'&&s.payment_status!=='paid'){
    await release(c,o.id,o.item_id,o.quantity,'expired');
   }
   return {expired:true};
  }
  if(type==='checkout.session.completed'||type==='checkout.session.async_payment_succeeded'){
   if(s.mode!=='payment'||s.payment_status!=='paid'||s.currency!=='usd'||
      s.amount_subtotal!==price||!Number.isSafeInteger(s.amount_total)||(s.amount_total??-1)<price||
      !s.shipping_cost||s.shipping_cost.amount_total<0)throw new Error('Unverified collector amount or payment');
   if(o.status==='paid')return {duplicate:true};
   if(o.status!=='pending')throw new Error('Order is not reserved');
   const updated=await c.query(
    `UPDATE collector_inventory SET on_hand=on_hand-$2,reserved=reserved-$2,updated=now()
     WHERE id=$1 AND on_hand>=$2 AND reserved>=$2 RETURNING id`,[o.item_id,o.quantity]);
   if(!updated.rowCount)throw new Error('Reservation inventory mismatch');
   await c.query(
    `UPDATE collector_orders SET status='paid',session_id=$2,payment_intent=$3,paid_at=now(),paid_total_cents=$4
     WHERE id=$1`,[o.id,s.id,s.payment_intent,s.amount_total]);
   return {paid:true};
  }
  return {ignored:true};
 });
}

async function release(c:PoolClient,id:string,itemId:string,quantity:number,status:'expired'){
 const x=await c.query('UPDATE collector_inventory SET reserved=reserved-$2,updated=now() WHERE id=$1 AND reserved>=$2 RETURNING id',[itemId,quantity]);
 if(!x.rowCount)throw new Error('Cannot release reserved inventory');
 await c.query('UPDATE collector_orders SET status=$2 WHERE id=$1 AND status=\'pending\'',[id,status]);
}

export async function markCollectorPaymentReview(eventId:string,type:string,intentId:string){
 return transaction(async c=>{
  const claimed=await c.query('INSERT INTO collector_stripe_events(id,type) VALUES($1,$2) ON CONFLICT DO NOTHING RETURNING id',[eventId,type]);
  if(!claimed.rowCount)return;
  await c.query(
   `UPDATE collector_orders SET status='review_required'
    WHERE payment_intent=$1 AND status='paid'`,[intentId]);
 });
}

export async function releaseOrphanCollectorHold(id:string){
 return transaction(async c=>{
  const result=await c.query(
   "SELECT * FROM collector_orders WHERE id=$1 AND status='pending' AND session_id IS NULL AND hold_expires<now() FOR UPDATE",
   [id]);
  if(!result.rowCount)return false;
  const o=result.rows[0];
  await release(c,o.id,o.item_id,o.quantity,'expired');
  return true;
 });
}
