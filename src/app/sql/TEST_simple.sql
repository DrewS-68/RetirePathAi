-- Test file with just 2 villages
INSERT INTO retirement_villages (
  name,
  operator,
  location,
  suburb,
  state,
  postcode,
  latitude,
  longitude,
  contact_phone,
  contact_email,
  website,
  village_type,
  care_level,
  total_units,
  entry_price_min,
  entry_price_max,
  monthly_fees_min,
  monthly_fees_max,
  dmf_percentage,
  amenities,
  status,
  source,
  submitted_at
) VALUES
('Test Village One', 'Test Operator', '123 Test Street', 'Perth', 'WA', '6000', -31.9505, 115.8605, '08 9999 9999', 'test1@test.com', 'https://test.com', 'Loan-License', 'Independent', 100, 400000, 900000, 350, 600, 30, '["Swimming Pool", "Gym"]'::jsonb, 'approved', 'manual', NOW()),
('Test Village Two', 'Test Operator', '456 Test Avenue', 'Perth', 'WA', '6000', -31.9505, 115.8605, '08 9999 9998', 'test2@test.com', 'https://test.com', 'Loan-License', 'Mixed', 80, 350000, 800000, 300, 550, 28, '["Library", "Garden"]'::jsonb, 'approved', 'manual', NOW());
