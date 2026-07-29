import { performance } from "node:perf_hooks";

const downloadBytes = 25_000_000;
const uploadBytes = 10_000_000;
const rounds = 3;

async function timedFetch(url, options = {}) {
  const started = performance.now();
  const response = await fetch(url, { cache: "no-store", ...options });
  if (!response.ok) throw new Error(`${response.status} ${response.statusText}`);
  const body = await response.arrayBuffer();
  return { milliseconds: performance.now() - started, bytes: body.byteLength };
}

const latency = [];
for (let index = 0; index < 5; index += 1) {
  const result = await timedFetch("https://speed.cloudflare.com/__down?bytes=0");
  latency.push(result.milliseconds);
}

const downloads = [];
for (let index = 0; index < rounds; index += 1) {
  const result = await timedFetch(`https://speed.cloudflare.com/__down?bytes=${downloadBytes}`);
  downloads.push((result.bytes * 8) / (result.milliseconds / 1000) / 1_000_000);
}

const uploadPayload = new Uint8Array(uploadBytes);
const uploads = [];
for (let index = 0; index < rounds; index += 1) {
  const started = performance.now();
  const response = await fetch("https://speed.cloudflare.com/__up", {
    method: "POST",
    headers: { "content-type": "application/octet-stream" },
    body: uploadPayload,
  });
  if (!response.ok) throw new Error(`${response.status} ${response.statusText}`);
  await response.arrayBuffer();
  uploads.push((uploadBytes * 8) / ((performance.now() - started) / 1000) / 1_000_000);
}

const median = values => [...values].sort((a, b) => a - b)[Math.floor(values.length / 2)];
console.log(JSON.stringify({
  latencyMs: latency,
  latencyMedianMs: median(latency),
  downloadMbps: downloads,
  downloadMedianMbps: median(downloads),
  uploadMbps: uploads,
  uploadMedianMbps: median(uploads),
}, null, 2));
