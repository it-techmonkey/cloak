alter table public.venues
  add column if not exists submitted_at timestamptz;

update public.venues
set submitted_at = created_at
where submitted_at is null
  and billing_plan is not null;

create index if not exists venues_submitted_status_idx
  on public.venues (submitted_at, approval_status, created_at desc);

create or replace function public.prevent_duplicate_pending_venue_submission()
returns trigger
language plpgsql
as $$
begin
  if new.approval_status = 'pending' and new.submitted_at is not null then
    if exists (
      select 1
      from public.venues
      where approval_status = 'pending'
        and submitted_at is not null
        and lower(contact_email) = lower(new.contact_email)
        and created_at >= now() - interval '24 hours'
    ) then
      raise exception 'A pending venue submission already exists for this manager email.'
        using errcode = '23505';
    end if;
  end if;

  return new;
end;
$$;

drop trigger if exists venues_prevent_duplicate_pending_submission on public.venues;
create trigger venues_prevent_duplicate_pending_submission
before insert on public.venues
for each row execute function public.prevent_duplicate_pending_venue_submission();
