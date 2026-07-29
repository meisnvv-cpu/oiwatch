-- OiWatch catalogue search and brand-normalisation migration.
-- Run once in the Supabase SQL editor after backing up the project.

begin;

alter table public.store_products
  add column if not exists tags text[] not null default '{}'::text[];

-- Keep product names and the current brand labels searchable even for records
-- created before the tags column existed.
update public.store_products as sp
set tags = array(
      select distinct trim(tag)
      from unnest(
        coalesce(sp.tags, '{}'::text[])
        || array[sp.brand_en, sp.brand_zh, sp.name_en, sp.name_zh]
      ) as tag
      where trim(coalesce(tag, '')) <> ''
    ),
    updated_at = now();

-- The Watclub import stores its original WordPress tags/categories in
-- products.source_data. Read them when that legacy table is present, without
-- making a new installation depend on it.
do $$
begin
  if exists (
    select 1
    from information_schema.columns
    where table_schema = 'public' and table_name = 'products' and column_name = 'source_id'
  ) and exists (
    select 1
    from information_schema.columns
    where table_schema = 'public' and table_name = 'products' and column_name = 'source_data'
  ) then
    execute $sql$
      update public.store_products as sp
      set tags = array(
            select distinct trim(tag)
            from unnest(
              coalesce(sp.tags, '{}'::text[])
              || coalesce(array(
                select item.value ->> 'name'
                from jsonb_array_elements(coalesce(p.source_data -> 'tags', '[]'::jsonb)) as item(value)
              ), '{}'::text[])
              || coalesce(array(
                select item.value ->> 'slug'
                from jsonb_array_elements(coalesce(p.source_data -> 'tags', '[]'::jsonb)) as item(value)
              ), '{}'::text[])
              || coalesce(array(
                select item.value ->> 'name'
                from jsonb_array_elements(coalesce(p.source_data -> 'categories', '[]'::jsonb)) as item(value)
              ), '{}'::text[])
            ) as tag
            where trim(coalesce(tag, '')) <> ''
          ),
          updated_at = now()
      from public.products as p
      where sp.id = concat('watclub-', p.source_id)
    $sql$;
  end if;
end
$$;

create or replace function public.oiwatch_brand_from_text(value text)
returns jsonb
language sql
immutable
as $$
  select case
    when coalesce(value, '') ~* '(rolex|劳力士|勞力士|daytona|cosmograph|date\s*just|gmt[ -]?master|day[ -]?date|submariner|yacht[ -]?master|oyster perpetual|explorer|air[ -]?king|milgauss|sea[ -]?dweller|sky[ -]?dweller|land[ -]?dweller|cellini|迪通拿|日志|日誌|格林尼治|潜航者|潛航者|游艇|遊艇)'
      then jsonb_build_object('en', 'Rolex', 'zh', '劳力士')
    when coalesce(value, '') ~* '(patek|百达翡丽|百達翡麗|nautilus|aquanaut|calatrava|cubitus)'
      then jsonb_build_object('en', 'Patek Philippe', 'zh', '百达翡丽')
    when coalesce(value, '') ~* '(audemars|爱彼|愛彼|royal oak|code 11\.59|offshore)'
      then jsonb_build_object('en', 'Audemars Piguet', 'zh', '爱彼')
    when coalesce(value, '') ~* '(vacheron|江诗丹顿|江詩丹頓|overseas|patrimony|traditionnelle)'
      then jsonb_build_object('en', 'Vacheron Constantin', 'zh', '江诗丹顿')
    when coalesce(value, '') ~* '(richard mille|理查德.?米勒|理查米尔|理查米爾|\mrm[ -]?[0-9])'
      then jsonb_build_object('en', 'Richard Mille', 'zh', '理查德米勒')
    when coalesce(value, '') ~* '(cartier|卡地亚|卡地亞|santos|ballon bleu|panth.re|\mtank\M)'
      then jsonb_build_object('en', 'Cartier', 'zh', '卡地亚')
    when coalesce(value, '') ~* '(omega|欧米茄|歐米茄|speedmaster|seamaster|constellation|de ville|planet ocean|aqua terra)'
      then jsonb_build_object('en', 'Omega', 'zh', '欧米茄')
    when coalesce(value, '') ~* '(\miwc\M|万国|萬國|portugieser|portuguese|ingenieur|portofino|big pilot)'
      then jsonb_build_object('en', 'IWC Schaffhausen', 'zh', '万国表')
    when coalesce(value, '') ~* '(a\.?(\s*)lange|朗格|lange 1|saxonia|odysseus|zeitwerk)'
      then jsonb_build_object('en', 'A. Lange & Söhne', 'zh', '朗格')
    when coalesce(value, '') ~* '(jaeger|\mjlc\M|积家|積家|reverso|master ultra thin|master control|polaris)'
      then jsonb_build_object('en', 'Jaeger-LeCoultre', 'zh', '积家')
    when coalesce(value, '') ~* '(breguet|宝玑|寶璣)'
      then jsonb_build_object('en', 'Breguet', 'zh', '宝玑')
    when coalesce(value, '') ~* '(blancpain|宝珀|寶珀|fifty fathoms|villeret)'
      then jsonb_build_object('en', 'Blancpain', 'zh', '宝珀')
    when coalesce(value, '') ~* '(hublot|宇舶|big bang|classic fusion)'
      then jsonb_build_object('en', 'Hublot', 'zh', '宇舶')
    when coalesce(value, '') ~* '(panerai|沛纳海|沛納海|luminor|submersible|radiomir|\mpam[0-9])'
      then jsonb_build_object('en', 'Panerai', 'zh', '沛纳海')
    when coalesce(value, '') ~* '(piaget|伯爵|altiplano|limelight gala)'
      then jsonb_build_object('en', 'Piaget', 'zh', '伯爵')
    when coalesce(value, '') ~* '(chopard|萧邦|蕭邦|alpine eagle|mille miglia)'
      then jsonb_build_object('en', 'Chopard', 'zh', '萧邦')
    when coalesce(value, '') ~* '(girard[ -]?perregaux|芝柏|laureato)'
      then jsonb_build_object('en', 'Girard-Perregaux', 'zh', '芝柏')
    when coalesce(value, '') ~* '(ulysse nardin|雅典|\mfreak\M|\mblast\M)'
      then jsonb_build_object('en', 'Ulysse Nardin', 'zh', '雅典表')
    when coalesce(value, '') ~* '(zenith|真力时|真力時|chronomaster|el primero)'
      then jsonb_build_object('en', 'Zenith', 'zh', '真力时')
    when coalesce(value, '') ~* '(breitling|百年灵|百年靈|navitimer|superocean|chronomat)'
      then jsonb_build_object('en', 'Breitling', 'zh', '百年灵')
    when coalesce(value, '') ~* '(tudor|帝舵|black bay|pelagos)'
      then jsonb_build_object('en', 'Tudor', 'zh', '帝舵')
    when coalesce(value, '') ~* '(tag heuer|泰格豪雅|卡莱拉|卡萊拉|aquaracer|formula 1|\mmonaco\M)'
      then jsonb_build_object('en', 'TAG Heuer', 'zh', '泰格豪雅')
    when coalesce(value, '') ~* '(grand seiko|冠蓝狮|冠藍獅|evolution 9)'
      then jsonb_build_object('en', 'Grand Seiko', 'zh', '冠蓝狮')
    when coalesce(value, '') ~* '(glash.tt?e original|格拉苏蒂|格拉蘇蒂|\mseaq\M)'
      then jsonb_build_object('en', 'Glashütte Original', 'zh', '格拉苏蒂原创')
    when coalesce(value, '') ~* '(parmigiani|帕玛强尼|帕瑪強尼|tonda pf)'
      then jsonb_build_object('en', 'Parmigiani Fleurier', 'zh', '帕玛强尼')
    when coalesce(value, '') ~* '(h\.?(\s*)moser|亨利慕时|亨利慕時|streamliner|endeavour)'
      then jsonb_build_object('en', 'H. Moser & Cie.', 'zh', '亨利慕时')
    when coalesce(value, '') ~* '(f\.?(\s*)p\.?(\s*)journe|儒纳|儒納|chronom.tre souverain)'
      then jsonb_build_object('en', 'F.P. Journe', 'zh', 'FP儒纳')
    when coalesce(value, '') ~* '(roger dubuis|罗杰杜彼|羅傑杜彼|excalibur)'
      then jsonb_build_object('en', 'Roger Dubuis', 'zh', '罗杰杜彼')
    when coalesce(value, '') ~* '(jacob(\s+and|\s*&)?\s*co|杰克宝|捷克豹|astronomia|epic x)'
      then jsonb_build_object('en', 'Jacob & Co.', 'zh', '杰克宝')
    when coalesce(value, '') ~* '(bovet|播威|r.cital|virtuoso)'
      then jsonb_build_object('en', 'Bovet', 'zh', '播威')
    when coalesce(value, '') ~* '(bell\s*&?\s*ross|柏莱士|柏萊士|\mbr[ -]?(0[135]|x5))'
      then jsonb_build_object('en', 'Bell & Ross', 'zh', '柏莱士')
    when coalesce(value, '') ~* '(herm.s|爱马仕|愛馬仕|arceau|cape cod)'
      then jsonb_build_object('en', 'Hermès', 'zh', '爱马仕')
    when coalesce(value, '') ~* '(bulgari|bvlgari|宝格丽|寶格麗|\mocto\M|serpenti)'
      then jsonb_build_object('en', 'Bulgari', 'zh', '宝格丽')
    when coalesce(value, '') ~* '(montblanc|万宝龙|萬寶龍|star legacy|boh.me)'
      then jsonb_build_object('en', 'Montblanc', 'zh', '万宝龙')
    when coalesce(value, '') ~* '(baume\s*&?\s*mercier|名士|riviera|clifton)'
      then jsonb_build_object('en', 'Baume & Mercier', 'zh', '名士表')
    when coalesce(value, '') ~* '(longines|浪琴|dolcevita|\mconquest\M)'
      then jsonb_build_object('en', 'Longines', 'zh', '浪琴')
    when coalesce(value, '') ~* '(\moris\M|豪利时|豪利時|\maquis\M|propilot)'
      then jsonb_build_object('en', 'Oris', 'zh', '豪利时')
    when coalesce(value, '') ~* '(\mnomos\M|诺莫斯|諾莫斯|tangente|\mludwig\M)'
      then jsonb_build_object('en', 'NOMOS Glashütte', 'zh', '诺莫斯')
    when coalesce(value, '') ~* '(frederique constant|康斯登|highlife|slimline)'
      then jsonb_build_object('en', 'Frederique Constant', 'zh', '康斯登')
    when coalesce(value, '') ~* '(carl f\.?(\s*)bucherer|宝齐莱|寶齊萊|manero|patravi)'
      then jsonb_build_object('en', 'Carl F. Bucherer', 'zh', '宝齐莱')
    when coalesce(value, '') ~* '(franck muller|法穆兰|法穆蘭|法兰克穆勒|法蘭克穆勒|crazy hours)'
      then jsonb_build_object('en', 'Franck Muller', 'zh', '法穆兰')
    else null
  end;
$$;

with normalized as (
  select
    id,
    public.oiwatch_brand_from_text(
      concat_ws(' ', brand_en, brand_zh, name_en, name_zh, array_to_string(tags, ' '))
    ) as brand
  from public.store_products
)
update public.store_products as sp
set brand_en = normalized.brand ->> 'en',
    brand_zh = normalized.brand ->> 'zh',
    updated_at = now()
from normalized
where normalized.id = sp.id
  and normalized.brand is not null
  and (sp.brand_en, sp.brand_zh) is distinct from (normalized.brand ->> 'en', normalized.brand ->> 'zh');

create index if not exists store_products_status_brand_updated_idx
  on public.store_products (status, brand_en, updated_at desc);

create index if not exists store_products_tags_idx
  on public.store_products using gin (tags);

-- New view name avoids changing or dropping any existing production view.
-- security_invoker keeps the table's existing RLS policy in force.
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
    array_to_string(sp.tags, ' '),
    sp.translations::text
  )) as search_text
from public.store_products as sp;

grant select on public.store_product_search_catalog to anon, authenticated;

notify pgrst, 'reload schema';

commit;
