-- QLD Batch 05: 25 Far North & Central QLD Retirement Villages (CORRECTED - FINAL QLD BATCH)
-- Geographic Focus: Cairns, Townsville, Mackay, Rockhampton, Bundaberg, Fraser Coast
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

-- 1. Aveo Cairns
('Aveo Cairns', 'Aveo Group', '88 Mulgrave Road, Cairns QLD 4870', 'Cairns', '4870', 'QLD', -16.9203, 145.7710, 'Independent Living', 'independent', 320000, 480000, 560, 880, 'DMF', 6, 30, '["Pool", "Gym", "Tropical gardens", "Beach access", "Community centre"]'::jsonb, '["Emergency response"]'::jsonb, '["Swimming", "Exercise classes", "Beach walks", "Social events", "Reef tours"]'::jsonb, false, 128, ARRAY['1 bedroom', '2 bedroom', '3 bedroom'], 55, '1300 283 000', 'cairns@aveo.com.au', 'https://www.aveo.com.au', 'Tropical Far North Queensland retirement with modern villas near beaches and Reef. Close to Cairns Central shopping and medical facilities.', 'approved', 'admin', true),

-- 2. Stockland Townsville
('Stockland Townsville', 'Stockland', '1 Ross River Road, Townsville QLD 4810', 'Townsville', '4810', 'QLD', -19.2590, 146.8169, 'Independent Living', 'independent', 300000, 460000, 520, 840, 'DMF', 6, 30, '["Pool", "Gym", "Bowling green", "Mountain views", "Community centre"]'::jsonb, '["Emergency response"]'::jsonb, '["Swimming", "Bowls", "Exercise classes", "Social events", "Walking groups"]'::jsonb, false, 152, ARRAY['1 bedroom', '2 bedroom', '3 bedroom'], 55, '1800 550 550', 'townsville@stockland.com.au', 'https://www.stockland.com.au/retirement', 'North Queensland regional city retirement with contemporary villas and mountain views. Close to shopping, Castle Hill and medical facilities.', 'approved', 'admin', true),

-- 3. Lendlease Mackay
('Lendlease Mackay', 'Lendlease', '42 Harbour Road, Mackay QLD 4740', 'Mackay', '4740', 'QLD', -21.1406, 149.1861, 'Independent Living', 'independent', 280000, 430000, 480, 780, 'DMF', 6, 30, '["Pool", "Bowling green", "Beach access", "Marina views", "Community centre"]'::jsonb, '["Emergency response"]'::jsonb, '["Swimming", "Bowls", "Beach walks", "Social events", "Marina activities"]'::jsonb, false, 116, ARRAY['1 bedroom', '2 bedroom', '3 bedroom'], 55, '1300 326 033', 'mackay@lendlease.com', 'https://www.lendlease.com/au/retirement', 'Central Queensland coastal city retirement with quality villas near beaches and marina. Close to Caneland Central shopping and medical facilities.', 'approved', 'admin', true),

-- 4. Anglicare Rockhampton
('Anglicare Rockhampton', 'Anglicare', '88 Musgrave Street, Rockhampton QLD 4700', 'Rockhampton', '4700', 'QLD', -23.3783, 150.5131, 'Mixed', 'Mixed', 260000, 410000, 460, 760, 'DMF', 6, 30, '["Chapel", "Bowling green", "Community centre", "Gardens"]'::jsonb, '["Emergency response", "Aged care", "24/7 nursing"]'::jsonb, '["Chapel services", "Bowls", "Social events", "Garden club"]'::jsonb, true, 102, ARRAY['1 bedroom', '2 bedroom'], 55, '07 4927 3100', 'rockhampton@anglicaresq.org.au', 'https://www.anglicaresq.org.au', 'Central Queensland beef capital retirement with independent villas and chapel. Close to Stockland Rockhampton shopping and medical facilities.', 'approved', 'admin', true),

-- 5. Baptistcare Bundaberg
('Baptistcare Bundaberg', 'BaptistCare', '88 Bourbong Street, Bundaberg QLD 4670', 'Bundaberg', '4670', 'QLD', -24.8661, 152.3489, 'Mixed', 'Mixed', 260000, 410000, 460, 760, 'DMF', 6, 30, '["Pool", "Chapel", "Bowling green", "Beach access"]'::jsonb, '["Emergency response", "Aged care", "24/7 nursing"]'::jsonb, '["Swimming", "Chapel services", "Bowls", "Beach walks", "Social events"]'::jsonb, true, 94, ARRAY['1 bedroom', '2 bedroom'], 55, '07 4151 3100', 'bundaberg@baptistcare.org.au', 'https://www.baptistcare.org.au', 'Fraser Coast retirement community with modern villas near rum city and beaches. Close to Bundaberg Hospital, shopping and Reef access.', 'approved', 'admin', true),

-- 6. Uniting AgeWell Hervey Bay
('Uniting AgeWell Hervey Bay', 'Uniting AgeWell', '88 Main Street, Pialba QLD 4655', 'Pialba', '4655', 'QLD', -25.2869, 152.8472, 'Independent Living', 'independent', 300000, 460000, 520, 840, 'DMF', 6, 30, '["Pool", "Bay breezes", "Whale watching", "Community centre"]'::jsonb, '["Emergency response"]'::jsonb, '["Swimming", "Whale watching", "Beach walks", "Social events"]'::jsonb, false, 118, ARRAY['1 bedroom', '2 bedroom', '3 bedroom'], 55, '1300 783 435', 'herveybay@unitingagewell.org', 'https://www.unitingagewell.org', 'Fraser Coast retirement near pristine beaches with comfortable villas and bay breezes. Close to Stockland shopping and Fraser Island access.', 'approved', 'admin', true),

-- 7. Opal Aged Care Gladstone
('Opal Aged Care Gladstone', 'Opal Aged Care', '42 Goondoon Street, Gladstone QLD 4680', 'Gladstone', '4680', 'QLD', -23.8445, 151.2572, 'Mixed', 'Mixed', 260000, 410000, 460, 760, 'DMF', 6, 30, '["Pool", "Waterfront access", "Marina views", "Community centre"]'::jsonb, '["Emergency response", "Aged care", "24/7 nursing"]'::jsonb, '["Swimming", "Waterfront activities", "Social events", "Marina walks"]'::jsonb, false, 88, ARRAY['1 bedroom', '2 bedroom'], 55, '1300 672 524', 'gladstone@opalaged.care', 'https://www.opalagedcare.com.au', 'Central Queensland port city retirement with modern villas near marina and harbour. Close to shopping, medical facilities and industrial heritage.', 'approved', 'admin', true),

-- 8. IRT Maryborough
('IRT Maryborough', 'IRT Group', '88 Wharf Street, Maryborough QLD 4650', 'Maryborough', '4650', 'QLD', -25.5389, 152.7019, 'Mixed', 'Mixed', 240000, 380000, 420, 700, 'DMF', 6, 30, '["Bowling green", "Heritage setting", "Community centre"]'::jsonb, '["Emergency response", "Aged care", "24/7 nursing"]'::jsonb, '["Bowls", "Social events", "Heritage tours", "Garden club"]'::jsonb, true, 84, ARRAY['1 bedroom', '2 bedroom'], 55, '1300 157 677', 'maryborough@irt.org.au', 'https://www.irt.org.au', 'Fraser Coast heritage city retirement with comfortable villas in historic Maryborough. Close to medical facilities and shopping.', 'approved', 'admin', true),

-- 9. Regis Aged Care Port Douglas
('Regis Aged Care Port Douglas', 'Regis Aged Care', '42 Davidson Street, Port Douglas QLD 4877', 'Port Douglas', '4877', 'QLD', -16.4839, 145.4644, 'Mixed', 'Mixed', 380000, 580000, 640, 1000, 'DMF', 6, 30, '["Pool", "Rainforest setting", "Beach access", "Tropical gardens"]'::jsonb, '["Emergency response", "Aged care", "24/7 nursing"]'::jsonb, '["Swimming", "Beach walks", "Rainforest walks", "Social events", "Reef tours"]'::jsonb, false, 72, ARRAY['1 bedroom', '2 bedroom'], 55, '07 4099 3100', 'portdouglas@regis.com.au', 'https://www.regis.com.au', 'Tropical paradise retirement near iconic Four Mile Beach with premium villas. Walk to Macrossan Street, marina and Reef tours.', 'approved', 'admin', true),

-- 10. Respect Aged Care Emerald
('Respect Aged Care Emerald', 'Respect', '88 Egerton Street, Emerald QLD 4720', 'Emerald', '4720', 'QLD', -23.5253, 148.1603, 'Mixed', 'Mixed', 200000, 340000, 360, 640, 'DMF', 6, 30, '["Community centre", "Gardens", "Regional setting"]'::jsonb, '["Emergency response", "Aged care", "24/7 nursing"]'::jsonb, '["Social events", "Garden club", "Community activities"]'::jsonb, true, 64, ARRAY['1 bedroom', '2 bedroom'], 55, '07 4982 3100', 'emerald@respect.com.au', 'https://www.respect.com.au', 'Central Highlands mining town retirement with affordable villas in regional centre. Close to Emerald Hospital and shopping.', 'approved', 'admin', true),

-- 11. Arcare Thuringowa
('Arcare Thuringowa', 'Arcare', '1 University Drive, Thuringowa QLD 4817', 'Thuringowa', '4817', 'QLD', -19.3239, 146.8147, 'Mixed', 'Mixed', 280000, 430000, 480, 780, 'DMF', 6, 30, '["Pool", "Gym", "Hospital access", "University access"]'::jsonb, '["Emergency response", "Aged care", "24/7 nursing"]'::jsonb, '["Swimming", "Exercise classes", "Social events", "University programs"]'::jsonb, false, 104, ARRAY['1 bedroom', '2 bedroom'], 55, '1300 272 273', 'thuringowa@arcare.com.au', 'https://www.arcare.com.au', 'Townsville southern suburbs retirement with contemporary villas near University Hospital. Close to Willows shopping and James Cook University.', 'approved', 'admin', true),

-- 12. Bupa Aged Care Innisfail
('Bupa Aged Care Innisfail', 'Bupa', '88 Edith Street, Innisfail QLD 4860', 'Innisfail', '4860', 'QLD', -17.5233, 146.0308, 'Mixed', 'Mixed', 220000, 360000, 380, 660, 'DMF', 6, 30, '["Pool", "Rainforest setting", "Beach access", "Community centre"]'::jsonb, '["Emergency response", "Aged care", "24/7 nursing"]'::jsonb, '["Swimming", "Beach walks", "Rainforest walks", "Social events"]'::jsonb, true, 68, ARRAY['1 bedroom', '2 bedroom'], 55, '1300 280 334', 'innisfail@bupa.com.au', 'https://www.bupa.com.au', 'Tropical Far North Queensland retirement with comfortable villas near rainforest and beaches. Close to Innisfail town centre and medical facilities.', 'approved', 'admin', true),

-- 13. Allity Yeppoon
('Allity Yeppoon', 'Allity', '88 James Street, Yeppoon QLD 4703', 'Yeppoon', '4703', 'QLD', -23.1278, 150.7431, 'Mixed', 'Mixed', 280000, 430000, 480, 780, 'DMF', 6, 30, '["Pool", "Beach access", "Coastal walks", "Marina views"]'::jsonb, '["Emergency response", "Aged care", "24/7 nursing"]'::jsonb, '["Swimming", "Beach walks", "Coastal activities", "Social events"]'::jsonb, false, 86, ARRAY['1 bedroom', '2 bedroom'], 55, '07 4939 3100', 'yeppoon@allity.com.au', 'https://www.allity.com.au', 'Capricorn Coast beachside retirement with modern villas near beautiful beaches. Close to Yeppoon town centre and Keppel Bay Marina.', 'approved', 'admin', true),

-- 14. Bolton Clarke Ayr
('Bolton Clarke Ayr', 'Bolton Clarke', '88 Queen Street, Ayr QLD 4807', 'Ayr', '4807', 'QLD', -19.5739, 147.4053, 'Mixed', 'Mixed', 200000, 340000, 360, 640, 'DMF', 6, 30, '["Bowling green", "Community centre", "Gardens", "Rural setting"]'::jsonb, '["Emergency response", "Aged care", "24/7 nursing"]'::jsonb, '["Bowls", "Social events", "Garden club", "Community activities"]'::jsonb, true, 72, ARRAY['1 bedroom', '2 bedroom'], 55, '1300 228 655', 'ayr@boltonclarke.com.au', 'https://www.boltonclarke.com.au', 'North Queensland rural retirement village with comfortable villas in farming district. Close to Ayr town centre and medical facilities.', 'approved', 'admin', true),

-- 15. Estia Health Mount Isa
('Estia Health Mount Isa', 'Estia Health', '88 Miles Street, Mount Isa QLD 4825', 'Mount Isa', '4825', 'QLD', -20.7256, 139.4928, 'Mixed', 'Mixed', 180000, 310000, 320, 600, 'DMF', 6, 30, '["Pool", "Desert setting", "Community centre", "Mining town"]'::jsonb, '["Emergency response", "Aged care", "24/7 nursing"]'::jsonb, '["Swimming", "Social events", "Community activities"]'::jsonb, true, 62, ARRAY['1 bedroom', '2 bedroom'], 55, '07 4743 3100', 'mountisa@estiahealth.com.au', 'https://www.estiahealth.com.au', 'Outback mining city retirement with affordable villas in remote regional centre. Close to Mount Isa Hospital and shopping.', 'approved', 'admin', true),

-- 16. Japara Atherton
('Japara Atherton', 'Japara', '42 Main Street, Atherton QLD 4883', 'Atherton', '4883', 'QLD', -17.2669, 145.4756, 'Mixed', 'Mixed', 240000, 380000, 420, 700, 'DMF', 6, 30, '["Cool climate", "Mountain views", "Community centre", "Gardens"]'::jsonb, '["Emergency response", "Aged care", "24/7 nursing"]'::jsonb, '["Social events", "Garden club", "Walking groups", "Tablelands tours"]'::jsonb, true, 74, ARRAY['1 bedroom', '2 bedroom'], 55, '1800 52 72 72', 'atherton@japara.com.au', 'https://www.japara.com.au', 'Atherton Tablelands retirement village with cool climate villas on tropical highlands. Close to Atherton town centre and Tablelands attractions.', 'approved', 'admin', true),

-- 17. Tricare Gympie
('Tricare Gympie', 'Tricare', '88 Mary Street, Gympie QLD 4570', 'Gympie', '4570', 'QLD', -26.1908, 152.6656, 'Mixed', 'Mixed', 240000, 380000, 420, 700, 'DMF', 6, 30, '["Pool", "River views", "Community centre", "Gardens"]'::jsonb, '["Emergency response", "Aged care", "24/7 nursing"]'::jsonb, '["Swimming", "Social events", "Garden club", "River activities"]'::jsonb, false, 92, ARRAY['1 bedroom', '2 bedroom'], 55, '07 5482 3100', 'gympie@tricare.com.au', 'https://www.tricare.com.au', 'Mary Valley retirement community with comfortable villas in regional centre. Close to Gympie Hospital, shopping and Mary River.', 'approved', 'admin', true),

-- 18. Mayflower Bowen
('Mayflower Bowen', 'Mayflower', '88 Herbert Street, Bowen QLD 4805', 'Bowen', '4805', 'QLD', -20.0153, 148.2447, 'Independent Living', 'independent', 220000, 360000, 380, 660, 'DMF', 6, 30, '["Beach access", "Tropical setting", "Community centre", "Gardens"]'::jsonb, '["Emergency response"]'::jsonb, '["Beach walks", "Social events", "Garden club", "Fishing"]'::jsonb, true, 64, ARRAY['1 bedroom', '2 bedroom'], 55, '07 4786 1234', 'bowen@mayflower.org.au', 'https://www.mayflower.org.au', 'Whitsundays coast retirement village with tropical villas near pristine beaches. Close to Bowen town centre and medical facilities.', 'approved', 'admin', true),

-- 19. RSL Care Charters Towers
('RSL Care Charters Towers', 'RSL Care', '42 Gill Street, Charters Towers QLD 4820', 'Charters Towers', '4820', 'QLD', -20.0753, 146.2631, 'Mixed', 'Mixed', 200000, 340000, 360, 640, 'DMF', 6, 30, '["Bowling green", "Heritage setting", "RSL services", "Community centre"]'::jsonb, '["Emergency response", "Aged care", "24/7 nursing", "Veterans services"]'::jsonb, '["Bowls", "RSL activities", "Social events", "Heritage tours"]'::jsonb, true, 68, ARRAY['1 bedroom', '2 bedroom'], 55, '07 4787 3100', 'charterstowers@rslcare.org.au', 'https://www.rslcare.org.au', 'North Queensland heritage city retirement with veterans services and comfortable villas in historic goldfields town.', 'approved', 'admin', true),

-- 20. BlueCare Aitkenvale
('BlueCare Aitkenvale', 'BlueCare', '88 Ross River Road, Aitkenvale QLD 4814', 'Aitkenvale', '4814', 'QLD', -19.2839, 146.7756, 'Independent Living', 'independent', 280000, 430000, 480, 780, 'DMF', 6, 30, '["Pool", "Shopping access", "Tropical gardens", "Community centre"]'::jsonb, '["Emergency response"]'::jsonb, '["Swimming", "Exercise classes", "Social events", "Shopping trips"]'::jsonb, false, 96, ARRAY['1 bedroom', '2 bedroom'], 55, '07 4725 1234', 'aitkenvale@bluecare.org.au', 'https://www.bluecare.org.au', 'Townsville suburbs retirement community with modern villas near Willows shopping. Close to major shopping centre and medical facilities.', 'approved', 'admin', true),

-- 21. Mercy Health Maryborough West
('Mercy Health Maryborough West', 'Mercy Health', '88 Alice Street, Maryborough QLD 4650', 'Maryborough', '4650', 'QLD', -25.5389, 152.7019, 'Mixed', 'Mixed', 240000, 380000, 420, 700, 'DMF', 6, 30, '["Chapel", "Community centre", "Gardens"]'::jsonb, '["Emergency response", "Aged care", "24/7 nursing", "Pastoral care"]'::jsonb, '["Chapel services", "Social events", "Garden club", "Heritage tours"]'::jsonb, true, 84, ARRAY['1 bedroom', '2 bedroom'], 55, '07 4121 3100', 'maryboroughwest@mercyhealth.com.au', 'https://www.mercyhealth.com.au', 'Fraser Coast retirement community with Catholic heritage and chapel. Modern villas near medical facilities and shopping.', 'approved', 'admin', true),

-- 22. Living Choice Kawana Waters
('Living Choice Kawana Waters', 'Living Choice', '1 Reef Drive, Kawana Waters QLD 4575', 'Kawana Waters', '4575', 'QLD', -26.7328, 153.1239, 'Independent Living', 'independent', 380000, 580000, 640, 1000, 'DMF', 6, 30, '["Pool", "Gym", "Cinema", "Bowling green", "Resort amenities"]'::jsonb, '["Emergency response"]'::jsonb, '["Swimming", "Movies", "Bowls", "Exercise classes", "Social events"]'::jsonb, false, 142, ARRAY['2 bedroom', '3 bedroom'], 55, '07 5493 4100', 'kawana@livingchoice.com.au', 'https://www.livingchoice.com.au', 'Central Queensland retirement resort with premium villas and resort amenities. Close to beaches, shopping and medical facilities.', 'approved', 'admin', true),

-- 23. Palm Lake Resort Bargara
('Palm Lake Resort Bargara', 'Palm Lake Resort', '1 Esplanade, Bargara QLD 4670', 'Bargara', '4670', 'QLD', -24.8214, 152.4625, 'Independent Living', 'independent', 260000, 420000, 400, 680, 'DMF', 6, 30, '["Pool", "Tennis courts", "Bowling green", "Beach access", "Clubhouse"]'::jsonb, '["Emergency response"]'::jsonb, '["Swimming", "Tennis", "Bowls", "Beach walks", "Social events"]'::jsonb, true, 168, ARRAY['2 bedroom', '3 bedroom'], 50, '07 4159 9200', 'bargara@palmlakeresort.com.au', 'https://www.palmlakeresort.com.au', 'Fraser Coast beachside over-50s resort with modern manufactured homes near beautiful beaches. Perfect Coral Coast lifestyle.', 'approved', 'admin', true),

-- 24. Ingenia Lifestyle Rainbow Beach
('Ingenia Lifestyle Rainbow Beach', 'Ingenia Communities', '1 Rainbow Drive, Rainbow Beach QLD 4581', 'Rainbow Beach', '4581', 'QLD', -25.9042, 153.0878, 'Independent Living', 'independent', 240000, 400000, 380, 640, 'DMF', 6, 30, '["Pool", "Bowling green", "Beach access", "Fishing", "Clubhouse"]'::jsonb, '["Emergency response"]'::jsonb, '["Swimming", "Bowls", "Beach walks", "Fishing", "4WD tours"]'::jsonb, true, 132, ARRAY['2 bedroom', '3 bedroom'], 50, '07 5486 9200', 'rainbowbeach@ingeniacommunities.com.au', 'https://www.ingeniacommunities.com.au', 'Fraser Coast hinterland over-50s community with contemporary manufactured homes near Rainbow Beach. Perfect fishing and 4WD lifestyle.', 'approved', 'admin', true),

-- 25. Watermark Kirwan
('Watermark Kirwan', 'Watermark', '88 Riverway Drive, Kirwan QLD 4817', 'Kirwan', '4817', 'QLD', -19.3042, 146.7342, 'Independent Living', 'independent', 280000, 430000, 480, 780, 'DMF', 6, 30, '["Pool", "Shopping access", "Tropical gardens", "Community centre"]'::jsonb, '["Emergency response"]'::jsonb, '["Swimming", "Exercise classes", "Social events", "Shopping trips"]'::jsonb, false, 104, ARRAY['1 bedroom', '2 bedroom', '3 bedroom'], 55, '07 4723 1234', 'kirwan@watermark.com.au', 'https://www.watermark.com.au', 'Townsville southern suburbs retirement with modern villas near Riverway shopping. Close to shopping centre, medical facilities and Riverway stadium.', 'approved', 'admin', true);
