-- ═══════════════════════════════════════════════════════════════════════════
-- YoureOwed — Supabase Database Schema
-- Run this in your Supabase project's SQL Editor (Dashboard → SQL Editor)
-- ═══════════════════════════════════════════════════════════════════════════

-- User profiles (extends Supabase auth.users)
create table if not exists public.user_profiles (
  id uuid references auth.users(id) on delete cascade primary key,
  email text,
  name text,
  state text default '',
  zip_code text default '',
  subscription_tier text default 'free' check (subscription_tier in ('free', 'basic', 'premium')),
  referral_code text unique,
  stripe_customer_id text,
  created_at timestamp with time zone default now(),
  updated_at timestamp with time zone default now()
);

-- Screening results
create table if not exists public.screening_results (
  id bigint primary key generated always as identity,
  user_id uuid references public.user_profiles(id) on delete cascade,
  results jsonb,
  answers jsonb,
  screened_at timestamp with time zone default now()
);

-- Household members
create table if not exists public.household_members (
  id bigint primary key generated always as identity,
  user_id uuid references public.user_profiles(id) on delete cascade,
  name text not null,
  relationship text not null,
  age integer default 0,
  has_disability boolean default false,
  is_veteran boolean default false,
  employment_status text default '',
  monthly_income numeric default 0,
  created_at timestamp with time zone default now()
);

-- Lead captures (attorney referrals, etc.)
create table if not exists public.lead_captures (
  id bigint primary key generated always as identity,
  user_id uuid references public.user_profiles(id) on delete set null,
  lead_type text not null, -- 'disability_attorney', 'tax_prep', 'health_insurance'
  name text,
  phone text,
  email text,
  program_id text,
  created_at timestamp with time zone default now()
);

-- Guide purchases
create table if not exists public.guide_purchases (
  id bigint primary key generated always as identity,
  user_id uuid references public.user_profiles(id) on delete cascade,
  guide_id text not null,
  program_id text not null,
  purchase_type text not null, -- 'guide' or 'ai_assisted'
  amount numeric not null,
  stripe_payment_id text,
  created_at timestamp with time zone default now()
);

-- Enable Row Level Security on all tables
alter table public.user_profiles enable row level security;
alter table public.screening_results enable row level security;
alter table public.household_members enable row level security;
alter table public.lead_captures enable row level security;
alter table public.guide_purchases enable row level security;

-- RLS Policies: users can only access their own data
create policy "Users can view own profile"
  on public.user_profiles for select
  using (auth.uid() = id);

create policy "Users can update own profile"
  on public.user_profiles for update
  using (auth.uid() = id);

create policy "Users can insert own profile"
  on public.user_profiles for insert
  with check (auth.uid() = id);

create policy "Users can view own screening results"
  on public.screening_results for all
  using (auth.uid() = user_id);

create policy "Users can manage own household"
  on public.household_members for all
  using (auth.uid() = user_id);

create policy "Users can view own leads"
  on public.lead_captures for all
  using (auth.uid() = user_id);

create policy "Users can view own purchases"
  on public.guide_purchases for all
  using (auth.uid() = user_id);

-- Email list subscribers
create table if not exists public.email_subscribers (
  id bigint primary key generated always as identity,
  email text unique not null,
  source text default 'dashboard', -- where they signed up: dashboard, blog, footer, popup
  created_at timestamp with time zone default now()
);

-- Allow the service key to insert (webhook/API), but no public RLS needed
alter table public.email_subscribers enable row level security;

-- Allow inserts from authenticated and anonymous users (email capture is public)
create policy "Anyone can subscribe"
  on public.email_subscribers for insert
  with check (true);
