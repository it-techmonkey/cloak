create extension if not exists pgcrypto;

do $$
begin
  create type public.profile_role as enum ('guest', 'platform_admin');
exception
  when duplicate_object then null;
end $$;

do $$
begin
  create type public.venue_approval_status as enum ('pending', 'approved', 'rejected', 'suspended');
exception
  when duplicate_object then null;
end $$;

do $$
begin
  create type public.billing_status as enum (
    'not_started',
    'incomplete',
    'trialing',
    'active',
    'past_due',
    'canceled',
    'unpaid'
  );
exception
  when duplicate_object then null;
end $$;

do $$
begin
  create type public.billing_plan as enum ('starter', 'professional', 'per_event');
exception
  when duplicate_object then null;
end $$;

do $$
begin
  create type public.venue_staff_role as enum ('staff', 'manager');
exception
  when duplicate_object then null;
end $$;

do $$
begin
  create type public.slot_status as enum ('available', 'occupied', 'blocked');
exception
  when duplicate_object then null;
end $$;

do $$
begin
  create type public.ticket_status as enum (
    'pending_activation',
    'active',
    'collected',
    'cancelled',
    'expired'
  );
exception
  when duplicate_object then null;
end $$;

do $$
begin
  create type public.scan_type as enum ('activation', 'checkout', 'rejected');
exception
  when duplicate_object then null;
end $$;

do $$
begin
  create type public.scan_result as enum ('accepted', 'rejected');
exception
  when duplicate_object then null;
end $$;

create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  email text not null,
  full_name text,
  phone text,
  role public.profile_role not null default 'guest',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.venues (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  slug text not null unique,
  address text,
  city text,
  country text,
  contact_email text not null,
  contact_phone text,
  capacity integer not null default 0 check (capacity >= 0),
  approval_status public.venue_approval_status not null default 'pending',
  active boolean not null default false,
  created_by uuid references public.profiles(id) on delete set null,
  approved_by uuid references public.profiles(id) on delete set null,
  approved_at timestamptz,
  rejection_reason text,
  stripe_customer_id text unique,
  stripe_subscription_id text unique,
  stripe_price_id text,
  billing_status public.billing_status not null default 'not_started',
  billing_plan public.billing_plan,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint venues_active_requires_approval_and_billing check (
    active = false
    or (
      approval_status = 'approved'
      and billing_status in ('trialing', 'active')
      and stripe_customer_id is not null
    )
  )
);

create table if not exists public.venue_staff (
  id uuid primary key default gen_random_uuid(),
  venue_id uuid not null references public.venues(id) on delete cascade,
  profile_id uuid references public.profiles(id) on delete cascade,
  invited_email text,
  role public.venue_staff_role not null default 'staff',
  accepted_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint venue_staff_has_profile_or_invite check (
    profile_id is not null or invited_email is not null
  )
);

create table if not exists public.venue_slots (
  id uuid primary key default gen_random_uuid(),
  venue_id uuid not null references public.venues(id) on delete cascade,
  label text not null,
  status public.slot_status not null default 'available',
  active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (venue_id, label)
);

create table if not exists public.tickets (
  id uuid primary key default gen_random_uuid(),
  public_code text not null unique,
  venue_id uuid not null references public.venues(id) on delete restrict,
  guest_profile_id uuid references public.profiles(id) on delete set null,
  guest_name text not null,
  guest_email text not null,
  guest_phone text not null,
  status public.ticket_status not null default 'pending_activation',
  qr_token_hash text not null unique,
  assigned_slot_id uuid references public.venue_slots(id) on delete set null,
  expires_at timestamptz not null,
  activated_at timestamptz,
  collected_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint tickets_checkout_requires_activation check (
    collected_at is null or activated_at is not null
  )
);

create table if not exists public.ticket_scans (
  id uuid primary key default gen_random_uuid(),
  ticket_id uuid not null references public.tickets(id) on delete cascade,
  venue_id uuid not null references public.venues(id) on delete restrict,
  scanned_by uuid references public.profiles(id) on delete set null,
  scan_type public.scan_type not null,
  result public.scan_result not null,
  reason text,
  created_at timestamptz not null default now()
);

create table if not exists public.audit_logs (
  id uuid primary key default gen_random_uuid(),
  actor_profile_id uuid references public.profiles(id) on delete set null,
  venue_id uuid references public.venues(id) on delete set null,
  entity_type text not null,
  entity_id uuid,
  action text not null,
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now()
);

create table if not exists public.stripe_events (
  id text primary key,
  event_type text not null,
  processed_at timestamptz not null default now(),
  payload jsonb not null
);

create index if not exists profiles_email_idx on public.profiles (email);
create index if not exists venues_status_billing_idx on public.venues (approval_status, billing_status, active);
create index if not exists venues_slug_idx on public.venues (slug);
create index if not exists venue_staff_profile_idx on public.venue_staff (profile_id);
create index if not exists venue_staff_venue_idx on public.venue_staff (venue_id);
create unique index if not exists venue_staff_unique_profile_idx
  on public.venue_staff (venue_id, profile_id)
  where profile_id is not null;
create unique index if not exists venue_staff_unique_invite_idx
  on public.venue_staff (venue_id, lower(invited_email))
  where invited_email is not null;
create index if not exists venue_slots_status_idx on public.venue_slots (venue_id, status, active);
create index if not exists tickets_venue_status_idx on public.tickets (venue_id, status, created_at desc);
create index if not exists tickets_guest_email_idx on public.tickets (guest_email);
create index if not exists ticket_scans_ticket_idx on public.ticket_scans (ticket_id, created_at desc);
create index if not exists audit_logs_venue_idx on public.audit_logs (venue_id, created_at desc);

drop trigger if exists profiles_set_updated_at on public.profiles;
create trigger profiles_set_updated_at
before update on public.profiles
for each row execute function public.set_updated_at();

drop trigger if exists venues_set_updated_at on public.venues;
create trigger venues_set_updated_at
before update on public.venues
for each row execute function public.set_updated_at();

drop trigger if exists venue_staff_set_updated_at on public.venue_staff;
create trigger venue_staff_set_updated_at
before update on public.venue_staff
for each row execute function public.set_updated_at();

drop trigger if exists venue_slots_set_updated_at on public.venue_slots;
create trigger venue_slots_set_updated_at
before update on public.venue_slots
for each row execute function public.set_updated_at();

drop trigger if exists tickets_set_updated_at on public.tickets;
create trigger tickets_set_updated_at
before update on public.tickets
for each row execute function public.set_updated_at();

alter table public.profiles enable row level security;
alter table public.venues enable row level security;
alter table public.venue_staff enable row level security;
alter table public.venue_slots enable row level security;
alter table public.tickets enable row level security;
alter table public.ticket_scans enable row level security;
alter table public.audit_logs enable row level security;
alter table public.stripe_events enable row level security;
