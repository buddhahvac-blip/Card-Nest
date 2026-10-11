import {test} from 'node:test';
import assert from 'node:assert/strict';
import {approvedPreviewPackDrops,previewCollectibleIds} from '../lib/catalog';

test('preview packs exclude unapproved founding cards and include approved uploaded cards',()=>{
 const founding=previewCollectibleIds[0];
 const drops=approvedPreviewPackDrops('hatchling',[founding,'reserved-030']);
 assert.deepEqual(drops.map(d=>d.card),[founding,'reserved-030']);
 assert.deepEqual(approvedPreviewPackDrops('nest',[]),[]);
 assert.deepEqual(approvedPreviewPackDrops('guardian',['reserved-030']).map(d=>d.card),['reserved-030']);
});
