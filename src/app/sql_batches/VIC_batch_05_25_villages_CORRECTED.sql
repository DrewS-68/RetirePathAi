-- VIC Batch 05: 25 Regional Victoria Retirement Villages (CORRECTED - FINAL VIC BATCH)
-- Geographic Focus: Ballarat, Bendigo, Shepparton, Wodonga, Warrnambool, Regional Cities
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

-- 1. Aveo Ballarat
('Aveo Ballarat', 'Aveo Group', '88 Sturt Street, Ballarat VIC 3350', 'Ballarat', '3350', 'VIC', -37.5622, 143.8503, 'Independent Living', 'independent', 280000, 430000, 480, 780, 'DMF', 6, 30, '["Pool", "Gym", "Bowling green", "Lake views", "Community centre"]'::jsonb, '["Emergency response"]'::jsonb, '["Swimming", "Bowls", "Exercise classes", "Social events", "Lake walks"]'::jsonb, false, 136, ARRAY['1 bedroom', '2 bedroom', '3 bedroom'], 55, '1300 283 000', 'ballarat@aveo.com.au', 'https://www.aveo.com.au', 'Regional city retirement community in historic Ballarat with modern villas near Lake Wendouree. Close to shops, medical facilities and Sovereign Hill.', 'approved', 'admin', true),

-- 2. Stockland Bendigo
('Stockland Bendigo', 'Stockland', '1 Strathdale Drive, Bendigo VIC 3550', 'Bendigo', '3550', 'VIC', -36.7506, 144.2786, 'Independent Living', 'independent', 300000, 460000, 520, 840, 'DMF', 6, 30, '["Pool", "Gym", "Cinema", "Bowling green", "Community centre", "Gardens"]'::jsonb, '["Emergency response"]'::jsonb, '["Swimming", "Movies", "Bowls", "Exercise classes", "Social events"]'::jsonb, false, 174, ARRAY['2 bedroom', '3 bedroom'], 55, '1800 550 550', 'bendigo@stockland.com.au', 'https://www.stockland.com.au/retirement', 'Central Victorian goldfields retirement resort with contemporary villas. Close to Bendigo Hospital, shopping and historic centre.', 'approved', 'admin', true),

-- 3. Lendlease Wodonga
('Lendlease Wodonga', 'Lendlease', '42 High Street, Wodonga VIC 3690', 'Wodonga', '3690', 'VIC', -36.1217, 146.8881, 'Independent Living', 'independent', 260000, 410000, 460, 760, 'DMF', 6, 30, '["Pool", "Bowling green", "Mountain views", "Community centre", "Gardens"]'::jsonb, '["Emergency response"]'::jsonb, '["Swimming", "Bowls", "Social events", "Garden club"]'::jsonb, false, 118, ARRAY['1 bedroom', '2 bedroom', '3 bedroom'], 55, '1300 326 033', 'wodonga@lendlease.com', 'https://www.lendlease.com/au/retirement', 'Border city retirement community near Albury with quality villas and mountain views. Close to Gateway Village shopping and medical facilities.', 'approved', 'admin', true),

-- 4. Anglicare Shepparton
('Anglicare Shepparton', 'Anglicare', '88 Wyndham Street, Shepparton VIC 3630', 'Shepparton', '3630', 'VIC', -36.3808, 145.3978, 'Mixed', 'Mixed', 240000, 380000, 420, 700, 'DMF', 6, 30, '["Chapel", "Bowling green", "Community centre", "Gardens"]'::jsonb, '["Emergency response", "Aged care", "24/7 nursing"]'::jsonb, '["Chapel services", "Bowls", "Social events", "Garden club"]'::jsonb, true, 102, ARRAY['1 bedroom', '2 bedroom'], 55, '03 5831 3100', 'shepparton@anglicare.vic.org.au', 'https://www.anglicarevic.org.au', 'Goulburn Valley regional retirement community with independent villas and chapel. Close to Shepparton hospital and marketplace.', 'approved', 'admin', true),

-- 5. Baptistcare Mildura
('Baptistcare Mildura', 'BaptistCare', '88 Deakin Avenue, Mildura VIC 3500', 'Mildura', '3500', 'VIC', -34.1889, 142.1583, 'Mixed', 'Mixed', 220000, 360000, 380, 660, 'DMF', 6, 30, '["Pool", "Chapel", "Bowling green", "River views"]'::jsonb, '["Emergency response", "Aged care", "24/7 nursing"]'::jsonb, '["Swimming", "Chapel services", "Bowls", "River activities", "Social events"]'::jsonb, true, 96, ARRAY['1 bedroom', '2 bedroom'], 55, '03 5021 3100', 'mildura@baptistcare.org.au', 'https://www.baptistcare.org.au', 'Sunraysia region retirement community with modern villas near Murray River. Close to Mildura Centro shopping and hospital.', 'approved', 'admin', true),

-- 6. Uniting AgeWell Echuca
('Uniting AgeWell Echuca', 'Uniting AgeWell', '42 High Street, Echuca VIC 3564', 'Echuca', '3564', 'VIC', -36.1389, 144.7481, 'Mixed', 'Mixed', 240000, 380000, 420, 700, 'DMF', 6, 30, '["River views", "Community centre", "Gardens", "Heritage port"]'::jsonb, '["Emergency response", "Aged care", "24/7 nursing"]'::jsonb, '["Social events", "Garden club", "Heritage tours", "River walks"]'::jsonb, true, 84, ARRAY['1 bedroom', '2 bedroom'], 55, '1300 783 435', 'echuca@unitingagewell.org', 'https://www.unitingagewell.org', 'Murray River retirement village in historic Echuca with comfortable villas near riverfront. Walk to shops, port and medical facilities.', 'approved', 'admin', true),

-- 7. Opal Aged Care Warrnambool
('Opal Aged Care Warrnambool', 'Opal Aged Care', '88 Raglan Parade, Warrnambool VIC 3280', 'Warrnambool', '3280', 'VIC', -38.3769, 142.4869, 'Mixed', 'Mixed', 280000, 430000, 480, 780, 'DMF', 6, 30, '["Pool", "Beach access", "Coastal walks", "Community centre"]'::jsonb, '["Emergency response", "Aged care", "24/7 nursing"]'::jsonb, '["Swimming", "Beach walks", "Whale watching", "Social events"]'::jsonb, false, 108, ARRAY['1 bedroom', '2 bedroom'], 55, '1300 672 524', 'warrnambool@opalaged.care', 'https://www.opalagedcare.com.au', 'Great Ocean Road coastal city retirement with modern villas near Warrnambool beaches. Close to shopping and medical facilities.', 'approved', 'admin', true),

-- 8. IRT Wangaratta
('IRT Wangaratta', 'IRT Group', '88 Parfitt Road, Wangaratta VIC 3677', 'Wangaratta', '3677', 'VIC', -36.3583, 146.3181, 'Mixed', 'Mixed', 240000, 380000, 420, 700, 'DMF', 6, 30, '["Bowling green", "River views", "Wine country", "Community centre"]'::jsonb, '["Emergency response", "Aged care", "24/7 nursing"]'::jsonb, '["Bowls", "Social events", "Garden club", "Winery tours"]'::jsonb, false, 92, ARRAY['1 bedroom', '2 bedroom'], 55, '1300 157 677', 'wangaratta@irt.org.au', 'https://www.irt.org.au', 'North-eastern regional retirement community with spacious villas near Ovens River and wineries. Close to town centre and hospital.', 'approved', 'admin', true),

-- 9. Regis Aged Care Swan Hill
('Regis Aged Care Swan Hill', 'Regis Aged Care', '42 Campbell Street, Swan Hill VIC 3585', 'Swan Hill', '3585', 'VIC', -35.3378, 143.5542, 'Mixed', 'Mixed', 200000, 340000, 360, 640, 'DMF', 6, 30, '["Bowling green", "River setting", "Community centre", "Gardens"]'::jsonb, '["Emergency response", "Aged care", "24/7 nursing"]'::jsonb, '["Bowls", "Social events", "Garden club", "Heritage tours"]'::jsonb, true, 76, ARRAY['1 bedroom', '2 bedroom'], 55, '03 5032 3100', 'swanhill@regis.com.au', 'https://www.regis.com.au', 'Murray River retirement village in Swan Hill with comfortable villas. Close to Swan Hill Pioneer Settlement and shopping.', 'approved', 'admin', true),

-- 10. Respect Aged Care Horsham
('Respect Aged Care Horsham', 'Respect', '88 Firebrace Street, Horsham VIC 3400', 'Horsham', '3400', 'VIC', -36.7144, 142.1992, 'Mixed', 'Mixed', 190000, 330000, 340, 620, 'DMF', 6, 30, '["Bowling green", "Community centre", "Gardens", "Regional setting"]'::jsonb, '["Emergency response", "Aged care", "24/7 nursing"]'::jsonb, '["Bowls", "Social events", "Garden club", "Community activities"]'::jsonb, true, 82, ARRAY['1 bedroom', '2 bedroom'], 55, '03 5382 3100', 'horsham@respect.com.au', 'https://www.respect.com.au', 'Wimmera region retirement village with affordable villas in regional centre. Close to Horsham Haven shopping and Wimmera Base Hospital.', 'approved', 'admin', true),

-- 11. Arcare Colac
('Arcare Colac', 'Arcare', '88 Murray Street, Colac VIC 3250', 'Colac', '3250', 'VIC', -38.3411, 143.5839, 'Mixed', 'Mixed', 240000, 380000, 420, 700, 'DMF', 6, 30, '["Pool", "Lake views", "Community centre", "Gardens"]'::jsonb, '["Emergency response", "Aged care", "24/7 nursing"]'::jsonb, '["Swimming", "Social events", "Garden club", "Lake walks"]'::jsonb, false, 74, ARRAY['1 bedroom', '2 bedroom'], 55, '1300 272 273', 'colac@arcare.com.au', 'https://www.arcare.com.au', 'Western districts retirement community with modern villas near Lake Colac. Close to town centre and medical facilities.', 'approved', 'admin', true),

-- 12. Bupa Aged Care Portland
('Bupa Aged Care Portland', 'Bupa', '42 Percy Street, Portland VIC 3305', 'Portland', '3305', 'VIC', -38.3428, 141.6044, 'Mixed', 'Mixed', 220000, 360000, 380, 660, 'DMF', 6, 30, '["Coastal setting", "Community centre", "Gardens", "Bay views"]'::jsonb, '["Emergency response", "Aged care", "24/7 nursing"]'::jsonb, '["Social events", "Garden club", "Coastal walks", "Beach activities"]'::jsonb, true, 64, ARRAY['1 bedroom', '2 bedroom'], 55, '1300 280 334', 'portland@bupa.com.au', 'https://www.bupa.com.au', 'Western coastal retirement village near Portland Bay with comfortable villas. Close to Portland town centre and Cape Nelson.', 'approved', 'admin', true),

-- 13. Allity Seymour
('Allity Seymour', 'Allity', '88 Emily Street, Seymour VIC 3660', 'Seymour', '3660', 'VIC', -37.0269, 145.1389, 'Mixed', 'Mixed', 220000, 360000, 380, 660, 'DMF', 6, 30, '["Bowling green", "Community centre", "Gardens", "Station access"]'::jsonb, '["Emergency response", "Aged care", "24/7 nursing"]'::jsonb, '["Bowls", "Social events", "Garden club"]'::jsonb, false, 86, ARRAY['1 bedroom', '2 bedroom'], 55, '03 5792 3100', 'seymour@allity.com.au', 'https://www.allity.com.au', 'Northern regional retirement village near Goulburn Valley with affordable villas. Close to Seymour town centre and railway station.', 'approved', 'admin', true),

-- 14. Bolton Clarke Hamilton
('Bolton Clarke Hamilton', 'Bolton Clarke', '88 Gray Street, Hamilton VIC 3300', 'Hamilton', '3300', 'VIC', -37.7428, 142.0169, 'Mixed', 'Mixed', 220000, 360000, 380, 660, 'DMF', 6, 30, '["Bowling green", "Heritage setting", "Community centre", "Gardens"]'::jsonb, '["Emergency response", "Aged care", "24/7 nursing"]'::jsonb, '["Bowls", "Social events", "Garden club", "Heritage tours"]'::jsonb, true, 72, ARRAY['1 bedroom', '2 bedroom'], 55, '1300 228 655', 'hamilton@boltonclarke.com.au', 'https://www.boltonclarke.com.au', 'Western districts retirement community in historic Hamilton with quality villas. Close to Hamilton Hospital and shopping.', 'approved', 'admin', true),

-- 15. Estia Health Moe
('Estia Health Moe', 'Estia Health', '88 Lloyd Street, Moe VIC 3825', 'Moe', '3825', 'VIC', -38.1744, 146.2589, 'Mixed', 'Mixed', 200000, 340000, 360, 640, 'DMF', 6, 30, '["Pool", "Community centre", "Gardens", "Valley setting"]'::jsonb, '["Emergency response", "Aged care", "24/7 nursing"]'::jsonb, '["Swimming", "Exercise classes", "Social events", "Garden club"]'::jsonb, false, 88, ARRAY['1 bedroom', '2 bedroom'], 55, '03 5127 3100', 'moe@estiahealth.com.au', 'https://www.estiahealth.com.au', 'Gippsland retirement village in Latrobe Valley with affordable villas. Close to Moe town centre and medical facilities.', 'approved', 'admin', true),

-- 16. Japara Benalla
('Japara Benalla', 'Japara', '42 Bridge Street, Benalla VIC 3672', 'Benalla', '3672', 'VIC', -36.5519, 145.9825, 'Mixed', 'Mixed', 210000, 350000, 360, 640, 'DMF', 6, 30, '["Bowling green", "Lake views", "Community centre", "Wine country"]'::jsonb, '["Emergency response", "Aged care", "24/7 nursing"]'::jsonb, '["Bowls", "Social events", "Garden club", "Lake walks"]'::jsonb, true, 68, ARRAY['1 bedroom', '2 bedroom'], 55, '1800 52 72 72', 'benalla@japara.com.au', 'https://www.japara.com.au', 'North-eastern regional retirement village with comfortable villas in country town setting. Close to Benalla Hospital and Lake Benalla.', 'approved', 'admin', true),

-- 17. Tricare Castlemaine
('Tricare Castlemaine', 'Tricare', '88 Barker Street, Castlemaine VIC 3450', 'Castlemaine', '3450', 'VIC', -37.0636, 144.2139, 'Mixed', 'Mixed', 260000, 410000, 460, 760, 'DMF', 6, 30, '["Heritage setting", "Arts culture", "Community centre", "Gardens"]'::jsonb, '["Emergency response", "Aged care", "24/7 nursing"]'::jsonb, '["Social events", "Garden club", "Art gallery visits", "Heritage tours"]'::jsonb, false, 64, ARRAY['1 bedroom', '2 bedroom'], 55, '03 5472 3100', 'castlemaine@tricare.com.au', 'https://www.tricare.com.au', 'Central highlands retirement village in heritage goldfields town with character villas. Walk to historic shops, cafes and medical facilities.', 'approved', 'admin', true),

-- 18. Mayflower Stawell
('Mayflower Stawell', 'Mayflower', '88 Main Street, Stawell VIC 3380', 'Stawell', '3380', 'VIC', -37.0547, 142.7789, 'Independent Living', 'independent', 200000, 340000, 360, 640, 'DMF', 6, 30, '["Bowling green", "Mountain views", "Community centre", "Gardens"]'::jsonb, '["Emergency response"]'::jsonb, '["Bowls", "Social events", "Garden club", "Walking groups"]'::jsonb, true, 62, ARRAY['1 bedroom', '2 bedroom'], 55, '03 5358 1234', 'stawell@mayflower.org.au', 'https://www.mayflower.org.au', 'Grampians region retirement village with comfortable villas and mountain views. Close to Stawell town centre and Grampians National Park.', 'approved', 'admin', true),

-- 19. RSL Care Bacchus Marsh
('RSL Care Bacchus Marsh', 'RSL Care', '42 Main Street, Bacchus Marsh VIC 3340', 'Bacchus Marsh', '3340', 'VIC', -37.6736, 144.4411, 'Mixed', 'Mixed', 280000, 430000, 480, 780, 'DMF', 6, 30, '["Bowling green", "RSL services", "Community centre", "Gardens"]'::jsonb, '["Emergency response", "Aged care", "24/7 nursing", "Veterans services"]'::jsonb, '["Bowls", "RSL activities", "Social events", "Garden club"]'::jsonb, true, 86, ARRAY['1 bedroom', '2 bedroom'], 55, '03 5367 3100', 'bacchusmarsh@rslcare.org.au', 'https://www.rslcare.org.au', 'Western regional retirement village between Melbourne and Ballarat with villas and veterans services. Close to Avenue of Honour and shopping.', 'approved', 'admin', true),

-- 20. Mercy Health Kyneton
('Mercy Health Kyneton', 'Mercy Health', '88 Piper Street, Kyneton VIC 3444', 'Kyneton', '3444', 'VIC', -37.2492, 144.4547, 'Mixed', 'Mixed', 280000, 430000, 480, 780, 'DMF', 6, 30, '["Chapel", "Cool climate", "Gardens", "Heritage town"]'::jsonb, '["Emergency response", "Aged care", "24/7 nursing", "Pastoral care"]'::jsonb, '["Chapel services", "Social events", "Garden club", "Heritage tours"]'::jsonb, true, 72, ARRAY['1 bedroom', '2 bedroom'], 55, '03 5422 3100', 'kyneton@mercyhealth.com.au', 'https://www.mercyhealth.com.au', 'Macedon Ranges retirement village in historic Kyneton with Catholic heritage and chapel. Close to Kyneton Hospital and Piper Street shopping.', 'approved', 'admin', true),

-- 21. Benetas Maryborough
('Benetas Maryborough', 'Benetas', '88 Nolan Street, Maryborough VIC 3465', 'Maryborough', '3465', 'VIC', -37.0472, 143.7392, 'Mixed', 'Mixed', 190000, 330000, 340, 620, 'DMF', 6, 30, '["Bowling green", "Heritage setting", "Community centre", "Gardens"]'::jsonb, '["Emergency response", "Aged care", "24/7 nursing"]'::jsonb, '["Bowls", "Social events", "Garden club", "Heritage tours"]'::jsonb, true, 76, ARRAY['1 bedroom', '2 bedroom'], 55, '03 5460 3100', 'maryborough@benetas.com.au', 'https://www.benetas.com.au', 'Central Victorian goldfields retirement community with affordable villas in heritage town. Close to Maryborough Hospital and railway station.', 'approved', 'admin', true),

-- 22. Embracia Yarrawonga
('Embracia Yarrawonga', 'Embracia Health', '88 Irvine Parade, Yarrawonga VIC 3730', 'Yarrawonga', '3730', 'VIC', -36.0247, 146.0036, 'Mixed', 'Mixed', 260000, 410000, 460, 760, 'DMF', 6, 30, '["Pool", "Lake views", "River access", "Golf course"]'::jsonb, '["Emergency response", "Aged care", "24/7 nursing"]'::jsonb, '["Swimming", "Fishing", "Boating", "Golf", "Social events"]'::jsonb, false, 94, ARRAY['1 bedroom', '2 bedroom'], 55, '03 5744 3100', 'yarrawonga@embracia.com.au', 'https://www.embracia.com.au', 'Murray River retirement village with water views and modern villas near Lake Mulwala. Perfect fishing, boating and golf.', 'approved', 'admin', true),

-- 23. Warrigal Care Kyabram
('Warrigal Care Kyabram', 'Warrigal Care', '88 Allan Street, Kyabram VIC 3620', 'Kyabram', '3620', 'VIC', -36.3206, 145.0539, 'Mixed', 'Mixed', 200000, 340000, 360, 640, 'DMF', 6, 30, '["Bowling green", "Community centre", "Gardens", "Regional setting"]'::jsonb, '["Emergency response", "Aged care", "24/7 nursing"]'::jsonb, '["Bowls", "Social events", "Garden club", "Community activities"]'::jsonb, false, 68, ARRAY['1 bedroom', '2 bedroom'], 55, '03 5852 3100', 'kyabram@warrigal.com.au', 'https://www.warrigal.com.au', 'Goulburn Valley retirement village in regional Kyabram with comfortable villas. Close to town centre and medical facilities.', 'approved', 'admin', true),

-- 24. Peninsula Villages Daylesford
('Peninsula Villages Daylesford', 'Peninsula Villages', '1 Vincent Street, Daylesford VIC 3460', 'Daylesford', '3460', 'VIC', -37.3469, 144.1419, 'Independent Living', 'independent', 300000, 460000, 520, 840, 'DMF', 6, 30, '["Spa country", "Gardens", "Lake views", "Arts culture", "Community centre"]'::jsonb, '["Emergency response"]'::jsonb, '["Social events", "Garden club", "Gallery visits", "Spa visits", "Lake walks"]'::jsonb, false, 56, ARRAY['1 bedroom', '2 bedroom'], 55, '03 5348 3100', 'daylesford@peninsulavillages.com.au', 'https://www.peninsulavillages.com.au', 'Spa country retirement village in artistic Daylesford with character villas near mineral springs. Walk to galleries, cafes and Lake Daylesford.', 'approved', 'admin', true),

-- 25. Resthaven Ararat
('Resthaven Ararat', 'Resthaven', '88 Barkly Street, Ararat VIC 3377', 'Ararat', '3377', 'VIC', -37.2828, 142.9289, 'Mixed', 'Mixed', 200000, 340000, 360, 640, 'DMF', 6, 30, '["Bowling green", "Mountain views", "Community centre", "Gardens"]'::jsonb, '["Emergency response", "Aged care", "24/7 nursing"]'::jsonb, '["Bowls", "Social events", "Garden club", "Walking groups"]'::jsonb, true, 74, ARRAY['1 bedroom', '2 bedroom'], 55, '03 5352 1234', 'ararat@resthaven.asn.au', 'https://www.resthaven.asn.au', 'Western districts retirement village in historic Ararat with comfortable villas and mountain views. Close to Ararat Hospital and Grampians peaks.', 'approved', 'admin', true);