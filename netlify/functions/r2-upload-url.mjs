import { PutObjectCommand, S3Client } from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';

const SUPABASE_URL = 'https://mnbmdhkugxifzsaxdslm.supabase.co';
const SUPABASE_KEY = 'sb_publishable_Ee1G3j2m8ZveUfTnUNdBCg_GpFDgDJR';
const ALLOWED_ORIGINS = new Set([
  'https://oiwatch.cc',
  'https://www.oiwatch.cc',
  'https://spiffy-croissant-948872.netlify.app',
  'http://localhost:5173',
]);
const ALLOWED_TYPES = /^(image\/(?:avif|gif|jpeg|png|webp)|video\/(?:mp4|quicktime|webm))$/i;
const MAX_BYTES = 300 * 1024 * 1024;

function headers(origin) {
  const allowedOrigin = ALLOWED_ORIGINS.has(origin) ? origin : 'https://oiwatch.cc';
  return {
    'Access-Control-Allow-Origin': allowedOrigin,
    'Access-Control-Allow-Headers': 'Authorization, Content-Type',
    'Access-Control-Allow-Methods': 'POST, OPTIONS',
    'Access-Control-Max-Age': '86400',
    'Content-Type': 'application/json; charset=utf-8',
    Vary: 'Origin',
  };
}

function response(statusCode, body, origin) {
  return { statusCode, headers: headers(origin), body: JSON.stringify(body) };
}

function safeSegment(value = '') {
  return value
    .normalize('NFKD')
    .replace(/[^\p{Letter}\p{Number}._-]+/gu, '-')
    .replace(/^-+|-+$/g, '')
    .toLowerCase()
    .slice(0, 120) || 'file';
}

async function supabase(path, token) {
  const result = await fetch(`${SUPABASE_URL}${path}`, {
    headers: {
      apikey: SUPABASE_KEY,
      Authorization: `Bearer ${token}`,
    },
  });
  if (!result.ok) return null;
  return result.json();
}

async function authenticate(authorization) {
  const token = authorization?.match(/^Bearer\s+(.+)$/i)?.[1];
  if (!token) return null;
  const user = await supabase('/auth/v1/user', token);
  if (!user?.id) return null;
  const admins = await supabase(
    `/rest/v1/admin_users?select=user_id&user_id=eq.${encodeURIComponent(user.id)}`,
    token,
  );
  return Array.isArray(admins) && admins.length === 1 ? user : null;
}

export async function handler(event) {
  const origin = event.headers.origin || event.headers.Origin || '';
  if (event.httpMethod === 'OPTIONS') {
    return { statusCode: 204, headers: headers(origin), body: '' };
  }
  if (event.httpMethod !== 'POST') {
    return response(405, { error: 'Method not allowed' }, origin);
  }

  const user = await authenticate(event.headers.authorization || event.headers.Authorization);
  if (!user) return response(401, { error: 'Administrator login required' }, origin);

  let input;
  try {
    input = JSON.parse(event.body || '{}');
  } catch {
    return response(400, { error: 'Invalid JSON' }, origin);
  }

  const fileName = safeSegment(input.fileName);
  const productId = safeSegment(input.productId || `draft-${Date.now()}`);
  const contentType = String(input.contentType || '').toLowerCase();
  const size = Number(input.size);
  if (!ALLOWED_TYPES.test(contentType)) {
    return response(400, { error: 'Unsupported image or video type' }, origin);
  }
  if (!Number.isFinite(size) || size <= 0 || size > MAX_BYTES) {
    return response(400, { error: 'File must be between 1 byte and 300 MB' }, origin);
  }

  const required = [
    'R2_ENDPOINT',
    'R2_ACCESS_KEY_ID',
    'R2_SECRET_ACCESS_KEY',
    'R2_BUCKET_NAME',
    'R2_PUBLIC_BASE_URL',
  ];
  const missing = required.filter(name => !process.env[name]);
  if (missing.length) {
    return response(500, { error: `Missing server configuration: ${missing.join(', ')}` }, origin);
  }

  const objectKey = `products/${productId}/${Date.now()}-${fileName}`;
  const client = new S3Client({
    region: 'auto',
    endpoint: process.env.R2_ENDPOINT,
    credentials: {
      accessKeyId: process.env.R2_ACCESS_KEY_ID,
      secretAccessKey: process.env.R2_SECRET_ACCESS_KEY,
    },
  });
  const command = new PutObjectCommand({
    Bucket: process.env.R2_BUCKET_NAME,
    Key: objectKey,
    ContentType: contentType,
    ContentLength: size,
    Metadata: {
      'uploaded-by': user.id,
      'product-id': productId,
    },
  });
  const uploadUrl = await getSignedUrl(client, command, { expiresIn: 300 });
  const publicBase = process.env.R2_PUBLIC_BASE_URL.replace(/\/+$/, '');
  return response(200, {
    uploadUrl,
    publicUrl: `${publicBase}/${objectKey}`,
    objectKey,
    expiresIn: 300,
  }, origin);
}
