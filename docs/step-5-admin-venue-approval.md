# Step 5: Admin Venue Approval

This step connects the platform admin dashboard to live Supabase venue data.

## Added

- Real platform stats from Supabase.
- Venue review queue from Supabase.
- Admin approval, rejection, and suspension actions.
- Server-side platform admin checks inside every mutation.
- Approval activates venues only when sample billing is valid.
- Rejected and suspended venues are set inactive.
- Admin actions write to `audit_logs`.

## Approval Rules

Approving a venue sets:

- `approval_status = 'approved'`
- `active = true`
- `approved_at = now`
- `approved_by = current admin profile`

Approval is blocked unless:

- `billing_status` is `trialing` or `active`
- `stripe_customer_id` exists, currently stored as a sample value

## Guest Visibility

Guest check-in only lists venues that are:

- approved
- active
- billing-valid

So an approved venue becomes selectable immediately after the admin approval action.
