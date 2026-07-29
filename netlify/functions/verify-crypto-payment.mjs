const SUPABASE_URL = 'https://mnbmdhkugxifzsaxdslm.supabase.co';
const PAYMENT_ORDER_MARKER = '__oiwatch_payment_v2';

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
  const txid = String(input.txid || '').trim();
  if (!/^[A-Z0-9-]{8,80}$/.test(orderId) || txid.length > 200) return reply(400, { error:'Invalid payment verification request' });
  try {
    const rows = await database(`payment_orders?id=eq.${encodeURIComponent(orderId)}&select=id,amount,status,customer,provider_invoice_id,provider_payment_id,provider_status`);
    const payment = rows?.[0];
    if (payment?.customer?.[PAYMENT_ORDER_MARKER] !== true) return reply(404, { error:'Payment record not found' });
    if (payment?.customer?.channel !== 'hosted' || !payment?.provider_invoice_id) return reply(409, { error:'Direct wallet payments require independent on-chain verification' });
    if (payment.status === 'completed') return reply(200, { status:'completed', ...(payment.provider_payment_id ? { txid:payment.provider_payment_id } : {}) });
    const url = new URL('https://api.paygate.to/control/payment-status.php');
    url.searchParams.set('ipn_token', payment.provider_invoice_id);
    const providerResponse = await fetch(url);
    const status = await providerResponse.json().catch(() => null);
    if (!providerResponse.ok || !status || typeof status !== 'object') throw new Error('Invalid provider response');
    const providerStatus = String(status.status || '').toLowerCase();
    const providerCoin = String(status.coin || '').trim().toLowerCase();
    const providerTxid = String(status.txid_out || '').trim();
    const completed = ['paid', 'completed', 'complete', 'confirmed'].includes(providerStatus);
    if (!completed || providerCoin !== 'polygon_usdc' || !providerTxid) return reply(200, { status:'awaiting_confirmation' });
    if (txid && providerTxid && providerTxid.toLowerCase() !== txid.toLowerCase()) return reply(200, { status:'awaiting_confirmation' });
    await database(`payment_orders?id=eq.${encodeURIComponent(orderId)}&status=neq.completed`, { method:'PATCH', body:JSON.stringify({ status:'completed', provider_status:providerStatus, ...(providerTxid ? { provider_payment_id:providerTxid } : {}) }) });
    await database(`orders?order_number=eq.${encodeURIComponent(orderId)}&status=neq.completed`, { method:'PATCH', body:JSON.stringify({ status:'completed' }) });
    return reply(200, { status:'completed', ...(providerTxid ? { txid:providerTxid } : {}) });
  } catch { return reply(502, { error:'Unable to verify payment at this time' }); }
}
