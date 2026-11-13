import {test} from 'node:test';
import assert from 'node:assert/strict';
import {claimPaidPurchase} from './lib/meta-purchase.mjs';

function fakeDb(status) {
  let claimed=false;
  return {async query(sql,args){
    assert.match(sql,/payment_status='paid'/);
    assert.match(sql,/ON CONFLICT \(order_id\) DO NOTHING/);
    assert.equal(args.length,1);
    if(status!=='paid'||claimed)return {rows:[]};
    claimed=true;
    return {rows:[{items:[{id:'1',name:'do not transmit',quantity:1}],total_baisa:27000,currency:'OMR'}]};
  }};
}
const id='12345678-1234-1234-1234-123456789abc';
for(const status of ['pending','processing','failed','unconfirmed']) test(`does not claim ${status} orders`,async()=>{
  assert.equal(await claimPaidPurchase(fakeDb(status),id),null);
});
test('returns only purchase details for a confirmed payment, once',async()=>{
  const db=fakeDb('paid');
  const result=await claimPaidPurchase(db,id);
  assert.deepEqual(Object.keys(result).sort(),['content_ids','currency','eventID','value']);
  assert.deepEqual(result.content_ids,['1']);
  assert.equal(result.value,27);
  assert.equal(result.currency,'OMR');
  assert.match(result.eventID,/^[a-f0-9]{64}$/);
  assert.equal(await claimPaidPurchase(db,id),null);
});
