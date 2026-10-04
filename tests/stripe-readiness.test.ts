import {test} from 'node:test';
import assert from 'node:assert/strict';
import {paymentMode,paymentReadiness,stripeEventMatchesConfiguredMode,stripeKeyMode} from '../lib/stripe';

const env=(v:Record<string,string>):NodeJS.ProcessEnv=>({...v});

test('payment mode defaults safely to test',()=>{
  assert.equal(paymentMode(env({})),'test');
  assert.equal(stripeKeyMode(undefined),'missing');
  assert.equal(paymentReadiness(env({})).checkoutReady,false);
});

test('test checkout needs every explicit gate',()=>{
  const base=env({
    CARDNEST_PAYMENT_MODE:'test',
    STRIPE_SECRET_KEY:'sk_test_fixture',
    STRIPE_WEBHOOK_SECRET:'whsec_fixture',
    APP_URL:'https://card-nest.example'
  });
  assert.equal(paymentReadiness(base).checkoutReady,false);
  assert.equal(paymentReadiness({...base,PAYMENTS_ENABLED:'true'}).checkoutReady,false);
  assert.equal(paymentReadiness({...base,PAYMENTS_ENABLED:'true',CARDNEST_FOUNDER_PAYMENT_APPROVAL:'true'}).checkoutReady,true);
});

test('live mode rejects test credentials and insecure return URLs',()=>{
  const base=env({
    CARDNEST_PAYMENT_MODE:'live',
    STRIPE_SECRET_KEY:'sk_test_fixture',
    STRIPE_WEBHOOK_SECRET:'whsec_fixture',
    APP_URL:'https://card-nest.example',
    PAYMENTS_ENABLED:'true',
    CARDNEST_FOUNDER_PAYMENT_APPROVAL:'true'
  });
  assert.equal(paymentReadiness(base).checkoutReady,false);
  assert.equal(stripeEventMatchesConfiguredMode(true,base),false);

  const live={...base,STRIPE_SECRET_KEY:'sk_live_fixture',APP_URL:'http://card-nest.example'};
  assert.equal(paymentReadiness(live).checkoutReady,false);
});

test('live mode accepts only live events when all gates are ready',()=>{
  const live=env({
    CARDNEST_PAYMENT_MODE:'live',
    STRIPE_SECRET_KEY:'sk_live_fixture',
    STRIPE_WEBHOOK_SECRET:'whsec_fixture',
    APP_URL:'https://card-nest.example',
    PAYMENTS_ENABLED:'true',
    CARDNEST_FOUNDER_PAYMENT_APPROVAL:'true'
  });
  assert.equal(paymentReadiness(live).checkoutReady,true);
  assert.equal(stripeEventMatchesConfiguredMode(true,live),true);
  assert.equal(stripeEventMatchesConfiguredMode(false,live),false);
});
