-- Counter-created walk-in tickets may have no guest email (the guest isn't
-- entering it themselves), so guest_email is now optional.
alter table public.tickets
  alter column guest_email drop not null;
