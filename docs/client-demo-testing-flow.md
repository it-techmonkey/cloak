# Client Demo Testing Flow

Use this guide to verify the functional MVP before showing it to the client and to collect structured feedback during the review.

## 1. Prerequisites

- Supabase environment variables are present in `.env.local`.
- Supabase migrations are applied.
- A platform admin account exists.
- At least one venue can be signed up and approved.
- Use sample billing status for this demo build.
- Test camera scanning from `localhost` or an HTTPS URL.

Run these checks:

```bash
npm run lint
npm run build
node scripts/check-supabase-env.js
```

## 2. Create Platform Admin

Add these values to `.env.local`:

```bash
PLATFORM_ADMIN_EMAIL=admin@example.com
PLATFORM_ADMIN_PASSWORD=choose-a-secure-password
PLATFORM_ADMIN_NAME=Platform Admin
PLATFORM_ADMIN_PHONE=
```

Create or update the admin user:

```bash
node scripts/create-platform-admin.js
```

Expected result:

- Script prints `Platform admin ready: <email>`.
- The user can sign in at `/login`.
- The user can access `/masterdashboard`.

## 2.1 Venue Account Model

Venue signup creates the manager login only when the final registration is submitted.

Current behavior:

- Steps 1 and 2 are saved as a local secure draft only.
- No venue row is created until the final review step is submitted.
- The final review step collects the manager password.
- Final submit creates the manager account, venue submission, and manager venue role.
- Guests cannot select the venue until platform approval.
- Managers can create venue staff accounts from venue settings after login.

## 3. Start The App

```bash
npm run dev
```

Open:

```text
http://localhost:3000
```

## 4. Venue Signup Flow

Route:

```text
/venuesignup
```

Test:

- Fill venue details.
- Select a sample billing plan.
- Submit the signup.

Expected:

- Venue is created with `approval_status = pending`.
- Venue has sample billing fields.
- Venue is not visible to guests yet.
- User sees a professional pending approval state.
- Clicking Step 1 repeatedly should not create venue rows.
- Duplicate completed pending submissions from the same manager email are blocked within a 24-hour window.

Client feedback to capture:

- Is the signup form asking for the right venue details?
- Are plan labels and descriptions clear?
- Is the pending approval message acceptable?

## 5. Platform Admin Approval Flow

Route:

```text
/login
/masterdashboard
```

Test:

- Sign in as platform admin.
- Open the master dashboard.
- Find the pending venue.
- Approve the venue.

Expected:

- Venue status becomes approved.
- Venue becomes active.
- Approved venue becomes selectable by guests.
- Admin dashboard metrics update.

Edge cases:

- Reject a test venue with a reason.
- Suspend an approved test venue.
- Confirm rejected/suspended venues are not selectable by guests.

Client feedback to capture:

- Does approval need more fields or documents?
- Should admin need a confirmation prompt before approve/reject/suspend?
- Is the dashboard enough for the client’s operations team?

## 6. Guest Ticket Creation Flow

Route:

```text
/customer-signup
```

Test:

- Select an approved venue.
- Enter guest name, email, and phone.
- Submit the form.

Expected:

- Ticket page opens.
- QR code is visible.
- Fallback code is visible.
- Ticket is `pending_activation`.
- QR and fallback code correspond to the same ticket.

Edge cases:

- Try submitting without required fields.
- Confirm unavailable venues do not appear.
- Open the ticket by fallback code if needed:

```text
/ticket?code=<fallback-code>
```

Client feedback to capture:

- Is the guest form short enough?
- Is venue selection clear?
- Does the ticket screen communicate the next step clearly?

## 7. Venue Scanner Activation Flow

Route:

```text
/login
/venuescanner
```

Test:

- Sign in as venue staff or manager.
- Scan the guest QR with camera, or paste QR link / fallback code.
- Confirm ticket details.
- Add item type, item count, storage location, and optional notes.
- Confirm activation.

Expected:

- Pending ticket becomes active.
- Activation scan is logged.
- Item details are saved.
- Venue dashboard stored count updates.
- Ticket page shows stored/active state.

Edge cases:

- Use fallback code if camera permission is denied.
- Try scanning a ticket from another venue.
- Try scanning an expired pending ticket.
- Try activating the same ticket twice.

Client feedback to capture:

- Are item fields enough for counter staff?
- Should storage location be free text or selected from predefined slots?
- Is the confirmation step clear and fast enough?

## 8. Venue Scanner Checkout Flow

Route:

```text
/venuescanner
```

Test:

- Scan the same active ticket again.
- Confirm checkout only after the item is returned.

Expected:

- Active ticket becomes collected.
- Checkout scan is logged.
- Venue dashboard stored count decreases.
- Ticket page shows collected state.

Edge cases:

- Try checking out an already collected ticket.
- Try checking out a cancelled/expired ticket.
- Confirm rejected scans do not mutate ticket status.

Client feedback to capture:

- Does checkout need staff notes?
- Should checkout require guest phone/email confirmation?
- Should the app show a stronger warning before closing a ticket?

## 9. Venue Dashboard Flow

Route:

```text
/venuedashboard
```

Test:

- Review live metrics.
- Search by guest name, phone, email, or fallback code.
- Filter by all, pending, stored, collected, and expired.
- Open ticket detail.

Expected:

- Metrics reflect ticket state changes.
- Search returns matching tickets.
- Filters show correct status groups.
- Ticket detail opens only for tickets in the staff member’s venue.

Client feedback to capture:

- Are the dashboard metrics the right ones?
- Are filters enough for daily operations?
- Should the list show more fields?

## 10. Ticket Detail Flow

Route:

```text
/venueticketdetail?id=<ticket-id>
```

Test:

- Open ticket detail from the dashboard.
- Review guest details.
- Review item details.
- Review created, activated, collected, and scan timeline.

Expected:

- Ticket data is accurate.
- Scan timeline shows activation/checkout events.
- Unauthorized venue users cannot access tickets from other venues.

Client feedback to capture:

- Is the timeline enough for dispute handling?
- Should detail page include staff name after production auth polish?
- Should there be export/print support?

## 11. Analytics Flow

Routes:

```text
/venueanalytics
/analytics
```

Test:

- Open venue analytics as venue staff/manager.
- Open platform analytics as platform admin.
- Review guest volume, collected count, average storage, utilization, ticket volume, and item mix.

Expected:

- Venue users see venue-scoped analytics.
- Platform admin sees platform-wide analytics.
- Empty data states are professional.

Client feedback to capture:

- Are these analytics useful for MVP?
- What reports are needed later?
- Is daily, weekly, or monthly reporting more important?

## 12. Final Demo Checklist

- Venue signup works.
- Admin approval works.
- Approved venue appears in guest form.
- Guest ticket is generated with QR and fallback code.
- QR camera scanning works on at least one supported device/browser.
- Manual fallback code works.
- Activation confirmation saves item details.
- Checkout confirmation closes ticket.
- Dashboard and analytics update after state changes.
- Unauthorized users are redirected or blocked.
- `npm run lint` passes.
- `npm run build` passes.

## 13. Known Post-Feedback Work

- Replace sample billing with Stripe Checkout and webhooks.
- Add Resend email notifications.
- Decide whether SMS is required.
- Run full responsive and accessibility review.
- Add production monitoring.
- Deploy to the selected hosting provider.
- Perform production hardening and security review.
