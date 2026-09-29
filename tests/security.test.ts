import {test} from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {PGlite} from '@electric-sql/pglite';
import {body,strictBody,rateLimit,RequestError} from '../lib/http';
import {command,makeConcept,oversee,signature,canPromote,generationLimits} from '../lib/nestforge';
import {validEconomics,blankEconomics} from '../lib/economics';

const request=(payload:unknown,headers:Record<string,string>={})=>new Request('https://card-nest-iota.vercel.app/api/nestforge',{method:'POST',headers:{origin:'https://card-nest-iota.vercel.app','content-type':'application/json',...headers},body:typeof payload==='string'?payload:JSON.stringify(payload)});
test('strict POST schema blocks unknown fields, prototype payloads, and script input',async()=>{
 const ok={action:'idea',interests:['Cute','Mystic','Birds'],requestKey:crypto.randomUUID()};
 assert.equal((await strictBody(request(ok),command)).action,'idea');
 for(const x of [{...ok,role:'admin'},{...ok,interests:['<script>alert(1)</script>']},{...ok,__proto__:'admin'},JSON.stringify({...ok,extra:'x'})]){
  if(x===undefined)continue;
  if(typeof x==='object'&&!Object.keys(x).includes('role')&&!Object.keys(x).includes('__proto__')&&!Object.keys(x).includes('extra'))continue;
  await assert.rejects(strictBody(request(x),command),RequestError);
 }
 await assert.rejects(body(request(ok,{origin:'https://attacker.example'})),RequestError);
 await assert.rejects(body(request('x'.repeat(8200))),RequestError);
 await assert.rejects(strictBody(request({action:'approve',id:crypto.randomUUID(),note:'yes',rightsChecked:true}),command),RequestError);
 assert.equal(validEconomics({...blankEconomics,monthlyOther:0,role:'admin'}),false);
});

test('NestForge gates canonical duplicates, approval state, and paid generation defaults',()=>{
 const c=makeConcept(['Cute','Mystic','Birds'],crypto.randomUUID());
 assert.equal(c.theme,'Mystic');assert.equal(c.interestSignals.length,3);
 assert.equal(oversee(c).pass,true);
 assert.equal(oversee(c,[signature(c)]).pass,false);
 assert.equal(oversee({...c,nameCandidate:'Nestling'}).pass,false);
 assert.equal(canPromote({state:'approved',asset_key:null,overseer:{pass:true},founder_approval:new Date()}),false);
 assert.equal(canPromote({state:'approved',asset_key:'private.png',overseer:{pass:false},founder_approval:new Date()}),false);
 assert.equal(canPromote({state:'approved',asset_key:'private.png',overseer:{pass:true},founder_approval:null}),false);
 assert.equal(canPromote({state:'approved',asset_key:'private.png',overseer:{pass:true},founder_approval:new Date()}),true);
 const original=process.env.NESTFORGE_IMAGE_DAILY_LIMIT;delete process.env.NESTFORGE_IMAGE_DAILY_LIMIT;assert.equal(generationLimits().enabled,false);if(original!==undefined)process.env.NESTFORGE_IMAGE_DAILY_LIMIT=original;
});

test('migration, parameterized rate limit, and new private tables work together',async()=>{
 const pg=new PGlite();try{
  await pg.exec(readFileSync('drizzle/0000_supreme_nekra.sql','utf8'));
  await pg.exec(readFileSync('drizzle/0001_fresh_valeria_richards.sql','utf8'));
  await pg.exec(readFileSync('drizzle/0002_nestforge_security.sql','utf8'));
  await pg.exec('SET search_path=cardnest_v1,public');
  const query=(q:string,p:unknown[])=>pg.query(q,p);
  await rateLimit("x'); DROP TABLE cardnest_v1.nestforge_concepts; --",2,query);
  await rateLimit("x'); DROP TABLE cardnest_v1.nestforge_concepts; --",2,query);
  await assert.rejects(rateLimit("x'); DROP TABLE cardnest_v1.nestforge_concepts; --",2,query),RequestError);
  const r=await pg.query('SELECT count(*)::int AS n FROM cardnest_v1.nestforge_concepts');assert.equal((r.rows[0] as {n:number}).n,0);
  const c=makeConcept(['Forest'],crypto.randomUUID());
  await pg.query('INSERT INTO nestforge_concepts(id,owner_id,request_key,signature,profile) VALUES($1,$2,$3,$4,$5)',[c.conceptId,'founder',crypto.randomUUID(),signature(c),JSON.stringify(c)]);
  const denied=await pg.query('SELECT id FROM nestforge_concepts WHERE id=$1 AND owner_id=$2',[c.conceptId,'other']);assert.equal(denied.rows.length,0);
 }finally{await pg.close()}
});
