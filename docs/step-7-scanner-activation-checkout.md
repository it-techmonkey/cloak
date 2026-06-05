# Step 7 - Scanner Activation and Checkout

## Completed scope

- Venue staff can verify a ticket using the QR link, raw QR token, or fallback code.
- Venue staff can scan QR codes with the device camera when the browser supports native barcode detection.
- The QR token and fallback code resolve to the same venue-bound ticket.
- Lookup does not activate or checkout a ticket by itself.
- Pending tickets require staff confirmation with:
  - item type
  - item count
  - storage location
  - optional item notes
- Active tickets require a checkout confirmation before closing.
- Wrong venue, expired, cancelled, collected, or missing tickets are blocked with clear messages.
- Accepted activation and checkout actions create `ticket_scans` records.
- Rejected scans for known tickets are logged with a reason.

## Edge cases covered

- Staff cannot process tickets outside their assigned venue.
- Platform admins can inspect/process across venues.
- Expired pending tickets cannot be activated.
- Collected tickets cannot be checked out again.
- Activation rechecks ticket status before updating, so stale confirmation forms cannot activate an already changed ticket.
- Checkout rechecks ticket status before updating, so stale confirmation forms cannot close an inactive ticket.
- Item count is constrained to 1-99 in the app and at least 1 in the database.

## Camera support

- Camera scanning uses the browser camera and native QR detection API.
- Manual fallback code entry remains available for unsupported browsers, denied permissions, poor lighting, or damaged QR codes.
- Camera detection submits through the same server lookup path as manual entry, so venue validation and status checks stay consistent.
