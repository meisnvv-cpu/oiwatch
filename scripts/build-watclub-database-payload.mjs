import fs from 'node:fs/promises';
import path from 'node:path';

const root = path.resolve(process.argv[2] || 'work/imports/watclub-full');
const output = path.join(root, 'database-import.json');
const publicBase = 'https://pub-05cae86ceb4e45fc905d76c161531c5c.r2.dev';

const entries = await fs.readdir(root, { withFileTypes: true });
const products = [];

for (const entry of entries) {
  if (!entry.isDirectory()) continue;
  const file = path.join(root, entry.name, 'product.json');
  try {
    const p = JSON.parse(await fs.readFile(file, 'utf8'));
    products.push({
      sourceId: String(p.sourceId),
      sourceUrl: p.sourceUrl,
      sourcePublishedAt: p.sourcePublishedAt,
      slug: p.slug,
      title: p.title || '',
      description: p.description || '',
      descriptionHtml: p.descriptionHtml || p.description || '',
      categories: p.categories || [],
      tags: p.tags || [],
      media: (p.media || [])
        .filter((m) => m.download?.ok && m.fileName && m.r2Key)
        .map((m, index) => ({
          type: m.kind === 'video' ? 'video' : 'image',
          position: Number(m.position ?? index),
          sourceUrl: m.sourceUrl,
          fileName: m.fileName,
          r2Key: m.r2Key,
          publicUrl: `${publicBase}/${m.r2Key}`,
          contentType: m.download?.contentType || null,
        })),
    });
  } catch {
    // Ignore support directories.
  }
}

products.sort((a, b) => a.sourceId.localeCompare(b.sourceId));
await fs.writeFile(output, JSON.stringify({ version: 1, products }));
const stat = await fs.stat(output);
console.log(JSON.stringify({ output, products: products.length, bytes: stat.size }));
