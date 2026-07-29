const SUPABASE_URL = 'https://mnbmdhkugxifzsaxdslm.supabase.co';
const TICKERS = { BTC:'btc', ETH:'eth', USDT:'trc20/usdt', USDC:'erc20/usdc', SOL:'sol' };

function reply(statusCode, body) { return { statusCode, headers:{ 'Content-Type':'application/json; charset=utf-8', 'Cache-Control':'no-store' }, body:JSON.stringify(body) }; }

async function database(path, options = {}) {
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  const response = await fetch(`${SUPABASE_URL}/rest/v1/${path}`, { ...options, headers:{ apikey:key, Authorization:`Bearer ${key}`, 'Content-Type':'application/json', Prefer:'return=representation', ...(options.headers || {}) } });
  if (!response.ok) throw new Error('Database operation failed');
  return response.status === 204 ? null : response.json();
}

export async function handler(event) {
  if (event.httpMethod !== 'POST') return reply(405, { error:'Method not allowed' });
  if (!process.env.SUPABASE_SERVICE_ROLE_KEY) return reply(503, { error:'Payment verification is not configured' });
  let input;
  try { input = JSON.parse(event.body || '{}'); } catch { return reply(400, { error:'Invalid JSON' }); }
  const orderId = String(input.orderId || '');
  const asset = String(input.asset || '').toUpperCase();
  const txid = String(input.txid || '').trim();
  if (!/^[A-Z0-9-]{8,80}$/.test(orderId) || !TICKERS[asset]) return reply(400, { error:'Invalid payment verification request' });
  try {
    const rows = await database(`payment_orders?id=eq.${encodeURIComponent(orderId)}&select=*`);
    const payment = rows?.[0];
    if (!payment?.provider_invoice_id) return reply(404, { error:'Payment record not found' });
    const url = new URL('https://api.paygate.to/crypto/payment-status.php');
    url.searchParams.set('ipn_token', payment.provider_invoice_id);
    url.searchParams.set('ticker', TICKERS[asset]);
    const status = await fetch(url).then(result => result.json()).catch(() => null);
    const verified = status?.status === 'paid' && status?.txid_in && (!txid || status.txid_in === txid);
    if (!verified) return reply(200, { status:'awaiting_confirmation', txid:status?.txid_in || null });
    await database(`payment_orders?id=eq.${encodeURIComponent(orderId)}`, { method:'PATCH', body:JSON.stringify({ status:'completed', provider_status:'paid', provider_payment_id:status.txid_in }) });
    await database(`orders?order_number=eq.${encodeURIComponent(orderId)}`, { method:'PATCH', body:JSON.stringify({ status:'completed' }) });
    return reply(200, { status:'completed', txid:status.txid_in });
  } catch { return reply(502, { error:'Unable to verify payment at this time' }); }
}
