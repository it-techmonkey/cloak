# Step 2: Supabase Data Model

This step defines the database foundation only. Auth guards, RLS policies, Stripe Checkout, and webhooks are handled in later steps.

## Core Tables

- `profiles`: application profile linked to `auth.users`.
- `venues`: venue registration, admin approval state, active state, and mandatory Stripe billing fields.
- `venue_staff`: staff and manager access per venue.
- `venue_slots`: storage capacity labels and slot state.
- `tickets`: venue-bound cloakroom tickets and lifecycle timestamps.
- `ticket_scans`: activation, checkout, and rejected scan history.
- `audit_logs`: admin and operational event history.
- `stripe_events`: idempotency store for Stripe webhook processing.

## Venue Activation Rule

A venue can only be marked `active = true` when:

- `approval_status = 'approved'`
- `billing_status` is `trialing` or `active`
- `stripe_customer_id` exists

This is enforced by a database check constraint in the migration.

## Stripe Fields

The `venues` table includes:

- `stripe_customer_id`
- `stripe_subscription_id`
- `stripe_price_id`
- `billing_status`
- `billing_plan`

## Next Step

Step 3 should add Supabase Auth roles and server-side guards, then convert the enabled RLS tables into usable role-based policies.

## Environment Note

Use Supabase's newer API key model:

- `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY` replaces the legacy anon key for public clients.
- `SUPABASE_SECRET_KEY` replaces the legacy service role key for privileged backend-only operations.
