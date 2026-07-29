import { PutObjectCommand, S3Client } from '@aws-sdk/client-s3';

function reply(statusCode, body) { return { statusCode, headers:{ 'Content-Type':'application/json; charset=utf-8', 'Cache-Control':'no-store' }, body:JSON.stringify(body) }; }

export async function handler(event) {
  if (event.httpMethod !== 'POST') return reply(405, { error:'Method not allowed' });
  let input;
  try { input = JSON.parse(event.body || '{}'); } catch { return reply(400, { error:'Invalid JSON' }); }
  const orderId = String(input.orderId || '');
  const txid = String(input.txid || '').trim();
  const image = String(input.screenshotData || '');
  if (!/^[A-Z0-9-]{8,80}$/.test(orderId) || (!txid && !image)) return reply(400, { error:'A transaction hash or image is required' });
  if (txid.length > 200 || image.length > 7 * 1024 * 1024) return reply(400, { error:'Proof is too large' });

  let proofKey = null;
  if (image) {
    const match = image.match(/^data:(image\/(?:jpeg|png|webp));base64,([A-Za-z0-9+/=]+)$/);
    if (!match) return reply(400, { error:'Unsupported screenshot format' });
    const required = ['R2_ENDPOINT','R2_ACCESS_KEY_ID','R2_SECRET_ACCESS_KEY','R2_BUCKET_NAME'];
    if (required.some(key => !process.env[key])) return reply(503, { error:'Proof storage is not configured' });
    const extension = match[1] === 'image/jpeg' ? 'jpg' : match[1].split('/')[1];
    proofKey = `payment-proofs/${orderId}/${Date.now()}.${extension}`;
    const client = new S3Client({ region:'auto', endpoint:process.env.R2_ENDPOINT, credentials:{ accessKeyId:process.env.R2_ACCESS_KEY_ID, secretAccessKey:process.env.R2_SECRET_ACCESS_KEY } });
    await client.send(new PutObjectCommand({ Bucket:process.env.R2_BUCKET_NAME, Key:proofKey, Body:Buffer.from(match[2], 'base64'), ContentType:match[1], Metadata:{ order_id:orderId, asset:String(input.asset || '') } }));
  }
  console.log(JSON.stringify({ event:'crypto_payment_proof_submitted', orderId, asset:input.asset, txid, proofKey }));
  return reply(200, { status:'under_review' });
}
