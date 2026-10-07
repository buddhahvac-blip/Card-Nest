import {test} from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {seasonManifest,hasSeasonArtwork} from '../lib/season-manifest';
import {seasonOneThemes,seasonOnePageSize,seasonOneCardsForTheme,seasonOneThemeCount} from '../lib/season-one-view';

test('Season One UX contract keeps six Themes and twelve-card browsing',()=>{
 assert.deepEqual([...seasonOneThemes],['Ember','Tide','Bloom','Volt','Mystic','Shadow']);
 assert.equal(seasonOnePageSize,12);
});

test('Season One Theme groups contain every canonical card exactly once and stay numerical',()=>{
 const grouped=seasonOneThemes.flatMap(theme=>{
  const cards=seasonOneCardsForTheme(theme);
  assert.equal(cards.length,seasonOneThemeCount(theme),theme);
  assert.deepEqual(cards.map(c=>c.cardNumber),[...cards].sort((a,b)=>a.cardNumber-b.cardNumber).map(c=>c.cardNumber),theme+' numeric order');
  assert.ok(cards.every(c=>c.theme===theme),theme+' membership');
  return cards;
 });
 assert.equal(grouped.length,369);
 assert.equal(new Set(grouped.map(c=>c.id)).size,369);
 assert.deepEqual([...grouped].sort((a,b)=>a.cardNumber-b.cardNumber).map(c=>c.id),seasonManifest.map(c=>c.id));
});

test('Season One public page stays curated instead of rendering the full 369-card wall',()=>{
 const page=readFileSync('app/season-one/page.tsx','utf8');
 const browser=readFileSync('app/season-theme-browser.tsx','utf8');
 assert.ok(page.includes('<LegendaryFlight/>'));
 assert.ok(page.includes('<SeasonArtGallery/>'));
 assert.ok(page.includes('<SeasonThemeBrowser/>'));
 assert.ok(!page.includes('Season One visual collector index'));
 assert.ok(!page.includes('cards.map(card=>'));
 assert.ok(browser.includes('seasonOnePageSize'));
 assert.ok(browser.includes('seasonOneCardsForTheme(theme)'));
});

test('Season One artwork discovery remains data driven',()=>{
 const illustrated=seasonManifest.filter(hasSeasonArtwork);
 assert.ok(illustrated.length>0);
 for(const card of illustrated)assert.ok(seasonManifest.some(c=>c.id===card.id));
});
