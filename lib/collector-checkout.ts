import {paymentMode,stripeKeyMode} from './stripe';

export const collectorIds=['etb-30th','etb-prismatic','etb-rivals','etb-surging'] as const;
export type CollectorId=(typeof collectorIds)[number];

export function collectorBaseUrl(env:NodeJS.ProcessEnv=process.env){
 const raw=env.APP_URL||(env.VERCEL_URL?'https://'+env.VERCEL_URL:'');
 try{const url=new URL(raw);return url.protocol==='https:'?url.origin:''}catch{return ''}
}

export function collectorCheckoutReadiness(env:NodeJS.ProcessEnv=process.env){
 const mode=paymentMode(env);
 const keyMatches=stripeKeyMode(env.STRIPE_SECRET_KEY)===mode;
 const validWebhook=Boolean(env.COLLECTOR_STRIPE_WEBHOOK_SECRET?.startsWith('whsec_'));
 const validRate=Boolean(env.COLLECTOR_US_SHIPPING_RATE_ID?.startsWith('shr_'));
 const urlReady=Boolean(collectorBaseUrl(env));
 const common=keyMatches&&validWebhook&&validRate&&urlReady;
 const liveApproved=[
  'COLLECTOR_LIVE_CHECKOUT_ENABLED','COLLECTOR_FOUNDER_APPROVAL',
  'COLLECTOR_POLICIES_APPROVED','COLLECTOR_SHIPPING_APPROVED',
  'COLLECTOR_TAX_APPROVED','COLLECTOR_INVENTORY_APPROVED',
  'CARDNEST_COMMERCIAL_POLICY_APPROVAL'
 ].every(key=>env[key]==='true');
 const enabled=common&&(mode==='test'?env.COLLECTOR_TEST_CHECKOUT_ENABLED==='true':liveApproved);
 return {enabled,mode,shippingConfigured:validRate,webhookConfigured:validWebhook};
}

export function customerSafeOrderStatus(status:string){
 return ['paid','review_required','expired'].includes(status)?status:'pending';
}
