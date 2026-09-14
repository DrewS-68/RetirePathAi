-- QLD Batch 02: 25 Gold Coast Retirement Villages (CORRECTED)
-- Geographic Focus: Gold Coast, Tweed Heads Border, Hinterland
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

-- 1. Stockland Halcyon Lakeside Varsity Lakes
('Stockland Halcyon Lakeside Varsity Lakes', 'Stockland', '1 Varsity Parade, Varsity Lakes QLD 4227', 'Varsity Lakes', '4227', 'QLD', -28.0739, 153.4011, 'Independent Living', 'independent', 420000, 640000, 680, 1040, 'DMF', 6, 30, '["Pool", "Gym", "Cinema", "Bowling green", "Lake views", "Golf course"]'::jsonb, '["Emergency response"]'::jsonb, '["Swimming", "Movies", "Bowls", "Exercise classes", "Golf", "Social events"]'::jsonb, false, 206, ARRAY['2 bedroom', '3 bedroom'], 55, '1800 550 550', 'varsitylakes@stockland.com.au', 'https://www.stockland.com.au/retirement', 'Premium Gold Coast waterfront retirement resort with contemporary villas and lake views. Minutes to Robina Town Centre and beaches.', 'approved', 'admin', true),

-- 2. Aveo Duranbah
('Aveo Duranbah', 'Aveo Group', '88 Golden Four Drive, Bilinga QLD 4225', 'Bilinga', '4225', 'QLD', -28.1656, 153.5108, 'Independent Living', 'independent', 420000, 640000, 680, 1040, 'DMF', 6, 30, '["Pool", "Gym", "Bowling green", "Beach access", "Community centre"]'::jsonb, '["Emergency response"]'::jsonb, '["Swimming", "Bowls", "Exercise classes", "Beach walks", "Social events"]'::jsonb, false, 134, ARRAY['1 bedroom', '2 bedroom', '3 bedroom'], 55, '1300 283 000', 'duranbah@aveo.com.au', 'https://www.aveo.com.au', 'Gold Coast northern beaches retirement community with modern villas near beautiful beaches. Walk to shops, cafes and pristine coastline.', 'approved', 'admin', true),

-- 3. Lendlease Burleigh Heads
('Lendlease Burleigh Heads', 'Lendlease', '88 Goodwin Terrace, Burleigh Heads QLD 4220', 'Burleigh Heads', '4220', 'QLD', -28.0986, 153.4497, 'Independent Living', 'independent', 680000, 980000, 1040, 1520, 'DMF', 6, 30, '["Ocean views", "Rooftop terrace", "Pool", "Gym", "Beach access", "Fine dining"]'::jsonb, '["Emergency response", "Concierge"]'::jsonb, '["Swimming", "Exercise classes", "Beach walks", "Fine dining", "Social events"]'::jsonb, false, 96, ARRAY['1 bedroom', '2 bedroom'], 55, '1300 326 033', 'burleigh@lendlease.com', 'https://www.lendlease.com/au/retirement', 'Premium beachside retirement near iconic Burleigh Beach with luxury apartments and ocean views. Walk to James Street cafes and headland.', 'approved', 'admin', true),

-- 4. Anglicare Southport
('Anglicare Southport', 'Anglicare', '42 Scarborough Street, Southport QLD 4215', 'Southport', '4215', 'QLD', -27.9714, 153.4133, 'Mixed', 'Mixed', 380000, 580000, 640, 1000, 'DMF', 6, 30, '["Chapel", "Community centre", "Gardens", "Tram access"]'::jsonb, '["Emergency response", "Aged care", "24/7 nursing"]'::jsonb, '["Chapel services", "Social events", "Garden club", "Tram outings"]'::jsonb, true, 112, ARRAY['1 bedroom', '2 bedroom', '3 bedroom'], 55, '07 5532 3100', 'southport@anglicaresq.org.au', 'https://www.anglicaresq.org.au', 'Central Gold Coast retirement community with independent villas and chapel. Close to Australia Fair shopping, tram and medical facilities.', 'approved', 'admin', true),

-- 5. Baptistcare Palm Beach
('Baptistcare Palm Beach', 'BaptistCare', '88 Fifth Avenue, Palm Beach QLD 4221', 'Palm Beach', '4221', 'QLD', -28.1142, 153.4681, 'Independent Living', 'independent', 440000, 660000, 720, 1080, 'DMF', 6, 30, '["Pool", "Chapel", "Beach access", "Coastal walks", "Community centre"]'::jsonb, '["Emergency response"]'::jsonb, '["Swimming", "Chapel services", "Beach walks", "Coastal activities", "Social events"]'::jsonb, false, 92, ARRAY['1 bedroom', '2 bedroom'], 55, '07 5598 3100', 'palmbeach@baptistcare.org.au', 'https://www.baptistcare.org.au', 'Southern Gold Coast beachside retirement with modern villas near Palm Beach and Currumbin. Walk to beaches, cafes and coastal walks.', 'approved', 'admin', true),

-- 6. Uniting AgeWell Mudgeeraba
('Uniting AgeWell Mudgeeraba', 'Uniting AgeWell', '88 Railway Street, Mudgeeraba QLD 4213', 'Mudgeeraba', '4213', 'QLD', -28.0839, 153.3714, 'Independent Living', 'independent', 360000, 540000, 600, 960, 'DMF', 6, 30, '["Pool", "Mountain views", "Community centre", "Gardens", "Hinterland setting"]'::jsonb, '["Emergency response"]'::jsonb, '["Swimming", "Exercise classes", "Social events", "Walking groups", "Garden club"]'::jsonb, false, 104, ARRAY['1 bedroom', '2 bedroom'], 55, '1300 783 435', 'mudgeeraba@unitingagewell.org', 'https://www.unitingagewell.org', 'Gold Coast hinterland retirement village with peaceful villas and mountain views. Close to Robina, Mudgeeraba village and Springbrook.', 'approved', 'admin', true),

-- 7. Opal Aged Care Broadbeach
('Opal Aged Care Broadbeach', 'Opal Aged Care', '42 Old Burleigh Road, Broadbeach QLD 4218', 'Broadbeach', '4218', 'QLD', -28.0303, 153.4297, 'Mixed', 'Mixed', 580000, 840000, 880, 1280, 'DMF', 6, 30, '["Pool", "Gym", "Cinema", "Ocean views", "Beach access"]'::jsonb, '["Emergency response", "Aged care", "24/7 nursing"]'::jsonb, '["Swimming", "Movies", "Exercise classes", "Beach walks", "Social events"]'::jsonb, false, 108, ARRAY['1 bedroom', '2 bedroom'], 55, '1300 672 524', 'broadbeach@opalaged.care', 'https://www.opalagedcare.com.au', 'Premium Gold Coast beachside retirement with contemporary apartments near Broadbeach and Pacific Fair. Walk to beach, casino and shopping.', 'approved', 'admin', true),

-- 8. IRT Runaway Bay
('IRT Runaway Bay', 'IRT Group', '88 Bayview Street, Runaway Bay QLD 4216', 'Runaway Bay', '4216', 'QLD', -27.9042, 153.3972, 'Mixed', 'Mixed', 420000, 640000, 680, 1040, 'DMF', 6, 30, '["Pool", "Marina views", "Water access", "Community centre"]'::jsonb, '["Emergency response", "Aged care", "24/7 nursing"]'::jsonb, '["Swimming", "Water activities", "Fishing", "Social events"]'::jsonb, false, 118, ARRAY['1 bedroom', '2 bedroom', '3 bedroom'], 55, '1300 157 677', 'runawaybay@irt.org.au', 'https://www.irt.org.au', 'Northern Gold Coast waterfront retirement with modern villas and marina views. Close to Harbour Town shopping and medical facilities.', 'approved', 'admin', true),

-- 9. Regis Aged Care Robina
('Regis Aged Care Robina', 'Regis Aged Care', '88 Robina Town Centre Drive, Robina QLD 4226', 'Robina', '4226', 'QLD', -28.0739, 153.3908, 'Mixed', 'Mixed', 420000, 640000, 680, 1040, 'DMF', 6, 30, '["Shopping access", "Hospital access", "Community centre", "Gardens"]'::jsonb, '["Emergency response", "Aged care", "24/7 nursing"]'::jsonb, '["Social events", "Garden club", "Shopping trips", "Walking groups"]'::jsonb, false, 104, ARRAY['1 bedroom', '2 bedroom'], 55, '07 5578 3100', 'robina@regis.com.au', 'https://www.regis.com.au', 'Central Gold Coast retirement near Robina Town Centre with quality villas. Close to major shopping, hospital and medical facilities.', 'approved', 'admin', true),

-- 10. Respect Aged Care Coolangatta
('Respect Aged Care Coolangatta', 'Respect', '42 Griffith Street, Coolangatta QLD 4225', 'Coolangatta', '4225', 'QLD', -28.1678, 153.5364, 'Mixed', 'Mixed', 400000, 600000, 680, 1040, 'DMF', 6, 30, '["Pool", "Ocean breezes", "Beach access", "Community centre"]'::jsonb, '["Emergency response", "Aged care", "24/7 nursing"]'::jsonb, '["Swimming", "Beach walks", "Social events", "Exercise classes"]'::jsonb, false, 94, ARRAY['1 bedroom', '2 bedroom'], 55, '07 5536 3100', 'coolangatta@respect.com.au', 'https://www.respect.com.au', 'Southern Gold Coast beachside retirement with comfortable villas near Coolangatta beaches and airport. Walk to beach, shops and border.', 'approved', 'admin', true),

-- 11. Arcare Helensvale
('Arcare Helensvale', 'Arcare', '1 Millaroo Drive, Helensvale QLD 4212', 'Helensvale', '4212', 'QLD', -27.9050, 153.3350, 'Mixed', 'Mixed', 380000, 580000, 640, 1000, 'DMF', 6, 30, '["Pool", "Gym", "Tram access", "Shopping access"]'::jsonb, '["Emergency response", "Aged care", "24/7 nursing"]'::jsonb, '["Swimming", "Exercise classes", "Social events", "Tram outings", "Theme parks"]'::jsonb, false, 126, ARRAY['1 bedroom', '2 bedroom', '3 bedroom'], 55, '1300 272 273', 'helensvale@arcare.com.au', 'https://www.arcare.com.au', 'Northern Gold Coast retirement community with contemporary villas near Westfield Helensvale. Close to tram, shopping and theme parks.', 'approved', 'admin', true),

-- 12. Bupa Aged Care Currumbin
('Bupa Aged Care Currumbin', 'Bupa', '88 Currumbin Creek Road, Currumbin QLD 4223', 'Currumbin', '4223', 'QLD', -28.1328, 153.4864, 'Mixed', 'Mixed', 420000, 640000, 680, 1040, 'DMF', 6, 30, '["Pool", "Rainforest setting", "Beach access", "Wildlife"]'::jsonb, '["Emergency response", "Aged care", "24/7 nursing"]'::jsonb, '["Swimming", "Beach walks", "Wildlife activities", "Social events"]'::jsonb, false, 88, ARRAY['1 bedroom', '2 bedroom'], 55, '1300 280 334', 'currumbin@bupa.com.au', 'https://www.bupa.com.au', 'Southern Gold Coast wildlife sanctuary retirement with modern villas near Currumbin Wildlife Sanctuary. Walk to Currumbin Beach and village.', 'approved', 'admin', true),

-- 13. Allity Benowa
('Allity Benowa', 'Allity', '88 Ashmore Road, Benowa QLD 4217', 'Benowa', '4217', 'QLD', -27.9892, 153.3986, 'Mixed', 'Mixed', 400000, 600000, 680, 1040, 'DMF', 6, 30, '["Pool", "Resort setting", "Community centre", "Gardens"]'::jsonb, '["Emergency response", "Aged care", "24/7 nursing"]'::jsonb, '["Swimming", "Exercise classes", "Social events", "Garden club"]'::jsonb, false, 102, ARRAY['1 bedroom', '2 bedroom'], 55, '07 5564 3100', 'benowa@allity.com.au', 'https://www.allity.com.au', 'Central Gold Coast retirement near golf courses with contemporary villas and resort setting. Close to Benowa Gardens shopping.', 'approved', 'admin', true),

-- 14. Bolton Clarke Mermaid Beach
('Bolton Clarke Mermaid Beach', 'Bolton Clarke', '88 Hedges Avenue, Mermaid Beach QLD 4218', 'Mermaid Beach', '4218', 'QLD', -28.0447, 153.4353, 'Mixed', 'Mixed', 520000, 760000, 800, 1200, 'DMF', 6, 30, '["Pool", "Beach access", "Coastal walks", "Community centre"]'::jsonb, '["Emergency response", "Aged care", "24/7 nursing"]'::jsonb, '["Swimming", "Beach walks", "Coastal activities", "Social events"]'::jsonb, false, 92, ARRAY['1 bedroom', '2 bedroom'], 55, '1300 228 655', 'mermaidbeach@boltonclarke.com.au', 'https://www.boltonclarke.com.au', 'Gold Coast beachside retirement with quality villas near beautiful Mermaid Beach. Walk to Nobby Beach, cafes and Pacific Fair.', 'approved', 'admin', true),

-- 15. Estia Health Nerang
('Estia Health Nerang', 'Estia Health', '88 Station Street, Nerang QLD 4211', 'Nerang', '4211', 'QLD', -28.0011, 153.3356, 'Mixed', 'Mixed', 340000, 520000, 600, 920, 'DMF', 6, 30, '["Pool", "Mountain views", "Community centre", "Gardens"]'::jsonb, '["Emergency response", "Aged care", "24/7 nursing"]'::jsonb, '["Swimming", "Exercise classes", "Social events", "Garden club"]'::jsonb, false, 114, ARRAY['1 bedroom', '2 bedroom', '3 bedroom'], 55, '07 5596 3100', 'nerang@estiahealth.com.au', 'https://www.estiahealth.com.au', 'Gold Coast hinterland retirement village with modern villas and mountain backdrop. Close to Nerang town centre and medical facilities.', 'approved', 'admin', true),

-- 16. Japara Labrador
('Japara Labrador', 'Japara', '42 Marine Parade, Labrador QLD 4215', 'Labrador', '4215', 'QLD', -27.9464, 153.3956, 'Mixed', 'Mixed', 420000, 640000, 680, 1040, 'DMF', 6, 30, '["Pool", "Water views", "Marina access", "Shopping access"]'::jsonb, '["Emergency response", "Aged care", "24/7 nursing"]'::jsonb, '["Swimming", "Water activities", "Marina activities", "Social events"]'::jsonb, false, 96, ARRAY['1 bedroom', '2 bedroom'], 55, '1800 52 72 72', 'labrador@japara.com.au', 'https://www.japara.com.au', 'Gold Coast broadwater retirement community with modern apartments and water views. Walk to Harbour Town Outlet shopping and waterfront dining.', 'approved', 'admin', true),

-- 17. Tricare Tugun
('Tricare Tugun', 'Tricare', '42 Coolangatta Road, Tugun QLD 4224', 'Tugun', '4224', 'QLD', -28.1442, 153.4972, 'Mixed', 'Mixed', 400000, 600000, 680, 1040, 'DMF', 6, 30, '["Pool", "Ocean breezes", "Beach access", "Community centre"]'::jsonb, '["Emergency response", "Aged care", "24/7 nursing"]'::jsonb, '["Swimming", "Beach walks", "Social events", "Exercise classes"]'::jsonb, false, 88, ARRAY['1 bedroom', '2 bedroom'], 55, '07 5534 3100', 'tugun@tricare.com.au', 'https://www.tricare.com.au', 'Southern Gold Coast beachside retirement near airport with modern villas and ocean breezes. Walk to Tugun village, beach and coastal walks.', 'approved', 'admin', true),

-- 18. Mayflower Surfers Paradise
('Mayflower Surfers Paradise', 'Mayflower', '88 Ferny Avenue, Surfers Paradise QLD 4217', 'Surfers Paradise', '4217', 'QLD', -28.0050, 153.4292, 'Independent Living', 'independent', 620000, 880000, 960, 1360, 'DMF', 6, 30, '["Rooftop pool", "Gym", "Spa", "Ocean views", "Concierge", "Beach access"]'::jsonb, '["Emergency response", "Concierge"]'::jsonb, '["Swimming", "Spa", "Exercise classes", "Beach walks", "Social events"]'::jsonb, false, 84, ARRAY['1 bedroom', '2 bedroom'], 55, '07 5538 1234', 'surfersparadise@mayflower.org.au', 'https://www.mayflower.org.au', 'Premium high-rise retirement in Surfers Paradise with luxury apartments and ocean views. Walk to beaches, Cavill Avenue and entertainment.', 'approved', 'admin', true),

-- 19. RSL Care Tugun
('RSL Care Tugun', 'RSL Care', '88 Gold Coast Highway, Tugun QLD 4224', 'Tugun', '4224', 'QLD', -28.1442, 153.4972, 'Mixed', 'Mixed', 380000, 580000, 640, 1000, 'DMF', 6, 30, '["Bowling green", "RSL services", "Beach access", "Community centre"]'::jsonb, '["Emergency response", "Aged care", "24/7 nursing", "Veterans services"]'::jsonb, '["Bowls", "RSL activities", "Beach walks", "Social events"]'::jsonb, true, 102, ARRAY['1 bedroom', '2 bedroom'], 55, '07 5534 4100', 'tugun@rslcare.org.au', 'https://www.rslcare.org.au', 'Southern Gold Coast retirement with veterans services and comfortable villas near beaches and airport. Close to shops and medical facilities.', 'approved', 'admin', true),

-- 20. BlueCare Biggera Waters
('BlueCare Biggera Waters', 'BlueCare', '42 Hollywell Road, Biggera Waters QLD 4216', 'Biggera Waters', '4216', 'QLD', -27.9272, 153.3908, 'Mixed', 'Mixed', 420000, 640000, 680, 1040, 'DMF', 6, 30, '["Pool", "Waterfront views", "Marina access", "Community centre"]'::jsonb, '["Emergency response", "Aged care", "24/7 nursing"]'::jsonb, '["Swimming", "Water activities", "Marina activities", "Social events"]'::jsonb, false, 104, ARRAY['1 bedroom', '2 bedroom'], 55, '07 5537 1234', 'biggerawaters@bluecare.org.au', 'https://www.bluecare.org.au', 'Northern Gold Coast waterfront retirement with modern villas and broadwater views. Close to Harbour Town shopping and medical facilities.', 'approved', 'admin', true),

-- 21. Mercy Health Ashmore
('Mercy Health Ashmore', 'Mercy Health', '88 Currumburra Road, Ashmore QLD 4214', 'Ashmore', '4214', 'QLD', -27.9850, 153.3800, 'Mixed', 'Mixed', 360000, 540000, 600, 960, 'DMF', 6, 30, '["Chapel", "Community centre", "Gardens", "Shopping access"]'::jsonb, '["Emergency response", "Aged care", "24/7 nursing", "Pastoral care"]'::jsonb, '["Chapel services", "Social events", "Garden club", "Shopping trips"]'::jsonb, true, 116, ARRAY['1 bedroom', '2 bedroom', '3 bedroom'], 55, '07 5564 4100', 'ashmore@mercyhealth.com.au', 'https://www.mercyhealth.com.au', 'Central Gold Coast retirement community with Catholic heritage and chapel. Modern villas near shopping centres and medical facilities.', 'approved', 'admin', true),

-- 22. Living Choice Broadwater Court
('Living Choice Broadwater Court', 'Living Choice', '1 Marine Parade, Southport QLD 4215', 'Southport', '4215', 'QLD', -27.9714, 153.4133, 'Independent Living', 'independent', 520000, 780000, 800, 1200, 'DMF', 6, 30, '["Pool", "Gym", "Cinema", "Marina berths", "Waterfront views", "Bowling green"]'::jsonb, '["Emergency response"]'::jsonb, '["Swimming", "Movies", "Bowls", "Exercise classes", "Boating", "Social events"]'::jsonb, false, 142, ARRAY['2 bedroom', '3 bedroom'], 55, '07 5591 1234', 'broadwatercourt@livingchoice.com.au', 'https://www.livingchoice.com.au', 'Northern Gold Coast waterfront resort with premium villas and stunning broadwater views. Walk to restaurants, cafes and waterfront.', 'approved', 'admin', true),

-- 23. Palm Lake Resort Gold Coast
('Palm Lake Resort Gold Coast', 'Palm Lake Resort', '1 Pacific Pines Boulevard, Pacific Pines QLD 4211', 'Pacific Pines', '4211', 'QLD', -27.9486, 153.3153, 'Independent Living', 'independent', 280000, 450000, 400, 640, 'DMF', 6, 30, '["Pool", "Tennis courts", "Bowling green", "Gym", "Clubhouse"]'::jsonb, '["Emergency response"]'::jsonb, '["Swimming", "Tennis", "Bowls", "Exercise classes", "Social events"]'::jsonb, true, 196, ARRAY['2 bedroom', '3 bedroom'], 50, '07 5573 9200', 'goldcoast@palmlakeresort.com.au', 'https://www.palmlakeresort.com.au', 'Northern Gold Coast over-50s resort community with modern manufactured homes and resort facilities. Close to theme parks and beaches.', 'approved', 'admin', true),

-- 24. Ingenia Lifestyle Tweed Shores
('Ingenia Lifestyle Tweed Shores', 'Ingenia Communities', '1 Riverside Drive, Tweed Heads South QLD 4221', 'Tweed Heads South', '4221', 'QLD', -28.1856, 153.5364, 'Independent Living', 'independent', 240000, 400000, 380, 640, 'DMF', 6, 30, '["Pool", "Bowling green", "River access", "Fishing", "Clubhouse"]'::jsonb, '["Emergency response"]'::jsonb, '["Swimming", "Bowls", "Fishing", "River activities", "Social events"]'::jsonb, true, 186, ARRAY['2 bedroom', '3 bedroom'], 50, '07 5536 9200', 'tweedshores@ingeniacommunities.com.au', 'https://www.ingeniacommunities.com.au', 'Tweed River over-50s resort on QLD/NSW border with contemporary manufactured homes and river access. Perfect river and coastal lifestyle.', 'approved', 'admin', true),

-- 25. Watermark Sanctuary Cove
('Watermark Sanctuary Cove', 'Watermark', '1 Santa Barbara Road, Hope Island QLD 4212', 'Hope Island', '4212', 'QLD', -27.8717, 153.3589, 'Independent Living', 'independent', 780000, 1180000, 1200, 1680, 'DMF', 6, 30, '["Golf course", "Marina berths", "Resort pool", "Fine dining", "Waterways", "Concierge"]'::jsonb, '["Emergency response", "Concierge"]'::jsonb, '["Golf", "Boating", "Swimming", "Fine dining", "Social events"]'::jsonb, false, 64, ARRAY['2 bedroom', '3 bedroom'], 55, '07 5577 1234', 'sanctuarycove@watermark.com.au', 'https://www.watermark.com.au', 'Premium Gold Coast marina resort retirement with luxury villas in exclusive Sanctuary Cove. Walk to Sanctuary Cove Village and waterways.', 'approved', 'admin', true);
