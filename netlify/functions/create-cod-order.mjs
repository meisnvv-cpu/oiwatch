const SUPABASE_URL = 'https://mnbmdhkugxifzsaxdslm.supabase.co';

function reply(statusCode, body) { return { statusCode, headers:{ 'Content-Type':'application/json; charset=utf-8', 'Cache-Control':'no-store' }, body:JSON.stringify(body) }; }

export async function handler(event) {
  if (event.httpMethod !== 'POST') return reply(405, { error:'Method not allowed' });
  let input;
  try { input = JSON.parse(event.body || '{}'); } catch { return reply(400, { error:'Invalid JSON' }); }
  const orderId = String(input.orderId || '');
  const customer = input.customer || {};
  const items = Array.isArray(input.items) ? input.items.slice(0, 50) : [];
  const total = Number(input.total);
  if (!/^[A-Z0-9-]{8,80}$/.test(orderId) || !Number.isFinite(total) || total <= 0 || !customer.name || !customer.email || !customer.phone || !customer.address || !customer.country || !customer.postalCode || !items.length || !process.env.SUPABASE_SERVICE_ROLE_KEY) return reply(400, { error:'Invalid order details' });
  const response = await fetch(`${SUPABASE_URL}/rest/v1/orders`, { method:'POST', headers:{ apikey:process.env.SUPABASE_SERVICE_ROLE_KEY, Authorization:`Bearer ${process.env.SUPABASE_SERVICE_ROLE_KEY}`, 'Content-Type':'application/json', Prefer:'return=representation' }, body:JSON.stringify({ order_number:orderId, customer_name:String(customer.name).slice(0,160), email:String(customer.email).slice(0,200), phone:String(customer.phone).slice(0,80), street_address:String(customer.address).slice(0,1200), city:String(customer.postalCode).slice(0,40), country:String(customer.country).slice(0,120), currency:'USD', total, items, status:'cod_shipping_due' }) });
  if (!response.ok) return reply(502, { error:'Unable to create cash-on-delivery order' });
  return reply(200, { orderId, shippingDue:40, balanceDue:Math.max(0, total - 40), status:'shipping_payment_due' });
}
