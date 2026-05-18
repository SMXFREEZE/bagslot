-- BagSlot demo seed data
-- Inserts demo trips so the search and city pages feel alive on first run.
-- These trips are anchored to a placeholder "system" profile that you should
-- create first by signing up the email seed@bagslot.app and setting its id below,
-- OR you can simply replace the UUID with any real profile id from your DB.

-- Replace this UUID with a real profile id (see scripts/seed.ts for an automated version)
\set seed_uid '00000000-0000-0000-0000-000000000001'

-- Insert demo trips (no-op if traveler_id doesn't exist due to FK)
insert into public.trips (
  traveler_id, departure_city, departure_country, destination_city, destination_country,
  departure_date, arrival_date, airline, flight_number,
  available_weight_kg, available_volume_description,
  price_per_kg, minimum_price, pickup_area, destination_handoff_area, allowed_item_notes
) values
  (:'seed_uid'::uuid, 'Montreal', 'Canada', 'Paris', 'France',
   current_date + interval '7 day', current_date + interval '8 day', 'Air France', 'AF345',
   4, 'A shoebox-sized item fits easily',
   12, 5, 'Plateau Mont-Royal', 'Le Marais', 'Documents, small electronics, soft goods only'),
  (:'seed_uid'::uuid, 'New York', 'USA', 'London', 'UK',
   current_date + interval '10 day', current_date + interval '11 day', 'British Airways', 'BA112',
   6, 'Up to a thin laptop bag',
   10, 5, 'Brooklyn', 'Shoreditch', 'No liquids, no food'),
  (:'seed_uid'::uuid, 'Los Angeles', 'USA', 'Tokyo', 'Japan',
   current_date + interval '14 day', current_date + interval '15 day', 'ANA', 'NH105',
   3, 'Small flat items only',
   15, 5, 'Santa Monica', 'Shibuya', 'Cosmetics, books, gifts'),
  (:'seed_uid'::uuid, 'Toronto', 'Canada', 'Lisbon', 'Portugal',
   current_date + interval '5 day', current_date + interval '6 day', 'Air Transat', 'TS472',
   5, 'Medium duffel space',
   8, 5, 'Downtown Toronto', 'Alfama', 'No batteries, no aerosols'),
  (:'seed_uid'::uuid, 'San Francisco', 'USA', 'Mexico City', 'Mexico',
   current_date + interval '3 day', current_date + interval '3 day', 'United', 'UA1503',
   7, 'Carry-on space',
   7, 5, 'Mission District', 'Roma Norte', 'Documents, small gifts')
on conflict do nothing;
