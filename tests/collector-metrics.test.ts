import {test} from 'node:test';
import assert from 'node:assert/strict';
import {collectorMetricSchema,collectorSessionHash,collectorMetricKind} from '../lib/collector-metrics';

const session='07c17b3b-6873-42b0-9700-82747a67c15f';

test('store events accept a random session and approved event types',()=>{
  assert.equal(collectorMetricSchema.safeParse({event:'visit',session}).success,true);
  assert.equal(collectorMetricSchema.safeParse({event:'contact',session,product:'Prismatic Evolutions'}).success,true);
  assert.equal(collectorMetricSchema.safeParse({event:'inquiry',session,product:'Destined Rivals'}).success,true);
});

test('no personal data can enter tracked event payloads',()=>{
  assert.equal(collectorMetricSchema.safeParse({event:'inquiry',session,email:'person@example.com',product:'Prismatic Evolutions'}).success,false);
  assert.equal(collectorMetricSchema.safeParse({event:'inquiry',session}).success,false);
  assert.equal(collectorMetricSchema.safeParse({event:'inquiry',session,product:'<script>'}).success,false);
  assert.equal(collectorMetricSchema.safeParse({event:'unknown',session}).success,false);
});

test('session storage uses irreversible derived token and distinct event names',()=>{
  const hash=collectorSessionHash(session);
  assert.equal(hash.length,32);
  assert.notEqual(hash,session);
  assert.equal(collectorMetricKind.inquiry,'collector-shop-inquiry');
  assert.equal(collectorMetricKind.visit,'collector-shop-visit');
});
