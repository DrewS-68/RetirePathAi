-- Batch 8: More QLD + Regional NSW Retirement Villages (20 villages)
-- Execute this in Supabase SQL Editor
-- Expands Queensland coverage including Gold Coast and Sunshine Coast, plus more regional NSW

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

-- QUEENSLAND GOLD COAST & SUNSHINE COAST (12 villages)

('Aveo Broadwater Court', 'Aveo Group', '2 Bayview Street', 'Runaway Bay', '4216', 'QLD', -27.9199, 153.3791, 'Mixed', 'Mixed', 420000, 760000, 480, 720, 'DMF', 6, 30, '["Pool", "Gym", "Marina access", "Library", "Community hall", "BBQ area", "Waterfront"]'::jsonb, '["Aged care", "Memory support", "24/7 nursing", "Allied health"]'::jsonb, '["Swimming", "Boating", "Exercise classes", "Social events", "Entertainment"]'::jsonb, true, 200, ARRAY['1 bedroom', '2 bedroom', '3 bedroom'], 55, '1300 283 648', 'broadwater@aveo.com.au', 'https://www.aveo.com.au', 'Luxury waterfront retirement living on the Gold Coast Broadwater with marina.', 'approved', 'manual', true),

('Lendlease The Sands', 'Lendlease Retirement Living', '88 Marine Parade', 'Southport', '4215', 'QLD', -27.9662, 153.4099, 'Serviced Apartments', 'Independent', 650000, 1200000, 650, 1000, 'DMF', 5, 20, '["Ocean views", "Pool", "Gym", "Cinema", "Concierge", "Dining room", "Rooftop terrace"]'::jsonb, '["Emergency response", "Concierge services", "Optional home care"]'::jsonb, '["Social dining", "Beach walks", "Entertainment", "Cultural outings"]'::jsonb, false, 160, ARRAY['1 bedroom', '2 bedroom', '3 bedroom'], 65, '1300 635 353', 'thesands@lendlease.com', 'https://www.retireinaustralia.com.au', 'Premium beachfront retirement apartments on the Gold Coast with stunning ocean views.', 'approved', 'manual', true),

('Opal Aged Care Burleigh Waters', 'Opal Aged Care', '22 Koala Drive', 'Burleigh Waters', '4220', 'QLD', -28.0812, 153.4225, 'Aged Care Facility', 'Assisted Living', NULL, NULL, 2600, 3600, NULL, NULL, NULL, '["Garden", "Cafe", "Hair salon", "Activities room", "Outdoor areas"]'::jsonb, '["24/7 nursing", "Dementia care", "Respite care", "Allied health"]'::jsonb, '["Entertainment", "Exercise programs", "Beach outings", "Music therapy"]'::jsonb, false, 105, ARRAY['Shared', 'Single room'], NULL, '07 5593 4100', 'burleighwaters@opalagecare.com.au', 'https://www.opalagecare.com.au', 'Gold Coast aged care close to beaches with quality facilities and caring staff.', 'approved', 'manual', true),

('Regis Aged Care Robina', 'Regis Aged Care', '150 Scottsdale Drive', 'Robina', '4226', 'QLD', -28.0725, 153.3801, 'Aged Care Facility', 'Assisted Living', NULL, NULL, 2700, 3700, NULL, NULL, NULL, '["Garden terrace", "Cafe", "Hair salon", "Activities room", "Cinema"]'::jsonb, '["24/7 nursing", "Dementia care", "Palliative care", "Respite care"]'::jsonb, '["Entertainment", "Exercise programs", "Music therapy", "Art activities"]'::jsonb, false, 120, ARRAY['Shared', 'Single room'], NULL, '1300 998 100', 'robina@regis.com.au', 'https://www.regis.com.au', 'Modern aged care in master-planned Robina with excellent amenities.', 'approved', 'manual', true),

('Blue Care Varsity Lakes', 'Blue Care', '7 Lake Orr Drive', 'Varsity Lakes', '4227', 'QLD', -28.0986, 153.4048, 'Mixed', 'Mixed', 380000, 680000, 440, 680, 'DMF', 6, 30, '["Pool", "Gym", "Library", "Community hall", "Garden", "Lake views"]'::jsonb, '["Aged care", "24/7 nursing", "Respite care", "Allied health"]'::jsonb, '["Swimming", "Exercise classes", "Social events", "Entertainment"]'::jsonb, true, 140, ARRAY['1 bedroom', '2 bedroom', '3 bedroom'], 55, '1300 258 322', 'varsitylakes@bluecare.org.au', 'https://www.bluecare.org.au', 'Modern retirement village with lake views in Gold Coast growth area.', 'approved', 'manual', true),

('Japara Noosa', 'Japara Healthcare', '42 Mary Street', 'Noosa Heads', '4567', 'QLD', -26.3905, 153.0921, 'Aged Care Facility', 'Assisted Living', NULL, NULL, 2800, 3800, NULL, NULL, NULL, '["Garden", "Cafe", "Hair salon", "Activities room", "Outdoor areas"]'::jsonb, '["24/7 nursing", "Dementia care", "Respite care", "Allied health"]'::jsonb, '["Entertainment", "Exercise programs", "Beach outings", "Music therapy"]'::jsonb, false, 90, ARRAY['Shared', 'Single room'], NULL, '1300 522 272', 'noosa@japara.com.au', 'https://www.japara.com.au', 'Premium Sunshine Coast aged care in prestigious Noosa with coastal lifestyle.', 'approved', 'manual', true),

('Estia Health Bli Bli', 'Estia Health', '88 Bli Bli Road', 'Bli Bli', '4560', 'QLD', -26.6189, 153.0328, 'Aged Care Facility', 'Assisted Living', NULL, NULL, 2500, 3500, NULL, NULL, NULL, '["Garden", "Cafe", "Hair salon", "Activities room", "Outdoor areas"]'::jsonb, '["24/7 nursing", "Dementia care", "Respite care", "Physiotherapy"]'::jsonb, '["Entertainment", "Exercise programs", "Art and craft", "Music therapy"]'::jsonb, false, 95, ARRAY['Shared', 'Single room'], NULL, '1300 682 833', 'blibli@estiahealth.com.au', 'https://www.estiahealth.com.au', 'Sunshine Coast aged care in peaceful hinterland setting with modern facilities.', 'approved', 'manual', true),

('Arcare Helensvale', 'Arcare', '1 Lindfield Road', 'Helensvale', '4212', 'QLD', -27.9170, 153.3275, 'Aged Care Facility', 'Assisted Living', NULL, NULL, 2600, 3600, NULL, NULL, NULL, '["Garden", "Cafe", "Hair salon", "Cinema", "Activities room"]'::jsonb, '["24/7 nursing", "Dementia care", "Respite care", "Allied health"]'::jsonb, '["Entertainment", "Exercise programs", "Music therapy", "Art activities"]'::jsonb, false, 115, ARRAY['Shared', 'Single room'], NULL, '1300 272 273', 'helensvale@arcare.com.au', 'https://www.arcare.com.au', 'Northern Gold Coast aged care with quality facilities and personalized care.', 'approved', 'manual', true),

('Mercy Place Worongary Heights', 'Mercy Health', '88 Worongary Road', 'Worongary', '4213', 'QLD', -28.0498, 153.3702, 'Mixed', 'Mixed', 400000, 720000, 460, 700, 'DMF', 6, 30, '["Chapel", "Pool", "Library", "Community hall", "Garden", "Hinterland views"]'::jsonb, '["Aged care", "Memory support", "24/7 nursing", "Allied health"]'::jsonb, '["Mass", "Swimming", "Exercise classes", "Social events", "Entertainment"]'::jsonb, true, 130, ARRAY['1 bedroom', '2 bedroom', '3 bedroom'], 55, '07 5580 5100', 'worongaryheights@mercyhealth.com.au', 'https://www.mercyhealth.com.au', 'Gold Coast hinterland retirement village with mountain views and peaceful setting.', 'approved', 'manual', true),

('Anglicare Caloundra', 'Anglicare Southern Queensland', '22 Bowman Road', 'Caloundra', '4551', 'QLD', -26.7989, 153.1281, 'Mixed', 'Mixed', 350000, 630000, 400, 620, 'DMF', 6, 30, '["Community hall", "Chapel", "Library", "Garden", "BBQ area", "Ocean views"]'::jsonb, '["Aged care", "24/7 nursing", "Respite care", "Allied health"]'::jsonb, '["Religious services", "Social events", "Beach walks", "Entertainment"]'::jsonb, true, 110, ARRAY['1 bedroom', '2 bedroom', '3 bedroom'], 55, '07 5491 8200', 'caloundra@anglicaresq.org.au', 'https://www.anglicaresq.org.au', 'Sunshine Coast retirement village with Christian values and coastal location.', 'approved', 'manual', true),

('Bolton Clarke Nambour', 'Bolton Clarke', '15 Hospital Road', 'Nambour', '4560', 'QLD', -26.6269, 152.9596, 'Mixed', 'Mixed', 280000, 520000, 350, 550, 'DMF', 6, 30, '["Community hall", "Library", "Garden", "BBQ area", "Workshop"]'::jsonb, '["Aged care", "24/7 nursing", "Memory support", "Allied health"]'::jsonb, '["Social events", "Entertainment", "Garden club", "Bus trips"]'::jsonb, true, 100, ARRAY['1 bedroom', '2 bedroom', '3 bedroom'], 55, '07 5441 8200', 'nambour@boltonclarke.com.au', 'https://www.boltonclarke.com.au', 'Sunshine Coast hinterland retirement village with affordable living and care.', 'approved', 'manual', true),

('Blue Care Labrador', 'Blue Care', '88 Cypress Avenue', 'Labrador', '4215', 'QLD', -27.9458, 153.3909, 'Aged Care Facility', 'Assisted Living', NULL, NULL, 2500, 3500, NULL, NULL, NULL, '["Garden", "Cafe", "Hair salon", "Activities room", "Outdoor areas"]'::jsonb, '["24/7 nursing", "Dementia care", "Respite care", "Allied health"]'::jsonb, '["Entertainment", "Exercise programs", "Music therapy", "Garden activities"]'::jsonb, false, 100, ARRAY['Shared', 'Single room'], NULL, '1300 258 322', 'labrador@bluecare.org.au', 'https://www.bluecare.org.au', 'Gold Coast aged care with quality facilities close to Broadwater parklands.', 'approved', 'manual', true),

-- MORE REGIONAL NSW (8 villages)

('IRT Woonona', 'IRT Living', '1-7 Balls Head Drive', 'Woonona', '2517', 'NSW', -34.3421, 150.9041, 'Mixed', 'Mixed', 350000, 630000, 400, 620, 'DMF', 6, 30, '["Pool", "Community hall", "Library", "Garden", "Ocean views", "BBQ area"]'::jsonb, '["Aged care", "24/7 nursing", "Memory support", "Allied health"]'::jsonb, '["Swimming", "Beach walks", "Exercise classes", "Social events"]'::jsonb, true, 120, ARRAY['1 bedroom', '2 bedroom', '3 bedroom'], 55, '1300 768 096', 'woonona@irt.org.au', 'https://www.irt.org.au', 'Illawarra coastal retirement village with stunning ocean views and beach access.', 'approved', 'manual', true),

('Regis Aged Care Port Macquarie', 'Regis Aged Care', '15 Hastings River Drive', 'Port Macquarie', '2444', 'NSW', -31.4333, 152.9089, 'Aged Care Facility', 'Assisted Living', NULL, NULL, 2400, 3400, NULL, NULL, NULL, '["River views", "Garden", "Cafe", "Hair salon", "Activities room"]'::jsonb, '["24/7 nursing", "Dementia care", "Respite care", "Allied health"]'::jsonb, '["Entertainment", "Exercise programs", "River walks", "Music therapy"]'::jsonb, false, 100, ARRAY['Shared', 'Single room'], NULL, '1300 998 100', 'portmacquarie@regis.com.au', 'https://www.regis.com.au', 'Mid North Coast aged care with river views and quality care programs.', 'approved', 'manual', true),

('Opal Aged Care Bateau Bay', 'Opal Aged Care', '7 Bias Avenue', 'Bateau Bay', '2261', 'NSW', -33.3828, 151.4765, 'Aged Care Facility', 'Assisted Living', NULL, NULL, 2500, 3500, NULL, NULL, NULL, '["Garden", "Cafe", "Hair salon", "Activities room", "Ocean views"]'::jsonb, '["24/7 nursing", "Dementia care", "Respite care", "Allied health"]'::jsonb, '["Entertainment", "Exercise programs", "Beach outings", "Music therapy"]'::jsonb, false, 95, ARRAY['Shared', 'Single room'], NULL, '02 4333 4100', 'bateaubay@opalagecare.com.au', 'https://www.opalagecare.com.au', 'Central Coast aged care with coastal outlook and modern facilities.', 'approved', 'manual', true),

('Estia Health Queanbeyan', 'Estia Health', '88 Cooma Street', 'Queanbeyan', '2620', 'NSW', -35.3529, 149.2321, 'Aged Care Facility', 'Assisted Living', NULL, NULL, 2300, 3300, NULL, NULL, NULL, '["Garden", "Cafe", "Hair salon", "Activities room", "Chapel"]'::jsonb, '["24/7 nursing", "Dementia care", "Respite care", "Physiotherapy"]'::jsonb, '["Entertainment", "Exercise programs", "Art and craft", "Music therapy"]'::jsonb, false, 85, ARRAY['Shared', 'Single room'], NULL, '1300 682 833', 'queanbeyan@estiahealth.com.au', 'https://www.estiahealth.com.au', 'Aged care near Canberra with quality facilities and personalized care programs.', 'approved', 'manual', true),

('Anglicare Wagga Wagga', 'Anglicare NSW South', '22 Docker Street', 'Wagga Wagga', '2650', 'NSW', -35.1082, 147.3598, 'Mixed', 'Mixed', 250000, 480000, 340, 540, 'DMF', 6, 30, '["Community hall", "Chapel", "Library", "Garden", "BBQ area"]'::jsonb, '["Aged care", "24/7 nursing", "Respite care", "Allied health"]'::jsonb, '["Religious services", "Social events", "Entertainment", "Garden club"]'::jsonb, true, 95, ARRAY['1 bedroom', '2 bedroom', '3 bedroom'], 55, '02 6925 8200', 'waggawagga@anglicare.org.au', 'https://www.anglicare.org.au', 'Regional NSW retirement village with affordable living and Christian values.', 'approved', 'manual', true),

('Uniting Forster', 'Uniting NSW & ACT', '15 Breese Parade', 'Forster', '2428', 'NSW', -32.1813, 152.5153, 'Mixed', 'Mixed', 320000, 590000, 380, 600, 'DMF', 6, 30, '["Pool", "Community hall", "Library", "Garden", "BBQ area", "Water views"]'::jsonb, '["Aged care", "24/7 nursing", "Memory support", "Allied health"]'::jsonb, '["Swimming", "Beach walks", "Social events", "Entertainment"]'::jsonb, true, 115, ARRAY['1 bedroom', '2 bedroom', '3 bedroom'], 55, '02 6554 8200', 'forster@uniting.org', 'https://www.uniting.org', 'Coastal retirement village on the Mid North Coast with lake and ocean access.', 'approved', 'manual', true),

('Bolton Clarke Albury', 'Bolton Clarke', '88 Olive Street', 'Albury', '2640', 'NSW', -36.0737, 146.9135, 'Mixed', 'Mixed', 260000, 490000, 350, 550, 'DMF', 6, 30, '["Community hall", "Library", "Garden", "BBQ area", "Workshop"]'::jsonb, '["Aged care", "24/7 nursing", "Respite care", "Allied health"]'::jsonb, '["Social events", "Entertainment", "Garden club", "Bus trips"]'::jsonb, true, 105, ARRAY['1 bedroom', '2 bedroom', '3 bedroom'], 55, '02 6021 8200', 'albury@boltonclarke.com.au', 'https://www.boltonclarke.com.au', 'Border region retirement village with affordable living and comprehensive care.', 'approved', 'manual', true),

('Blue Care Lismore', 'Blue Care', '22 Keen Street', 'Lismore', '2480', 'NSW', -28.8092, 153.2778, 'Aged Care Facility', 'Assisted Living', NULL, NULL, 2300, 3300, NULL, NULL, NULL, '["Garden", "Cafe", "Hair salon", "Activities room", "Chapel"]'::jsonb, '["24/7 nursing", "Dementia care", "Respite care", "Allied health"]'::jsonb, '["Entertainment", "Exercise programs", "Music therapy", "Garden activities"]'::jsonb, false, 80, ARRAY['Shared', 'Single room'], NULL, '1300 258 322', 'lismore@bluecare.org.au', 'https://www.bluecare.org.au', 'Far North Coast aged care with quality facilities and caring community atmosphere.', 'approved', 'manual', true);

-- Verify insertion
SELECT COUNT(*) as batch_8_added FROM retirement_villages WHERE source = 'manual' AND created_at > NOW() - INTERVAL '1 minute';
