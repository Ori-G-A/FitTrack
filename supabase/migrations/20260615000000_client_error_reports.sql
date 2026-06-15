create table if not exists public.client_error_reports (
  id uuid primary key default gen_random_uuid(),
  created_at timestamptz not null default now(),
  user_id uuid not null default auth.uid(),
  kind text not null check (char_length(kind) between 1 and 40),
  message text not null check (char_length(message) between 1 and 500),
  stack text not null default '' check (char_length(stack) <= 4000),
  component_stack text not null default '' check (char_length(component_stack) <= 4000),
  path text not null default '' check (char_length(path) <= 300),
  user_agent text not null default '' check (char_length(user_agent) <= 500),
  release text not null default 'unknown' check (char_length(release) <= 100)
);

create index if not exists client_error_reports_created_at_idx
on public.client_error_reports (created_at desc);

alter table public.client_error_reports enable row level security;

do $$
declare
  existing_policy record;
begin
  for existing_policy in
    select policyname
    from pg_policies
    where schemaname = 'public' and tablename = 'client_error_reports'
  loop
    execute format(
      'drop policy %I on public.client_error_reports',
      existing_policy.policyname
    );
  end loop;
end
$$;

revoke all on table public.client_error_reports from anon, authenticated;
grant insert on table public.client_error_reports to authenticated;

create policy "client_error_reports_insert_own"
on public.client_error_reports
for insert
to authenticated
with check ((select auth.uid()) = user_id);
