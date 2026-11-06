import test from 'node:test';
import assert from 'node:assert/strict';
import {canApplyStockDelta,signedStockDelta,summarizePhysicalStock} from '../lib/physical-stock';

test('reserved units are not offered for sale',()=>{
  assert.deepEqual(summarizePhysicalStock({onHand:5,reserved:3,lowStockThreshold:2}),{
    available:2,isLow:true,isSoldOut:false
  });
});
test('last reserved unit is sold out even with on-hand units',()=>{
  assert.deepEqual(summarizePhysicalStock({onHand:1,reserved:1,lowStockThreshold:2}),{
    available:0,isLow:true,isSoldOut:true
  });
});
test('corrupt or oversold stock is rejected',()=>{
  for(const snapshot of [
    {onHand:0,reserved:1,lowStockThreshold:2},
    {onHand:-1,reserved:0,lowStockThreshold:0},
    {onHand:1.2,reserved:0,lowStockThreshold:2}
  ])assert.throws(()=>summarizePhysicalStock(snapshot));
});
test('receipts and returned stock increase inventory',()=>{
  assert.equal(signedStockDelta('receipt',4),4);
  assert.equal(signedStockDelta('return',1),1);
});
test('livestream sales and damage decrease inventory',()=>{
  assert.equal(signedStockDelta('live_sale',3),-3);
  assert.equal(signedStockDelta('damage',2),-2);
});
test('reject zero, fractional, negative and excessive adjustment quantities',()=>{
  for(const n of [-3,0,1.5,1001,Infinity,NaN]){
    assert.throws(()=>signedStockDelta('live_sale',n));
  }
});
test('cannot remove units held for another order',()=>{
  assert.equal(canApplyStockDelta({onHand:5,reserved:3},-2),true);
  assert.equal(canApplyStockDelta({onHand:5,reserved:3},-3),false);
});
test('invalid stock snapshots and zero deltas fail closed',()=>{
  assert.equal(canApplyStockDelta({onHand:4,reserved:5},1),false);
  assert.equal(canApplyStockDelta({onHand:4,reserved:-1},1),false);
  assert.equal(canApplyStockDelta({onHand:4,reserved:0},0),false);
  assert.equal(canApplyStockDelta({onHand:4,reserved:0},-5),false);
});
