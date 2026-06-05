# Step 4: Venue Signup With Dummy Billing

This step connects venue onboarding to Supabase without integrating Stripe or Resend.

## Added

- Public venue signup creates a pending `venues` record.
- Manager email is stored as a `venue_staff` manager invite.
- Plan selection updates `billing_plan`.
- Dummy billing marks `billing_status = 'trialing'`.
- Dummy payment identifiers are stored in the existing Stripe-compatible fields so real Stripe can replace them later.
- Venue remains `active = false` and hidden from guest selection until admin approval.

## Routes

- `/venuesignup`: single server-backed step flow.
- `/venuependingapproval`: confirmation after submission.

The active signup step is derived from the pending venue record stored in an `httpOnly` cookie, not from editable query parameters.

## Payment Decision

Stripe is intentionally not integrated in this step. Dummy billing is used while the project is reviewed and approved by the client.

## Next Step

Step 5 should implement admin venue approval:

- Review pending venues.
- Approve, reject, or suspend venues.
- Activate approved venues that have dummy-valid billing.
- Make approved active venues visible in guest check-in.
