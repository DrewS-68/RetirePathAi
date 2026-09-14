-- Batch 10: NSW and QLD Expansion Villages
-- Adds 50 villages across NSW and QLD regions

INSERT INTO retirement_villages (
  name,
  operator,
  location,
  suburb,
  state,
  postcode,
  latitude,
  longitude,
  phone,
  email,
  website,
  village_type,
  care_type,
  accommodation_types,
  units_available,
  pricing_model,
  entry_fee_min,
  entry_fee_max,
  weekly_fee_min,
  weekly_fee_max,
  dmf_percentage,
  amenities,
  status,
  submission_date
) VALUES
-- NSW Coastal and Regional
('Opal Forster', 'Opal HealthCare', '15 Strand Street', 