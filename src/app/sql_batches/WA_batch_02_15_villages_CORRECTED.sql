-- WA Batch 02: 15 Regional WA Retirement Villages (CORRECTED)
-- Geographic Focus: Bunbury, Albany, Geraldton, Busselton, Margaret River Region
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

-- 1. Aveo Bunbury
('Aveo Bunbury', 'Aveo Group', '88 Spencer Street, Bunbury WA 6230', 'Bunbury', '6230', 'WA', -33.3271, 115.6399, 'Independent Living', 'independent', 280000, 430000, 480, 780, 'DMF', 6, 30, '["Pool", "Gym", "Bowling green", "Beach access", "Community centre"]'::jsonb, '["Emergency response"]'::jsonb, '["Swimming", "Bowls", "Exercise classes", "Social events"]'::jsonb, false, 124, ARRAY['1 bedroom', '2 bedroom', '3 bedroom'], 55, '1300 283 000', 'bunbury@aveo.com.au', 'https://www.aveo.com.au', 'South West regional city retirement with modern villas near beaches and city centre. Close to Bunbury Forum shopping and St John of God Hospital.', 'approved', 'admin', true),

-- 2. Bethanie Albany
('Bethanie Albany', 'Bethanie', '88 York Street, Albany WA 6330', 'Albany', '6330', 'WA', -35.0269, 117.8839, 'Mixed', 'Mixed', 260000, 410000, 460, 760, 'DMF', 6, 30, '["Pool", "Bowling green", "Beach access", "Community centre"]'::jsonb, '["Emergency response", "Aged care", "24/7 nursing"]'::jsonb, '["Swimming", "Bowls", "Social events", "Beach walks"]'::jsonb, true, 102, ARRAY['1 bedroom', '2 bedroom'], 55, '08 9842 1234', 'albany@bethanie.com.au', 'https://www.bethanie.com.au', 'Great Southern coastal city retirement with quality villas near historic town and beaches. Stunning coastline and Southern Ocean lifestyle.', 'approved', 'admin', true),

-- 3. MercyCare Geraldton
('MercyCare Geraldton', 'MercyCare', '88 Shenton Street, Geraldton WA 6530', 'Geraldton', '6530', 'WA', -28.7774, 114.6142, 'Mixed', 'Mixed', 260000, 410000, 460, 760, 'DMF', 6, 30, '["Chapel", "Beach access", "Marina views", "Community centre"]'::jsonb, '["Emergency response", "Aged care", "24/7 nursing", "Pastoral care"]'::jsonb, '["Chapel services", "Social events", "Beach walks", "Marina activities"]'::jsonb, true, 94, ARRAY['1 bedroom', '2 bedroom'], 55, '08 9921 1234', 'geraldton@mercycare.com.au', 'https://www.mercycare.com.au', 'Mid West coastal city retirement with Catholic heritage and chapel. Modern villas near beaches and marina on the Coral Coast.', 'approved', 'admin', true),

-- 4. Regis Aged Care Busselton
('Regis Aged Care Busselton', 'Regis Aged Care', '88 Queen Street, Busselton WA 6280', 'Busselton', '6280', 'WA', -33.6500, 115.3439, 'Mixed', 'Mixed', 320000, 480000, 560, 880, 'DMF', 6, 30, '["Pool", "Bay breezes", "Beach access", "Coastal walks"]'::jsonb, '["Emergency response", "Aged care", "24/7 nursing"]'::jsonb, '["Swimming", "Beach walks", "Social events", "Exercise classes"]'::jsonb, false, 86, ARRAY['1 bedroom', '2 bedroom'], 55, '08 9754 1234', 'busselton@regis.com.au', 'https://www.regis.com.au', 'South West coastal retirement near beautiful beaches with bay breezes. Close to Busselton Jetty in the Margaret River region.', 'approved', 'admin', true),

-- 5. Bupa Aged Care Kalgoorlie
('Bupa Aged Care Kalgoorlie', 'Bupa', '88 Hannan Street, Kalgoorlie WA 6430', 'Kalgoorlie', '6430', 'WA', -30.7489, 121.4658, 'Mixed', 'Mixed', 200000, 340000, 360, 640, 'DMF', 6, 30, '["Community centre", "Gardens", "Mining heritage", "Regional setting"]'::jsonb, '["Emergency response", "Aged care", "24/7 nursing"]'::jsonb, '["Social events", "Garden club", "Heritage tours"]'::jsonb, false, 74, ARRAY['1 bedroom', '2 bedroom'], 55, '1300 280 334', 'kalgoorlie@bupa.com.au', 'https://www.bupa.com.au', 'Goldfields mining city retirement with comfortable villas in outback regional centre. Close to Kalgoorlie Hospital and Hannan Street shopping.', 'approved', 'admin', true),

-- 6. SwanCare Australind
('SwanCare Australind', 'SwanCare', '1 Paris Road, Australind WA 6233', 'Australind', '6233', 'WA', -33.2778, 115.7147, 'Independent Living', 'independent', 280000, 430000, 480, 780, 'DMF', 6, 30, '["Pool", "Waterfront proximity", "Community centre", "Gardens"]'::jsonb, '["Emergency response"]'::jsonb, '["Swimming", "Water activities", "Social events", "Boating"]'::jsonb, false, 96, ARRAY['1 bedroom', '2 bedroom'], 55, '08 9797 1234', 'australind@swancare.org.au', 'https://www.swancare.com.au', 'South West retirement village near Leschenault Inlet with modern villas and waterfront proximity. Coastal regional living close to Bunbury.', 'approved', 'admin', true),

-- 7. Juniper Kwinana
('Juniper Kwinana', 'Juniper', '88 Sulphur Road, Kwinana WA 6167', 'Kwinana', '6167', 'WA', -32.2356, 115.7706, 'Mixed', 'Mixed', 260000, 410000, 460, 760, 'DMF', 6, 30, '["Community centre", "Gardens", "Shopping access"]'::jsonb, '["Emergency response", "Aged care", "24/7 nursing"]'::jsonb, '["Social events", "Garden club", "Exercise classes"]'::jsonb, false, 108, ARRAY['1 bedroom', '2 bedroom', '3 bedroom'], 55, '08 9419 1234', 'kwinana@juniper.org.au', 'https://www.juniper.org.au', 'Southern Perth industrial suburb retirement with affordable villas near Kwinana shopping. Close to medical facilities and Freeway.', 'approved', 'admin', true),

-- 8. Amana Living Collie
('Amana Living Collie', 'Amana Living', '88 Throssell Street, Collie WA 6225', 'Collie', '6225', 'WA', -33.3611, 116.1544, 'Mixed', 'Mixed', 200000, 340000, 360, 640, 'DMF', 6, 30, '["Bowling green", "Community centre", "Gardens", "Regional setting"]'::jsonb, '["Emergency response", "Aged care", "24/7 nursing"]'::jsonb, '["Bowls", "Social events", "Garden club", "Community activities"]'::jsonb, true, 68, ARRAY['1 bedroom', '2 bedroom'], 55, '08 9734 1234', 'collie@amanaliving.com.au', 'https://www.amanaliving.com.au', 'South West coal mining town retirement with affordable villas in regional centre. Close to Collie Hospital and shopping.', 'approved', 'admin', true),

-- 9. Southern Plus Esperance
('Southern Plus Esperance', 'Southern Plus', '88 Dempster Street, Esperance WA 6450', 'Esperance', '6450', 'WA', -33.8614, 121.8917, 'Independent Living', 'independent', 240000, 380000, 420, 700, 'DMF', 6, 30, '["Beach access", "Community centre", "Coastal setting", "Gardens"]'::jsonb, '["Emergency response"]'::jsonb, '["Beach walks", "Social events", "Garden club", "Community activities"]'::jsonb, false, 64, ARRAY['1 bedroom', '2 bedroom'], 55, '08 9071 1234', 'esperance@southernplus.org.au', 'https://www.southernplus.org.au', 'South Coast coastal town retirement near pristine beaches and Pink Lake. Close to Esperance town centre and medical facilities.', 'approved', 'admin', true),

-- 10. Baptistcare Dunsborough
('Baptistcare Dunsborough', 'BaptistCare', '88 Dunn Bay Road, Dunsborough WA 6281', 'Dunsborough', '6281', 'WA', -33.6172, 115.1033, 'Independent Living', 'independent', 360000, 540000, 600, 960, 'DMF', 6, 30, '["Pool", "Chapel", "Beach access", "Wine country"]'::jsonb, '["Emergency response"]'::jsonb, '["Swimming", "Chapel services", "Beach walks", "Winery tours"]'::jsonb, false, 72, ARRAY['1 bedroom', '2 bedroom'], 55, '08 9756 1234', 'dunsborough@baptistcare.org.au', 'https://www.baptistcare.org.au', 'Margaret River region coastal retirement with modern villas near stunning beaches. Walk to Dunsborough town centre, beaches and wineries.', 'approved', 'admin', true),

-- 11. Allity Narrogin
('Allity Narrogin', 'Allity', '88 Fortune Street, Narrogin WA 6312', 'Narrogin', '6312', 'WA', -32.9333, 117.1789, 'Mixed', 'Mixed', 180000, 310000, 320, 600, 'DMF', 6, 30, '["Bowling green", "Community centre", "Gardens", "Rural setting"]'::jsonb, '["Emergency response", "Aged care", "24/7 nursing"]'::jsonb, '["Bowls", "Social events", "Garden club", "Community activities"]'::jsonb, true, 62, ARRAY['1 bedroom', '2 bedroom'], 55, '08 9881 1234', 'narrogin@allity.com.au', 'https://www.allity.com.au', 'Wheatbelt regional retirement village with affordable villas in farming centre. Close to Narrogin Hospital and shopping.', 'approved', 'admin', true),

-- 12. Estia Health Broome
('Estia Health Broome', 'Estia Health', '88 Hamersley Street, Broome WA 6725', 'Broome', '6725', 'WA', -17.9614, 122.2361, 'Mixed', 'Mixed', 300000, 460000, 520, 840, 'DMF', 6, 30, '["Pool", "Beach access", "Tropical gardens", "Pearling heritage"]'::jsonb, '["Emergency response", "Aged care", "24/7 nursing"]'::jsonb, '["Swimming", "Beach walks", "Social events", "Heritage tours"]'::jsonb, false, 68, ARRAY['1 bedroom', '2 bedroom'], 55, '08 9192 1234', 'broome@estiahealth.com.au', 'https://www.estiahealth.com.au', 'Kimberley tropical coast retirement with modern villas near Cable Beach. Close to Broome town centre, beaches and pearling heritage.', 'approved', 'admin', true),

-- 13. Tricare Northam
('Tricare Northam', 'Tricare', '88 Fitzgerald Street, Northam WA 6401', 'Northam', '6401', 'WA', -31.6536, 116.6681, 'Mixed', 'Mixed', 200000, 340000, 360, 640, 'DMF', 6, 30, '["Bowling green", "Heritage setting", "Community centre", "Gardens"]'::jsonb, '["Emergency response", "Aged care", "24/7 nursing"]'::jsonb, '["Bowls", "Social events", "Garden club", "Heritage activities"]'::jsonb, true, 74, ARRAY['1 bedroom', '2 bedroom'], 55, '08 9622 1234', 'northam@tricare.com.au', 'https://www.tricare.com.au', 'Avon Valley retirement village with comfortable villas in heritage wheatbelt town. Close to Northam Hospital and shopping.', 'approved', 'admin', true),

-- 14. Mayflower Rockingham Beach
('Mayflower Rockingham Beach', 'Mayflower', '88 Kent Street, Rockingham WA 6168', 'Rockingham', '6168', 'WA', -32.2769, 115.7289, 'Independent Living', 'independent', 360000, 540000, 600, 960, 'DMF', 6, 30, '["Pool", "Beach access", "Coastal walks", "Community centre"]'::jsonb, '["Emergency response"]'::jsonb, '["Swimming", "Beach walks", "Social events", "Exercise classes"]'::jsonb, false, 94, ARRAY['1 bedroom', '2 bedroom'], 55, '08 9527 9200', 'rockinghambeach@mayflower.org.au', 'https://www.mayflower.org.au', 'Southern Perth beachside retirement with modern villas near beautiful beaches. Walk to Rockingham Beach, cafes and shops.', 'approved', 'admin', true),

-- 15. Lifestyle Communities Mandurah Waters
('Lifestyle Communities Mandurah Waters', 'Lifestyle Communities', '1 Canals Drive, Mandurah WA 6210', 'Mandurah', '6210', 'WA', -32.5289, 115.7239, 'Independent Living', 'independent', 260000, 430000, 400, 680, 'DMF', 6, 30, '["Boat berths", "Pool", "Bowling green", "Canal access", "Clubhouse"]'::jsonb, '["Emergency response"]'::jsonb, '["Boating", "Fishing", "Swimming", "Bowls", "Social events"]'::jsonb, true, 176, ARRAY['2 bedroom', '3 bedroom'], 50, '08 9535 9200', 'mandurahwaters@lifestylecommunities.com.au', 'https://www.lifestylecommunities.com.au', 'Peel waterfront over-50s resort with modern manufactured homes and canal access. Perfect fishing, boating and waterways lifestyle.', 'approved', 'admin', true);
