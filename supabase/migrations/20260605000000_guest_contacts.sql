create table if not exists public.guest_contacts (
  id uuid primary key default gen_random_uuid(),
  email text not null,
  email_normalized text not null unique,
  full_name text not null,
  phone text not null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.tickets
add column if not exists guest_contact_id uuid references public.guest_contacts(id) on delete set null;

create index if not exists guest_contacts_email_normalized_idx
  on public.guest_contacts (email_normalized);

create index if not exists tickets_guest_contact_idx
  on public.tickets (guest_contact_id);

drop trigger if exists guest_contacts_set_updated_at on public.guest_contacts;
create trigger guest_contacts_set_updated_at
before update on public.guest_contacts
for each row execute function public.set_updated_at();

alter table public.guest_contacts enable row level security;

drop policy if exists "guest_contacts_select_admin" on public.guest_contacts;
create policy "guest_contacts_select_admin"
on public.guest_contacts
for select
to authenticated
using (public.is_platform_admin());

drop policy if exists "guest_contacts_update_admin" on public.guest_contacts;
create policy "guest_contacts_update_admin"
on public.guest_contacts
for update
to authenticated
using (public.is_platform_admin())
with check (public.is_platform_admin());
