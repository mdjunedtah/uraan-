-- Om Gauri Pulta — database schema
-- Run this once in Supabase → SQL Editor (New query → paste → Run).
-- After running, add SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY to your
-- environment variables and the admin panel starts using the database.

-- ── Leads (CRM) ────────────────────────────────────────────────────────
create table if not exists public.leads (
  id          uuid primary key default gen_random_uuid(),
  name        text not null,
  email       text not null,
  phone       text,
  message     text,
  source      text not null default 'Website',
  status      text not null default 'New',
  created_at  timestamptz not null default now()
);
create index if not exists leads_created_at_idx on public.leads (created_at desc);

-- ── Orders ─────────────────────────────────────────────────────────────
create table if not exists public.orders (
  id          text primary key,                 -- e.g. OGP12345678
  customer    text not null,
  email       text,
  phone       text,
  amount      integer not null default 0,        -- in rupees
  items       jsonb not null default '[]'::jsonb,
  item_count  integer not null default 0,
  status      text not null default 'Processing',
  payment     text,
  address     text,
  created_at  timestamptz not null default now()
);
create index if not exists orders_created_at_idx on public.orders (created_at desc);

-- ── Products (for the upcoming catalogue migration) ────────────────────
create table if not exists public.products (
  id           text primary key,
  name         text not null,
  slug         text unique,
  category     text,
  price        integer not null default 0,
  old_price    integer,
  image        text,
  images       jsonb not null default '[]'::jsonb,
  description  text,
  material     text,
  weight       text,
  purity       text,
  tag          text,
  in_stock     boolean not null default true,
  rating       numeric default 5,
  review_count integer default 0,
  created_at   timestamptz not null default now()
);

-- Row Level Security: the app talks to the database only through the
-- server-side service-role key (which bypasses RLS), so we keep RLS enabled
-- and add no public policies. Nothing is readable/writable from the browser.
alter table public.leads    enable row level security;
alter table public.orders   enable row level security;
alter table public.products enable row level security;
