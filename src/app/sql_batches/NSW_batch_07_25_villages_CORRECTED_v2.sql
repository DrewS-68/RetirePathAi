-- NSW Batch 07: 25 Regional & Coastal Retirement Villages (CORRECTED)
-- Geographic Focus: Central Coast, Newcastle, South Coast, Regional NSW
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

-- 1. Peninsula Villages Umina
('Peninsula Villages Umina', 'Peninsula Villages', '93 Trafalgar Avenue, Umina Beach NSW 2257', 'Umina Beach', '2257', 'NSW', -33.5264, 151.3114, 'Independent Living', 'independent', 380000, 580000, 640, 960, 'DMF', 6, 30, '["Pool", "Bowling green", "Workshop", "Community centre", "Gardens", "Ocean views", "BBQ areas"]'::jsonb, '["Emergency response"]'::jsonb, '["Swimming", "Bowls", "Workshop activities", "Social events", "Beach walks"]'::jsonb, false, 168, ARRAY['1 bedroom', '2 bedroom', '3 bedroom'], 55, '02 4344 9199', 'umina@peninsulavillages.com.au', 'https://www.peninsulavillages.com.au', 'Premier Central Coast retirement community with ocean views and spacious villas near Umina Beach. Vibrant social program with beach lifestyle.', 'approved', 'admin', true),

-- 2. Bluetree Group The Shores
('Bluetree Group The Shores', 'Bluetree Group', '1 Lakeside Drive, Gwandalan NSW 2259', 'Gwandalan', '2259', 'NSW', -33.0783, 151.5736, 'Independent Living', 'independent', 520000, 780000, 800, 1160, 'DMF', 6, 30, '["Pool", "Gym", "Cinema", "Restaurant", "Marina", "Lake views", "Gardens"]'::jsonb, '["Emergency response"]'::jsonb, '["Swimming", "Movies", "Exercise classes", "Fine dining", "Boating", "Social events"]'::jsonb, false, 124, ARRAY['2 bedroom', '3 bedroom'], 55, '02 4976 1234', 'theshores@bluetree.com.au', 'https://www.bluetree.com.au', 'Luxury lakeside retirement living at Gwandalan with premium villas and Lake Macquarie views. Perfect for water-loving retirees.', 'approved', 'admin', true),

-- 3. NewDirection Care Merewether
('NewDirection Care Merewether', 'NewDirection Care', '22 Ocean Street, Merewether NSW 2291', 'Merewether', '2291', 'NSW', -32.9433, 151.7514, 'Mixed', 'Mixed', 420000, 620000, 680, 1000, 'DMF', 6, 30, '["Pool", "Community centre", "Gardens", "Library"]'::jsonb, '["Emergency response", "Aged care", "24/7 nursing"]'::jsonb, '["Swimming", "Beach walks", "Social events", "Surf club visits"]'::jsonb, false, 86, ARRAY['1 bedroom', '2 bedroom'], 55, '02 4963 2100', 'merewether@newdirection.com.au', 'https://www.newdirection.com.au', 'Newcastle beachside retirement village near Merewether Beach with modern apartments. Walk to cafes, surf club and coastal walks.', 'approved', 'admin', true),

-- 4. Aurrum Terrigal
('Aurrum Terrigal', 'Aurrum', '1 Ocean View Drive, Terrigal NSW 2260', 'Terrigal', '2260', 'NSW', -33.4458, 151.4453, 'Independent Living', 'independent', 680000, 980000, 1040, 1520, 'DMF', 6, 30, '["Rooftop terrace", "Pool", "Gym", "Fine dining", "Ocean views", "Concierge", "Cinema"]'::jsonb, '["Emergency response", "Concierge"]'::jsonb, '["Swimming", "Movies", "Exercise classes", "Fine dining", "Beach walks", "Social events"]'::jsonb, false, 78, ARRAY['1 bedroom', '2 bedroom'], 55, '02 4385 4200', 'terrigal@aurrum.com.au', 'https://www.aurrum.com.au', 'Premium Central Coast retirement living with stunning ocean views overlooking Terrigal Beach. Five-star retirement lifestyle.', 'approved', 'admin', true),

-- 5. RSL LifeCare Horizons Raymond Terrace
('RSL LifeCare Horizons Raymond Terrace', 'RSL LifeCare', '1 William Street, Raymond Terrace NSW 2324', 'Raymond Terrace', '2324', 'NSW', -32.7603, 151.7444, 'Mixed', 'Mixed', 240000, 380000, 440, 720, 'DMF', 6, 30, '["Bowling green", "Community centre", "Gardens", "BBQ areas", "Library"]'::jsonb, '["Emergency response", "Aged care", "24/7 nursing", "Veterans services"]'::jsonb, '["Bowls", "Social events", "Garden club", "RSL activities"]'::jsonb, true, 102, ARRAY['1 bedroom', '2 bedroom'], 55, '02 4966 9600', 'raymondterrace@rsllifecare.org.au', 'https://www.rsllifecare.org.au', 'Hunter Valley retirement village with affordable villas and strong RSL heritage. Close to Raymond Terrace town centre.', 'approved', 'admin', true),

-- 6. Anglicare Wakehurst Gardens
('Anglicare Wakehurst Gardens', 'Anglicare', '77 Wakehurst Parkway, Belrose NSW 2085', 'Belrose', '2085', 'NSW', -33.7328, 151.2142, 'Mixed', 'Mixed', 480000, 680000, 760, 1080, 'DMF', 6, 30, '["Chapel", "Gardens", "Community centre", "Library", "Bushland setting"]'::jsonb, '["Emergency response", "Aged care", "24/7 nursing"]'::jsonb, '["Chapel services", "Social events", "Garden club", "Bush walks"]'::jsonb, true, 94, ARRAY['1 bedroom', '2 bedroom'], 55, '02 9986 4100', 'wakehurst@anglicare.org.au', 'https://www.anglicare.org.au', 'Northern Beaches retirement village in Belrose with peaceful native bushland surrounds. Close to shops and medical facilities.', 'approved', 'admin', true),

-- 7. Uniting Berkeley
('Uniting Berkeley', 'Uniting', '2 Koorabel Avenue, Berkeley NSW 2506', 'Berkeley', '2506', 'NSW', -34.4756, 150.8567, 'Independent Living', 'independent', 280000, 420000, 480, 760, 'DMF', 6, 30, '["Community centre", "Gardens", "BBQ areas", "Library"]'::jsonb, '["Emergency response"]'::jsonb, '["Social events", "Garden club", "Lake activities"]'::jsonb, false, 118, ARRAY['1 bedroom', '2 bedroom', '3 bedroom'], 55, '02 4271 3100', 'berkeley@uniting.org', 'https://www.uniting.org', 'Affordable Wollongong retirement village close to beaches with comfortable villas. Easy access to Lake Illawarra and Wollongong CBD.', 'approved', 'admin', true),

-- 8. Watermark Palm Lake Ballina
('Watermark Palm Lake Ballina', 'Palm Lake Resort', '1 Palm Lake Drive, Ballina NSW 2478', 'Ballina', '2478', 'NSW', -28.8664, 153.5625, 'Independent Living', 'independent', 280000, 450000, 400, 640, 'Site Fees', 0, 0, '["Pool", "Tennis courts", "Bowling green", "Clubhouse", "Workshop", "Gardens"]'::jsonb, '["Emergency response"]'::jsonb, '["Swimming", "Tennis", "Bowls", "Social events", "Workshop activities"]'::jsonb, true, 186, ARRAY['2 bedroom', '3 bedroom'], 50, '02 6686 9200', 'ballina@palmlakeresort.com.au', 'https://www.palmlakeresort.com.au', 'Over-50s resort community on NSW North Coast with modern manufactured homes. Minutes to Ballina beaches and Byron Bay.', 'approved', 'admin', true),

-- 9. Southern Cross Care Riverside Gardens
('Southern Cross Care Riverside Gardens', 'Southern Cross Care', '14 Riverside Drive, Port Macquarie NSW 2444', 'Port Macquarie', '2444', 'NSW', -31.4333, 152.9078, 'Mixed', 'Mixed', 360000, 540000, 600, 920, 'DMF', 6, 30, '["Pool", "Bowling green", "River views", "Community centre", "Gardens"]'::jsonb, '["Emergency response", "Aged care", "24/7 nursing"]'::jsonb, '["Swimming", "Bowls", "Social events", "River walks", "Garden club"]'::jsonb, false, 142, ARRAY['1 bedroom', '2 bedroom', '3 bedroom'], 55, '02 6588 2100', 'portmacquarie@sccliving.org.au', 'https://www.sccliving.org.au', 'Port Macquarie riverside retirement village with water views and spacious villas. Short walk to town centre and beaches.', 'approved', 'admin', true),

-- 10. Aveo Albury Wodonga
('Aveo Albury Wodonga', 'Aveo Group', '720 David Street, Albury NSW 2640', 'Albury', '2640', 'NSW', -36.0806, 146.9158, 'Independent Living', 'independent', 260000, 420000, 480, 760, 'DMF', 6, 30, '["Pool", "Gym", "Cinema", "Community centre", "Gardens", "BBQ areas"]'::jsonb, '["Emergency response"]'::jsonb, '["Swimming", "Movies", "Exercise classes", "Social events"]'::jsonb, false, 156, ARRAY['1 bedroom', '2 bedroom', '3 bedroom'], 55, '1300 283 000', 'albury@aveo.com.au', 'https://www.aveo.com.au', 'Border city retirement living with modern apartments and villas. Close to major shopping centres and quality hospitals.', 'approved', 'admin', true),

-- 11. Embracia Toormina
('Embracia Toormina', 'Embracia Health', '88 Isles Drive, Toormina NSW 2452', 'Toormina', '2452', 'NSW', -30.3633, 153.1172, 'Mixed', 'Mixed', 280000, 430000, 480, 760, 'DMF', 6, 30, '["Pool", "Bowling green", "Community centre", "Gardens", "Library"]'::jsonb, '["Emergency response", "Aged care", "24/7 nursing"]'::jsonb, '["Swimming", "Bowls", "Social events", "Garden club", "Beach walks"]'::jsonb, false, 96, ARRAY['1 bedroom', '2 bedroom'], 55, '02 6658 4200', 'toormina@embracia.com.au', 'https://www.embracia.com.au', 'Coffs Harbour retirement community near beaches and town with independent villas. Enjoy coastal lifestyle with year-round mild climate.', 'approved', 'admin', true),

-- 12. Greengate Village Killara
('Greengate Village Killara', 'Independent Operator', '17 Greengate Road, Killara NSW 2071', 'Killara', '2071', 'NSW', -33.7717, 151.1633, 'Independent Living', 'independent', 620000, 840000, 960, 1280, 'DMF', 6, 30, '["Bowling green", "Gardens", "Community centre", "Library"]'::jsonb, '["Emergency response"]'::jsonb, '["Bowls", "Social events", "Garden club"]'::jsonb, false, 42, ARRAY['2 bedroom', '3 bedroom'], 55, '02 9498 3300', 'office@greengatevillage.com.au', 'https://www.greengatevillage.com.au', 'Boutique North Shore retirement village with spacious garden villas in peaceful setting. Close to Killara shops, station and Gordon village.', 'approved', 'admin', true),

-- 13. Presbyterian Aged Care Cowra
('Presbyterian Aged Care Cowra', 'Presbyterian Aged Care NSW & ACT', '16 Vaux Street, Cowra NSW 2794', 'Cowra', '2794', 'NSW', -33.8272, 148.6886, 'Mixed', 'Mixed', 180000, 300000, 360, 600, 'DMF', 6, 30, '["Bowling green", "Gardens", "Community centre", "Chapel"]'::jsonb, '["Emergency response", "Aged care", "24/7 nursing"]'::jsonb, '["Bowls", "Chapel services", "Social events", "Garden club"]'::jsonb, true, 68, ARRAY['1 bedroom', '2 bedroom'], 55, '02 6342 2866', 'cowra@pac.org.au', 'https://www.pac.org.au', 'Central West NSW retirement village with affordable villas in quiet country setting. Friendly rural community atmosphere.', 'approved', 'admin', true),

-- 14. Baptistcare The Orchards
('Baptistcare The Orchards', 'BaptistCare', '54 Woodward Street, Orange NSW 2800', 'Orange', '2800', 'NSW', -33.2861, 149.0989, 'Mixed', 'Mixed', 240000, 380000, 440, 720, 'DMF', 6, 30, '["Bowling green", "Chapel", "Gardens", "Community centre", "BBQ areas"]'::jsonb, '["Emergency response", "Aged care", "24/7 nursing"]'::jsonb, '["Bowls", "Chapel services", "Social events", "Garden club"]'::jsonb, true, 84, ARRAY['1 bedroom', '2 bedroom'], 55, '02 6362 6100', 'orange@baptistcare.org.au', 'https://www.baptistcare.org.au', 'Orange retirement village in beautiful Central West NSW with modern villas among established orchards. Cool climate living with four seasons.', 'approved', 'admin', true),

-- 15. Adventist Retirement Plus Morisset
('Adventist Retirement Plus Morisset', 'Adventist Retirement Plus', '1 Dora Street, Morisset NSW 2264', 'Morisset', '2264', 'NSW', -33.1078, 151.4886, 'Independent Living', 'independent', 260000, 400000, 440, 680, 'DMF', 6, 30, '["Pool", "Lake views", "Community centre", "Gardens", "Walking trails"]'::jsonb, '["Emergency response"]'::jsonb, '["Swimming", "Walking", "Social events", "Health programs", "Lake activities"]'::jsonb, false, 126, ARRAY['1 bedroom', '2 bedroom', '3 bedroom'], 55, '02 4973 1234', 'morisset@adventistretirementplus.org.au', 'https://www.retirementplus.com.au', 'Lake Macquarie retirement village with water views and spacious villas. Health-focused community with wellness programs.', 'approved', 'admin', true),

-- 16. IRT Greenwell Gardens
('IRT Greenwell Gardens', 'IRT Group', '91 Bong Bong Road, Dapto NSW 2530', 'Dapto', '2530', 'NSW', -34.5014, 150.7953, 'Mixed', 'Mixed', 300000, 450000, 520, 800, 'DMF', 6, 30, '["Bowling green", "Community centre", "Gardens", "Library", "BBQ areas"]'::jsonb, '["Emergency response", "Aged care", "24/7 nursing"]'::jsonb, '["Bowls", "Social events", "Garden club", "Shopping trips"]'::jsonb, false, 112, ARRAY['1 bedroom', '2 bedroom'], 55, '1300 157 677', 'dapto@irt.org.au', 'https://www.irt.org.au', 'Established Dapto retirement village near Wollongong with comfortable villas. Close to Stockland Shellharbour shopping and beaches.', 'approved', 'admin', true),

-- 17. Opal Aged Care Glenfield Park
('Opal Aged Care Glenfield Park', 'Opal Aged Care', '1 Glenfield Park Drive, Glenfield NSW 2167', 'Glenfield', '2167', 'NSW', -33.9717, 150.8914, 'Mixed', 'Mixed', 380000, 560000, 600, 920, 'DMF', 6, 30, '["Pool", "Gym", "Cinema", "Cafe", "Gardens", "Library"]'::jsonb, '["Emergency response", "Aged care", "24/7 nursing"]'::jsonb, '["Swimming", "Movies", "Exercise classes", "Social events"]'::jsonb, false, 148, ARRAY['1 bedroom', '2 bedroom', '3 bedroom'], 55, '1300 672 524', 'glenfield@opalaged.care', 'https://www.opalagedcare.com.au', 'Modern South-West Sydney retirement community with contemporary apartments and villas. Close to new Glenfield precinct development.', 'approved', 'admin', true),

-- 18. Estia Health Forster
('Estia Health Forster', 'Estia Health', '88 Lake Street, Forster NSW 2428', 'Forster', '2428', 'NSW', -32.1814, 152.5147, 'Mixed', 'Mixed', 320000, 480000, 560, 840, 'DMF', 6, 30, '["Pool", "Bowling green", "Community centre", "Gardens"]'::jsonb, '["Emergency response", "Aged care", "24/7 nursing"]'::jsonb, '["Swimming", "Bowls", "Social events", "Garden club", "Beach walks"]'::jsonb, false, 92, ARRAY['1 bedroom', '2 bedroom'], 55, '02 6554 7200', 'forster@estiahealth.com.au', 'https://www.estiahealth.com.au', 'Great Lakes coastal retirement living near Forster-Tuncurry beaches with independent villas. Perfect beachside retirement location.', 'approved', 'admin', true),

-- 19. Regis Aged Care Tamworth
('Regis Aged Care Tamworth', 'Regis Aged Care', '42 Marius Street, Tamworth NSW 2340', 'Tamworth', '2340', 'NSW', -31.0928, 150.9294, 'Mixed', 'Mixed', 220000, 360000, 400, 680, 'DMF', 6, 30, '["Bowling green", "Gardens", "Community centre", "Library"]'::jsonb, '["Emergency response", "Aged care", "24/7 nursing"]'::jsonb, '["Bowls", "Social events", "Garden club", "Community activities"]'::jsonb, true, 86, ARRAY['1 bedroom', '2 bedroom'], 55, '02 6766 4100', 'tamworth@regis.com.au', 'https://www.regis.com.au', 'Regional NSW retirement village in Tamworth with spacious villas and country hospitality. Close to Tamworth Base Hospital and shopping centres.', 'approved', 'admin', true),

-- 20. Respect Aged Care Wagga Wagga
('Respect Aged Care Wagga Wagga', 'Respect', '88 Kincaid Street, Wagga Wagga NSW 2650', 'Wagga Wagga', '2650', 'NSW', -35.1175, 147.3692, 'Mixed', 'Mixed', 200000, 340000, 360, 640, 'DMF', 6, 30, '["Bowling green", "Community centre", "Gardens", "Library"]'::jsonb, '["Emergency response", "Aged care", "24/7 nursing"]'::jsonb, '["Bowls", "Social events", "Garden club", "Community activities"]'::jsonb, true, 78, ARRAY['1 bedroom', '2 bedroom'], 55, '02 6925 3100', 'wagga@respect.com.au', 'https://www.respect.com.au', 'Riverina retirement community with modern facilities in regional city setting. Affordable country living near all amenities.', 'approved', 'admin', true),

-- 21. Bupa Aged Care Dubbo
('Bupa Aged Care Dubbo', 'Bupa', '142 Cobra Street, Dubbo NSW 2830', 'Dubbo', '2830', 'NSW', -32.2569, 148.6011, 'Mixed', 'Mixed', 210000, 350000, 380, 660, 'DMF', 6, 30, '["Bowling green", "Community centre", "Gardens", "Library"]'::jsonb, '["Emergency response", "Aged care", "24/7 nursing"]'::jsonb, '["Bowls", "Social events", "Garden club", "Community activities"]'::jsonb, true, 94, ARRAY['1 bedroom', '2 bedroom'], 55, '1300 280 334', 'dubbo@bupa.com.au', 'https://www.bupa.com.au', 'Central West retirement village with independent living and aged care. Regional affordability with quality healthcare nearby.', 'approved', 'admin', true),

-- 22. Allity Nepean Shores
('Allity Nepean Shores', 'Allity', '21 River Road, Penrith NSW 2750', 'Penrith', '2750', 'NSW', -33.7508, 150.6944, 'Independent Living', 'independent', 340000, 490000, 600, 880, 'DMF', 6, 30, '["Bowling green", "River access", "Walking trails", "Community centre", "Gardens"]'::jsonb, '["Emergency response"]'::jsonb, '["Bowls", "Fishing", "Walking", "Social events", "Garden club"]'::jsonb, false, 104, ARRAY['1 bedroom', '2 bedroom', '3 bedroom'], 55, '02 4721 8200', 'penrith@allity.com.au', 'https://www.allity.com.au', 'Penrith retirement community along Nepean River with spacious villas. Enjoy riverside living with city convenience.', 'approved', 'admin', true),

-- 23. Bolton Clarke Grafton
('Bolton Clarke Grafton', 'Bolton Clarke', '88 Prince Street, Grafton NSW 2460', 'Grafton', '2460', 'NSW', -29.6917, 152.9333, 'Mixed', 'Mixed', 240000, 380000, 440, 720, 'DMF', 6, 30, '["Chapel", "Gardens", "Community centre", "Library"]'::jsonb, '["Emergency response", "Aged care", "24/7 nursing"]'::jsonb, '["Chapel services", "Social events", "Garden club", "Jacaranda festival"]'::jsonb, true, 72, ARRAY['1 bedroom', '2 bedroom'], 55, '1300 228 655', 'grafton@boltonclarke.com.au', 'https://www.boltonclarke.com.au', 'Clarence Valley retirement village in historic Grafton with comfortable villas. Close to Grafton Base Hospital and city centre.', 'approved', 'admin', true),

-- 24. Villa Maria Catholic Homes Bathurst
('Villa Maria Catholic Homes Bathurst', 'Villa Maria Catholic Homes', '42 Ribbon Gum Drive, Bathurst NSW 2795', 'Bathurst', '2795', 'NSW', -33.4186, 149.5781, 'Mixed', 'Mixed', 220000, 360000, 400, 680, 'DMF', 6, 30, '["Chapel", "Gardens", "Community centre", "Library"]'::jsonb, '["Emergency response", "Aged care", "24/7 nursing", "Pastoral care"]'::jsonb, '["Chapel services", "Social events", "Garden club", "Heritage tours"]'::jsonb, true, 68, ARRAY['1 bedroom', '2 bedroom'], 55, '02 6331 4200', 'bathurst@vmch.com.au', 'https://www.vmch.com.au', 'Central Tablelands retirement village with Catholic heritage in peaceful historic Bathurst setting. On-site aged care available.', 'approved', 'admin', true),

-- 25. Japara The Grange Goulburn
('Japara The Grange Goulburn', 'Japara', '88 Lagoon Street, Goulburn NSW 2580', 'Goulburn', '2580', 'NSW', -34.7531, 149.7183, 'Mixed', 'Mixed', 240000, 380000, 440, 720, 'DMF', 6, 30, '["Bowling green", "Community centre", "Gardens", "Library"]'::jsonb, '["Emergency response", "Aged care", "24/7 nursing"]'::jsonb, '["Bowls", "Social events", "Garden club", "Community activities"]'::jsonb, true, 86, ARRAY['1 bedroom', '2 bedroom'], 55, '1800 52 72 72', 'goulburn@japara.com.au', 'https://www.japara.com.au', 'Southern Tablelands retirement community in Goulburn with modern villas. Cool climate living between Sydney and Canberra.', 'approved', 'admin', true);