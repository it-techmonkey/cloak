-- Remove approval flow columns and update RLS policies.
-- Venues are now created immediately as active. No separate approval_status.

-- First, update the RLS policy to remove approval_status dependency
drop policy if exists "venues_select_visible_or_authorized" on public.venues;
create policy "venues_select_visible_or_authorized"
  on public.venues
  for select
  using (active = true and billing_status in ('trialing', 'active'));

-- Drop the trigger and function that referenced approval_status
drop trigger if exists venues_prevent_duplicate_pending_venue_submission on public.venues;
drop trigger if exists venues_prevent_duplicate_pending_submission on public.venues;
drop function if exists public.prevent_duplicate_pending_venue_submission() cascade;

-- Now drop the approval flow columns
alter table public.venues
  drop column if exists approval_status,
  drop column if exists approved_at,
  drop column if exists approved_by,
  drop column if exists rejection_reason,
  drop column if exists submitted_at;
