import {createHash} from 'node:crypto';
import {z} from 'zod';

export const collectorMetricSchema=z.strictObject({
  event:z.enum(['visit','contact','inquiry']),
  session:z.string().uuid(),
  product:z.string().max(80).regex(/^[a-z0-9 -]*$/i).optional()
}).superRefine((item,ctx)=>{
  if(item.event!=='visit'&&!item.product)ctx.addIssue({code:z.ZodIssueCode.custom,message:'Product is required for inquiries'});
});

export function collectorSessionHash(session:string){
  return createHash('sha256').update(session).digest('hex').slice(0,32);
}
export const collectorMetricKind={visit:'collector-shop-visit',contact:'collector-shop-contact',inquiry:'collector-shop-inquiry'} as const;
