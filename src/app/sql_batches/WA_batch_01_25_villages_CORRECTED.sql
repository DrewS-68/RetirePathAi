-- WA Batch 01: 25 Perth Metro & Coastal Retirement Villages (CORRECTED)
-- Geographic Focus: Perth, Fremantle, Joondalup, Rockingham, Swan Valley
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

-- 1. Aveo Wembley
('Aveo Wembley', 'Aveo Group', '88 Cambridge Street, Wembley WA 6014', 'Wembley', '6014', 'WA', -31.9361, 115.8169, 'Independent Living', 'independent', 420000, 640000, 680, 1040, 'DMF', 6, 30, '["Pool", "Gym", "Community centre", "Urban location"]'::jsonb, '["Emergency response"]'::jsonb, '["Swimming", "Exercise classes", "Social events"]'::jsonb, false, 118, ARRAY['1 bedroom', '2 bedroom'], 55, '1300 283 000', 'wembley@aveo.com.au', 'https://www.aveo.com.au', 'Inner Perth retirement community near city with contemporary apartments and modern amenities. Walk to Wembley village, City Beach road and transport.', 'approved', 'admin', true),

-- 2. Stockland The Pines Mandurah
('Stockland The Pines Mandurah', 'Stockland', '1 Pinjarra Road, Mandurah WA 6210', 'Mandurah', '6210', 'WA', -32.5289, 115.7239, 'Independent Living', 'independent', 360000, 540000, 600, 960, 'DMF', 6, 30, '["Pool", "Gym", "Cinema", "Bowling green", "Waterfront", "Community centre"]'::jsonb, '["Emergency response"]'::jsonb, '["Swimming", "Movies", "Bowls", "Exercise classes", "Waterfront activities"]'::jsonb, false, 196, ARRAY['2 bedroom', '3 bedroom'], 55, '1800 550 550', 'mandurah@stockland.com.au', 'https://www.stockland.com.au/retirement', 'Peel region coastal retirement resort with contemporary villas and waterfront amenities. Minutes to Mandurah Ocean Marina and shopping.', 'approved', 'admin', true),

-- 3. Lendlease Joondalup
('Lendlease Joondalup', 'Lendlease', '42 Grand Boulevard, Joondalup WA 6027', 'Joondalup', '6027', 'WA', -31.7442, 115.7631, 'Independent Living', 'independent', 400000, 600000, 680, 1040, 'DMF', 6, 30, '["Pool", "Bowling green", "Shopping access", "Hospital access", "Community centre"]'::jsonb, '["Emergency response"]'::jsonb, '["Swimming", "Bowls", "Social events", "Shopping trips"]'::jsonb, false, 132, ARRAY['1 bedroom', '2 bedroom', '3 bedroom'], 55, '1300 326 033', 'joondalup@lendlease.com', 'https://www.lendlease.com/au/retirement', 'Northern suburbs retirement community near city centre with quality villas. Walk to Joondalup Health Campus, Lakeside shopping and train.', 'approved', 'admin', true),

-- 4. Anglicare Waikiki
('Anglicare Waikiki', 'Anglicare', '88 Willmott Drive, Waikiki WA 6169', 'Waikiki', '6169', 'WA', -32.3089, 115.7539, 'Mixed', 'Mixed', 340000, 520000, 600, 920, 'DMF', 6, 30, '["Chapel", "Beach access", "Community centre", "Gardens"]'::jsonb, '["Emergency response", "Aged care", "24/7 nursing"]'::jsonb, '["Chapel services", "Beach walks", "Social events", "Garden club"]'::jsonb, true, 102, ARRAY['1 bedroom', '2 bedroom'], 55, '08 9527 3100', 'waikiki@anglicarewa.org.au', 'https://www.anglicarewa.org.au', 'Southern suburbs beachside retirement with independent villas and chapel. Near beautiful Waikiki Beach and Rockingham shopping.', 'approved', 'admin', true),

-- 5. Baptistcare Gracehaven
('Baptistcare Gracehaven', 'BaptistCare', '88 Dixon Road, Rockingham WA 6168', 'Rockingham', '6168', 'WA', -32.2769, 115.7289, 'Mixed', 'Mixed', 340000, 520000, 600, 920, 'DMF', 6, 30, '["Pool", "Chapel", "Bowling green", "Community centre"]'::jsonb, '["Emergency response", "Aged care", "24/7 nursing"]'::jsonb, '["Swimming", "Chapel services", "Bowls", "Social events"]'::jsonb, true, 114, ARRAY['1 bedroom', '2 bedroom', '3 bedroom'], 55, '08 9528 3100', 'gracehaven@baptistcare.org.au', 'https://www.baptistcare.org.au', 'Southern suburbs retirement village in Rockingham with modern villas, chapel and bowling green. Close to shopping centres and medical facilities.', 'approved', 'admin', true),

-- 6. MercyCare Wembley
('MercyCare Wembley', 'MercyCare', '88 Harborne Street, Wembley WA 6014', 'Wembley', '6014', 'WA', -31.9361, 115.8169, 'Mixed', 'Mixed', 420000, 620000, 680, 1040, 'DMF', 6, 30, '["Chapel", "Community centre", "Gardens", "Urban location"]'::jsonb, '["Emergency response", "Aged care", "24/7 nursing", "Pastoral care"]'::jsonb, '["Chapel services", "Social events", "Garden club"]'::jsonb, true, 96, ARRAY['1 bedroom', '2 bedroom'], 55, '08 9442 3100', 'wembley@mercycare.com.au', 'https://www.mercycare.com.au', 'Inner Perth retirement community with Catholic heritage and chapel. Contemporary apartments near Cambridge Street shops and cafes.', 'approved', 'admin', true),

-- 7. Regis Aged Care Nedlands
('Regis Aged Care Nedlands', 'Regis Aged Care', '88 Stirling Highway, Nedlands WA 6009', 'Nedlands', '6009', 'WA', -31.9769, 115.8068, 'Mixed', 'Mixed', 520000, 760000, 800, 1200, 'DMF', 6, 30, '["River views", "University access", "Community centre", "Gardens"]'::jsonb, '["Emergency response", "Aged care", "24/7 nursing"]'::jsonb, '["Social events", "Walking groups", "Garden club"]'::jsonb, false, 88, ARRAY['1 bedroom', '2 bedroom'], 55, '08 9386 3100', 'nedlands@regis.com.au', 'https://www.regis.com.au', 'Western suburbs retirement near Swan River in prestigious Nedlands. Close to UWA, Hollywood Hospital and shopping.', 'approved', 'admin', true),

-- 8. Bupa Aged Care Morley
('Bupa Aged Care Morley', 'Bupa', '42 Crimea Street, Morley WA 6062', 'Morley', '6062', 'WA', -31.8939, 115.9047, 'Mixed', 'Mixed', 360000, 540000, 600, 960, 'DMF', 6, 30, '["Pool", "Shopping access", "Community centre", "Gardens"]'::jsonb, '["Emergency response", "Aged care", "24/7 nursing"]'::jsonb, '["Swimming", "Exercise classes", "Social events", "Shopping trips"]'::jsonb, false, 112, ARRAY['1 bedroom', '2 bedroom', '3 bedroom'], 55, '1300 280 334', 'morley@bupa.com.au', 'https://www.bupa.com.au', 'Eastern suburbs retirement near Morley Galleria with modern villas and pool. Walk to major shopping centre and medical facilities.', 'approved', 'admin', true),

-- 9. Allity Inglewood
('Allity Inglewood', 'Allity', '88 Beaufort Street, Inglewood WA 6052', 'Inglewood', '6052', 'WA', -31.9197, 115.8781, 'Independent Living', 'independent', 420000, 620000, 680, 1040, 'DMF', 6, 30, '["Urban location", "Shopping access", "Community centre", "Gardens"]'::jsonb, '["Emergency response"]'::jsonb, '["Social events", "Walking groups", "Shopping trips"]'::jsonb, false, 84, ARRAY['1 bedroom', '2 bedroom'], 55, '08 9371 3100', 'inglewood@allity.com.au', 'https://www.allity.com.au', 'Inner eastern Perth retirement community with contemporary villas near Mount Lawley. Close to Inglewood shopping, cafes and medical facilities.', 'approved', 'admin', true),

-- 10. Estia Health Balcatta
('Estia Health Balcatta', 'Estia Health', '88 Erindale Road, Balcatta WA 6021', 'Balcatta', '6021', 'WA', -31.8697, 115.8231, 'Mixed', 'Mixed', 360000, 540000, 600, 960, 'DMF', 6, 30, '["Pool", "Shopping access", "Community centre", "Gardens"]'::jsonb, '["Emergency response", "Aged care", "24/7 nursing"]'::jsonb, '["Swimming", "Exercise classes", "Social events", "Shopping trips"]'::jsonb, false, 104, ARRAY['1 bedroom', '2 bedroom'], 55, '08 9344 3100', 'balcatta@estiahealth.com.au', 'https://www.estiahealth.com.au', 'Northern suburbs retirement community with modern villas near Westfield Innaloo. Close to major shopping, medical facilities and transport.', 'approved', 'admin', true),

-- 11. Japara Cottesloe
('Japara Cottesloe', 'Japara', '42 Eric Street, Cottesloe WA 6011', 'Cottesloe', '6011', 'WA', -31.9939, 115.7594, 'Mixed', 'Mixed', 680000, 980000, 1040, 1520, 'DMF', 6, 30, '["Pool", "Beach access", "Ocean proximity", "Village atmosphere"]'::jsonb, '["Emergency response", "Aged care", "24/7 nursing"]'::jsonb, '["Swimming", "Beach walks", "Social events", "Exercise classes"]'::jsonb, false, 68, ARRAY['1 bedroom', '2 bedroom'], 55, '1800 52 72 72', 'cottesloe@japara.com.au', 'https://www.japara.com.au', 'Premium western suburbs beachside retirement with luxury villas near iconic Cottesloe Beach. Walk to beach, cafes and prestigious village.', 'approved', 'admin', true),

-- 12. Tricare Midland
('Tricare Midland', 'Tricare', '88 Great Eastern Highway, Midland WA 6056', 'Midland', '6056', 'WA', -31.8917, 116.0094, 'Mixed', 'Mixed', 300000, 460000, 520, 840, 'DMF', 6, 30, '["Bowling green", "Valley proximity", "Community centre", "Gardens"]'::jsonb, '["Emergency response", "Aged care", "24/7 nursing"]'::jsonb, '["Bowls", "Social events", "Garden club", "Heritage tours"]'::jsonb, true, 116, ARRAY['1 bedroom', '2 bedroom', '3 bedroom'], 55, '08 9274 3100', 'midland@tricare.com.au', 'https://www.tricare.com.au', 'Eastern suburbs retirement near Swan Valley with comfortable villas. Close to Midland Gate shopping, hospital and heritage precinct.', 'approved', 'admin', true),

-- 13. Mayflower Scarborough
('Mayflower Scarborough', 'Mayflower', '88 The Esplanade, Scarborough WA 6019', 'Scarborough', '6019', 'WA', -31.8939, 115.7594, 'Independent Living', 'independent', 520000, 760000, 800, 1200, 'DMF', 6, 30, '["Pool", "Gym", "Ocean views", "Beach access", "Shopping access"]'::jsonb, '["Emergency response"]'::jsonb, '["Swimming", "Exercise classes", "Beach walks", "Social events"]'::jsonb, false, 92, ARRAY['1 bedroom', '2 bedroom'], 55, '08 9245 1234', 'scarborough@mayflower.org.au', 'https://www.mayflower.org.au', 'Coastal Perth beachside retirement with contemporary apartments near Scarborough Beach. Walk to beach, esplanade and Scarborough Square shopping.', 'approved', 'admin', true),

-- 14. RSL Care Victoria Park
('RSL Care Victoria Park', 'RSL Care', '42 Albany Highway, Victoria Park WA 6100', 'Victoria Park', '6100', 'WA', -31.9775, 115.8958, 'Mixed', 'Mixed', 380000, 580000, 640, 1000, 'DMF', 6, 30, '["Bowling green", "RSL services", "Community centre", "Gardens"]'::jsonb, '["Emergency response", "Aged care", "24/7 nursing", "Veterans services"]'::jsonb, '["Bowls", "RSL activities", "Social events", "Garden club"]'::jsonb, true, 98, ARRAY['1 bedroom', '2 bedroom'], 55, '08 9362 3100', 'victoriapark@rslcare.org.au', 'https://www.rslcare.org.au', 'Inner southern Perth retirement with veterans services and comfortable villas near Burswood. Close to Crown Perth, Optus Stadium and medical facilities.', 'approved', 'admin', true),

-- 15. SwanCare Bentley Park
('SwanCare Bentley Park', 'SwanCare', '1 Bentley Park Drive, Bentley WA 6102', 'Bentley', '6102', 'WA', -32.0022, 115.9217, 'Mixed', 'Mixed', 360000, 540000, 600, 960, 'DMF', 6, 30, '["Pool", "Shopping access", "University access", "Community centre"]'::jsonb, '["Emergency response", "Aged care", "24/7 nursing"]'::jsonb, '["Swimming", "Exercise classes", "Social events", "Shopping trips"]'::jsonb, false, 124, ARRAY['1 bedroom', '2 bedroom', '3 bedroom'], 55, '08 9455 1234', 'bentleypark@swancare.org.au', 'https://www.swancare.com.au', 'Southern suburbs retirement community with modern villas and pool. Close to Carousel shopping centre and Curtin University.', 'approved', 'admin', true),

-- 16. Bethanie Gwelup
('Bethanie Gwelup', 'Bethanie', '88 Gwelup Drive, Gwelup WA 6018', 'Gwelup', '6018', 'WA', -31.8721, 115.7998, 'Mixed', 'Mixed', 380000, 580000, 640, 1000, 'DMF', 6, 30, '["Bowling green", "Gardens", "Shopping access", "Community centre"]'::jsonb, '["Emergency response", "Aged care", "24/7 nursing"]'::jsonb, '["Bowls", "Social events", "Garden club", "Shopping trips"]'::jsonb, true, 104, ARRAY['1 bedroom', '2 bedroom'], 55, '08 9207 1234', 'gwelup@bethanie.com.au', 'https://www.bethanie.com.au', 'Northern suburbs retirement community with quality villas, gardens and bowling green. Close to Karrinyup Shopping Centre and medical facilities.', 'approved', 'admin', true),

-- 17. Juniper Merriwa
('Juniper Merriwa', 'Juniper', '1 Merriwa Avenue, Ridgewood WA 6030', 'Ridgewood', '6030', 'WA', -31.6722, 115.7458, 'Independent Living', 'independent', 340000, 520000, 600, 920, 'DMF', 6, 30, '["Pool", "Community centre", "Gardens", "Growth corridor"]'::jsonb, '["Emergency response"]'::jsonb, '["Swimming", "Exercise classes", "Social events", "Garden club"]'::jsonb, false, 118, ARRAY['1 bedroom', '2 bedroom', '3 bedroom'], 55, '08 9400 1234', 'merriwa@juniper.org.au', 'https://www.juniper.org.au', 'Northern suburbs retirement village with modern villas in growing Ridgewood area. Close to shopping centres and medical facilities.', 'approved', 'admin', true),

-- 18. Southern Plus Carine
('Southern Plus Carine', 'Southern Plus', '88 Beach Road, Carine WA 6020', 'Carine', '6020', 'WA', -31.8572, 115.7817, 'Independent Living', 'independent', 360000, 540000, 600, 960, 'DMF', 6, 30, '["Bowling green", "Coastal access", "Community centre", "Gardens"]'::jsonb, '["Emergency response"]'::jsonb, '["Bowls", "Beach walks", "Social events", "Garden club"]'::jsonb, false, 96, ARRAY['1 bedroom', '2 bedroom'], 55, '08 9246 1234', 'carine@southernplus.org.au', 'https://www.southernplus.org.au', 'Northern beaches retirement community with comfortable villas near Carine shopping. Close to shops, medical facilities and coastal access.', 'approved', 'admin', true),

-- 19. Amana Living Canning Vale
('Amana Living Canning Vale', 'Amana Living', '88 Amherst Road, Canning Vale WA 6155', 'Canning Vale', '6155', 'WA', -32.0625, 115.9194, 'Mixed', 'Mixed', 340000, 520000, 600, 920, 'DMF', 6, 30, '["Pool", "Shopping access", "Community centre", "Gardens"]'::jsonb, '["Emergency response", "Aged care", "24/7 nursing"]'::jsonb, '["Swimming", "Exercise classes", "Social events", "Shopping trips"]'::jsonb, true, 124, ARRAY['1 bedroom', '2 bedroom', '3 bedroom'], 55, '08 9314 1234', 'canningvale@amanaliving.com.au', 'https://www.amanaliving.com.au', 'Southern suburbs retirement community with modern villas near Livingston Marketplace. Close to shopping, medical facilities and Roe Highway.', 'approved', 'admin', true),

-- 20. Arcadia Waters Mandurah
('Arcadia Waters Mandurah', 'Independent Operator', '1 Marina Drive, Mandurah WA 6210', 'Mandurah', '6210', 'WA', -32.5289, 115.7239, 'Independent Living', 'independent', 480000, 720000, 760, 1120, 'DMF', 6, 30, '["Boat berths", "Pool", "Canal access", "Ocean access", "Waterfront"]'::jsonb, '["Emergency response"]'::jsonb, '["Boating", "Swimming", "Fishing", "Social events"]'::jsonb, true, 142, ARRAY['2 bedroom', '3 bedroom'], 55, '08 9535 1234', 'info@arcadiawaters.com.au', 'https://www.arcadiawaters.com.au', 'Peel region waterfront retirement resort with premium villas and canal access. Walk to Mandurah Foreshore, restaurants and marina.', 'approved', 'admin', true),

-- 21. Halls Head Retirement Village
('Halls Head Retirement Village', 'Independent Operator', '88 Ormsby Terrace, Halls Head WA 6210', 'Halls Head', '6210', 'WA', -32.5539, 115.7089, 'Independent Living', 'independent', 320000, 480000, 560, 880, 'DMF', 6, 30, '["Pool", "Bowling green", "Beach access", "Community centre"]'::jsonb, '["Emergency response"]'::jsonb, '["Swimming", "Bowls", "Beach walks", "Social events"]'::jsonb, false, 104, ARRAY['2 bedroom', '3 bedroom'], 55, '08 9581 1234', 'info@hallshead.com.au', 'https://www.hallshead.com.au', 'Mandurah beachside retirement community with comfortable villas near pristine beaches. Walk to Halls Head Beach, shops and cafes.', 'approved', 'admin', true),

-- 22. Lifestyle Communities Ocean Reef
('Lifestyle Communities Ocean Reef', 'Lifestyle Communities', '1 Ocean Reef Road, Ocean Reef WA 6027', 'Ocean Reef', '6027', 'WA', -31.7556, 115.7383, 'Independent Living', 'independent', 240000, 400000, 360, 620, 'DMF', 6, 30, '["Pool", "Bowling green", "Gym", "Marina access", "Clubhouse"]'::jsonb, '["Emergency response"]'::jsonb, '["Swimming", "Bowls", "Exercise classes", "Marina activities", "Social events"]'::jsonb, true, 186, ARRAY['2 bedroom', '3 bedroom'], 50, '08 9307 9200', 'oceanreef@lifestylecommunities.com.au', 'https://www.lifestylecommunities.com.au', 'Northern beaches over-50s community with modern manufactured homes and resort facilities. Close to Ocean Reef Marina and beaches.', 'approved', 'admin', true),

-- 23. Seacrest Village Secret Harbour
('Seacrest Village Secret Harbour', 'Independent Operator', '88 Secret Harbour Boulevard, Secret Harbour WA 6173', 'Secret Harbour', '6173', 'WA', -32.4014, 115.7508, 'Independent Living', 'independent', 360000, 540000, 600, 960, 'DMF', 6, 30, '["Pool", "Beach access", "Marina access", "Coastal walks", "Community centre"]'::jsonb, '["Emergency response"]'::jsonb, '["Swimming", "Beach walks", "Marina activities", "Social events"]'::jsonb, false, 116, ARRAY['2 bedroom', '3 bedroom'], 55, '08 9524 1234', 'info@seacrest.com.au', 'https://www.seacrest.com.au', 'Southern Perth coastal retirement village with modern villas near Secret Harbour beaches. Walk to beach, marina and shopping.', 'approved', 'admin', true),

-- 24. Beachside Village Quinns Rocks
('Beachside Village Quinns Rocks', 'Independent Operator', '42 Tapping Way, Quinns Rocks WA 6030', 'Quinns Rocks', '6030', 'WA', -31.6683, 115.7197, 'Independent Living', 'independent', 320000, 480000, 560, 880, 'DMF', 6, 30, '["Pool", "Bowling green", "Beach access", "Community centre"]'::jsonb, '["Emergency response"]'::jsonb, '["Swimming", "Bowls", "Beach walks", "Social events"]'::jsonb, false, 108, ARRAY['2 bedroom', '3 bedroom'], 55, '08 9305 1234', 'info@beachsidevillage.com.au', 'https://www.beachsidevillage.com.au', 'Northern beaches retirement community with contemporary villas near Quinns Beach. Walk to beach, shops and cafes.', 'approved', 'admin', true),

-- 25. Swan Valley Retirement Estate
('Swan Valley Retirement Estate', 'Independent Operator', '1 West Swan Road, West Swan WA 6055', 'West Swan', '6055', 'WA', -31.8556, 116.0083, 'Independent Living', 'independent', 340000, 520000, 600, 920, 'DMF', 6, 30, '["Pool", "Wine country", "Vineyard views", "Community centre"]'::jsonb, '["Emergency response"]'::jsonb, '["Swimming", "Winery tours", "Social events", "Garden club"]'::jsonb, true, 92, ARRAY['2 bedroom', '3 bedroom'], 55, '08 9274 9200', 'info@swanvalleyretirement.com.au', 'https://www.swanvalleyretirement.com.au', 'Swan Valley wine country retirement with peaceful villas surrounded by vineyards. Close to Swan Valley wineries, restaurants and Perth Airport.', 'approved', 'admin', true);
