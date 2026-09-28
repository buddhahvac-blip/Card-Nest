import {currentUser} from '@/lib/auth/server';
import {database} from '@/lib/postgres';
import {stripe,requirePayments} from '@/lib/stripe';
import {body,failure,json,RequestError,rateLimit} from '@/lib/http';
export async function POST(req:Request){try{const u=await currentUser();if(!u)throw new RequestError('Sign in required',401);await body(req);requirePayments();await rateLimit('billing:'+u.userId,5);const {rows:[customer]}=await database().query('SELECT stripe_id FROM customers WHERE user_id=$1',[u.userId]);if(!customer)throw new RequestError('No billing account yet',404);const session=await stripe().billingPortal.sessions.create({customer:customer.stripe_id,return_url:process.env.APP_URL+'/#My%20Nest'});return json({url:session.url})}catch(e){return failure(e)}}
