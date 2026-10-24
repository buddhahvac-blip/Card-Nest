import {test} from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {PGlite} from '@electric-sql/pglite';

test('physical inventory migration starts with zero units and disallows oversells',async()=>{
 const db=new PGlite();
 try{
  await db.exec('CREATE SCHEMA cardnest_v1;');
  const sql=readFileSync(new URL('../drizzle/0008_collector_physical_checkout.sql',import.meta.url),'utf8');
  for(const statement of sql.split('--> statement-breakpoint').map(x=>x.trim()).filter(Boolean))await db.exec(statement);
  const first=await db.query('SELECT id,on_hand,reserved,sellable FROM cardnest_v1.collector_inventory');
  assert.equal(first.rows.length,4);
  for(const row of first.rows as Array<{on_hand:number;reserved:number;sellable:boolean}>){assert.equal(row.on_hand,0);assert.equal(row.reserved,0);assert.equal(row.sellable,false)}
  await assert.rejects(db.query("UPDATE cardnest_v1.collector_inventory SET sellable=true WHERE id='etb-30th'"),/check constraint/i);
  await db.query("UPDATE cardnest_v1.collector_inventory SET on_hand=1,unit_price_cents=20000,photo_url='/collector/real/box.webp',verified_photos=true,sellable=true WHERE id='etb-30th'");
  const hold="UPDATE cardnest_v1.collector_inventory SET reserved=reserved+1 WHERE id='etb-30th' AND sellable=true AND verified_photos=true AND on_hand-reserved >= 1 RETURNING id";
  assert.equal((await db.query(hold)).rowCount,1);
  assert.equal((await db.query(hold)).rowCount,0);
  await assert.rejects(db.query("UPDATE cardnest_v1.collector_inventory SET on_hand=0 WHERE id='etb-30th'"),/check constraint/i);
  assert.equal((await db.query("UPDATE cardnest_v1.collector_inventory SET on_hand=on_hand-1,reserved=reserved-1 WHERE id='etb-30th' AND reserved>=1 RETURNING id")).rowCount,1);
 }finally{await db.close()}
});
