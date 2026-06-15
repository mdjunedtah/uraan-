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
create table if not exists public.reviews (
  id         text primary key,
  name       text not null,
  city       text,
  avatar     text,
  rating     integer not null default 5,
  "text"     text,
  product    text,
  "date"     text,
  verified   boolean not null default false,
  created_at timestamptz not null default now()
);

-- $$...$$ dollar-quoting lets the review text contain apostrophes safely.
insert into public.reviews (id, name, city, avatar, rating, "text", product, "date", verified) values
  ('r1','Priya Sharma','Mumbai','/images/model.jpg',5,$$I wore this necklace at my daughter's wedding and received more compliments than the bride! The craftsmanship is extraordinary — it looks even more beautiful in person. Worth every rupee.$$,'Diamond Floral Necklace','2024-11-15',true),
  ('r2','Anjali Mehta','Delhi','/images/model.jpg',5,$$Three generations of my family shop only at Om Gauri Pulta. The quality never wavers. This temple necklace is exactly what heirloom jewellery should feel like — heavy, impeccable, timeless.$$,'Gold Temple Necklace','2024-12-02',true),
  ('r3','Sunita Reddy','Hyderabad','/images/model.jpg',5,$$My bridal set was custom-designed here. The team was patient, professional and the final piece brought me to tears. Every bride deserves jewellery this special.$$,'Kundan Bridal Necklace','2024-10-20',true),
  ('r4','Kavitha Nair','Chennai','/images/model.jpg',5,$$I have bought jhumkas from many shops but these are in a different league. The weight is perfect, the sound when they move is music, and the 22K gold colour is stunning.$$,'Gold Jhumka Earrings','2024-09-18',true),
  ('r5','Meera Patel','Ahmedabad','/images/model.jpg',5,$$My husband proposed with this ring and I said yes before he finished the sentence. The diamond is breathtaking. Every time I look at it I fall in love again.$$,'Solitaire Diamond Ring','2024-11-30',true),
  ('r6','Rekha Iyer','Bangalore','/images/model.jpg',4,$$Beautiful silver work at a very fair price. The anti-tarnish coating is excellent — I have worn it daily for three months without any dulling. Great value for money.$$,'Silver Pendant Set','2024-08-14',true),
  ('r7','Fatima Shaikh','Pune','/images/model.jpg',5,$$I treated myself to this bracelet for my 40th birthday and it is the most beautiful thing I own. The diamonds are exceptional and the clasp is very secure. Pure luxury.$$,'Diamond Tennis Bracelet','2024-12-10',true),
  ('r8','Deepa Krishnan','Kochi','/images/model.jpg',5,$$The Rudraksh pendant came with a certificate of authenticity and a beautiful explanation of its significance. I can feel the positive energy. Highly recommend to anyone seeking both beauty and spirituality.$$,'1 Mukhi Rudraksh Pendant','2024-07-22',true),
  ('r9','Rashmi Gupta','Kolkata','/images/model.jpg',5,$$I was nervous ordering a piece this expensive online but the experience was flawless. Packaging was exquisite, the necklace arrived exactly as shown, and customer care was exceptional.$$,'Polki Diamond Necklace','2024-10-05',true)
on conflict (id) do nothing;

alter table public.categories enable row level security;
alter table public.coupons    enable row level security;
alter table public.banners    enable row level security;
alter table public.reviews    enable row level security;
