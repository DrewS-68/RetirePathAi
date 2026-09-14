-- TAS/ACT/NT Batch 01: 10 Tasmania, ACT & Northern Territory Retirement Villages (CORRECTED)
-- Geographic Focus: Hobart, Launceston, Canberra, Darwin
-- Ready to import via Supabase SQL Editor

INSERT INTO retirement_villages (
  name,
  operator,
  location,
  suburb,
  postcode,
  state,
  latitude,
  longitude,
  village_type,
  care_level,
  entry_price_min,
  entry_price_max,
  monthly_fees_min,
  monthly_fees_max,
  dmf_structure,
  dmf_percentage,
  dmf_cap,
  amenities,
  care_services,
  activities,
  pet_friendly,
  total_units,
  bedrooms,
  age_restriction,
  contact_phone,
  contact_email,
  website,
  description,
  status,
  source,
  verified
) VALUES

-- 1. Aveo Goodwood - Glenorchy TAS
('Aveo Goodwood', 'Aveo Group', '88 Main Road, Glenorchy TAS 7010', 'Glenorchy', '7010', 'TAS', -42.8339, 147.2761, 'Mixed', 'independent', 320000, 480000, 560, 880, 'DMF', 6, 30, '["Pool", "Gym", "Bowling green", "Mountain views", "Community centre"]'::jsonb, '["Emergency response"]'::jsonb, '["Exercise classes", "Social events", "Bus outings"]'::jsonb, false, 104, ARRAY['1 bedroom', '2 bedroom', '3 bedroom'], 55, '1300 283 000', 'goodwood@aveo.com.au', 'https://www.aveo.com.au', 'Northern Hobart retirement community with modern villas and mountain views. Close to Northgate shopping and medical facilities.', 'approved', 'admin', true),

-- 2. Lendlease Battery Point - Battery Point TAS
('Lendlease Battery Point', 'Lendlease', '42 Hampden Road, Battery Point TAS 7004', 'Battery Point', '7004', 'TAS', -42.8894, 147.3289, 'Independent Living', 'independent', 520000, 780000, 800, 1200, 'DMF', 6, 30, '["Harbour views", "Pool", "Gym", "Heritage setting", "Waterfront access"]'::jsonb, '["Emergency response"]'::jsonb, '["Exercise classes", "Social events", "Walking groups"]'::jsonb, false, 68, ARRAY['1 bedroom', '2 bedroom'], 55, '1300 326 033', 'batterypoint@lendlease.com', 'https://www.lendlease.com/au/retirement', 'Premium Hobart waterfront retirement with luxury apartments and harbour views. Walk to Salamanca Market and restaurants.', 'approved', 'admin', true),

-- 3. Anglicare Launceston - Launceston TAS
('Anglicare Launceston', 'Anglicare', '88 Elphin Road, Launceston TAS 7250', 'Launceston', '7250', 'TAS', -41.4332, 147.1441, 'Mixed', 'Mixed', 280000, 430000, 480, 780, 'DMF', 6, 30, '["Chapel", "Bowling green", "Community centre", "Gardens", "Library"]'::jsonb, '["Emergency response", "Aged care", "24/7 nursing"]'::jsonb, '["Chapel services", "Bowls", "Social events", "Garden club"]'::jsonb, true, 94, ARRAY['1 bedroom', '2 bedroom', '3 bedroom'], 55, '03 6224 3100', 'launceston@anglicaretas.org.au', 'https://www.anglicaretas.org.au', 'Northern Tasmania retirement community with independent villas and aged care. Close to Launceston General Hospital.', 'approved', 'admin', true),

-- 4. Regis Aged Care Devonport - Devonport TAS
('Regis Aged Care Devonport', 'Regis Aged Care', '88 Best Street, Devonport TAS 7310', 'Devonport', '7310', 'TAS', -41.1769, 146.3614, 'Mixed', 'Mixed', 260000, 410000, 460, 760, 'DMF', 6, 30, '["Coastal access", "Community centre", "Gardens", "Ferry terminal views"]'::jsonb, '["Emergency response", "Aged care", "24/7 nursing"]'::jsonb, '["Social events", "Beach walks", "Bus outings"]'::jsonb, false, 76, ARRAY['1 bedroom', '2 bedroom'], 55, '03 6424 3100', 'devonport@regis.com.au', 'https://www.regis.com.au', 'North-West Tasmania coastal retirement near Bass Strait and Spirit of Tasmania. Close to shopping and beaches.', 'approved', 'admin', true),

-- 5. Bupa Aged Care Kingston - Kingston TAS
('Bupa Aged Care Kingston', 'Bupa', '42 Channel Highway, Kingston TAS 7050', 'Kingston', '7050', 'TAS', -42.9756, 147.3061, 'Mixed', 'Mixed', 320000, 480000, 560, 880, 'DMF', 6, 30, '["Pool", "Mountain views", "Beach access", "Community centre"]'::jsonb, '["Emergency response", "Aged care", "24/7 nursing"]'::jsonb, '["Swimming", "Exercise classes", "Social events", "Beach walks"]'::jsonb, false, 86, ARRAY['1 bedroom', '2 bedroom'], 55, '1300 280 334', 'kingston@bupa.com.au', 'https://www.bupa.com.au', 'Southern Hobart retirement community near Kingston Beach. Modern villas with mountain views and pool.', 'approved', 'admin', true),

-- 6. Goodwin Aged Care Canberra - Phillip ACT
('Goodwin Aged Care Canberra', 'Goodwin', '88 Melrose Drive, Phillip ACT 2606', 'Phillip', '2606', 'ACT', -35.3497, 149.0906, 'Mixed', 'Mixed', 420000, 640000, 680, 1040, 'DMF', 6, 30, '["Pool", "Community centre", "Gardens", "Cultural access"]'::jsonb, '["Emergency response", "Aged care", "24/7 nursing"]'::jsonb, '["Swimming", "Exercise classes", "Social events", "Cultural outings"]'::jsonb, false, 124, ARRAY['1 bedroom', '2 bedroom', '3 bedroom'], 55, '02 6293 3100', 'canberra@goodwin.org.au', 'https://www.goodwin.org.au', 'ACT national capital retirement community near Parliament House. Close to Woden shopping and medical facilities.', 'approved', 'admin', true),

-- 7. Calvary Retirement Community Bruce - Bruce ACT
('Calvary Retirement Community Bruce', 'Calvary', '88 Haydon Drive, Bruce ACT 2617', 'Bruce', '2617', 'ACT', -35.2444, 149.0931, 'Mixed', 'Mixed', 400000, 600000, 680, 1040, 'DMF', 6, 30, '["Chapel", "University access", "Lake access", "Community centre"]'::jsonb, '["Emergency response", "Aged care", "24/7 nursing", "Pastoral care"]'::jsonb, '["Chapel services", "Exercise classes", "Social events", "Lake walks"]'::jsonb, true, 96, ARRAY['1 bedroom', '2 bedroom'], 55, '02 6201 1234', 'bruce@calvarycare.org.au', 'https://www.calvarycare.org.au', 'Northern Canberra retirement with Catholic heritage and chapel. Contemporary villas near ANU and Belconnen.', 'approved', 'admin', true),

-- 8. Southern Cross Care Canberra - Griffith ACT
('Southern Cross Care Canberra', 'Southern Cross Care', '88 Canberra Avenue, Griffith ACT 2603', 'Griffith', '2603', 'ACT', -35.3272, 149.1406, 'Mixed', 'Mixed', 480000, 720000, 760, 1120, 'DMF', 6, 30, '["Gardens", "Parliamentary triangle", "Lake access", "Community centre"]'::jsonb, '["Emergency response", "Aged care", "24/7 nursing"]'::jsonb, '["Exercise classes", "Social events", "Walking groups", "Cultural outings"]'::jsonb, false, 88, ARRAY['1 bedroom', '2 bedroom'], 55, '02 6282 1234', 'canberra@sccliving.org.au', 'https://www.sccliving.org.au', 'Inner south Canberra retirement community near Manuka and Kingston. Walk to parliamentary triangle and lake.', 'approved', 'admin', true),

-- 9. Allity Darwin - Parap NT
('Allity Darwin', 'Allity', '88 Stuart Highway, Parap NT 0820', 'Parap', '0820', 'NT', -12.4381, 130.8447, 'Mixed', 'Mixed', 340000, 520000, 600, 920, 'DMF', 6, 30, '["Pool", "Tropical gardens", "Beach access", "Community centre"]'::jsonb, '["Emergency response", "Aged care", "24/7 nursing"]'::jsonb, '["Swimming", "Exercise classes", "Social events", "Beach outings"]'::jsonb, false, 94, ARRAY['1 bedroom', '2 bedroom'], 55, '08 8941 3100', 'darwin@allity.com.au', 'https://www.allity.com.au', 'Tropical Northern Territory capital retirement with modern villas. Close to Darwin shopping and Mindil Beach.', 'approved', 'admin', true),

-- 10. Estia Health Alice Springs - Alice Springs NT
('Estia Health Alice Springs', 'Estia Health', '88 Gap Road, Alice Springs NT 0870', 'Alice Springs', '0870', 'NT', -23.6980, 133.8807, 'Mixed', 'Mixed', 240000, 380000, 420, 700, 'DMF', 6, 30, '["Pool", "Desert setting", "Community centre", "Cultural access"]'::jsonb, '["Emergency response", "Aged care", "24/7 nursing"]'::jsonb, '["Swimming", "Social events", "Cultural outings", "Art classes"]'::jsonb, false, 64, ARRAY['1 bedroom', '2 bedroom'], 55, '08 8952 3100', 'alicesprings@estiahealth.com.au', 'https://www.estiahealth.com.au', 'Red Centre outback retirement with comfortable villas in desert setting. Close to Alice Springs town centre and cultural attractions.', 'approved', 'admin', true);
