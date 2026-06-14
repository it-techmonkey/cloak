-- ───────────────────────────────────────────────────────────────────────────
-- Events: date-bound nights a venue runs. Tickets may optionally belong to one.
-- ───────────────────────────────────────────────────────────────────────────
create table if not exists public.events (
  id uuid primary key default gen_random_uuid(),
  venue_id uuid not null references public.venues(id) on delete cascade,
  name text not null,
  event_date date not null,
  starts_at timestamptz,
  ends_at timestamptz,
  active boolean not null default true,
  created_at timestamptz not null default now()
);

create index if not exists events_venue_date_idx
  on public.events (venue_id, event_date desc);

alter table public.tickets
  add column if not exists event_id uuid references public.events(id) on delete set null;

create index if not exists tickets_event_idx
  on public.tickets (event_id);

-- ───────────────────────────────────────────────────────────────────────────
-- Ticket items: one row per stored item, each independently collectable.
-- A ticket is fully collected only when every item row has collected_at set.
-- The legacy tickets.item_* columns are retained for old tickets and QR/wallet
-- rendering, but new activations write item rows here as the source of truth.
-- ───────────────────────────────────────────────────────────────────────────
create table if not exists public.ticket_items (
  id uuid primary key default gen_random_uuid(),
  ticket_id uuid not null references public.tickets(id) on delete cascade,
  label text not null,
  quantity integer not null default 1 check (quantity between 1 and 99),
  notes text,
  collected_at timestamptz,
  collected_by uuid references public.profiles(id) on delete set null,
  added_at timestamptz not null default now(),
  added_by uuid references public.profiles(id) on delete set null
);

create index if not exists ticket_items_ticket_idx
  on public.ticket_items (ticket_id);

create index if not exists ticket_items_open_idx
  on public.ticket_items (ticket_id)
  where collected_at is null;

-- ───────────────────────────────────────────────────────────────────────────
-- Row level security
-- ───────────────────────────────────────────────────────────────────────────
alter table public.events enable row level security;
alter table public.ticket_items enable row level security;

-- Events: publicly readable for active venues (guests pick one at check-in),
-- and fully visible to the venue's own staff and admins.
drop policy if exists "events_select_visible_or_staff" on public.events;
create policy "events_select_visible_or_staff"
on public.events
for select
to authenticated, anon
using (
  active = true
  or public.is_venue_staff(venue_id)
  or public.is_platform_admin()
);

drop policy if exists "events_manage_manager_or_admin" on public.events;
create policy "events_manage_manager_or_admin"
on public.events
for all
to authenticated
using (public.is_venue_staff(venue_id, array['manager']::public.venue_staff_role[]) or public.is_platform_admin())
with check (public.is_venue_staff(venue_id, array['manager']::public.venue_staff_role[]) or public.is_platform_admin());

-- Ticket items inherit access from their parent ticket.
drop policy if exists "ticket_items_select_via_ticket" on public.ticket_items;
create policy "ticket_items_select_via_ticket"
on public.ticket_items
for select
to authenticated
using (
  exists (
    select 1
    from public.tickets t
    where t.id = ticket_items.ticket_id
      and (
        t.guest_profile_id = auth.uid()
        or public.is_venue_staff(t.venue_id)
        or public.is_platform_admin()
      )
  )
);

drop policy if exists "ticket_items_manage_staff_or_admin" on public.ticket_items;
create policy "ticket_items_manage_staff_or_admin"
on public.ticket_items
for all
to authenticated
using (
  exists (
    select 1
    from public.tickets t
    where t.id = ticket_items.ticket_id
      and (public.is_venue_staff(t.venue_id) or public.is_platform_admin())
  )
)
with check (
  exists (
    select 1
    from public.tickets t
    where t.id = ticket_items.ticket_id
      and (public.is_venue_staff(t.venue_id) or public.is_platform_admin())
  )
);
