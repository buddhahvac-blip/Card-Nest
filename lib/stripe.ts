import Stripe from 'stripe';
import {RequestError} from './http';

export type PaymentMode='test'|'live';
export type StripeKeyMode=PaymentMode|'unknown'|'missing';

export function paymentMode(env:NodeJS.ProcessEnv=process.env):PaymentMode{
  return env.CARDNEST_PAYMENT_MODE==='live'?'live':'test';
}

export function stripeKeyMode(key:string|undefined):StripeKeyMode{
  if(!key)return 'missing';
  if(key.startsWith('sk_test_'))return 'test';
  if(key.startsWith('sk_live_'))return 'live';
  return 'unknown';
}

export function paymentReadiness(env:NodeJS.ProcessEnv=process.env){
  const mode=paymentMode(env);
  const keyMode=stripeKeyMode(env.STRIPE_SECRET_KEY);
  const appUrl=env.APP_URL||'';
  const appUrlConfigured=!!appUrl;
  const appUrlSecure=appUrl.startsWith('https://');
  const webhookSecretConfigured=!!env.STRIPE_WEBHOOK_SECRET?.startsWith('whsec_');
  const paymentsEnabledFlag=env.PAYMENTS_ENABLED==='true';
  const founderApproved=env.CARDNEST_FOUNDER_PAYMENT_APPROVAL==='true';
  const commercialPolicyApproved=env.CARDNEST_COMMERCIAL_POLICY_APPROVAL==='true';
  const keyMatchesMode=keyMode===mode;
  const checkoutReady=
    paymentsEnabledFlag&&
    founderApproved&&
    (mode==='test'||commercialPolicyApproved)&&
    keyMatchesMode&&
    webhookSecretConfigured&&
    appUrlConfigured&&
    (mode==='test'||appUrlSecure);

  return {
    mode,
    keyMode,
    stripeConnected:keyMode!=='missing'&&keyMode!=='unknown',
    keyMatchesMode,
    webhookSecretConfigured,
    appUrlConfigured,
    appUrlSecure,
    paymentsEnabledFlag,
    founderApproved,
    commercialPolicyApproved,
    checkoutReady
  };
}

export function stripe(){
  const key=process.env.STRIPE_SECRET_KEY;
  if(!key)throw new RequestError('Payments are not connected',503);
  return new Stripe(key,{maxNetworkRetries:2,timeout:20000});
}

export function requirePayments(){
  const status=paymentReadiness();
  if(!status.paymentsEnabledFlag)throw new RequestError('Sales are not enabled',503);
  if(!status.founderApproved)throw new RequestError('Founder payment approval is required',503);
  if(status.mode==='live'&&!status.commercialPolicyApproved)throw new RequestError('Commercial policy approval is required before live sales',503);
  if(!status.stripeConnected)throw new RequestError('Stripe is not connected',503);
  if(!status.keyMatchesMode)throw new RequestError('Stripe key does not match the configured payment mode',503);
  if(!status.webhookSecretConfigured||!status.appUrlConfigured)throw new RequestError('Payment setup incomplete',503);
  if(status.mode==='live'&&!status.appUrlSecure)throw new RequestError('Live checkout requires a secure HTTPS app URL',503);
  return status;
}

export function stripeEventMatchesConfiguredMode(livemode:boolean,env:NodeJS.ProcessEnv=process.env){
  const mode=paymentMode(env);
  const keyMode=stripeKeyMode(env.STRIPE_SECRET_KEY);
  return keyMode===mode&&livemode===(mode==='live');
}
