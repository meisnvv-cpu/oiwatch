import { mkdir, stat, writeFile } from 'node:fs/promises';
import { basename, extname, join } from 'node:path';

const SOURCE = 'https://watclub.co';
const API = `${SOURCE}/wp-json/wp/v2`;
const PUBLIC_MEDIA_BASE = 'https://pub-05cae86ceb4e45fc905d76c161531c5c.r2.dev';

function option(name, fallback) {
  const index = process.argv.indexOf(name);
  return index === -1 ? fallback : process.argv[index + 1];
}

const importAll = process.argv.includes('--all');
const limit = importAll ? Number.POSITIVE_INFINITY : Math.max(1, Number(option('--limit', '3')));
const shouldDownload = process.argv.includes('--download');
const outputRoot = option('--output', join('work', 'imports', importAll ? 'watclub-full' : 'watclub-test'));

function decodeHtml(value = '') {
  const entities = {
    '&amp;': '&',
    '&quot;': '"',
    '&#039;': "'",
    '&apos;': "'",
    '&lt;': '<',
    '&gt;': '>',
    '&nbsp;': ' ',
    '&ndash;': '–',
    '&mdash;': '—',
  };
  return value
    .replace(/&#(\d+);/g, (_, number) => String.fromCodePoint(Number(number)))
    .replace(/&#x([\da-f]+);/gi, (_, number) => String.fromCodePoint(Number.parseInt(number, 16)))
    .replace(/&(?:amp|quot|#039|apos|lt|gt|nbsp|ndash|mdash);/g, entity => entities[entity] || entity);
}

function cleanText(html = '') {
  return decodeHtml(
    html
      .replace(/<script\b[^>]*>[\s\S]*?<\/script>/gi, ' ')
      .replace(/<style\b[^>]*>[\s\S]*?<\/style>/gi, ' ')
      .replace(/<br\s*\/?>/gi, '\n')
      .replace(/<\/p>/gi, '\n\n')
      .replace(/<[^>]+>/g, ' '),
  )
    .replace(/[ \t]+/g, ' ')
    .replace(/ *\n */g, '\n')
    .replace(/\n{3,}/g, '\n\n')
    .trim();
}

function unique(values) {
  return [...new Set(values.filter(Boolean))];
}

function extractMedia(html = '') {
  const images = unique(
    [...html.matchAll(/<img\b[^>]*\bsrc=["']([^"']+)["']/gi)]
      .map(match => decodeHtml(match[1]))
      .filter(url => url.startsWith('http')),
  );
  const iframeVideos = unique(
    [...html.matchAll(/<iframe\b[^>]*\bsrc=["']([^"']+)["']/gi)]
      .map(match => decodeHtml(match[1]))
      .filter(url => /(?:vimeo|youtube|youtu\.be)/i.test(url)),
  );
  const directVideos = unique(
    [...html.matchAll(/<(?:video|source)\b[^>]*\bsrc=["']([^"']+)["']/gi)]
      .map(match => decodeHtml(match[1]))
      .filter(url => url.startsWith('http')),
  );
  return {
    images,
    videos: [
      ...iframeVideos.map(url => ({ type: 'embed', sourceUrl: url })),
      ...directVideos.map(url => ({ type: 'file', sourceUrl: url })),
    ],
  };
}

function safeSegment(value) {
  return value
    .normalize('NFKD')
    .replace(/[^\p{Letter}\p{Number}._-]+/gu, '-')
    .replace(/^-+|-+$/g, '')
    .toLowerCase()
    .slice(0, 100) || 'item';
}

function mediaName(url, index, kind) {
  const sourceName = safeSegment(basename(new URL(url).pathname));
  const extension = extname(sourceName) || (kind === 'image' ? '.webp' : '.mp4');
  const stem = safeSegment(sourceName.slice(0, -extension.length));
  return `${kind}-${String(index + 1).padStart(2, '0')}-${stem}${extension}`;
}

async function getJson(url) {
  const response = await fetch(url, {
    headers: { 'User-Agent': 'OiWatch authorized migration/1.0' },
  });
  if (!response.ok) throw new Error(`${response.status} ${response.statusText}: ${url}`);
  return response.json();
}

async function getAll(endpoint, maximum = Number.POSITIVE_INFINITY) {
  const items = [];
  let page = 1;
  while (items.length < maximum) {
    const separator = endpoint.includes('?') ? '&' : '?';
    const pageSize = Math.min(100, Number.isFinite(maximum) ? maximum - items.length : 100);
    const response = await fetch(`${API}/${endpoint}${separator}per_page=${pageSize}&page=${page}`, {
      headers: { 'User-Agent': 'OiWatch authorized migration/1.0' },
    });
    if (response.status === 400 && page > 1) break;
    if (!response.ok) throw new Error(`${response.status} ${response.statusText}: ${endpoint} page ${page}`);
    const batch = await response.json();
    items.push(...batch);
    const totalPages = Number(response.headers.get('x-wp-totalpages') || page);
    console.log(`[catalog] ${endpoint}: page ${page}/${totalPages}, ${items.length} items`);
    if (page >= totalPages || batch.length === 0) break;
    page += 1;
  }
  return items.slice(0, maximum);
}

async function download(url, destination) {
  try {
    const existing = await stat(destination);
    if (existing.size > 0) {
      return { skipped: true, bytes: existing.size, contentType: null };
    }
  } catch {
    // The file has not been downloaded yet.
  }
  const response = await fetch(url, {
    headers: { 'User-Agent': 'OiWatch authorized migration/1.0' },
    signal: AbortSignal.timeout(30000),
  });
  if (!response.ok) throw new Error(`${response.status} ${response.statusText}: ${url}`);
  await writeFile(destination, new Uint8Array(await response.arrayBuffer()));
  return {
    contentType: response.headers.get('content-type'),
    bytes: Number(response.headers.get('content-length')) || null,
  };
}

async function runConcurrent(tasks, concurrency = 5) {
  const results = new Array(tasks.length);
  let cursor = 0;
  async function worker() {
    while (cursor < tasks.length) {
      const index = cursor++;
      results[index] = await tasks[index]();
    }
  }
  await Promise.all(Array.from({ length: Math.min(concurrency, tasks.length) }, () => worker()));
  return results;
}

await mkdir(outputRoot, { recursive: true });

const [posts, categories, tags] = await Promise.all([
  getAll('posts?orderby=date&order=desc&_embed=1', limit),
  getAll('categories'),
  getAll('tags'),
]);

const categoryById = new Map(categories.map(item => [item.id, item]));
const tagById = new Map(tags.map(item => [item.id, item]));
const manifest = {
  version: 1,
  generatedAt: new Date().toISOString(),
  source: SOURCE,
  authorized: true,
  publicMediaBase: PUBLIC_MEDIA_BASE,
  count: posts.length,
  products: [],
};

for (const post of posts) {
  const slug = `${post.id}-${safeSegment(post.slug)}`;
  const productFolder = join(outputRoot, slug);
  await mkdir(productFolder, { recursive: true });

  const extracted = extractMedia(post.content.rendered);
  const categoryItems = post.categories.map(id => categoryById.get(id)).filter(Boolean);
  const tagItems = post.tags.map(id => tagById.get(id)).filter(Boolean);
  const media = [];

  for (const [index, sourceUrl] of extracted.images.entries()) {
    const fileName = mediaName(sourceUrl, index, 'image');
    const r2Key = `products/${slug}/${fileName}`;
    const item = {
      kind: 'image',
      position: index,
      sourceUrl,
      fileName,
      r2Key,
      publicUrl: `${PUBLIC_MEDIA_BASE}/${r2Key}`,
      download: null,
    };
    media.push(item);
  }

  for (const [index, video] of extracted.videos.entries()) {
    media.push({
      kind: 'video',
      position: index,
      sourceType: video.type,
      sourceUrl: video.sourceUrl,
      r2Key: video.type === 'file' ? `products/${slug}/${mediaName(video.sourceUrl, index, 'video')}` : null,
      publicUrl: video.type === 'embed' ? video.sourceUrl : null,
      download: null,
    });
  }

  if (shouldDownload) {
    const downloadable = media.filter(item => item.kind === 'image' || (item.kind === 'video' && item.sourceType === 'file'));
    await runConcurrent(downloadable.map(item => async () => {
      const destination = join(productFolder, item.fileName || basename(item.r2Key));
      try {
        item.download = { ok: true, ...(await download(item.sourceUrl, destination)) };
      } catch (error) {
        item.download = { ok: false, error: error.message };
      }
    }));
  }

  const product = {
    sourcePlatform: 'watclub',
    sourceId: String(post.id),
    sourceUrl: post.link,
    sourcePublishedAt: post.date_gmt ? `${post.date_gmt}Z` : post.date,
    slug,
    title: cleanText(post.title.rendered),
    description: cleanText(post.content.rendered),
    descriptionHtml: post.content.rendered,
    categories: categoryItems.map(item => ({ id: item.id, name: cleanText(item.name), slug: item.slug })),
    tags: tagItems.map(item => ({ id: item.id, name: cleanText(item.name), slug: item.slug })),
    media,
    coverUrl: media.find(item => item.kind === 'image')?.publicUrl || null,
    status: 'draft',
  };

  await writeFile(join(productFolder, 'product.json'), `${JSON.stringify(product, null, 2)}\n`);
  manifest.products.push(product);
  console.log(`[product] ${manifest.products.length}/${posts.length} ${product.sourceId} ${product.title}`);
}

await writeFile(join(outputRoot, 'manifest.json'), `${JSON.stringify(manifest, null, 2)}\n`);

const summary = manifest.products.map(product => ({
  sourceId: product.sourceId,
  title: product.title,
  categories: product.categories.map(item => item.name),
  images: product.media.filter(item => item.kind === 'image').length,
  videos: product.media.filter(item => item.kind === 'video').length,
  downloaded: product.media.filter(item => item.download?.ok).length,
}));

console.log(JSON.stringify({ outputRoot, count: manifest.count, products: summary }, null, 2));
