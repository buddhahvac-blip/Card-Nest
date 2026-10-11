import {test} from 'node:test';
import assert from 'node:assert/strict';
import {rejectUnverifiedDungeonClear} from '../lib/dungeon-settlement-gate';
import {RequestError} from '../lib/http';

test('unverified client victory always fails closed',()=>{
 for(const _scenario of ['ordinary clear','delayed fabricated clear','replayed attempt','boss floor']){
  assert.throws(()=>rejectUnverifiedDungeonClear(),error=>
   error instanceof RequestError && (error as RequestError).status===503
  );
 }
});
