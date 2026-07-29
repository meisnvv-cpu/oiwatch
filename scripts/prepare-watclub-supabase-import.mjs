import fs from 'node:fs/promises';
import path from 'node:path';

const root = path.resolve(process.argv[2] || 'work/imports/watclub-full');
const output = path.join(root, 'supabase-import');
const batchIdSql = "md5('oiwatch:watclub-full:v1')::uuid";

async function readJson(file) {
  return JSON.parse(await fs.readFile(file, 'utf8'));
}

async function loadProducts() {
  const entries = await fs.readdir(root, { withFileTypes: true });
  const products = [];
  for (const entry of entries) {
    if (!entry.isDirectory()) continue;
    const file = path.join(root, entry.name, 'product.json');
    try {
      const product = await readJson(file);
      product.localDirectory = path.dirname(file);
      products.push(product);
    } catch {
      // Ignore report and support folders.
    }
  }
  return products.sort((a, b) => String(a.sourceId).localeCompare(String(b.sourceId)));
}

function sqlJson(value) {
  return `${quote(JSON.stringify(value))}::jsonb`;
}

function productUuid(sourceId) {
  return `md5('oiwatch:watclub:product:' || ${quote(String(sourceId))})::uuid`;
}

function mediaUuid(sourceId, position, sourceUrl) {
  return `md5('oiwatch:watclub:media:' || ${quote(
    `${sourceId}:${position}:${sourceUrl}`,
  )})::uuid`;
}

function quote(value) {
  if (value === null || value === undefined) return 'null';
  const encoded = Buffer.from(String(value), 'utf8').toString('base64');
  return `convert_from(decode('${encoded}', 'base64'), 'utf8')`;
}

function splitBrand(category) {
  if (!category) return { slug: 'other', nameEn: 'Other', nameZh: '其他' };
  const raw = String(category.name || category.slug || 'Other').trim();
  const chinese = (raw.match(/[\u3400-\u9fff]+/g) || []).join('');
  const english = raw
    .replace(/[\u3400-\u9fff]+/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
  return {
    slug: category.slug || `brand-${category.id}`,
    nameEn: english || raw,
    nameZh: chinese || english || raw,
  };
}

function normalizedMedia(product) {
  return (product.media || [])
    .filter((media) => media.download?.ok && media.fileName && media.r2Key)
    .map((media, index) => ({
      id: media.r2Key,
      objectKey: media.r2Key,
      type: media.kind === 'video' ? 'video' : 'image',
      url: media.publicUrl,
      name: media.fileName,
      storage: 'r2',
      sourceUrl: media.sourceUrl,
      position: Number(media.position ?? index),
      contentType: media.download?.contentType || null,
    }));
}

async function writeChunks(prefix, rows, size, makeSql) {
  let fileIndex = 0;
  for (let index = 0; index < rows.length; index += size) {
    fileIndex += 1;
    const chunk = rows.slice(index, index + size);
    const file = path.join(output, `${prefix}-${String(fileIndex).padStart(3, '0')}.sql`);
    await fs.writeFile(file, `${makeSql(chunk)}\n`);
  }
  return fileIndex;
}

const products = await loadProducts();
await fs.mkdir(output, { recursive: true });

const brands = new Map();
for (const product of products) {
  const brand = splitBrand(product.categories?.[0]);
  brands.set(brand.slug, brand);
}

const setupSql = `
begin;
insert into public.import_batches (
  id, source_platform, source_url, status, total_items, processed_items,
  successful_items, failed_items, notes, started_at, updated_at
) values (
  ${batchIdSql}, 'watclub', 'https://watclub.co/', 'running', ${products.length},
  0, 0, 0, 'OiWatch authorized full migration v1', now(), now()
)
on conflict (id) do update set
  status = 'running',
  total_items = excluded.total_items,
  notes = excluded.notes,
  started_at = coalesce(import_batches.started_at, now()),
  updated_at = now();

${[...brands.values()].map((brand) => `
insert into public.brands (id, slug, name_en, name_zh, is_active, updated_at)
values (
  md5('oiwatch:watclub:brand:' || ${quote(brand.slug)})::uuid,
  ${quote(brand.slug)}, ${quote(brand.nameEn)}, ${quote(brand.nameZh)}, true, now()
)
on conflict (slug) do update set
  name_en = excluded.name_en,
  name_zh = excluded.name_zh,
  is_active = true,
  updated_at = now();`).join('\n')}
commit;`;
await fs.writeFile(path.join(output, '000-setup.sql'), `${setupSql}\n`);

const productChunkCount = await writeChunks('100-products', products, 15, (chunk) => {
  const statements = chunk.map((product) => {
    const sourceId = String(product.sourceId);
    const brand = splitBrand(product.categories?.[0]);
    const media = normalizedMedia(product);
    const productId = productUuid(sourceId);
    const sourceData = {
      sourcePublishedAt: product.sourcePublishedAt,
      categories: product.categories || [],
      tags: product.tags || [],
      coverUrl: product.coverUrl,
      originalStatus: product.status,
    };
    const translations = {
      en: {
        name: product.title || '',
        description: product.description || '',
      },
      source: 'watclub',
      sourceUrl: product.sourceUrl,
    };
    return `
insert into public.products (
  id, brand_id, slug, sku, name_zh, price, currency, status,
  source_platform, source_id, source_url, imported_at, import_batch_id,
  source_data, updated_at
) values (
  ${productId},
  md5('oiwatch:watclub:brand:' || ${quote(brand.slug)})::uuid,
  ${quote(product.slug)}, ${quote(`WAT-${sourceId}`)}, ${quote(product.title || '')},
  0, 'USD', 'draft', 'watclub', ${quote(sourceId)}, ${quote(product.sourceUrl)},
  now(), ${batchIdSql}, ${sqlJson(sourceData)}, now()
)
on conflict (source_platform, source_id) where source_platform is not null and source_id is not null
do update set
  brand_id = excluded.brand_id,
  slug = excluded.slug,
  sku = excluded.sku,
  name_zh = excluded.name_zh,
  source_url = excluded.source_url,
  imported_at = now(),
  import_batch_id = excluded.import_batch_id,
  source_data = excluded.source_data,
  updated_at = now();

insert into public.product_translations (
  id, product_id, locale, name, short_description, description,
  seo_title, seo_description, updated_at
) values (
  md5('oiwatch:watclub:translation:' || ${quote(sourceId)} || ':en')::uuid,
  ${productId}, 'en', ${quote(product.title || '')},
  ${quote((product.description || '').slice(0, 300))},
  ${quote(product.descriptionHtml || product.description || '')},
  ${quote(product.title || '')},
  ${quote((product.description || '').slice(0, 300))}, now()
)
on conflict (product_id, locale) do update set
  name = excluded.name,
  short_description = excluded.short_description,
  description = excluded.description,
  seo_title = excluded.seo_title,
  seo_description = excluded.seo_description,
  updated_at = now();

insert into public.import_items (
  id, batch_id, product_id, source_id, source_url, source_title, status,
  media_total, media_processed, source_data, updated_at
) values (
  md5('oiwatch:watclub:import-item:' || ${quote(sourceId)})::uuid,
  ${batchIdSql}, ${productId}, ${quote(sourceId)}, ${quote(product.sourceUrl)},
  ${quote(product.title || '')}, 'completed', ${media.length}, ${media.length},
  ${sqlJson(sourceData)}, now()
)
on conflict (id) do update set
  product_id = excluded.product_id,
  source_title = excluded.source_title,
  status = excluded.status,
  media_total = excluded.media_total,
  media_processed = excluded.media_processed,
  source_data = excluded.source_data,
  updated_at = now();

insert into public.store_products (
  id, name_zh, name_en, description_zh, brand_en, brand_zh, price, stock,
  status, translations, media, updated_at
) values (
  ${quote(`watclub-${sourceId}`)}, ${quote(product.title || '')},
  ${quote(product.title || '')}, ${quote(product.description || '')},
  ${quote(brand.nameEn)}, ${quote(brand.nameZh)}, 0, 99, 'draft',
  ${sqlJson(translations)}, ${sqlJson(media)}, now()
)
on conflict (id) do update set
  name_zh = excluded.name_zh,
  name_en = excluded.name_en,
  description_zh = excluded.description_zh,
  brand_en = excluded.brand_en,
  brand_zh = excluded.brand_zh,
  translations = excluded.translations,
  media = excluded.media,
  updated_at = now();`;
  });
  return `begin;\n${statements.join('\n')}\ncommit;`;
});

const allMedia = products.flatMap((product) =>
  normalizedMedia(product).map((media) => ({ product, media })),
);
const mediaChunkCount = await writeChunks('200-media', allMedia, 120, (chunk) => {
  const statements = chunk.map(({ product, media }) => `
insert into public.product_media (
  id, product_id, media_type, url, alt_text, sort_order, is_cover,
  source_url, storage_provider, storage_path, mime_type, processing_status,
  source_data
) values (
  ${mediaUuid(product.sourceId, media.position, media.sourceUrl)},
  ${productUuid(product.sourceId)}, ${quote(media.type)}, ${quote(media.url)},
  ${quote(product.title || '')}, ${media.position}, ${media.position === 0},
  ${quote(media.sourceUrl)}, 'cloudflare_r2', ${quote(media.objectKey)},
  ${quote(media.contentType)}, 'completed',
  ${sqlJson({ importedFrom: 'watclub' })}
)
on conflict (id) do update set
  url = excluded.url,
  alt_text = excluded.alt_text,
  sort_order = excluded.sort_order,
  is_cover = excluded.is_cover,
  source_url = excluded.source_url,
  storage_provider = excluded.storage_provider,
  storage_path = excluded.storage_path,
  mime_type = excluded.mime_type,
  processing_status = 'completed';`);
  return `begin;\n${statements.join('\n')}\ncommit;`;
});

const finishSql = `
begin;
update public.import_batches
set status = 'completed',
    processed_items = ${products.length},
    successful_items = ${products.length},
    failed_items = 0,
    completed_at = now(),
    updated_at = now()
where id = ${batchIdSql};
commit;

select
  (select count(*) from public.products where source_platform = 'watclub') as products,
  (select count(*) from public.product_media pm join public.products p on p.id = pm.product_id where p.source_platform = 'watclub') as media,
  (select count(*) from public.store_products where id like 'watclub-%') as storefront_products;`;
await fs.writeFile(path.join(output, '999-finish.sql'), `${finishSql}\n`);

console.log(JSON.stringify({
  products: products.length,
  brands: brands.size,
  media: allMedia.length,
  productChunks: productChunkCount,
  mediaChunks: mediaChunkCount,
  output,
}, null, 2));
