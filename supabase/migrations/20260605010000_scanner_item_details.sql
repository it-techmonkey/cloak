alter table public.tickets
  add column if not exists item_type text,
  add column if not exists item_description text,
  add column if not exists item_count integer not null default 1 check (item_count >= 1),
  add column if not exists storage_location text,
  add column if not exists activation_confirmed_by uuid references public.profiles(id) on delete set null,
  add column if not exists checkout_confirmed_by uuid references public.profiles(id) on delete set null;

create index if not exists tickets_public_code_lookup_idx
  on public.tickets (public_code);
