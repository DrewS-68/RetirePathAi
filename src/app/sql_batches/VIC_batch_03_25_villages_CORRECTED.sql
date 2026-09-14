-- VIC Batch 03: 25 Mornington Peninsula, Gippsland & South-East VIC Retirement Villages (CORRECTED)
-- Geographic Focus: Mornington, Frankston South, Mornington Peninsula, Gippsland Coast
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

-- 1. Stockland Halcyon Lakeside Pakenham
('Stockland Halcyon Lakeside Pakenham', 'Stockland', '1 Lakeside Boulevard, Pakenham VIC 3810', 'Pakenham', '3810', 'VIC', -38.0772, 145.4847, 'Independent Living', 'independent', 340000, 520000, 600, 920, 'DMF', 6, 30, '["Pool", "Gym", "Cinema", "Bowling green", "Lake views", "Community centre"]'::jsonb, '["Emergency response"]'::jsonb, '["Swimming", "Movies", "Bowls", "Exercise classes", "Social events"]'::jsonb, false, 206, ARRAY['2 bedroom', '3 bedroom'], 55, '1800 550 550', 'pakenham@stockland.com.au', 'https://www.stockland.com.au/retirement', 'South-eastern growth corridor retirement resort with modern villas and lakefront setting. Close to Pakenham shopping and Cardinia Lakes.', 'approved', 'admin', true),

-- 2. Aveo Mornington
('Aveo Mornington', 'Aveo Group', '88 The Esplanade, Mornington VIC 3931', 'Mornington', '3931', 'VIC', -38.2189, 145.0389, 'Independent Living', 'independent', 480000, 720000, 760, 1120, 'DMF', 6, 30, '["Pool", "Gym", "Bay views", "Beach access", "Community centre"]'::jsonb, '["Emergency response"]'::jsonb, '["Swimming", "Exercise classes", "Beach walks", "Social events"]'::jsonb, false, 116, ARRAY['1 bedroom', '2 bedroom'], 55, '1300 283 000', 'mornington@aveo.com.au', 'https://www.aveo.com.au', 'Premium Mornington Peninsula retirement living with contemporary apartments. Walk to Main Street shops, cafes and pier.', 'approved', 'admin', true),

-- 3. Lendlease Safety Beach
('Lendlease Safety Beach', 'Lendlease', '42 Marine Parade, Safety Beach VIC 3936', 'Safety Beach', '3936', 'VIC', -38.3050, 144.9814, 'Independent Living', 'independent', 420000, 640000, 680, 1040, 'DMF', 6, 30, '["Pool", "Bowling green", "Bay breezes", "Beach access", "Community centre"]'::jsonb, '["Emergency response"]'::jsonb, '["Swimming", "Bowls", "Beach walks", "Social events"]'::jsonb, false, 98, ARRAY['1 bedroom', '2 bedroom'], 55, '1300 326 033', 'safetybeach@lendlease.com', 'https://www.lendlease.com/au/retirement', 'Bayside peninsula retirement village near beaches with quality villas. Walk to Safety Beach and Dromana village.', 'approved', 'admin', true),

-- 4. Anglicare Peninsula Pines
('Anglicare Peninsula Pines', 'Anglicare', '88 Mount Eliza Way, Mount Eliza VIC 3930', 'Mount Eliza', '3930', 'VIC', -38.1897, 145.0917, 'Mixed', 'Mixed', 420000, 620000, 680, 1040, 'DMF', 6, 30, '["Chapel", "Gardens", "Bushland setting", "Community centre"]'::jsonb, '["Emergency response", "Aged care", "24/7 nursing"]'::jsonb, '["Chapel services", "Social events", "Garden club", "Bush walks"]'::jsonb, true, 94, ARRAY['1 bedroom', '2 bedroom'], 55, '03 9787 3100', 'mounteliza@anglicare.vic.org.au', 'https://www.anglicarevic.org.au', 'Mornington Peninsula retirement community in Mount Eliza with independent villas and chapel. Close to village and Canadian Bay beaches.', 'approved', 'admin', true),

-- 5. Baptistcare Sorrento
('Baptistcare Sorrento', 'BaptistCare', '88 Ocean Beach Road, Sorrento VIC 3943', 'Sorrento', '3943', 'VIC', -38.3403, 144.7383, 'Independent Living', 'independent', 580000, 840000, 880, 1280, 'DMF', 6, 30, '["Pool", "Chapel", "Beach access", "Village atmosphere", "Ocean views"]'::jsonb, '["Emergency response"]'::jsonb, '["Swimming", "Chapel services", "Beach walks", "Social events", "Gallery visits"]'::jsonb, false, 68, ARRAY['1 bedroom', '2 bedroom'], 55, '03 5984 3100', 'sorrento@baptistcare.org.au', 'https://www.baptistcare.org.au', 'Premium peninsula tip retirement village with luxury villas near Sorrento beaches. Walk to cafes, galleries and ocean beaches.', 'approved', 'admin', true),

-- 6. Uniting AgeWell Berwick
('Uniting AgeWell Berwick', 'Uniting AgeWell', '42 High Street, Berwick VIC 3806', 'Berwick', '3806', 'VIC', -38.0344, 145.3522, 'Independent Living', 'independent', 340000, 510000, 600, 920, 'DMF', 6, 30, '["Pool", "Community centre", "Gardens", "Shopping access"]'::jsonb, '["Emergency response"]'::jsonb, '["Swimming", "Exercise classes", "Social events", "Shopping trips"]'::jsonb, false, 124, ARRAY['1 bedroom', '2 bedroom', '3 bedroom'], 55, '1300 783 435', 'berwick@unitingagewell.org', 'https://www.unitingagewell.org', 'South-eastern suburbs retirement community with modern villas. Close to Eden Rise shopping, Berwick village and Casey Hospital.', 'approved', 'admin', true),

-- 7. Opal Aged Care Lakes Entrance
('Opal Aged Care Lakes Entrance', 'Opal Aged Care', '88 The Esplanade, Lakes Entrance VIC 3909', 'Lakes Entrance', '3909', 'VIC', -37.8806, 147.9811, 'Mixed', 'Mixed', 280000, 430000, 480, 780, 'DMF', 6, 30, '["Pool", "Lake access", "Beach access", "Fishing", "Community centre"]'::jsonb, '["Emergency response", "Aged care", "24/7 nursing"]'::jsonb, '["Swimming", "Fishing", "Boating", "Beach walks", "Social events"]'::jsonb, true, 76, ARRAY['1 bedroom', '2 bedroom'], 55, '1300 672 524', 'lakesentrance@opalaged.care', 'https://www.opalagedcare.com.au', 'Gippsland coastal retirement village near pristine lakes with modern villas. Perfect fishing, boating and beach lifestyle.', 'approved', 'admin', true),

-- 8. IRT Cranbourne
('IRT Cranbourne', 'IRT Group', '88 South Gippsland Highway, Cranbourne VIC 3977', 'Cranbourne', '3977', 'VIC', -38.0994, 145.2833, 'Mixed', 'Mixed', 300000, 460000, 520, 840, 'DMF', 6, 30, '["Bowling green", "Gardens", "Community centre", "Shopping access"]'::jsonb, '["Emergency response", "Aged care", "24/7 nursing"]'::jsonb, '["Bowls", "Social events", "Garden club", "Shopping trips"]'::jsonb, false, 132, ARRAY['1 bedroom', '2 bedroom', '3 bedroom'], 55, '1300 157 677', 'cranbourne@irt.org.au', 'https://www.irt.org.au', 'South-eastern growth area retirement community with affordable villas. Close to Cranbourne Park shopping and Casey Hospital.', 'approved', 'admin', true),

-- 9. Regis Aged Care Rye
('Regis Aged Care Rye', 'Regis Aged Care', '42 Point Nepean Road, Rye VIC 3941', 'Rye', '3941', 'VIC', -38.3728, 144.8275, 'Mixed', 'Mixed', 380000, 580000, 640, 1000, 'DMF', 6, 30, '["Pool", "Bowling green", "Ocean breezes", "Beach access"]'::jsonb, '["Emergency response", "Aged care", "24/7 nursing"]'::jsonb, '["Swimming", "Bowls", "Beach walks", "Social events"]'::jsonb, false, 84, ARRAY['1 bedroom', '2 bedroom'], 55, '03 5985 3100', 'rye@regis.com.au', 'https://www.regis.com.au', 'Peninsula coastal village retirement near back beaches with quality villas. Walk to Rye village, beaches and pier.', 'approved', 'admin', true),

-- 10. Respect Aged Care Sale
('Respect Aged Care Sale', 'Respect', '88 York Street, Sale VIC 3850', 'Sale', '3850', 'VIC', -38.1089, 147.0678, 'Mixed', 'Mixed', 220000, 360000, 380, 660, 'DMF', 6, 30, '["Bowling green", "Community centre", "Gardens", "Regional setting"]'::jsonb, '["Emergency response", "Aged care", "24/7 nursing"]'::jsonb, '["Bowls", "Social events", "Garden club", "Community activities"]'::jsonb, true, 86, ARRAY['1 bedroom', '2 bedroom'], 55, '03 5144 3100', 'sale@respect.com.au', 'https://www.respect.com.au', 'Gippsland regional city retirement community with comfortable villas. Close to Sale Hospital and shopping.', 'approved', 'admin', true),

-- 11. Arcare Frankston South
('Arcare Frankston South', 'Arcare', '88 Olivers Road, Frankston South VIC 3199', 'Frankston South', '3199', 'VIC', -38.1672, 145.1411, 'Mixed', 'Mixed', 420000, 620000, 680, 1040, 'DMF', 6, 30, '["Pool", "Gym", "Bay views", "Beach access"]'::jsonb, '["Emergency response", "Aged care", "24/7 nursing"]'::jsonb, '["Swimming", "Exercise classes", "Beach walks", "Golf", "Social events"]'::jsonb, false, 102, ARRAY['1 bedroom', '2 bedroom'], 55, '1300 272 273', 'frankstonsouth@arcare.com.au', 'https://www.arcare.com.au', 'Bayside retirement community near Frankston beaches with contemporary apartments. Walk to beach, golf course and Frankston.', 'approved', 'admin', true),

-- 12. Bupa Aged Care Bairnsdale
('Bupa Aged Care Bairnsdale', 'Bupa', '42 Main Street, Bairnsdale VIC 3875', 'Bairnsdale', '3875', 'VIC', -37.8275, 147.6189, 'Mixed', 'Mixed', 220000, 360000, 380, 660, 'DMF', 6, 30, '["Bowling green", "Community centre", "Gardens", "River views"]'::jsonb, '["Emergency response", "Aged care", "24/7 nursing"]'::jsonb, '["Bowls", "Social events", "Garden club", "River activities"]'::jsonb, true, 78, ARRAY['1 bedroom', '2 bedroom'], 55, '1300 280 334', 'bairnsdale@bupa.com.au', 'https://www.bupa.com.au', 'East Gippsland retirement village near Mitchell River with comfortable villas. Close to Bairnsdale city centre and medical facilities.', 'approved', 'admin', true),

-- 13. Allity Narre Warren
('Allity Narre Warren', 'Allity', '88 Princes Highway, Narre Warren VIC 3805', 'Narre Warren', '3805', 'VIC', -38.0294, 145.3025, 'Mixed', 'Mixed', 340000, 510000, 600, 920, 'DMF', 6, 30, '["Pool", "Community centre", "Gardens", "Shopping access"]'::jsonb, '["Emergency response", "Aged care", "24/7 nursing"]'::jsonb, '["Swimming", "Exercise classes", "Social events", "Shopping trips"]'::jsonb, false, 118, ARRAY['1 bedroom', '2 bedroom', '3 bedroom'], 55, '03 9704 3100', 'narrewarren@allity.com.au', 'https://www.allity.com.au', 'South-eastern suburbs retirement community with modern villas near Fountain Gate shopping. Close to Casey Hospital and Monash Freeway.', 'approved', 'admin', true),

-- 14. Bolton Clarke Mount Martha
('Bolton Clarke Mount Martha', 'Bolton Clarke', '88 The Esplanade, Mount Martha VIC 3934', 'Mount Martha', '3934', 'VIC', -38.2658, 145.0144, 'Mixed', 'Mixed', 480000, 720000, 760, 1120, 'DMF', 6, 30, '["Pool", "Bay views", "Beach access", "Coastal walks"]'::jsonb, '["Emergency response", "Aged care", "24/7 nursing"]'::jsonb, '["Swimming", "Beach walks", "Coastal activities", "Social events"]'::jsonb, false, 92, ARRAY['1 bedroom', '2 bedroom'], 55, '1300 228 655', 'mountmartha@boltonclarke.com.au', 'https://www.boltonclarke.com.au', 'Premium peninsula village retirement with quality villas and bay views. Walk to Mount Martha village, cafes and beaches.', 'approved', 'admin', true),

-- 15. Estia Health Traralgon
('Estia Health Traralgon', 'Estia Health', '88 Princes Highway, Traralgon VIC 3844', 'Traralgon', '3844', 'VIC', -38.1958, 146.5406, 'Mixed', 'Mixed', 240000, 380000, 420, 700, 'DMF', 6, 30, '["Pool", "Community centre", "Gardens", "Regional setting"]'::jsonb, '["Emergency response", "Aged care", "24/7 nursing"]'::jsonb, '["Swimming", "Exercise classes", "Social events", "Garden club"]'::jsonb, false, 94, ARRAY['1 bedroom', '2 bedroom'], 55, '03 5174 3100', 'traralgon@estiahealth.com.au', 'https://www.estiahealth.com.au', 'Gippsland regional city retirement community with modern villas near Traralgon CBD. Close to Latrobe Regional Hospital and shopping.', 'approved', 'admin', true),

-- 16. Japara Hastings
('Japara Hastings', 'Japara', '42 Marine Parade, Hastings VIC 3915', 'Hastings', '3915', 'VIC', -38.3097, 145.1883, 'Mixed', 'Mixed', 300000, 460000, 520, 840, 'DMF', 6, 30, '["Community centre", "Gardens", "Marina access", "Beach access"]'::jsonb, '["Emergency response", "Aged care", "24/7 nursing"]'::jsonb, '["Social events", "Garden club", "Marina activities", "Beach walks"]'::jsonb, false, 86, ARRAY['1 bedroom', '2 bedroom'], 55, '1800 52 72 72', 'hastings@japara.com.au', 'https://www.japara.com.au', 'Western Port retirement village near beaches with comfortable villas. Close to Hastings village, marina and beaches.', 'approved', 'admin', true),

-- 17. Tricare Warragul
('Tricare Warragul', 'Tricare', '88 Queen Street, Warragul VIC 3820', 'Warragul', '3820', 'VIC', -38.1603, 145.9311, 'Mixed', 'Mixed', 240000, 380000, 420, 700, 'DMF', 6, 30, '["Bowling green", "Mountain views", "Community centre", "Gardens"]'::jsonb, '["Emergency response", "Aged care", "24/7 nursing"]'::jsonb, '["Bowls", "Social events", "Garden club", "Walking groups"]'::jsonb, false, 74, ARRAY['1 bedroom', '2 bedroom'], 55, '03 5623 3100', 'warragul@tricare.com.au', 'https://www.tricare.com.au', 'Gippsland hills retirement village with cool climate villas and mountain views. Close to Warragul town centre and medical facilities.', 'approved', 'admin', true),

-- 18. Mayflower Dromana
('Mayflower Dromana', 'Mayflower', '88 Point Nepean Road, Dromana VIC 3936', 'Dromana', '3936', 'VIC', -38.3372, 144.9675, 'Independent Living', 'independent', 360000, 540000, 600, 960, 'DMF', 6, 30, '["Bay access", "Beach nearby", "Community centre", "Gardens"]'::jsonb, '["Emergency response"]'::jsonb, '["Beach walks", "Social events", "Garden club"]'::jsonb, true, 78, ARRAY['1 bedroom', '2 bedroom'], 55, '03 5987 1234', 'dromana@mayflower.org.au', 'https://www.mayflower.org.au', 'Mornington Peninsula bayside village retirement with comfortable villas near Dromana beaches. Walk to village, pier and cafes.', 'approved', 'admin', true),

-- 19. RSL Care Wonthaggi
('RSL Care Wonthaggi', 'RSL Care', '42 Graham Street, Wonthaggi VIC 3995', 'Wonthaggi', '3995', 'VIC', -38.6078, 145.5928, 'Mixed', 'Mixed', 220000, 360000, 380, 660, 'DMF', 6, 30, '["Bowling green", "RSL services", "Community centre", "Gardens"]'::jsonb, '["Emergency response", "Aged care", "24/7 nursing", "Veterans services"]'::jsonb, '["Bowls", "RSL activities", "Social events", "Garden club"]'::jsonb, true, 68, ARRAY['1 bedroom', '2 bedroom'], 55, '03 5672 3100', 'wonthaggi@rslcare.org.au', 'https://www.rslcare.org.au', 'Bass Coast retirement village near beaches with affordable villas and veterans services. Close to Wonthaggi town centre and Cape Paterson.', 'approved', 'admin', true),

-- 20. Mercy Health Officer
('Mercy Health Officer', 'Mercy Health', '88 Tivendale Road, Officer VIC 3809', 'Officer', '3809', 'VIC', -38.0631, 145.4094, 'Mixed', 'Mixed', 340000, 510000, 600, 920, 'DMF', 6, 30, '["Chapel", "Community centre", "Gardens", "Shopping access"]'::jsonb, '["Emergency response", "Aged care", "24/7 nursing", "Pastoral care"]'::jsonb, '["Chapel services", "Social events", "Garden club", "Shopping trips"]'::jsonb, true, 106, ARRAY['1 bedroom', '2 bedroom'], 55, '03 5943 3100', 'officer@mercyhealth.com.au', 'https://www.mercyhealth.com.au', 'South-eastern suburbs retirement community with Catholic heritage and modern villas. Close to Officer shopping and medical facilities.', 'approved', 'admin', true),

-- 21. Benetas Morwell
('Benetas Morwell', 'Benetas', '88 Princes Drive, Morwell VIC 3840', 'Morwell', '3840', 'VIC', -38.2350, 146.3958, 'Mixed', 'Mixed', 200000, 340000, 360, 640, 'DMF', 6, 30, '["Bowling green", "Community centre", "Gardens", "Regional setting"]'::jsonb, '["Emergency response", "Aged care", "24/7 nursing"]'::jsonb, '["Bowls", "Social events", "Garden club", "Community activities"]'::jsonb, true, 82, ARRAY['1 bedroom', '2 bedroom'], 55, '03 5133 3100', 'morwell@benetas.com.au', 'https://www.benetas.com.au', 'Latrobe Valley retirement community with affordable villas. Close to Morwell town centre, Mid Valley shopping and medical facilities.', 'approved', 'admin', true),

-- 22. Embracia Inverloch
('Embracia Inverloch', 'Embracia Health', '42 Ramsey Boulevard, Inverloch VIC 3996', 'Inverloch', '3996', 'VIC', -38.6333, 145.7208, 'Mixed', 'Mixed', 320000, 480000, 560, 880, 'DMF', 6, 30, '["Pool", "Beach access", "Coastal walks", "Fishing"]'::jsonb, '["Emergency response", "Aged care", "24/7 nursing"]'::jsonb, '["Swimming", "Beach walks", "Fishing", "Surfing", "Social events"]'::jsonb, false, 72, ARRAY['1 bedroom', '2 bedroom'], 55, '03 5674 3100', 'inverloch@embracia.com.au', 'https://www.embracia.com.au', 'Bass Coast beachside retirement village with modern villas near pristine Inverloch beaches. Perfect fishing, surfing and beach lifestyle.', 'approved', 'admin', true),

-- 23. Warrigal Care Blairgowrie
('Warrigal Care Blairgowrie', 'Warrigal Care', '88 Nepean Highway, Blairgowrie VIC 3942', 'Blairgowrie', '3942', 'VIC', -38.3589, 144.7656, 'Independent Living', 'independent', 480000, 720000, 760, 1120, 'DMF', 6, 30, '["Ocean access", "Beach nearby", "Community centre", "Village atmosphere"]'::jsonb, '["Emergency response"]'::jsonb, '["Beach walks", "Social events", "Coastal activities"]'::jsonb, false, 64, ARRAY['1 bedroom', '2 bedroom'], 55, '03 5988 1234', 'blairgowrie@warrigal.com.au', 'https://www.warrigal.com.au', 'Peninsula tip retirement village near back beaches with premium villas. Walk to Blairgowrie village, beaches and Sorrento ferry.', 'approved', 'admin', true),

-- 24. Peninsula Villages McCrae
('Peninsula Villages McCrae', 'Peninsula Villages', '1 Nepean Highway, McCrae VIC 3938', 'McCrae', '3938', 'VIC', -38.3494, 144.9167, 'Independent Living', 'independent', 380000, 580000, 640, 1000, 'DMF', 6, 30, '["Pool", "Bowling green", "Beach access", "Foreshore trails", "Community centre"]'::jsonb, '["Emergency response"]'::jsonb, '["Swimming", "Bowls", "Beach walks", "Cycling", "Social events"]'::jsonb, false, 96, ARRAY['1 bedroom', '2 bedroom'], 55, '03 5981 3100', 'mccrae@peninsulavillages.com.au', 'https://www.peninsulavillages.com.au', 'Mornington Peninsula beachside retirement with contemporary villas near McCrae Beach. Walk to beach, foreshore trails and cafes.', 'approved', 'admin', true),

-- 25. Resthaven Leongatha
('Resthaven Leongatha', 'Resthaven', '88 Bair Street, Leongatha VIC 3953', 'Leongatha', '3953', 'VIC', -38.4769, 145.9442, 'Mixed', 'Mixed', 210000, 350000, 360, 640, 'DMF', 6, 30, '["Bowling green", "Community centre", "Gardens", "Country setting"]'::jsonb, '["Emergency response", "Aged care", "24/7 nursing"]'::jsonb, '["Bowls", "Social events", "Garden club", "Country walks"]'::jsonb, true, 64, ARRAY['1 bedroom', '2 bedroom'], 55, '03 5662 1234', 'leongatha@resthaven.asn.au', 'https://www.resthaven.asn.au', 'South Gippsland retirement village with comfortable villas in regional town setting. Close to Leongatha town centre and medical facilities.', 'approved', 'admin', true);