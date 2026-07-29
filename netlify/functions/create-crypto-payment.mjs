const ASSETS = {
  BTC: { ticker: 'btc', addressEnv: 'PAYGATE_BTC_ADDRESS' },
  ETH: { ticker: 'eth', addressEnv: 'PAYGATE_ETH_ADDRESS' },
  USDT: { ticker: 'trc20/usdt', addressEnv: 'PAYGATE_USDT_TRC20_ADDRESS' },
  USDC: { ticker: 'erc20/usdc', addressEnv: 'PAYGATE_USDC_ERC20_ADDRESS' },
  SOL: { ticker: 'sol', addressEnv: 'PAYGATE_SOL_ADDRESS' },
};
const SUPABASE_URL = 'https://mnbmdhkugxifzsaxdslm.supabase.co';

function reply(statusCode, body) {
  return { statusCode, headers: { 'Content-Type': 'application/json; charset=utf-8', 'Cache-Control': 'no-store' }, body: JSON.stringify(body) };
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
  const items = Array.isArray(input.items) ? input.items.slice(0, 50) : [];
  if (!customer.name || !customer.email || !customer.phone || !customer.address || !customer.country || !customer.postalCode || !items.length) throw new Error('Invalid order details');
  await paymentRecord('POST', 'orders', {
    order_number:orderId, customer_name:String(customer.name).slice(0,160), email:String(customer.email).slice(0,200), phone:String(customer.phone).slice(0,80),
    street_address:String(customer.address).slice(0,1200), city:String(customer.postalCode).slice(0,40), country:String(customer.country).slice(0,120),
    currency:'USD', total, items, status:'pending',
  });
}

export async function handler(event) {
  if (event.httpMethod !== 'POST') return reply(405, { error: 'Method not allowed' });
  let input;
  try { input = JSON.parse(event.body || '{}'); } catch { return reply(400, { error: 'Invalid JSON' }); }
  const asset = ASSETS[String(input.asset || '').toUpperCase()];
  const orderId = String(input.orderId || '');
  const amountUsd = Number(input.amountUsd);
  const orderTotal = Number(input.orderTotal || amountUsd);
  if (!asset || !/^[A-Z0-9-]{8,80}$/.test(orderId) || !Number.isFinite(amountUsd) || amountUsd <= 0 || !Number.isFinite(orderTotal) || orderTotal < amountUsd) return reply(400, { error: 'Invalid payment request' });

  const address = process.env[asset.addressEnv];
  const siteUrl = String(process.env.PUBLIC_SITE_URL || '').replace(/\/+$/, '');
  if (!address || !siteUrl || !process.env.SUPABASE_SERVICE_ROLE_KEY) return reply(503, { error: 'Crypto payments are not configured yet' });

  try {
    await createOrder(input, orderId, orderTotal);
    // Payments go directly to the configured wallet. This avoids relying on a
    // third-party address-forwarding service during checkout.
    const qr = new URL('https://api.qrserver.com/v1/create-qr-code/');
    qr.searchParams.set('size', '360x360');
    qr.searchParams.set('format', 'png');
    qr.searchParams.set('data', address);
    await paymentRecord('POST', 'payment_orders?on_conflict=id', {
      id: orderId, currency:'USD', amount:amountUsd, customer:{}, items:[], status:'awaiting_payment',
      provider_invoice_id:orderId, provider_payment_id:address, provider_status:'awaiting_payment',
    });
    return reply(200, { orderId, asset: String(input.asset).toUpperCase(), address, amountCoin: null, qrCode: qr.toString(), status: 'awaiting_payment' });
  } catch {
    return reply(502, { error: 'Unable to reach the payment provider' });
  }
}
