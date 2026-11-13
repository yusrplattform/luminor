import test from 'node:test';
import assert from 'node:assert/strict';
import {quoteCart} from './lib/quote.mjs';
test('calculates product and shipping amounts in baisa from the catalogue',()=>{
  const result=quoteCart({'2':1,'10':2},'OM');
  assert.equal(result.subtotalBaisa,28000);
  assert.equal(result.shippingBaisa,13500);
  assert.equal(result.totalBaisa,41500);
});
test('applies the seven rial minimum to half-kilo orders and preserves higher rates',()=>{
  assert.equal(quoteCart({'3':1},'OM').shippingBaisa,7000);
  assert.equal(quoteCart({'10':1},'OM').shippingBaisa,7000);
  assert.equal(quoteCart({'3':3},'OM').shippingBaisa,10500);
});
test('rejects unknown products, unsupported countries and invalid quantities',()=>{
  for(const input of [[{'999':1},'OM'],[{'2':0},'OM'],[{'2':1.5},'OM'],[{'2':1},'XX'],[{},'OM']]) assert.throws(()=>quoteCart(...input));
});
