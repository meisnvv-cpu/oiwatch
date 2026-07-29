// PayGate callbacks are unsigned GET requests. They are logged as unverified and
// must be matched against the chain before any fulfilment action.
export async function handler(event) {
  const query = event.queryStringParameters || {};
  if (!query.order_id || !query.value_coin) {
    return { statusCode: 400, body: 'invalid callback' };
  }
  console.log(JSON.stringify({ event: 'paygate_payment_unverified', orderId: query.order_id, txid: query.txid_in || null, coin: query.coin || 'USDC_POLYGON', value: query.value_coin }));
  return { statusCode: 200, headers: { 'Content-Type': 'text/plain; charset=utf-8' }, body: 'ok' };
}
