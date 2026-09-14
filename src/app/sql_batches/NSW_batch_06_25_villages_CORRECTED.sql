-- NSW Batch 06: 25 Premium Retirement Villages (CORRECTED)
-- Geographic Focus: Sydney Metro (North Shore, Eastern Suburbs, Hills District)
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

-- 1. Aveo Norwest
('Aveo Norwest', 'Aveo Group', '8 Norbrik Drive, Bella Vista NSW 2153', 'Bella Vista', '2153', 'NSW', -33.7363, 150.9541, 'Independent Living', 'independent', 450000, 750000, 720, 1120, 'DMF', 6, 30, '["Pool", "Gym", "Cinema", "Library", "Bowling green", "Community centre", "Gardens", "Cafe"]'::jsonb, '["Emergency response"]'::jsonb, '["Swimming", "Movies", "Bowls", "Exercise classes", "Social events"]'::jsonb, false, 156, ARRAY['1 bedroom', '2 bedroom', '3 bedroom'], 55, '1300 283 000', 'norwest@aveo.com.au', 'https://www.aveo.com.au', 'Beautifully designed independent living community in thriving Norwest precinct with modern apartments. Close to Westfield shopping, restaurants and medical facilities.', 'approved', 'admin', true),

-- 2. Lendlease The Grange Killara
('Lendlease The Grange Killara', 'Lendlease', '555 Pacific Highway, Killara NSW 2071', 'Killara', '2071', 'NSW', -33.7717, 151.1633, 'Mixed', 'Mixed', 750000, 1200000, 1000, 1520, 'DMF', 6, 30, '["Pool", "Gym", "Medical centre", "Library", "Bowling green", "Community centre", "Gardens", "Restaurant", "Hair salon"]'::jsonb, '["Emergency response", "Aged care", "24/7 nursing", "Medical centre"]'::jsonb, '["Swimming", "Bowls", "Exercise classes", "Social events", "Fine dining"]'::jsonb, false, 142, ARRAY['2 bedroom', '3 bedroom'], 55, '1300 326 033', 'killara@lendlease.com', 'https://www.lendlease.com/au/retirement', 'Prestigious retirement village on Sydney Upper North Shore with spacious villas and apartments in 4.5 hectares. Minutes to Killara village and station.', 'approved', 'admin', true),

-- 3. Stockland Willowdale
('Stockland Willowdale', 'Stockland', '1 Willowdale Drive, Denham Court NSW 2565', 'Denham Court', '2565', 'NSW', -33.9947, 150.8350, 'Independent Living', 'independent', 380000, 580000, 600, 880, 'DMF', 6, 30, '["Pool", "Gym", "Cinema", "Workshop", "Arts and crafts room", "Community centre", "Gardens", "BBQ areas"]'::jsonb, '["Emergency response"]'::jsonb, '["Swimming", "Movies", "Exercise classes", "Crafts", "Workshop activities", "Social events"]'::jsonb, false, 284, ARRAY['2 bedroom', '3 bedroom'], 55, '1800 550 550', 'willowdale@stockland.com.au', 'https://www.stockland.com.au/retirement', 'Award-winning retirement community in Denham Court with contemporary homes. Close to Liverpool CBD and major shopping centres.', 'approved', 'admin', true),

-- 4. Anglicare Newmarch House
('Anglicare Newmarch House', 'Anglicare', '216-238 Caddens Road, Caddens NSW 2747', 'Caddens', '2747', 'NSW', -33.7733, 150.7253, 'Mixed', 'Mixed', 280000, 420000, 480, 800, 'DMF', 6, 30, '["Chapel", "Gardens", "Community centre", "Library", "BBQ areas"]'::jsonb, '["Emergency response", "Aged care", "24/7 nursing"]'::jsonb, '["Chapel services", "Social events", "Garden club"]'::jsonb, true, 98, ARRAY['1 bedroom', '2 bedroom'], 55, '02 4731 5100', 'newmarch@anglicare.org.au', 'https://www.anglicare.org.au', 'Established retirement village in Caddens with comprehensive care options. Beautiful gardens, community activities and chapel services.', 'approved', 'admin', true),

-- 5. Opal Aged Care North Ryde
('Opal Aged Care North Ryde', 'Opal Aged Care', '11 Wicks Road, North Ryde NSW 2113', 'North Ryde', '2113', 'NSW', -33.7972, 151.1187, 'Mixed', 'Mixed', 520000, 780000, 800, 1200, 'DMF', 6, 30, '["Pool", "Gym", "Cinema", "Cafe", "Library", "Gardens"]'::jsonb, '["Emergency response", "Aged care", "24/7 nursing"]'::jsonb, '["Swimming", "Movies", "Exercise classes", "Social events"]'::jsonb, false, 118, ARRAY['1 bedroom', '2 bedroom'], 55, '1300 672 524', 'northryde@opalaged.care', 'https://www.opalagedcare.com.au', 'Modern retirement community with premium independent living and aged care. Convenient location near Macquarie Centre.', 'approved', 'admin', true),

-- 6. IRT Tarrawanna
('IRT Tarrawanna', 'IRT Group', '2-10 Birkdale Place, Tarrawanna NSW 2518', 'Tarrawanna', '2518', 'NSW', -34.3633, 150.8756, 'Mixed', 'Mixed', 320000, 480000, 560, 840, 'DMF', 6, 30, '["Bowling green", "Community centre", "Gardens", "BBQ areas", "Library"]'::jsonb, '["Emergency response", "Aged care", "24/7 nursing"]'::jsonb, '["Bowls", "Social events", "Garden club", "Beach walks"]'::jsonb, false, 86, ARRAY['1 bedroom', '2 bedroom'], 55, '1300 157 677', 'tarrawanna@irt.org.au', 'https://www.irt.org.au', 'Coastal retirement living near Wollongong beaches with modern villas. Close to shopping and medical facilities.', 'approved', 'admin', true),

-- 7. Presbyterian Aged Care Ashfield
('Presbyterian Aged Care Ashfield', 'Presbyterian Aged Care NSW & ACT', '22-32 Holden Street, Ashfield NSW 2131', 'Ashfield', '2131', 'NSW', -33.8889, 151.1253, 'Mixed', 'Mixed', 450000, 650000, 720, 1040, 'DMF', 6, 30, '["Gardens", "Community centre", "Library", "Chapel"]'::jsonb, '["Emergency response", "Aged care", "24/7 nursing"]'::jsonb, '["Chapel services", "Social events", "Garden club"]'::jsonb, true, 74, ARRAY['1 bedroom', '2 bedroom'], 55, '02 9716 1300', 'ashfield@pac.org.au', 'https://www.pac.org.au', 'Convenient inner-west retirement village with independent living and aged care. Located in leafy Ashfield near transport and shops.', 'approved', 'admin', true),

-- 8. Uniting Lindfield
('Uniting Lindfield', 'Uniting', '7-9 Shinfield Avenue, Lindfield NSW 2070', 'Lindfield', '2070', 'NSW', -33.7811, 151.1667, 'Independent Living', 'independent', 580000, 920000, 880, 1360, 'DMF', 6, 30, '["Pool", "Gym", "Cinema", "Library", "Concierge", "Gardens", "Community centre", "Cafe"]'::jsonb, '["Emergency response", "Concierge"]'::jsonb, '["Swimming", "Movies", "Exercise classes", "Social events"]'::jsonb, false, 132, ARRAY['1 bedroom', '2 bedroom'], 55, '1300 864 846', 'lindfield@uniting.org', 'https://www.uniting.org', 'Premium retirement community on Sydney Upper North Shore with contemporary apartments. Walking distance to Lindfield village.', 'approved', 'admin', true),

-- 9. Ingenia Lifestyle Soldiers Point
('Ingenia Lifestyle Soldiers Point', 'Ingenia Communities', '1 Koala Place, Soldiers Point NSW 2317', 'Soldiers Point', '2317', 'NSW', -32.7153, 152.0500, 'Independent Living', 'independent', 180000, 350000, 320, 560, 'Site Fees', 0, 0, '["Pool", "Bowling green", "Community centre", "Workshop", "BBQ areas", "Gardens"]'::jsonb, '["Emergency response"]'::jsonb, '["Swimming", "Bowls", "Social events", "Workshop activities"]'::jsonb, true, 196, ARRAY['2 bedroom', '3 bedroom'], 50, '02 4919 0000', 'soldierspoint@ingeniacommunities.com.au', 'https://www.ingeniacommunities.com.au', 'Over-50s lakeside resort community at beautiful Port Stephens with modern manufactured homes. Pristine beaches nearby.', 'approved', 'admin', true),

-- 10. Baptistcare Aminya
('Baptistcare Aminya', 'BaptistCare', '142 Old Northern Road, Baulkham Hills NSW 2153', 'Baulkham Hills', '2153', 'NSW', -33.7597, 150.9950, 'Independent Living', 'independent', 380000, 520000, 640, 920, 'DMF', 6, 30, '["Chapel", "Gardens", "Community centre", "Library", "BBQ areas"]'::jsonb, '["Emergency response"]'::jsonb, '["Chapel services", "Social events", "Garden club"]'::jsonb, true, 88, ARRAY['1 bedroom', '2 bedroom'], 55, '02 9659 3333', 'aminya@baptistcare.org.au', 'https://www.baptistcare.org.au', 'Peaceful retirement village in Baulkham Hills with spacious villas. Close to Castle Towers shopping centre and medical facilities.', 'approved', 'admin', true),

-- 11. Arcare North Shore
('Arcare North Shore', 'Arcare', '45 Christie Street, St Leonards NSW 2065', 'St Leonards', '2065', 'NSW', -33.8226, 151.1943, 'Mixed', 'Mixed', 680000, 980000, 1040, 1520, 'DMF', 6, 30, '["Rooftop terrace", "Gym", "Cinema", "Cafe", "Concierge", "Library"]'::jsonb, '["Emergency response", "Aged care", "24/7 nursing", "Concierge"]'::jsonb, '["Movies", "Exercise classes", "Social events", "Cafe dining"]'::jsonb, false, 94, ARRAY['1 bedroom', '2 bedroom'], 55, '1300 272 273', 'northshore@arcare.com.au', 'https://www.arcare.com.au', 'Boutique retirement community in St Leonards with stunning harbour views. Walk to station and Royal North Shore Hospital.', 'approved', 'admin', true),

-- 12. Regis Aged Care Dural
('Regis Aged Care Dural', 'Regis Aged Care', '634 Old Northern Road, Dural NSW 2158', 'Dural', '2158', 'NSW', -33.6867, 151.0306, 'Mixed', 'Mixed', 420000, 620000, 680, 1000, 'DMF', 6, 30, '["Pool", "Gardens", "Community centre", "Library", "BBQ areas"]'::jsonb, '["Emergency response", "Aged care", "24/7 nursing"]'::jsonb, '["Swimming", "Social events", "Garden club", "Nature walks"]'::jsonb, false, 102, ARRAY['1 bedroom', '2 bedroom'], 55, '02 9651 4400', 'dural@regis.com.au', 'https://www.regis.com.au', 'Tranquil Hills District retirement village set among 5 acres of beautiful gardens. Peaceful semi-rural setting.', 'approved', 'admin', true),

-- 13. Respect Aged Care Maroubra
('Respect Aged Care Maroubra', 'Respect', '88 Bunnerong Road, Maroubra NSW 2035', 'Maroubra', '2035', 'NSW', -33.9465, 151.2488, 'Mixed', 'Mixed', 520000, 740000, 800, 1160, 'DMF', 6, 30, '["Pool", "Community centre", "Gardens", "Library"]'::jsonb, '["Emergency response", "Aged care", "24/7 nursing"]'::jsonb, '["Swimming", "Beach walks", "Social events"]'::jsonb, false, 76, ARRAY['1 bedroom', '2 bedroom'], 55, '02 9661 5400', 'maroubra@respect.com.au', 'https://www.respect.com.au', 'Eastern suburbs retirement living minutes from Maroubra Beach with contemporary apartments. Active social program with beach walks.', 'approved', 'admin', true),

-- 14. Southern Cross Care Nagle
('Southern Cross Care Nagle', 'Southern Cross Care', '24 Qualita Street, Blacktown NSW 2148', 'Blacktown', '2148', 'NSW', -33.7686, 150.9069, 'Mixed', 'Mixed', 300000, 450000, 520, 800, 'DMF', 6, 30, '["Bowling green", "Chapel", "Community centre", "Gardens", "Library"]'::jsonb, '["Emergency response", "Aged care", "24/7 nursing"]'::jsonb, '["Bowls", "Chapel services", "Social events", "Garden club"]'::jsonb, true, 112, ARRAY['1 bedroom', '2 bedroom'], 55, '02 8757 3100', 'nagle@sccliving.org.au', 'https://www.sccliving.org.au', 'Established Blacktown retirement village with supportive community atmosphere. Close to Blacktown Hospital and Westpoint shopping.', 'approved', 'admin', true),

-- 15. Adventist Retirement Plus Cooranbong
('Adventist Retirement Plus Cooranbong', 'Adventist Retirement Plus', '175 Avondale Road, Cooranbong NSW 2265', 'Cooranbong', '2265', 'NSW', -33.0797, 151.4500, 'Independent Living', 'independent', 280000, 420000, 480, 760, 'DMF', 6, 30, '["Pool", "Community centre", "Gardens", "Walking trails", "BBQ areas"]'::jsonb, '["Emergency response"]'::jsonb, '["Swimming", "Walking", "Social events", "Health programs"]'::jsonb, false, 148, ARRAY['1 bedroom', '2 bedroom', '3 bedroom'], 55, '02 4977 2200', 'cooranbong@adventistretirementplus.org.au', 'https://www.retirementplus.com.au', 'Lake Macquarie retirement village near Avondale University in peaceful surroundings. Active lifestyle with emphasis on health and wellbeing.', 'approved', 'admin', true),

-- 16. Summerset Manly Waters
('Summerset Manly Waters', 'Summerset', '88 North Steyne, Manly NSW 2095', 'Manly', '2095', 'NSW', -33.7974, 151.2869, 'Independent Living', 'independent', 780000, 1150000, 1120, 1640, 'DMF', 6, 30, '["Pool", "Gym", "Cinema", "Dining room", "Concierge", "Rooftop terrace", "Library"]'::jsonb, '["Emergency response", "Concierge"]'::jsonb, '["Swimming", "Movies", "Exercise classes", "Fine dining", "Social events"]'::jsonb, false, 68, ARRAY['1 bedroom', '2 bedroom'], 55, '02 9977 4500', 'manlywaters@summerset.net.au', 'https://www.summerset.com.au', 'Premium Northern Beaches retirement living with water views and luxury apartments. Walk to Manly Wharf and beaches.', 'approved', 'admin', true),

-- 17. Estia Health Blakehurst
('Estia Health Blakehurst', 'Estia Health', '42 Flora Street, Blakehurst NSW 2221', 'Blakehurst', '2221', 'NSW', -33.9892, 151.1128, 'Mixed', 'Mixed', 460000, 640000, 720, 1040, 'DMF', 6, 30, '["Pool", "Gardens", "Community centre", "Library"]'::jsonb, '["Emergency response", "Aged care", "24/7 nursing"]'::jsonb, '["Swimming", "Exercise classes", "Social events", "Garden club"]'::jsonb, false, 84, ARRAY['1 bedroom', '2 bedroom'], 55, '02 9546 4200', 'blakehurst@estiahealth.com.au', 'https://www.estiahealth.com.au', 'Modern South Sydney retirement community with independent units and aged care. Close to Westfield Hurstville and medical facilities.', 'approved', 'admin', true),

-- 18. Bupa Aged Care Maroubra
('Bupa Aged Care Maroubra', 'Bupa', '756 Anzac Parade, Maroubra NSW 2035', 'Maroubra', '2035', 'NSW', -33.9465, 151.2488, 'Mixed', 'Mixed', 540000, 760000, 840, 1200, 'DMF', 6, 30, '["Pool", "Gym", "Cinema", "Library", "Gardens"]'::jsonb, '["Emergency response", "Aged care", "24/7 nursing"]'::jsonb, '["Swimming", "Movies", "Exercise classes", "Beach walks", "Social events"]'::jsonb, false, 92, ARRAY['1 bedroom', '2 bedroom'], 55, '1300 280 334', 'maroubra@bupa.com.au', 'https://www.bupa.com.au', 'Beachside retirement living in Sydney East with independent living apartments. Short walk to Maroubra Beach, cafes and shops.', 'approved', 'admin', true),

-- 19. Allity Albury Wodonga
('Allity Albury Wodonga', 'Allity', '1186 Mate Street, Lavington NSW 2641', 'Lavington', '2641', 'NSW', -36.0428, 146.9342, 'Mixed', 'Mixed', 220000, 380000, 400, 680, 'DMF', 6, 30, '["Bowling green", "Community centre", "Gardens", "BBQ areas", "Library"]'::jsonb, '["Emergency response", "Aged care", "24/7 nursing"]'::jsonb, '["Bowls", "Social events", "Garden club", "Community activities"]'::jsonb, true, 94, ARRAY['1 bedroom', '2 bedroom'], 55, '02 6025 7100', 'alburywodonga@allity.com.au', 'https://www.allity.com.au', 'Border region retirement village offering affordable independent living and aged care. Friendly country atmosphere with active social program.', 'approved', 'admin', true),

-- 20. Bolton Clarke Macquarie Park
('Bolton Clarke Macquarie Park', 'Bolton Clarke', '12 Waterloo Road, Macquarie Park NSW 2113', 'Macquarie Park', '2113', 'NSW', -33.7789, 151.1185, 'Mixed', 'Mixed', 560000, 820000, 880, 1280, 'DMF', 6, 30, '["Pool", "Gym", "Cinema", "Cafe", "Library", "Gardens"]'::jsonb, '["Emergency response", "Aged care", "24/7 nursing"]'::jsonb, '["Swimming", "Movies", "Exercise classes", "Social events"]'::jsonb, false, 126, ARRAY['1 bedroom', '2 bedroom'], 55, '1300 228 655', 'macquariepark@boltonclarke.com.au', 'https://www.boltonclarke.com.au', 'Contemporary retirement village in thriving Macquarie Park precinct with modern apartments. Walk to Macquarie University and Centre.', 'approved', 'admin', true),

-- 21. Villa Maria Catholic Homes Punchbowl
('Villa Maria Catholic Homes Punchbowl', 'Villa Maria Catholic Homes', '10-12 Winifred Street, Punchbowl NSW 2196', 'Punchbowl', '2196', 'NSW', -33.9294, 151.0517, 'Mixed', 'Mixed', 340000, 490000, 560, 840, 'DMF', 6, 30, '["Chapel", "Gardens", "Community centre", "Library"]'::jsonb, '["Emergency response", "Aged care", "24/7 nursing", "Pastoral care"]'::jsonb, '["Chapel services", "Social events", "Garden club"]'::jsonb, true, 78, ARRAY['1 bedroom', '2 bedroom'], 55, '02 9740 0111', 'punchbowl@vmch.com.au', 'https://www.vmch.com.au', 'Established inner-west retirement community with chapel and strong Catholic ethos. Close to local shops and medical centre.', 'approved', 'admin', true),

-- 22. Resthaven Riverside
('Resthaven Riverside', 'Resthaven', '88 River Road, Emu Plains NSW 2750', 'Emu Plains', '2750', 'NSW', -33.7522, 150.6667, 'Independent Living', 'independent', 340000, 480000, 600, 880, 'DMF', 6, 30, '["Bowling green", "Community centre", "River views", "Gardens", "BBQ areas"]'::jsonb, '["Emergency response"]'::jsonb, '["Bowls", "Social events", "Garden club", "River walks"]'::jsonb, false, 116, ARRAY['1 bedroom', '2 bedroom', '3 bedroom'], 55, '02 4735 2200', 'riverside@resthaven.asn.au', 'https://www.resthaven.asn.au', 'Modern Penrith retirement village along Nepean River with spacious villas. Easy access to Penrith CBD and Panthers precinct.', 'approved', 'admin', true),

-- 23. Japara Retravill House
('Japara Retravill House', 'Japara', '14-16 Carrington Road, Castle Hill NSW 2154', 'Castle Hill', '2154', 'NSW', -33.7333, 151.0022, 'Mixed', 'Mixed', 420000, 620000, 680, 1000, 'DMF', 6, 30, '["Gardens", "Community centre", "Library", "Chapel"]'::jsonb, '["Emergency response", "Aged care", "24/7 nursing"]'::jsonb, '["Chapel services", "Social events", "Garden club"]'::jsonb, false, 88, ARRAY['1 bedroom', '2 bedroom'], 55, '1800 52 72 72', 'retravill@japara.com.au', 'https://www.japara.com.au', 'Castle Hill retirement community with independent living and aged care in landscaped gardens. Close to Castle Towers and Hills Private Hospital.', 'approved', 'admin', true),

-- 24. Tricare Elanora Heights
('Tricare Elanora Heights', 'Tricare', '45 Irambang Street, Elanora Heights NSW 2101', 'Elanora Heights', '2101', 'NSW', -33.6989, 151.2844, 'Mixed', 'Mixed', 580000, 820000, 880, 1240, 'DMF', 6, 30, '["Pool", "Community centre", "Gardens", "Lake views"]'::jsonb, '["Emergency response", "Aged care", "24/7 nursing"]'::jsonb, '["Swimming", "Social events", "Garden club", "Lake walks"]'::jsonb, false, 72, ARRAY['1 bedroom', '2 bedroom'], 55, '02 9913 9400', 'elanoraheights@tricare.com.au', 'https://www.tricare.com.au', 'Northern Beaches retirement village near Narrabeen Lake with modern villas. Peaceful coastal lifestyle.', 'approved', 'admin', true),

-- 25. Mayflower Brighton-Le-Sands
('Mayflower Brighton-Le-Sands', 'Mayflower', '14-22 Waterview Street, Carlton NSW 2218', 'Carlton', '2218', 'NSW', -33.9772, 151.1314, 'Mixed', 'Mixed', 490000, 710000, 760, 1120, 'DMF', 6, 30, '["Rooftop terrace", "Community centre", "Gardens", "Library"]'::jsonb, '["Emergency response", "Aged care", "24/7 nursing"]'::jsonb, '["Social events", "Garden club", "Beach walks"]'::jsonb, false, 96, ARRAY['1 bedroom', '2 bedroom'], 55, '02 9587 3455', 'brighton@mayflower.org.au', 'https://www.mayflower.org.au', 'Bayside retirement community minutes from Brighton Beach with contemporary apartments. Walk to cafes, restaurants and Rockdale Plaza.', 'approved', 'admin', true);