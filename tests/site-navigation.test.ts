import {test} from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';

test('shared header exposes Rune Dungeon and collectible shops throughout the site',()=>{
 const layout=readFileSync('app/layout.tsx','utf8'),nav=readFileSync('app/site-header.tsx','utf8');
 assert.match(layout,/<SiteHeader\s*\/>/);
 for(const route of ['/play','/rune-dungeon','/season-one','/pokemon-collectibles','/one-piece-collectibles','/#My%20Nest'])
  assert.ok(nav.includes("href:'"+route+"'"),'Missing link: '+route);
 assert.match(nav,/aria-label="Main site navigation"/);
});
test('home has direct Rune Dungeon CTA and pages do not render duplicate top menus',()=>{
 assert.match(readFileSync('app/home-experience.tsx','utf8'),/href="\/rune-dungeon"/);
 for(const file of ['app/ui.tsx','app/play/page.tsx','app/rune-dungeon/page.tsx','app/pokemon-collectibles/page.tsx','app/one-piece-collectibles/page.tsx'])
  assert.doesNotMatch(readFileSync(file,'utf8'),/<header(?:\s|>)/,file+' renders a duplicate header');
});
