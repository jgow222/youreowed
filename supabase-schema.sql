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

-- User activity tracking for reminder emails
-- Tracks key milestones: signed_up, screened, paid
create table if not exists public.user_activity (
  id bigint primary key generated always as identity,
  user_id uuid references public.user_profiles(id) on delete cascade,
  email text not null,
  event_type text not null check (event_type in ('signed_up', 'started_screener', 'completed_screener', 'viewed_results', 'subscribed')),
  created_at timestamp with time zone default now()
);

alter table public.user_activity enable row level security;

create policy "Users can view own activity"
  on public.user_activity for select
  using (auth.uid() = user_id);

create policy "Users can insert own activity"
  on public.user_activity for insert
  with check (auth.uid() = user_id);

-- View: users who signed up but never completed a screening (for reminder emails)
create or replace view public.users_needing_nudge as
select 
  up.id,
  up.email,
  up.name,
  up.subscription_tier,
  up.created_at as signed_up_at,
  -- Has the user completed a screening?
  exists(select 1 from public.user_activity ua where ua.user_id = up.id and ua.event_type = 'completed_screener') as has_screened,
  -- Has the user subscribed?
  (up.subscription_tier != 'free') as has_paid,
  -- How many days since signup?
  extract(day from now() - up.created_at)::int as days_since_signup
from public.user_profiles up
where up.email is not null;

-- Track which reminder emails have been sent (prevents duplicates)
create table if not exists public.email_nudges_sent (
  id bigint primary key generated always as identity,
  user_id uuid references public.user_profiles(id) on delete cascade,
  email text not null,
  nudge_type text not null check (nudge_type in ('no_scan', 'abandoned', 'no_pay')),
  sent_at timestamp with time zone default now()
);

alter table public.email_nudges_sent enable row level security;

-- Only the service key (webhook/API) can read/write this table
create policy "Service key only"
  on public.email_nudges_sent for all
  using (false);
