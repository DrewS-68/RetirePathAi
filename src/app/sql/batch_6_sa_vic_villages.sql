-- Batch 6: SA + More VIC Retirement Villages (20 villages)
-- Execute this in Supabase SQL Editor
-- Adds comprehensive South Australia coverage plus additional Victoria villages

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

-- SOUTH AUSTRALIA (10 villages)

('Resthaven Marion', 'Resthaven', '7-21 Lonsdale Terrace', 'Marion', '5043', 'SA', -35.0094, 138.5484, 'Mixed', 'Mixed', 320000, 580000, 380, 620, 'DMF', 6, 30, '["Pool", "Gym", "Library", "Community hall", "Garden", "Workshop", "BBQ area"]'::jsonb, '["Aged care", "Memory support", "24/7 nursing", "Allied health", "Respite care"]'::jsonb, '["Exercise classes", "Social events", "Entertainment", "Garden club", "Bus trips"]'::jsonb, true, 150, ARRAY['1 bedroom', '2 bedroom', '3 bedroom'], 55, '08 8198 2071', 'marion@resthaven.asn.au', 'https://www.resthaven.asn.au', 'Well-established retirement village in Southern Adelaide with comprehensive care and facilities.', 'approved', 'manual', true),

('ECH Glenelg', 'ECH', '2 Partridge Street', 'Glenelg', '5045', 'SA', -34.9804, 138.5139, 'Independent Living', 'Independent', 450000, 750000, 450, 680, 'DMF', 5, 25, '["Community lounge", "Rooftop terrace", "Library", "BBQ area", "Garden"]'::jsonb, '["Emergency response", "Optional home care", "Weekly wellness checks"]'::jsonb, '["Social events", "Beach walks", "Coffee mornings", "Card games"]'::jsonb, false, 80, ARRAY['1 bedroom', '2 bedroom'], 60, '08 8271 3300', 'glenelg@ech.asn.au', 'https://www.ech.asn.au', 'Beachside retirement living in popular Glenelg with easy access to shops and beach.', 'approved', 'manual', true),

('Helping Hand Walkerville', 'Helping Hand Aged Care', '42 Smith Street', 'Walkerville', '5081', 'SA', -34.8944, 138.6112, 'Mixed', 'Mixed', 380000, 680000, 420, 650, 'DMF', 6, 30, '["Pool", "Library", "Chapel", "Community hall", "Garden", "Hair salon"]'::jsonb, '["Aged care", "Dementia care", "24/7 nursing", "Physiotherapy", "Respite care"]'::jsonb, '["Exercise programs", "Entertainment", "Religious services", "Art activities"]'::jsonb, true, 120, ARRAY['1 bedroom', '2 bedroom', '3 bedroom'], 55, '08 8366 6000', 'walkerville@helpinghand.org.au', 'https://www.helpinghand.org.au', 'Inner-city Adelaide retirement village close to Linear Park and city amenities.', 'approved', 'manual', true),

('Regis Aged Care Salisbury', 'Regis Aged Care', '46 Waterloo Corner Road', 'Salisbury', '5108', 'SA', -34.7643, 138.6422, 'Aged Care Facility', 'Assisted Living', NULL, NULL, 2400, 3400, NULL, NULL, NULL, '["Garden", "Cafe", "Hair salon", "Activities room", "Chapel"]'::jsonb, '["24/7 nursing", "Dementia care", "Respite care", "Palliative care"]'::jsonb, '["Entertainment", "Exercise programs", "Music therapy", "Pet therapy"]'::jsonb, false, 110, ARRAY['Shared', 'Single room'], NULL, '1300 998 100', 'salisbury@regis.com.au', 'https://www.regis.com.au', 'Northern Adelaide aged care facility with modern amenities and caring staff.', 'approved', 'manual', true),

('Estia Health Kapara', 'Estia Health', '27 Rose Terrace', 'Wayville', '5034', 'SA', -34.9470, 138.5913, 'Aged Care Facility', 'Assisted Living', NULL, NULL, 2600, 3600, NULL, NULL, NULL, '["Garden areas", "Cafe", "Hair salon", "Activities room", "Outdoor areas"]'::jsonb, '["24/7 nursing", "Dementia care", "Respite care", "Allied health"]'::jsonb, '["Entertainment", "Exercise programs", "Art and craft", "Music therapy"]'::jsonb, false, 95, ARRAY['Shared', 'Single room'], NULL, '1300 682 833', 'kapara@estiahealth.com.au', 'https://www.estiahealth.com.au', 'Inner-southern Adelaide aged care close to parklands and medical facilities.', 'approved', 'manual', true),

('Bene Senior Living Northgate', 'Bene', '670 Grand Junction Road', 'Northgate', '5085', 'SA', -34.8676, 138.6351, 'Mixed', 'Mixed', 350000, 620000, 400, 600, 'DMF', 6, 30, '["Pool", "Gym", "Library", "Community hall", "Garden", "Workshop"]'::jsonb, '["Aged care", "Memory support", "24/7 nursing", "Allied health"]'::jsonb, '["Swimming", "Exercise classes", "Social events", "Entertainment"]'::jsonb, true, 140, ARRAY['1 bedroom', '2 bedroom', '3 bedroom'], 55, '08 8266 0111', 'northgate@bene.com.au', 'https://www.bene.com.au', 'Affordable retirement living in Northern Adelaide with comprehensive facilities.', 'approved', 'manual', true),

('Japara Princes Court', 'Japara Healthcare', '20 Brougham Place', 'North Adelaide', '5006', 'SA', -34.9054, 138.5944, 'Aged Care Facility', 'Assisted Living', NULL, NULL, 2800, 3800, NULL, NULL, NULL, '["Garden terrace", "Cafe", "Hair salon", "Activities room", "Chapel"]'::jsonb, '["24/7 nursing", "Dementia care", "Palliative care", "Respite care"]'::jsonb, '["Entertainment", "Exercise programs", "Music therapy", "Garden activities"]'::jsonb, false, 85, ARRAY['Shared', 'Single room'], NULL, '1300 522 272', 'princescourt@japara.com.au', 'https://www.japara.com.au', 'Premium aged care in heritage North Adelaide with city views and parkland access.', 'approved', 'manual', true),

('Anglicare SA Playford', 'Anglicare SA', '14 Elizabeth Road', 'Elizabeth', '5112', 'SA', -34.7199, 138.6756, 'Mixed', 'Mixed', 280000, 500000, 350, 550, 'DMF', 6, 30, '["Community hall", "Library", "Garden", "BBQ area", "Workshop"]'::jsonb, '["Aged care", "24/7 nursing", "Dementia care", "Respite care"]'::jsonb, '["Religious services", "Social events", "Entertainment", "Garden club"]'::jsonb, true, 100, ARRAY['1 bedroom', '2 bedroom', '3 bedroom'], 55, '08 8305 9200', 'playford@anglicaresa.com.au', 'https://www.anglicaresa.com.au', 'Affordable Christian retirement living in Northern Adelaide growth area.', 'approved', 'manual', true),

('Southern Cross Care Oaklands', 'Southern Cross Care', '377 Morphett Road', 'Oaklands Park', '5046', 'SA', -35.0153, 138.5326, 'Aged Care Facility', 'Assisted Living', NULL, NULL, 2500, 3500, NULL, NULL, NULL, '["Chapel", "Garden", "Cafe", "Hair salon", "Activities room"]'::jsonb, '["24/7 nursing", "Dementia care", "Palliative care", "Allied health"]'::jsonb, '["Mass", "Entertainment", "Music therapy", "Exercise programs"]'::jsonb, false, 100, ARRAY['Shared', 'Single room'], NULL, '1300 669 189', 'oaklands@sccare.org.au', 'https://www.sccare.org.au', 'Catholic aged care in Southern Adelaide with quality care and modern facilities.', 'approved', 'manual', true),

('Uniting Country Health McLaren Vale', 'Uniting Country Health SA', '182 Main Road', 'McLaren Vale', '5171', 'SA', -35.2206, 138.5441, 'Mixed', 'Mixed', 300000, 550000, 380, 580, 'DMF', 6, 30, '["Community hall", "Library", "Garden", "BBQ area", "Vineyard views"]'::jsonb, '["Aged care", "24/7 nursing", "Respite care", "Allied health"]'::jsonb, '["Social events", "Entertainment", "Garden club", "Wine tours"]'::jsonb, true, 90, ARRAY['1 bedroom', '2 bedroom', '3 bedroom'], 55, '08 8323 9735', 'mclarenvale@uchs.com.au', 'https://www.uchs.com.au', 'Retirement living in the heart of wine country with beautiful vineyard surrounds.', 'approved', 'manual', true),

-- VICTORIA (10 more villages)

('Arcare Craigieburn', 'Arcare', '150 Highlander Drive', 'Craigieburn', '3064', 'VIC', -37.5988, 144.9432, 'Aged Care Facility', 'Assisted Living', NULL, NULL, 2500, 3500, NULL, NULL, NULL, '["Garden", "Cafe", "Hair salon", "Cinema", "Activities room"]'::jsonb, '["24/7 nursing", "Dementia care", "Respite care", "Physiotherapy"]'::jsonb, '["Entertainment", "Exercise programs", "Art and craft", "Music therapy"]'::jsonb, false, 120, ARRAY['Shared', 'Single room'], NULL, '1300 272 273', 'craigieburn@arcare.com.au', 'https://www.arcare.com.au', 'Modern aged care facility in growing Northern suburbs with comprehensive care.', 'approved', 'manual', true),

('Baptcare The Orchards', 'BaptistCare Victoria', '550 Burwood Highway', 'Vermont South', '3133', 'VIC', -37.8646, 145.1755, 'Mixed', 'Mixed', 420000, 720000, 480, 720, 'DMF', 6, 30, '["Pool", "Gym", "Chapel", "Library", "Community hall", "Garden"]'::jsonb, '["Aged care", "Memory support", "24/7 nursing", "Allied health"]'::jsonb, '["Religious services", "Exercise classes", "Social events", "Entertainment"]'::jsonb, true, 160, ARRAY['1 bedroom', '2 bedroom', '3 bedroom'], 55, '03 9873 1400', 'orchards@baptistcarevic.org.au', 'https://www.baptistcarevic.org.au', 'Established retirement village in leafy Eastern suburbs with full care continuum.', 'approved', 'manual', true),

('Mercy Place Montrose', 'Mercy Health', '59 Durham Road', 'Montrose', '3765', 'VIC', -37.8169, 145.3597, 'Aged Care Facility', 'Assisted Living', NULL, NULL, 2600, 3600, NULL, NULL, NULL, '["Chapel", "Garden", "Cafe", "Hair salon", "Activities room"]'::jsonb, '["24/7 nursing", "Dementia care", "Palliative care", "Allied health"]'::jsonb, '["Mass", "Entertainment", "Music therapy", "Garden activities"]'::jsonb, false, 85, ARRAY['Shared', 'Single room'], NULL, '03 9728 8100', 'montrose@mercyhealth.com.au', 'https://www.mercyhealth.com.au', 'Aged care in the Dandenong Ranges with mountain views and peaceful setting.', 'approved', 'manual', true),

('Regis Aged Care Footscray', 'Regis Aged Care', '90 Nicholson Street', 'Footscray', '3011', 'VIC', -37.8014, 144.9000, 'Aged Care Facility', 'Assisted Living', NULL, NULL, 2700, 3700, NULL, NULL, NULL, '["Garden", "Cafe", "Hair salon", "Activities room", "Outdoor areas"]'::jsonb, '["24/7 nursing", "Dementia care", "Respite care", "Allied health"]'::jsonb, '["Entertainment", "Exercise programs", "Multicultural activities", "Music therapy"]'::jsonb, false, 90, ARRAY['Shared', 'Single room'], NULL, '1300 998 100', 'footscray@regis.com.au', 'https://www.regis.com.au', 'Inner-west aged care facility close to city with multicultural care approach.', 'approved', 'manual', true),

('Estia Health Keilor', 'Estia Health', '50 Taylors Road', 'Keilor', '3036', 'VIC', -37.7225, 144.8520, 'Aged Care Facility', 'Assisted Living', NULL, NULL, 2500, 3500, NULL, NULL, NULL, '["Garden areas", "Cafe", "Hair salon", "Activities room", "Chapel"]'::jsonb, '["24/7 nursing", "Dementia care", "Respite care", "Physiotherapy"]'::jsonb, '["Entertainment", "Exercise programs", "Art and craft", "Pet therapy"]'::jsonb, false, 100, ARRAY['Shared', 'Single room'], NULL, '1300 682 833', 'keilor@estiahealth.com.au', 'https://www.estiahealth.com.au', 'Quality aged care in Northwest Melbourne with modern facilities and caring staff.', 'approved', 'manual', true),

('BlueCross Yarra Glen', 'BlueCross', '19 Armstrong Road', 'Yarra Glen', '3775', 'VIC', -37.6598, 145.3725, 'Independent Living', 'Independent', 320000, 580000, 400, 600, 'DMF', 5, 30, '["Community hall", "Library", "Garden", "BBQ area", "Vineyard views"]'::jsonb, '["Emergency response", "Weekly wellness checks", "Optional home care"]'::jsonb, '["Social events", "Garden club", "Wine tasting", "Bus trips"]'::jsonb, true, 75, ARRAY['2 bedroom', '3 bedroom'], 55, '03 9730 2300', 'yarraglen@bluecross.com.au', 'https://www.bluecross.com.au', 'Retirement living in the Yarra Valley wine region with country lifestyle.', 'approved', 'manual', true),

('Opal Aged Care Forestville', 'Opal Aged Care', '68 Canterbury Road', 'Kilsyth', '3137', 'VIC', -37.8154, 145.3166, 'Aged Care Facility', 'Assisted Living', NULL, NULL, 2600, 3600, NULL, NULL, NULL, '["Garden", "Cafe", "Hair salon", "Activities room", "Outdoor areas"]'::jsonb, '["24/7 nursing", "Dementia care", "Respite care", "Allied health"]'::jsonb, '["Entertainment", "Exercise programs", "Music therapy", "Garden activities"]'::jsonb, false, 95, ARRAY['Shared', 'Single room'], NULL, '03 9728 4400', 'forestville@opalagecare.com.au', 'https://www.opalagecare.com.au', 'Peaceful aged care in the foothills with beautiful mountain backdrop.', 'approved', 'manual', true),

('Benetas St George''s', 'Benetas', '36 Eglinton Street', 'Moonee Ponds', '3039', 'VIC', -37.7661, 144.9223, 'Mixed', 'Mixed', 480000, 820000, 520, 780, 'DMF', 6, 30, '["Pool", "Library", "Community hall", "Garden", "BBQ area"]'::jsonb, '["Aged care", "Memory support", "24/7 nursing", "Allied health"]'::jsonb, '["Swimming", "Exercise classes", "Social events", "Entertainment"]'::jsonb, true, 110, ARRAY['1 bedroom', '2 bedroom', '3 bedroom'], 55, '1300 236 382', 'stgeorges@benetas.com.au', 'https://www.benetas.com.au', 'Inner-northwest retirement village close to Maribyrnong River and city.', 'approved', 'manual', true),

('Japara St Helena', 'Japara Healthcare', '37 Mount Pleasant Road', 'Nunawading', '3131', 'VIC', -37.8230, 145.1755, 'Aged Care Facility', 'Assisted Living', NULL, NULL, 2700, 3700, NULL, NULL, NULL, '["Garden", "Cafe", "Hair salon", "Activities room", "Cinema"]'::jsonb, '["24/7 nursing", "Dementia care", "Respite care", "Physiotherapy"]'::jsonb, '["Entertainment", "Exercise programs", "Art and craft", "Music therapy"]'::jsonb, false, 105, ARRAY['Shared', 'Single room'], NULL, '1300 522 272', 'sthelena@japara.com.au', 'https://www.japara.com.au', 'Eastern suburbs aged care with excellent amenities and personalized care.', 'approved', 'manual', true),

('Uniting AgeWell Strathdon', 'Uniting AgeWell', '356 Mont Albert Road', 'Surrey Hills', '3127', 'VIC', -37.8229, 145.0953, 'Mixed', 'Mixed', 520000, 880000, 550, 820, 'DMF', 6, 30, '["Pool", "Gym", "Library", "Cinema", "Community hall", "Garden"]'::jsonb, '["Aged care", "Memory support", "24/7 nursing", "Allied health"]'::jsonb, '["Swimming", "Exercise classes", "Social events", "Entertainment", "Bus trips"]'::jsonb, true, 180, ARRAY['1 bedroom', '2 bedroom', '3 bedroom'], 55, '03 9836 7222', 'strathdon@unitingagewell.org', 'https://www.unitingagewell.org', 'Premium retirement village in prestigious Surrey Hills with comprehensive facilities.', 'approved', 'manual', true);

-- Verify insertion
SELECT COUNT(*) as batch_6_added FROM retirement_villages WHERE source = 'manual' AND state IN ('SA', 'VIC') AND created_at > NOW() - INTERVAL '1 minute';
