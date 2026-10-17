import {transaction} from '@/lib/postgres';

/** Release a cancelled, unpaid order only after Stripe confirms its Checkout Session
 * is expired or no payment was collected. Caller must verify this with Stripe first.
 * Never release a reservation based solely on a customer browser redirect.
 */
export async function releaseVerifiedUnpaidPhysicalOrder(orderId:string, verifiedSessionId:string){
 return transaction(async client=>{
  const order=await client.query('SELECT status,stripe_session_id FROM physical_orders WHERE id=$1 FOR UPDATE',[orderId]);
  if(order.rowCount!==1)throw Error('Unknown order');
  if(order.rows[0].stripe_session_id!==verifiedSessionId)throw Error('Verified session mismatch');
  if(order.rows[0].status==='cancelled')return false;
  if(order.rows[0].status!=='pending')throw Error('Paid or disputed orders cannot be cancelled this way');
  const lines=await client.query('SELECT product_id,quantity FROM physical_order_items WHERE order_id=$1',[orderId]);
  for(const line of lines.rows){
   const stock=await client.query(`UPDATE physical_stock SET reserved_quantity=reserved_quantity-$2,updated_at=now()
     WHERE product_id=$1 AND reserved_quantity >= $2 RETURNING product_id`,[line.product_id,line.quantity]);
   if(stock.rowCount!==1)throw Error('Missing stock reservation');
  }
  await client.query(`UPDATE physical_orders SET status='cancelled',updated_at=now() WHERE id=$1`,[orderId]);
  return true;
 });
}
