create extension if not exists btree_gist;

create table if not exists public.reservations (
  id uuid primary key,
  salon text not null,
  reservation_date date not null,
  name text not null,
  phone text not null,
  reason text not null,
  start_time time not null,
  end_time time not null,
  start_minute smallint not null,
  end_minute smallint not null,
  kind text not null default 'reservation' check (kind in ('reservation', 'block')),
  created_at timestamptz not null default now(),
  check (start_minute < end_minute),
  check (start_minute >= 0 and end_minute <= 1440)
);

alter table public.reservations drop constraint if exists reservations_no_overlap;
alter table public.reservations add constraint reservations_no_overlap
  exclude using gist (
    salon with =,
    reservation_date with =,
    int4range(start_minute, end_minute, '[)') with &&
  );

alter table public.reservations enable row level security;

revoke all on public.reservations from anon, authenticated;
