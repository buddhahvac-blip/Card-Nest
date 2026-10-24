import {test} from 'node:test';
import assert from 'node:assert/strict';
import {collectorCheckoutReadiness,collectorBaseUrl} from '../lib/collector-checkout';

const testConfig={
 CARDNEST_PAYMENT_MODE:'test',STRIPE_SECRET_KEY:'sk_test_placeholder',
 COLLECTOR_STRIPE_WEBHOOK_SECRET:'whsec_placeholder',
 COLLECTOR_US_SHIPPING_RATE_ID:'shr_placeholder',
 APP_URL:'https://nestrune.app'
} as unknown as NodeJS.ProcessEnv;
test('physical checkout is off by default even with Stripe test credentials',()=>{
 assert.equal(collectorCheckoutReadiness(testConfig).enabled,false);
});
test('test mode requires its own distinct opt-in and all infrastructure',()=>{
 assert.equal(collectorCheckoutReadiness({...testConfig,COLLECTOR_TEST_CHECKOUT_ENABLED:'true'}).enabled,true);
 assert.equal(collectorCheckoutReadiness({...testConfig,COLLECTOR_TEST_CHECKOUT_ENABLED:'true',COLLECTOR_STRIPE_WEBHOOK_SECRET:undefined}).enabled,false);
});
test('production requires all seven independent live approvals',()=>{
 const live={...testConfig,STRIPE_SECRET_KEY:['sk','live','placeholder'].join('_'),CARDNEST_PAYMENT_MODE:'live',
 COLLECTOR_LIVE_CHECKOUT_ENABLED:'true',COLLECTOR_FOUNDER_APPROVAL:'true',COLLECTOR_POLICIES_APPROVED:'true',
 COLLECTOR_SHIPPING_APPROVED:'true',COLLECTOR_TAX_APPROVED:'true',COLLECTOR_INVENTORY_APPROVED:'true',
 CARDNEST_COMMERCIAL_POLICY_APPROVAL:'true'};
 assert.equal(collectorCheckoutReadiness(live).enabled,true);
 for(const key of ['COLLECTOR_LIVE_CHECKOUT_ENABLED','COLLECTOR_FOUNDER_APPROVAL','COLLECTOR_POLICIES_APPROVED','COLLECTOR_SHIPPING_APPROVED','COLLECTOR_TAX_APPROVED','COLLECTOR_INVENTORY_APPROVED','CARDNEST_COMMERCIAL_POLICY_APPROVAL']){
  assert.equal(collectorCheckoutReadiness({...live,[key]:'false'}).enabled,false,key+' required');
 }
 assert.equal(collectorCheckoutReadiness({...live,STRIPE_SECRET_KEY:'sk_test_bad'}).enabled,false);
});
test('invalid or insecure redirect destinations cannot activate collector checkout',()=>{
 assert.equal(collectorBaseUrl({...testConfig,APP_URL:'http://nestrune.app'}),'');
 assert.equal(collectorCheckoutReadiness({...testConfig,APP_URL:'http://nestrune.app',COLLECTOR_TEST_CHECKOUT_ENABLED:'true'}).enabled,false);
});
