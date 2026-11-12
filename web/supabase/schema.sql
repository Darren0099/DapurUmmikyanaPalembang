-- Dapur Ummi Kyana v2. Run ONLY in a NEW, DEDICATED Supabase project.
-- Do not apply to an existing database belonging to another application.
-- This initial schema is additive and uses RLS on all exposed tables.
create extension if not exists pgcrypto;

create table if not exists public.products (
  id uuid primary key default gen_random_uuid(),
  slug text not null unique check (slug ~ '^[a-z0-9-]{2,80}$'),
  name text not null check (char_length(name) between 3 and 120),
  description text not null default '',
  category text not null default 'Nasi Box',
  price_idr integer not null check (price_idr > 0 and price_idr <= 100000000),
  active boolean not null default true,
  featured boolean not null default false,
  accent text not null default 'amber' check (accent in ('amber','coral','red','green','gold')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create table if not exists public.orders (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete restrict,
  client_request_id uuid not null,
  customer_name text not null check (char_length(customer_name) between 3 and 100),
  customer_phone text not null,
  fulfillment text not null check (fulfillment in ('pickup','delivery')),
  delivery_address text,
  notes text not null default '',
  subtotal_idr integer not null check (subtotal_idr > 0),
  delivery_fee_idr integer check (delivery_fee_idr >= 0),
  total_idr integer not null check (total_idr > 0),
  payment_method text not null default 'manual' check (payment_method in ('manual')),
  payment_status text not null default 'awaiting_confirmation' check (payment_status in ('awaiting_confirmation','paid','failed','refunded')),
  status text not null default 'pending' check (status in ('pending','confirmed','preparing','delivering','completed','cancelled')),
  paid_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint one_request_per_customer unique(user_id,client_request_id),
  constraint delivery_requires_address check (fulfillment = 'pickup' or char_length(coalesce(delivery_address,'')) >= 12)
);
create table if not exists public.order_items (
  id uuid primary key default gen_random_uuid(),
  order_id uuid not null references public.orders(id) on delete cascade,
  product_id uuid not null references public.products(id) on delete restrict,
  product_name text not null,
  unit_price_idr integer not null check(unit_price_idr > 0),
  quantity integer not null check(quantity between 1 and 50),
  line_total_idr integer not null check(line_total_idr = unit_price_idr * quantity),
  unique(order_id,product_id)
);
create table if not exists public.payment_events (
  id uuid primary key default gen_random_uuid(),
  order_id uuid not null references public.orders(id) on delete cascade,
  actor_user_id uuid references auth.users(id) on delete set null,
  type text not null check(char_length(type) between 2 and 60),
  previous_status text,
  next_status text,
  created_at timestamptz not null default now()
);
create index if not exists idx_orders_customer_created on public.orders(user_id,created_at desc);
create index if not exists idx_orders_created on public.orders(created_at desc);
create index if not exists idx_orders_status on public.orders(status,payment_status);
create index if not exists idx_order_items_order on public.order_items(order_id);

alter table public.products enable row level security;
alter table public.orders enable row level security;
alter table public.order_items enable row level security;
alter table public.payment_events enable row level security;

-- Public visitors may read only published menu entries. All writes run through
-- authenticated server routes with privileged credentials, not direct browser writes.
create policy "Public can read active products" on public.products
for select to anon,authenticated using (active = true);
create policy "Customers can see their orders" on public.orders
for select to authenticated using ((select auth.uid()) = user_id);
create policy "Customers can see their ordered items" on public.order_items
for select to authenticated using (exists (
  select 1 from public.orders o where o.id = order_id and o.user_id = (select auth.uid())
));
-- No RLS policies for payment_events: privileged service-only access.
revoke all on public.products,public.orders,public.order_items,public.payment_events from anon,authenticated;
grant select on public.products to anon,authenticated;
grant select on public.orders,public.order_items to authenticated;
-- Ensure payment_events is never directly exposed to anon/authenticated.
revoke all on public.payment_events from anon,authenticated;

-- The prices below come from the PHP snapshot and are NOT verified current prices.
-- Confirm all pricing and availability before opening online checkout.
insert into public.products (slug,name,category,description,price_idr,featured,accent) values
('ayam-saos-padang','Ayam Saos Padang','Nasi Box','Ayam berbumbu saos Padang yang kaya rasa.',25000,true,'coral'),
('nasi-ayam-balado','Nasi Ayam Balado','Nasi Box','Ayam balado dengan sentuhan rempah Nusantara.',25000,true,'red'),
('nasi-ayam-bakar','Nasi Ayam Bakar','Nasi Box','Pilihan ayam bakar untuk hidangan harian.',25000,true,'amber'),
('nasi-ayam-bawang','Nasi Ayam Bawang','Nasi Box','Ayam dengan bumbu bawang yang harum.',25000,false,'gold'),
('nasi-ayam-cabe-hijau','Nasi Ayam Cabe Hijau','Nasi Box','Ayam dengan sambal cabai hijau.',20000,false,'green'),
('nasi-kerang-rica','Nasi Kerang Rica','Seafood','Kerang dengan bumbu rica yang berkarakter.',25000,false,'coral'),
('nasi-gulai-cumi','Nasi Gulai Cumi','Seafood','Cumi dalam kuah gulai rempah.',20000,false,'amber'),
('nasi-bakar','Nasi Bakar','Nasi Pilihan','Nasi bakar beraroma daun dan bumbu pilihan.',25000,true,'green'),
('nasi-cumi-asin','Nasi Cumi Asin','Seafood','Cumi asin dengan nasi hangat.',25000,false,'gold')
on conflict (slug) do nothing;
