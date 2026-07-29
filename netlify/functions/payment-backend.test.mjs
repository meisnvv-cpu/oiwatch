import test from 'node:test';
import assert from 'node:assert/strict';
import { handler as createPayment } from './create-crypto-payment.mjs';
import { handler as verifyPayment } from './verify-crypto-payment.mjs';
import { handler as paymentCallback } from './crypto-payment-callback.mjs';

const ORIGINAL_FETCH = globalThis.fetch;
const ORIGINAL_ENV = {
  PUBLIC_SITE_URL: process.env.PUBLIC_SITE_URL,
  PAYGATE_USDC_POLYGON_ADDRESS: process.env.PAYGATE_USDC_POLYGON_ADDRESS,
  SUPABASE_SERVICE_ROLE_KEY: process.env.SUPABASE_SERVICE_ROLE_KEY,
};

test.afterEach(() => {
  globalThis.fetch = ORIGINAL_FETCH;
  Object.entries(ORIGINAL_ENV).forEach(([key, value]) => {
    if (value === undefined) delete process.env[key];
    else process.env[key] = value;
  });
});

test('hosted checkout uses server catalogue prices and does not expose the provider token', async () => {
  process.env.PUBLIC_SITE_URL = 'https://oiwatch.cc';
  process.env.PAYGATE_USDC_POLYGON_ADDRESS = '0x0000000000000000000000000000000000000001';
  process.env.SUPABASE_SERVICE_ROLE_KEY = 'test-only-placeholder';
  const calls = [];
  globalThis.fetch = async (url, options = {}) => {
    const value = String(url);
    calls.push({ url:value, method:options.method || 'GET', body:options.body });
    if (value.includes('/store_products?')) return response([{ id:'watch-1', name_en:'Watch', price:125 }]);
    if (value.includes('/payment_orders?') || value.includes('/orders?')) return response([]);
    if (value.includes('/control/wallet.php')) return response({ address_in:'checkout%5Faddress', ipn_token:'private%5Ftoken', polygon_address_in:'0x0000000000000000000000000000000000000002' });
    if (value.includes('supabase.co')) return response([{}], 201);
    throw new Error(`Unexpected request: ${value}`);
  };

  const result = await createPayment({
    httpMethod:'POST',
    body:JSON.stringify({
      orderId:'OI-TEST12345', asset:'USDC', amountUsd:0.01, orderTotal:0.01,
      paymentMethod:'crypto', paymentChannel:'gateway',
      customer:{ name:'A', email:'a@example.com', phone:'1', address:'x', country:'US', postalCode:'1' },
      items:[{ id:'watch-1', quantity:2, unitPrice:0.01 }],
    }),
  });
  const body = JSON.parse(result.body);
  const walletCall = calls.find(call => call.url.includes('/control/wallet.php'));
  const callbackUrl = new URL(walletCall.url).searchParams.get('callback');
  assert.equal(result.statusCode, 200);
  assert.equal(new URL(body.paymentUrl).searchParams.get('amount'), '250.00');
  assert.equal(JSON.stringify(body).includes('private_token'), false);
  assert.equal(new URL(body.paymentUrl).searchParams.get('address'), 'checkout_address');
  assert.match(new URL(callbackUrl).searchParams.get('nonce'), /^[a-f0-9]{48}$/);
  assert.equal(calls.filter(call => call.url.includes('supabase.co') && call.method === 'POST').length, 2);
});

test('verification uses the saved hosted token rather than browser network data', async () => {
  process.env.SUPABASE_SERVICE_ROLE_KEY = 'test-only-placeholder';
  const calls = [];
  globalThis.fetch = async (url, options = {}) => {
    const value = String(url);
    calls.push(value);
    if (value.includes('/payment_orders?') && (options.method || 'GET') === 'GET') return response([{ id:'OI-TEST12345', status:'awaiting_payment', customer:{ __oiwatch_payment_v2:true, channel:'hosted', callbackNonce:'a'.repeat(48) }, provider_invoice_id:'private-token' }]);
    if (value.includes('/control/payment-status.php')) return response({ status:'paid', coin:'polygon_usdc', txid_out:'0xabc' });
    if (value.includes('supabase.co')) return response([{}]);
    throw new Error(`Unexpected request: ${value}`);
  };
  const result = await verifyPayment({ httpMethod:'POST', body:JSON.stringify({ orderId:'OI-TEST12345', asset:'BTC', txid:'0xabc' }) });
  assert.equal(JSON.parse(result.body).status, 'completed');
  assert.equal(calls.some(url => url.includes('/control/payment-status.php?ipn_token=private-token')), true);
  assert.equal(calls.some(url => url.includes('ticker=')), false);
});

test('hosted checkout is not returned when the private payment record cannot be saved', async () => {
  process.env.PUBLIC_SITE_URL = 'https://oiwatch.cc';
  process.env.PAYGATE_USDC_POLYGON_ADDRESS = '0x0000000000000000000000000000000000000001';
  process.env.SUPABASE_SERVICE_ROLE_KEY = 'test-only-placeholder';
  let rollbackCalled = false;
  globalThis.fetch = async (url, options = {}) => {
    const value = String(url);
    if (value.includes('/store_products?')) return response([{ id:'watch-1', name_en:'Watch', price:125 }]);
    if ((value.includes('/payment_orders?') || value.includes('/orders?')) && (options.method || 'GET') === 'GET') return response([]);
    if (value.includes('/control/wallet.php')) return response({ address_in:'checkout-address', ipn_token:'private-token', polygon_address_in:'0x0000000000000000000000000000000000000002' });
    if (value.endsWith('/orders') && options.method === 'POST') return response([{}], 201);
    if (value.endsWith('/payment_orders') && options.method === 'POST') return response({}, 500);
    if (value.includes('/orders?') && options.method === 'DELETE') { rollbackCalled = true; return response(null, 204); }
    throw new Error(`Unexpected request: ${value}`);
  };
  const result = await createPayment({
    httpMethod:'POST',
    body:JSON.stringify({
      orderId:'OI-TEST12345', asset:'USDC', paymentMethod:'crypto', paymentChannel:'gateway',
      customer:{ name:'A', email:'a@example.com', phone:'1', address:'x', country:'US', postalCode:'1' },
      items:[{ id:'watch-1', quantity:1 }],
    }),
  });
  assert.equal(result.statusCode, 502);
  assert.equal(JSON.parse(result.body).paymentUrl, undefined);
  assert.equal(rollbackCalled, true);
});

test('callback values cannot complete an order without provider status confirmation', async () => {
  process.env.SUPABASE_SERVICE_ROLE_KEY = 'test-only-placeholder';
  let patches = 0;
  globalThis.fetch = async (url, options = {}) => {
    const value = String(url);
    if (value.includes('/payment_orders?') && (options.method || 'GET') === 'GET') return response([{ id:'OI-TEST12345', status:'awaiting_payment', customer:{ __oiwatch_payment_v2:true, channel:'hosted', callbackNonce:'a'.repeat(48) }, provider_invoice_id:'private-token' }]);
    if (value.includes('/control/payment-status.php')) return response({ status:'pending' });
    if ((options.method || 'GET') === 'PATCH') patches += 1;
    return response([{}]);
  };
  const result = await paymentCallback({ httpMethod:'GET', queryStringParameters:{ order_id:'OI-TEST12345', nonce:'a'.repeat(48), value_coin:'999999', txid_in:'forged', coin:'polygon_usdc' } });
  assert.equal(result.statusCode, 200);
  assert.equal(result.body, 'pending');
  assert.equal(patches, 0);
});

test('callback rejects an order identifier without its per-order nonce', async () => {
  process.env.SUPABASE_SERVICE_ROLE_KEY = 'test-only-placeholder';
  let requests = 0;
  globalThis.fetch = async () => { requests += 1; return response([]); };
  const result = await paymentCallback({ httpMethod:'GET', queryStringParameters:{ order_id:'OI-TEST12345', value_coin:'999999', coin:'polygon_usdc' } });
  assert.equal(result.statusCode, 400);
  assert.equal(requests, 0);
});

test('hosted verifier requires Polygon USDC and the outgoing transaction hash', async () => {
  process.env.SUPABASE_SERVICE_ROLE_KEY = 'test-only-placeholder';
  let patches = 0;
  globalThis.fetch = async (url, options = {}) => {
    const value = String(url);
    if (value.includes('/payment_orders?') && (options.method || 'GET') === 'GET') return response([{ id:'OI-TEST12345', status:'awaiting_payment', customer:{ __oiwatch_payment_v2:true, channel:'hosted' }, provider_invoice_id:'private-token' }]);
    if (value.includes('/control/payment-status.php')) return response({ status:'paid', coin:'btc', txid_out:'0xwrong-network' });
    if ((options.method || 'GET') === 'PATCH') patches += 1;
    return response([{}]);
  };
  const result = await verifyPayment({ httpMethod:'POST', body:JSON.stringify({ orderId:'OI-TEST12345' }) });
  assert.equal(JSON.parse(result.body).status, 'awaiting_confirmation');
  assert.equal(patches, 0);
});

test('direct wallet records cannot be completed through the hosted verifier', async () => {
  process.env.SUPABASE_SERVICE_ROLE_KEY = 'test-only-placeholder';
  let providerCalls = 0;
  globalThis.fetch = async (url, options = {}) => {
    const value = String(url);
    if (value.includes('/payment_orders?') && (options.method || 'GET') === 'GET') return response([{ id:'OI-TEST12345', status:'awaiting_payment', customer:{ __oiwatch_payment_v2:true, channel:'direct' }, provider_invoice_id:null }]);
    providerCalls += 1;
    return response({ status:'paid', coin:'polygon_usdc', txid_out:'0xabc' });
  };
  const result = await verifyPayment({ httpMethod:'POST', body:JSON.stringify({ orderId:'OI-TEST12345', txid:'0xabc' }) });
  assert.equal(result.statusCode, 409);
  assert.equal(providerCalls, 0);
});

function response(body, status = 200) {
  return { ok:status >= 200 && status < 300, status, json:async () => body };
}
