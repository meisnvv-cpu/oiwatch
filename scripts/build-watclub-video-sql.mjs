import fs from 'node:fs/promises';
import path from 'node:path';

const root = path.resolve(process.argv[2] || 'work/imports/watclub-full');
const updates = JSON.parse(await fs.readFile(path.join(root, 'video-updates.json'), 'utf8'));
const output = path.join(root, 'supabase-import', '300-video-updates.sql');

function quote(value) {
  return `'${String(value ?? '').replaceAll("'", "''")}'`;
}

function json(value) {
  return `${quote(JSON.stringify(value))}::jsonb`;
}

const statements = updates.map(({ id, videos }) => {
  const productId = quote(id);
  const media = videos.map(video => ({
    id: video.id,
    objectKey: video.objectKey,
    type: video.type,
    url: video.url,
    name: video.name,
    storage: video.storage,
    sourceUrl: video.sourceUrl,
    position: video.position,
    contentType: video.contentType,
  }));
  const videoIds = media.map(video => quote(video.id)).join(', ');
  return `update public.store_products
set media = coalesce((select jsonb_agg(item order by (item->>'position')::int)
  from jsonb_array_elements(coalesce(media, '[]'::jsonb)) item
  where item->>'id' not in (${videoIds})), '[]'::jsonb) || ${json(media)}, updated_at = now()
where id = ${productId};`;
});

const sql = [
  'begin;',
  '-- Generated from video-updates.json. Existing entries with the same media id are replaced.',
  ...statements,
  'commit;',
  '',
].join('\n');
await fs.writeFile(output, sql, 'utf8');
console.log(JSON.stringify({ output, products: updates.length, videos: updates.reduce((sum, item) => sum + item.videos.length, 0) }, null, 2));
