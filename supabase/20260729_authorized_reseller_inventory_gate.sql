-- OiWatch authorised-reseller inventory gate.
--
-- The legacy Watclub import contains replica/factory language and must not be
-- presented as authorised-reseller merchandise. This migration preserves all
-- records and media for review while removing unverified items from the public
-- catalogue. Publish an item again only after its supply basis and exact
-- product details have been checked.

begin;

alter table public.store_products
  add column if not exists source_verified boolean not null default false,
  add column if not exists source_evidence_note text not null default '',
  add column if not exists source_verified_at timestamptz,
  add column if not exists source_verified_by uuid references auth.users(id);

update public.store_products
set status = 'draft',
    source_verified = false,
    source_evidence_note = case
      when source_evidence_note = '' then 'Legacy import retained for provenance review; not approved for authorised-reseller publication.'
      else source_evidence_note
    end,
    updated_at = now()
where id like 'watclub-%'
  and (
    status = 'published'
    or concat_ws(' ', name_en, name_zh, description_zh, brand_en, brand_zh, translations::text, tags::text)
      ~* '(replica|super[[:space:]]*clone|clone|aaa|vsf|apsf?|ppf|clean|zf|qf|twf|factory|复刻|仿表|克隆|工厂|厂新品)'
  );

-- Pre-migration installations may contain non-legacy rows that were published
-- before supply verification existed. Keep them as drafts until reviewed.
update public.store_products
set status = 'draft',
    updated_at = now()
where status = 'published'
  and not source_verified;

-- Existing non-legacy records remain unchanged, but all future public reads
-- require both publication and a verified supply basis.
drop policy if exists "Published products are public" on public.store_products;
create policy "Verified published products are public"
on public.store_products for select
using ((status = 'published' and source_verified) or public.is_admin());

create or replace view public.store_product_search_catalog
with (security_invoker = true)
as
select
  sp.*,
  coalesce(jsonb_array_length(sp.media), 0) as media_count,
  trim(concat_ws(
    ' ',
    sp.id,
    sp.brand_en,
    sp.brand_zh,
    sp.name_en,
    sp.name_zh,
    sp.description_zh,
    sp.tags::text,
    sp.translations::text
  )) as search_text
from public.store_products as sp
where sp.source_verified;

grant select on public.store_product_search_catalog to anon, authenticated;

notify pgrst, 'reload schema';

commit;
