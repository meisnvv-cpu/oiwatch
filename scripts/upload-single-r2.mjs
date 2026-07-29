import fs from 'node:fs/promises';
import path from 'node:path';
import { PutObjectCommand, S3Client } from '@aws-sdk/client-s3';

const [fileArg, key] = process.argv.slice(2);
if (!fileArg || !key) throw new Error('Usage: upload-single-r2.mjs <file> <key>');
const file = path.resolve(fileArg);
const client = new S3Client({
  region: 'auto',
  endpoint: process.env.R2_ENDPOINT,
  credentials: {
    accessKeyId: process.env.R2_ACCESS_KEY_ID,
    secretAccessKey: process.env.R2_SECRET_ACCESS_KEY,
  },
});
await client.send(new PutObjectCommand({
  Bucket: process.env.R2_BUCKET_NAME,
  Key: key,
  Body: await fs.readFile(file),
  ContentType: 'application/json',
  CacheControl: 'no-store',
}));
console.log(`uploaded ${path.basename(file)} to ${key}`);
