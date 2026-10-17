import assert from 'node:assert/strict';
import test from 'node:test';
import {quotePhysicalOrder} from '../lib/physical-shipping';

const costs = {merchandiseRevenueCents: 20000, inventoryCostCents: 16000, packagingCostCents: 200, paymentFeeCents: 700, minimumProfitCents: 2000};

test('pickup has no shipping or handling charge', () => {
  const quote = quotePhysicalOrder(costs, {kind:'pickup', pickupConfirmed:true});
  assert.equal(quote.shippingChargedCents, 0);
  assert.equal(quote.estimatedProfitCents, 3100);
  assert.equal(quote.eligibleForCheckout, true);
});

test('shipping adds verified carrier rate and default handling fee', () => {
  const quote = quotePhysicalOrder(costs, {kind:'ship', destinationZip:'98101', carrierRateCents:1500});
  assert.equal(quote.originZip, '96737');
  assert.equal(quote.shippingChargedCents, 1900);
  assert.equal(quote.estimatedProfitCents, 3500);
});

test('unprofitable orders are blocked', () => {
  const quote = quotePhysicalOrder({...costs, inventoryCostCents:19500}, {kind:'ship', destinationZip:'10001', carrierRateCents:1800});
  assert.equal(quote.eligibleForCheckout, false);
});

test('rejects invalid rates and destination', () => {
  assert.throws(() => quotePhysicalOrder(costs, {kind:'ship', destinationZip:'oops', carrierRateCents:100}));
  assert.throws(() => quotePhysicalOrder(costs, {kind:'ship', destinationZip:'96737', carrierRateCents:-100}));
});
