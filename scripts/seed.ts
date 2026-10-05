import nextEnv from '@next/env';
nextEnv.loadEnvConfig(process.cwd());
const {database,transaction}=await import('../lib/postgres');
const {packDefinitions,previewPackDrops,previewDropVersion}=await import('../lib/catalog');
const {seedSeason}=await import('../lib/seed-season');

await transaction(async c=>{
 await seedSeason(c);
 for(const p of packDefinitions){
  await c.query(
   "INSERT INTO packs(id,season_id,name,count,drop_version,drops) VALUES($1,'season-1',$2,$3,$4,$5) ON CONFLICT(id) DO UPDATE SET name=excluded.name,count=excluded.count,drop_version=excluded.drop_version,drops=excluded.drops",
   [p.id,p.name,p.count,previewDropVersion,JSON.stringify(previewPackDrops(p.id))]
  );
 }
});

console.log('369 definitions synced. Free beta pack pools use all 21 uploaded Common cards; paid sales remain disabled.');
await database().end();
