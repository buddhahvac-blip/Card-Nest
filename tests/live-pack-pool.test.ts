import {test} from 'node:test';
import assert from 'node:assert/strict';
import {previewPackDrops,previewCollectibleIds} from '../lib/catalog';

test('database live pool includes newly approved cards',()=>{
 const ids=['sproutling-001','approved-live-055','approved-live-120'];
 assert.deepEqual(previewPackDrops('nest',ids).map(drop=>drop.card),ids);
});
test('database pool does not implicitly add all founding beta cards',()=>{
 const drops=previewPackDrops('guardian',['approved-live-055']);
 assert.deepEqual(drops,[{card:'approved-live-055',weight:1}]);
});
test('empty live roster stays empty rather than unlocking beta IDs',()=>{
 assert.deepEqual(previewPackDrops('hatchling',[]),[]);
});
test('duplicate live card ids cannot increase draw weight',()=>{
 assert.deepEqual(previewPackDrops('royal',['approved-live-055','approved-live-055']),[{card:'approved-live-055',weight:1}]);
});
test('legacy preview catalog remains available only when no database list is supplied',()=>{
 assert.equal(previewPackDrops('hatchling').length,previewCollectibleIds.length);
});
