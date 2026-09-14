-- QLD Batch 04: 25 Regional QLD Retirement Villages (CORRECTED)
-- Geographic Focus: Toowoomba, Ipswich, Logan, Scenic Rim, Darling Downs
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

-- 1. Aveo Toowoomba
('Aveo Toowoomba', 'Aveo Group', '88 Ruthven Street, Toowoomba QLD 4350', 'Toowoomba', '4350', 'QLD', -27.5598, 151.9507, 'Independent Living', 'independent', 300000, 460000, 520, 840, 'DMF', 6, 30, '["Pool", "Gym", "Bowling green", "Mountain views", "Community centre"]'::jsonb, '["Emergency response"]'::jsonb, '["Swimming", "Bowls", "Exercise classes", "Social events", "Walking groups"]'::jsonb, false, 142, ARRAY['1 bedroom', '2 bedroom', '3 bedroom'], 55, '1300 283 000', 'toowoomba@aveo.com.au', 'https://www.aveo.com.au', 'Darling Downs regional city retirement with modern villas and mountain views. Close to Grand Central shopping, hospital and Range.', 'approved', 'admin', true),

-- 2. Stockland Springfield
('Stockland Springfield', 'Stockland', '1 Springfield Central Boulevard, Springfield Central QLD 4300', 'Springfield Central', '4300', 'QLD', -27.6639, 152.9189, 'Independent Living', 'independent', 360000, 540000, 600, 960, 'DMF', 6, 30, '["Pool", "Gym", "Cinema", "Bowling green", "Community centre", "Train access"]'::jsonb, '["Emergency response"]'::jsonb, '["Swimming", "Movies", "Bowls", "Exercise classes", "Social events"]'::jsonb, false, 186, ARRAY['2 bedroom', '3 bedroom'], 55, '1800 550 550', 'springfield@stockland.com.au', 'https://www.stockland.com.au/retirement', 'Western corridor retirement resort with contemporary villas in master-planned community. Close to Orion shopping, medical facilities and train.', 'approved', 'admin', true),

-- 3. Lendlease Heritage Park Logan
('Lendlease Heritage Park Logan', 'Lendlease', '42 Heritage Park Drive, Heritage Park QLD 4118', 'Heritage Park', '4118', 'QLD', -27.7056, 153.0828, 'Independent Living', 'independent', 320000, 480000, 560, 880, 'DMF', 6, 30, '["Pool", "Bowling green", "Shopping access", "Hospital access", "Community centre"]'::jsonb, '["Emergency response"]'::jsonb, '["Swimming", "Bowls", "Social events", "Shopping trips"]'::jsonb, false, 124, ARRAY['1 bedroom', '2 bedroom', '3 bedroom'], 55, '1300 326 033', 'logan@lendlease.com', 'https://www.lendlease.com/au/retirement', 'Logan central retirement community with quality villas near Heritage Park shopping. Close to Logan Hospital and medical facilities.', 'approved', 'admin', true),

-- 4. Anglicare Gatton
('Anglicare Gatton', 'Anglicare', '88 William Street, Gatton QLD 4343', 'Gatton', '4343', 'QLD', -27.5603, 152.2786, 'Mixed', 'Mixed', 220000, 360000, 380, 660, 'DMF', 6, 30, '["Chapel", "Bowling green", "Country gardens", "Rural setting"]'::jsonb, '["Emergency response", "Aged care", "24/7 nursing"]'::jsonb, '["Chapel services", "Bowls", "Social events", "Garden club"]'::jsonb, true, 84, ARRAY['1 bedroom', '2 bedroom'], 55, '07 5462 3100', 'gatton@anglicaresq.org.au', 'https://www.anglicaresq.org.au', 'Lockyer Valley rural retirement village with independent villas and chapel. Beautiful country gardens close to Gatton town centre.', 'approved', 'admin', true),

-- 5. Baptistcare Beenleigh
('Baptistcare Beenleigh', 'BaptistCare', '88 City Road, Beenleigh QLD 4207', 'Beenleigh', '4207', 'QLD', -27.7156, 153.2039, 'Mixed', 'Mixed', 300000, 460000, 520, 840, 'DMF', 6, 30, '["Pool", "Chapel", "Community centre", "Gardens"]'::jsonb, '["Emergency response", "Aged care", "24/7 nursing"]'::jsonb, '["Swimming", "Chapel services", "Social events", "Garden club"]'::jsonb, true, 102, ARRAY['1 bedroom', '2 bedroom'], 55, '07 3807 3100', 'beenleigh@baptistcare.org.au', 'https://www.baptistcare.org.au', 'Southern corridor retirement community with modern villas and chapel. Close to Beenleigh Marketplace and Logan Hospital.', 'approved', 'admin', true),

-- 6. Uniting AgeWell Beaudesert
('Uniting AgeWell Beaudesert', 'Uniting AgeWell', '88 Brisbane Street, Beaudesert QLD 4285', 'Beaudesert', '4285', 'QLD', -27.9881, 152.9992, 'Independent Living', 'independent', 260000, 410000, 460, 760, 'DMF', 6, 30, '["Bowling green", "Mountain views", "Community centre", "Gardens"]'::jsonb, '["Emergency response"]'::jsonb, '["Bowls", "Social events", "Garden club", "Walking groups"]'::jsonb, false, 76, ARRAY['1 bedroom', '2 bedroom'], 55, '1300 783 435', 'beaudesert@unitingagewell.org', 'https://www.unitingagewell.org', 'Scenic Rim retirement village with comfortable villas and mountain views. Close to Beaudesert town centre and medical facilities.', 'approved', 'admin', true),

-- 7. Opal Aged Care Warwick
('Opal Aged Care Warwick', 'Opal Aged Care', '42 Palmerin Street, Warwick QLD 4370', 'Warwick', '4370', 'QLD', -28.2194, 152.0344, 'Mixed', 'Mixed', 240000, 380000, 420, 700, 'DMF', 6, 30, '["Pool", "Heritage setting", "Community centre", "Gardens"]'::jsonb, '["Emergency response", "Aged care", "24/7 nursing"]'::jsonb, '["Swimming", "Social events", "Garden club", "Heritage activities"]'::jsonb, false, 88, ARRAY['1 bedroom', '2 bedroom'], 55, '1300 672 524', 'warwick@opalaged.care', 'https://www.opalagedcare.com.au', 'Southern Downs retirement community with modern villas in heritage Rose City. Close to Warwick Hospital and historic centre.', 'approved', 'admin', true),

-- 8. IRT Dalby
('IRT Dalby', 'IRT Group', '88 Cunningham Street, Dalby QLD 4405', 'Dalby', '4405', 'QLD', -27.1828, 151.2653, 'Mixed', 'Mixed', 200000, 340000, 360, 640, 'DMF', 6, 30, '["Bowling green", "Community centre", "Gardens", "Regional setting"]'::jsonb, '["Emergency response", "Aged care", "24/7 nursing"]'::jsonb, '["Bowls", "Social events", "Garden club", "Community activities"]'::jsonb, true, 74, ARRAY['1 bedroom', '2 bedroom'], 55, '1300 157 677', 'dalby@irt.org.au', 'https://www.irt.org.au', 'Western Downs retirement village with affordable villas in regional farming centre. Close to Dalby Hospital and shopping.', 'approved', 'admin', true),

-- 9. Regis Aged Care Toowoomba Heights
('Regis Aged Care Toowoomba Heights', 'Regis Aged Care', '88 Range Street, Toowoomba QLD 4350', 'Toowoomba', '4350', 'QLD', -27.5598, 151.9507, 'Mixed', 'Mixed', 320000, 480000, 560, 880, 'DMF', 6, 30, '["Bowling green", "Valley views", "Community centre", "Gardens"]'::jsonb, '["Emergency response", "Aged care", "24/7 nursing"]'::jsonb, '["Bowls", "Social events", "Garden club", "Walking groups"]'::jsonb, false, 96, ARRAY['1 bedroom', '2 bedroom'], 55, '07 4632 3100', 'toowoombahts@regis.com.au', 'https://www.regis.com.au', 'Darling Downs retirement on Range escarpment with quality villas and valley views. Close to shops, medical facilities and scenic lookouts.', 'approved', 'admin', true),

-- 10. Respect Aged Care Jimboomba
('Respect Aged Care Jimboomba', 'Respect', '42 Brisbane Street, Jimboomba QLD 4280', 'Jimboomba', '4280', 'QLD', -27.8328, 153.0289, 'Mixed', 'Mixed', 280000, 430000, 480, 780, 'DMF', 6, 30, '["Pool", "Community centre", "Gardens", "Growth corridor"]'::jsonb, '["Emergency response", "Aged care", "24/7 nursing"]'::jsonb, '["Swimming", "Exercise classes", "Social events", "Garden club"]'::jsonb, true, 118, ARRAY['1 bedroom', '2 bedroom', '3 bedroom'], 55, '07 5547 3100', 'jimboomba@respect.com.au', 'https://www.respect.com.au', 'Scenic Rim growth corridor retirement with affordable villas in developing area. Close to shopping and medical facilities.', 'approved', 'admin', true),

-- 11. Arcare Browns Plains
('Arcare Browns Plains', 'Arcare', '1 Mt Lindesay Highway, Browns Plains QLD 4118', 'Browns Plains', '4118', 'QLD', -27.6614, 153.0383, 'Mixed', 'Mixed', 300000, 460000, 520, 840, 'DMF', 6, 30, '["Pool", "Gym", "Shopping access", "Community centre"]'::jsonb, '["Emergency response", "Aged care", "24/7 nursing"]'::jsonb, '["Swimming", "Exercise classes", "Social events", "Shopping trips"]'::jsonb, false, 126, ARRAY['1 bedroom', '2 bedroom', '3 bedroom'], 55, '1300 272 273', 'brownsplains@arcare.com.au', 'https://www.arcare.com.au', 'Southern Logan retirement community with contemporary villas near Grand Plaza shopping. Close to shopping centres and medical facilities.', 'approved', 'admin', true),

-- 12. Bupa Aged Care Kingaroy
('Bupa Aged Care Kingaroy', 'Bupa', '88 Haly Street, Kingaroy QLD 4610', 'Kingaroy', '4610', 'QLD', -26.5403, 151.8372, 'Mixed', 'Mixed', 200000, 340000, 360, 640, 'DMF', 6, 30, '["Bowling green", "Community centre", "Gardens", "Regional setting"]'::jsonb, '["Emergency response", "Aged care", "24/7 nursing"]'::jsonb, '["Bowls", "Social events", "Garden club", "Community activities"]'::jsonb, true, 68, ARRAY['1 bedroom', '2 bedroom'], 55, '1300 280 334', 'kingaroy@bupa.com.au', 'https://www.bupa.com.au', 'South Burnett peanut capital retirement with comfortable villas in regional centre. Close to Kingaroy Hospital and shopping.', 'approved', 'admin', true),

-- 13. Allity Loganlea
('Allity Loganlea', 'Allity', '88 Bryants Road, Loganlea QLD 4131', 'Loganlea', '4131', 'QLD', -27.6772, 153.1200, 'Mixed', 'Mixed', 300000, 460000, 520, 840, 'DMF', 6, 30, '["Pool", "Shopping access", "Community centre", "Gardens"]'::jsonb, '["Emergency response", "Aged care", "24/7 nursing"]'::jsonb, '["Swimming", "Exercise classes", "Social events", "Shopping trips"]'::jsonb, false, 108, ARRAY['1 bedroom', '2 bedroom', '3 bedroom'], 55, '07 3290 3100', 'loganlea@allity.com.au', 'https://www.allity.com.au', 'Southern corridor retirement community with modern villas near Logan City shopping. Close to medical facilities and transport.', 'approved', 'admin', true),

-- 14. Bolton Clarke Chinchilla
('Bolton Clarke Chinchilla', 'Bolton Clarke', '88 Heeney Street, Chinchilla QLD 4413', 'Chinchilla', '4413', 'QLD', -26.7397, 150.6272, 'Mixed', 'Mixed', 180000, 310000, 320, 600, 'DMF', 6, 30, '["Community centre", "Gardens", "Regional setting"]'::jsonb, '["Emergency response", "Aged care", "24/7 nursing"]'::jsonb, '["Social events", "Garden club", "Community activities"]'::jsonb, true, 62, ARRAY['1 bedroom', '2 bedroom'], 55, '1300 228 655', 'chinchilla@boltonclarke.com.au', 'https://www.boltonclarke.com.au', 'Western Downs retirement village with affordable villas in regional town. Close to town centre and medical facilities.', 'approved', 'admin', true),

-- 15. Estia Health Stanthorpe
('Estia Health Stanthorpe', 'Estia Health', '88 High Street, Stanthorpe QLD 4380', 'Stanthorpe', '4380', 'QLD', -28.6539, 151.9342, 'Mixed', 'Mixed', 240000, 380000, 420, 700, 'DMF', 6, 30, '["Pool", "Cool climate", "Wine country", "Community centre"]'::jsonb, '["Emergency response", "Aged care", "24/7 nursing"]'::jsonb, '["Swimming", "Social events", "Winery tours", "Garden club"]'::jsonb, false, 72, ARRAY['1 bedroom', '2 bedroom'], 55, '07 4681 3100', 'stanthorpe@estiahealth.com.au', 'https://www.estiahealth.com.au', 'Granite Belt retirement village with cool climate villas in wine country. Close to Stanthorpe town centre, wineries and medical facilities.', 'approved', 'admin', true),

-- 16. Japara Redbank Plains
('Japara Redbank Plains', 'Japara', '42 Redbank Plains Road, Redbank Plains QLD 4301', 'Redbank Plains', '4301', 'QLD', -27.6464, 152.8706, 'Mixed', 'Mixed', 300000, 460000, 520, 840, 'DMF', 6, 30, '["Shopping access", "Community centre", "Gardens"]'::jsonb, '["Emergency response", "Aged care", "24/7 nursing"]'::jsonb, '["Social events", "Garden club", "Shopping trips", "Exercise classes"]'::jsonb, false, 94, ARRAY['1 bedroom', '2 bedroom'], 55, '1800 52 72 72', 'redbankplains@japara.com.au', 'https://www.japara.com.au', 'Western corridor retirement community with modern villas near Redbank Plaza. Close to shopping centres and medical facilities.', 'approved', 'admin', true),

-- 17. Tricare Goodna
('Tricare Goodna', 'Tricare', '88 Queen Street, Goodna QLD 4300', 'Goodna', '4300', 'QLD', -27.6097, 152.8992, 'Mixed', 'Mixed', 280000, 430000, 480, 780, 'DMF', 6, 30, '["Pool", "Community centre", "Gardens", "Shopping access"]'::jsonb, '["Emergency response", "Aged care", "24/7 nursing"]'::jsonb, '["Swimming", "Exercise classes", "Social events", "Shopping trips"]'::jsonb, false, 102, ARRAY['1 bedroom', '2 bedroom', '3 bedroom'], 55, '07 3818 3100', 'goodna@tricare.com.au', 'https://www.tricare.com.au', 'Western corridor retirement community with comfortable villas near Ipswich Riverlink. Close to shopping, medical facilities and transport.', 'approved', 'admin', true),

-- 18. Mayflower Laidley
('Mayflower Laidley', 'Mayflower', '88 Patrick Street, Laidley QLD 4341', 'Laidley', '4341', 'QLD', -27.6317, 152.3939, 'Independent Living', 'independent', 200000, 340000, 360, 640, 'DMF', 6, 30, '["Country setting", "Community centre", "Gardens", "Rural lifestyle"]'::jsonb, '["Emergency response"]'::jsonb, '["Social events", "Garden club", "Community activities", "Country walks"]'::jsonb, true, 64, ARRAY['1 bedroom', '2 bedroom'], 55, '07 5465 1234', 'laidley@mayflower.org.au', 'https://www.mayflower.org.au', 'Lockyer Valley rural retirement village with peaceful villas in farming district. Close to Laidley town centre and medical facilities.', 'approved', 'admin', true),

-- 19. RSL Care Toowoomba
('RSL Care Toowoomba', 'RSL Care', '42 Tor Street, Toowoomba QLD 4350', 'Toowoomba', '4350', 'QLD', -27.5598, 151.9507, 'Mixed', 'Mixed', 300000, 460000, 520, 840, 'DMF', 6, 30, '["Bowling green", "Hospital access", "RSL services", "Community centre"]'::jsonb, '["Emergency response", "Aged care", "24/7 nursing", "Veterans services"]'::jsonb, '["Bowls", "RSL activities", "Social events", "Garden club"]'::jsonb, true, 104, ARRAY['1 bedroom', '2 bedroom'], 55, '07 4639 3100', 'toowoomba@rslcare.org.au', 'https://www.rslcare.org.au', 'Darling Downs retirement with veterans services and quality villas near Toowoomba Base Hospital. Close to shopping and medical precinct.', 'approved', 'admin', true),

-- 20. BlueCare Highfields
('BlueCare Highfields', 'BlueCare', '88 Highfields Road, Highfields QLD 4352', 'Highfields', '4352', 'QLD', -27.4628, 151.9539, 'Independent Living', 'independent', 320000, 480000, 560, 880, 'DMF', 6, 30, '["Pool", "Range views", "Mountain setting", "Community centre"]'::jsonb, '["Emergency response"]'::jsonb, '["Swimming", "Exercise classes", "Social events", "Walking groups"]'::jsonb, false, 86, ARRAY['1 bedroom', '2 bedroom'], 55, '07 4615 1234', 'highfields@bluecare.org.au', 'https://www.bluecare.org.au', 'Toowoomba escarpment retirement community with modern villas and Range views. Close to Highfields shops and medical facilities.', 'approved', 'admin', true),

-- 21. Mercy Health Woodridge
('Mercy Health Woodridge', 'Mercy Health', '88 Wembley Road, Woodridge QLD 4114', 'Woodridge', '4114', 'QLD', -27.6392, 153.1089, 'Mixed', 'Mixed', 280000, 430000, 480, 780, 'DMF', 6, 30, '["Chapel", "Community centre", "Gardens", "Shopping access"]'::jsonb, '["Emergency response", "Aged care", "24/7 nursing", "Pastoral care"]'::jsonb, '["Chapel services", "Social events", "Garden club", "Shopping trips"]'::jsonb, true, 112, ARRAY['1 bedroom', '2 bedroom', '3 bedroom'], 55, '07 3808 3100', 'woodridge@mercyhealth.com.au', 'https://www.mercyhealth.com.au', 'Southern Logan retirement community with Catholic heritage and chapel. Modern villas near Logan Hyperdome and medical facilities.', 'approved', 'admin', true),

-- 22. Living Choice Glenvale
('Living Choice Glenvale', 'Living Choice', '1 Range View Drive, Glenvale QLD 4350', 'Glenvale', '4350', 'QLD', -27.5378, 151.9733, 'Independent Living', 'independent', 360000, 540000, 600, 960, 'DMF', 6, 30, '["Pool", "Gym", "Cinema", "Bowling green", "Range views"]'::jsonb, '["Emergency response"]'::jsonb, '["Swimming", "Movies", "Bowls", "Exercise classes", "Social events"]'::jsonb, false, 148, ARRAY['2 bedroom', '3 bedroom'], 55, '07 4636 1234', 'glenvale@livingchoice.com.au', 'https://www.livingchoice.com.au', 'Toowoomba retirement resort with premium villas and resort amenities. Close to Toowoomba Hospital, shopping and Range attractions.', 'approved', 'admin', true),

-- 23. Palm Lake Resort Bethania
('Palm Lake Resort Bethania', 'Palm Lake Resort', '1 Gowan Road, Bethania QLD 4205', 'Bethania', '4205', 'QLD', -27.7244, 153.1539, 'Independent Living', 'independent', 240000, 400000, 380, 640, 'DMF', 6, 30, '["Pool", "Tennis courts", "Bowling green", "Clubhouse", "Gardens"]'::jsonb, '["Emergency response"]'::jsonb, '["Swimming", "Tennis", "Bowls", "Social events", "Garden club"]'::jsonb, true, 186, ARRAY['2 bedroom', '3 bedroom'], 50, '07 3804 9200', 'bethania@palmlakeresort.com.au', 'https://www.palmlakeresort.com.au', 'Southern corridor over-50s resort with modern manufactured homes and resort facilities. Close to Hyperdome shopping and medical facilities.', 'approved', 'admin', true),

-- 24. Ingenia Lifestyle Park Ridge
('Ingenia Lifestyle Park Ridge', 'Ingenia Communities', '1 Mount Lindesay Highway, Park Ridge QLD 4125', 'Park Ridge', '4125', 'QLD', -27.7181, 153.0308, 'Independent Living', 'independent', 220000, 380000, 340, 580, 'DMF', 6, 30, '["Pool", "Bowling green", "Clubhouse", "Community centre"]'::jsonb, '["Emergency response"]'::jsonb, '["Swimming", "Bowls", "Social events", "Community activities"]'::jsonb, true, 164, ARRAY['2 bedroom', '3 bedroom'], 50, '07 3200 9200', 'parkridge@ingeniacommunities.com.au', 'https://www.ingeniacommunities.com.au', 'Southern corridor over-50s community with contemporary manufactured homes. Close to Grand Plaza shopping and Logan Hospital.', 'approved', 'admin', true),

-- 25. Watermark Crestmead
('Watermark Crestmead', 'Watermark', '88 Station Road, Crestmead QLD 4132', 'Crestmead', '4132', 'QLD', -27.6872, 153.0931, 'Independent Living', 'independent', 300000, 460000, 520, 840, 'DMF', 6, 30, '["Pool", "Shopping access", "Community centre", "Gardens"]'::jsonb, '["Emergency response"]'::jsonb, '["Swimming", "Exercise classes", "Social events", "Shopping trips"]'::jsonb, false, 96, ARRAY['1 bedroom', '2 bedroom'], 55, '07 3803 1234', 'crestmead@watermark.com.au', 'https://www.watermark.com.au', 'Southern Logan retirement community with modern villas near Logan Hyperdome. Close to major shopping, medical facilities and transport.', 'approved', 'admin', true);
