-- Galata Kermes — Supabase SQL Schema
-- Supabase dashboard > SQL Editor > New Query > Paste & Run

-- 1. Profiles
create table if not exists public.profiles (
  id uuid references auth.users(id) on delete cascade primary key,
  username text unique not null,
  role text check (role in ('admin', 'editor', 'viewer')) not null default 'viewer',
  created_at timestamptz default now()
);

-- 2. Events (kermes sessions)
create table if not exists public.events (
  id uuid default gen_random_uuid() primary key,
  name text not null,
  is_active boolean default false,
  created_at timestamptz default now()
);

-- 3. Categories
create table if not exists public.categories (
  id uuid default gen_random_uuid() primary key,
  event_id uuid references public.events(id) on delete cascade not null,
  name text not null,
  emoji text default '📦',
  created_at timestamptz default now()
);

-- 4. Products
create table if not exists public.products (
  id uuid default gen_random_uuid() primary key,
  category_id uuid references public.categories(id) on delete cascade not null,
  name text not null,
  emoji text default '🏷️',
  created_at timestamptz default now()
);

-- 5. Price history
create table if not exists public.prices (
  id uuid default gen_random_uuid() primary key,
  product_id uuid references public.products(id) on delete cascade not null,
  amount numeric(10,2) not null,
  created_by uuid references auth.users(id),
  created_at timestamptz default now()
);

-- 6. Earnings
create table if not exists public.earnings (
  id uuid default gen_random_uuid() primary key,
  event_id uuid references public.events(id) on delete cascade not null,
  amount numeric(10,2) not null,
  currency text check (currency in ('TL', 'USD', 'EUR')) default 'TL',
  note text,
  created_by uuid references auth.users(id),
  created_at timestamptz default now()
);

-- 7. Costs
create table if not exists public.costs (
  id uuid default gen_random_uuid() primary key,
  event_id uuid references public.events(id) on delete cascade not null,
  name text not null,
  amount numeric(10,2) not null,
  created_by uuid references auth.users(id),
  created_at timestamptz default now()
);

-- ─── RLS ───────────────────────────────────────────────────────────────────────

alter table public.profiles enable row level security;
alter table public.events enable row level security;
alter table public.categories enable row level security;
alter table public.products enable row level security;
alter table public.prices enable row level security;
alter table public.earnings enable row level security;
alter table public.costs enable row level security;

-- Profiles: users read only their own row
create policy "profiles_select" on public.profiles
  for select using (auth.uid() = id);

-- Events: all authenticated users read; editors write
create policy "events_select" on public.events
  for select using (auth.role() = 'authenticated');

create policy "events_write" on public.events
  for all using (
    exists (select 1 from public.profiles where id = auth.uid() and role in ('admin','editor'))
  );

-- Categories
create policy "categories_select" on public.categories
  for select using (auth.role() = 'authenticated');

create policy "categories_write" on public.categories
  for all using (
    exists (select 1 from public.profiles where id = auth.uid() and role in ('admin','editor'))
  );

-- Products
create policy "products_select" on public.products
  for select using (auth.role() = 'authenticated');

create policy "products_write" on public.products
  for all using (
    exists (select 1 from public.profiles where id = auth.uid() and role in ('admin','editor'))
  );

-- Prices
create policy "prices_select" on public.prices
  for select using (auth.role() = 'authenticated');

create policy "prices_insert" on public.prices
  for insert with check (
    exists (select 1 from public.profiles where id = auth.uid() and role in ('admin','editor'))
  );

-- Earnings (only editors/admin)
create policy "earnings_select" on public.earnings
  for select using (
    exists (select 1 from public.profiles where id = auth.uid() and role in ('admin','editor'))
  );

create policy "earnings_write" on public.earnings
  for all using (
    exists (select 1 from public.profiles where id = auth.uid() and role in ('admin','editor'))
  );

-- Costs (only editors/admin)
create policy "costs_select" on public.costs
  for select using (
    exists (select 1 from public.profiles where id = auth.uid() and role in ('admin','editor'))
  );

create policy "costs_write" on public.costs
  for all using (
    exists (select 1 from public.profiles where id = auth.uid() and role in ('admin','editor'))
  );

-- ─── Auto-create profile on signup ─────────────────────────────────────────────
create or replace function public.handle_new_user()
returns trigger as $$
begin
  insert into public.profiles (id, username, role)
  values (
    new.id,
    split_part(new.email, '@', 1),
    'viewer'
  )
  on conflict (id) do nothing;
  return new;
end;
$$ language plpgsql security definer;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- ─── KULLANICI OLUŞTURMA TALİMATI ───────────────────────────────────────────────
-- Supabase Dashboard > Authentication > Users > Invite user
-- Email formatı: kullaniciadi@kermes.local
-- Örnekler:
--   admin@kermes.local     → role: admin
--   editor1@kermes.local   → role: editor
--   viewer@kermes.local    → role: viewer (paylaşımlı)
--
-- Kullanıcı oluşturduktan sonra profiles tablosundaki role alanını güncelleyin:
-- UPDATE public.profiles SET role = 'admin' WHERE username = 'admin';
-- UPDATE public.profiles SET role = 'editor' WHERE username = 'editor1';
