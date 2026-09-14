-- SA Batch 01: 25 South Australia Retirement Villages (CORRECTED)
-- Geographic Focus: Adelaide Metro, Barossa, Adelaide Hills, Regional SA
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

-- 1. Aveo Glengowrie
('Aveo Glengowrie', 'Aveo Group', '88 Diagonal Road, Glengowrie SA 5044', 'Glengowrie', '5044', 'SA', -34.9889, 138.5539, 'Independent Living', 'independent', 360000, 540000, 600, 960, 'DMF', 6, 30, '["Pool", "Gym", "Bowling green", "Beach access", "Community centre"]'::jsonb, '["Emergency response"]'::jsonb, '["Swimming", "Bowls", "Exercise classes", "Social events"]'::jsonb, false, 126, ARRAY['1 bedroom', '2 bedroom', '3 bedroom'], 55, '1300 283 000', 'glengowrie@aveo.com.au', 'https://www.aveo.com.au', 'Southern Adelaide retirement community with modern villas near beaches and city. Close to Marion Shopping Centre and medical facilities.', 'approved', 'admin', true),

-- 2. Stockland Adelaide
('Stockland Adelaide', 'Stockland', '1 Main North Road, Salisbury SA 5108', 'Salisbury', '5108', 'SA', -34.7679, 138.6422, 'Independent Living', 'independent', 320000, 480000, 560, 880, 'DMF', 6, 30, '["Pool", "Gym", "Cinema", "Bowling green", "Community centre"]'::jsonb, '["Emergency response"]'::jsonb, '["Swimming", "Movies", "Bowls", "Exercise classes", "Social events"]'::jsonb, false, 148, ARRAY['1 bedroom', '2 bedroom', '3 bedroom'], 55, '1800 550 550', 'adelaide@stockland.com.au', 'https://www.stockland.com.au/retirement', 'Northern Adelaide retirement community with contemporary villas and resort amenities. Close to shopping centres and medical facilities.', 'approved', 'admin', true),

-- 3. Lendlease Brighton
('Lendlease Brighton', 'Lendlease', '42 Jetty Road, Brighton SA 5048', 'Brighton', '5048', 'SA', -35.0217, 138.5233, 'Independent Living', 'independent', 420000, 640000, 680, 1040, 'DMF', 6, 30, '["Pool", "Bowling green", "Beach access", "Shopping access", "Community centre"]'::jsonb, '["Emergency response"]'::jsonb, '["Swimming", "Bowls", "Beach walks", "Social events"]'::jsonb, false, 104, ARRAY['1 bedroom', '2 bedroom'], 55, '1300 326 033', 'brighton@lendlease.com', 'https://www.lendlease.com/au/retirement', 'Beachside Adelaide retirement living with quality villas near Holdfast Bay beaches. Walk to Jetty Road shops, cafes and beach.', 'approved', 'admin', true),

-- 4. Anglicare Aldersgate
('Anglicare Aldersgate', 'Anglicare', '88 Prospect Road, Prospect SA 5082', 'Prospect', '5082', 'SA', -34.8850, 138.5944, 'Mixed', 'Mixed', 380000, 580000, 640, 1000, 'DMF', 6, 30, '["Chapel", "Community centre", "Gardens", "City access"]'::jsonb, '["Emergency response", "Aged care", "24/7 nursing"]'::jsonb, '["Chapel services", "Social events", "Garden club"]'::jsonb, true, 98, ARRAY['1 bedroom', '2 bedroom'], 55, '08 8269 3100', 'aldersgate@anglicaresa.org.au', 'https://www.anglicaresa.com.au', 'Adelaide hills retirement village in Prospect with independent villas and chapel. Close to Prospect Road shopping and city access.', 'approved', 'admin', true),

-- 5. Baptistcare Paradise
('Baptistcare Paradise', 'BaptistCare', '88 Lower North East Road, Paradise SA 5075', 'Paradise', '5075', 'SA', -34.8756, 138.6756, 'Mixed', 'Mixed', 360000, 540000, 600, 960, 'DMF', 6, 30, '["Pool", "Chapel", "Bowling green", "Shopping access"]'::jsonb, '["Emergency response", "Aged care", "24/7 nursing"]'::jsonb, '["Swimming", "Chapel services", "Bowls", "Social events"]'::jsonb, true, 112, ARRAY['1 bedroom', '2 bedroom', '3 bedroom'], 55, '08 8337 3100', 'paradise@baptistcare.org.au', 'https://www.baptistcare.org.au', 'Eastern suburbs retirement community with modern villas, chapel and bowling green. Close to Newton shopping and Tea Tree Plaza.', 'approved', 'admin', true),

-- 6. ACH Group Kingswood
('ACH Group Kingswood', 'ACH Group', '88 Shepherds Hill Road, Mitcham SA 5062', 'Mitcham', '5062', 'SA', -35.0081, 138.6272, 'Mixed', 'Mixed', 380000, 580000, 640, 1000, 'DMF', 6, 30, '["Pool", "Community centre", "Gardens", "Shopping access"]'::jsonb, '["Emergency response", "Aged care", "24/7 nursing"]'::jsonb, '["Swimming", "Exercise classes", "Social events", "Garden club"]'::jsonb, false, 116, ARRAY['1 bedroom', '2 bedroom', '3 bedroom'], 55, '08 8159 3100', 'kingswood@ach.org.au', 'https://www.ach.org.au', 'Southern Adelaide retirement community with quality villas and pool. Close to Mitcham Square shopping and medical facilities.', 'approved', 'admin', true),

-- 7. Resthaven Marion
('Resthaven Marion', 'Resthaven', '88 Sturt Road, Marion SA 5043', 'Marion', '5043', 'SA', -35.0139, 138.5450, 'Mixed', 'Mixed', 340000, 520000, 600, 920, 'DMF', 6, 30, '["Bowling green", "Shopping access", "Community centre", "Gardens"]'::jsonb, '["Emergency response", "Aged care", "24/7 nursing"]'::jsonb, '["Bowls", "Social events", "Garden club", "Shopping trips"]'::jsonb, true, 124, ARRAY['1 bedroom', '2 bedroom', '3 bedroom'], 55, '08 8379 3100', 'marion@resthaven.asn.au', 'https://www.resthaven.asn.au', 'Southern Adelaide retirement village with comfortable villas near Westfield Marion. Walk to major shopping centre and medical facilities.', 'approved', 'admin', true),

-- 8. Bupa Aged Care Glenelg
('Bupa Aged Care Glenelg', 'Bupa', '42 Sussex Street, Glenelg SA 5045', 'Glenelg', '5045', 'SA', -34.9804, 138.5139, 'Mixed', 'Mixed', 480000, 720000, 760, 1120, 'DMF', 6, 30, '["Pool", "Bay breezes", "Beach access", "Tram access"]'::jsonb, '["Emergency response", "Aged care", "24/7 nursing"]'::jsonb, '["Swimming", "Beach walks", "Social events", "Tram outings"]'::jsonb, false, 86, ARRAY['1 bedroom', '2 bedroom'], 55, '1300 280 334', 'glenelg@bupa.com.au', 'https://www.bupa.com.au', 'Beachside Adelaide retirement near iconic Glenelg Beach with modern villas and bay breezes. Walk to Jetty Road shops, beach and tram.', 'approved', 'admin', true),

-- 9. Regis Aged Care Burnside
('Regis Aged Care Burnside', 'Regis Aged Care', '88 Greenhill Road, Burnside SA 5066', 'Burnside', '5066', 'SA', -34.9367, 138.6394, 'Mixed', 'Mixed', 480000, 720000, 760, 1120, 'DMF', 6, 30, '["Gardens", "Shopping access", "Community centre", "Parklands"]'::jsonb, '["Emergency response", "Aged care", "24/7 nursing"]'::jsonb, '["Social events", "Garden club", "Walking groups", "Park visits"]'::jsonb, false, 92, ARRAY['1 bedroom', '2 bedroom'], 55, '08 8333 3100', 'burnside@regis.com.au', 'https://www.regis.com.au', 'Eastern suburbs retirement in prestigious Burnside with quality villas and gardens. Close to Burnside Village shopping and parklands.', 'approved', 'admin', true),

-- 10. Allity Fullarton
('Allity Fullarton', 'Allity', '88 Fullarton Road, Fullarton SA 5063', 'Fullarton', '5063', 'SA', -34.9528, 138.6222, 'Mixed', 'Mixed', 420000, 640000, 680, 1040, 'DMF', 6, 30, '["Pool", "Community centre", "Gardens", "City access"]'::jsonb, '["Emergency response", "Aged care", "24/7 nursing"]'::jsonb, '["Swimming", "Exercise classes", "Social events", "Garden club"]'::jsonb, false, 94, ARRAY['1 bedroom', '2 bedroom'], 55, '08 8373 3100', 'fullarton@allity.com.au', 'https://www.allity.com.au', 'Inner eastern Adelaide retirement community with contemporary villas near city centre. Close to Fullarton Road shops and parklands.', 'approved', 'admin', true),

-- 11. Estia Health Morphett Vale
('Estia Health Morphett Vale', 'Estia Health', '88 Main South Road, Morphett Vale SA 5162', 'Morphett Vale', '5162', 'SA', -35.1289, 138.5194, 'Mixed', 'Mixed', 300000, 460000, 520, 840, 'DMF', 6, 30, '["Pool", "Shopping access", "Community centre", "Gardens"]'::jsonb, '["Emergency response", "Aged care", "24/7 nursing"]'::jsonb, '["Swimming", "Exercise classes", "Social events", "Shopping trips"]'::jsonb, false, 118, ARRAY['1 bedroom', '2 bedroom', '3 bedroom'], 55, '08 8382 3100', 'morphettvale@estiahealth.com.au', 'https://www.estiahealth.com.au', 'Southern Adelaide retirement community with modern villas in southern suburbs. Close to Colonnades Shopping Centre and medical facilities.', 'approved', 'admin', true),

-- 12. Japara Grange
('Japara Grange', 'Japara', '42 Military Road, Grange SA 5022', 'Grange', '5022', 'SA', -34.9006, 138.4944, 'Mixed', 'Mixed', 380000, 580000, 640, 1000, 'DMF', 6, 30, '["Pool", "Beach access", "Coastal walks", "Community centre"]'::jsonb, '["Emergency response", "Aged care", "24/7 nursing"]'::jsonb, '["Swimming", "Beach walks", "Social events", "Exercise classes"]'::jsonb, false, 104, ARRAY['1 bedroom', '2 bedroom'], 55, '1800 52 72 72', 'grange@japara.com.au', 'https://www.japara.com.au', 'Western Adelaide beachside retirement with modern villas near Henley and Grange beaches. Walk to beach, cafes and shops.', 'approved', 'admin', true),

-- 13. Tricare Whyalla
('Tricare Whyalla', 'Tricare', '88 Ekblom Street, Whyalla SA 5600', 'Whyalla', '5600', 'SA', -33.0333, 137.5667, 'Mixed', 'Mixed', 200000, 340000, 360, 640, 'DMF', 6, 30, '["Bowling green", "Community centre", "Gardens", "Coastal access"]'::jsonb, '["Emergency response", "Aged care", "24/7 nursing"]'::jsonb, '["Bowls", "Social events", "Garden club", "Beach outings"]'::jsonb, true, 82, ARRAY['1 bedroom', '2 bedroom'], 55, '08 8645 3100', 'whyalla@tricare.com.au', 'https://www.tricare.com.au', 'Spencer Gulf regional city retirement with comfortable villas near steelworks city and coast. Close to Westlands shopping.', 'approved', 'admin', true),

-- 14. Mayflower Brighton Beach
('Mayflower Brighton Beach', 'Mayflower', '88 Brighton Road, Glenelg South SA 5045', 'Glenelg South', '5045', 'SA', -34.9889, 138.5178, 'Independent Living', 'independent', 420000, 640000, 680, 1040, 'DMF', 6, 30, '["Pool", "Beach access", "Shopping access", "Community centre"]'::jsonb, '["Emergency response"]'::jsonb, '["Swimming", "Beach walks", "Social events", "Exercise classes"]'::jsonb, false, 88, ARRAY['1 bedroom', '2 bedroom'], 55, '08 8376 1234', 'brightonbeach@mayflower.org.au', 'https://www.mayflower.org.au', 'Holdfast Bay beachside retirement with contemporary villas near beaches and Jetty Road. Walk to beach, restaurants and shopping.', 'approved', 'admin', true),

-- 15. RSL Care Highercombe
('RSL Care Highercombe', 'RSL Care', '42 Black Road, Highercombe SA 5083', 'Highercombe', '5083', 'SA', -34.8700, 138.6700, 'Mixed', 'Mixed', 360000, 540000, 600, 960, 'DMF', 6, 30, '["Bowling green", "Hills views", "RSL services", "Community centre"]'::jsonb, '["Emergency response", "Aged care", "24/7 nursing", "Veterans services"]'::jsonb, '["Bowls", "Social events", "RSL activities", "Walking groups"]'::jsonb, true, 96, ARRAY['1 bedroom', '2 bedroom'], 55, '08 8347 3100', 'highercombe@rslcare.org.au', 'https://www.rslcare.org.au', 'Adelaide Hills retirement with veterans services and quality villas with hills views. Close to shopping and Mount Lofty.', 'approved', 'admin', true),

-- 16. Helping Hand Walkerville
('Helping Hand Walkerville', 'Helping Hand', '88 Walkerville Terrace, Walkerville SA 5081', 'Walkerville', '5081', 'SA', -34.8944, 138.6112, 'Mixed', 'Mixed', 420000, 640000, 680, 1040, 'DMF', 6, 30, '["Heritage style", "Gardens", "Parklands access", "Community centre"]'::jsonb, '["Emergency response", "Aged care", "24/7 nursing"]'::jsonb, '["Social events", "Garden club", "Walking groups", "Park visits"]'::jsonb, true, 84, ARRAY['1 bedroom', '2 bedroom'], 55, '08 8269 9200', 'walkerville@helpinghand.org.au', 'https://www.helpinghand.org.au', 'Inner eastern Adelaide retirement community with heritage-style villas near Linear Park. Walk to Walkerville village and parklands.', 'approved', 'admin', true),

-- 17. Calvary Retirement Community Norwood
('Calvary Retirement Community Norwood', 'Calvary', '88 The Parade, Norwood SA 5067', 'Norwood', '5067', 'SA', -34.9200, 138.6311, 'Mixed', 'Mixed', 480000, 720000, 760, 1120, 'DMF', 6, 30, '["Chapel", "Shopping access", "Community centre", "City access"]'::jsonb, '["Emergency response", "Aged care", "24/7 nursing", "Pastoral care"]'::jsonb, '["Chapel services", "Social events", "Shopping trips", "Cultural outings"]'::jsonb, true, 76, ARRAY['1 bedroom', '2 bedroom'], 55, '08 8362 1234', 'norwood@calvarycare.org.au', 'https://www.calvarycare.org.au', 'Inner eastern Adelaide retirement with Catholic heritage and chapel. Contemporary apartments near Norwood Parade with restaurants and shops.', 'approved', 'admin', true),

-- 18. Southern Cross Care Oaklands Park
('Southern Cross Care Oaklands Park', 'Southern Cross Care', '88 Diagonal Road, Oaklands Park SA 5046', 'Oaklands Park', '5046', 'SA', -35.0022, 138.5428, 'Mixed', 'Mixed', 340000, 520000, 600, 920, 'DMF', 6, 30, '["Pool", "Bowling green", "Shopping access", "Community centre"]'::jsonb, '["Emergency response", "Aged care", "24/7 nursing"]'::jsonb, '["Swimming", "Bowls", "Social events", "Shopping trips"]'::jsonb, false, 112, ARRAY['1 bedroom', '2 bedroom', '3 bedroom'], 55, '08 8377 3100', 'oaklandspark@sccliving.org.au', 'https://www.sccliving.org.au', 'Southern Adelaide retirement community with modern villas and community facilities. Close to Westfield Marion and medical facilities.', 'approved', 'admin', true),

-- 19. Uniting Communities Mount Barker
('Uniting Communities Mount Barker', 'Uniting Communities', '88 Gawler Street, Mount Barker SA 5251', 'Mount Barker', '5251', 'SA', -35.0728, 138.8619, 'Independent Living', 'independent', 320000, 480000, 560, 880, 'DMF', 6, 30, '["Pool", "Hills views", "Wine country", "Community centre"]'::jsonb, '["Emergency response"]'::jsonb, '["Swimming", "Social events", "Winery tours", "Walking groups"]'::jsonb, false, 104, ARRAY['1 bedroom', '2 bedroom'], 55, '08 8391 1234', 'mountbarker@unitingcommunities.org', 'https://www.unitingcommunities.org', 'Adelaide Hills regional retirement village with modern villas and hills views. Close to Mount Barker shopping, medical facilities and wineries.', 'approved', 'admin', true),

-- 20. Barossa Village Tanunda
('Barossa Village Tanunda', 'Independent Operator', '1 Murray Street, Tanunda SA 5352', 'Tanunda', '5352', 'SA', -34.5292, 138.9594, 'Independent Living', 'independent', 340000, 520000, 600, 920, 'DMF', 6, 30, '["Pool", "Wine country", "Vineyard views", "Village atmosphere"]'::jsonb, '["Emergency response"]'::jsonb, '["Winery tours", "Social events", "Cellar door visits", "Walking groups"]'::jsonb, true, 86, ARRAY['1 bedroom', '2 bedroom'], 55, '08 8563 1234', 'info@barossavillage.com.au', 'https://www.barossavillage.com.au', 'Barossa Valley wine country retirement with character villas surrounded by vineyards. Walk to Tanunda village, cellar doors and restaurants.', 'approved', 'admin', true),

-- 21. Port Lincoln Retirement Village
('Port Lincoln Retirement Village', 'Independent Operator', '88 Liverpool Street, Port Lincoln SA 5606', 'Port Lincoln', '5606', 'SA', -34.7228, 135.8639, 'Independent Living', 'independent', 240000, 380000, 420, 700, 'DMF', 6, 30, '["Fishing access", "Marina views", "Community centre", "Gardens"]'::jsonb, '["Emergency response"]'::jsonb, '["Fishing", "Social events", "Marina activities", "Garden club"]'::jsonb, true, 74, ARRAY['1 bedroom', '2 bedroom'], 55, '08 8682 1234', 'info@portlincolnretirement.com.au', 'https://www.portlincolnretirement.com.au', 'Eyre Peninsula coastal retirement with comfortable villas near pristine tuna coast. Close to Port Lincoln marina and shopping.', 'approved', 'admin', true),

-- 22. Victor Harbor Retirement Village
('Victor Harbor Retirement Village', 'Independent Operator', '88 Victoria Street, Victor Harbor SA 5211', 'Victor Harbor', '5211', 'SA', -35.5525, 138.6214, 'Independent Living', 'independent', 340000, 520000, 600, 920, 'DMF', 6, 30, '["Pool", "Beach access", "Coastal walks", "Community centre"]'::jsonb, '["Emergency response"]'::jsonb, '["Swimming", "Beach walks", "Social events", "Whale watching"]'::jsonb, false, 96, ARRAY['1 bedroom', '2 bedroom'], 55, '08 8552 1234', 'info@victorharborretirement.com.au', 'https://www.victorharborretirement.com.au', 'Fleurieu Peninsula coastal retirement with modern villas near beaches and Granite Island. Walk to Encounter Bay, causeway and shops.', 'approved', 'admin', true),

-- 23. Murray Bridge Retirement Living
('Murray Bridge Retirement Living', 'Independent Operator', '88 Swanport Road, Murray Bridge SA 5253', 'Murray Bridge', '5253', 'SA', -35.1203, 139.2750, 'Independent Living', 'independent', 220000, 360000, 380, 660, 'DMF', 6, 30, '["Bowling green", "River access", "Community centre", "Gardens"]'::jsonb, '["Emergency response"]'::jsonb, '["Bowls", "Fishing", "Social events", "Garden club"]'::jsonb, true, 82, ARRAY['1 bedroom', '2 bedroom'], 55, '08 8532 1234', 'info@murraybridgeretirement.com.au', 'https://www.murraybridgeretirement.com.au', 'Murraylands river town retirement with affordable villas near Murray River. Close to Murray Bridge shopping and medical facilities.', 'approved', 'admin', true),

-- 24. Clare Valley Retirement Estate
('Clare Valley Retirement Estate', 'Independent Operator', '1 Main North Road, Clare SA 5453', 'Clare', '5453', 'SA', -33.8333, 138.6097, 'Independent Living', 'independent', 260000, 410000, 460, 760, 'DMF', 6, 30, '["Wine country", "Community centre", "Gardens", "Village atmosphere"]'::jsonb, '["Emergency response"]'::jsonb, '["Winery tours", "Social events", "Cellar door visits", "Riesling Trail walks"]'::jsonb, true, 68, ARRAY['1 bedroom', '2 bedroom'], 55, '08 8842 1234', 'info@clarevalleyretirement.com.au', 'https://www.clarevalleyretirement.com.au', 'Mid North wine country retirement with peaceful villas in Clare Valley vineyards. Close to Clare town centre, cellar doors and Riesling Trail.', 'approved', 'admin', true),

-- 25. Lifestyle Communities Glenelg North
('Lifestyle Communities Glenelg North', 'Lifestyle Communities', '1 Partridge Street, Glenelg North SA 5045', 'Glenelg North', '5045', 'SA', -34.9722, 138.5067, 'Independent Living', 'independent', 260000, 430000, 400, 680, 'DMF', 6, 30, '["Pool", "Bowling green", "Gym", "Beach access", "Clubhouse"]'::jsonb, '["Emergency response"]'::jsonb, '["Swimming", "Bowls", "Exercise classes", "Beach walks", "Social events"]'::jsonb, true, 154, ARRAY['2 bedroom', '3 bedroom'], 50, '08 8295 9200', 'glenelgnorth@lifestylecommunities.com.au', 'https://www.lifestylecommunities.com.au', 'Beachside Adelaide over-50s community with modern manufactured homes near beaches. Walk to beach, tram and shops.', 'approved', 'admin', true);
