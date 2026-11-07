import test from 'node:test';
import assert from 'node:assert/strict';
import {isVerifiedPayment} from '../lib/payments/settlement-verification.ts';
const expected={reference:'A-1',amountMinor:100,currency:'SAR',merchantId:'M1'};
const verified={...expected,transactionId:'T1',status:'SUCCESS',authenticated:true};
test('verified matching payment',()=>assert.equal(isVerifiedPayment(expected,verified),true));
test('unverified payment',()=>assert.equal(isVerifiedPayment(expected,{...verified,authenticated:false}),false));
test('amount mismatch',()=>assert.equal(isVerifiedPayment(expected,{...verified,amountMinor:99}),false));
test('currency mismatch',()=>assert.equal(isVerifiedPayment(expected,{...verified,currency:'USD'}),false));
test('reference mismatch',()=>assert.equal(isVerifiedPayment(expected,{...verified,reference:'A-2'}),false));
test('merchant mismatch',()=>assert.equal(isVerifiedPayment(expected,{...verified,merchantId:'M2'}),false));
test('pending or missing transaction is not a settlement',()=>{
  assert.equal(isVerifiedPayment(expected,{...verified,status:'PENDING'}),false);
  assert.equal(isVerifiedPayment(expected,{...verified,transactionId:''}),false);
});

