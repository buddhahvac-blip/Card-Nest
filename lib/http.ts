import {database} from './postgres';
import {z} from 'zod';
export class RequestError extends Error{constructor(message:string,public status=400){super(message)}}
export const json=(body:unknown,status=200)=>Response.json(body,{status,headers:{'Cache-Control':'no-store'}});
export function sameOrigin(req:Request){if(req.headers.get('origin')!==new URL(req.url).origin)throw new RequestError('Request origin rejected',403)}
export async function limitedText(req:Request,maxBytes=8192){
 const length=Number(req.headers.get('content-length'));
 if(Number.isFinite(length)&&length>maxBytes)throw new RequestError('Request too large',413);
 const reader=req.body?.getReader();if(!reader)return '';
 const parts:Uint8Array[]=[];let size=0;
 try{while(true){const {done,value}=await reader.read();if(done)break;size+=value.byteLength;if(size>maxBytes){await reader.cancel();throw new RequestError('Request too large',413)}parts.push(value)}}finally{reader.releaseLock()}
 return new TextDecoder('utf-8',{fatal:true}).decode(Buffer.concat(parts));
}
export async function body(req:Request,maxBytes=8192):Promise<unknown>{sameOrigin(req);if(!req.headers.get('content-type')?.toLowerCase().startsWith('application/json'))throw new RequestError('JSON required',415);let text:string;try{text=await limitedText(req,maxBytes)}catch(e){if(e instanceof RequestError)throw e;throw new RequestError('Invalid text encoding')};try{return JSON.parse(text)}catch{throw new RequestError('Invalid JSON')}}
export async function strictBody<T extends z.ZodType>(req:Request,schema:T,maxBytes=8192):Promise<z.output<T>>{const parsed=schema.safeParse(await body(req,maxBytes));if(!parsed.success)throw new RequestError('Invalid or unexpected request fields');return parsed.data}
export function failure(e:unknown){return e instanceof RequestError?json({error:e.message},e.status):json({error:'Service temporarily unavailable. Please retry.'},503)}
export async function rateLimit(key:string,maximum=30,run:(sql:string,params:unknown[])=>Promise<{rowCount?:number|null}>=((sql,params)=>database().query(sql,params))){const r=await run("INSERT INTO rate_limits(key,count,expires) VALUES($1,1,now()+interval '1 minute') ON CONFLICT(key) DO UPDATE SET count=CASE WHEN rate_limits.expires<=now() THEN 1 ELSE rate_limits.count+1 END,expires=CASE WHEN rate_limits.expires<=now() THEN now()+interval '1 minute' ELSE rate_limits.expires END WHERE rate_limits.expires<=now() OR rate_limits.count<$2 RETURNING count",[key,maximum]);if(!r.rowCount)throw new RequestError('Please wait a minute before trying again',429)}
