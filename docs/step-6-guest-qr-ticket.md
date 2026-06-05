# Step 6: Guest Venue Selection And QR Ticket

This step completes the guest ticket identity flow.

## Added

- Guest check-in creates a secure random QR token.
- Only the token hash is stored in `tickets.qr_token_hash`.
- The QR code points to the ticket URL with the secure token.
- A human-readable fallback code is shown on the ticket.
- The fallback code is stored in `tickets.public_code`.
- QR token lookup and fallback code lookup resolve to the same ticket record.
- Ticket page handles invalid and expired tickets.

## Counter Flow

Venue staff can later identify a ticket in Step 7 by either:

- scanning the QR code
- entering the fallback code manually

Both methods will resolve to the same ticket and must still pass venue validation.

## Security Shape

- The QR contains the secure token.
- The database stores only a hash of that token.
- The visible fallback code is operationally useful but still venue-bound at scan time.
