import {test} from 'node:test';
import assert from 'node:assert/strict';
import {uploadedSeasonCardState,validSeasonImage} from '../lib/season-upload';
import {packCardAvailable} from '../lib/release';

test('successful Season One upload becomes preview, collectible and pack eligible but not paid eligible',()=>{
 const state=uploadedSeasonCardState('/api/season-art/reserved-031?v=1');
 assert.equal(state.releaseStatus,'preview');
 assert.equal(state.isCollectible,true);
 assert.equal(state.isPackEligible,true);
 const db={status:state.status,release_status:state.releaseStatus,is_collectible:state.isCollectible,is_pack_eligible:state.isPackEligible,art:state.art,art_status:state.artStatus};
 assert.equal(packCardAvailable(db,false),true);
 assert.equal(packCardAvailable(db,true),false);
});

test('upload validation accepts real image signatures and rejects disguised files',()=>{
 const png=new Uint8Array(600);png.set([0x89,0x50,0x4e,0x47,0x0d,0x0a,0x1a,0x0a]);
 assert.equal(validSeasonImage('image/png',png),true);
 const fake=new Uint8Array(600);fake.set([1,2,3,4]);
 assert.equal(validSeasonImage('image/png',fake),false);
});
