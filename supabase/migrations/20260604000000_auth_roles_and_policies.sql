create or replace function public.current_profile_role()
returns public.profile_role
language sql
stable
security definer
set search_path = public
as $$
  select role
  from public.profiles
  where id = auth.uid()
$$;

create or replace function public.is_platform_admin()
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select coalesce(public.current_profile_role() = 'platform_admin', false)
$$;

create or replace function public.is_venue_staff(
  target_venue_id uuid,
  allowed_roles public.venue_staff_role[] default array['staff', 'manager']::public.venue_staff_role[]
)
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1
    from public.venue_staff
    where venue_id = target_venue_id
      and profile_id = auth.uid()
      and accepted_at is not null
      and role = any(allowed_roles)
  )
$$;

drop policy if exists "profiles_select_self_or_admin" on public.profiles;
create policy "profiles_select_self_or_admin"
on public.profiles
for select
to authenticated
using (id = auth.uid() or public.is_platform_admin());

drop policy if exists "profiles_insert_self" on public.profiles;
create policy "profiles_insert_self"
on public.profiles
for insert
to authenticated
with check (id = auth.uid());

drop policy if exists "profiles_update_self_or_admin" on public.profiles;
create policy "profiles_update_self_or_admin"
on public.profiles
for update
to authenticated
using (id = auth.uid() or public.is_platform_admin())
with check (id = auth.uid() or public.is_platform_admin());

drop policy if exists "venues_select_visible_or_authorized" on public.venues;
create policy "venues_select_visible_or_authorized"
on public.venues
for select
to authenticated
using (
  (active = true and approval_status = 'approved' and billing_status in ('trialing', 'active'))
  or public.is_venue_staff(id)
  or public.is_platform_admin()
);

drop policy if exists "venues_insert_authenticated" on public.venues;
create policy "venues_insert_authenticated"
on public.venues
for insert
to authenticated
with check (created_by = auth.uid());

drop policy if exists "venues_update_manager_or_admin" on public.venues;
create policy "venues_update_manager_or_admin"
on public.venues
for update
to authenticated
using (public.is_venue_staff(id, array['manager']::public.venue_staff_role[]) or public.is_platform_admin())
with check (public.is_venue_staff(id, array['manager']::public.venue_staff_role[]) or public.is_platform_admin());

drop policy if exists "venue_staff_select_own_venue_or_admin" on public.venue_staff;
create policy "venue_staff_select_own_venue_or_admin"
on public.venue_staff
for select
to authenticated
using (profile_id = auth.uid() or public.is_venue_staff(venue_id, array['manager']::public.venue_staff_role[]) or public.is_platform_admin());

drop policy if exists "venue_staff_manage_manager_or_admin" on public.venue_staff;
create policy "venue_staff_manage_manager_or_admin"
on public.venue_staff
for all
to authenticated
using (public.is_venue_staff(venue_id, array['manager']::public.venue_staff_role[]) or public.is_platform_admin())
with check (public.is_venue_staff(venue_id, array['manager']::public.venue_staff_role[]) or public.is_platform_admin());

drop policy if exists "venue_slots_select_staff_or_admin" on public.venue_slots;
create policy "venue_slots_select_staff_or_admin"
on public.venue_slots
for select
to authenticated
using (public.is_venue_staff(venue_id) or public.is_platform_admin());

drop policy if exists "venue_slots_manage_manager_or_admin" on public.venue_slots;
create policy "venue_slots_manage_manager_or_admin"
on public.venue_slots
for all
to authenticated
using (public.is_venue_staff(venue_id, array['manager']::public.venue_staff_role[]) or public.is_platform_admin())
with check (public.is_venue_staff(venue_id, array['manager']::public.venue_staff_role[]) or public.is_platform_admin());

drop policy if exists "tickets_select_owner_staff_or_admin" on public.tickets;
create policy "tickets_select_owner_staff_or_admin"
on public.tickets
for select
to authenticated
using (
  guest_profile_id = auth.uid()
  or public.is_venue_staff(venue_id)
  or public.is_platform_admin()
);

drop policy if exists "tickets_insert_authenticated_guest" on public.tickets;
create policy "tickets_insert_authenticated_guest"
on public.tickets
for insert
to authenticated
with check (guest_profile_id = auth.uid());

drop policy if exists "tickets_update_staff_or_admin" on public.tickets;
create policy "tickets_update_staff_or_admin"
on public.tickets
for update
to authenticated
using (public.is_venue_staff(venue_id) or public.is_platform_admin())
with check (public.is_venue_staff(venue_id) or public.is_platform_admin());

drop policy if exists "ticket_scans_select_staff_or_admin" on public.ticket_scans;
create policy "ticket_scans_select_staff_or_admin"
on public.ticket_scans
for select
to authenticated
using (public.is_venue_staff(venue_id) or public.is_platform_admin());

drop policy if exists "ticket_scans_insert_staff_or_admin" on public.ticket_scans;
create policy "ticket_scans_insert_staff_or_admin"
on public.ticket_scans
for insert
to authenticated
with check (public.is_venue_staff(venue_id) or public.is_platform_admin());

drop policy if exists "audit_logs_select_authorized" on public.audit_logs;
create policy "audit_logs_select_authorized"
on public.audit_logs
for select
to authenticated
using (
  public.is_platform_admin()
  or (venue_id is not null and public.is_venue_staff(venue_id, array['manager']::public.venue_staff_role[]))
);

drop policy if exists "audit_logs_insert_authenticated" on public.audit_logs;
create policy "audit_logs_insert_authenticated"
on public.audit_logs
for insert
to authenticated
with check (actor_profile_id = auth.uid() or public.is_platform_admin());
