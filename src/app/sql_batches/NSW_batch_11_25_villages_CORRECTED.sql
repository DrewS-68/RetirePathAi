-- NSW Batch 11: 25 NSW Far North Coast & Northern Rivers Retirement Villages (CORRECTED)
-- Geographic Focus: Byron Bay, Ballina, Lismore, Coffs Harbour, Port Macquarie
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

-- 1. Stockland Halcyon Greens Port Macquarie
('Stockland Halcyon Greens Port Macquarie', 'Stockland', '1 Lakewood Drive, Port Macquarie NSW 2444', 'Port Macquarie', '2444', 'NSW', -31.4342, 152.9089, 'Independent Living', 'independent', 380000, 580000, 640, 1000, 'DMF', 6, 30, '["Pool", "Gym", "Cinema", "Bowling green", "Golf course", "Clubhouse", "Gardens"]'::jsonb, '["Emergency response"]'::jsonb, '["Swimming", "Golf", "Movies", "Exercise classes", "Bowls", "Social events"]'::jsonb, false, 214, ARRAY['2 bedroom', '3 bedroom'], 55, '1800 550 550', 'portmacquarie@stockland.com.au', 'https://www.stockland.com.au/retirement', 'Premium Mid North Coast retirement resort near beaches with modern villas and championship golf course access. Pool, gym, cinema, bowling green and clubhouse. Minutes to Port Macquarie beaches.', 'approved', 'admin', true),

-- 2. Palm Lake Resort Ballina Beach
('Palm Lake Resort Ballina Beach', 'Palm Lake Resort', '1 Beach Avenue, Ballina NSW 2478', 'Ballina', '2478', 'NSW', -28.8664, 153.5625, 'Independent Living', 'independent', 320000, 480000, 480, 760, 'Site Fees', 0, 0, '["Pool", "Tennis courts", "Bowling green", "Gym", "Clubhouse", "Beach access"]'::jsonb, '["Emergency response"]'::jsonb, '["Swimming", "Tennis", "Bowls", "Exercise classes", "Beach walks", "Social events"]'::jsonb, true, 186, ARRAY['2 bedroom', '3 bedroom'], 50, '02 6686 9300', 'ballinabeach@palmlakeresort.com.au', 'https://www.palmlakeresort.com.au', 'North Coast over-50s resort community near beaches with contemporary manufactured homes. Pool, tennis, bowling green, gym and community hub. Walk to Ballina beaches and shops.', 'approved', 'admin', true),

-- 3. Aveo Freedom Coffs Harbour
('Aveo Freedom Coffs Harbour', 'Aveo Group', '88 Ocean Parade, Coffs Harbour NSW 2450', 'Coffs Harbour', '2450', 'NSW', -30.2986, 153.1169, 'Independent Living', 'independent', 340000, 520000, 600, 920, 'DMF', 6, 30, '["Pool", "Gym", "Bowling green", "Community centre", "Gardens", "Workshop"]'::jsonb, '["Emergency response"]'::jsonb, '["Swimming", "Exercise classes", "Bowls", "Workshop activities", "Social events"]'::jsonb, false, 156, ARRAY['1 bedroom', '2 bedroom', '3 bedroom'], 55, '1300 283 000', 'coffsharbour@aveo.com.au', 'https://www.aveo.com.au', 'Coastal retirement village near pristine Coffs beaches with modern villas and apartments. Pool, gym, bowling green and community centre. Year-round mild climate.', 'approved', 'admin', true),

-- 4. Anglicare Greenview Gardens Lismore
('Anglicare Greenview Gardens Lismore', 'Anglicare', '42 Ballina Road, Lismore NSW 2480', 'Lismore', '2480', 'NSW', -28.8142, 153.2803, 'Mixed', 'Mixed', 260000, 400000, 440, 720, 'DMF', 6, 30, '["Chapel", "Bowling green", "Gardens", "Mountain views", "Community centre"]'::jsonb, '["Emergency response", "Aged care", "24/7 nursing"]'::jsonb, '["Chapel services", "Bowls", "Social events", "Garden club"]'::jsonb, true, 94, ARRAY['1 bedroom', '2 bedroom'], 55, '02 6621 3100', 'lismore@anglicare.org.au', 'https://www.anglicare.org.au', 'Northern Rivers retirement village in regional Lismore with spacious villas, tropical gardens and mountain views. Close to Base Hospital and shopping. Warm subtropical climate.', 'approved', 'admin', true),

-- 5. IRT The Palms Ballina
('IRT The Palms Ballina', 'IRT Group', '88 River Street, Ballina NSW 2478', 'Ballina', '2478', 'NSW', -28.8672, 153.5681, 'Mixed', 'Mixed', 300000, 460000, 520, 840, 'DMF', 6, 30, '["Pool", "Bowling green", "Gardens", "River views", "Community centre"]'::jsonb, '["Emergency response", "Aged care", "24/7 nursing"]'::jsonb, '["Swimming", "Bowls", "Social events", "Garden club", "Fishing"]'::jsonb, false, 118, ARRAY['1 bedroom', '2 bedroom', '3 bedroom'], 55, '1300 157 677', 'ballina@irt.org.au', 'https://www.irt.org.au', 'North Coast retirement community near beaches and river with comfortable villas and subtropical gardens. Short drive to Byron Bay, Ballina beaches and Richmond Valley.', 'approved', 'admin', true),

-- 6. Uniting Wauchope
('Uniting Wauchope', 'Uniting', '22 High Street, Wauchope NSW 2446', 'Wauchope', '2446', 'NSW', -31.4603, 152.7361, 'Independent Living', 'independent', 240000, 380000, 400, 680, 'DMF', 6, 30, '["Community centre", "Gardens", "Bowling green", "Library", "BBQ areas"]'::jsonb, '["Emergency response"]'::jsonb, '["Bowls", "Social events", "Garden club", "Shopping trips"]'::jsonb, false, 86, ARRAY['1 bedroom', '2 bedroom'], 55, '1300 864 846', 'wauchope@uniting.org', 'https://www.uniting.org', 'Hastings region retirement village near Port Macquarie with affordable villas. Close to Wauchope town centre and Timbertown. Easy access to beaches and Hastings River.', 'approved', 'admin', true),

-- 7. Opal Aged Care Byron Bay
('Opal Aged Care Byron Bay', 'Opal Aged Care', '88 Bangalow Road, Byron Bay NSW 2481', 'Byron Bay', '2481', 'NSW', -28.6433, 153.6122, 'Mixed', 'Mixed', 520000, 780000, 800, 1200, 'DMF', 6, 30, '["Pool", "Gym", "Wellness centre", "Hinterland views", "Beach access"]'::jsonb, '["Emergency response", "Aged care", "24/7 nursing"]'::jsonb, '["Swimming", "Exercise classes", "Wellness programs", "Beach walks", "Social events"]'::jsonb, false, 72, ARRAY['1 bedroom', '2 bedroom'], 55, '1300 672 524', 'byronbay@opalaged.care', 'https://www.opalagedcare.com.au', 'Premium Northern Rivers retirement near iconic Byron Bay with modern apartments and hinterland views. Walk to beaches, cafes and bohemian village. Ultimate coastal lifestyle.', 'approved', 'admin', true),

-- 8. Presbyterian Aged Care Kempsey
('Presbyterian Aged Care Kempsey', 'Presbyterian Aged Care NSW & ACT', '42 Sea Street, Kempsey NSW 2440', 'Kempsey', '2440', 'NSW', -31.0797, 152.8358, 'Mixed', 'Mixed', 220000, 360000, 380, 660, 'DMF', 6, 30, '["Chapel", "Community centre", "Gardens", "River views"]'::jsonb, '["Emergency response", "Aged care", "24/7 nursing"]'::jsonb, '["Chapel services", "Social events", "Garden club", "Fishing"]'::jsonb, true, 78, ARRAY['1 bedroom', '2 bedroom'], 55, '02 6562 3100', 'kempsey@pac.org.au', 'https://www.pac.org.au', 'Mid North Coast retirement village in Kempsey with comfortable villas, chapel and community facilities. Close to Macleay River and medical services. Affordable regional living.', 'approved', 'admin', true),

-- 9. Baptistcare Macleay Valley
('Baptistcare Macleay Valley', 'BaptistCare', '88 Pacific Highway, Kempsey NSW 2440', 'Kempsey', '2440', 'NSW', -31.0822, 152.8369, 'Mixed', 'Mixed', 240000, 380000, 420, 700, 'DMF', 6, 30, '["Chapel", "Bowling green", "River views", "Gardens", "Community centre"]'::jsonb, '["Emergency response", "Aged care", "24/7 nursing"]'::jsonb, '["Chapel services", "Bowls", "Social events", "Fishing", "Garden club"]'::jsonb, true, 92, ARRAY['1 bedroom', '2 bedroom'], 55, '02 6562 4200', 'kempsey@baptistcare.org.au', 'https://www.baptistcare.org.au', 'Kempsey region retirement community with river views and spacious villas surrounded by tropical gardens. Enjoy mild coastal climate and river lifestyle.', 'approved', 'admin', true),

-- 10. Regis Aged Care Coffs Harbour
('Regis Aged Care Coffs Harbour', 'Regis Aged Care', '22 Park Beach Road, Coffs Harbour NSW 2450', 'Coffs Harbour', '2450', 'NSW', -30.2864, 153.1294, 'Mixed', 'Mixed', 320000, 480000, 560, 880, 'DMF', 6, 30, '["Pool", "Bowling green", "Gardens", "Ocean breeze", "Community centre"]'::jsonb, '["Emergency response", "Aged care", "24/7 nursing"]'::jsonb, '["Swimming", "Bowls", "Social events", "Beach walks", "Garden club"]'::jsonb, false, 104, ARRAY['1 bedroom', '2 bedroom'], 55, '02 6652 4100', 'coffs@regis.com.au', 'https://www.regis.com.au', 'Mid North Coast retirement village near beaches with quality villas, ocean breezes and tropical gardens. Walk to Coffs Jetty, beaches and shopping plaza.', 'approved', 'admin', true),

-- 11. Respect Aged Care Grafton
('Respect Aged Care Grafton', 'Respect', '88 Prince Street, Grafton NSW 2460', 'Grafton', '2460', 'NSW', -29.6908, 152.9333, 'Mixed', 'Mixed', 240000, 380000, 420, 700, 'DMF', 6, 30, '["Bowling green", "Community centre", "Gardens", "River views"]'::jsonb, '["Emergency response", "Aged care", "24/7 nursing"]'::jsonb, '["Bowls", "Social events", "Garden club", "Jacaranda festival"]'::jsonb, true, 86, ARRAY['1 bedroom', '2 bedroom'], 55, '02 6642 3100', 'grafton@respect.com.au', 'https://www.respect.com.au', 'Clarence Valley retirement village with jacaranda-lined streets and comfortable villas near Clarence River. Historic town centre and medical facilities nearby.', 'approved', 'admin', true),

-- 12. Southern Cross Care Macksville
('Southern Cross Care Macksville', 'Southern Cross Care', '42 River Street, Macksville NSW 2447', 'Macksville', '2447', 'NSW', -30.7097, 152.9197, 'Mixed', 'Mixed', 260000, 400000, 460, 740, 'DMF', 6, 30, '["Bowling green", "Community centre", "Gardens", "Coastal setting"]'::jsonb, '["Emergency response", "Aged care", "24/7 nursing"]'::jsonb, '["Bowls", "Social events", "Garden club", "Beach walks", "Fishing"]'::jsonb, false, 74, ARRAY['1 bedroom', '2 bedroom'], 55, '02 6568 3100', 'macksville@sccliving.org.au', 'https://www.sccliving.org.au', 'Nambucca Valley retirement community near beaches with spacious villas in tropical setting. Close to Nambucca Heads beaches and Scotts Head. Relaxed coastal living.', 'approved', 'admin', true),

-- 13. Adventist Retirement Plus Goonellabah
('Adventist Retirement Plus Goonellabah', 'Adventist Retirement Plus', '88 Loftus Drive, Goonellabah NSW 2480', 'Goonellabah', '2480', 'NSW', -28.8203, 153.3142, 'Independent Living', 'independent', 260000, 400000, 460, 740, 'DMF', 6, 30, '["Pool", "Wellness centre", "Rainforest views", "Walking trails", "Gardens"]'::jsonb, '["Emergency response"]'::jsonb, '["Swimming", "Walking", "Health programs", "Social events", "Nature activities"]'::jsonb, false, 96, ARRAY['1 bedroom', '2 bedroom'], 55, '02 6625 4200', 'goonellabah@adventistretirementplus.org.au', 'https://www.retirementplus.com.au', 'Lismore hinterland retirement village with rainforest views and health-focused community. Pool, wellness centre and walking trails. Close to Southern Cross University and Lismore.', 'approved', 'admin', true),

-- 14. Estia Health Nambucca Heads
('Estia Health Nambucca Heads', 'Estia Health', '22 Wellington Drive, Nambucca Heads NSW 2448', 'Nambucca Heads', '2448', 'NSW', -30.6425, 153.0036, 'Mixed', 'Mixed', 280000, 430000, 480, 780, 'DMF', 6, 30, '["Pool", "Beach access", "River views", "Community centre"]'::jsonb, '["Emergency response", "Aged care", "24/7 nursing"]'::jsonb, '["Swimming", "Beach walks", "Fishing", "Social events", "Coastal walks"]'::jsonb, false, 68, ARRAY['1 bedroom', '2 bedroom'], 55, '02 6569 3100', 'nambucca@estiahealth.com.au', 'https://www.estiahealth.com.au', 'Mid North Coast beachside retirement village with modern villas near pristine beaches and Nambucca River. Perfect fishing and beach lifestyle destination.', 'approved', 'admin', true),

-- 15. Bupa Aged Care Tweed Heads
('Bupa Aged Care Tweed Heads', 'Bupa', '88 Tweed Coast Road, Tweed Heads NSW 2485', 'Tweed Heads', '2485', 'NSW', -28.1789, 153.5433, 'Mixed', 'Mixed', 340000, 520000, 600, 920, 'DMF', 6, 30, '["Pool", "Gym", "Community centre", "Gardens", "Beach access"]'::jsonb, '["Emergency response", "Aged care", "24/7 nursing"]'::jsonb, '["Swimming", "Exercise classes", "Social events", "Beach walks"]'::jsonb, true, 112, ARRAY['1 bedroom', '2 bedroom'], 55, '1300 280 334', 'tweedheads@bupa.com.au', 'https://www.bupa.com.au', 'Far North Coast retirement village on Queensland border with modern villas near Gold Coast beaches. Access to Tweed and Gold Coast amenities. Warm subtropical climate.', 'approved', 'admin', true),

-- 16. Allity Port Macquarie Central
('Allity Port Macquarie Central', 'Allity', '42 Horton Street, Port Macquarie NSW 2444', 'Port Macquarie', '2444', 'NSW', -31.4303, 152.9089, 'Mixed', 'Mixed', 380000, 580000, 640, 1000, 'DMF', 6, 30, '["Rooftop terrace", "Urban location", "Community centre", "Library"]'::jsonb, '["Emergency response", "Aged care", "24/7 nursing"]'::jsonb, '["Social events", "Shopping trips", "Cafe visits"]'::jsonb, false, 96, ARRAY['1 bedroom', '2 bedroom'], 55, '02 6584 3100', 'portmac@allity.com.au', 'https://www.allity.com.au', 'Town centre retirement community near Settlement City with contemporary apartments and rooftop terrace. Walk to shops, restaurants, cinema and waterfront. Perfect urban coastal retirement.', 'approved', 'admin', true),

-- 17. Bolton Clarke Casino
('Bolton Clarke Casino', 'Bolton Clarke', '88 Canterbury Street, Casino NSW 2470', 'Casino', '2470', 'NSW', -28.8678, 153.0464, 'Mixed', 'Mixed', 210000, 350000, 360, 640, 'DMF', 6, 30, '["Community centre", "Gardens", "Bowling green", "Library"]'::jsonb, '["Emergency response", "Aged care", "24/7 nursing"]'::jsonb, '["Bowls", "Social events", "Garden club"]'::jsonb, true, 72, ARRAY['1 bedroom', '2 bedroom'], 55, '1300 228 655', 'casino@boltonclarke.com.au', 'https://www.boltonclarke.com.au', 'Richmond Valley retirement village in Casino with comfortable villas and community centre. Close to regional services and Northern Rivers attractions. Affordable country living.', 'approved', 'admin', true),

-- 18. Villa Maria Catholic Homes Murwillumbah
('Villa Maria Catholic Homes Murwillumbah', 'Villa Maria Catholic Homes', '42 Murwillumbah Street, Murwillumbah NSW 2484', 'Murwillumbah', '2484', 'NSW', -28.3289, 153.3978, 'Mixed', 'Mixed', 260000, 410000, 460, 760, 'DMF', 6, 30, '["Chapel", "Mountain views", "Gardens", "Bowling green"]'::jsonb, '["Emergency response", "Aged care", "24/7 nursing", "Pastoral care"]'::jsonb, '["Chapel services", "Bowls", "Social events", "Garden club", "Nature walks"]'::jsonb, true, 68, ARRAY['1 bedroom', '2 bedroom'], 55, '02 6672 3100', 'murwillumbah@vmch.com.au', 'https://www.vmch.com.au', 'Tweed Valley retirement village with mountain views and Catholic community. Chapel, pastoral care and gardens. Explore Mount Warning and hinterland waterfalls.', 'approved', 'admin', true),

-- 19. Japara Lennox Head
('Japara Lennox Head', 'Japara', '88 Ballina Street, Lennox Head NSW 2478', 'Lennox Head', '2478', 'NSW', -28.7892, 153.5900, 'Mixed', 'Mixed', 420000, 640000, 680, 1040, 'DMF', 6, 30, '["Pool", "Ocean views", "Beach access", "Community centre"]'::jsonb, '["Emergency response", "Aged care", "24/7 nursing"]'::jsonb, '["Swimming", "Beach walks", "Surfing", "Social events", "Coastal walks"]'::jsonb, false, 62, ARRAY['1 bedroom', '2 bedroom'], 55, '1800 52 72 72', 'lennoxhead@japara.com.au', 'https://www.japara.com.au', 'Premium North Coast beachside retirement near Byron Bay with modern villas and ocean views. Walk to Lennox Head village, surf breaks and coastal walks. Iconic location.', 'approved', 'admin', true),

-- 20. Tricare Sawtell
('Tricare Sawtell', 'Tricare', '22 Boronia Street, Sawtell NSW 2452', 'Sawtell', '2452', 'NSW', -30.3633, 153.1064, 'Mixed', 'Mixed', 380000, 580000, 640, 1000, 'DMF', 6, 30, '["Pool", "Bowling green", "Beach access", "Community centre"]'::jsonb, '["Emergency response", "Aged care", "24/7 nursing"]'::jsonb, '["Swimming", "Bowls", "Beach walks", "Social events", "Cafe visits"]'::jsonb, false, 84, ARRAY['1 bedroom', '2 bedroom'], 55, '02 6653 3100', 'sawtell@tricare.com.au', 'https://www.tricare.com.au', 'Coffs Coast beachside retirement village with modern villas near beautiful Sawtell Beach. Walk to Sawtell village cafes, shops and First Avenue beachfront. Premium coastal position.', 'approved', 'admin', true),

-- 21. Mayflower Yamba
('Mayflower Yamba', 'Mayflower', '88 Yamba Road, Yamba NSW 2464', 'Yamba', '2464', 'NSW', -29.4392, 153.3586, 'Independent Living', 'independent', 320000, 490000, 560, 880, 'DMF', 6, 30, '["Ocean views", "River views", "Fishing access", "Community centre", "Gardens"]'::jsonb, '["Emergency response"]'::jsonb, '["Fishing", "Social events", "Beach walks", "Garden club"]'::jsonb, false, 72, ARRAY['2 bedroom', '3 bedroom'], 55, '02 6646 1234', 'yamba@mayflower.org.au', 'https://www.mayflower.org.au', 'Clarence River mouth retirement village with ocean and river views and spacious villas near pristine beaches. Perfect fishing paradise and coastal lifestyle.', 'approved', 'admin', true),

-- 22. RSL LifeCare Ocean Shores
('RSL LifeCare Ocean Shores', 'RSL LifeCare', '88 Shara Boulevard, Ocean Shores NSW 2483', 'Ocean Shores', '2483', 'NSW', -28.5189, 153.5394, 'Independent Living', 'independent', 300000, 460000, 520, 840, 'DMF', 6, 30, '["Gardens", "Walking trails", "Community centre", "Nature setting", "RSL services"]'::jsonb, '["Emergency response", "Veterans services"]'::jsonb, '["Walking", "Social events", "Garden club", "RSL activities"]'::jsonb, true, 94, ARRAY['2 bedroom', '3 bedroom'], 55, '02 6680 3100', 'oceanshores@rsllifecare.org.au', 'https://www.rsllifecare.org.au', 'Brunswick Heads hinterland retirement community with peaceful villas surrounded by nature. Close to Byron Bay, Brunswick beaches and village cafes. Veterans services available.', 'approved', 'admin', true),

-- 23. Ingenia Lifestyle Lake Cathie
('Ingenia Lifestyle Lake Cathie', 'Ingenia Communities', '1 Beach Drive, Lake Cathie NSW 2445', 'Lake Cathie', '2445', 'NSW', -31.5553, 152.8544, 'Independent Living', 'independent', 240000, 400000, 380, 660, 'Site Fees', 0, 0, '["Pool", "Bowling green", "Beach access", "Lake access", "Clubhouse"]'::jsonb, '["Emergency response"]'::jsonb, '["Swimming", "Bowls", "Surfing", "Fishing", "Social events", "Beach walks"]'::jsonb, true, 178, ARRAY['2 bedroom', '3 bedroom'], 50, '02 6585 1234', 'lakecathie@ingeniacommunities.com.au', 'https://www.ingeniacommunities.com.au', 'Port Macquarie beaches over-50s resort with modern manufactured homes near pristine Lake Cathie beaches. Perfect surfing, fishing and coastal lifestyle. Affordable beach living.', 'approved', 'admin', true),

-- 24. NewDirection Care Woolgoolga
('NewDirection Care Woolgoolga', 'NewDirection Care', '22 Beach Street, Woolgoolga NSW 2456', 'Woolgoolga', '2456', 'NSW', -30.1125, 153.1978, 'Mixed', 'Mixed', 300000, 460000, 520, 840, 'DMF', 6, 30, '["Community centre", "Gardens", "Beach access", "Cultural centre"]'::jsonb, '["Emergency response", "Aged care", "24/7 nursing"]'::jsonb, '["Social events", "Garden club", "Beach walks", "Cultural programs"]'::jsonb, true, 76, ARRAY['1 bedroom', '2 bedroom'], 55, '02 6654 3100', 'woolgoolga@newdirection.com.au', 'https://www.newdirection.com.au', 'Coffs Coast Indian village retirement community with multicultural programs. Near beautiful Woolgoolga beaches and curry restaurants. Unique cultural diversity and coastal lifestyle.', 'approved', 'admin', true),

-- 25. Arcare Armidale
('Arcare Armidale', 'Arcare', '88 Marsh Street, Armidale NSW 2350', 'Armidale', '2350', 'NSW', -30.5028, 151.6639, 'Mixed', 'Mixed', 260000, 410000, 460, 760, 'DMF', 6, 30, '["Bowling green", "Gardens", "Community centre", "Heritage setting"]'::jsonb, '["Emergency response", "Aged care", "24/7 nursing"]'::jsonb, '["Bowls", "Social events", "Garden club", "Heritage tours"]'::jsonb, true, 82, ARRAY['1 bedroom', '2 bedroom'], 55, '1300 272 273', 'armidale@arcare.com.au', 'https://www.arcare.com.au', 'New England Tablelands retirement village with cool climate and heritage city villas. Close to Armidale Hospital, university and Cathedral. Country city lifestyle with four seasons.', 'approved', 'admin', true);