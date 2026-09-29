import Stripe from 'stripe';
import {RequestError} from './http';
export function stripe(){const key=process.env.STRIPE_SECRET_KEY;if(!key)throw new RequestError('Payments are not connected',503);return new Stripe(key,{maxNetworkRetries:2,timeout:20000})}
export function requirePayments(){if(process.env.PAYMENTS_ENABLED!=='true')throw new RequestError('Sales are not enabled',503);if(process.env.CARDNEST_FOUNDER_PAYMENT_APPROVAL!=='true')throw new RequestError('Founder payment approval is required',503);if(!process.env.STRIPE_SECRET_KEY?.startsWith('sk_test_'))throw new RequestError('Only Stripe test mode is permitted during public beta',503);if(!process.env.STRIPE_WEBHOOK_SECRET||!process.env.APP_URL)throw new RequestError('Payment setup incomplete',503)}
