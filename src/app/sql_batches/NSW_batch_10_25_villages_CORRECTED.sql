-- NSW Batch 09: 25 Southern Highlands & South Coast Retirement Villages (CORRECTED)
-- Geographic Focus: Wollongong, Shellharbour, Kiama, Southern Highlands, Shoalhaven
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

-- 1. Stockland Halcyon Lakeside
('Stockland Halcyon Lakeside', 'Stockland', '1 Lakeside Boulevard, Shell Cove NSW 2529', 'Shell Cove', '2529', 'NSW', -34.5736, 150.8667, 'Independent Living', 'independent', 420000, 640000, 680, 1040, 'DMF', 6, 30, '["Pool", "Gym", "Cinema", "Bowling green", "Marina", "Lake views", "Community centre"]'::jsonb, '["Emergency response"]'::jsonb, '["Swimming", "Movies", "Exercise classes", "Bowls", "Boating", "Social events"]'::jsonb, false, 186, ARRAY['2 bedroom', '3 bedroom'], 55, '1800 550 550', 'lakeside@stockland.com.au', 'https://www.stockland.com.au/retirement', 'Premium Shellharbour retirement resort near Lake Illawarra with waterfront location. Contemporary villas, pool, gym, cinema, bowling green and marina access. Minutes to Stockland Shellharbour shopping.', 'approved', 'admin', true),

-- 2. Lendlease Retirement Wollongong
('Lendlease Retirement Wollongong', 'Lendlease', '88 Crown Street, Wollongong NSW 2500', 'Wollongong', '2500', 'NSW', -34.4242, 150.8931, 'Independent Living', 'independent', 480000, 720000, 760, 1120, 'DMF', 6, 30, '["Pool", "Gym", "Cinema", "Ocean views", "Dining room", "Gardens", "Library"]'::jsonb, '["Emergency response"]'::jsonb, '["Swimming", "Movies", "Exercise classes", "Fine dining", "Beach walks", "Social events"]'::jsonb, false, 132, ARRAY['1 bedroom', '2 bedroom'], 55, '1300 326 033', 'wollongong@lendlease.com', 'https://www.lendlease.com/au/retirement', 'Coastal retirement community with ocean views overlooking Wollongong beaches. Modern apartments with pool, gym, cinema and dining facilities. Walk to beach, cafes and Wollongong CBD.', 'approved', 'admin', true),

-- 3. Aveo Bowral
('Aveo Bowral', 'Aveo Group', '22 Bong Bong Street, Bowral NSW 2576', 'Bowral', '2576', 'NSW', -34.4789, 150.4181, 'Independent Living', 'independent', 420000, 620000, 680, 1000, 'DMF', 6, 30, '["Bowling green", "Gardens", "Community centre", "Library", "Heritage style"]'::jsonb, '["Emergency response"]'::jsonb, '["Bowls", "Social events", "Garden club", "Gallery visits"]'::jsonb, false, 94, ARRAY['2 bedroom', '3 bedroom'], 55, '1300 283 000', 'bowral@aveo.com.au', 'https://www.aveo.com.au', 'Southern Highlands retirement village in charming Bowral with heritage-style villas and cool climate gardens. Walk to Bowral village shops, galleries and restaurants.', 'approved', 'admin', true),

-- 4. Anglicare Marian Gardens
('Anglicare Marian Gardens', 'Anglicare', '42 Rothery Street, Fairy Meadow NSW 2519', 'Fairy Meadow', '2519', 'NSW', -34.3967, 150.8911, 'Mixed', 'Mixed', 340000, 510000, 560, 880, 'DMF', 6, 30, '["Chapel", "Gardens", "Community centre", "Library"]'::jsonb, '["Emergency response", "Aged care", "24/7 nursing"]'::jsonb, '["Chapel services", "Social events", "Garden club", "Beach walks"]'::jsonb, true, 86, ARRAY['1 bedroom', '2 bedroom'], 55, '02 4285 4100', 'mariangardens@anglicare.org.au', 'https://www.anglicare.org.au', 'Fairy Meadow retirement village near Wollongong University with independent villas, gardens, chapel and community hall. Close to beaches, shops and Wollongong Hospital.', 'approved', 'admin', true),

-- 5. IRT Moruya
('IRT Moruya', 'IRT Group', '14 Campbell Street, Moruya NSW 2537', 'Moruya', '2537', 'NSW', -35.9089, 150.0856, 'Mixed', 'Mixed', 260000, 400000, 440, 720, 'DMF', 6, 30, '["Bowling green", "Community centre", "Gardens", "River views"]'::jsonb, '["Emergency response", "Aged care", "24/7 nursing"]'::jsonb, '["Bowls", "Social events", "Fishing", "Garden club", "River walks"]'::jsonb, false, 78, ARRAY['1 bedroom', '2 bedroom'], 55, '1300 157 677', 'moruya@irt.org.au', 'https://www.irt.org.au', 'Far South Coast retirement village in historic Moruya with comfortable villas near beaches and Moruya River. Peaceful coastal town lifestyle with excellent fishing.', 'approved', 'admin', true),

-- 6. Uniting Figtree
('Uniting Figtree', 'Uniting', '88 Princes Highway, Figtree NSW 2525', 'Figtree', '2525', 'NSW', -34.4386, 150.8656, 'Independent Living', 'independent', 380000, 560000, 640, 960, 'DMF', 6, 30, '["Pool", "Community centre", "Gardens", "Library", "BBQ areas"]'::jsonb, '["Emergency response"]'::jsonb, '["Swimming", "Social events", "Garden club", "Shopping trips"]'::jsonb, false, 116, ARRAY['1 bedroom', '2 bedroom', '3 bedroom'], 55, '1300 864 846', 'figtree@uniting.org', 'https://www.uniting.org', 'Wollongong region retirement community in leafy Figtree with modern villas and apartments. Close to Wollongong Hospital, Westfield Figtree and University.', 'approved', 'admin', true),

-- 7. Opal Aged Care Thirroul
('Opal Aged Care Thirroul', 'Opal Aged Care', '22 The Corso, Thirroul NSW 2515', 'Thirroul', '2515', 'NSW', -34.3156, 150.9211, 'Mixed', 'Mixed', 420000, 620000, 680, 1000, 'DMF', 6, 30, '["Pool", "Ocean views", "Community centre", "Gardens"]'::jsonb, '["Emergency response", "Aged care", "24/7 nursing"]'::jsonb, '["Swimming", "Beach walks", "Social events", "Cafe visits"]'::jsonb, false, 74, ARRAY['1 bedroom', '2 bedroom'], 55, '1300 672 524', 'thirroul@opalaged.care', 'https://www.opalagedcare.com.au', 'Beachside retirement living in charming Thirroul village with contemporary apartments near Lawrence Hargrave Drive cafes. Ocean views, pool and walk to Thirroul Beach and train station.', 'approved', 'admin', true),

-- 8. Presbyterian Aged Care Mittagong
('Presbyterian Aged Care Mittagong', 'Presbyterian Aged Care NSW & ACT', '88 Old Hume Highway, Mittagong NSW 2575', 'Mittagong', '2575', 'NSW', -34.4506, 150.4442, 'Mixed', 'Mixed', 320000, 480000, 560, 840, 'DMF', 6, 30, '["Chapel", "Gardens", "Community centre", "Library"]'::jsonb, '["Emergency response", "Aged care", "24/7 nursing"]'::jsonb, '["Chapel services", "Social events", "Garden club"]'::jsonb, true, 92, ARRAY['1 bedroom', '2 bedroom'], 55, '02 4872 3100', 'mittagong@pac.org.au', 'https://www.pac.org.au', 'Southern Highlands retirement village with cool climate charm and comfortable villas. Close to Mittagong shops and medical facilities with four seasons lifestyle.', 'approved', 'admin', true),

-- 9. Baptistcare Kiama Shores
('Baptistcare Kiama Shores', 'BaptistCare', '14 Boanyo Avenue, Kiama NSW 2533', 'Kiama', '2533', 'NSW', -34.6736, 150.8542, 'Independent Living', 'independent', 480000, 720000, 760, 1120, 'DMF', 6, 30, '["Pool", "Chapel", "Ocean views", "Community centre", "Gardens"]'::jsonb, '["Emergency response"]'::jsonb, '["Swimming", "Chapel services", "Beach walks", "Social events"]'::jsonb, false, 68, ARRAY['2 bedroom', '3 bedroom'], 55, '02 4232 2100', 'kiama@baptistcare.org.au', 'https://www.baptistcare.org.au', 'Coastal retirement village with stunning ocean views and modern villas overlooking Kiama beaches. Walk to Kiama blowhole, shops and harbor. Premium coastal lifestyle.', 'approved', 'admin', true),

-- 10. Regis Aged Care Ulladulla
('Regis Aged Care Ulladulla', 'Regis Aged Care', '88 Princes Highway, Ulladulla NSW 2539', 'Ulladulla', '2539', 'NSW', -35.3594, 150.4697, 'Mixed', 'Mixed', 280000, 430000, 480, 760, 'DMF', 6, 30, '["Bowling green", "Gardens", "Community centre", "Library"]'::jsonb, '["Emergency response", "Aged care", "24/7 nursing"]'::jsonb, '["Bowls", "Social events", "Fishing", "Garden club", "Beach walks"]'::jsonb, false, 84, ARRAY['1 bedroom', '2 bedroom'], 55, '02 4455 4200', 'ulladulla@regis.com.au', 'https://www.regis.com.au', 'South Coast retirement community near beautiful beaches with comfortable villas and bowling green. On-site aged care facility. Enjoy relaxed coastal town lifestyle and fishing.', 'approved', 'admin', true),

-- 11. Respect Aged Care Nowra
('Respect Aged Care Nowra', 'Respect', '42 Moss Street, Nowra NSW 2541', 'Nowra', '2541', 'NSW', -34.8850, 150.5997, 'Mixed', 'Mixed', 260000, 400000, 440, 720, 'DMF', 6, 30, '["Bowling green", "Community centre", "Gardens", "Library"]'::jsonb, '["Emergency response", "Aged care", "24/7 nursing"]'::jsonb, '["Bowls", "Social events", "Garden club", "Shopping trips"]'::jsonb, true, 102, ARRAY['1 bedroom', '2 bedroom'], 55, '02 4421 3100', 'nowra@respect.com.au', 'https://www.respect.com.au', 'Shoalhaven retirement village in regional Nowra with modern villas and aged care facility. Close to Stockland Nowra shopping and base hospital.', 'approved', 'admin', true),

-- 12. Southern Cross Care Batemans Bay
('Southern Cross Care Batemans Bay', 'Southern Cross Care', '1 Beach Road, Batemans Bay NSW 2536', 'Batemans Bay', '2536', 'NSW', -35.7081, 150.1756, 'Mixed', 'Mixed', 340000, 510000, 600, 920, 'DMF', 6, 30, '["Pool", "Bowling green", "Water views", "Community centre", "Gardens"]'::jsonb, '["Emergency response", "Aged care", "24/7 nursing"]'::jsonb, '["Swimming", "Bowls", "Fishing", "Social events", "Garden club"]'::jsonb, false, 96, ARRAY['1 bedroom', '2 bedroom', '3 bedroom'], 55, '02 4472 6100', 'bateman@sccliving.org.au', 'https://www.sccliving.org.au', 'Beautiful South Coast retirement living near beaches and Clyde River with spacious villas and water views. Perfect retirement haven on sapphire coast.', 'approved', 'admin', true),

-- 13. Adventist Retirement Plus Corrimal
('Adventist Retirement Plus Corrimal', 'Adventist Retirement Plus', '88 Railway Street, Corrimal NSW 2518', 'Corrimal', '2518', 'NSW', -34.3733, 150.8992, 'Independent Living', 'independent', 320000, 480000, 560, 840, 'DMF', 6, 30, '["Pool", "Gardens", "Wellness centre", "Walking trails", "Community centre"]'::jsonb, '["Emergency response"]'::jsonb, '["Swimming", "Walking", "Health programs", "Social events", "Beach walks"]'::jsonb, false, 88, ARRAY['1 bedroom', '2 bedroom'], 55, '02 4283 2200', 'corrimal@adventistretirementplus.org.au', 'https://www.retirementplus.com.au', 'Northern Wollongong retirement village near beaches with health-focused community and wellness programs. Close to Corrimal Beach and local shops.', 'approved', 'admin', true),

-- 14. Estia Health Wollongong
('Estia Health Wollongong', 'Estia Health', '88 Keira Street, Wollongong NSW 2500', 'Wollongong', '2500', 'NSW', -34.4258, 150.8931, 'Mixed', 'Mixed', 420000, 620000, 680, 1000, 'DMF', 6, 30, '["Pool", "Gym", "Mountain views", "Ocean views", "Community centre"]'::jsonb, '["Emergency response", "Aged care", "24/7 nursing"]'::jsonb, '["Swimming", "Exercise classes", "Social events", "Beach walks"]'::jsonb, false, 108, ARRAY['1 bedroom', '2 bedroom'], 55, '02 4226 3100', 'wollongong@estiahealth.com.au', 'https://www.estiahealth.com.au', 'Central Wollongong retirement community near hospital precinct with modern apartments and mountain and ocean views. Walk to WIN Entertainment Centre and beaches.', 'approved', 'admin', true),

-- 15. Bupa Aged Care Port Kembla
('Bupa Aged Care Port Kembla', 'Bupa', '22 Wentworth Street, Port Kembla NSW 2505', 'Port Kembla', '2505', 'NSW', -34.4769, 150.9036, 'Mixed', 'Mixed', 280000, 420000, 480, 760, 'DMF', 6, 30, '["Bowling green", "Harbour views", "Community centre", "Gardens"]'::jsonb, '["Emergency response", "Aged care", "24/7 nursing"]'::jsonb, '["Bowls", "Social events", "Garden club", "Beach walks"]'::jsonb, true, 94, ARRAY['1 bedroom', '2 bedroom'], 55, '1300 280 334', 'portkembla@bupa.com.au', 'https://www.bupa.com.au', 'Industrial city retirement village with harbor views and affordable villas. Close to beaches and Warrawong Plaza shopping with on-site aged care.', 'approved', 'admin', true),

-- 16. Allity Dapto
('Allity Dapto', 'Allity', '88 Bong Bong Road, Dapto NSW 2530', 'Dapto', '2530', 'NSW', -34.4986, 150.7967, 'Independent Living', 'independent', 300000, 450000, 520, 800, 'DMF', 6, 30, '["Bowling green", "Lake access", "Community centre", "Gardens", "Fishing"]'::jsonb, '["Emergency response"]'::jsonb, '["Bowls", "Fishing", "Social events", "Garden club", "Lake activities"]'::jsonb, false, 112, ARRAY['1 bedroom', '2 bedroom', '3 bedroom'], 55, '02 4261 3100', 'dapto@allity.com.au', 'https://www.allity.com.au', 'Wollongong region retirement community near Lake Illawarra with spacious villas, lake access and fishing. Close to Stockland Shellharbour and beaches.', 'approved', 'admin', true),

-- 17. Bolton Clarke Berry
('Bolton Clarke Berry', 'Bolton Clarke', '14 Victoria Street, Berry NSW 2535', 'Berry', '2535', 'NSW', -34.7753, 150.6950, 'Independent Living', 'independent', 380000, 560000, 640, 960, 'DMF', 6, 30, '["Gardens", "Community centre", "Heritage style", "Library"]'::jsonb, '["Emergency response"]'::jsonb, '["Social events", "Garden club", "Cafe visits", "Farm visits"]'::jsonb, false, 62, ARRAY['2 bedroom', '3 bedroom'], 55, '1300 228 655', 'berry@boltonclarke.com.au', 'https://www.boltonclarke.com.au', 'Historic Southern Highlands village retirement community with heritage-style villas in charming Berry township. Walk to boutique shops, cafes and berry farms.', 'approved', 'admin', true),

-- 18. Villa Maria Catholic Homes Bulli
('Villa Maria Catholic Homes Bulli', 'Villa Maria Catholic Homes', '88 Park Road, Bulli NSW 2516', 'Bulli', '2516', 'NSW', -34.3342, 150.9164, 'Mixed', 'Mixed', 360000, 540000, 600, 920, 'DMF', 6, 30, '["Chapel", "Ocean views", "Gardens", "Community centre"]'::jsonb, '["Emergency response", "Aged care", "24/7 nursing", "Pastoral care"]'::jsonb, '["Chapel services", "Social events", "Garden club", "Beach walks", "Coastal drives"]'::jsonb, true, 78, ARRAY['1 bedroom', '2 bedroom'], 55, '02 4267 3100', 'bulli@vmch.com.au', 'https://www.vmch.com.au', 'Coastal escarpment retirement village with ocean views and Catholic community. Chapel, pastoral care, gardens and aged care. Walk to Bulli Beach and scenic coastal drives.', 'approved', 'admin', true),

-- 19. Japara Warrawong
('Japara Warrawong', 'Japara', '42 King Street, Warrawong NSW 2502', 'Warrawong', '2502', 'NSW', -34.4928, 150.8933, 'Mixed', 'Mixed', 260000, 400000, 440, 720, 'DMF', 6, 30, '["Community centre", "Gardens", "Cultural centre", "Library"]'::jsonb, '["Emergency response", "Aged care", "24/7 nursing"]'::jsonb, '["Social events", "Garden club", "Cultural programs", "Shopping trips"]'::jsonb, true, 86, ARRAY['1 bedroom', '2 bedroom'], 55, '1800 52 72 72', 'warrawong@japara.com.au', 'https://www.japara.com.au', 'Wollongong industrial suburb retirement community with affordable villas and aged care facility. Multicultural friendly with community programs. Close to Warrawong Plaza.', 'approved', 'admin', true),

-- 20. Tricare Windang
('Tricare Windang', 'Tricare', '1 Lake Entrance Road, Windang NSW 2528', 'Windang', '2528', 'NSW', -34.5267, 150.8658, 'Mixed', 'Mixed', 340000, 510000, 600, 920, 'DMF', 6, 30, '["Pool", "Bowling green", "Lake views", "Water access", "Community centre"]'::jsonb, '["Emergency response", "Aged care", "24/7 nursing"]'::jsonb, '["Swimming", "Bowls", "Fishing", "Boating", "Social events"]'::jsonb, false, 92, ARRAY['1 bedroom', '2 bedroom'], 55, '02 4296 3100', 'windang@tricare.com.au', 'https://www.tricare.com.au', 'Lake Illawarra waterfront retirement village with modern villas, lake views and water access. Perfect for fishing and water activities. Short drive to beaches.', 'approved', 'admin', true),

-- 21. Mayflower Robertson
('Mayflower Robertson', 'Mayflower', '88 Hoddle Street, Robertson NSW 2577', 'Robertson', '2577', 'NSW', -34.5856, 150.5956, 'Independent Living', 'independent', 280000, 420000, 480, 760, 'DMF', 6, 30, '["Gardens", "Bushland setting", "Walking trails", "Community centre", "Country views"]'::jsonb, '["Emergency response"]'::jsonb, '["Walking", "Social events", "Garden club", "Nature activities"]'::jsonb, false, 54, ARRAY['1 bedroom', '2 bedroom'], 55, '02 4885 1234', 'robertson@mayflower.org.au', 'https://www.mayflower.org.au', 'Southern Highlands country village retirement in peaceful setting with cool climate gardens. Villas surrounded by farmland and native bushland. Charming country lifestyle.', 'approved', 'admin', true),

-- 22. RSL LifeCare Coniston
('RSL LifeCare Coniston', 'RSL LifeCare', '88 Lake Avenue, Coniston NSW 2500', 'Coniston', '2500', 'NSW', -34.4525, 150.8858, 'Mixed', 'Mixed', 300000, 450000, 520, 800, 'DMF', 6, 30, '["Bowling green", "Community centre", "Gardens", "RSL club"]'::jsonb, '["Emergency response", "Aged care", "24/7 nursing", "Veterans services"]'::jsonb, '["Bowls", "RSL activities", "Social events", "Garden club"]'::jsonb, true, 98, ARRAY['1 bedroom', '2 bedroom'], 55, '02 4229 3100', 'coniston@rsllifecare.org.au', 'https://www.rsllifecare.org.au', 'Wollongong retirement village with veterans services and affordable villas near beaches and University. Strong community spirit with regular RSL activities.', 'approved', 'admin', true),

-- 23. Ingenia Lifestyle Lake Conjola
('Ingenia Lifestyle Lake Conjola', 'Ingenia Communities', '1 Lakeside Close, Lake Conjola NSW 2539', 'Lake Conjola', '2539', 'NSW', -35.2556, 150.4833, 'Independent Living', 'independent', 220000, 380000, 360, 600, 'Site Fees', 0, 0, '["Pool", "Bowling green", "Lake access", "Beach access", "Community centre", "Fishing"]'::jsonb, '["Emergency response"]'::jsonb, '["Swimming", "Bowls", "Fishing", "Boating", "Social events"]'::jsonb, true, 164, ARRAY['2 bedroom', '3 bedroom'], 50, '02 4455 1234', 'conjola@ingeniacommunities.com.au', 'https://www.ingeniacommunities.com.au', 'South Coast over-50s resort near pristine Lake Conjola with modern manufactured homes. Lake and beach access with pool, bowling green and fishing. Perfect holiday destination.', 'approved', 'admin', true),

-- 24. NewDirection Care Shellharbour
('NewDirection Care Shellharbour', 'NewDirection Care', '1 Marina Drive, Shellharbour NSW 2529', 'Shellharbour', '2529', 'NSW', -34.5792, 150.8647, 'Mixed', 'Mixed', 380000, 580000, 640, 960, 'DMF', 6, 30, '["Pool", "Gym", "Marina views", "Community centre", "Gardens"]'::jsonb, '["Emergency response", "Aged care", "24/7 nursing"]'::jsonb, '["Swimming", "Exercise classes", "Social events", "Marina walks"]'::jsonb, false, 124, ARRAY['1 bedroom', '2 bedroom'], 55, '02 4297 3100', 'shellharbour@newdirection.com.au', 'https://www.newdirection.com.au', 'Modern Shellharbour retirement community near marina with contemporary apartments. Walk to Shell Cove Marina, beaches and Stockland shopping. Coastal lifestyle living.', 'approved', 'admin', true),

-- 25. Arcare Unanderra
('Arcare Unanderra', 'Arcare', '88 Princes Highway, Unanderra NSW 2526', 'Unanderra', '2526', 'NSW', -34.4539, 150.8469, 'Mixed', 'Mixed', 320000, 480000, 560, 840, 'DMF', 6, 30, '["Pool", "Mountain views", "Community centre", "Gardens"]'::jsonb, '["Emergency response", "Aged care", "24/7 nursing"]'::jsonb, '["Swimming", "Social events", "Garden club", "Shopping trips"]'::jsonb, false, 86, ARRAY['1 bedroom', '2 bedroom'], 55, '1300 272 273', 'unanderra@arcare.com.au', 'https://www.arcare.com.au', 'Western Wollongong retirement community near escarpment with modern villas and mountain views. Close to Wollongong Hospital, University and shopping centres.', 'approved', 'admin', true);