begin;

create table if not exists public.store_products (
  id text primary key,
  name_zh text not null,
  name_en text not null default '',
  description_zh text not null,
  brand_en text not null,
  brand_zh text not null,
  price numeric(12, 2) not null default 0 check (price >= 0),
  stock integer not null default 0 check (stock >= 0),
  status text not null default 'draft' check (status in ('draft', 'published')),
  translations jsonb not null default '{}'::jsonb,
  media jsonb not null default '[]'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.store_products enable row level security;

drop policy if exists "Published products are public" on public.store_products;
create policy "Published products are public"
on public.store_products for select
using (status = 'published' or public.is_admin());

drop policy if exists "Admins manage store products" on public.store_products;
create policy "Admins manage store products"
on public.store_products for all
to authenticated
using (public.is_admin())
with check (public.is_admin());

grant select on public.store_products to anon, authenticated;
grant insert, update, delete on public.store_products to authenticated;

create index if not exists store_products_status_updated_idx
on public.store_products (status, updated_at desc);

commit;
