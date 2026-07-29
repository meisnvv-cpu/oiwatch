# Product Catalogue Search Migration

Run `20260729_product_catalog_search.sql` once in the OiWatch Supabase SQL editor before publishing the related frontend build.

It is additive and preserves product media, prices, orders, and existing product IDs. The migration:

- adds `store_products.tags` for brand, model, reference, and category search;
- backfills tags from the prior Watclub import when its source metadata table is present;
- maps common model-only categories such as Daytona, Datejust, GMT-Master II, Nautilus, and Royal Oak to their canonical brands;
- creates `store_product_search_catalog`, a public RLS-respecting view containing `media_count` and `search_text`.

After it completes, refresh the shop once. The frontend also has a safe fallback for older schemas: it loads the published catalogue and matches normalized Chinese and English text locally, so a missing view or missing `search_text` no longer produces a false zero-result brand filter.

For verification, run the following read-only checks in the SQL editor:

```sql
select brand_en, brand_zh, count(*) as products
from public.store_products
where status = 'published'
group by brand_en, brand_zh
order by products desc, brand_en;

select id, brand_en, name_en, tags
from public.store_product_search_catalog
where search_text ilike '%daytona%'
limit 10;
```

Do not put database passwords, service-role keys, or wallet secrets in this SQL file or in GitHub.
