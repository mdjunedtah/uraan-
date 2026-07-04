-- Om Gauri Putra — database schema
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
  payment_id  text,                              -- Razorpay payment id (if paid online)
  paid        boolean not null default false,
  address     text,
  created_at  timestamptz not null default now()
);
create index if not exists orders_created_at_idx on public.orders (created_at desc);
-- If you ran an earlier version of this file, add the new columns with:
--   alter table public.orders add column if not exists payment_id text;
--   alter table public.orders add column if not exists paid boolean not null default false;

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

-- ── Categories ─────────────────────────────────────────────────────────
create table if not exists public.categories (
  slug        text primary key,
  name        text not null,
  description text,
  image       text,
  count       integer not null default 0,
  created_at  timestamptz not null default now()
);

insert into public.categories (slug, name, description, image, count) values
  ('gold','Gold Jewellery','916 Hallmarked Gold','/images/collection1.jpg',124),
  ('silver','Silver Jewellery','92.5% Pure Silver','/images/collection2.jpg',98),
  ('diamond','Diamond','Certified Diamonds','/images/collection3.jpg',56),
  ('gems','Precious Gems','Ruby, Emerald, Sapphire','/images/diamond-set.jpg',42),
  ('rudraksh','Rudraksh','1 to 21 Mukhi Certified','/images/necklace.jpg',38),
  ('necklaces','Necklaces','Statement & Daily Wear','/images/necklace.jpg',87),
  ('earrings','Earrings','Jhumkas, Studs, Chandbalis','/images/earrings.jpg',112),
  ('rings','Rings','Engagement & Cocktail','/images/ring.jpg',64),
  ('bangles','Bangles','Traditional & Modern','/images/bracelet.jpg',78),
  ('bracelets','Bracelets','Chain & Charm','/images/bracelet.jpg',45),
  ('pendants','Pendants','Religious & Designer','/images/necklace.jpg',52),
  ('bridal','Bridal Sets','Complete Bridal','/images/bridal-set.jpg',28)
on conflict (slug) do nothing;

-- ── Coupons ────────────────────────────────────────────────────────────
create table if not exists public.coupons (
  id          text primary key,
  code        text not null,
  type        text not null default 'percent',     -- 'percent' | 'flat'
  value       integer not null default 0,
  min_order   integer not null default 0,
  usage_limit integer not null default 0,
  used        integer not null default 0,
  valid_until text,
  active      boolean not null default true,
  created_at  timestamptz not null default now()
);

insert into public.coupons (id, code, type, value, min_order, usage_limit, used, valid_until, active) values
  ('CP001','WELCOME10','percent',10,999,1000,245,'31 Dec 2026',true),
  ('CP002','FESTIVE25','percent',25,4999,500,78,'15 Nov 2026',true),
  ('CP003','FLAT500','flat',500,2499,200,56,'30 Jun 2026',true),
  ('CP004','SUMMER15','percent',15,1999,800,800,'15 Apr 2026',false),
  ('CP005','NEWUSER','flat',200,999,5000,1245,'31 Dec 2026',true)
on conflict (id) do nothing;

-- ── Banners ────────────────────────────────────────────────────────────
create table if not exists public.banners (
  id         text primary key,
  title      text not null,
  subtitle   text,
  image      text,
  cta_text   text,
  cta_link   text,
  position   text not null default 'hero',          -- 'hero' | 'middle' | 'footer'
  active     boolean not null default true,
  created_at timestamptz not null default now()
);

insert into public.banners (id, title, subtitle, image, cta_text, cta_link, position, active) values
  ('B001','Festive Collection 2026','Up to 40% off on selected items','/images/banner.jpg','Shop Now','/collections','hero',true),
  ('B002','Bridal Special','Heirloom pieces for your sacred day','/images/bridal-set.jpg','Explore Bridal','/collections?type=bridal','middle',true),
  ('B003','Sacred Rudraksh','Authentic certified beads','/images/luxury-bg.jpg','Discover','/collections?type=rudraksh','middle',false)
on conflict (id) do nothing;

-- ── Reviews ────────────────────────────────────────────────────────────
-- `verified` = Verified Purchase (the reviewer actually bought this product).
-- `status`   = moderation state, independent of purchase verification.
create table if not exists public.reviews (
  id            text primary key,
  product_id    text,                                  -- references products.id (no FK: seed data may predate a row)
  name          text not null,
  city          text,
  avatar        text,
  anonymous     boolean not null default false,
  rating        integer not null default 5,
  title         text,
  "text"        text,
  variant       text,                                   -- product variant purchased (size/colour/metal etc.)
  images        jsonb not null default '[]'::jsonb,
  videos        jsonb not null default '[]'::jsonb,
  product       text,                                    -- legacy free-text product name (testimonials)
  "date"        text,
  verified      boolean not null default false,          -- Verified Purchase
  status        text not null default 'approved',        -- pending | approved | rejected | hidden
  helpful_count integer not null default 0,
  report_count  integer not null default 0,
  order_id      text,                                    -- order that proves the purchase (dedup + verification)
  email         text,                                    -- submitter's email (not shown publicly)
  spam_score    integer not null default 0,
  moderation_note text,
  created_at    timestamptz not null default now(),
  updated_at    timestamptz not null default now()
);

-- If you ran an earlier version of this file, add the new columns with:
--   alter table public.reviews add column if not exists product_id text;
--   alter table public.reviews add column if not exists anonymous boolean not null default false;
--   alter table public.reviews add column if not exists title text;
--   alter table public.reviews add column if not exists variant text;
--   alter table public.reviews add column if not exists images jsonb not null default '[]'::jsonb;
--   alter table public.reviews add column if not exists videos jsonb not null default '[]'::jsonb;
--   alter table public.reviews add column if not exists status text not null default 'approved';
--   alter table public.reviews add column if not exists helpful_count integer not null default 0;
--   alter table public.reviews add column if not exists report_count integer not null default 0;
--   alter table public.reviews add column if not exists order_id text;
--   alter table public.reviews add column if not exists email text;
--   alter table public.reviews add column if not exists spam_score integer not null default 0;
--   alter table public.reviews add column if not exists moderation_note text;
--   alter table public.reviews add column if not exists updated_at timestamptz not null default now();

create index if not exists reviews_product_status_idx on public.reviews (product_id, status);
create index if not exists reviews_status_created_idx on public.reviews (status, created_at desc);
-- Defense-in-depth against duplicate reviews for the same purchased item —
-- the app also checks this before insert (lib/reviewsDb.ts).
create unique index if not exists reviews_order_product_uk
  on public.reviews (order_id, product_id)
  where order_id is not null and product_id is not null;

-- $$...$$ dollar-quoting lets the review text contain apostrophes safely.
insert into public.reviews (id, product_id, name, city, avatar, rating, title, "text", product, "date", verified, status, helpful_count) values
  ('r1','p001','Priya Sharma','Mumbai','/images/model.jpg',5,'More compliments than the bride',$$I wore this necklace at my daughter's wedding and received more compliments than the bride! The craftsmanship is extraordinary — it looks even more beautiful in person. Worth every rupee.$$,'Diamond Floral Necklace','2024-11-15',true,'approved',34),
  ('r2','p002','Anjali Mehta','Delhi','/images/model.jpg',5,'Three generations, one shop',$$Three generations of my family shop only at Om Gauri Putra. The quality never wavers. This temple necklace is exactly what heirloom jewellery should feel like — heavy, impeccable, timeless.$$,'Gold Temple Necklace','2024-12-02',true,'approved',51),
  ('r3','p004','Sunita Reddy','Hyderabad','/images/model.jpg',5,'Brought me to tears',$$My bridal set was custom-designed here. The team was patient, professional and the final piece brought me to tears. Every bride deserves jewellery this special.$$,'Kundan Bridal Necklace','2024-10-20',true,'approved',67),
  ('r4','p101','Kavitha Nair','Chennai','/images/model.jpg',5,'A different league',$$I have bought jhumkas from many shops but these are in a different league. The weight is perfect, the sound when they move is music, and the 22K gold colour is stunning.$$,'Gold Jhumka Earrings','2024-09-18',true,'approved',29),
  ('r5','p201','Meera Patel','Ahmedabad','/images/model.jpg',5,'Said yes before he finished',$$My husband proposed with this ring and I said yes before he finished the sentence. The diamond is breathtaking. Every time I look at it I fall in love again.$$,'Solitaire Diamond Ring','2024-11-30',true,'approved',88),
  ('r6','p303','Rekha Iyer','Bangalore','/images/model.jpg',4,'Great value for money',$$Beautiful silver work at a very fair price. The anti-tarnish coating is excellent — I have worn it daily for three months without any dulling. Great value for money.$$,'Silver Pendant Set','2024-08-14',true,'approved',18),
  ('r7','p502','Fatima Shaikh','Pune','/images/model.jpg',5,'Pure luxury',$$I treated myself to this bracelet for my 40th birthday and it is the most beautiful thing I own. The diamonds are exceptional and the clasp is very secure. Pure luxury.$$,'Diamond Tennis Bracelet','2024-12-10',true,'approved',22),
  ('r8','p402','Deepa Krishnan','Kochi','/images/model.jpg',5,'Beauty and spirituality',$$The Rudraksh pendant came with a certificate of authenticity and a beautiful explanation of its significance. I can feel the positive energy. Highly recommend to anyone seeking both beauty and spirituality.$$,'1 Mukhi Rudraksh Pendant','2024-07-22',true,'approved',15),
  ('r9','p006','Rashmi Gupta','Kolkata','/images/model.jpg',5,'Flawless from click to doorstep',$$I was nervous ordering a piece this expensive online but the experience was flawless. Packaging was exquisite, the necklace arrived exactly as shown, and customer care was exceptional.$$,'Polki Diamond Necklace','2024-10-05',true,'approved',41)
on conflict (id) do nothing;

-- Helpful-vote dedup — one vote per review per visitor (voter_key is a hash of
-- the signed-in email, or of IP+User-Agent for anonymous visitors).
create table if not exists public.review_votes (
  id          bigint generated always as identity primary key,
  review_id   text not null references public.reviews(id) on delete cascade,
  voter_key   text not null,
  created_at  timestamptz not null default now(),
  unique (review_id, voter_key)
);

-- Reported reviews, for the admin moderation queue.
create table if not exists public.review_reports (
  id            bigint generated always as identity primary key,
  review_id     text not null references public.reviews(id) on delete cascade,
  reporter_key  text not null,
  reason        text,
  created_at    timestamptz not null default now(),
  unique (review_id, reporter_key)
);

alter table public.categories    enable row level security;
alter table public.coupons       enable row level security;
alter table public.banners       enable row level security;
alter table public.reviews       enable row level security;
alter table public.review_votes  enable row level security;
alter table public.review_reports enable row level security;

-- Atomic "helpful" counter bump — avoids a read-modify-write race when two
-- visitors mark a review helpful at the same moment.
create or replace function public.increment_review_helpful(review_id_in text)
returns void
language sql
as $$
  update public.reviews set helpful_count = helpful_count + 1 where id = review_id_in;
$$;

-- ════════════════════════════════════════════════════════════════════════
--  SECURITY / ADMIN HARDENING (Phase 1)
--  All tables are written only via the server-side service-role key.
-- ════════════════════════════════════════════════════════════════════════

-- Team members + their RBAC role. Authentication itself moves to Supabase Auth
-- (Phase 2); auth_id links this row to auth.users. Roles: owner | super_admin
-- | admin | staff.
create table if not exists public.admin_users (
  id                  uuid primary key default gen_random_uuid(),
  auth_id             uuid unique,
  email               text unique not null,
  name                text,
  role                text not null default 'staff',
  status              text not null default 'active',  -- active | locked | disabled
  password_changed_at timestamptz,
  last_login_at       timestamptz,
  created_at          timestamptz not null default now()
);

-- Every login attempt — powers rate limiting, brute-force detection and the
-- login-attempt monitor.
create table if not exists public.login_attempts (
  id          bigint generated always as identity primary key,
  email       text,
  ip          text,
  user_agent  text,
  success     boolean not null default false,
  reason      text,
  created_at  timestamptz not null default now()
);
create index if not exists login_attempts_email_idx on public.login_attempts (email, created_at desc);
create index if not exists login_attempts_ip_idx    on public.login_attempts (ip, created_at desc);

-- Temporary + permanent account lockouts.
create table if not exists public.account_locks (
  email        text primary key,
  locked_until timestamptz,
  permanent    boolean not null default false,
  reason       text,
  updated_at   timestamptz not null default now()
);

-- Full audit trail of admin actions.
create table if not exists public.audit_logs (
  id          bigint generated always as identity primary key,
  actor_email text,
  actor_role  text,
  action      text not null,
  target      text,
  ip          text,
  user_agent  text,
  metadata    jsonb not null default '{}'::jsonb,
  created_at  timestamptz not null default now()
);
create index if not exists audit_logs_created_idx on public.audit_logs (created_at desc);

-- Security-specific events (failed logins, lockouts, new devices, suspicious).
create table if not exists public.security_events (
  id          bigint generated always as identity primary key,
  type        text not null,
  severity    text not null default 'info',     -- info | warning | critical
  email       text,
  ip          text,
  user_agent  text,
  metadata    jsonb not null default '{}'::jsonb,
  created_at  timestamptz not null default now()
);
create index if not exists security_events_created_idx on public.security_events (created_at desc);

-- Recognised devices, for device verification + new-device approval.
create table if not exists public.trusted_devices (
  id           uuid primary key default gen_random_uuid(),
  email        text not null,
  fingerprint  text not null,
  label        text,
  browser      text,
  os           text,
  ip           text,
  approved     boolean not null default false,
  last_seen_at timestamptz not null default now(),
  created_at   timestamptz not null default now(),
  unique (email, fingerprint)
);

-- Password reuse prevention (stores only hashes; history check on change).
create table if not exists public.password_history (
  id            bigint generated always as identity primary key,
  email         text not null,
  password_hash text not null,
  created_at    timestamptz not null default now()
);
create index if not exists password_history_email_idx on public.password_history (email, created_at desc);

-- Active sessions, for the session-management dashboard + force-logout.
create table if not exists public.auth_sessions (
  id                 uuid primary key default gen_random_uuid(),
  email              text not null,
  device_fingerprint text,
  ip                 text,
  browser            text,
  os                 text,
  created_at         timestamptz not null default now(),
  last_active_at     timestamptz not null default now(),
  revoked_at         timestamptz
);
create index if not exists auth_sessions_email_idx on public.auth_sessions (email, last_active_at desc);

alter table public.admin_users      enable row level security;
alter table public.login_attempts   enable row level security;
alter table public.account_locks    enable row level security;
alter table public.audit_logs       enable row level security;
alter table public.security_events  enable row level security;
alter table public.trusted_devices  enable row level security;
alter table public.password_history enable row level security;
alter table public.auth_sessions    enable row level security;

-- Seed the first Owner. Replace the email with yours, then in Phase 2 this row
-- links to the Supabase Auth user you sign in with.
insert into public.admin_users (email, name, role, status)
values ('admin@omgauriputra.com', 'Owner', 'owner', 'active')
on conflict (email) do nothing;

-- Allow a signed-in admin (Supabase Auth) to read ONLY their own admin_users
-- row, so the middleware/server can resolve their role. All writes still go
-- through the service-role key, which bypasses RLS.
drop policy if exists "admin_users self read" on public.admin_users;
create policy "admin_users self read" on public.admin_users
  for select to authenticated
  using (lower(email) = lower(coalesce(auth.jwt() ->> 'email', '')));

-- Email OTP codes (new-device approval / email verification). Hashes only.
create table if not exists public.email_otps (
  id         bigint generated always as identity primary key,
  email      text not null,
  purpose    text not null,
  code_hash  text not null,
  expires_at timestamptz not null,
  created_at timestamptz not null default now()
);
create index if not exists email_otps_email_idx on public.email_otps (email, created_at desc);
alter table public.email_otps enable row level security;
