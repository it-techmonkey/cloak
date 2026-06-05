# Step 8 - Dashboard and Analytics

## Completed scope

- Venue dashboard now loads live Supabase metrics for:
  - tickets created today
  - pending activation
  - stored items
  - collected today
  - forgotten/expired pending tickets
  - capacity utilization
- Venue ticket list supports:
  - status filters
  - search by guest name, phone, email, or fallback code
  - direct navigation to ticket detail
- Venue ticket detail now shows:
  - guest details
  - ticket status and timestamps
  - item details
  - scan timeline
- Venue analytics now uses real ticket data for:
  - guest volume
  - collected tickets
  - average storage duration
  - utilization
  - ticket volume by time block
  - item type mix
- Platform analytics reuses the analytics view with platform-admin scope across all venues.
- Platform admin dashboard now includes active venues and stored items in addition to approval and billing metrics.

## Access rules

- Venue staff and managers only see tickets for their assigned venues.
- Platform admins can view aggregated platform metrics and all venue-scoped operational data.
- Ticket detail is server-validated, so changing the `id` parameter does not bypass venue access checks.

## Current limitation

- Analytics uses recent ticket data and simple in-app aggregation. Deeper reporting, exports, and long-term trend tables can be added after the operational workflows are approved.
