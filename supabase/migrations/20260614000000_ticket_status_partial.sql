-- Add the 'partially_collected' status used when some (but not all) of a
-- ticket's items have been returned. Must be in its own migration: Postgres
-- forbids using a newly added enum value in the same transaction that adds it.
alter type public.ticket_status add value if not exists 'partially_collected' before 'collected';
