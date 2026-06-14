-- Per-venue ticket expiry. null = passes never expire (until activated/cancelled).
alter table public.venues
  add column if not exists ticket_expiry_hours integer;

-- Leads captured from the "register interest" marketing form.
create table if not exists public.leads (
  id uuid primary key default gen_random_uuid(),
  venue_name text not null,
  contact_name text not null,
  contact_email text not null,
  capacity_estimate text,
  message text,
  created_at timestamptz not null default now()
);

alter table public.leads enable row level security;

-- Only platform admins may read leads. Inserts happen via the service-role
-- admin client (which bypasses RLS), so no public insert policy is exposed.
drop policy if exists "leads_select_admin" on public.leads;
create policy "leads_select_admin"
on public.leads
for select
to authenticated
using (public.is_platform_admin());
