-- OiWatch payment data hardening.
-- Run once in the Supabase SQL editor before enabling hosted payment verification.

begin;

alter table if exists public.orders enable row level security;
alter table if exists public.payment_orders enable row level security;

revoke all on table public.orders from anon;
revoke all on table public.payment_orders from anon;
revoke all on table public.orders from authenticated;
revoke all on table public.payment_orders from authenticated;

do $$
declare
  policy_row record;
begin
  for policy_row in
    select schemaname, tablename, policyname
    from pg_policies
    where schemaname = 'public'
      and tablename in ('orders', 'payment_orders')
  loop
    execute format('drop policy if exists %I on %I.%I', policy_row.policyname, policy_row.schemaname, policy_row.tablename);
  end loop;
end
$$;

-- Admin users may read operational data in the existing authenticated admin UI.
create policy "Admins read orders"
on public.orders for select
to authenticated
using (public.is_admin());

create policy "Admins read payment orders"
on public.payment_orders for select
to authenticated
using (public.is_admin());

grant select on table public.orders to authenticated;
grant select on table public.payment_orders to authenticated;

commit;
