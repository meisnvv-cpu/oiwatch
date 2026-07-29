const SUPABASE_URL = 'https://mnbmdhkugxifzsaxdslm.supabase.co';
const PAYMENT_ORDER_MARKER = '__oiwatch_payment_v2';

async function database(path, options = {}) {
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  const response = await fetch(`${SUPABASE_URL}/rest/v1/${path}`, {
    ...options,
    headers:{ apikey:key, Authorization:`Bearer ${key}`, 'Content-Type':'application/json', Prefer:'return=representation' },
  });
  if (!response.ok) throw new Error('Database operation failed');
  return response.status === 204 ? null : response.json();
}

async function providerStatus(ipnToken) {
  const url = new URL('https://api.paygate.to/control/payment-status.php');
  url.searchParams.set('ipn_token', ipnToken);
  const response = await fetch(url);
  const status = await response.json().catch(() => null);
  if (!response.ok || !status || typeof status !== 'object') throw new Error('Invalid provider response');
  return status;
}

// Provider callbacks are not trusted by themselves. The callback only identifies
// an order; completion always comes from a server-to-server status lookup using
// the ipn_token saved when the checkout was created.
export async function handler(event) {
  if (event.httpMethod && event.httpMethod !== 'GET') return { statusCode:405, body:'method not allowed' };
  if (!process.env.SUPABASE_SERVICE_ROLE_KEY) return { statusCode:503, body:'callback unavailable' };
  const query = event.queryStringParameters || {};
  const orderId = String(query.order_id || '');
  const nonce = String(query.nonce || '');
  if (!/^[A-Z0-9-]{8,80}$/.test(orderId) || !/^[a-f0-9]{48}$/.test(nonce)) return { statusCode:400, body:'invalid callback' };
  try {
    const rows = await database(`payment_orders?id=eq.${encodeURIComponent(orderId)}&select=id,status,customer,provider_invoice_id,provider_payment_id`);
    const payment = rows?.[0];
    if (!payment?.provider_invoice_id || payment?.customer?.[PAYMENT_ORDER_MARKER] !== true || payment?.customer?.channel !== 'hosted' || payment?.customer?.callbackNonce !== nonce) return { statusCode:404, body:'payment not found' };
    if (payment.status === 'completed') return { statusCode:200, body:'ok' };
    const status = await providerStatus(payment.provider_invoice_id);
    const providerState = String(status.status || '').toLowerCase();
    const providerCoin = String(status.coin || '').trim().toLowerCase();
    const txid = String(status.txid_out || '').trim();
    if (!['paid', 'completed', 'complete', 'confirmed'].includes(providerState) || providerCoin !== 'polygon_usdc' || !txid) return { statusCode:200, body:'pending' };
    await database(`payment_orders?id=eq.${encodeURIComponent(orderId)}&status=neq.completed`, { method:'PATCH', body:JSON.stringify({ status:'completed', provider_status:providerState, ...(txid ? { provider_payment_id:txid } : {}) }) });
    await database(`orders?order_number=eq.${encodeURIComponent(orderId)}&status=neq.completed`, { method:'PATCH', body:JSON.stringify({ status:'completed' }) });
    console.log(JSON.stringify({ event:'paygate_payment_verified', orderId, hasTxid:Boolean(txid) }));
    return { statusCode:200, headers:{ 'Content-Type':'text/plain; charset=utf-8', 'Cache-Control':'no-store' }, body:'ok' };
  } catch (error) {
    console.warn(JSON.stringify({ event:'paygate_callback_error', orderId, message:error.message }));
    return { statusCode:502, headers:{ 'Content-Type':'text/plain; charset=utf-8', 'Cache-Control':'no-store' }, body:'verification failed' };
  }
}
