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

export async function handler(event) {
  if (event.httpMethod !== 'POST') return reply(405, { error: 'Method not allowed' });
  let input;
  try { input = JSON.parse(event.body || '{}'); } catch { return reply(400, { error: 'Invalid JSON' }); }
  const asset = ASSETS[String(input.asset || '').toUpperCase()];
  const orderId = String(input.orderId || '');
  const amountUsd = Number(input.amountUsd);
  if (!asset || !/^[A-Z0-9-]{8,80}$/.test(orderId) || !Number.isFinite(amountUsd) || amountUsd <= 0) return reply(400, { error: 'Invalid payment request' });

  const address = process.env[asset.addressEnv];
  const siteUrl = String(process.env.PUBLIC_SITE_URL || '').replace(/\/+$/, '');
  if (!address || !siteUrl || !process.env.SUPABASE_SERVICE_ROLE_KEY) return reply(503, { error: 'Crypto payments are not configured yet' });

  const callback = new URL('/.netlify/functions/crypto-payment-callback', siteUrl);
  callback.searchParams.set('order_id', orderId);
  const endpoint = new URL(`https://api.paygate.to/crypto/${asset.ticker}/wallet.php`);
  endpoint.searchParams.set('address', address);
  endpoint.searchParams.set('callback', callback.toString());
  endpoint.searchParams.set('confirmations', '1');

  try {
    const response = await fetch(endpoint);
    const data = await response.json().catch(() => null);
    if (!response.ok || !data?.address_in) return reply(502, { error: 'Unable to create a crypto payment address' });
    const convert = new URL(`https://api.paygate.to/crypto/${asset.ticker}/convert.php`);
    convert.searchParams.set('from', 'USD');
    convert.searchParams.set('value', String(amountUsd));
    const conversion = await fetch(convert).then(result => result.json()).catch(() => null);
    const amountCoin = conversion?.value_coin || conversion?.value || null;
    const qr = new URL(`https://api.paygate.to/crypto/${asset.ticker}/qrcode.php`);
    qr.searchParams.set('address', data.address_in);
    if (amountCoin) qr.searchParams.set('amount', String(amountCoin));
    const qrData = await fetch(qr).then(result => result.json()).catch(() => null);
    await paymentRecord('POST', 'payment_orders?on_conflict=id', {
      id: orderId, currency:'USD', amount:amountUsd, customer:{}, items:[], status:'awaiting_payment',
      provider_invoice_id:data.ipn_token, provider_payment_id:data.address_in, provider_status:'unpaid',
    });
    return reply(200, { orderId, asset: String(input.asset).toUpperCase(), address: data.address_in, amountCoin, qrCode: qrData?.qr_code ? `data:image/png;base64,${qrData.qr_code}` : null, status: 'awaiting_payment' });
  } catch {
    return reply(502, { error: 'Unable to reach the payment provider' });
  }
}
