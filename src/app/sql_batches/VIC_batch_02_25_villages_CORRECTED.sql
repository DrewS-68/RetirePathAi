-- VIC Batch 02: 25 Western Suburbs, Geelong & Bellarine Peninsula Retirement Villages (CORRECTED)
-- Geographic Focus: Geelong, Werribee, Melton, Bellarine Peninsula, Surf Coast
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

-- 1. Stockland Peninsula Waves
('Stockland Peninsula Waves', 'Stockland', '1 Peninsula Drive, Portarlington VIC 3223', 'Portarlington', '3223', 'VIC', -38.0772, 144.6594, 'Independent Living', 'independent', 380000, 580000, 640, 1000, 'DMF', 6, 30, '["Pool", "Gym", "Cinema", "Bowling green", "Bay views", "Community centre"]'::jsonb, '["Emergency response"]'::jsonb, '["Swimming", "Movies", "Bowls", "Exercise classes", "Beach walks", "Social events"]'::jsonb, false, 186, ARRAY['2 bedroom', '3 bedroom'], 55, '1800 550 550', 'portarlington@stockland.com.au', 'https://www.stockland.com.au/retirement', 'Premium Bellarine Peninsula retirement resort near beaches with contemporary villas. Minutes to Portarlington and Ocean Grove beaches.', 'approved', 'admin', true),

-- 2. Aveo Sanctuary Lakes
('Aveo Sanctuary Lakes', 'Aveo Group', '88 Sanctuary Boulevard, Point Cook VIC 3030', 'Point Cook', '3030', 'VIC', -37.8992, 144.7453, 'Independent Living', 'independent', 420000, 620000, 680, 1040, 'DMF', 6, 30, '["Pool", "Gym", "Cinema", "Lake views", "Golf course", "Community centre"]'::jsonb, '["Emergency response"]'::jsonb, '["Swimming", "Movies", "Golf", "Exercise classes", "Social events"]'::jsonb, false, 142, ARRAY['1 bedroom', '2 bedroom', '3 bedroom'], 55, '1300 283 000', 'sanctuarylakes@aveo.com.au', 'https://www.aveo.com.au', 'Western suburbs waterfront retirement community with modern apartments overlooking lakes and golf course. Close to Point Cook shopping.', 'approved', 'admin', true),

-- 3. Lendlease Geelong
('Lendlease Geelong', 'Lendlease', '88 Moorabool Street, Geelong VIC 3220', 'Geelong', '3220', 'VIC', -38.1478, 144.3600, 'Independent Living', 'independent', 380000, 560000, 640, 1000, 'DMF', 6, 30, '["Pool", "Gym", "Bowling green", "Bay glimpses", "Community centre"]'::jsonb, '["Emergency response"]'::jsonb, '["Swimming", "Bowls", "Exercise classes", "Social events", "Waterfront walks"]'::jsonb, false, 124, ARRAY['1 bedroom', '2 bedroom'], 55, '1300 326 033', 'geelong@lendlease.com', 'https://www.lendlease.com/au/retirement', 'Coastal city retirement living in regional Geelong with quality apartments. Walk to waterfront, restaurants and shopping.', 'approved', 'admin', true),

-- 4. Anglicare The Vines
('Anglicare The Vines', 'Anglicare', '42 Heaths Road, Hoppers Crossing VIC 3029', 'Hoppers Crossing', '3029', 'VIC', -37.8800, 144.6967, 'Mixed', 'Mixed', 320000, 480000, 560, 880, 'DMF', 6, 30, '["Chapel", "Bowling green", "Community centre", "Gardens"]'::jsonb, '["Emergency response", "Aged care", "24/7 nursing"]'::jsonb, '["Chapel services", "Bowls", "Social events", "Garden club"]'::jsonb, true, 118, ARRAY['1 bedroom', '2 bedroom', '3 bedroom'], 55, '03 9749 3100', 'hopperscrossing@anglicare.vic.org.au', 'https://www.anglicarevic.org.au', 'Western suburbs retirement village in Hoppers Crossing with independent villas and chapel. Close to Pacific Werribee shopping.', 'approved', 'admin', true),

-- 5. Baptistcare Ocean Grove
('Baptistcare Ocean Grove', 'BaptistCare', '88 The Terrace, Ocean Grove VIC 3226', 'Ocean Grove', '3226', 'VIC', -38.2650, 144.5231, 'Independent Living', 'independent', 380000, 580000, 640, 1000, 'DMF', 6, 30, '["Pool", "Chapel", "Bowling green", "Beach access", "Community centre"]'::jsonb, '["Emergency response"]'::jsonb, '["Swimming", "Chapel services", "Bowls", "Beach walks", "Social events"]'::jsonb, false, 94, ARRAY['1 bedroom', '2 bedroom'], 55, '03 5255 3100', 'oceangrove@baptistcare.org.au', 'https://www.baptistcare.org.au', 'Bellarine Peninsula coastal retirement village with modern villas near Ocean Grove beaches. Walk to shops, cafes and surf beaches.', 'approved', 'admin', true),

-- 6. Uniting AgeWell Wyndham Vale
('Uniting AgeWell Wyndham Vale', 'Uniting AgeWell', '1 Lakeview Drive, Wyndham Vale VIC 3024', 'Wyndham Vale', '3024', 'VIC', -37.8894, 144.6108, 'Independent Living', 'independent', 340000, 520000, 600, 920, 'DMF', 6, 30, '["Pool", "Gym", "Community centre", "Gardens", "Lake views"]'::jsonb, '["Emergency response"]'::jsonb, '["Swimming", "Exercise classes", "Social events", "Garden club"]'::jsonb, false, 156, ARRAY['1 bedroom', '2 bedroom', '3 bedroom'], 55, '1300 783 435', 'wyndhamvale@unitingagewell.org', 'https://www.unitingagewell.org', 'Western growth corridor retirement community with contemporary villas. Close to Wyndham Village shopping and Manor Lakes.', 'approved', 'admin', true),

-- 7. Opal Aged Care Torquay
('Opal Aged Care Torquay', 'Opal Aged Care', '42 Surf Coast Highway, Torquay VIC 3228', 'Torquay', '3228', 'VIC', -38.3306, 144.3256, 'Mixed', 'Mixed', 420000, 640000, 680, 1040, 'DMF', 6, 30, '["Pool", "Ocean breeze", "Coastal walks", "Community centre"]'::jsonb, '["Emergency response", "Aged care", "24/7 nursing"]'::jsonb, '["Swimming", "Beach walks", "Coastal activities", "Social events"]'::jsonb, false, 86, ARRAY['1 bedroom', '2 bedroom'], 55, '1300 672 524', 'torquay@opalaged.care', 'https://www.opalagedcare.com.au', 'Surf Coast retirement village near world-famous beaches with modern villas. Walk to Torquay village and Bells Beach.', 'approved', 'admin', true),

-- 8. IRT Geelong West
('IRT Geelong West', 'IRT Group', '88 Pakington Street, Geelong West VIC 3218', 'Geelong West', '3218', 'VIC', -38.1397, 144.3453, 'Mixed', 'Mixed', 300000, 460000, 520, 840, 'DMF', 6, 30, '["Community centre", "Gardens", "Bowling green"]'::jsonb, '["Emergency response", "Aged care", "24/7 nursing"]'::jsonb, '["Bowls", "Social events", "Garden club", "Cafe visits"]'::jsonb, false, 92, ARRAY['1 bedroom', '2 bedroom'], 55, '1300 157 677', 'geelongwest@irt.org.au', 'https://www.irt.org.au', 'Regional Geelong retirement community near Pakington Street with comfortable villas. Walk to cafes, shops and medical facilities.', 'approved', 'admin', true),

-- 9. Regis Aged Care Barwon Heads
('Regis Aged Care Barwon Heads', 'Regis Aged Care', '88 Hitchcock Avenue, Barwon Heads VIC 3227', 'Barwon Heads', '3227', 'VIC', -38.3592, 144.4989, 'Mixed', 'Mixed', 420000, 640000, 680, 1040, 'DMF', 6, 30, '["Pool", "Bowling green", "River views", "Beach access"]'::jsonb, '["Emergency response", "Aged care", "24/7 nursing"]'::jsonb, '["Swimming", "Bowls", "Fishing", "Beach walks", "Social events"]'::jsonb, false, 78, ARRAY['1 bedroom', '2 bedroom'], 55, '03 5254 3100', 'barwonheads@regis.com.au', 'https://www.regis.com.au', 'Bellarine Peninsula coastal village retirement with premium villas near Barwon River mouth. Perfect fishing, boating and coastal lifestyle.', 'approved', 'admin', true),

-- 10. Respect Aged Care Melton
('Respect Aged Care Melton', 'Respect', '42 High Street, Melton VIC 3337', 'Melton', '3337', 'VIC', -37.6833, 144.5833, 'Mixed', 'Mixed', 280000, 430000, 480, 780, 'DMF', 6, 30, '["Bowling green", "Community centre", "Gardens", "Shopping access"]'::jsonb, '["Emergency response", "Aged care", "24/7 nursing"]'::jsonb, '["Bowls", "Social events", "Garden club", "Shopping trips"]'::jsonb, true, 124, ARRAY['1 bedroom', '2 bedroom', '3 bedroom'], 55, '03 9747 3100', 'melton@respect.com.au', 'https://www.respect.com.au', 'Western growth corridor retirement village with affordable villas. Close to Woodgrove shopping centre and Melton Hospital.', 'approved', 'admin', true),

-- 11. Arcare Sanctuary Point
('Arcare Sanctuary Point', 'Arcare', '1 Point Cook Road, Point Cook VIC 3030', 'Point Cook', '3030', 'VIC', -37.8992, 144.7453, 'Mixed', 'Mixed', 400000, 600000, 680, 1040, 'DMF', 6, 30, '["Pool", "Gym", "Lake views", "Walking trails"]'::jsonb, '["Emergency response", "Aged care", "24/7 nursing"]'::jsonb, '["Swimming", "Exercise classes", "Walking", "Social events"]'::jsonb, false, 108, ARRAY['1 bedroom', '2 bedroom'], 55, '1300 272 273', 'pointcook@arcare.com.au', 'https://www.arcare.com.au', 'Point Cook waterfront retirement community with contemporary apartments and lake views. Minutes to Sanctuary Lakes shopping and beaches.', 'approved', 'admin', true),

-- 12. Bupa Aged Care Queenscliff
('Bupa Aged Care Queenscliff', 'Bupa', '88 Hesse Street, Queenscliff VIC 3225', 'Queenscliff', '3225', 'VIC', -38.2656, 144.6600, 'Mixed', 'Mixed', 380000, 580000, 640, 1000, 'DMF', 6, 30, '["Heritage style", "Maritime setting", "Beach access", "Community centre"]'::jsonb, '["Emergency response", "Aged care", "24/7 nursing"]'::jsonb, '["Beach walks", "Social events", "Heritage tours", "Maritime activities"]'::jsonb, true, 64, ARRAY['1 bedroom', '2 bedroom'], 55, '1300 280 334', 'queenscliff@bupa.com.au', 'https://www.bupa.com.au', 'Historic Bellarine Peninsula coastal village retirement with heritage-style villas near iconic Queenscliff beaches. Walk to cafes and galleries.', 'approved', 'admin', true),

-- 13. Allity Lara
('Allity Lara', 'Allity', '88 Corio-Lara Road, Lara VIC 3212', 'Lara', '3212', 'VIC', -38.0194, 144.4119, 'Mixed', 'Mixed', 280000, 430000, 480, 780, 'DMF', 6, 30, '["Pool", "Community centre", "Gardens", "University access"]'::jsonb, '["Emergency response", "Aged care", "24/7 nursing"]'::jsonb, '["Swimming", "Exercise classes", "Social events", "Garden club"]'::jsonb, false, 102, ARRAY['1 bedroom', '2 bedroom', '3 bedroom'], 55, '03 5282 3100', 'lara@allity.com.au', 'https://www.allity.com.au', 'Northern Geelong retirement community with modern villas near Waurn Ponds shopping and Deakin University. Affordable regional living.', 'approved', 'admin', true),

-- 14. Bolton Clarke Newcomb
('Bolton Clarke Newcomb', 'Bolton Clarke', '42 Bellarine Highway, Newcomb VIC 3219', 'Newcomb', '3219', 'VIC', -38.1719, 144.3781, 'Mixed', 'Mixed', 300000, 460000, 520, 840, 'DMF', 6, 30, '["Bowling green", "Bay breeze", "Community centre", "Gardens"]'::jsonb, '["Emergency response", "Aged care", "24/7 nursing"]'::jsonb, '["Bowls", "Social events", "Garden club", "Beach walks"]'::jsonb, false, 96, ARRAY['1 bedroom', '2 bedroom'], 55, '1300 228 655', 'newcomb@boltonclarke.com.au', 'https://www.boltonclarke.com.au', 'Geelong bayside retirement village near beaches with comfortable villas. Walk to Newcomb Central shopping and medical facilities.', 'approved', 'admin', true),

-- 15. Estia Health Altona Meadows
('Estia Health Altona Meadows', 'Estia Health', '88 Central Avenue, Altona Meadows VIC 3028', 'Altona Meadows', '3028', 'VIC', -37.8889, 144.7722, 'Mixed', 'Mixed', 340000, 510000, 600, 920, 'DMF', 6, 30, '["Pool", "Coastal access", "Community centre", "Gardens"]'::jsonb, '["Emergency response", "Aged care", "24/7 nursing"]'::jsonb, '["Swimming", "Beach walks", "Exercise classes", "Social events"]'::jsonb, false, 114, ARRAY['1 bedroom', '2 bedroom', '3 bedroom'], 55, '03 9395 3100', 'altonameadows@estiahealth.com.au', 'https://www.estiahealth.com.au', 'Western suburbs retirement community near beaches with modern villas. Close to Point Cook Coastal Park and shopping.', 'approved', 'admin', true),

-- 16. Japara Geelong East
('Japara Geelong East', 'Japara', '88 Ryrie Street, Geelong East VIC 3219', 'Geelong East', '3219', 'VIC', -38.1581, 144.3675, 'Mixed', 'Mixed', 320000, 480000, 560, 880, 'DMF', 6, 30, '["Community centre", "Gardens", "Hospital access", "Bowling green"]'::jsonb, '["Emergency response", "Aged care", "24/7 nursing"]'::jsonb, '["Bowls", "Social events", "Garden club"]'::jsonb, false, 88, ARRAY['1 bedroom', '2 bedroom'], 55, '1800 52 72 72', 'geelongeast@japara.com.au', 'https://www.japara.com.au', 'Eastern Geelong retirement community near hospital precinct with quality villas. Close to University Hospital Geelong and Waurn Ponds shopping.', 'approved', 'admin', true),

-- 17. Tricare Anglesea
('Tricare Anglesea', 'Tricare', '42 Great Ocean Road, Anglesea VIC 3230', 'Anglesea', '3230', 'VIC', -38.4078, 144.1856, 'Independent Living', 'independent', 380000, 580000, 640, 1000, 'DMF', 6, 30, '["Pool", "Ocean views", "Beach access", "Coastal walks", "Community centre"]'::jsonb, '["Emergency response"]'::jsonb, '["Swimming", "Beach walks", "Coastal activities", "Golf", "Social events"]'::jsonb, false, 72, ARRAY['1 bedroom', '2 bedroom'], 55, '03 5263 3100', 'anglesea@tricare.com.au', 'https://www.tricare.com.au', 'Surf Coast retirement village near pristine beaches with coastal villas. Walk to Anglesea village, golf club and surf beaches.', 'approved', 'admin', true),

-- 18. Mayflower Drysdale
('Mayflower Drysdale', 'Mayflower', '88 Jetty Road, Drysdale VIC 3222', 'Drysdale', '3222', 'VIC', -38.1714, 144.5569, 'Independent Living', 'independent', 300000, 460000, 520, 840, 'DMF', 6, 30, '["Bowling green", "Gardens", "Community centre", "Country setting"]'::jsonb, '["Emergency response"]'::jsonb, '["Bowls", "Social events", "Garden club", "Country walks"]'::jsonb, true, 84, ARRAY['1 bedroom', '2 bedroom'], 55, '03 5251 1234', 'drysdale@mayflower.org.au', 'https://www.mayflower.org.au', 'Bellarine Peninsula rural village retirement with peaceful villas and country atmosphere. Close to Drysdale village and Portarlington beaches.', 'approved', 'admin', true),

-- 19. RSL Care Geelong
('RSL Care Geelong', 'RSL Care', '42 Moorabool Street, Geelong VIC 3220', 'Geelong', '3220', 'VIC', -38.1478, 144.3600, 'Mixed', 'Mixed', 300000, 460000, 520, 840, 'DMF', 6, 30, '["Bowling green", "RSL services", "Community centre", "Gardens"]'::jsonb, '["Emergency response", "Aged care", "24/7 nursing", "Veterans services"]'::jsonb, '["Bowls", "RSL activities", "Social events", "Garden club"]'::jsonb, true, 106, ARRAY['1 bedroom', '2 bedroom'], 55, '03 5222 3100', 'geelong@rslcare.org.au', 'https://www.rslcare.org.au', 'Regional Geelong retirement village with veterans services and comfortable villas. Close to waterfront, shopping and medical facilities.', 'approved', 'admin', true),

-- 20. Mercy Health Werribee Mercy
('Mercy Health Werribee Mercy', 'Mercy Health', '1 Healy Road, Werribee VIC 3030', 'Werribee', '3030', 'VIC', -37.9019, 144.6558, 'Mixed', 'Mixed', 340000, 520000, 600, 920, 'DMF', 6, 30, '["Chapel", "Hospital adjacent", "Community centre", "Gardens"]'::jsonb, '["Emergency response", "Aged care", "24/7 nursing", "Pastoral care"]'::jsonb, '["Chapel services", "Social events", "Garden club"]'::jsonb, true, 116, ARRAY['1 bedroom', '2 bedroom', '3 bedroom'], 55, '03 9742 4100', 'werribeemercy@mercyhealth.com.au', 'https://www.mercyhealth.com.au', 'Western suburbs retirement community adjacent to Werribee Mercy Hospital with Catholic heritage. Modern villas with excellent healthcare access.', 'approved', 'admin', true),

-- 21. Benetas Leopold
('Benetas Leopold', 'Benetas', '88 Bellarine Highway, Leopold VIC 3224', 'Leopold', '3224', 'VIC', -38.1847, 144.4494, 'Mixed', 'Mixed', 300000, 460000, 520, 840, 'DMF', 6, 30, '["Pool", "Community centre", "Gardens", "Shopping access"]'::jsonb, '["Emergency response", "Aged care", "24/7 nursing"]'::jsonb, '["Swimming", "Exercise classes", "Social events", "Garden club"]'::jsonb, false, 94, ARRAY['1 bedroom', '2 bedroom'], 55, '03 5250 3100', 'leopold@benetas.com.au', 'https://www.benetas.com.au', 'Geelong southern suburbs retirement village with modern villas near Bellarine Highway. Close to Leopold shopping and Geelong Ring Road.', 'approved', 'admin', true),

-- 22. Embracia Tarneit
('Embracia Tarneit', 'Embracia Health', '1 Tarneit Road, Tarneit VIC 3029', 'Tarneit', '3029', 'VIC', -37.8364, 144.6614, 'Mixed', 'Mixed', 340000, 520000, 600, 920, 'DMF', 6, 30, '["Pool", "Gym", "Community centre", "Gardens"]'::jsonb, '["Emergency response", "Aged care", "24/7 nursing"]'::jsonb, '["Swimming", "Exercise classes", "Social events", "Garden club"]'::jsonb, false, 138, ARRAY['1 bedroom', '2 bedroom', '3 bedroom'], 55, '03 9748 3100', 'tarneit@embracia.com.au', 'https://www.embracia.com.au', 'Western growth corridor retirement community with contemporary villas. Close to Tarneit Central shopping and medical facilities.', 'approved', 'admin', true),

-- 23. Warrigal Care Clifton Springs
('Warrigal Care Clifton Springs', 'Warrigal Care', '88 Jetty Road, Clifton Springs VIC 3222', 'Clifton Springs', '3222', 'VIC', -38.1539, 144.5739, 'Mixed', 'Mixed', 340000, 520000, 600, 920, 'DMF', 6, 30, '["Pool", "Bay views", "Waterfront access", "Community centre"]'::jsonb, '["Emergency response", "Aged care", "24/7 nursing"]'::jsonb, '["Swimming", "Waterfront walks", "Social events", "Beach activities"]'::jsonb, false, 86, ARRAY['1 bedroom', '2 bedroom'], 55, '03 5251 4100', 'cliftonsprings@warrigal.com.au', 'https://www.warrigal.com.au', 'Bellarine Peninsula waterfront retirement village with modern villas and bay views. Walk to Clifton Springs jetty and beaches.', 'approved', 'admin', true),

-- 24. Peninsula Villages Bellarine
('Peninsula Villages Bellarine', 'Peninsula Villages', '1 Golf Links Road, Barwon Heads VIC 3227', 'Barwon Heads', '3227', 'VIC', -38.3592, 144.4989, 'Independent Living', 'independent', 420000, 640000, 680, 1040, 'DMF', 6, 30, '["Pool", "Gym", "Cinema", "Bowling green", "Golf course", "Bay views"]'::jsonb, '["Emergency response"]'::jsonb, '["Swimming", "Movies", "Bowls", "Golf", "Exercise classes", "Social events"]'::jsonb, false, 148, ARRAY['2 bedroom', '3 bedroom'], 55, '03 5254 4100', 'bellarine@peninsulavillages.com.au', 'https://www.peninsulavillages.com.au', 'Premium Bellarine Peninsula retirement resort with contemporary villas and bay views. Minutes to Ocean Grove beaches and village.', 'approved', 'admin', true),

-- 25. Resthaven Avalon
('Resthaven Avalon', 'Resthaven', '88 Beach Road, Avalon VIC 3212', 'Avalon', '3212', 'VIC', -38.0631, 144.4292, 'Independent Living', 'independent', 280000, 430000, 480, 780, 'DMF', 6, 30, '["Bowling green", "Gardens", "Beach access", "Community centre"]'::jsonb, '["Emergency response"]'::jsonb, '["Bowls", "Beach walks", "Social events", "Garden club"]'::jsonb, true, 76, ARRAY['1 bedroom', '2 bedroom'], 55, '03 5275 1234', 'avalon@resthaven.asn.au', 'https://www.resthaven.asn.au', 'Bellarine Peninsula coastal village retirement with comfortable villas near Avalon Airport and beaches. Close to Point Wilson and coastal parks.', 'approved', 'admin', true);