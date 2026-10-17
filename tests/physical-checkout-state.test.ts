import assert from 'node:assert/strict';
import test from 'node:test';

/** Pure state-model checks. These are NOT Stripe sandbox transactions or DB integration tests. */
type State={available:number;reserved:number;sold:number;status:'pending'|'paid'|'cancelled'};
function reserve(s:State){if(s.available<1)throw Error('Out of stock');s.available--;s.reserved++;s.status='pending'}
function pay(s:State,verified:boolean){if(!verified)throw Error('Payment not verified');if(s.status==='paid')return;if(s.status!=='pending'||s.reserved<1)throw Error('No payable reservation');s.reserved--;s.sold++;s.status='paid'}
function cancel(s:State,verifiedUnpaid:boolean){if(!verifiedUnpaid)throw Error('Stripe confirmation required');if(s.status==='cancelled')return;if(s.status!=='pending'||s.reserved<1)throw Error('Cannot cancel paid order');s.reserved--;s.available++;s.status='cancelled'}

test('successful verified payment consumes exactly one reserved ETB',()=>{
 const s:State={available:5,reserved:0,sold:0,status:'pending'};
 reserve(s);assert.deepEqual([s.available,s.reserved,s.sold],[4,1,0]);
 pay(s,true);assert.deepEqual([s.available,s.reserved,s.sold],[4,0,1]);
 pay(s,true);assert.deepEqual([s.available,s.reserved,s.sold],[4,0,1]);
});
test('failed payment cannot consume stock',()=>{
 const s:State={available:5,reserved:0,sold:0,status:'pending'};
 reserve(s);assert.throws(()=>pay(s,false));assert.deepEqual([s.available,s.reserved,s.sold],[4,1,0]);
});
test('verified unpaid cancellation returns reservation once',()=>{
 const s:State={available:5,reserved:0,sold:0,status:'pending'};
 reserve(s);assert.throws(()=>cancel(s,false));cancel(s,true);cancel(s,true);
 assert.deepEqual([s.available,s.reserved,s.sold],[5,0,0]);
 assert.throws(()=>pay(s,true));
});
test('paid orders cannot be cancelled as unpaid',()=>{
 const s:State={available:5,reserved:0,sold:0,status:'pending'};
 reserve(s);pay(s,true);assert.throws(()=>cancel(s,true));
});
