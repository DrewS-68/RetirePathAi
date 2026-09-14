-- TEST BATCH: 5 Villages to Verify Import Works
-- If this works, we'll fix all other batches

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

-- 1. Aveo Newtown TEST
('Aveo Newtown TEST', 'Aveo Group', '88 King Street, Newtown NSW 2042', 'Newtown', '2042', 'NSW', -33.8967, 151.1794, 'leasehold', 'independent', 450000, 680000, 800, 1200, 'DMF', 30, NULL, '["Pool", "Gym", "Community centre", "Library"]'::jsonb, '["Emergency response"]'::jsonb, '["Exercise classes", "Social events"]'::jsonb, false, 45, ARRAY['1 bedroom', '2 bedroom'], 55, '02 9519 3100', 'newtown@aveo.com.au', 'https://www.aveo.com.au', 'TEST - Inner west Sydney retirement community near King Street shopping district', 'approved', 'admin', true),

-- 2. Stockland Glebe TEST
('Stockland Glebe TEST', 'Stockland', '42 Glebe Point Road, Glebe NSW 2037', 'Glebe', '2037', 'NSW', -33.8790, 151.1858, 'leasehold', 'independent', 520000, 780000, 850, 1300, 'DMF', 28, NULL, '["Pool", "Gym", "Bowling green", "Library"]'::jsonb, '["Emergency response"]'::jsonb, '["Bowls", "Social events"]'::jsonb, false, 38, ARRAY['1 bedroom', '2 bedroom'], 55, '02 9660 3100', 'glebe@stockland.com.au', 'https://www.stockland.com.au/retirement', 'TEST - Premium inner-city retirement near Sydney University and harbour', 'approved', 'admin', true),

-- 3. Lendlease Surry Hills TEST
('Lendlease Surry Hills TEST', 'Lendlease', '25 Crown Street, Surry Hills NSW 2010', 'Surry Hills', '2010', 'NSW', -33.8850, 151.2094, 'leasehold', 'assisted', 620000, 920000, 1200, 1800, 'DMF', 32, NULL, '["Pool", "Gym", "Cinema", "Cafe"]'::jsonb, '["Emergency response", "Nursing", "Personal care"]'::jsonb, '["Movies", "Exercise classes"]'::jsonb, false, 28, ARRAY['1 bedroom', '2 bedroom'], 55, '02 9281 3100', 'surryhills@lendlease.com', 'https://www.lendlease.com/au/retirement', 'TEST - Luxury urban retirement in trendy Surry Hills with full care services', 'approved', 'admin', true),

-- 4. Anglicare Erskineville TEST
('Anglicare Erskineville TEST', 'Anglicare', '15 Mitchell Road, Erskineville NSW 2043', 'Erskineville', '2043', 'NSW', -33.8989, 151.1869, 'leasehold', 'independent', 420000, 640000, 750, 1100, 'DMF', 25, NULL, '["Chapel", "Community centre", "Gardens", "Library"]'::jsonb, '["Emergency response"]'::jsonb, '["Chapel services", "Social events", "Gardening"]'::jsonb, true, 42, ARRAY['1 bedroom', '2 bedroom'], 55, '02 9565 3100', 'erskineville@anglicaresq.org.au', 'https://www.anglicaresq.org.au', 'TEST - Inner Sydney retirement with chapel and community focus', 'approved', 'admin', true),

-- 5. BaptistCare Redfern TEST
('BaptistCare Redfern TEST', 'BaptistCare', '88 Redfern Street, Redfern NSW 2016', 'Redfern', '2016', 'NSW', -33.8928, 151.2054, 'leasehold', 'independent', 480000, 720000, 800, 1250, 'DMF', 27, NULL, '["Pool", "Chapel", "Community centre", "Gym"]'::jsonb, '["Emergency response"]'::jsonb, '["Chapel services", "Exercise classes", "Social events"]'::jsonb, false, 50, ARRAY['1 bedroom', '2 bedroom', '3 bedroom'], 55, '02 9698 3100', 'redfern@baptistcare.org.au', 'https://www.baptistcare.org.au', 'TEST - Inner-city retirement near Redfern station with excellent transport links', 'approved', 'admin', true);
