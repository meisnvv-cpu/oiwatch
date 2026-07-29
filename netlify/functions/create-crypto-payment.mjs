const ASSETS = {
  BTC: { ticker: 'btc', addressEnv: 'PAYGATE_BTC_ADDRESS' },
  ETH: { ticker: 'eth', addressEnv: 'PAYGATE_ETH_ADDRESS' },
  USDT: { ticker: 'trc20/usdt', addressEnv: 'PAYGATE_USDT_TRC20_ADDRESS' },
  USDC: { ticker: 'polygon/usdc', addressEnv: 'PAYGATE_USDC_POLYGON_ADDRESS' },
  SOL: { ticker: 'sol', addressEnv: 'PAYGATE_SOL_ADDRESS' },
};
const SUPABASE_URL = 'https://mnbmdhkugxifzsaxdslm.supabase.co';
const PAYMENT_ORDER_MARKER = '__oiwatch_payment_v2';

function reply(statusCode, body) {
  return { statusCode, headers: { 'Content-Type': 'application/json; charset=utf-8', 'Cache-Control': 'no-store' }, body: JSON.stringify(body) };
}

function directWalletInvoice(orderId, asset, address) {
  const qr = new URL('https://api.qrserver.com/v1/create-qr-code/');
  qr.searchParams.set('size', '360x360');
  qr.searchParams.set('format', 'png');
  qr.searchParams.set('data', address);
  return reply(200, { orderId, asset, address, amountCoin:null, qrCode:qr.toString(), status:'awaiting_payment' });
}

function validPolygonAddress(value) {
  return /^0x[a-fA-F0-9]{40}$/.test(String(value || ''));
}

function decodeProviderValue(value) {
  const raw = String(value || '').trim();
  // PayGate may return percent-encoded fields; decode one layer only.
  if (!/%[0-9a-fA-F]{2}/.test(raw)) return raw;
  try { return decodeURIComponent(raw); } catch { return raw; }
}

async function paymentRecord(method, path, body) {
  const response = await fetch(`${SUPABASE_URL}/rest/v1/${path}`, {
    method,
    headers: { apikey: process.env.SUPABASE_SERVICE_ROLE_KEY, Authorization: `Bearer ${process.env.SUPABASE_SERVICE_ROLE_KEY}`, 'Content-Type':'application/json', Prefer:'return=representation' },
    body: body ? JSON.stringify(body) : undefined,
  });
  if (!response.ok) throw new Error('Unable to save payment record');
  return response.status === 204 ? null : response.json();
}

async function createOrder(input, orderId, total) {
  const customer = input.customer || {};
  const items = Array.isArray(input.items) ? input.items.slice(0, 50).map(item => ({
    id: String(item?.id || '').slice(0, 240),
    quantity: Number(item?.quantity),
    unitPrice: Number(item?.unitPrice),
    name: String(item?.name || item?.id || '').slice(0, 300),
  })) : [];
  const email = String(customer.email || '').trim();
  if (!String(customer.name || '').trim() || !/^\S+@\S+\.\S+$/.test(email) || !String(customer.phone || '').trim() || !String(customer.address || '').trim() || !String(customer.country || '').trim() || !String(customer.postalCode || '').trim() || !items.length) throw new Error('Invalid order details');
  await paymentRecord('POST', 'orders', {
    order_number:orderId, customer_name:String(customer.name).trim().slice(0,160), email:email.slice(0,200), phone:String(customer.phone).trim().slice(0,80),
    street_address:String(customer.address).slice(0,1200), city:String(customer.postalCode).slice(0,40), country:String(customer.country).slice(0,120),
    currency:'USD', total, items, status:'pending',
  });
}

async function rollbackOrder(orderId) {
  try {
    await paymentRecord('DELETE', `orders?order_number=eq.${encodeURIComponent(orderId)}`);
  } catch (error) {
    console.warn(JSON.stringify({ event:'payment_order_rollback_error', orderId, message:error.message }));
  }
}

async function paymentExists(orderId) {
  const existingPayment = await paymentRecord('GET', `payment_orders?id=eq.${encodeURIComponent(orderId)}&select=id`);
  const existingOrder = await paymentRecord('GET', `orders?order_number=eq.${encodeURIComponent(orderId)}&select=order_number`);
  return Boolean(existingPayment?.length || existingOrder?.length);
}

function callbackNonce() {
  const webCrypto = globalThis.crypto;
  if (!webCrypto?.getRandomValues) throw new Error('Secure random generator unavailable');
  const bytes = new Uint8Array(24);
  webCrypto.getRandomValues(bytes);
  return [...bytes].map(byte => byte.toString(16).padStart(2, '0')).join('');
}

function paymentMetadata(input) {
  return {
    [PAYMENT_ORDER_MARKER]: true,
    asset: 'USDC',
    network: 'Polygon',
    paymentMethod: input.paymentMethod === 'cod' ? 'cod' : 'crypto',
  };
}

async function pricedOrder(input) {
  const requestedItems = Array.isArray(input.items) ? input.items.slice(0, 50) : [];
  const quantities = new Map();
  for (const item of requestedItems) {
    const id = String(item?.id || '');
    const quantity = Number(item?.quantity);
    if (!id || id.length > 240 || !Number.isInteger(quantity) || quantity < 1 || quantity > 20 || quantities.has(id)) {
      throw new Error('Invalid order items');
    }
    quantities.set(id, quantity);
  }
  if (!quantities.size) throw new Error('Invalid order items');

  const ids = [...quantities.keys()].map(id => `"${encodeURIComponent(id)}"`).join(',');
  if (ids.length > 6000) throw new Error('Order item identifiers are too large');
  const rows = await paymentRecord('GET', `store_products?id=in.(${ids})&status=eq.published&source_verified=eq.true&select=id,name_en,name_zh,price`);
  if (!Array.isArray(rows) || rows.length !== quantities.size) throw new Error('One or more products are unavailable');

  const items = rows.map(product => ({
    id: product.id,
    quantity: quantities.get(product.id),
    unitPrice: Number(product.price),
    name: product.name_en || product.name_zh || product.id,
  }));
  if (items.some(item => !Number.isFinite(item.unitPrice) || item.unitPrice <= 0)) throw new Error('Invalid product price');
  const cartTotal = Math.round(items.reduce((total, item) => total + item.unitPrice * item.quantity, 0) * 100) / 100;
  const paymentMethod = input.paymentMethod === 'cod' ? 'cod' : 'crypto';
  const total = paymentMethod === 'cod' ? Math.round(cartTotal * 1.1 * 100) / 100 : cartTotal;
  const amount = paymentMethod === 'cod' ? 40 : cartTotal;
  return { items, total, amount };
}

export async function handler(event) {
  if (event.httpMethod !== 'POST') return reply(405, { error: 'Method not allowed' });
  let input;
  try { input = JSON.parse(event.body || '{}'); } catch { return reply(400, { error: 'Invalid JSON' }); }
  const asset = ASSETS[String(input.asset || '').toUpperCase()];
  const orderId = String(input.orderId || '');
  const paymentChannel = input.paymentChannel === 'direct' ? 'direct' : 'gateway';
  if (!asset || !/^[A-Z0-9-]{8,80}$/.test(orderId)) return reply(400, { error: 'Invalid payment request' });
  if (!process.env.SUPABASE_SERVICE_ROLE_KEY) return reply(503, { error: 'Order pricing is not configured' });

  let priced;
  try {
    priced = await pricedOrder(input);
  } catch (error) {
    console.warn(JSON.stringify({ event:'payment_pricing_rejected', orderId, message:error.message }));
    return reply(400, { error: 'Unable to validate the selected products and total' });
  }
  const amountUsd = priced.amount;
  const orderTotal = priced.total;
  input.items = priced.items;

  const siteUrl = String(process.env.PUBLIC_SITE_URL || '').replace(/\/+$/, '');

  if (paymentChannel === 'direct') {
    const address = process.env[asset.addressEnv];
    if (!address) return reply(503, { error: 'Direct wallet payments are not configured for this asset yet' });
    let orderSaved = false;
    try {
      if (await paymentExists(orderId)) throw new Error('Payment identifier already exists');
      await createOrder(input, orderId, orderTotal);
      orderSaved = true;
      await paymentRecord('POST', 'payment_orders', {
        id:orderId, currency:'USD', amount:amountUsd,
        customer:{ ...paymentMetadata(input), asset:String(input.asset).toUpperCase(), network:asset.ticker, channel:'direct' },
        items:priced.items, status:'awaiting_payment', provider_invoice_id:null,
        provider_payment_id:address, provider_status:'direct_wallet',
      });
    } catch (error) {
      if (orderSaved) await rollbackOrder(orderId);
      console.warn(JSON.stringify({ event:'direct_order_record_error', orderId, message:error.message }));
      return reply(502, { error: 'Unable to save the order. No payment address was issued.' });
    }
    return directWalletInvoice(orderId, String(input.asset).toUpperCase(), address);
  }

  try {
    if (!siteUrl) return reply(503, { error: 'PayGate card checkout is not configured yet' });
    const callback = new URL('/.netlify/functions/crypto-payment-callback', siteUrl);
    callback.searchParams.set('order_id', orderId);
    const nonce = callbackNonce();
    callback.searchParams.set('nonce', nonce);
    const payoutAddress = process.env.PAYGATE_USDC_POLYGON_ADDRESS;
    if (!validPolygonAddress(payoutAddress)) return reply(503, { error: 'Hosted checkout settlement is not configured for Polygon USDC' });
    const endpoint = new URL('https://api.paygate.to/control/wallet.php');
    endpoint.searchParams.set('address', payoutAddress);
    endpoint.searchParams.set('callback', callback.toString());
    const walletResponse = await fetch(endpoint);
    const wallet = await walletResponse.json().catch(() => null);
    const checkoutAddress = decodeProviderValue(wallet?.address_in);
    const ipnToken = decodeProviderValue(wallet?.ipn_token);
    const polygonAddress = decodeProviderValue(wallet?.polygon_address_in);
    if (!walletResponse.ok || !/^[A-Za-z0-9_-]{8,1024}$/.test(checkoutAddress) || !/^[A-Za-z0-9_-]{8,1024}$/.test(ipnToken) || !validPolygonAddress(polygonAddress)) {
      throw new Error('PayGate could not create a secure checkout');
    }
    const checkout = new URL('https://checkout.paygate.to/pay.php');
    checkout.searchParams.set('address', checkoutAddress);
    checkout.searchParams.set('amount', amountUsd.toFixed(2));
    checkout.searchParams.set('email', String(input.customer?.email || ''));
    checkout.searchParams.set('currency', 'USD');
    checkout.searchParams.set('background', '#f5f2ec');
    checkout.searchParams.set('theme', '#171717');
    checkout.searchParams.set('button', '#9d7943');
    let orderSaved = false;
    try {
      if (await paymentExists(orderId)) throw new Error('Payment identifier already exists');
      await createOrder(input, orderId, orderTotal);
      orderSaved = true;
      await paymentRecord('POST', 'payment_orders', {
        id:orderId, currency:'USD', amount:amountUsd, customer:{ ...paymentMetadata(input), channel:'hosted', callbackNonce:nonce }, items:priced.items,
        status:'awaiting_payment', provider_invoice_id:ipnToken, provider_payment_id:polygonAddress,
        provider_status:'awaiting_payment',
      });
    } catch (error) {
      if (orderSaved) await rollbackOrder(orderId);
      console.warn(JSON.stringify({ event:'payment_record_error', orderId, message:error.message }));
      return reply(502, { error: 'Unable to save the order. The hosted checkout was not issued.' });
    }
    return reply(200, { orderId, status: 'redirect', paymentUrl: checkout.toString() });
  } catch (error) {
    console.warn(JSON.stringify({ event:'paygate_checkout_error', orderId, message:error.message }));
    return reply(502, { error: 'Unable to create the PayGate checkout. Please try again or choose direct wallet payment.' });
  }
}
