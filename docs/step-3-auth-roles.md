# Step 3: Auth And Roles

This step adds the Supabase Auth foundation and role checks. It does not add venue signup billing or Stripe Checkout yet.

## Added

- Supabase SSR browser and server clients.
- Next.js `src/proxy.ts` for Supabase session refresh.
- Email and password login route.
- Supabase auth callback route.
- Server-side route guards for platform admin and venue roles.
- RLS helper functions and policies for profiles, venues, staff, slots, tickets, scans, and audit logs.

## Supabase Keys

- Use `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY` for browser and user-session server clients.
- Use `SUPABASE_SECRET_KEY` only for privileged backend operations such as Stripe webhooks or internal admin jobs.
- Do not use legacy `NEXT_PUBLIC_SUPABASE_ANON_KEY` or `SUPABASE_SERVICE_ROLE_KEY` for new setup unless we intentionally need a temporary migration fallback.

## Role Model

- `guest`: default app user role in `profiles`.
- `venue staff`: row in `venue_staff` with `role = 'staff'`.
- `venue manager`: row in `venue_staff` with `role = 'manager'`.
- `platform admin`: `profiles.role = 'platform_admin'`.

## Guest Check-In Identity

Public cloakroom guests are not automatically created as password-auth users.
Guest check-in creates or updates a `guest_contacts` record and creates a pending ticket.
If guests need a reusable account later, we can add an optional account creation flow and link previous tickets by email.

## Guarded Routes

- Platform admin: `/masterdashboard`, `/analytics`.
- Venue staff/manager: `/venuedashboard`, `/venuescanner`, `/venueanalytics`, `/venueticketdetail`.
- Venue manager only: `/venuesettings`, `/smsbackup`.

## Still Required

- Apply migrations to a real Supabase project.
- Add a temporary `SUPABASE_DB_URL` in `.env.local` when applying migrations from this machine.
- Configure Supabase Auth password policy and allowed redirect URLs.
- Create the first platform admin profile.
- Step 4 connects venue signup to Supabase with sample billing until payment integration is approved.
