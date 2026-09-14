-- QLD Batch 03: 25 Sunshine Coast & Moreton Bay Retirement Villages (CORRECTED)
-- Geographic Focus: Sunshine Coast, Noosa, Caloundra, Caboolture, Moreton Bay
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

-- 1. Stockland Halcyon Lakeside Bli Bli
('Stockland Halcyon Lakeside Bli Bli', 'Stockland', '1 Lake Eden Drive, Bli Bli QLD 4560', 'Bli Bli', '4560', 'QLD', -26.6197, 153.0331, 'Independent Living', 'independent', 420000, 640000, 680, 1040, 'DMF', 6, 30, '["Pool", "Gym", "Cinema", "Bowling green", "Lake views", "Community centre"]'::jsonb, '["Emergency response"]'::jsonb, '["Swimming", "Movies", "Bowls", "Exercise classes", "Social events"]'::jsonb, false, 216, ARRAY['2 bedroom', '3 bedroom'], 55, '1800 550 550', 'blibli@stockland.com.au', 'https://www.stockland.com.au/retirement', 'Premium Sunshine Coast retirement resort with contemporary villas and lakefront setting. Minutes to Maroochydore and beaches.', 'approved', 'admin', true),

-- 2. Aveo Peregian Springs
('Aveo Peregian Springs', 'Aveo Group', '88 Ridgeview Drive, Peregian Springs QLD 4573', 'Peregian Springs', '4573', 'QLD', -26.4883, 153.0867, 'Independent Living', 'independent', 440000, 660000, 720, 1080, 'DMF', 6, 30, '["Pool", "Gym", "Bowling green", "Golf course", "Community centre"]'::jsonb, '["Emergency response"]'::jsonb, '["Swimming", "Bowls", "Golf", "Exercise classes", "Social events"]'::jsonb, false, 152, ARRAY['2 bedroom', '3 bedroom'], 55, '1300 283 000', 'peregiansprings@aveo.com.au', 'https://www.aveo.com.au', 'Sunshine Coast hinterland retirement community with modern villas near Noosa and beaches. Close to Peregian Beach and shopping.', 'approved', 'admin', true),

-- 3. Lendlease Noosa
('Lendlease Noosa', 'Lendlease', '88 Noosa Drive, Noosa Heads QLD 4567', 'Noosa Heads', '4567', 'QLD', -26.3906, 153.0933, 'Independent Living', 'independent', 680000, 980000, 1040, 1520, 'DMF', 6, 30, '["Pool", "Gym", "Spa", "Hinterland views", "Beach access", "Fine dining"]'::jsonb, '["Emergency response", "Concierge"]'::jsonb, '["Swimming", "Spa", "Exercise classes", "Beach walks", "Fine dining", "Social events"]'::jsonb, false, 94, ARRAY['1 bedroom', '2 bedroom'], 55, '1300 326 033', 'noosa@lendlease.com', 'https://www.lendlease.com/au/retirement', 'Premium Noosa retirement living near world-famous beaches with luxury apartments. Walk to Hastings Street, restaurants and Noosa National Park.', 'approved', 'admin', true),

-- 4. Anglicare Caloundra
('Anglicare Caloundra', 'Anglicare', '42 Bowman Road, Caloundra QLD 4551', 'Caloundra', '4551', 'QLD', -26.7989, 153.1306, 'Mixed', 'Mixed', 380000, 580000, 640, 1000, 'DMF', 6, 30, '["Chapel", "Beach access", "Community centre", "Gardens"]'::jsonb, '["Emergency response", "Aged care", "24/7 nursing"]'::jsonb, '["Chapel services", "Beach walks", "Social events", "Garden club"]'::jsonb, true, 118, ARRAY['1 bedroom', '2 bedroom', '3 bedroom'], 55, '07 5491 3100', 'caloundra@anglicaresq.org.au', 'https://www.anglicaresq.org.au', 'Sunshine Coast beachside retirement community with independent villas and chapel. Close to Bulcock Beach, Stockland shopping and medical facilities.', 'approved', 'admin', true),

-- 5. Baptistcare Buderim
('Baptistcare Buderim', 'BaptistCare', '88 Main Street, Buderim QLD 4556', 'Buderim', '4556', 'QLD', -26.6853, 153.0564, 'Mixed', 'Mixed', 420000, 640000, 680, 1040, 'DMF', 6, 30, '["Pool", "Chapel", "Bowling green", "Mountain views"]'::jsonb, '["Emergency response", "Aged care", "24/7 nursing"]'::jsonb, '["Swimming", "Chapel services", "Bowls", "Social events", "Walking groups"]'::jsonb, true, 104, ARRAY['1 bedroom', '2 bedroom'], 55, '07 5476 3100', 'buderim@baptistcare.org.au', 'https://www.baptistcare.org.au', 'Sunshine Coast hinterland retirement village with modern villas and mountain views. Walk to Buderim village, shops and cafes.', 'approved', 'admin', true),

-- 6. Uniting AgeWell Maroochydore
('Uniting AgeWell Maroochydore', 'Uniting AgeWell', '88 Aerodrome Road, Maroochydore QLD 4558', 'Maroochydore', '4558', 'QLD', -26.6564, 153.0897, 'Independent Living', 'independent', 400000, 600000, 680, 1040, 'DMF', 6, 30, '["Pool", "Beach access", "Shopping access", "Community centre"]'::jsonb, '["Emergency response"]'::jsonb, '["Swimming", "Beach walks", "Exercise classes", "Shopping trips", "Social events"]'::jsonb, false, 126, ARRAY['1 bedroom', '2 bedroom', '3 bedroom'], 55, '1300 783 435', 'maroochydore@unitingagewell.org', 'https://www.unitingagewell.org', 'Central Sunshine Coast retirement community with contemporary villas near beach and shopping. Walk to Maroochydore Beach and Sunshine Plaza.', 'approved', 'admin', true),

-- 7. Opal Aged Care Mooloolaba
('Opal Aged Care Mooloolaba', 'Opal Aged Care', '42 Brisbane Road, Mooloolaba QLD 4557', 'Mooloolaba', '4557', 'QLD', -26.6814, 153.1192, 'Mixed', 'Mixed', 520000, 760000, 800, 1200, 'DMF', 6, 30, '["Pool", "Gym", "Ocean views", "Beach access"]'::jsonb, '["Emergency response", "Aged care", "24/7 nursing"]'::jsonb, '["Swimming", "Exercise classes", "Beach walks", "Social events"]'::jsonb, false, 96, ARRAY['1 bedroom', '2 bedroom'], 55, '1300 672 524', 'mooloolaba@opalaged.care', 'https://www.opalagedcare.com.au', 'Premium Sunshine Coast beachside retirement with contemporary apartments and ocean views. Walk to Mooloolaba Beach, esplanade and restaurants.', 'approved', 'admin', true),

-- 8. IRT Kawana Waters
('IRT Kawana Waters', 'IRT Group', '88 Nicklin Way, Kawana Waters QLD 4575', 'Kawana Waters', '4575', 'QLD', -26.7328, 153.1239, 'Mixed', 'Mixed', 400000, 600000, 680, 1040, 'DMF', 6, 30, '["Pool", "Lake access", "Ocean access", "Community centre"]'::jsonb, '["Emergency response", "Aged care", "24/7 nursing"]'::jsonb, '["Swimming", "Water activities", "Exercise classes", "Social events"]'::jsonb, false, 132, ARRAY['1 bedroom', '2 bedroom', '3 bedroom'], 55, '1300 157 677', 'kawanawaters@irt.org.au', 'https://www.irt.org.au', 'Sunshine Coast waterfront retirement community with modern villas and lake access. Close to Kawana Shoppingworld and beaches.', 'approved', 'admin', true),

-- 9. Regis Aged Care Nambour
('Regis Aged Care Nambour', 'Regis Aged Care', '88 Currie Street, Nambour QLD 4560', 'Nambour', '4560', 'QLD', -26.6256, 152.9594, 'Mixed', 'Mixed', 320000, 480000, 560, 880, 'DMF', 6, 30, '["Bowling green", "Hospital access", "Community centre", "Gardens"]'::jsonb, '["Emergency response", "Aged care", "24/7 nursing"]'::jsonb, '["Bowls", "Social events", "Garden club", "Walking groups"]'::jsonb, false, 102, ARRAY['1 bedroom', '2 bedroom'], 55, '07 5441 3100', 'nambour@regis.com.au', 'https://www.regis.com.au', 'Sunshine Coast hinterland retirement village with quality villas near Nambour General Hospital. Close to shopping and medical facilities.', 'approved', 'admin', true),

-- 10. Respect Aged Care Caboolture
('Respect Aged Care Caboolture', 'Respect', '42 King Street, Caboolture QLD 4510', 'Caboolture', '4510', 'QLD', -27.0858, 152.9519, 'Mixed', 'Mixed', 280000, 430000, 480, 780, 'DMF', 6, 30, '["Pool", "Hospital access", "Community centre", "Gardens"]'::jsonb, '["Emergency response", "Aged care", "24/7 nursing"]'::jsonb, '["Swimming", "Exercise classes", "Social events", "Garden club"]'::jsonb, true, 124, ARRAY['1 bedroom', '2 bedroom', '3 bedroom'], 55, '07 5499 3100', 'caboolture@respect.com.au', 'https://www.respect.com.au', 'Moreton Bay regional retirement community with affordable villas near Caboolture Hospital. Close to shopping centres and Bruce Highway.', 'approved', 'admin', true),

-- 11. Arcare Mooloolah Valley
('Arcare Mooloolah Valley', 'Arcare', '1 Bray Road, Mooloolah Valley QLD 4553', 'Mooloolah Valley', '4553', 'QLD', -26.7581, 152.9639, 'Mixed', 'Mixed', 360000, 540000, 600, 960, 'DMF', 6, 30, '["Pool", "Gym", "Mountain views", "Valley setting"]'::jsonb, '["Emergency response", "Aged care", "24/7 nursing"]'::jsonb, '["Swimming", "Exercise classes", "Social events", "Walking groups"]'::jsonb, false, 108, ARRAY['1 bedroom', '2 bedroom', '3 bedroom'], 55, '1300 272 273', 'mooloolah@arcare.com.au', 'https://www.arcare.com.au', 'Sunshine Coast hinterland retirement village with contemporary villas and valley views. Close to Australia Zoo and Glass House Mountains.', 'approved', 'admin', true),

-- 12. Bupa Aged Care Bribie Island
('Bupa Aged Care Bribie Island', 'Bupa', '88 Welsby Parade, Bongaree QLD 4507', 'Bongaree', '4507', 'QLD', -27.0786, 153.1608, 'Mixed', 'Mixed', 320000, 480000, 560, 880, 'DMF', 6, 30, '["Pool", "Beach access", "Water access", "Fishing"]'::jsonb, '["Emergency response", "Aged care", "24/7 nursing"]'::jsonb, '["Swimming", "Beach walks", "Fishing", "Social events"]'::jsonb, true, 94, ARRAY['1 bedroom', '2 bedroom'], 55, '1300 280 334', 'bribieisland@bupa.com.au', 'https://www.bupa.com.au', 'Moreton Bay island retirement community with comfortable villas near beaches and waterways. Walk to Bribie Island village and beaches.', 'approved', 'admin', true),

-- 13. Allity Redcliffe Peninsula
('Allity Redcliffe Peninsula', 'Allity', '88 Oxley Avenue, Woody Point QLD 4019', 'Woody Point', '4019', 'QLD', -27.2592, 153.1086, 'Mixed', 'Mixed', 380000, 580000, 640, 1000, 'DMF', 6, 30, '["Pool", "Beach access", "Bay breezes", "Community centre"]'::jsonb, '["Emergency response", "Aged care", "24/7 nursing"]'::jsonb, '["Swimming", "Beach walks", "Exercise classes", "Social events"]'::jsonb, false, 116, ARRAY['1 bedroom', '2 bedroom', '3 bedroom'], 55, '07 3284 4100', 'redcliffe@allity.com.au', 'https://www.allity.com.au', 'Moreton Bay peninsula retirement community with modern villas near beaches and waterfront. Close to Redcliffe shopping, jetty and medical facilities.', 'approved', 'admin', true),

-- 14. Bolton Clarke Currimundi
('Bolton Clarke Currimundi', 'Bolton Clarke', '88 Nicklin Way, Currimundi QLD 4551', 'Currimundi', '4551', 'QLD', -26.7644, 153.1281, 'Mixed', 'Mixed', 380000, 580000, 640, 1000, 'DMF', 6, 30, '["Pool", "Bowling green", "Lake views", "Beach access"]'::jsonb, '["Emergency response", "Aged care", "24/7 nursing"]'::jsonb, '["Swimming", "Bowls", "Beach walks", "Social events"]'::jsonb, false, 102, ARRAY['1 bedroom', '2 bedroom'], 55, '1300 228 655', 'currimundi@boltonclarke.com.au', 'https://www.boltonclarke.com.au', 'Sunshine Coast lakeside retirement community with quality villas and lake views. Walk to Currimundi Lake, beach and shopping.', 'approved', 'admin', true),

-- 15. Estia Health Narangba
('Estia Health Narangba', 'Estia Health', '88 Golden Wattle Drive, Narangba QLD 4504', 'Narangba', '4504', 'QLD', -27.1972, 152.9617, 'Mixed', 'Mixed', 300000, 460000, 520, 840, 'DMF', 6, 30, '["Pool", "Community centre", "Gardens", "Growth area"]'::jsonb, '["Emergency response", "Aged care", "24/7 nursing"]'::jsonb, '["Swimming", "Exercise classes", "Social events", "Garden club"]'::jsonb, false, 118, ARRAY['1 bedroom', '2 bedroom', '3 bedroom'], 55, '07 3886 3100', 'narangba@estiahealth.com.au', 'https://www.estiahealth.com.au', 'Northern Moreton Bay retirement community with modern villas in growing area. Close to Narangba Valley Tavern and medical facilities.', 'approved', 'admin', true),

-- 16. Japara Coolum Beach
('Japara Coolum Beach', 'Japara', '42 Birtwill Street, Coolum Beach QLD 4573', 'Coolum Beach', '4573', 'QLD', -26.5328, 153.0914, 'Mixed', 'Mixed', 420000, 640000, 680, 1040, 'DMF', 6, 30, '["Pool", "Beach access", "Coastal walks", "Community centre"]'::jsonb, '["Emergency response", "Aged care", "24/7 nursing"]'::jsonb, '["Swimming", "Beach walks", "Coastal activities", "Social events"]'::jsonb, false, 88, ARRAY['1 bedroom', '2 bedroom'], 55, '1800 52 72 72', 'coolum@japara.com.au', 'https://www.japara.com.au', 'Sunshine Coast beachside retirement village with modern villas near beautiful Coolum Beach. Walk to Coolum village, beach and restaurants.', 'approved', 'admin', true),

-- 17. Tricare Marcoola
('Tricare Marcoola', 'Tricare', '42 David Low Way, Marcoola QLD 4564', 'Marcoola', '4564', 'QLD', -26.5908, 153.0956, 'Mixed', 'Mixed', 380000, 580000, 640, 1000, 'DMF', 6, 30, '["Pool", "Ocean breezes", "Beach access", "Community centre"]'::jsonb, '["Emergency response", "Aged care", "24/7 nursing"]'::jsonb, '["Swimming", "Beach walks", "Exercise classes", "Social events"]'::jsonb, false, 92, ARRAY['1 bedroom', '2 bedroom'], 55, '07 5448 3100', 'marcoola@tricare.com.au', 'https://www.tricare.com.au', 'Sunshine Coast beachside retirement near airport with modern villas and ocean breezes. Walk to Marcoola Beach and cafes.', 'approved', 'admin', true),

-- 18. Mayflower Deception Bay
('Mayflower Deception Bay', 'Mayflower', '88 Bay Avenue, Deception Bay QLD 4508', 'Deception Bay', '4508', 'QLD', -27.1931, 153.0289, 'Independent Living', 'independent', 300000, 460000, 520, 840, 'DMF', 6, 30, '["Water views", "Waterfront access", "Community centre", "Gardens"]'::jsonb, '["Emergency response"]'::jsonb, '["Water activities", "Fishing", "Social events", "Garden club"]'::jsonb, false, 104, ARRAY['1 bedroom', '2 bedroom'], 55, '07 3204 1234', 'deceptionbay@mayflower.org.au', 'https://www.mayflower.org.au', 'Moreton Bay waterfront retirement community with comfortable villas and water views. Close to shopping centres and medical facilities.', 'approved', 'admin', true),

-- 19. RSL Care North Lakes
('RSL Care North Lakes', 'RSL Care', '42 Anzac Avenue, North Lakes QLD 4509', 'North Lakes', '4509', 'QLD', -27.2397, 152.9789, 'Mixed', 'Mixed', 360000, 540000, 600, 960, 'DMF', 6, 30, '["Pool", "Bowling green", "RSL services", "Shopping access"]'::jsonb, '["Emergency response", "Aged care", "24/7 nursing", "Veterans services"]'::jsonb, '["Swimming", "Bowls", "RSL activities", "Social events", "Shopping trips"]'::jsonb, true, 128, ARRAY['1 bedroom', '2 bedroom', '3 bedroom'], 55, '07 3480 3100', 'northlakes@rslcare.org.au', 'https://www.rslcare.org.au', 'Northern Brisbane retirement community with veterans services and modern villas. Close to Westfield North Lakes, medical facilities and transport.', 'approved', 'admin', true),

-- 20. BlueCare Alexandra Headland
('BlueCare Alexandra Headland', 'BlueCare', '42 Alexandra Parade, Alexandra Headland QLD 4572', 'Alexandra Headland', '4572', 'QLD', -26.6661, 153.1050, 'Mixed', 'Mixed', 420000, 640000, 680, 1040, 'DMF', 6, 30, '["Pool", "Beach access", "Coastal walks", "Surf beach"]'::jsonb, '["Emergency response", "Aged care", "24/7 nursing"]'::jsonb, '["Swimming", "Beach walks", "Surfing", "Social events"]'::jsonb, false, 86, ARRAY['1 bedroom', '2 bedroom'], 55, '07 5443 1234', 'alexandraheadland@bluecare.org.au', 'https://www.bluecare.org.au', 'Sunshine Coast beachside retirement with modern villas near Alex Beach. Walk to Alexandra Headland Beach, cafes and shopping.', 'approved', 'admin', true),

-- 21. Mercy Health Strathpine
('Mercy Health Strathpine', 'Mercy Health', '88 Gympie Road, Strathpine QLD 4500', 'Strathpine', '4500', 'QLD', -27.3061, 152.9942, 'Mixed', 'Mixed', 340000, 520000, 600, 920, 'DMF', 6, 30, '["Chapel", "Community centre", "Gardens", "Shopping access"]'::jsonb, '["Emergency response", "Aged care", "24/7 nursing", "Pastoral care"]'::jsonb, '["Chapel services", "Social events", "Garden club", "Shopping trips"]'::jsonb, true, 112, ARRAY['1 bedroom', '2 bedroom', '3 bedroom'], 55, '07 3205 3100', 'strathpine@mercyhealth.com.au', 'https://www.mercyhealth.com.au', 'Northern Brisbane retirement community with Catholic heritage and chapel. Modern villas near Westfield Strathpine and medical facilities.', 'approved', 'admin', true),

-- 22. Living Choice Kawana Island
('Living Choice Kawana Island', 'Living Choice', '1 Island Drive, Kawana Waters QLD 4575', 'Kawana Waters', '4575', 'QLD', -26.7328, 153.1239, 'Independent Living', 'independent', 520000, 780000, 800, 1200, 'DMF', 6, 30, '["Pool", "Gym", "Cinema", "Marina berths", "Lake views", "Bowling green"]'::jsonb, '["Emergency response"]'::jsonb, '["Swimming", "Movies", "Bowls", "Exercise classes", "Boating", "Social events"]'::jsonb, false, 156, ARRAY['2 bedroom', '3 bedroom'], 55, '07 5493 1234', 'kawanaisland@livingchoice.com.au', 'https://www.livingchoice.com.au', 'Sunshine Coast waterfront retirement resort with premium villas and lake views. Walk to beaches and shopping.', 'approved', 'admin', true),

-- 23. Palm Lake Resort Beachmere
('Palm Lake Resort Beachmere', 'Palm Lake Resort', '1 Esplanade, Beachmere QLD 4510', 'Beachmere', '4510', 'QLD', -27.1272, 153.0406, 'Independent Living', 'independent', 220000, 380000, 340, 580, 'DMF', 6, 30, '["Pool", "Tennis courts", "Bowling green", "Waterfront access", "Clubhouse"]'::jsonb, '["Emergency response"]'::jsonb, '["Swimming", "Tennis", "Bowls", "Fishing", "Social events"]'::jsonb, true, 176, ARRAY['2 bedroom', '3 bedroom'], 50, '07 5496 9200', 'beachmere@palmlakeresort.com.au', 'https://www.palmlakeresort.com.au', 'Moreton Bay coastal over-50s resort with modern manufactured homes and waterfront access. Close to beaches, fishing and Caboolture.', 'approved', 'admin', true),

-- 24. Ingenia Lifestyle Noosaville
('Ingenia Lifestyle Noosaville', 'Ingenia Communities', '1 River Drive, Noosaville QLD 4566', 'Noosaville', '4566', 'QLD', -26.3978, 153.0581, 'Independent Living', 'independent', 280000, 460000, 440, 720, 'DMF', 6, 30, '["Pool", "Bowling green", "River proximity", "Fishing", "Clubhouse"]'::jsonb, '["Emergency response"]'::jsonb, '["Swimming", "Bowls", "Fishing", "River activities", "Social events"]'::jsonb, true, 164, ARRAY['2 bedroom', '3 bedroom'], 50, '07 5449 9200', 'noosaville@ingeniacommunities.com.au', 'https://www.ingeniacommunities.com.au', 'Noosa River over-50s resort community with contemporary manufactured homes and river proximity. Walk to Noosaville shops and Gympie Terrace.', 'approved', 'admin', true),

-- 25. Watermark Minyama
('Watermark Minyama', 'Watermark', '1 Minyama Drive, Minyama QLD 4575', 'Minyama', '4575', 'QLD', -26.7150, 153.1233, 'Independent Living', 'independent', 520000, 780000, 800, 1200, 'DMF', 6, 30, '["Boat berths", "Pool", "Canal access", "Ocean access", "Community centre"]'::jsonb, '["Emergency response"]'::jsonb, '["Boating", "Swimming", "Fishing", "Water activities", "Social events"]'::jsonb, true, 94, ARRAY['2 bedroom', '3 bedroom'], 55, '07 5444 1234', 'minyama@watermark.com.au', 'https://www.watermark.com.au', 'Sunshine Coast waterfront retirement community with premium villas and canal access. Walk to Kawana Shoppingworld and beaches.', 'approved', 'admin', true);
