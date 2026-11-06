import test from 'node:test';
import assert from 'node:assert/strict';
import {summarizePhysicalStock} from '../lib/physical-stock';

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
