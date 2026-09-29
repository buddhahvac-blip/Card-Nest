import test from 'node:test';
import assert from 'node:assert/strict';
import {catalogCode,catalogLabel,copySerial,parseCopySerial} from '../lib/authenticity';

test('Season One catalog numbers are stable',()=>{
  assert.equal(catalogCode(1),'CN1-001');
  assert.equal(catalogCode(52),'CN1-052');
  assert.equal(catalogCode(369),'CN1-369');
  assert.equal(catalogLabel(52),'CN1-052 / 369');
});

test('copy serials round-trip to the database UUID',()=>{
  const copyId='550e8400-e29b-41d4-a716-446655440000';
  const serial=copySerial(copyId,52);
  assert.match(serial,/^CN1-052-[0-9A-HJKMNP-TV-Z]{26}$/);
  assert.deepEqual(parseCopySerial(serial),{cardNumber:52,copyId});
});

test('copy serial parser rejects wrong or impossible values',()=>{
  assert.equal(parseCopySerial('CN1-000-00000000000000000000000000'),null);
  assert.equal(parseCopySerial('not-a-cardnest-serial'),null);
});
