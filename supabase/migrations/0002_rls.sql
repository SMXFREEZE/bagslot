-- BagSlot Row Level Security policies

alter table public.profiles enable row level security;
alter table public.trips enable row level security;
alter table public.item_requests enable row level security;
alter table public.bookings enable row level security;
alter table public.payments enable row level security;
alter table public.conversations enable row level security;
alter table public.messages enable row level security;
alter table public.reviews enable row level security;
alter table public.safety_flags enable row level security;
alter table public.handoff_confirmations enable row level security;
alter table public.notifications enable row level security;

-- ============================================================================
-- helper: is_admin(uid)
-- ============================================================================
create or replace function public.is_admin(uid uuid)
returns boolean language sql stable security definer set search_path = public as $$
  select exists (select 1 from public.profiles where id = uid and is_admin);
$$;

-- ============================================================================
-- PROFILES
-- ============================================================================
drop policy if exists "profiles read all" on public.profiles;
create policy "profiles read all" on public.profiles
  for select using (true);

drop policy if exists "profiles update self" on public.profiles;
create policy "profiles update self" on public.profiles
  for update using (auth.uid() = id) with check (auth.uid() = id);

drop policy if exists "profiles insert self" on public.profiles;
create policy "profiles insert self" on public.profiles
  for insert with check (auth.uid() = id);

drop policy if exists "profiles admin all" on public.profiles;
create policy "profiles admin all" on public.profiles
  for all using (public.is_admin(auth.uid()));

-- ============================================================================
-- TRIPS
-- ============================================================================
drop policy if exists "trips read active" on public.trips;
create policy "trips read active" on public.trips
  for select using (status in ('active','full','in_progress','completed') or traveler_id = auth.uid());

drop policy if exists "trips insert own" on public.trips;
create policy "trips insert own" on public.trips
  for insert with check (auth.uid() = traveler_id);

drop policy if exists "trips update own" on public.trips;
create policy "trips update own" on public.trips
  for update using (auth.uid() = traveler_id) with check (auth.uid() = traveler_id);

drop policy if exists "trips delete own" on public.trips;
create policy "trips delete own" on public.trips
  for delete using (auth.uid() = traveler_id);

drop policy if exists "trips admin all" on public.trips;
create policy "trips admin all" on public.trips
  for all using (public.is_admin(auth.uid()));

-- ============================================================================
-- ITEM REQUESTS
-- ============================================================================
drop policy if exists "item_requests read participants" on public.item_requests;
create policy "item_requests read participants" on public.item_requests
  for select using (
    sender_id = auth.uid()
    or exists (select 1 from public.trips t where t.id = trip_id and t.traveler_id = auth.uid())
  );

drop policy if exists "item_requests insert own" on public.item_requests;
create policy "item_requests insert own" on public.item_requests
  for insert with check (auth.uid() = sender_id);

drop policy if exists "item_requests update own" on public.item_requests;
create policy "item_requests update own" on public.item_requests
  for update using (auth.uid() = sender_id) with check (auth.uid() = sender_id);

drop policy if exists "item_requests admin all" on public.item_requests;
create policy "item_requests admin all" on public.item_requests
  for all using (public.is_admin(auth.uid()));

-- ============================================================================
-- BOOKINGS
-- ============================================================================
drop policy if exists "bookings read participants" on public.bookings;
create policy "bookings read participants" on public.bookings
  for select using (traveler_id = auth.uid() or sender_id = auth.uid());

drop policy if exists "bookings insert sender" on public.bookings;
create policy "bookings insert sender" on public.bookings
  for insert with check (auth.uid() = sender_id);

drop policy if exists "bookings update participants" on public.bookings;
create policy "bookings update participants" on public.bookings
  for update using (traveler_id = auth.uid() or sender_id = auth.uid())
  with check (traveler_id = auth.uid() or sender_id = auth.uid());

drop policy if exists "bookings admin all" on public.bookings;
create policy "bookings admin all" on public.bookings
  for all using (public.is_admin(auth.uid()));

-- ============================================================================
-- PAYMENTS
-- ============================================================================
drop policy if exists "payments read participants" on public.payments;
create policy "payments read participants" on public.payments
  for select using (payer_id = auth.uid() or traveler_id = auth.uid());

drop policy if exists "payments admin all" on public.payments;
create policy "payments admin all" on public.payments
  for all using (public.is_admin(auth.uid()));

-- ============================================================================
-- CONVERSATIONS + MESSAGES
-- ============================================================================
drop policy if exists "conversations read participants" on public.conversations;
create policy "conversations read participants" on public.conversations
  for select using (traveler_id = auth.uid() or sender_id = auth.uid());

drop policy if exists "messages read participants" on public.messages;
create policy "messages read participants" on public.messages
  for select using (
    exists (
      select 1 from public.conversations c
      where c.id = conversation_id
        and (c.traveler_id = auth.uid() or c.sender_id = auth.uid())
    )
  );

drop policy if exists "messages insert participants" on public.messages;
create policy "messages insert participants" on public.messages
  for insert with check (
    auth.uid() = sender_id
    and exists (
      select 1 from public.conversations c
      where c.id = conversation_id
        and (c.traveler_id = auth.uid() or c.sender_id = auth.uid())
    )
  );

drop policy if exists "messages update own read" on public.messages;
create policy "messages update own read" on public.messages
  for update using (
    exists (
      select 1 from public.conversations c
      where c.id = conversation_id
        and (c.traveler_id = auth.uid() or c.sender_id = auth.uid())
    )
  );

-- ============================================================================
-- REVIEWS
-- ============================================================================
drop policy if exists "reviews read all" on public.reviews;
create policy "reviews read all" on public.reviews
  for select using (true);

drop policy if exists "reviews insert participants" on public.reviews;
create policy "reviews insert participants" on public.reviews
  for insert with check (
    auth.uid() = reviewer_id
    and exists (
      select 1 from public.bookings b
      where b.id = booking_id
        and b.status = 'completed'
        and (b.traveler_id = auth.uid() or b.sender_id = auth.uid())
    )
  );

-- ============================================================================
-- SAFETY FLAGS
-- ============================================================================
drop policy if exists "safety_flags read own" on public.safety_flags;
create policy "safety_flags read own" on public.safety_flags
  for select using (
    flagged_by = auth.uid()
    or public.is_admin(auth.uid())
    or exists (
      select 1 from public.bookings b
      where b.id = booking_id
        and (b.traveler_id = auth.uid() or b.sender_id = auth.uid())
    )
  );

drop policy if exists "safety_flags insert auth" on public.safety_flags;
create policy "safety_flags insert auth" on public.safety_flags
  for insert with check (auth.uid() = flagged_by);

drop policy if exists "safety_flags admin all" on public.safety_flags;
create policy "safety_flags admin all" on public.safety_flags
  for all using (public.is_admin(auth.uid()));

-- ============================================================================
-- HANDOFFS
-- ============================================================================
drop policy if exists "handoffs read participants" on public.handoff_confirmations;
create policy "handoffs read participants" on public.handoff_confirmations
  for select using (
    exists (
      select 1 from public.bookings b
      where b.id = booking_id
        and (b.traveler_id = auth.uid() or b.sender_id = auth.uid())
    )
  );

drop policy if exists "handoffs insert participants" on public.handoff_confirmations;
create policy "handoffs insert participants" on public.handoff_confirmations
  for insert with check (
    auth.uid() = confirmed_by
    and exists (
      select 1 from public.bookings b
      where b.id = booking_id
        and (b.traveler_id = auth.uid() or b.sender_id = auth.uid())
    )
  );

-- ============================================================================
-- NOTIFICATIONS
-- ============================================================================
drop policy if exists "notifications read own" on public.notifications;
create policy "notifications read own" on public.notifications
  for select using (auth.uid() = user_id);

drop policy if exists "notifications update own" on public.notifications;
create policy "notifications update own" on public.notifications
  for update using (auth.uid() = user_id) with check (auth.uid() = user_id);

drop policy if exists "notifications admin all" on public.notifications;
create policy "notifications admin all" on public.notifications
  for all using (public.is_admin(auth.uid()));
