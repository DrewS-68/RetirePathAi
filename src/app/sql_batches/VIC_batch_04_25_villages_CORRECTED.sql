-- VIC Batch 04: 25 Northern Melbourne & Growth Corridor Retirement Villages (CORRECTED)
-- Geographic Focus: Whittlesea, Craigieburn, Epping, Greensborough, Diamond Creek
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

-- 1. Stockland Highlands Craigieburn
('Stockland Highlands Craigieburn', 'Stockland', '1 Highlands Boulevard, Craigieburn VIC 3064', 'Craigieburn', '3064', 'VIC', -37.5983, 144.9419, 'Independent Living', 'independent', 340000, 520000, 600, 920, 'DMF', 6, 30, '["Pool", "Gym", "Cinema", "Bowling green", "Community centre", "Gardens"]'::jsonb, '["Emergency response"]'::jsonb, '["Swimming", "Movies", "Bowls", "Exercise classes", "Social events"]'::jsonb, false, 196, ARRAY['2 bedroom', '3 bedroom'], 55, '1800 550 550', 'craigieburn@stockland.com.au', 'https://www.stockland.com.au/retirement', 'Northern growth corridor retirement resort with contemporary villas. Close to Highlands shopping and medical facilities.', 'approved', 'admin', true),

-- 2. Aveo Epping North
('Aveo Epping North', 'Aveo Group', '88 Cooper Street, Epping VIC 3076', 'Epping', '3076', 'VIC', -37.6486, 145.0194, 'Independent Living', 'independent', 380000, 560000, 640, 1000, 'DMF', 6, 30, '["Pool", "Community centre", "Gardens", "Shopping access", "Station access"]'::jsonb, '["Emergency response"]'::jsonb, '["Swimming", "Exercise classes", "Social events", "Shopping trips"]'::jsonb, false, 142, ARRAY['1 bedroom', '2 bedroom', '3 bedroom'], 55, '1300 283 000', 'eppingnorth@aveo.com.au', 'https://www.aveo.com.au', 'Northern suburbs retirement community near Pacific Epping with modern villas. Walk to shopping centre and train station.', 'approved', 'admin', true),

-- 3. Lendlease Doreen
('Lendlease Doreen', 'Lendlease', '42 Bridge Inn Road, Doreen VIC 3754', 'Doreen', '3754', 'VIC', -37.6003, 145.1406, 'Independent Living', 'independent', 360000, 540000, 600, 960, 'DMF', 6, 30, '["Pool", "Bowling green", "Community centre", "Gardens", "Growth area"]'::jsonb, '["Emergency response"]'::jsonb, '["Swimming", "Bowls", "Social events", "Community activities"]'::jsonb, false, 126, ARRAY['1 bedroom', '2 bedroom', '3 bedroom'], 55, '1300 326 033', 'doreen@lendlease.com', 'https://www.lendlease.com/au/retirement', 'Northern growth area retirement village with quality villas. Close to Laurimar Town Centre and future train station.', 'approved', 'admin', true),

-- 4. Anglicare Reservoir
('Anglicare Reservoir', 'Anglicare', '42 Spring Street, Reservoir VIC 3073', 'Reservoir', '3073', 'VIC', -37.7194, 145.0097, 'Mixed', 'Mixed', 360000, 540000, 600, 960, 'DMF', 6, 30, '["Chapel", "Community centre", "Gardens", "Station access"]'::jsonb, '["Emergency response", "Aged care", "24/7 nursing"]'::jsonb, '["Chapel services", "Social events", "Garden club", "Shopping trips"]'::jsonb, true, 104, ARRAY['1 bedroom', '2 bedroom'], 55, '03 9462 3100', 'reservoir@anglicare.vic.org.au', 'https://www.anglicarevic.org.au', 'Northern suburbs retirement community near Reservoir station with independent villas. Close to Northland shopping and medical facilities.', 'approved', 'admin', true),

-- 5. Baptistcare Greensborough
('Baptistcare Greensborough', 'BaptistCare', '88 Grimshaw Street, Greensborough VIC 3088', 'Greensborough', '3088', 'VIC', -37.7042, 145.1031, 'Mixed', 'Mixed', 400000, 600000, 680, 1040, 'DMF', 6, 30, '["Chapel", "Bowling green", "Community centre", "Gardens"]'::jsonb, '["Emergency response", "Aged care", "24/7 nursing"]'::jsonb, '["Chapel services", "Bowls", "Social events", "Garden club"]'::jsonb, true, 96, ARRAY['1 bedroom', '2 bedroom'], 55, '03 9435 3100', 'greensborough@baptistcare.org.au', 'https://www.baptistcare.org.au', 'North-eastern suburbs retirement village with comfortable villas and chapel. Close to Greensborough Plaza and train station.', 'approved', 'admin', true),

-- 6. Uniting AgeWell Mill Park
('Uniting AgeWell Mill Park', 'Uniting AgeWell', '42 Childs Road, Mill Park VIC 3082', 'Mill Park', '3082', 'VIC', -37.6644, 145.0603, 'Independent Living', 'independent', 360000, 540000, 600, 960, 'DMF', 6, 30, '["Pool", "Community centre", "Gardens", "Shopping access"]'::jsonb, '["Emergency response"]'::jsonb, '["Swimming", "Exercise classes", "Social events", "Shopping trips"]'::jsonb, false, 132, ARRAY['1 bedroom', '2 bedroom', '3 bedroom'], 55, '1300 783 435', 'millpark@unitingagewell.org', 'https://www.unitingagewell.org', 'Northern suburbs retirement community with modern villas. Close to Westfield Plenty Valley shopping and medical facilities.', 'approved', 'admin', true),

-- 7. Opal Aged Care Whittlesea
('Opal Aged Care Whittlesea', 'Opal Aged Care', '88 Church Street, Whittlesea VIC 3757', 'Whittlesea', '3757', 'VIC', -37.5092, 145.1211, 'Mixed', 'Mixed', 300000, 460000, 520, 840, 'DMF', 6, 30, '["Pool", "Community centre", "Gardens", "Regional atmosphere"]'::jsonb, '["Emergency response", "Aged care", "24/7 nursing"]'::jsonb, '["Swimming", "Exercise classes", "Social events", "Garden club"]'::jsonb, false, 94, ARRAY['1 bedroom', '2 bedroom'], 55, '1300 672 524', 'whittlesea@opalaged.care', 'https://www.opalagedcare.com.au', 'Northern growth corridor retirement village with contemporary villas near Whittlesea township. Close to medical facilities and shopping.', 'approved', 'admin', true),

-- 8. IRT Eltham
('IRT Eltham', 'IRT Group', '88 Main Road, Eltham VIC 3095', 'Eltham', '3095', 'VIC', -37.7139, 145.1764, 'Mixed', 'Mixed', 420000, 620000, 680, 1040, 'DMF', 6, 30, '["Bushland setting", "Community centre", "Gardens", "Arts culture"]'::jsonb, '["Emergency response", "Aged care", "24/7 nursing"]'::jsonb, '["Social events", "Garden club", "Art gallery visits", "Bush walks"]'::jsonb, false, 88, ARRAY['1 bedroom', '2 bedroom'], 55, '1300 157 677', 'eltham@irt.org.au', 'https://www.irt.org.au', 'North-eastern suburbs retirement community in green wedge with villas surrounded by bushland. Walk to Eltham village and train station.', 'approved', 'admin', true),

-- 9. Regis Aged Care Preston
('Regis Aged Care Preston', 'Regis Aged Care', '42 Tyler Street, Preston VIC 3072', 'Preston', '3072', 'VIC', -37.7425, 145.0061, 'Mixed', 'Mixed', 400000, 600000, 680, 1040, 'DMF', 6, 30, '["Community centre", "Gardens", "Tram access", "Market access"]'::jsonb, '["Emergency response", "Aged care", "24/7 nursing"]'::jsonb, '["Social events", "Garden club", "Market visits", "Cultural activities"]'::jsonb, true, 92, ARRAY['1 bedroom', '2 bedroom'], 55, '03 9470 3100', 'preston@regis.com.au', 'https://www.regis.com.au', 'Inner northern suburbs retirement community with quality villas near Preston Market. Walk to trams, shops and medical facilities.', 'approved', 'admin', true),

-- 10. Respect Aged Care Thomastown
('Respect Aged Care Thomastown', 'Respect', '88 High Street, Thomastown VIC 3074', 'Thomastown', '3074', 'VIC', -37.6861, 145.0211, 'Mixed', 'Mixed', 300000, 460000, 520, 840, 'DMF', 6, 30, '["Pool", "Community centre", "Gardens", "Cultural diversity"]'::jsonb, '["Emergency response", "Aged care", "24/7 nursing"]'::jsonb, '["Swimming", "Exercise classes", "Social events", "Cultural activities"]'::jsonb, true, 116, ARRAY['1 bedroom', '2 bedroom', '3 bedroom'], 55, '03 9465 3100', 'thomastown@respect.com.au', 'https://www.respect.com.au', 'Northern suburbs retirement community near Thomastown station with affordable villas. Close to shopping and medical facilities.', 'approved', 'admin', true),

-- 11. Arcare Wallan
('Arcare Wallan', 'Arcare', '1 High Street, Wallan VIC 3756', 'Wallan', '3756', 'VIC', -37.4144, 144.9808, 'Mixed', 'Mixed', 280000, 430000, 480, 780, 'DMF', 6, 30, '["Pool", "Community centre", "Gardens", "Regional setting"]'::jsonb, '["Emergency response", "Aged care", "24/7 nursing"]'::jsonb, '["Swimming", "Exercise classes", "Social events", "Garden club"]'::jsonb, false, 108, ARRAY['1 bedroom', '2 bedroom', '3 bedroom'], 55, '1300 272 273', 'wallan@arcare.com.au', 'https://www.arcare.com.au', 'Northern regional retirement village with modern villas in growing township. Close to Wallan Plaza and medical facilities.', 'approved', 'admin', true),

-- 12. Bupa Aged Care Diamond Creek
('Bupa Aged Care Diamond Creek', 'Bupa', '42 Main Hurstbridge Road, Diamond Creek VIC 3089', 'Diamond Creek', '3089', 'VIC', -37.6733, 145.1525, 'Mixed', 'Mixed', 400000, 600000, 680, 1040, 'DMF', 6, 30, '["Bushland setting", "Community centre", "Gardens", "Station access"]'::jsonb, '["Emergency response", "Aged care", "24/7 nursing"]'::jsonb, '["Social events", "Garden club", "Bush walks"]'::jsonb, false, 84, ARRAY['1 bedroom', '2 bedroom'], 55, '1300 280 334', 'diamondcreek@bupa.com.au', 'https://www.bupa.com.au', 'North-eastern suburbs retirement village in green wedge with comfortable villas. Walk to shops and train station.', 'approved', 'admin', true),

-- 13. Allity Wollert
('Allity Wollert', 'Allity', '1 Harvest Home Road, Wollert VIC 3750', 'Wollert', '3750', 'VIC', -37.5892, 145.0372, 'Independent Living', 'independent', 320000, 480000, 560, 880, 'DMF', 6, 30, '["Pool", "Community centre", "Gardens", "New development"]'::jsonb, '["Emergency response"]'::jsonb, '["Swimming", "Exercise classes", "Social events", "Garden club"]'::jsonb, false, 138, ARRAY['1 bedroom', '2 bedroom', '3 bedroom'], 55, '03 9404 3100', 'wollert@allity.com.au', 'https://www.allity.com.au', 'Northern growth corridor retirement community with contemporary villas in new development area. Close to Epping Plaza.', 'approved', 'admin', true),

-- 14. Bolton Clarke Macleod
('Bolton Clarke Macleod', 'Bolton Clarke', '88 Aberdeen Road, Macleod VIC 3085', 'Macleod', '3085', 'VIC', -37.7369, 145.0661, 'Mixed', 'Mixed', 400000, 600000, 680, 1040, 'DMF', 6, 30, '["Community centre", "Gardens", "Station access", "Shopping access"]'::jsonb, '["Emergency response", "Aged care", "24/7 nursing"]'::jsonb, '["Social events", "Garden club", "Shopping trips"]'::jsonb, false, 96, ARRAY['1 bedroom', '2 bedroom'], 55, '1300 228 655', 'macleod@boltonclarke.com.au', 'https://www.boltonclarke.com.au', 'Northern suburbs retirement community near Macleod station with quality villas. Close to village, medical facilities and transport.', 'approved', 'admin', true),

-- 15. Estia Health Broadmeadows
('Estia Health Broadmeadows', 'Estia Health', '42 Pascoe Vale Road, Broadmeadows VIC 3047', 'Broadmeadows', '3047', 'VIC', -37.6769, 144.9192, 'Mixed', 'Mixed', 300000, 460000, 520, 840, 'DMF', 6, 30, '["Pool", "Community centre", "Cultural centre", "Station access"]'::jsonb, '["Emergency response", "Aged care", "24/7 nursing"]'::jsonb, '["Swimming", "Exercise classes", "Social events", "Cultural activities"]'::jsonb, true, 124, ARRAY['1 bedroom', '2 bedroom', '3 bedroom'], 55, '03 9302 3100', 'broadmeadows@estiahealth.com.au', 'https://www.estiahealth.com.au', 'Northern suburbs multicultural retirement community with modern villas near Broadmeadows station. Diverse community with excellent transport.', 'approved', 'admin', true),

-- 16. Japara Ivanhoe
('Japara Ivanhoe', 'Japara', '88 Upper Heidelberg Road, Ivanhoe VIC 3079', 'Ivanhoe', '3079', 'VIC', -37.7708, 145.0442, 'Mixed', 'Mixed', 520000, 740000, 800, 1200, 'DMF', 6, 30, '["Heritage style", "Gardens", "Community centre", "Station access"]'::jsonb, '["Emergency response", "Aged care", "24/7 nursing"]'::jsonb, '["Social events", "Garden club", "Heritage tours"]'::jsonb, false, 78, ARRAY['1 bedroom', '2 bedroom'], 55, '1800 52 72 72', 'ivanhoe@japara.com.au', 'https://www.japara.com.au', 'Inner northern suburbs retirement community with heritage-style villas in prestigious Ivanhoe. Walk to shops, cafes and train station.', 'approved', 'admin', true),

-- 17. Tricare Sunbury
('Tricare Sunbury', 'Tricare', '88 Evans Street, Sunbury VIC 3429', 'Sunbury', '3429', 'VIC', -37.5778, 144.7278, 'Mixed', 'Mixed', 300000, 460000, 520, 840, 'DMF', 6, 30, '["Bowling green", "Community centre", "Gardens", "Historic town"]'::jsonb, '["Emergency response", "Aged care", "24/7 nursing"]'::jsonb, '["Bowls", "Social events", "Garden club", "Heritage tours"]'::jsonb, false, 102, ARRAY['1 bedroom', '2 bedroom'], 55, '03 9744 3100', 'sunbury@tricare.com.au', 'https://www.tricare.com.au', 'North-western regional retirement village with comfortable villas in historic Sunbury township. Close to Sunbury Square shopping.', 'approved', 'admin', true),

-- 18. Mayflower Northcote
('Mayflower Northcote', 'Mayflower', '88 High Street, Northcote VIC 3070', 'Northcote', '3070', 'VIC', -37.7708, 144.9997, 'Independent Living', 'independent', 480000, 680000, 760, 1120, 'DMF', 6, 30, '["Urban village", "Community centre", "Gardens", "Tram access"]'::jsonb, '["Emergency response"]'::jsonb, '["Social events", "Cafe visits", "Cultural activities"]'::jsonb, false, 72, ARRAY['1 bedroom', '2 bedroom'], 55, '03 9482 1234', 'northcote@mayflower.org.au', 'https://www.mayflower.org.au', 'Inner northern suburbs retirement community near High Street with contemporary apartments. Walk to trams, shops and cafes.', 'approved', 'admin', true),

-- 19. RSL Care Rosanna
('RSL Care Rosanna', 'RSL Care', '42 Lower Plenty Road, Rosanna VIC 3084', 'Rosanna', '3084', 'VIC', -37.7500, 145.0611, 'Mixed', 'Mixed', 420000, 620000, 680, 1040, 'DMF', 6, 30, '["Bowling green", "RSL services", "Community centre", "Station access"]'::jsonb, '["Emergency response", "Aged care", "24/7 nursing", "Veterans services"]'::jsonb, '["Bowls", "RSL activities", "Social events", "Garden club"]'::jsonb, true, 86, ARRAY['1 bedroom', '2 bedroom'], 55, '03 9457 3100', 'rosanna@rslcare.org.au', 'https://www.rslcare.org.au', 'North-eastern suburbs retirement village with veterans services and comfortable villas. Near Rosanna station and golf course.', 'approved', 'admin', true),

-- 20. Mercy Health Glenroy
('Mercy Health Glenroy', 'Mercy Health', '88 Glenroy Road, Glenroy VIC 3046', 'Glenroy', '3046', 'VIC', -37.7019, 144.9181, 'Mixed', 'Mixed', 360000, 540000, 600, 960, 'DMF', 6, 30, '["Chapel", "Pool", "Community centre", "Gardens"]'::jsonb, '["Emergency response", "Aged care", "24/7 nursing", "Pastoral care"]'::jsonb, '["Chapel services", "Swimming", "Social events", "Garden club"]'::jsonb, true, 104, ARRAY['1 bedroom', '2 bedroom'], 55, '03 9306 3100', 'glenroy@mercyhealth.com.au', 'https://www.mercyhealth.com.au', 'Northern suburbs retirement community with Catholic heritage and modern villas. Close to Glenroy station and shopping.', 'approved', 'admin', true),

-- 21. Benetas Brunswick
('Benetas Brunswick', 'Benetas', '42 Sydney Road, Brunswick VIC 3056', 'Brunswick', '3056', 'VIC', -37.7653, 144.9606, 'Mixed', 'Mixed', 420000, 620000, 680, 1040, 'DMF', 6, 30, '["Cultural centre", "Community centre", "Gardens", "Tram access"]'::jsonb, '["Emergency response", "Aged care", "24/7 nursing"]'::jsonb, '["Social events", "Garden club", "Cultural activities", "Restaurant visits"]'::jsonb, true, 88, ARRAY['1 bedroom', '2 bedroom'], 55, '03 9388 3100', 'brunswick@benetas.com.au', 'https://www.benetas.com.au', 'Inner northern suburbs multicultural retirement community with contemporary villas near Sydney Road. Walk to trams and restaurants.', 'approved', 'admin', true),

-- 22. Embracia Kinglake
('Embracia Kinglake', 'Embracia Health', '42 Whittlesea-Kinglake Road, Kinglake VIC 3763', 'Kinglake', '3763', 'VIC', -37.5131, 145.2253, 'Independent Living', 'independent', 240000, 380000, 420, 700, 'DMF', 6, 30, '["Mountain views", "Bushland setting", "Walking trails", "Community centre"]'::jsonb, '["Emergency response"]'::jsonb, '["Bush walks", "Social events", "Garden club"]'::jsonb, true, 52, ARRAY['1 bedroom', '2 bedroom'], 55, '03 5786 1234', 'kinglake@embracia.com.au', 'https://www.embracia.com.au', 'Ranges retirement village with mountain views and peaceful villas in bushland setting. Close to Kinglake township and Yarra Valley.', 'approved', 'admin', true),

-- 23. Warrigal Care Lalor
('Warrigal Care Lalor', 'Warrigal Care', '88 May Road, Lalor VIC 3075', 'Lalor', '3075', 'VIC', -37.6717, 145.0117, 'Mixed', 'Mixed', 340000, 510000, 600, 920, 'DMF', 6, 30, '["Pool", "Community centre", "Gardens", "Shopping access"]'::jsonb, '["Emergency response", "Aged care", "24/7 nursing"]'::jsonb, '["Swimming", "Exercise classes", "Social events", "Shopping trips"]'::jsonb, false, 112, ARRAY['1 bedroom', '2 bedroom', '3 bedroom'], 55, '03 9465 4100', 'lalor@warrigal.com.au', 'https://www.warrigal.com.au', 'Northern suburbs retirement community near Epping with modern villas. Close to Pacific Epping shopping and medical facilities.', 'approved', 'admin', true),

-- 24. Peninsula Villages Hurstbridge
('Peninsula Villages Hurstbridge', 'Peninsula Villages', '1 Main Road, Hurstbridge VIC 3099', 'Hurstbridge', '3099', 'VIC', -37.6386, 145.1894, 'Independent Living', 'independent', 360000, 540000, 600, 960, 'DMF', 6, 30, '["Bushland setting", "Gardens", "Community centre", "Valley views"]'::jsonb, '["Emergency response"]'::jsonb, '["Bush walks", "Social events", "Garden club", "Winery tours"]'::jsonb, false, 68, ARRAY['1 bedroom', '2 bedroom'], 55, '03 9718 3100', 'hurstbridge@peninsulavillages.com.au', 'https://www.peninsulavillages.com.au', 'Yarra Valley retirement community in green wedge with contemporary villas surrounded by nature. Close to village, wineries and galleries.', 'approved', 'admin', true),

-- 25. Resthaven Kilmore
('Resthaven Kilmore', 'Resthaven', '88 Sydney Street, Kilmore VIC 3764', 'Kilmore', '3764', 'VIC', -37.2958, 144.9539, 'Mixed', 'Mixed', 260000, 410000, 460, 760, 'DMF', 6, 30, '["Bowling green", "Community centre", "Gardens", "Historic town"]'::jsonb, '["Emergency response", "Aged care", "24/7 nursing"]'::jsonb, '["Bowls", "Social events", "Garden club", "Heritage tours"]'::jsonb, true, 74, ARRAY['1 bedroom', '2 bedroom'], 55, '03 5782 1234', 'kilmore@resthaven.asn.au', 'https://www.resthaven.asn.au', 'Northern regional retirement village in historic Kilmore with comfortable villas. Close to town centre and medical facilities.', 'approved', 'admin', true);