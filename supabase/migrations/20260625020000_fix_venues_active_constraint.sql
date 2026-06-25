-- The original venues_active_requires_approval_and_billing constraint referenced
-- approval_status which was dropped in 20260624010000. Drop the stale constraint
-- and replace it with one that only checks billing_status and stripe_customer_id.
alter table public.venues
  drop constraint if exists venues_active_requires_approval_and_billing;

alter table public.venues
  add constraint venues_active_requires_billing check (
    active = false
    or (
      billing_status in ('trialing', 'active')
      and stripe_customer_id is not null
    )
  );
