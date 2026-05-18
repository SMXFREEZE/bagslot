-- BagSlot initial schema
-- Run this in Supabase SQL editor (or `supabase db push`)

create extension if not exists "uuid-ossp";
create extension if not exists "pgcrypto";

-- ============================================================================
-- ENUMS
-- ============================================================================
do $$ begin
  create type user_role as enum ('traveler', 'sender', 'both');
exception when duplicate_object then null; end $$;

do $$ begin
  create type verification_status as enum ('unverified', 'email_verified', 'id_verified');
exception when duplicate_object then null; end $$;

do $$ begin
  create type trip_status as enum ('draft', 'active', 'full', 'in_progress', 'completed', 'cancelled');
exception when duplicate_object then null; end $$;

do $$ begin
  create type item_safety_status as enum ('pending', 'allowed', 'flagged', 'blocked');
exception when duplicate_object then null; end $$;

do $$ begin
  create type item_request_status as enum (
    'draft', 'submitted', 'matched', 'cancelled', 'rejected', 'expired'
  );
exception when duplicate_object then null; end $$;

do $$ begin
  create type booking_status as enum (
    'requested', 'accepted', 'rejected',
    'payment_pending', 'paid',
    'picked_up', 'in_transit', 'delivered',
    'completed', 'disputed', 'cancelled'
  );
exception when duplicate_object then null; end $$;

do $$ begin
  create type payment_status as enum (
    'pending', 'processing', 'succeeded', 'failed', 'refunded', 'released'
  );
exception when duplicate_object then null; end $$;

do $$ begin
  create type review_type as enum ('sender_to_traveler', 'traveler_to_sender');
exception when duplicate_object then null; end $$;

do $$ begin
  create type safety_severity as enum ('low', 'medium', 'high', 'critical');
exception when duplicate_object then null; end $$;

do $$ begin
  create type safety_flag_status as enum ('open', 'reviewing', 'resolved', 'dismissed');
exception when duplicate_object then null; end $$;

do $$ begin
  create type handoff_type as enum ('pickup', 'delivery');
exception when duplicate_object then null; end $$;

do $$ begin
  create type notification_type as enum (
    'request_received', 'request_accepted', 'request_rejected',
    'payment_received', 'pickup_confirmed', 'delivery_confirmed',
    'dispute_opened', 'review_received', 'message_received', 'system'
  );
exception when duplicate_object then null; end $$;

-- ============================================================================
-- PROFILES (mirrors auth.users)
-- ============================================================================
create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  full_name text,
  avatar_url text,
  role user_role default 'sender',
  phone_number text,
  home_city text,
  languages text[] default '{}',
  bio text,
  rating_average numeric(3,2) default 0,
  rating_count integer default 0,
  verification_status verification_status default 'unverified',
  is_admin boolean default false,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- ============================================================================
-- TRIPS
-- ============================================================================
create table if not exists public.trips (
  id uuid primary key default uuid_generate_v4(),
  traveler_id uuid not null references public.profiles(id) on delete cascade,
  departure_city text not null,
  departure_country text not null,
  destination_city text not null,
  destination_country text not null,
  departure_date date not null,
  arrival_date date not null,
  airline text,
  flight_number text,
  available_weight_kg numeric(5,2) not null check (available_weight_kg > 0),
  available_volume_description text,
  price_per_kg numeric(8,2) not null default 5 check (price_per_kg >= 0),
  minimum_price numeric(8,2) not null default 5 check (minimum_price >= 5),
  pickup_area text,
  destination_handoff_area text,
  allowed_item_notes text,
  status trip_status default 'active',
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

create index if not exists idx_trips_destination on public.trips (lower(destination_city));
create index if not exists idx_trips_departure on public.trips (lower(departure_city));
create index if not exists idx_trips_status on public.trips (status);
create index if not exists idx_trips_date on public.trips (departure_date);

-- ============================================================================
-- ITEM REQUESTS
-- ============================================================================
create table if not exists public.item_requests (
  id uuid primary key default uuid_generate_v4(),
  sender_id uuid not null references public.profiles(id) on delete cascade,
  trip_id uuid references public.trips(id) on delete set null,
  origin_city text not null,
  origin_country text not null,
  destination_city text not null,
  destination_country text not null,
  item_name text not null,
  item_description text,
  item_category text,
  item_weight_kg numeric(5,2) not null check (item_weight_kg > 0),
  item_size_description text,
  item_value numeric(10,2) default 0,
  item_photos text[] default '{}',
  pickup_deadline date,
  delivery_notes text,
  safety_status item_safety_status default 'pending',
  status item_request_status default 'submitted',
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

create index if not exists idx_item_requests_sender on public.item_requests (sender_id);
create index if not exists idx_item_requests_trip on public.item_requests (trip_id);

-- ============================================================================
-- BOOKINGS
-- ============================================================================
create table if not exists public.bookings (
  id uuid primary key default uuid_generate_v4(),
  trip_id uuid not null references public.trips(id) on delete cascade,
  item_request_id uuid not null references public.item_requests(id) on delete cascade,
  traveler_id uuid not null references public.profiles(id) on delete cascade,
  sender_id uuid not null references public.profiles(id) on delete cascade,
  status booking_status default 'requested',
  agreed_price numeric(10,2) not null,
  platform_fee numeric(10,2) not null,
  traveler_payout numeric(10,2) not null,
  pickup_code text not null default upper(substr(md5(random()::text), 1, 6)),
  delivery_code text not null default upper(substr(md5(random()::text), 1, 6)),
  created_at timestamptz default now(),
  updated_at timestamptz default now(),
  unique (item_request_id)
);

create index if not exists idx_bookings_trip on public.bookings (trip_id);
create index if not exists idx_bookings_traveler on public.bookings (traveler_id);
create index if not exists idx_bookings_sender on public.bookings (sender_id);
create index if not exists idx_bookings_status on public.bookings (status);

-- ============================================================================
-- PAYMENTS
-- ============================================================================
create table if not exists public.payments (
  id uuid primary key default uuid_generate_v4(),
  booking_id uuid not null references public.bookings(id) on delete cascade,
  payer_id uuid not null references public.profiles(id) on delete cascade,
  traveler_id uuid not null references public.profiles(id) on delete cascade,
  amount numeric(10,2) not null,
  platform_fee numeric(10,2) not null,
  traveler_payout numeric(10,2) not null,
  currency text not null default 'USD',
  status payment_status default 'pending',
  stripe_checkout_session_id text,
  stripe_payment_intent_id text,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

create index if not exists idx_payments_booking on public.payments (booking_id);
create index if not exists idx_payments_status on public.payments (status);

-- ============================================================================
-- CONVERSATIONS + MESSAGES
-- ============================================================================
create table if not exists public.conversations (
  id uuid primary key default uuid_generate_v4(),
  booking_id uuid not null references public.bookings(id) on delete cascade,
  traveler_id uuid not null references public.profiles(id) on delete cascade,
  sender_id uuid not null references public.profiles(id) on delete cascade,
  created_at timestamptz default now(),
  unique (booking_id)
);

create table if not exists public.messages (
  id uuid primary key default uuid_generate_v4(),
  conversation_id uuid not null references public.conversations(id) on delete cascade,
  sender_id uuid not null references public.profiles(id) on delete cascade,
  body text not null,
  read_at timestamptz,
  created_at timestamptz default now()
);

create index if not exists idx_messages_conversation on public.messages (conversation_id, created_at);

-- ============================================================================
-- REVIEWS
-- ============================================================================
create table if not exists public.reviews (
  id uuid primary key default uuid_generate_v4(),
  booking_id uuid not null references public.bookings(id) on delete cascade,
  reviewer_id uuid not null references public.profiles(id) on delete cascade,
  reviewee_id uuid not null references public.profiles(id) on delete cascade,
  rating integer not null check (rating between 1 and 5),
  comment text,
  review_type review_type not null,
  created_at timestamptz default now(),
  unique (booking_id, reviewer_id)
);

create index if not exists idx_reviews_reviewee on public.reviews (reviewee_id);

-- ============================================================================
-- SAFETY FLAGS
-- ============================================================================
create table if not exists public.safety_flags (
  id uuid primary key default uuid_generate_v4(),
  item_request_id uuid references public.item_requests(id) on delete cascade,
  booking_id uuid references public.bookings(id) on delete cascade,
  flagged_by uuid references public.profiles(id) on delete set null,
  reason text not null,
  severity safety_severity default 'medium',
  status safety_flag_status default 'open',
  admin_notes text,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- ============================================================================
-- HANDOFF CONFIRMATIONS
-- ============================================================================
create table if not exists public.handoff_confirmations (
  id uuid primary key default uuid_generate_v4(),
  booking_id uuid not null references public.bookings(id) on delete cascade,
  type handoff_type not null,
  confirmed_by uuid not null references public.profiles(id) on delete cascade,
  confirmation_code text not null,
  photo_url text,
  notes text,
  created_at timestamptz default now()
);

create index if not exists idx_handoffs_booking on public.handoff_confirmations (booking_id);

-- ============================================================================
-- NOTIFICATIONS
-- ============================================================================
create table if not exists public.notifications (
  id uuid primary key default uuid_generate_v4(),
  user_id uuid not null references public.profiles(id) on delete cascade,
  type notification_type not null,
  title text not null,
  body text,
  link_url text,
  read_at timestamptz,
  created_at timestamptz default now()
);

create index if not exists idx_notifications_user on public.notifications (user_id, created_at desc);

-- ============================================================================
-- UPDATED_AT TRIGGER
-- ============================================================================
create or replace function public.set_updated_at()
returns trigger language plpgsql as $$
begin
  new.updated_at = now();
  return new;
end; $$;

do $$ declare t text;
begin
  for t in
    select unnest(array['profiles','trips','item_requests','bookings','payments','safety_flags'])
  loop
    execute format('drop trigger if exists trg_updated_at on public.%I', t);
    execute format('create trigger trg_updated_at before update on public.%I for each row execute function public.set_updated_at()', t);
  end loop;
end $$;

-- ============================================================================
-- AUTO-CREATE PROFILE ON SIGNUP
-- ============================================================================
create or replace function public.handle_new_user()
returns trigger language plpgsql security definer set search_path = public as $$
begin
  insert into public.profiles (id, full_name, avatar_url)
  values (
    new.id,
    coalesce(new.raw_user_meta_data->>'full_name', split_part(new.email, '@', 1)),
    new.raw_user_meta_data->>'avatar_url'
  )
  on conflict (id) do nothing;
  return new;
end; $$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- ============================================================================
-- UPDATE PROFILE RATING AFTER REVIEW
-- ============================================================================
create or replace function public.recompute_profile_rating()
returns trigger language plpgsql as $$
begin
  update public.profiles p
  set
    rating_average = sub.avg_rating,
    rating_count = sub.cnt
  from (
    select
      reviewee_id,
      coalesce(avg(rating), 0)::numeric(3,2) as avg_rating,
      count(*) as cnt
    from public.reviews
    where reviewee_id = coalesce(new.reviewee_id, old.reviewee_id)
    group by reviewee_id
  ) sub
  where p.id = sub.reviewee_id;
  return coalesce(new, old);
end; $$;

drop trigger if exists trg_recompute_rating on public.reviews;
create trigger trg_recompute_rating
  after insert or update or delete on public.reviews
  for each row execute function public.recompute_profile_rating();
