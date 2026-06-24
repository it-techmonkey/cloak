-- Split venue capacity into hanger + bag, and track extra scanning devices.
-- The existing `capacity` column is kept as the combined total for compatibility.
alter table public.venues
  add column if not exists hanger_capacity integer not null default 0 check (hanger_capacity >= 0),
  add column if not exists bag_capacity integer not null default 0 check (bag_capacity >= 0),
  add column if not exists extra_devices integer not null default 0 check (extra_devices >= 0);
