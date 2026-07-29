// PayGate callbacks are unsigned GET requests. They are logged as unverified and
// must be matched against the chain before any fulfilment action.
export async function handler(event) {
  const query = event.queryStringParameters || {};
  if (!query.order_id || !query.txid_in || !query.coin || !query.value_coin) {
    return { statusCode: 400, body: 'invalid callback' };
  }
  console.log(JSON.stringify({ event: 'crypto_payment_unverified', orderId: query.order_id, txid: query.txid_in, coin: query.coin, value: query.value_coin }));
  return { statusCode: 200, headers: { 'Content-Type': 'text/plain; charset=utf-8' }, body: 'ok' };
}

