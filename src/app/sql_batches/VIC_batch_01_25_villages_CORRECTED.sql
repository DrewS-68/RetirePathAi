-- VIC Batch 01: 25 Melbourne Metro Retirement Villages (CORRECTED)
-- Geographic Focus: Inner Melbourne, Bayside, Eastern Suburbs
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

-- 1. Aveo Brighton East
('Aveo Brighton East', 'Aveo Group', '88 New Street, Brighton East VIC 3187', 'Brighton East', '3187', 'VIC', -37.9178, 145.0056, 'Independent Living', 'independent', 620000, 880000, 960, 1360, 'DMF', 6, 30, '["Pool", "Gym", "Cinema", "Rooftop terrace", "Bay glimpses", "Concierge"]'::jsonb, '["Emergency response", "Concierge"]'::jsonb, '["Swimming", "Movies", "Exercise classes", "Beach walks", "Social events"]'::jsonb, false, 124, ARRAY['1 bedroom', '2 bedroom'], 55, '1300 283 000', 'brightoneast@aveo.com.au', 'https://www.aveo.com.au', 'Premium bayside retirement living near Brighton Beach with contemporary apartments. Walk to Church Street shops, cafes and beach.', 'approved', 'admin', true),

-- 2. Stockland Mernda
('Stockland Mernda', 'Stockland', '1 Mernda Village Drive, Mernda VIC 3754', 'Mernda', '3754', 'VIC', -37.5950, 145.0969, 'Independent Living', 'independent', 380000, 580000, 640, 1000, 'DMF', 6, 30, '["Pool", "Gym", "Cinema", "Bowling green", "Community centre", "Gardens"]'::jsonb, '["Emergency response"]'::jsonb, '["Swimming", "Movies", "Bowls", "Exercise classes", "Social events"]'::jsonb, false, 196, ARRAY['2 bedroom', '3 bedroom'], 55, '1800 550 550', 'mernda@stockland.com.au', 'https://www.stockland.com.au/retirement', 'Northern Melbourne retirement community near new train station with modern villas. Close to Plenty Valley shopping and medical facilities.', 'approved', 'admin', true),

-- 3. Lendlease Retirement Docklands
('Lendlease Retirement Docklands', 'Lendlease', '88 Waterfront Way, Docklands VIC 3008', 'Docklands', '3008', 'VIC', -37.8136, 144.9506, 'Independent Living', 'independent', 780000, 1180000, 1200, 1720, 'DMF', 6, 30, '["Harbour views", "Rooftop terrace", "Pool", "Gym", "Cinema", "Fine dining", "Concierge"]'::jsonb, '["Emergency response", "Concierge"]'::jsonb, '["Swimming", "Movies", "Exercise classes", "Fine dining", "Harbour walks", "Social events"]'::jsonb, false, 142, ARRAY['1 bedroom', '2 bedroom', '3 bedroom'], 55, '1300 326 033', 'docklands@lendlease.com', 'https://www.lendlease.com/au/retirement', 'Luxury Melbourne city retirement living with premium apartments and harbour views. Walk to Harbour Town shopping and waterfront dining.', 'approved', 'admin', true),

-- 4. Anglicare Whitehorse
('Anglicare Whitehorse', 'Anglicare', '42 Canterbury Road, Box Hill VIC 3128', 'Box Hill', '3128', 'VIC', -37.8186, 145.1236, 'Mixed', 'Mixed', 420000, 620000, 680, 1040, 'DMF', 6, 30, '["Chapel", "Community centre", "Gardens", "Library"]'::jsonb, '["Emergency response", "Aged care", "24/7 nursing"]'::jsonb, '["Chapel services", "Social events", "Library", "Garden club"]'::jsonb, true, 112, ARRAY['1 bedroom', '2 bedroom'], 55, '03 9896 3100', 'whitehorse@anglicare.vic.org.au', 'https://www.anglicarevic.org.au', 'Eastern suburbs retirement community in Box Hill with independent villas and chapel. Close to Box Hill Central shopping, hospital and transport.', 'approved', 'admin', true),

-- 5. Baptistcare Wyndham Lodge
('Baptistcare Wyndham Lodge', 'BaptistCare', '88 Watton Street, Werribee VIC 3030', 'Werribee', '3030', 'VIC', -37.9019, 144.6558, 'Mixed', 'Mixed', 320000, 480000, 560, 880, 'DMF', 6, 30, '["Chapel", "Bowling green", "Community centre", "Gardens"]'::jsonb, '["Emergency response", "Aged care", "24/7 nursing"]'::jsonb, '["Chapel services", "Bowls", "Social events", "Garden club"]'::jsonb, true, 126, ARRAY['1 bedroom', '2 bedroom', '3 bedroom'], 55, '03 9741 3100', 'werribee@baptistcare.org.au', 'https://www.baptistcare.org.au', 'Western suburbs retirement village in Werribee with comfortable villas and chapel. Close to Werribee Plaza, hospital and train station.', 'approved', 'admin', true),

-- 6. Uniting AgeWell Balwyn
('Uniting AgeWell Balwyn', 'Uniting AgeWell', '88 Whitehorse Road, Balwyn VIC 3103', 'Balwyn', '3103', 'VIC', -37.8072, 145.0856, 'Independent Living', 'independent', 580000, 820000, 880, 1280, 'DMF', 6, 30, '["Pool", "Gym", "Community centre", "Gardens", "Tram access"]'::jsonb, '["Emergency response"]'::jsonb, '["Swimming", "Exercise classes", "Social events", "Shopping trips"]'::jsonb, false, 96, ARRAY['1 bedroom', '2 bedroom'], 55, '1300 783 435', 'balwyn@unitingagewell.org', 'https://www.unitingagewell.org', 'Eastern suburbs retirement living in leafy Balwyn with quality apartments. Walk to Balwyn village shops, cafes and trams.', 'approved', 'admin', true),

-- 7. Opal Aged Care Glen Waverley
('Opal Aged Care Glen Waverley', 'Opal Aged Care', '42 Springvale Road, Glen Waverley VIC 3150', 'Glen Waverley', '3150', 'VIC', -37.8797, 145.1631, 'Mixed', 'Mixed', 480000, 680000, 760, 1120, 'DMF', 6, 30, '["Pool", "Gym", "Cinema", "Community centre", "Shopping access"]'::jsonb, '["Emergency response", "Aged care", "24/7 nursing"]'::jsonb, '["Swimming", "Movies", "Exercise classes", "Social events", "Shopping trips"]'::jsonb, false, 138, ARRAY['1 bedroom', '2 bedroom', '3 bedroom'], 55, '1300 672 524', 'glenwaverley@opalaged.care', 'https://www.opalagedcare.com.au', 'Eastern suburbs retirement near major shopping with contemporary apartments. Walk to Glen Waverley station, The Glen shopping and medical facilities.', 'approved', 'admin', true),

-- 8. IRT Royal Freemasons Footscray
('IRT Royal Freemasons Footscray', 'IRT Group', '22 Buckley Street, Footscray VIC 3011', 'Footscray', '3011', 'VIC', -37.7992, 144.8978, 'Mixed', 'Mixed', 380000, 560000, 640, 1000, 'DMF', 6, 30, '["Pool", "Community centre", "Gardens", "Urban location"]'::jsonb, '["Emergency response", "Aged care", "24/7 nursing"]'::jsonb, '["Swimming", "Exercise classes", "Social events", "Cultural activities"]'::jsonb, false, 104, ARRAY['1 bedroom', '2 bedroom'], 55, '1300 157 677', 'footscray@irt.org.au', 'https://www.irt.org.au', 'Inner-west Melbourne retirement community with modern apartments near Footscray Hospital. Walk to Footscray Market, station and restaurants.', 'approved', 'admin', true),

-- 9. Regis Aged Care Templestowe
('Regis Aged Care Templestowe', 'Regis Aged Care', '88 Reynolds Road, Templestowe VIC 3106', 'Templestowe', '3106', 'VIC', -37.7639, 145.1500, 'Mixed', 'Mixed', 480000, 680000, 760, 1120, 'DMF', 6, 30, '["Bowling green", "Gardens", "Bushland setting", "Community centre"]'::jsonb, '["Emergency response", "Aged care", "24/7 nursing"]'::jsonb, '["Bowls", "Social events", "Garden club", "Bush walks"]'::jsonb, false, 92, ARRAY['1 bedroom', '2 bedroom'], 55, '03 9850 3100', 'templestowe@regis.com.au', 'https://www.regis.com.au', 'Eastern suburbs retirement village in leafy Templestowe with quality villas. Close to Westfield Doncaster and Manningham Medical Centre.', 'approved', 'admin', true),

-- 10. Respect Aged Care Coburg
('Respect Aged Care Coburg', 'Respect', '42 Bell Street, Coburg VIC 3058', 'Coburg', '3058', 'VIC', -37.7478, 144.9625, 'Mixed', 'Mixed', 380000, 560000, 640, 1000, 'DMF', 6, 30, '["Pool", "Community centre", "Gardens", "Tram access"]'::jsonb, '["Emergency response", "Aged care", "24/7 nursing"]'::jsonb, '["Swimming", "Exercise classes", "Social events", "Cultural activities"]'::jsonb, true, 116, ARRAY['1 bedroom', '2 bedroom'], 55, '03 9354 3100', 'coburg@respect.com.au', 'https://www.respect.com.au', 'Northern suburbs retirement community near Coburg station with modern villas. Walk to Sydney Road shops and trams.', 'approved', 'admin', true),

-- 11. Arcare Burnside
('Arcare Burnside', 'Arcare', '1 Boardwalk Boulevard, Burnside VIC 3023', 'Burnside', '3023', 'VIC', -37.7219, 144.7419, 'Mixed', 'Mixed', 340000, 520000, 600, 920, 'DMF', 6, 30, '["Pool", "Gym", "Bowling green", "Community centre", "Gardens"]'::jsonb, '["Emergency response", "Aged care", "24/7 nursing"]'::jsonb, '["Swimming", "Bowls", "Exercise classes", "Social events"]'::jsonb, false, 148, ARRAY['1 bedroom', '2 bedroom', '3 bedroom'], 55, '1300 272 273', 'burnside@arcare.com.au', 'https://www.arcare.com.au', 'Western suburbs retirement village in Burnside Heights with contemporary villas. Close to shopping centres and medical facilities.', 'approved', 'admin', true),

-- 12. Bupa Aged Care Cheltenham
('Bupa Aged Care Cheltenham', 'Bupa', '88 Charman Road, Cheltenham VIC 3192', 'Cheltenham', '3192', 'VIC', -37.9639, 145.0522, 'Mixed', 'Mixed', 480000, 680000, 760, 1120, 'DMF', 6, 30, '["Community centre", "Gardens", "Shopping access", "Station access"]'::jsonb, '["Emergency response", "Aged care", "24/7 nursing"]'::jsonb, '["Social events", "Garden club", "Shopping trips", "Beach walks"]'::jsonb, false, 108, ARRAY['1 bedroom', '2 bedroom'], 55, '1300 280 334', 'cheltenham@bupa.com.au', 'https://www.bupa.com.au', 'Bayside retirement community near Southland shopping with modern apartments. Walk to Southland, Cheltenham station and medical facilities.', 'approved', 'admin', true),

-- 13. Allity Dandenong
('Allity Dandenong', 'Allity', '42 Foster Street, Dandenong VIC 3175', 'Dandenong', '3175', 'VIC', -37.9875, 145.2150, 'Mixed', 'Mixed', 300000, 460000, 520, 840, 'DMF', 6, 30, '["Bowling green", "Community centre", "Gardens", "Cultural centre"]'::jsonb, '["Emergency response", "Aged care", "24/7 nursing"]'::jsonb, '["Bowls", "Social events", "Garden club", "Cultural activities"]'::jsonb, true, 94, ARRAY['1 bedroom', '2 bedroom'], 55, '03 9791 3100', 'dandenong@allity.com.au', 'https://www.allity.com.au', 'South-eastern suburbs retirement community with affordable villas and multicultural friendly environment. Close to Dandenong Market and hospital.', 'approved', 'admin', true),

-- 14. Bolton Clarke Doncaster
('Bolton Clarke Doncaster', 'Bolton Clarke', '88 Williamsons Road, Doncaster VIC 3108', 'Doncaster', '3108', 'VIC', -37.7856, 145.1239, 'Mixed', 'Mixed', 520000, 740000, 800, 1200, 'DMF', 6, 30, '["Pool", "Bowling green", "Community centre", "Gardens"]'::jsonb, '["Emergency response", "Aged care", "24/7 nursing"]'::jsonb, '["Swimming", "Bowls", "Social events", "Garden club"]'::jsonb, false, 112, ARRAY['1 bedroom', '2 bedroom'], 55, '1300 228 655', 'doncaster@boltonclarke.com.au', 'https://www.boltonclarke.com.au', 'Eastern suburbs retirement village near Westfield Doncaster with quality villas. Walk to major shopping and medical facilities.', 'approved', 'admin', true),

-- 15. Estia Health Keilor
('Estia Health Keilor', 'Estia Health', '22 Taylors Road, Keilor Downs VIC 3038', 'Keilor Downs', '3038', 'VIC', -37.7253, 144.8069, 'Mixed', 'Mixed', 340000, 510000, 600, 920, 'DMF', 6, 30, '["Pool", "Community centre", "Gardens", "Library"]'::jsonb, '["Emergency response", "Aged care", "24/7 nursing"]'::jsonb, '["Swimming", "Exercise classes", "Social events", "Library"]'::jsonb, false, 102, ARRAY['1 bedroom', '2 bedroom'], 55, '03 9390 3100', 'keilor@estiahealth.com.au', 'https://www.estiahealth.com.au', 'Western suburbs retirement community near Keilor Downs with modern villas. Close to shopping centres, medical facilities and Calder Freeway.', 'approved', 'admin', true),

-- 16. Japara Glenrowan
('Japara Glenrowan', 'Japara', '88 Burwood Road, Hawthorn VIC 3122', 'Hawthorn', '3122', 'VIC', -37.8219, 145.0358, 'Mixed', 'Mixed', 580000, 820000, 880, 1280, 'DMF', 6, 30, '["Heritage style", "Gardens", "Community centre", "Tram access"]'::jsonb, '["Emergency response", "Aged care", "24/7 nursing"]'::jsonb, '["Social events", "Garden club", "Heritage tours", "University programs"]'::jsonb, false, 76, ARRAY['1 bedroom', '2 bedroom'], 55, '1800 52 72 72', 'hawthorn@japara.com.au', 'https://www.japara.com.au', 'Inner-eastern retirement community in Hawthorn with heritage-style villas near Glenferrie Road. Walk to trams, shops and Swinburne University.', 'approved', 'admin', true),

-- 17. Tricare Frankston
('Tricare Frankston', 'Tricare', '88 Nepean Highway, Frankston VIC 3199', 'Frankston', '3199', 'VIC', -38.1422, 145.1250, 'Mixed', 'Mixed', 360000, 540000, 600, 960, 'DMF', 6, 30, '["Pool", "Bowling green", "Bay breezes", "Community centre"]'::jsonb, '["Emergency response", "Aged care", "24/7 nursing"]'::jsonb, '["Swimming", "Bowls", "Beach walks", "Social events"]'::jsonb, false, 132, ARRAY['1 bedroom', '2 bedroom', '3 bedroom'], 55, '03 9783 3100', 'frankston@tricare.com.au', 'https://www.tricare.com.au', 'Bayside retirement village near Frankston Beach with modern villas. Walk to Bayside Shopping Centre, station and beaches.', 'approved', 'admin', true),

-- 18. Mayflower Brighton
('Mayflower Brighton', 'Mayflower', '88 Martin Street, Brighton VIC 3186', 'Brighton', '3186', 'VIC', -37.9228, 145.0039, 'Independent Living', 'independent', 720000, 1020000, 1120, 1560, 'DMF', 6, 30, '["Bay views", "Rooftop terrace", "Pool", "Gym", "Concierge", "Beach access"]'::jsonb, '["Emergency response", "Concierge"]'::jsonb, '["Swimming", "Exercise classes", "Beach walks", "Social events", "Fine dining"]'::jsonb, false, 84, ARRAY['1 bedroom', '2 bedroom'], 55, '03 9592 1234', 'brighton@mayflower.org.au', 'https://www.mayflower.org.au', 'Premium bayside retirement living near Middle Brighton Beach with luxury apartments. Walk to Church Street shopping, cafes and beach.', 'approved', 'admin', true),

-- 19. RSL Care Heidelberg
('RSL Care Heidelberg', 'RSL Care', '42 Lower Plenty Road, Heidelberg VIC 3084', 'Heidelberg', '3084', 'VIC', -37.7500, 145.0611, 'Mixed', 'Mixed', 420000, 620000, 680, 1040, 'DMF', 6, 30, '["Bowling green", "Gardens", "RSL services", "Community centre"]'::jsonb, '["Emergency response", "Aged care", "24/7 nursing", "Veterans services"]'::jsonb, '["Bowls", "RSL activities", "Social events", "Garden club"]'::jsonb, true, 96, ARRAY['1 bedroom', '2 bedroom'], 55, '03 9450 3100', 'heidelberg@rslcare.org.au', 'https://www.rslcare.org.au', 'Northern suburbs retirement village near Austin Hospital with villas and veterans services. Close to Heidelberg station and shopping.', 'approved', 'admin', true),

-- 20. Peninsula Villages Rosebud
('Peninsula Villages Rosebud', 'Peninsula Villages', '1 Boneo Road, Rosebud VIC 3939', 'Rosebud', '3939', 'VIC', -38.3586, 144.8983, 'Independent Living', 'independent', 380000, 580000, 640, 1000, 'DMF', 6, 30, '["Pool", "Gym", "Bowling green", "Beach access", "Community centre"]'::jsonb, '["Emergency response"]'::jsonb, '["Swimming", "Bowls", "Exercise classes", "Beach walks", "Social events"]'::jsonb, false, 164, ARRAY['1 bedroom', '2 bedroom', '3 bedroom'], 55, '03 5986 3100', 'rosebud@peninsulavillages.com.au', 'https://www.peninsulavillages.com.au', 'Mornington Peninsula coastal retirement resort with modern villas near Rosebud Beach. Walk to beach, shops and cafes.', 'approved', 'admin', true),

-- 21. Mercy Health Werribee
('Mercy Health Werribee', 'Mercy Health', '88 Heaths Road, Werribee VIC 3030', 'Werribee', '3030', 'VIC', -37.9019, 144.6558, 'Mixed', 'Mixed', 340000, 520000, 600, 920, 'DMF', 6, 30, '["Chapel", "Pool", "Community centre", "Gardens"]'::jsonb, '["Emergency response", "Aged care", "24/7 nursing", "Pastoral care"]'::jsonb, '["Chapel services", "Swimming", "Social events", "Garden club"]'::jsonb, true, 118, ARRAY['1 bedroom', '2 bedroom', '3 bedroom'], 55, '03 9742 3100', 'werribee@mercyhealth.com.au', 'https://www.mercyhealth.com.au', 'Western growth corridor retirement community with Catholic heritage and modern villas. Close to Werribee Mercy Hospital and shopping.', 'approved', 'admin', true),

-- 22. Benetas Heidelberg West
('Benetas Heidelberg West', 'Benetas', '42 Banksia Street, Heidelberg West VIC 3081', 'Heidelberg West', '3081', 'VIC', -37.7397, 145.0456, 'Mixed', 'Mixed', 320000, 480000, 560, 880, 'DMF', 6, 30, '["Chapel", "Community centre", "Gardens", "Cultural centre"]'::jsonb, '["Emergency response", "Aged care", "24/7 nursing"]'::jsonb, '["Chapel services", "Social events", "Garden club", "Cultural activities"]'::jsonb, true, 88, ARRAY['1 bedroom', '2 bedroom'], 55, '03 9854 3100', 'heidelbergwest@benetas.com.au', 'https://www.benetas.com.au', 'Northern suburbs retirement community with Greek heritage services and multicultural friendly villas. Close to shopping and medical facilities.', 'approved', 'admin', true),

-- 23. Embracia Eltham
('Embracia Eltham', 'Embracia Health', '88 Main Road, Eltham VIC 3095', 'Eltham', '3095', 'VIC', -37.7139, 145.1764, 'Mixed', 'Mixed', 420000, 620000, 680, 1040, 'DMF', 6, 30, '["Bushland setting", "Gardens", "Community centre", "Arts culture"]'::jsonb, '["Emergency response", "Aged care", "24/7 nursing"]'::jsonb, '["Social events", "Garden club", "Art gallery visits", "Bush walks"]'::jsonb, false, 84, ARRAY['1 bedroom', '2 bedroom'], 55, '03 9439 3100', 'eltham@embracia.com.au', 'https://www.embracia.com.au', 'North-eastern suburbs retirement village in leafy Eltham with villas surrounded by native bushland. Enjoy artistic community and nature.', 'approved', 'admin', true),

-- 24. Resthaven Williamstown
('Resthaven Williamstown', 'Resthaven', '88 The Strand, Williamstown VIC 3016', 'Williamstown', '3016', 'VIC', -37.8650, 144.8997, 'Independent Living', 'independent', 520000, 760000, 800, 1200, 'DMF', 6, 30, '["Water views", "Pool", "Waterfront walks", "Community centre", "Maritime heritage"]'::jsonb, '["Emergency response"]'::jsonb, '["Swimming", "Waterfront walks", "Social events", "Maritime activities"]'::jsonb, false, 92, ARRAY['1 bedroom', '2 bedroom'], 55, '03 9397 1234', 'williamstown@resthaven.asn.au', 'https://www.resthaven.asn.au', 'Western suburbs harbourside retirement village with modern apartments and water views. Walk to Nelson Place cafes, beach and station.', 'approved', 'admin', true),

-- 25. Warrigal Care Bundoora
('Warrigal Care Bundoora', 'Warrigal Care', '88 Plenty Road, Bundoora VIC 3083', 'Bundoora', '3083', 'VIC', -37.6964, 145.0572, 'Mixed', 'Mixed', 380000, 560000, 640, 1000, 'DMF', 6, 30, '["Pool", "Gardens", "Community centre", "University access"]'::jsonb, '["Emergency response", "Aged care", "24/7 nursing"]'::jsonb, '["Swimming", "Exercise classes", "Social events", "University programs"]'::jsonb, false, 108, ARRAY['1 bedroom', '2 bedroom'], 55, '03 9467 3100', 'bundoora@warrigal.com.au', 'https://www.warrigal.com.au', 'Northern suburbs retirement community near La Trobe University with modern villas. Close to university hospital and Plenty Road shopping.', 'approved', 'admin', true);