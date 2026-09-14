-- QLD Regional Operators: Applewood and Rivervue
-- Geographic Focus: Southeast Queensland and Victoria
-- Import via Supabase SQL Editor

INSERT INTO retirement_villages (
  name,
  operator,
  location,
  suburb,
  postcode,
  state,
  village_type,
  care_level,
  entry_price_min,
  entry_price_max,
  monthly_fees_min,
  monthly_fees_max,
  amenities,
  total_units,
  contact_phone,
  contact_email,
  website,
  description,
  status,
  source,
  verified
) VALUES

-- APPLEWOOD RETIREMENT VILLAGES
('Applewood Retirement Village Burleigh Heads', 'Applewood', '15 Tallebudgera Creek Road, Burleigh Heads QLD 4220', 'Burleigh Heads', '4220', 'QLD', 'Independent Living', 'independent', 420000, 680000, 180, 260, '[\"Community Centre\", \"Gardens\", \"BBQ Areas\", \"Close to Beach\", \"Village Atmosphere\"]'::jsonb, 45, '07 5576 4000', 'enquiries@applewood.com.au', 'https://www.applewood.com.au', 'Boutique retirement community in the heart of Burleigh Heads, Gold Coast. Modern independent living villas close to James Street dining precinct and Burleigh Beach. Peaceful garden setting with community facilities. Walk to cafes, shops and the beach.', 'approved', 'admin', true),

('Applewood Retirement Village Palm Beach', 'Applewood', '1145 Gold Coast Highway, Palm Beach QLD 4221', 'Palm Beach', '4221', 'QLD', 'Independent Living', 'independent', 380000, 620000, 170, 240, '[\"Gardens\", \"Community Centre\", \"BBQ Areas\", \"Peaceful Setting\", \"Boutique Community\"]'::jsonb, 38, '07 5534 2000', 'palmbeach@applewood.com.au', 'https://www.applewood.com.au', 'Gold Coast retirement village in desirable Palm Beach location. Contemporary villas in a boutique community setting. Beautiful gardens and peaceful atmosphere. Minutes to Palm Beach shops, Tallebudgera Creek and southern Gold Coast beaches.', 'approved', 'admin', true),

('Applewood Retirement Village Doncaster', 'Applewood', 'Tram Road, Doncaster VIC 3108', 'Doncaster', '3108', 'VIC', 'Independent Living', 'independent', 520000, 780000, 200, 280, '[\"Community Centre\", \"Gardens\", \"BBQ Areas\", \"Close to Shopping\", \"Village Atmosphere\", \"Public Transport\"]'::jsonb, 65, '03 9842 2000', 'doncaster@applewood.com.au', 'https://www.applewood.com.au', 'Premium Melbourne retirement community in the established eastern suburb of Doncaster. Quality independent living villas with modern amenities. Beautiful gardens and peaceful village atmosphere. Close to Westfield Doncaster, public transport, and excellent medical facilities. Easy access to city and Yarra Valley.', 'approved', 'admin', true),

-- RIVERVUE RETIREMENT VILLAGE
('Rivervue Retirement Village', 'Rivervue', '180 Maribyrnong Road, Avondale Heights VIC 3034', 'Avondale Heights', '3034', 'VIC', 'Independent Living', 'independent', 450000, 720000, 190, 280, '[\"Pool\", \"Bowling Green\", \"River Views\", \"Community Centre\", \"Gardens\", \"River Access\", \"Dining Room\", \"Library\"]'::jsonb, 120, '03 9317 4200', 'info@rivervue.com.au', 'https://www.rivervue.com.au', 'Premium Melbourne retirement community with stunning Maribyrnong River views. Spacious independent living villas and apartments set in landscaped gardens. Community centre, pool, bowling green and river access. Excellent dining and social programs. Close to Highpoint Shopping Centre and medical facilities.', 'approved', 'admin', true);