import {test} from 'node:test';
import assert from 'node:assert/strict';
import {canAwardVerifiedDungeonClear,type DungeonAttemptProof} from '../lib/dungeon-reward-policy';

const now=new Date('2026-10-10T03:00:00Z');
const won: DungeonAttemptProof={
 userId:'player-1',floor:1,outcome:'won',
 completedAt:new Date('2026-10-10T02:55:00Z'),
 verifiedAt:new Date('2026-10-10T02:54:59Z'),
 expiresAt:new Date('2026-10-10T03:05:00Z')
};
const request={userId:'player-1',floor:1};
test('server-verified, matching and unexpired win is eligible',()=>{
 assert.equal(canAwardVerifiedDungeonClear(won,request,now),true);
});
test('unverified victory cannot award currency',()=>{
 assert.equal(canAwardVerifiedDungeonClear({...won,verifiedAt:null},request,now),false);
});
test('merely started or lost battles cannot award',()=>{
 assert.equal(canAwardVerifiedDungeonClear({...won,outcome:'active',completedAt:null,verifiedAt:null},request,now),false);
 assert.equal(canAwardVerifiedDungeonClear({...won,outcome:'lost'},request,now),false);
});
test('foreign player and floor mismatch cannot award',()=>{
 assert.equal(canAwardVerifiedDungeonClear(won,{...request,userId:'attacker'},now),false);
 assert.equal(canAwardVerifiedDungeonClear(won,{...request,floor:2},now),false);
});
test('expired or inconsistent timestamps cannot award',()=>{
 assert.equal(canAwardVerifiedDungeonClear({...won,expiresAt:now},request,now),false);
 assert.equal(canAwardVerifiedDungeonClear({...won,verifiedAt:new Date('2026-10-10T03:01:00Z')},request,now),false);
 assert.equal(canAwardVerifiedDungeonClear({...won,completedAt:null},request,now),false);
 assert.equal(canAwardVerifiedDungeonClear(null,request,now),false);
});

test('proof completed after expiry is rejected even when request is earlier',()=>{
 const beforeExpiry=new Date('2026-10-10T02:58:00Z');
 assert.equal(canAwardVerifiedDungeonClear({...won,expiresAt:new Date('2026-10-10T02:56:00Z'),completedAt:new Date('2026-10-10T02:57:00Z')},request,beforeExpiry),false);
});
