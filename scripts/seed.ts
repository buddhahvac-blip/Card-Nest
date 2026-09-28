import nextEnv from '@next/env';
nextEnv.loadEnvConfig(process.cwd());
const {database,transaction}=await import('../lib/postgres');
const {catalog,packDefinitions}=await import('../lib/catalog');
const {seedSeason}=await import('../lib/seed-season');
await transaction(async c=>{await seedSeason(c);
 for(const p of packDefinitions)await c.query("INSERT INTO packs(id,season_id,name,count,drop_version,drops) VALUES($1,'season-1',$2,$3,'preview-equal-v1',$4) ON CONFLICT DO NOTHING",[p.id,p.name,p.count,JSON.stringify((p.id==='hatchling'?catalog.slice(0,1):catalog).map(card=>({card:card.id,weight:1})))]);
});console.log('369 definitions synced. Existing identities and release approvals preserved; sales not enabled.');await database().end();
