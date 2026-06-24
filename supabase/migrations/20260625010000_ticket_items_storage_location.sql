-- Add per-item slot assignment to ticket_items.
-- Each physical unit now occupies its own hanger or bag slot.

alter table public.ticket_items
  add column if not exists storage_location text default null;
