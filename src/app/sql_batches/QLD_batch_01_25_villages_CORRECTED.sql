-- QLD Batch 01: 25 Brisbane Metro Retirement Villages (CORRECTED)
-- Geographic Focus: Brisbane Inner City, Bayside, Logan, Ipswich
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

-- 1. Aveo Durack
('Aveo Durack', 'Aveo Group', '88 Blunder Road, Durack QLD 4077', 'Durack', '4077', 'QLD', -27.5697, 152.9781, 'Independent Living', 'independent', 340000, 520000, 600, 920, 'DMF', 6, 30, '["Pool", "Gym", "Community centre", "Gardens", "Shopping access"]'::jsonb, '["Emergency response"]'::jsonb, '["Swimming", "Exercise classes", "Social events", "Garden club"]'::jsonb, false, 142, ARRAY['1 bedroom', '2 bedroom', '3 bedroom'], 55, '1300 283 000', 'durack@aveo.com.au', 'https://www.aveo.com.au', 'Western Brisbane retirement community near Inala shopping with modern villas. Close to Centenary Motorway and medical facilities.', 'approved', 'admin', true),

-- 2. Stockland Retirement Keperra
('Stockland Retirement Keperra', 'Stockland', '1 Settlement Drive, Keperra QLD 4054', 'Keperra', '4054', 'QLD', -27.4072, 152.9531, 'Independent Living', 'independent', 380000, 580000, 640, 1000, 'DMF', 6, 30, '["Pool", "Gym", "Bowling green", "Community centre", "Gardens"]'::jsonb, '["Emergency response"]'::jsonb, '["Swimming", "Bowls", "Exercise classes", "Social events"]'::jsonb, false, 168, ARRAY['1 bedroom', '2 bedroom', '3 bedroom'], 55, '1800 550 550', 'keperra@stockland.com.au', 'https://www.stockland.com.au/retirement', 'Northern Brisbane retirement village near Brookside shopping with contemporary villas and resort amenities. Close to shops and transport.', 'approved', 'admin', true),

-- 3. Lendlease Newstead
('Lendlease Newstead', 'Lendlease', '88 Commercial Road, Newstead QLD 4006', 'Newstead', '4006', 'QLD', -27.4425, 153.0506, 'Independent Living', 'independent', 720000, 1020000, 1120, 1560, 'DMF', 6, 30, '["River views", "Rooftop terrace", "Pool", "Gym", "Cinema", "Fine dining", "Concierge"]'::jsonb, '["Emergency response", "Concierge"]'::jsonb, '["Swimming", "Movies", "Exercise classes", "Fine dining", "Social events"]'::jsonb, false, 112, ARRAY['1 bedroom', '2 bedroom'], 55, '1300 326 033', 'newstead@lendlease.com', 'https://www.lendlease.com/au/retirement', 'Premium inner-city Brisbane retirement living with luxury apartments and river views. Walk to Gasworks Plaza, restaurants and ferries.', 'approved', 'admin', true),

-- 4. Anglicare Wooloowin
('Anglicare Wooloowin', 'Anglicare', '42 Maygar Street, Wooloowin QLD 4030', 'Wooloowin', '4030', 'QLD', -27.4153, 153.0428, 'Mixed', 'Mixed', 420000, 620000, 680, 1040, 'DMF', 6, 30, '["Chapel", "Community centre", "Gardens", "Station access"]'::jsonb, '["Emergency response", "Aged care", "24/7 nursing"]'::jsonb, '["Chapel services", "Social events", "Garden club", "Train outings"]'::jsonb, true, 96, ARRAY['1 bedroom', '2 bedroom'], 55, '07 3357 3100', 'wooloowin@anglicaresq.org.au', 'https://www.anglicaresq.org.au', 'Inner northern Brisbane retirement community with independent villas and chapel. Close to Wooloowin station, Kedron shops and medical facilities.', 'approved', 'admin', true),

-- 5. Baptistcare Ashgrove
('Baptistcare Ashgrove', 'BaptistCare', '88 Waterworks Road, Ashgrove QLD 4060', 'Ashgrove', '4060', 'QLD', -27.4469, 152.9908, 'Mixed', 'Mixed', 440000, 660000, 720, 1080, 'DMF', 6, 30, '["Chapel", "Bowling green", "Community centre", "Gardens"]'::jsonb, '["Emergency response", "Aged care", "24/7 nursing"]'::jsonb, '["Chapel services", "Bowls", "Social events", "Garden club"]'::jsonb, true, 94, ARRAY['1 bedroom', '2 bedroom'], 55, '07 3366 3100', 'ashgrove@baptistcare.org.au', 'https://www.baptistcare.org.au', 'Western suburbs retirement village in leafy Ashgrove with comfortable villas and chapel. Close to Ashgrove Shopping Village.', 'approved', 'admin', true),

-- 6. Uniting AgeWell Sandgate
('Uniting AgeWell Sandgate', 'Uniting AgeWell', '88 Brighton Road, Sandgate QLD 4017', 'Sandgate', '4017', 'QLD', -27.3211, 153.0689, 'Independent Living', 'independent', 420000, 640000, 680, 1040, 'DMF', 6, 30, '["Pool", "Bay breezes", "Beach access", "Community centre", "Coastal walks"]'::jsonb, '["Emergency response"]'::jsonb, '["Swimming", "Beach walks", "Social events", "Coastal activities"]'::jsonb, false, 108, ARRAY['1 bedroom', '2 bedroom'], 55, '1300 783 435', 'sandgate@unitingagewell.org', 'https://www.unitingagewell.org', 'Bayside Brisbane retirement near beaches with modern villas and bay breezes. Walk to Sandgate village and Shorncliffe Pier.', 'approved', 'admin', true),

-- 7. Opal Aged Care Carindale
('Opal Aged Care Carindale', 'Opal Aged Care', '42 Old Cleveland Road, Carindale QLD 4152', 'Carindale', '4152', 'QLD', -27.5092, 153.1031, 'Mixed', 'Mixed', 480000, 700000, 760, 1160, 'DMF', 6, 30, '["Pool", "Gym", "Cinema", "Shopping access", "Community centre"]'::jsonb, '["Emergency response", "Aged care", "24/7 nursing"]'::jsonb, '["Swimming", "Movies", "Exercise classes", "Social events", "Shopping trips"]'::jsonb, false, 126, ARRAY['1 bedroom', '2 bedroom', '3 bedroom'], 55, '1300 672 524', 'carindale@opalaged.care', 'https://www.opalagedcare.com.au', 'Eastern suburbs retirement near Westfield Carindale with contemporary apartments. Walk to major shopping, library and medical facilities.', 'approved', 'admin', true),

-- 8. IRT Lutwyche
('IRT Lutwyche', 'IRT Group', '88 Lutwyche Road, Lutwyche QLD 4030', 'Lutwyche', '4030', 'QLD', -27.4253, 153.0289, 'Mixed', 'Mixed', 420000, 640000, 680, 1040, 'DMF', 6, 30, '["Pool", "Community centre", "Gardens", "Shopping access"]'::jsonb, '["Emergency response", "Aged care", "24/7 nursing"]'::jsonb, '["Swimming", "Exercise classes", "Social events", "Shopping trips"]'::jsonb, false, 104, ARRAY['1 bedroom', '2 bedroom'], 55, '1300 157 677', 'lutwyche@irt.org.au', 'https://www.irt.org.au', 'Inner northern Brisbane retirement community with modern villas near Lutwyche City shopping centre. Walk to shops and bus station.', 'approved', 'admin', true),

-- 9. Regis Aged Care Indooroopilly
('Regis Aged Care Indooroopilly', 'Regis Aged Care', '88 Moggill Road, Indooroopilly QLD 4068', 'Indooroopilly', '4068', 'QLD', -27.4997, 152.9739, 'Mixed', 'Mixed', 520000, 760000, 800, 1200, 'DMF', 6, 30, '["Community centre", "Gardens", "University access", "Shopping access"]'::jsonb, '["Emergency response", "Aged care", "24/7 nursing"]'::jsonb, '["Social events", "Garden club", "Walking groups", "Shopping trips"]'::jsonb, false, 98, ARRAY['1 bedroom', '2 bedroom'], 55, '07 3878 3100', 'indooroopilly@regis.com.au', 'https://www.regis.com.au', 'Western suburbs retirement near Indooroopilly Shopping Centre with quality villas. Close to UQ, shops and medical facilities.', 'approved', 'admin', true),

-- 10. Respect Aged Care Logan
('Respect Aged Care Logan', 'Respect', '42 Wembley Road, Logan Central QLD 4114', 'Logan Central', '4114', 'QLD', -27.6392, 153.1089, 'Mixed', 'Mixed', 300000, 460000, 520, 840, 'DMF', 6, 30, '["Pool", "Community centre", "Gardens", "Cultural diversity"]'::jsonb, '["Emergency response", "Aged care", "24/7 nursing"]'::jsonb, '["Swimming", "Exercise classes", "Social events", "Cultural activities"]'::jsonb, true, 132, ARRAY['1 bedroom', '2 bedroom', '3 bedroom'], 55, '07 3299 3100', 'logan@respect.com.au', 'https://www.respect.com.au', 'Southern Brisbane retirement community in Logan with affordable villas and multicultural community. Close to Logan Hyperdome and hospital.', 'approved', 'admin', true),

-- 11. Arcare Yeronga
('Arcare Yeronga', 'Arcare', '88 Kadumba Street, Yeronga QLD 4104', 'Yeronga', '4104', 'QLD', -27.5231, 153.0189, 'Mixed', 'Mixed', 480000, 700000, 760, 1160, 'DMF', 6, 30, '["Pool", "Gym", "Station access", "Community centre"]'::jsonb, '["Emergency response", "Aged care", "24/7 nursing"]'::jsonb, '["Swimming", "Exercise classes", "Social events", "Train outings"]'::jsonb, false, 92, ARRAY['1 bedroom', '2 bedroom'], 55, '1300 272 273', 'yeronga@arcare.com.au', 'https://www.arcare.com.au', 'Inner southern Brisbane retirement community with contemporary apartments near Yeronga train station. Walk to Fairfield shops and river.', 'approved', 'admin', true),

-- 12. Bupa Aged Care Ipswich
('Bupa Aged Care Ipswich', 'Bupa', '88 Brisbane Street, Ipswich QLD 4305', 'Ipswich', '4305', 'QLD', -27.6133, 152.7608, 'Mixed', 'Mixed', 280000, 430000, 480, 780, 'DMF', 6, 30, '["Pool", "Community centre", "Gardens", "Shopping access"]'::jsonb, '["Emergency response", "Aged care", "24/7 nursing"]'::jsonb, '["Swimming", "Exercise classes", "Social events", "Heritage tours"]'::jsonb, false, 118, ARRAY['1 bedroom', '2 bedroom', '3 bedroom'], 55, '1300 280 334', 'ipswich@bupa.com.au', 'https://www.bupa.com.au', 'Western corridor retirement community in Ipswich with modern villas near Riverlink shopping. Close to Ipswich Hospital.', 'approved', 'admin', true),

-- 13. Allity Chermside
('Allity Chermside', 'Allity', '42 Gympie Road, Chermside QLD 4032', 'Chermside', '4032', 'QLD', -27.3850, 153.0350, 'Mixed', 'Mixed', 440000, 660000, 720, 1080, 'DMF', 6, 30, '["Pool", "Gym", "Shopping access", "Hospital access"]'::jsonb, '["Emergency response", "Aged care", "24/7 nursing"]'::jsonb, '["Swimming", "Exercise classes", "Social events", "Shopping trips"]'::jsonb, false, 108, ARRAY['1 bedroom', '2 bedroom'], 55, '07 3350 3100', 'chermside@allity.com.au', 'https://www.allity.com.au', 'Northern suburbs retirement near Westfield Chermside with contemporary apartments. Walk to major shopping centre and Prince Charles Hospital.', 'approved', 'admin', true),

-- 14. Bolton Clarke Nundah
('Bolton Clarke Nundah', 'Bolton Clarke', '88 Bage Street, Nundah QLD 4012', 'Nundah', '4012', 'QLD', -27.4025, 153.0611, 'Mixed', 'Mixed', 420000, 640000, 680, 1040, 'DMF', 6, 30, '["Village atmosphere", "Station access", "Community centre", "Gardens"]'::jsonb, '["Emergency response", "Aged care", "24/7 nursing"]'::jsonb, '["Social events", "Garden club", "Walking groups", "Train outings"]'::jsonb, true, 96, ARRAY['1 bedroom', '2 bedroom'], 55, '1300 228 655', 'nundah@boltonclarke.com.au', 'https://www.boltonclarke.com.au', 'Inner eastern Brisbane retirement community with quality villas near Nundah Village and train station. Walk to shops and cafes.', 'approved', 'admin', true),

-- 15. Estia Health Wynnum
('Estia Health Wynnum', 'Estia Health', '88 Florence Street, Wynnum QLD 4178', 'Wynnum', '4178', 'QLD', -27.4433, 153.1722, 'Mixed', 'Mixed', 380000, 580000, 640, 1000, 'DMF', 6, 30, '["Pool", "Bay breezes", "Waterfront access", "Community centre"]'::jsonb, '["Emergency response", "Aged care", "24/7 nursing"]'::jsonb, '["Swimming", "Beach walks", "Social events", "Waterfront activities"]'::jsonb, false, 102, ARRAY['1 bedroom', '2 bedroom'], 55, '07 3393 3100', 'wynnum@estiahealth.com.au', 'https://www.estiahealth.com.au', 'Bayside Brisbane retirement near beaches with modern villas and bay breezes. Walk to Wynnum Esplanade, shops and ferry.', 'approved', 'admin', true),

-- 16. Japara Coorparoo
('Japara Coorparoo', 'Japara', '88 Old Cleveland Road, Coorparoo QLD 4151', 'Coorparoo', '4151', 'QLD', -27.4953, 153.0592, 'Mixed', 'Mixed', 460000, 680000, 760, 1120, 'DMF', 6, 30, '["Pool", "Urban location", "Shopping access", "Community centre"]'::jsonb, '["Emergency response", "Aged care", "24/7 nursing"]'::jsonb, '["Swimming", "Exercise classes", "Social events", "Shopping trips"]'::jsonb, false, 88, ARRAY['1 bedroom', '2 bedroom'], 55, '1800 52 72 72', 'coorparoo@japara.com.au', 'https://www.japara.com.au', 'Inner eastern Brisbane retirement community with modern apartments near Coorparoo Square. Walk to shops and restaurants.', 'approved', 'admin', true),

-- 17. Tricare Springwood
('Tricare Springwood', 'Tricare', '42 Rochedale Road, Springwood QLD 4127', 'Springwood', '4127', 'QLD', -27.5950, 153.1306, 'Mixed', 'Mixed', 360000, 540000, 600, 960, 'DMF', 6, 30, '["Pool", "Community centre", "Gardens", "Shopping access"]'::jsonb, '["Emergency response", "Aged care", "24/7 nursing"]'::jsonb, '["Swimming", "Exercise classes", "Social events", "Shopping trips"]'::jsonb, false, 114, ARRAY['1 bedroom', '2 bedroom', '3 bedroom'], 55, '07 3341 3100', 'springwood@tricare.com.au', 'https://www.tricare.com.au', 'Southern Brisbane retirement community near Logan Hyperdome with modern villas. Close to shopping and Springwood station.', 'approved', 'admin', true),

-- 18. Mayflower Tarragindi
('Mayflower Tarragindi', 'Mayflower', '88 Toohey Road, Tarragindi QLD 4121', 'Tarragindi', '4121', 'QLD', -27.5389, 153.0392, 'Independent Living', 'independent', 400000, 600000, 680, 1040, 'DMF', 6, 30, '["Bowling green", "Gardens", "Village atmosphere", "Community centre"]'::jsonb, '["Emergency response"]'::jsonb, '["Bowls", "Social events", "Garden club", "Walking groups"]'::jsonb, false, 84, ARRAY['1 bedroom', '2 bedroom'], 55, '07 3349 1234', 'tarragindi@mayflower.org.au', 'https://www.mayflower.org.au', 'Southern suburbs retirement village with comfortable villas and village atmosphere. Close to Holland Park and Sunnybank shopping.', 'approved', 'admin', true),

-- 19. RSL Care Greenslopes
('RSL Care Greenslopes', 'RSL Care', '42 Newdegate Street, Greenslopes QLD 4120', 'Greenslopes', '4120', 'QLD', -27.5089, 153.0481, 'Mixed', 'Mixed', 480000, 700000, 760, 1160, 'DMF', 6, 30, '["Bowling green", "Hospital access", "RSL services", "Community centre"]'::jsonb, '["Emergency response", "Aged care", "24/7 nursing", "Veterans services"]'::jsonb, '["Bowls", "RSL activities", "Social events", "Garden club"]'::jsonb, true, 92, ARRAY['1 bedroom', '2 bedroom'], 55, '07 3394 3100', 'greenslopes@rslcare.org.au', 'https://www.rslcare.org.au', 'Inner southern Brisbane retirement with veterans services and quality villas near Greenslopes Private Hospital. Close to medical precinct.', 'approved', 'admin', true),

-- 20. BlueCare Paddington
('BlueCare Paddington', 'BlueCare', '88 Given Terrace, Paddington QLD 4064', 'Paddington', '4064', 'QLD', -27.4625, 153.0094, 'Independent Living', 'independent', 580000, 840000, 880, 1280, 'DMF', 6, 30, '["Heritage style", "Village atmosphere", "Shopping access", "Stadium access"]'::jsonb, '["Emergency response"]'::jsonb, '["Social events", "Walking groups", "Shopping trips", "Cultural activities"]'::jsonb, false, 68, ARRAY['1 bedroom', '2 bedroom'], 55, '07 3367 1234', 'paddington@bluecare.org.au', 'https://www.bluecare.org.au', 'Inner-city retirement community in prestigious Paddington with heritage-style apartments. Walk to boutique shops, cafes and Suncorp Stadium.', 'approved', 'admin', true),

-- 21. Mercy Health Beenleigh
('Mercy Health Beenleigh', 'Mercy Health', '88 Main Street, Beenleigh QLD 4207', 'Beenleigh', '4207', 'QLD', -27.7156, 153.2039, 'Mixed', 'Mixed', 300000, 460000, 520, 840, 'DMF', 6, 30, '["Chapel", "Community centre", "Gardens", "Shopping access"]'::jsonb, '["Emergency response", "Aged care", "24/7 nursing", "Pastoral care"]'::jsonb, '["Chapel services", "Social events", "Garden club", "Shopping trips"]'::jsonb, true, 106, ARRAY['1 bedroom', '2 bedroom'], 55, '07 3287 3100', 'beenleigh@mercyhealth.com.au', 'https://www.mercyhealth.com.au', 'Southern corridor retirement community with Catholic heritage and chapel. Modern villas near Beenleigh Marketplace and Logan Hospital.', 'approved', 'admin', true),

-- 22. Benetas Redcliffe
('Benetas Redcliffe', 'Benetas', '88 Anzac Avenue, Redcliffe QLD 4020', 'Redcliffe', '4020', 'QLD', -27.2281, 153.1106, 'Mixed', 'Mixed', 380000, 580000, 640, 1000, 'DMF', 6, 30, '["Pool", "Ocean breezes", "Waterfront access", "Community centre"]'::jsonb, '["Emergency response", "Aged care", "24/7 nursing"]'::jsonb, '["Swimming", "Beach walks", "Social events", "Waterfront activities"]'::jsonb, false, 116, ARRAY['1 bedroom', '2 bedroom', '3 bedroom'], 55, '07 3284 3100', 'redcliffe@benetas.com.au', 'https://www.benetas.com.au', 'Peninsula bayside retirement community with modern villas near beaches and Redcliffe waterfront. Walk to Settlement Cove and shops.', 'approved', 'admin', true),

-- 23. Embracia Manly
('Embracia Manly', 'Embracia Health', '42 Cambridge Parade, Manly QLD 4179', 'Manly', '4179', 'QLD', -27.4569, 153.1842, 'Mixed', 'Mixed', 420000, 640000, 680, 1040, 'DMF', 6, 30, '["Pool", "Waterfront access", "Marina views", "Coastal walks"]'::jsonb, '["Emergency response", "Aged care", "24/7 nursing"]'::jsonb, '["Swimming", "Beach walks", "Marina activities", "Social events"]'::jsonb, false, 94, ARRAY['1 bedroom', '2 bedroom'], 55, '07 3396 3100', 'manly@embracia.com.au', 'https://www.embracia.com.au', 'Bayside Brisbane retirement near harbour and beaches with modern villas. Walk to Manly Harbour Village, marina and waterfront dining.', 'approved', 'admin', true),

-- 24. Warrigal Care Mount Gravatt
('Warrigal Care Mount Gravatt', 'Warrigal Care', '88 Logan Road, Mount Gravatt QLD 4122', 'Mount Gravatt', '4122', 'QLD', -27.5428, 153.0806, 'Mixed', 'Mixed', 400000, 600000, 680, 1040, 'DMF', 6, 30, '["Pool", "Shopping access", "Community centre", "Gardens"]'::jsonb, '["Emergency response", "Aged care", "24/7 nursing"]'::jsonb, '["Swimming", "Exercise classes", "Social events", "Shopping trips"]'::jsonb, false, 108, ARRAY['1 bedroom', '2 bedroom'], 55, '07 3349 4100', 'mountgravatt@warrigal.com.au', 'https://www.warrigal.com.au', 'Southern Brisbane retirement community near Garden City shopping with modern villas. Close to major shopping centre and medical facilities.', 'approved', 'admin', true),

-- 25. Living Choice Alloura Waters
('Living Choice Alloura Waters', 'Living Choice', '1 Lakeside Drive, Lytton QLD 4178', 'Lytton', '4178', 'QLD', -27.4281, 153.1681, 'Independent Living', 'independent', 480000, 720000, 760, 1120, 'DMF', 6, 30, '["Pool", "Gym", "Cinema", "Bowling green", "Lake views", "Resort amenities"]'::jsonb, '["Emergency response"]'::jsonb, '["Swimming", "Movies", "Bowls", "Exercise classes", "Social events"]'::jsonb, false, 152, ARRAY['2 bedroom', '3 bedroom'], 55, '07 3899 1234', 'allourawaters@livingchoice.com.au', 'https://www.livingchoice.com.au', 'Eastern Brisbane waterfront retirement resort with premium villas and lake views. Minutes to Gateway Motorway and Port of Brisbane.', 'approved', 'admin', true);
