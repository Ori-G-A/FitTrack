alter table public.app_data enable row level security;

-- Replace any permissive or legacy policies so access is consistently scoped
-- to the authenticated owner of each row.
do $$
declare
  existing_policy record;
begin
  for existing_policy in
    select policyname
    from pg_policies
    where schemaname = 'public' and tablename = 'app_data'
  loop
    execute format(
      'drop policy %I on public.app_data',
      existing_policy.policyname
    );
  end loop;
end
$$;

revoke all on table public.app_data from anon;
grant select, insert, update, delete on table public.app_data to authenticated;

create policy "app_data_select_own"
on public.app_data
for select
to authenticated
using ((select auth.uid()) = user_id);

create policy "app_data_insert_own"
on public.app_data
for insert
to authenticated
with check ((select auth.uid()) = user_id);

create policy "app_data_update_own"
on public.app_data
for update
to authenticated
using ((select auth.uid()) = user_id)
with check ((select auth.uid()) = user_id);

create policy "app_data_delete_own"
on public.app_data
for delete
to authenticated
using ((select auth.uid()) = user_id);
