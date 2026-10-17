import {randomUUID} from 'node:crypto';
import {transaction} from '@/lib/postgres';
import {physicalEtbs} from '@/lib/physical-catalog';

type Line={productId:string;quantity:number};
const catalog=new Map<string,(typeof physicalEtbs)[number]>(physicalEtbs.map(p=>[p.id,p]));

export function validatePhysicalLines(lines:Line[]){
 if(!Array.isArray(lines)||lines.length<1||lines.length>physicalEtbs.length)throw Error('Invalid order lines');
 const seen=new Set<string>();
 return lines.map(line=>{
  const item=catalog.get(line.productId);
  if(!item||seen.has(line.productId)||!Number.isSafeInteger(line.quantity)||line.quantity<1||line.quantity>item.quantity)throw Error('Invalid product or quantity');
  seen.add(line.productId);
  return {item,quantity:line.quantity};
 });
}

/** Transactional reservation; run only after stock rows are initialized and before Stripe checkout.
 * The caller must release expired/abandoned reservations separately. Not connected to live checkout.
 */
export async function reservePhysicalOrder(customerId:string,lines:Line[],fulfillment:'pickup'|'ship'){
 const checked=validatePhysicalLines(lines);
 if(!customerId)throw Error('Customer required');
 return transaction(async client=>{
  const id=randomUUID();
  const subtotal=checked.reduce((sum,{item,quantity})=>sum+item.priceCents*quantity,0);
  await client.query(`INSERT INTO physical_orders(id,customer_id,merchandise_cents,shipping_charged_cents,carrier_cost_cents,handling_cents,fulfillment_method)
    VALUES($1,$2,$3,0,0,0,$4)`,[id,customerId,subtotal,fulfillment]);
  for(const {item,quantity} of checked){
   const stock=await client.query(`UPDATE physical_stock SET reserved_quantity=reserved_quantity+$2,updated_at=now()
     WHERE product_id=$1 AND initial_quantity-sold_quantity-reserved_quantity >= $2 RETURNING product_id`,[item.id,quantity]);
   if(stock.rowCount!==1)throw Error('Insufficient available stock');
   await client.query(`INSERT INTO physical_order_items(order_id,product_id,quantity,unit_price_cents,unit_cost_cents)
     VALUES($1,$2,$3,$4,$5)`,[id,item.id,quantity,item.priceCents,item.costCents]);
  }
  return {orderId:id,subtotalCents:subtotal};
 });
}

/** Called by a verified, paid Stripe webhook in its own DB transaction, never by a browser. */
export async function markPhysicalOrderPaid(orderId:string,sessionId:string,intentId:string|null){
 return transaction(async client=>{
  const order=await client.query('SELECT status FROM physical_orders WHERE id=$1 FOR UPDATE',[orderId]);
  if(order.rowCount!==1)throw Error('Unknown physical order');
  if(order.rows[0].status==='paid')return false;
  if(order.rows[0].status!=='pending')throw Error('Order not payable');
  const lines=await client.query('SELECT product_id,quantity FROM physical_order_items WHERE order_id=$1',[orderId]);
  if(!lines.rowCount)throw Error('Order has no items');
  for(const line of lines.rows){
   const updated=await client.query(`UPDATE physical_stock SET reserved_quantity=reserved_quantity-$2,sold_quantity=sold_quantity+$2,updated_at=now()
     WHERE product_id=$1 AND reserved_quantity >= $2 RETURNING product_id`,[line.product_id,line.quantity]);
   if(updated.rowCount!==1)throw Error('Missing stock reservation');
  }
  await client.query(`UPDATE physical_orders SET status='paid',stripe_session_id=$2,stripe_payment_intent_id=$3,updated_at=now() WHERE id=$1`,[orderId,sessionId,intentId]);
  return true;
 });
}
