-- Storage buckets and policies
-- Run after 0002_rls.sql

insert into storage.buckets (id, name, public) values ('avatars', 'avatars', true) on conflict (id) do nothing;
insert into storage.buckets (id, name, public) values ('item-photos', 'item-photos', true) on conflict (id) do nothing;
insert into storage.buckets (id, name, public) values ('handoff-photos', 'handoff-photos', true) on conflict (id) do nothing;
insert into storage.buckets (id, name, public) values ('verification-docs', 'verification-docs', false) on conflict (id) do nothing;

-- avatars: any auth user can upload to their own folder; public read
drop policy if exists "avatars public read" on storage.objects;
create policy "avatars public read" on storage.objects
  for select using (bucket_id = 'avatars');

drop policy if exists "avatars upload own" on storage.objects;
create policy "avatars upload own" on storage.objects
  for insert with check (
    bucket_id = 'avatars'
    and auth.uid()::text = (storage.foldername(name))[1]
  );

drop policy if exists "avatars update own" on storage.objects;
create policy "avatars update own" on storage.objects
  for update using (
    bucket_id = 'avatars'
    and auth.uid()::text = (storage.foldername(name))[1]
  );

-- item-photos: senders upload to their own folder; public read
drop policy if exists "item-photos public read" on storage.objects;
create policy "item-photos public read" on storage.objects
  for select using (bucket_id = 'item-photos');

drop policy if exists "item-photos upload own" on storage.objects;
create policy "item-photos upload own" on storage.objects
  for insert with check (
    bucket_id = 'item-photos'
    and auth.uid()::text = (storage.foldername(name))[1]
  );

-- handoff-photos: public read, auth users can upload to their folder
drop policy if exists "handoff-photos public read" on storage.objects;
create policy "handoff-photos public read" on storage.objects
  for select using (bucket_id = 'handoff-photos');

drop policy if exists "handoff-photos upload own" on storage.objects;
create policy "handoff-photos upload own" on storage.objects
  for insert with check (
    bucket_id = 'handoff-photos'
    and auth.uid()::text = (storage.foldername(name))[1]
  );

-- verification-docs: private, only owner + admins
drop policy if exists "verification-docs read own" on storage.objects;
create policy "verification-docs read own" on storage.objects
  for select using (
    bucket_id = 'verification-docs'
    and auth.uid()::text = (storage.foldername(name))[1]
  );

drop policy if exists "verification-docs upload own" on storage.objects;
create policy "verification-docs upload own" on storage.objects
  for insert with check (
    bucket_id = 'verification-docs'
    and auth.uid()::text = (storage.foldername(name))[1]
  );
