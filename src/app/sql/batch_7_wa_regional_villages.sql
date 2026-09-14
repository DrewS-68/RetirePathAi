-- Batch 7: WA + Regional Areas Retirement Villages (20 villages)
-- Execute this in Supabase SQL Editor
-- Adds comprehensive Western Australia coverage plus regional NSW and VIC

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

-- WESTERN AUSTRALIA (12 villages)

('Bethanie Joondanna', 'Bethanie', '1 Joondanna Drive', 'Joondanna', '6060', 'WA', -31.9213, 115.8451, 'Mixed', 'Mixed', 380000, 680000, 420, 650, 'DMF', 6, 30, '["Pool", "Gym", "Library", "Community hall", "Garden", "Workshop", "BBQ area"]'::jsonb, '["Aged care", "Memory support", "24/7 nursing", "Allied health", "Respite care"]'::jsonb, '["Swimming", "Exercise classes", "Social events", "Entertainment", "Bus trips"]'::jsonb, true, 170, ARRAY['1 bedroom', '2 bedroom', '3 bedroom'], 55, '08 9301 8800', 'joondanna@bethanie.com.au', 'https://www.bethanie.com.au', 'Established retirement village in inner-north Perth with comprehensive care continuum.', 'approved', 'manual', true),

('Regis Aged Care Nedlands', 'Regis Aged Care', '114 Hampden Road', 'Nedlands', '6009', 'WA', -31.9769, 115.8068, 'Aged Care Facility', 'Assisted Living', NULL, NULL, 2800, 3800, NULL, NULL, NULL, '["River views", "Cafe", "Hair salon", "Activities room", "Garden terrace"]'::jsonb, '["24/7 nursing", "Dementia care", "Palliative care", "Respite care"]'::jsonb, '["Entertainment", "Exercise programs", "Music therapy", "Art activities"]'::jsonb, false, 90, ARRAY['Shared', 'Single room'], NULL, '1300 998 100', 'nedlands@regis.com.au', 'https://www.regis.com.au', 'Premium aged care in prestigious riverside Nedlands close to UWA and hospitals.', 'approved', 'manual', true),

('Juniper Hawthorn', 'Juniper', '24 Hawthorn Street', 'Willetton', '6155', 'WA', -32.0522, 115.8846, 'Mixed', 'Mixed', 420000, 750000, 480, 720, 'DMF', 5, 30, '["Pool", "Gym", "Cinema", "Library", "Cafe", "Garden", "Bowling green"]'::jsonb, '["Aged care", "Memory support", "24/7 nursing", "Allied health"]'::jsonb, '["Swimming", "Bowls", "Exercise classes", "Entertainment", "Social events"]'::jsonb, true, 200, ARRAY['1 bedroom', '2 bedroom', '3 bedroom'], 55, '08 9312 4300', 'hawthorn@juniper.org.au', 'https://www.juniper.org.au', 'Modern retirement village in Southern suburbs with resort-style amenities.', 'approved', 'manual', true),

('Opal Aged Care Madora Bay', 'Opal Aged Care', '1 Madora Boulevard', 'Madora Bay', '6210', 'WA', -32.4757, 115.7282, 'Aged Care Facility', 'Assisted Living', NULL, NULL, 2400, 3400, NULL, NULL, NULL, '["Garden", "Cafe", "Hair salon", "Activities room", "Outdoor areas"]'::jsonb, '["24/7 nursing", "Dementia care", "Respite care", "Allied health"]'::jsonb, '["Entertainment", "Exercise programs", "Beach outings", "Music therapy"]'::jsonb, false, 110, ARRAY['Shared', 'Single room'], NULL, '08 9582 4100', 'madorabay@opalagecare.com.au', 'https://www.opalagecare.com.au', 'Coastal aged care south of Perth with ocean breezes and beach lifestyle.', 'approved', 'manual', true),

('Brightwater Inglewood', 'Brightwater Care Group', '2 Meadowvale Avenue', 'Inglewood', '6052', 'WA', -31.9195, 115.8769, 'Mixed', 'Mixed', 400000, 720000, 450, 680, 'DMF', 6, 30, '["Pool", "Library", "Community hall", "Garden", "Hair salon", "Cafe"]'::jsonb, '["Aged care", "24/7 nursing", "Dementia care", "Allied health", "Respite care"]'::jsonb, '["Swimming", "Exercise classes", "Social events", "Entertainment"]'::jsonb, true, 140, ARRAY['1 bedroom', '2 bedroom', '3 bedroom'], 55, '08 9271 8433', 'inglewood@brightwatergroup.com', 'https://www.brightwatergroup.com', 'Popular retirement village in inner-east Perth with full care services.', 'approved', 'manual', true),

('Amana Living Allambie Heights', 'Amana Living', '7 Kalinda Drive', 'City Beach', '6015', 'WA', -31.9380, 115.7603, 'Mixed', 'Mixed', 550000, 950000, 600, 900, 'DMF', 5, 25, '["Ocean views", "Pool", "Gym", "Library", "Cafe", "Garden", "Workshop"]'::jsonb, '["Aged care", "Memory support", "24/7 nursing", "Allied health"]'::jsonb, '["Swimming", "Beach walks", "Exercise classes", "Social events"]'::jsonb, true, 130, ARRAY['1 bedroom', '2 bedroom', '3 bedroom'], 60, '08 9264 8400', 'allambie@amanaliving.com.au', 'https://www.amanaliving.com.au', 'Premium coastal retirement living with stunning ocean views and beach access.', 'approved', 'manual', true),

('Estia Health Mandurah', 'Estia Health', '32 Tuckey Street', 'Mandurah', '6210', 'WA', -32.5289, 115.7239, 'Aged Care Facility', 'Assisted Living', NULL, NULL, 2500, 3500, NULL, NULL, NULL, '["Garden", "Cafe", "Hair salon", "Activities room", "Outdoor areas"]'::jsonb, '["24/7 nursing", "Dementia care", "Respite care", "Physiotherapy"]'::jsonb, '["Entertainment", "Exercise programs", "Art and craft", "Music therapy"]'::jsonb, false, 100, ARRAY['Shared', 'Single room'], NULL, '1300 682 833', 'mandurah@estiahealth.com.au', 'https://www.estiahealth.com.au', 'Aged care in coastal Mandurah with waterway lifestyle and modern facilities.', 'approved', 'manual', true),

('Japara Hillside', 'Japara Healthcare', '10 Hillside Crescent', 'Maylands', '6051', 'WA', -31.9331, 115.8989, 'Aged Care Facility', 'Assisted Living', NULL, NULL, 2600, 3600, NULL, NULL, NULL, '["Garden", "Cafe", "Hair salon", "Activities room", "Chapel"]'::jsonb, '["24/7 nursing", "Dementia care", "Palliative care", "Respite care"]'::jsonb, '["Entertainment", "Exercise programs", "Music therapy", "Garden activities"]'::jsonb, false, 85, ARRAY['Shared', 'Single room'], NULL, '1300 522 272', 'hillside@japara.com.au', 'https://www.japara.com.au', 'Inner-east Perth aged care close to Swan River and parklands.', 'approved', 'manual', true),

('Seasons Retirement Living Bunbury', 'Seasons', '22 Leschenault Terrace', 'Bunbury', '6230', 'WA', -33.3271, 115.6399, 'Independent Living', 'Independent', 280000, 500000, 350, 550, 'DMF', 6, 30, '["Community hall", "Library", "Garden", "BBQ area", "Workshop"]'::jsonb, '["Emergency response", "Weekly wellness checks", "Optional home care"]'::jsonb, '["Social events", "Garden club", "Card games", "Bus trips"]'::jsonb, true, 95, ARRAY['2 bedroom', '3 bedroom'], 55, '08 9721 8400', 'bunbury@seasonsliving.com.au', 'https://www.seasonsliving.com.au', 'Affordable retirement living in regional Bunbury with friendly community atmosphere.', 'approved', 'manual', true),

('Aegis Shelley', 'Aegis Aged Care', '195 Leach Highway', 'Shelley', '6148', 'WA', -32.0262, 115.8839, 'Aged Care Facility', 'Assisted Living', NULL, NULL, 2700, 3700, NULL, NULL, NULL, '["Garden terrace", "Cafe", "Hair salon", "Activities room", "Cinema"]'::jsonb, '["24/7 nursing", "Dementia care", "Respite care", "Allied health"]'::jsonb, '["Entertainment", "Exercise programs", "Pet therapy", "Music therapy"]'::jsonb, false, 95, ARRAY['Shared', 'Single room'], NULL, '08 9354 8200', 'shelley@aegisagedcare.com.au', 'https://www.aegisagedcare.com.au', 'Quality aged care in Southern suburbs close to Canning River and amenities.', 'approved', 'manual', true),

('Bethanie Gwelup', 'Bethanie', '641 Beach Road', 'Gwelup', '6018', 'WA', -31.8721, 115.7998, 'Mixed', 'Mixed', 420000, 740000, 470, 700, 'DMF', 6, 30, '["Pool", "Gym", "Library", "Community hall", "Garden", "BBQ area"]'::jsonb, '["Aged care", "Memory support", "24/7 nursing", "Allied health"]'::jsonb, '["Swimming", "Exercise classes", "Social events", "Entertainment"]'::jsonb, true, 150, ARRAY['1 bedroom', '2 bedroom', '3 bedroom'], 55, '08 9301 8800', 'gwelup@bethanie.com.au', 'https://www.bethanie.com.au', 'Northern suburbs retirement village with comprehensive facilities and care.', 'approved', 'manual', true),

('Mercy Place Wembley', 'Mercy Health', '74 Ventnor Avenue', 'Wembley', '6014', 'WA', -31.9372, 115.8114, 'Aged Care Facility', 'Assisted Living', NULL, NULL, 2800, 3800, NULL, NULL, NULL, '["Chapel", "Garden", "Cafe", "Hair salon", "Activities room"]'::jsonb, '["24/7 nursing", "Dementia care", "Palliative care", "Allied health"]'::jsonb, '["Mass", "Entertainment", "Music therapy", "Art activities"]'::jsonb, false, 75, ARRAY['Shared', 'Single room'], NULL, '08 9284 4400', 'wembley@mercyhealth.com.au', 'https://www.mercyhealth.com.au', 'Catholic aged care in inner-west Perth with quality care and community focus.', 'approved', 'manual', true),

-- REGIONAL NSW (4 villages)

('Bolton Clarke Dubbo', 'Bolton Clarke', '42 Wingewarra Street', 'Dubbo', '2830', 'NSW', -32.2426, 148.6016, 'Mixed', 'Mixed', 220000, 420000, 320, 520, 'DMF', 6, 30, '["Community hall", "Library", "Garden", "BBQ area", "Workshop"]'::jsonb, '["Aged care", "24/7 nursing", "Respite care", "Allied health"]'::jsonb, '["Social events", "Entertainment", "Garden club", "Bus trips"]'::jsonb, true, 100, ARRAY['1 bedroom', '2 bedroom', '3 bedroom'], 55, '02 6882 9200', 'dubbo@boltonclarke.com.au', 'https://www.boltonclarke.com.au', 'Central west NSW retirement village with affordable living and comprehensive care.', 'approved', 'manual', true),

('Harbison Orange', 'Harbison Care', '44 Kite Street', 'Orange', '2800', 'NSW', -33.2839, 149.0994, 'Mixed', 'Mixed', 280000, 520000, 350, 550, 'DMF', 6, 30, '["Pool", "Library", "Community hall", "Garden", "BBQ area"]'::jsonb, '["Aged care", "Memory support", "24/7 nursing", "Allied health"]'::jsonb, '["Swimming", "Exercise classes", "Social events", "Entertainment"]'::jsonb, true, 120, ARRAY['1 bedroom', '2 bedroom', '3 bedroom'], 55, '02 6361 8300', 'orange@harbisoncare.org.au', 'https://www.harbisoncare.org.au', 'Regional retirement living in the cool climate of Orange with mountain views.', 'approved', 'manual', true),

('Uniting Coffs Harbour', 'Uniting NSW & ACT', '7 Bay Drive', 'Coffs Harbour', '2450', 'NSW', -30.2986, 153.1309, 'Mixed', 'Mixed', 320000, 580000, 380, 600, 'DMF', 6, 30, '["Pool", "Community hall", "Library", "Garden", "BBQ area", "Ocean views"]'::jsonb, '["Aged care", "24/7 nursing", "Memory support", "Allied health"]'::jsonb, '["Swimming", "Social events", "Beach outings", "Entertainment"]'::jsonb, true, 130, ARRAY['1 bedroom', '2 bedroom', '3 bedroom'], 55, '02 6659 8300', 'coffsharbour@uniting.org', 'https://www.uniting.org', 'Coastal retirement village on the North Coast with stunning ocean views.', 'approved', 'manual', true),

('Estia Health Tamworth', 'Estia Health', '15 Goonoo Goonoo Road', 'Tamworth', '2340', 'NSW', -31.0927, 150.9279, 'Aged Care Facility', 'Assisted Living', NULL, NULL, 2200, 3200, NULL, NULL, NULL, '["Garden", "Cafe", "Hair salon", "Activities room", "Outdoor areas"]'::jsonb, '["24/7 nursing", "Dementia care", "Respite care", "Allied health"]'::jsonb, '["Entertainment", "Exercise programs", "Music therapy", "Country music events"]'::jsonb, false, 90, ARRAY['Shared', 'Single room'], NULL, '1300 682 833', 'tamworth@estiahealth.com.au', 'https://www.estiahealth.com.au', 'Regional aged care in the country music capital with quality care and facilities.', 'approved', 'manual', true),

-- REGIONAL VICTORIA (4 villages)

('Ryman Healthcare Charles Harrison', 'Ryman Healthcare', '2 Harrison Place', 'Highton', '3216', 'VIC', -38.1733, 144.3207, 'Mixed', 'Mixed', 380000, 680000, 450, 700, 'DMF', 5, 25, '["Pool", "Gym", "Cinema", "Library", "Cafe", "Bowling green"]'::jsonb, '["Aged care", "Memory care", "24/7 nursing", "Allied health"]'::jsonb, '["Swimming", "Bowls", "Exercise classes", "Entertainment"]'::jsonb, true, 220, ARRAY['1 bedroom', '2 bedroom', '3 bedroom'], 65, '03 5243 5100', 'charles.harrison@rymanhealthcare.com.au', 'https://www.rymanhealthcare.com.au', 'Premium retirement village in Geelong with comprehensive facilities and bay views.', 'approved', 'manual', true),

('Uniting AgeWell Ballarat', 'Uniting AgeWell', '1201 Howitt Street', 'Wendouree', '3355', 'VIC', -37.5434, 143.8324, 'Mixed', 'Mixed', 280000, 520000, 350, 550, 'DMF', 6, 30, '["Community hall", "Library", "Garden", "BBQ area", "Workshop"]'::jsonb, '["Aged care", "24/7 nursing", "Memory support", "Allied health"]'::jsonb, '["Social events", "Entertainment", "Garden club", "Bus trips"]'::jsonb, true, 110, ARRAY['1 bedroom', '2 bedroom', '3 bedroom'], 55, '03 5320 8200', 'ballarat@unitingagewell.org', 'https://www.unitingagewell.org', 'Regional retirement village in historic Ballarat with affordable living options.', 'approved', 'manual', true),

('Regis Aged Care Bendigo', 'Regis Aged Care', '88 Wattle Street', 'Bendigo', '3550', 'VIC', -36.7570, 144.2794, 'Aged Care Facility', 'Assisted Living', NULL, NULL, 2400, 3400, NULL, NULL, NULL, '["Garden", "Cafe", "Hair salon", "Activities room", "Chapel"]'::jsonb, '["24/7 nursing", "Dementia care", "Respite care", "Allied health"]'::jsonb, '["Entertainment", "Exercise programs", "Music therapy", "Art activities"]'::jsonb, false, 95, ARRAY['Shared', 'Single room'], NULL, '1300 998 100', 'bendigo@regis.com.au', 'https://www.regis.com.au', 'Regional aged care in Central Victoria with quality facilities and caring staff.', 'approved', 'manual', true),

('Estia Health Shepparton', 'Estia Health', '86 Benalla Road', 'Shepparton', '3630', 'VIC', -36.3807, 145.3960, 'Aged Care Facility', 'Assisted Living', NULL, NULL, 2300, 3300, NULL, NULL, NULL, '["Garden", "Cafe", "Hair salon", "Activities room", "Outdoor areas"]'::jsonb, '["24/7 nursing", "Dementia care", "Respite care", "Physiotherapy"]'::jsonb, '["Entertainment", "Exercise programs", "Garden activities", "Music therapy"]'::jsonb, false, 85, ARRAY['Shared', 'Single room'], NULL, '1300 682 833', 'shepparton@estiahealth.com.au', 'https://www.estiahealth.com.au', 'Goulburn Valley aged care with modern facilities and personalized care programs.', 'approved', 'manual', true);

-- Verify insertion
SELECT COUNT(*) as batch_7_added FROM retirement_villages WHERE source = 'manual' AND created_at > NOW() - INTERVAL '1 minute';
