-- Enforce the authorised-reseller publication gate in the database.
-- A public item must have both a verified source flag and a non-empty,
-- non-sensitive evidence summary. Unverified records remain as drafts.

begin;

update public.store_products
set status = 'draft',
    updated_at = now()
where status = 'published'
  and (
    not source_verified
    or btrim(coalesce(source_evidence_note, '')) = ''
  );

alter table public.store_products
  drop constraint if exists store_products_published_source_evidence_check;

alter table public.store_products
  add constraint store_products_published_source_evidence_check
  check (
    status <> 'published'
    or (
      source_verified
      and btrim(source_evidence_note) <> ''
    )
  );

commit;
