import fs from 'node:fs/promises';
import path from 'node:path';
import { PutObjectCommand, S3Client } from '@aws-sdk/client-s3';

const root = path.resolve(process.argv[2] || 'work/imports/watclub-full');
const statePath = path.join(root, 'r2-upload-state.json');
const concurrency = Math.max(1, Number(process.env.UPLOAD_CONCURRENCY || 8));

for (const key of [
  'R2_ENDPOINT',
  'R2_ACCESS_KEY_ID',
  'R2_SECRET_ACCESS_KEY',
  'R2_BUCKET_NAME',
]) {
  if (!process.env[key]) throw new Error(`Missing ${key}`);
}

async function readJson(file) {
  return JSON.parse(await fs.readFile(file, 'utf8'));
}

async function loadState() {
  try {
    return await readJson(statePath);
  } catch {
    return { uploaded: {}, failed: {}, startedAt: new Date().toISOString() };
  }
}

async function findProductFiles(dir) {
  const entries = await fs.readdir(dir, { withFileTypes: true });
  const files = [];
  for (const entry of entries) {
    if (!entry.isDirectory()) continue;
    const file = path.join(dir, entry.name, 'product.json');
    try {
      await fs.access(file);
      files.push(file);
    } catch {
      // Ignore non-product folders.
    }
  }
  return files;
}

const mimeByExtension = {
  '.avif': 'image/avif',
  '.gif': 'image/gif',
  '.jpeg': 'image/jpeg',
  '.jpg': 'image/jpeg',
  '.mp4': 'video/mp4',
  '.png': 'image/png',
  '.webm': 'video/webm',
  '.webp': 'image/webp',
};

const productFiles = await findProductFiles(root);
const queue = [];

for (const productFile of productFiles) {
  const product = await readJson(productFile);
  for (const media of product.media || []) {
    if (!media.download?.ok || !media.fileName || !media.r2Key) continue;
    const filePath = path.join(path.dirname(productFile), media.fileName);
    try {
      const stat = await fs.stat(filePath);
      queue.push({
        filePath,
        key: media.r2Key,
        contentType:
          media.download.contentType ||
          mimeByExtension[path.extname(media.fileName).toLowerCase()] ||
          'application/octet-stream',
        bytes: stat.size,
      });
    } catch {
      // The audit report records any files that were not downloaded.
    }
  }
}

const client = new S3Client({
  region: 'auto',
  endpoint: process.env.R2_ENDPOINT,
  credentials: {
    accessKeyId: process.env.R2_ACCESS_KEY_ID,
    secretAccessKey: process.env.R2_SECRET_ACCESS_KEY,
  },
});

const state = await loadState();
let completed = Object.keys(state.uploaded).length;
let uploadedBytes = Object.values(state.uploaded).reduce(
  (sum, item) => sum + Number(item.bytes || 0),
  0,
);
let cursor = 0;
let writesSinceSave = 0;
const started = Date.now();

async function saveState() {
  state.updatedAt = new Date().toISOString();
  state.total = queue.length;
  state.completed = completed;
  state.uploadedBytes = uploadedBytes;
  await fs.writeFile(statePath, `${JSON.stringify(state, null, 2)}\n`);
  writesSinceSave = 0;
}

async function upload(item) {
  if (state.uploaded[item.key]?.bytes === item.bytes) return;
  try {
    await client.send(new PutObjectCommand({
      Bucket: process.env.R2_BUCKET_NAME,
      Key: item.key,
      Body: await fs.readFile(item.filePath),
      ContentType: item.contentType,
      CacheControl: 'public, max-age=31536000, immutable',
    }));
    state.uploaded[item.key] = {
      bytes: item.bytes,
      contentType: item.contentType,
      uploadedAt: new Date().toISOString(),
    };
    delete state.failed[item.key];
    completed += 1;
    uploadedBytes += item.bytes;
  } catch (error) {
    state.failed[item.key] = {
      message: error?.message || String(error),
      failedAt: new Date().toISOString(),
    };
  }
  writesSinceSave += 1;
  if (writesSinceSave >= 25) await saveState();
  if (writesSinceSave === 0 || completed % 50 === 0) {
    const seconds = Math.max(1, (Date.now() - started) / 1000);
    const rate = uploadedBytes / seconds / 1024 / 1024;
    console.log(
      `progress ${completed}/${queue.length} ` +
      `${(uploadedBytes / 1024 / 1024).toFixed(1)} MiB ` +
      `${rate.toFixed(2)} MiB/s failed=${Object.keys(state.failed).length}`,
    );
  }
}

async function worker() {
  while (true) {
    const index = cursor;
    cursor += 1;
    if (index >= queue.length) return;
    await upload(queue[index]);
  }
}

console.log(
  `Uploading ${queue.length} files with concurrency ${concurrency}; ` +
  `${completed} already recorded.`,
);
await Promise.all(Array.from({ length: concurrency }, () => worker()));
await saveState();

if (Object.keys(state.failed).length) process.exitCode = 2;
console.log(
  `finished ${completed}/${queue.length}; failed=${Object.keys(state.failed).length}; ` +
  `state=${statePath}`,
);
