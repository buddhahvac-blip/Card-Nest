import {transaction} from '@/lib/postgres';

/** This function is only called after Stripe signature verification AND retrieving
 * the Checkout Session directly from Stripe. Never trust browser callbacks.
 * Event insert, stock movement and order status commit atomically.
 */
export async function confirmVerifiedPhysicalPayment(input:{
 eventId:string;sessionId:string;orderId:string;paymentIntentId:string|null;
 paymentStatus:string;currency:string|null;amountTotal:number|null;livemode:boolean;
}){
 if(input.paymentStatus!=='paid'||input.currency!=='usd'||!Number.isSafeInteger(input.amountTotal)||(input.amountTotal as number)<0)throw Error('Payment not verified');
 return transaction(async client=>{
  const order=await client.query('SELECT * FROM physical_orders WHERE id=$1 FOR UPDATE',[input.orderId]);
  if(order.rowCount!==1)throw Error('Unknown physical order');
  const o=order.rows[0];
  const expected=Number(o.merchandise_cents)+Number(o.shipping_charged_cents);
  if(input.amountTotal!==expected)throw Error('Payment amount mismatch; manual review required');
  if(o.stripe_session_id&&o.stripe_session_id!==input.sessionId)throw Error('Session mismatch');
  if(o.status==='paid'||o.status==='fulfilled')return {confirmed:true,alreadyPaid:true};
  if(o.status!=='pending')throw Error('Order not payable');
  const lines=await client.query('SELECT product_id,quantity FROM physical_order_items WHERE order_id=$1',[input.orderId]);
  if(!lines.rowCount)throw Error('Missing order lines');
  for(const line of lines.rows){
   const stock=await client.query(`UPDATE physical_stock SET reserved_quantity=reserved_quantity-$2,sold_quantity=sold_quantity+$2,updated_at=now()
    WHERE product_id=$1 AND reserved_quantity >= $2 RETURNING product_id`,[line.product_id,line.quantity]);
   if(stock.rowCount!==1)throw Error('Reservation missing; investigate payment');
  }
  await client.query(`UPDATE physical_orders SET status='paid',stripe_session_id=$2,stripe_payment_intent_id=$3,updated_at=now() WHERE id=$1`,[input.orderId,input.sessionId,input.paymentIntentId]);
  await client.query('INSERT INTO physical_payment_events(stripe_event_id,stripe_session_id) VALUES($1,$2) ON CONFLICT DO NOTHING',[input.eventId,input.sessionId]);
  return {confirmed:true,alreadyPaid:false};
 });
}
