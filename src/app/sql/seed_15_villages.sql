-- Seed 15 Realistic Australian Retirement Villages
-- Use this in Supabase SQL Editor to quickly add sample villages

INSERT INTO retirement_villages (
  name,
  operator,
  location,
  suburb,
  state,
  postcode,
  latitude,
  longitude,
  village_type,
  care_level,
  entry_price_min,
  entry_price_max,
  monthly_fees_min,
  monthly_fees_max,
  amenities,
  care_services,
  bedrooms,
  pet_friendly,
  total_units,
  age_restriction,
  contact_email,
  description,
  status,
  source,
  verified,
  featured,
  submitted_at,
  approved_at
) VALUES

-- 1. Aveo Newstead (Brisbane, QLD)
('Aveo Newstead', 'Aveo Group', '25 Commercial Road', 'Newstead', 'QLD', '4006', -27.4517, 153.0415, 'independent', 'independent', 450000, 850000, 450, 750, 
'["pool", "gym", "restaurant", "cinema", "library", "common-room", "workshop"]'::jsonb, 
'["emergency-call", "on-site-manager"]'::jsonb, 
ARRAY['1-bed', '2-bed', '3-bed'], true, 156, 55, 
'info@aveo.com.au', 
'Modern retirement living in the heart of Brisbane''s vibrant Newstead precinct. Featuring contemporary apartments with resort-style facilities including pool, gym, cinema, and restaurant.', 
'approved', 'seed_data', true, true, NOW(), NOW()),

-- 2. Lendlease The Grange (Gold Coast, QLD)
('Lendlease The Grange', 'Lendlease', '142-178 Ferny Avenue', 'Surfers Paradise', 'QLD', '4217', -28.0023, 153.4283, 'independent', 'independent', 520000, 1200000, 550, 850, 
'["pool", "gym", "bowling-green", "library", "common-room", "bbq-area", "workshop"]'::jsonb, 
'["emergency-call", "on-site-manager", "visiting-nurse"]'::jsonb, 
ARRAY['2-bed', '3-bed'], true, 204, 55, 
'contact@lendlease.com', 
'Luxury beachside retirement living on the Gold Coast. Spacious villas and apartments with ocean views, heated pool, bowling green, and easy beach access.', 
'approved', 'seed_data', true, true, NOW(), NOW()),

-- 3. Stockland Willowdale (Sydney, NSW)
('Stockland Willowdale', 'Stockland', '6 Willowdale Drive', 'Denham Court', 'NSW', '2565', -33.9847, 150.8542, 'independent', 'independent', 485000, 725000, 420, 680, 
'["pool", "library", "common-room", "bbq-area", "garden", "workshop"]'::jsonb, 
'["emergency-call", "on-site-manager"]'::jsonb, 
ARRAY['2-bed', '3-bed'], true, 142, 55, 
'retirement@stockland.com.au', 
'Peaceful village set amongst gardens in Sydney''s southwest. Modern homes with community center, heated pool, and close to shopping centers.', 
'approved', 'seed_data', true, false, NOW(), NOW()),

-- 4. Ingenia Lifestyle Marion Bay (Tasmania)
('Ingenia Lifestyle Marion Bay', 'Ingenia Communities', '15 Marion Bay Road', 'Marion Bay', 'TAS', '7175', -42.9667, 147.9333, 'independent', 'independent', 195000, 385000, 180, 320, 
'["bowling-green", "common-room", "bbq-area", "garden"]'::jsonb, 
'["emergency-call"]'::jsonb, 
ARRAY['2-bed', '3-bed'], true, 68, 55, 
'hello@ingeniacommunities.com.au', 
'Coastal retirement village with stunning bay views. Affordable manufactured homes in a peaceful seaside setting with bowling green and community hall.', 
'approved', 'seed_data', true, false, NOW(), NOW()),

-- 5. Baptcare Westhaven (Melbourne, VIC)
('Baptcare Westhaven', 'Baptcare', '75 Hopetoun Avenue', 'Werribee', 'VIC', '3030', -37.9, 144.6633, 'assisted', 'assisted', 320000, 480000, 380, 580, 
'["chapel", "library", "common-room", "garden", "hairdresser"]'::jsonb, 
'["emergency-call", "on-site-manager", "visiting-nurse", "meals", "housekeeping", "transport"]'::jsonb, 
ARRAY['1-bed', '2-bed'], false, 94, 55, 
'westhaven@baptcare.org.au', 
'Faith-based retirement community in Melbourne''s west. Welcoming village with modern units, chapel, community center, and aged care services available.', 
'approved', 'seed_data', true, false, NOW(), NOW()),

-- 6. Uniting AgeWell Strathdon (Melbourne, VIC)
('Uniting AgeWell Strathdon', 'Uniting AgeWell', '127 Canterbury Road', 'Canterbury', 'VIC', '3126', -37.8267, 145.0633, 'aged-care', 'aged-care', 420000, 620000, 480, 720, 
'["library", "common-room", "garden", "hairdresser", "cafe"]'::jsonb, 
'["emergency-call", "on-site-manager", "visiting-nurse", "meals", "housekeeping", "personal-care", "transport", "24hr-care"]'::jsonb, 
ARRAY['1-bed', '2-bed'], false, 112, 55, 
'info@unitingagewell.org', 
'Inner-city Melbourne retirement village with easy access to shops, cafes and transport. Modern apartments with full aged care services on-site.', 
'approved', 'seed_data', true, false, NOW(), NOW()),

-- 7. Ryman Healthcare Charles Upham (Geelong, VIC)
('Ryman Healthcare Charles Upham', 'Ryman Healthcare', '83-101 Mein Street', 'Newtown', 'VIC', '3220', -38.1542, 144.3283, 'aged-care', 'aged-care', 480000, 920000, 520, 850, 
'["pool", "gym", "bowling-green", "cinema", "restaurant", "library", "common-room", "hairdresser", "cafe", "garden"]'::jsonb, 
'["emergency-call", "on-site-manager", "visiting-nurse", "meals", "housekeeping", "personal-care", "24hr-care", "dementia-care"]'::jsonb, 
ARRAY['1-bed', '2-bed', '3-bed'], true, 238, 55, 
'enquiry@rymanhealthcare.com', 
'Premium retirement village in Geelong with independent villas, serviced apartments, and care facilities. Features include pool, gym, bowling green, cinema, and restaurant.', 
'approved', 'seed_data', true, true, NOW(), NOW()),

-- 8. Bethanie Waters (Perth, WA)
('Bethanie Waters', 'Bethanie Group', '1 Bethanie Way', 'Southern River', 'WA', '6110', -32.1, 115.9433, 'aged-care', 'aged-care', 395000, 695000, 420, 680, 
'["pool", "gym", "bowling-green", "library", "common-room", "chapel", "hairdresser", "cafe", "bbq-area", "garden"]'::jsonb, 
'["emergency-call", "on-site-manager", "visiting-nurse", "meals", "housekeeping", "personal-care", "transport", "24hr-care", "dementia-care"]'::jsonb, 
ARRAY['2-bed', '3-bed'], true, 176, 55, 
'enquiries@bethanie.com.au', 
'Large retirement village in Perth''s southeast with beautiful lake views. Offers independent living villas and full residential aged care. Extensive facilities including pool, gym, and bowling green.', 
'approved', 'seed_data', true, false, NOW(), NOW()),

-- 9. Anglicare Sydney Ryde Gardens (Sydney, NSW)
('Anglicare Sydney Ryde Gardens', 'Anglicare Sydney', '45 Victoria Road', 'Ryde', 'NSW', '2112', -33.8142, 151.1042, 'assisted', 'assisted', 495000, 685000, 460, 650, 
'["library", "common-room", "chapel", "garden", "hairdresser"]'::jsonb, 
'["emergency-call", "on-site-manager", "visiting-nurse", "meals", "housekeeping", "transport"]'::jsonb, 
ARRAY['1-bed', '2-bed'], false, 86, 55, 
'info@anglicare.org.au', 
'Well-established retirement village in Sydney''s north with peaceful gardens. Independent living units and serviced apartments with strong community focus.', 
'approved', 'seed_data', true, false, NOW(), NOW()),

-- 10. Keyton Halcyon Landing (Melbourne, VIC)
('Keyton Halcyon Landing', 'Keyton', '89 Wellington Road', 'Clayton', 'VIC', '3168', -37.9217, 145.1233, 'independent', 'independent', 420000, 620000, 390, 580, 
'["gym", "cinema", "library", "common-room", "workshop", "bbq-area"]'::jsonb, 
'["emergency-call", "on-site-manager"]'::jsonb, 
ARRAY['1-bed', '2-bed'], true, 142, 55, 
'hello@keyton.com.au', 
'Modern apartments for over 55s in Melbourne''s southeast. Contemporary design with rooftop terrace, gym, cinema, and workshop. Close to Monash Medical Centre and Westfield Southland.', 
'approved', 'seed_data', true, false, NOW(), NOW()),

-- 11. Estia Villages The Palms (Gold Coast, QLD)
('Estia Villages The Palms', 'Estia Health', '156 Palms Road', 'Mudgeeraba', 'QLD', '4213', -28.0817, 153.3717, 'independent', 'independent', 385000, 625000, 380, 580, 
'["pool", "bowling-green", "common-room", "library", "bbq-area", "garden"]'::jsonb, 
'["emergency-call", "on-site-manager", "visiting-nurse"]'::jsonb, 
ARRAY['2-bed', '3-bed'], true, 98, 55, 
'villages@estiahealth.com.au', 
'Tropical retirement village in Gold Coast hinterland. Spacious villas surrounded by palm trees with pool, community center, and close to shopping village.', 
'approved', 'seed_data', true, false, NOW(), NOW()),

-- 12. Peninsula Villages Umina Beach (Central Coast, NSW)
('Peninsula Villages Umina Beach', 'Peninsula Villages', '55 Trafalgar Avenue', 'Umina Beach', 'NSW', '2257', -33.5242, 151.3158, 'assisted', 'assisted', 425000, 785000, 420, 680, 
'["pool", "bowling-green", "library", "common-room", "bbq-area", "garden", "hairdresser"]'::jsonb, 
'["emergency-call", "on-site-manager", "visiting-nurse", "meals", "housekeeping", "transport"]'::jsonb, 
ARRAY['1-bed', '2-bed', '3-bed'], true, 164, 55, 
'info@pvl.com.au', 
'Beachside retirement village on the Central Coast. Short walk to beach and shops. Independent villas and serviced apartments with pool, bowling green, and community center.', 
'approved', 'seed_data', true, false, NOW(), NOW()),

-- 13. Arcadia Waters (Melbourne, VIC)
('Arcadia Waters', 'Arcadia Care', '12 Lake Drive', 'Pakenham', 'VIC', '3810', -38.0733, 145.4833, 'independent', 'independent', 325000, 525000, 320, 480, 
'["common-room", "library", "bbq-area", "garden", "workshop"]'::jsonb, 
'["emergency-call", "on-site-manager"]'::jsonb, 
ARRAY['2-bed', '3-bed'], true, 72, 55, 
'info@arcadiacare.com.au', 
'Family-owned village in Melbourne''s southeast growth corridor. Modern homes around central lake with emphasis on community and affordability.', 
'approved', 'seed_data', true, false, NOW(), NOW()),

-- 14. Masonic Care Narelle Cox (Brisbane, QLD)
('Masonic Care Narelle Cox', 'Masonic Care Queensland', '88 Ewing Road', 'Woodridge', 'QLD', '4114', -27.6392, 153.1092, 'independent', 'independent', 185000, 325000, 220, 380, 
'["library", "common-room", "bbq-area", "garden"]'::jsonb, 
'["emergency-call", "on-site-manager"]'::jsonb, 
ARRAY['1-bed', '2-bed'], true, 54, 55, 
'enquiries@masoniccare.org.au', 
'Affordable retirement living in Logan with strong community spirit. Independent units with access to community center, library, and regular social activities.', 
'approved', 'seed_data', true, false, NOW(), NOW()),

-- 15. Japara Bayview Gardens (Melbourne, VIC)
('Japara Bayview Gardens', 'Japara Healthcare', '234 Bay Road', 'Sandringham', 'VIC', '3191', -37.9525, 145.0042, 'aged-care', 'aged-care', 580000, 850000, 520, 780, 
'["pool", "gym", "library", "common-room", "hairdresser", "cafe", "garden"]'::jsonb, 
'["emergency-call", "on-site-manager", "visiting-nurse", "meals", "housekeeping", "personal-care", "24hr-care", "dementia-care"]'::jsonb, 
ARRAY['1-bed', '2-bed'], false, 128, 55, 
'enquiries@japara.com.au', 
'Premium bayside retirement living with aged care services. Close to beach, cafes, and Sandringham village. Modern apartments with resort-style amenities.', 
'approved', 'seed_data', true, true, NOW(), NOW());
