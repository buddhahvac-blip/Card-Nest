import assert from 'node:assert/strict';
import test from 'node:test';
import {physicalEtbs,totalInventoryCostCents,individualGrossMarginCents} from '../lib/physical-catalog';

test('physical stock and costs reconcile to confirmed owner inventory',()=>{
 assert.equal(physicalEtbs.reduce((n,p)=>n+p.quantity,0),8);
 assert.equal(totalInventoryCostCents,130900);
 assert.equal(individualGrossMarginCents,24600);
});
test('all physical products have positive asking price and valid unit cost',()=>{
 for(const p of physicalEtbs){
  assert.ok(p.quantity>0 && Number.isSafeInteger(p.quantity));
  assert.ok(p.costCents>0 && p.priceCents>0);
 }
});
