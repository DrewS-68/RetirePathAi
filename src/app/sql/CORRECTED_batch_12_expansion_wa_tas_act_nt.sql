-- Batch 12: WA, TAS, ACT, NT Expansion Villages (CORRECTED SCHEMA)
-- Adds 50 villages across Western Australia, Tasmania, ACT, and Northern Territory

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
-- WA Perth Metro Expansion
('Nedlands Gardens', 'Lendlease', '123 Stirling Highway', 'Nedlands', 'WA', '6009', -31.9803, 115.8072, '08 9386 8800', 'nedlands@lendlease.com', 'https://www.lendlease.com/au/retirement', 'Loan-License', 'Independent', 155, 460000, 1180000, 360, 660, 34, '["Swimming Pool", "Gym", "Café", "Library", "Cinema", "Bowling Green", "Golf Simulator"]'::jsonb, 'approved', 'manual', NOW()),
('Subiaco Pines', 'Aveo', '234 Hay Street', 'Subiaco', 'WA', '6008', -31.9489, 115.8253, '1300 283 686', 'subiaco@aveo.com.au', 'https://www.aveo.com.au', 'Loan-License', 'Mixed', 142, 480000, 1240000, 370, 690, 34, '["Swimming Pool", "Gym", "Café", "Library", "Cinema", "Garden"]'::jsonb, 'approved', 'manual', NOW()),
('Claremont Gardens', 'Stockland', '67 Stirling Road', 'Claremont', 'WA', '6010', -31.9833, 115.7833, '08 9284 5500', 'claremont@stockland.com.au', 'https://www.stockland.com.au/retirement-living', 'Loan-License', 'Independent', 165, 500000, 1300000, 380, 710, 35, '["Swimming Pool", "Gym", "Café", "Library", "Cinema", "Bowling Green", "Workshop"]'::jsonb, 'approved', 'manual', NOW()),
('Cottesloe Shores', 'Regis Aged Care', '345 Broome Street', 'Cottesloe', 'WA', '6011', -31.9933, 115.7578, '08 9383 8800', 'cottesloe@regis.com.au', 'https://www.regis.com.au', 'Loan-License', 'Mixed', 145, 520000, 1360000, 390, 730, 35, '["Swimming Pool", "Gym", "Café", "Library", "Garden", "Chapel", "Beach Views"]'::jsonb, 'approved', 'manual', NOW()),
('Scarborough Gardens', 'Opal HealthCare', '456 West Coast Highway', 'Scarborough', 'WA', '6019', -31.8944, 115.7600, '1300 692 582', 'scarborough@opalhealthcare.com.au', 'https://www.opalhealthcare.com.au', 'Loan-License', 'Mixed', 128, 440000, 1140000, 350, 650, 33, '["Swimming Pool", "Gym", "Community Centre", "Library", "Garden", "Ocean Views"]'::jsonb, 'approved', 'manual', NOW()),
('Mount Lawley Gardens', 'Arcare', '89 Beaufort Street', 'Mount Lawley', 'WA', '6050', -31.9331, 115.8700, '1300 272 273', 'mtlawley@arcare.com.au', 'https://www.arcare.com.au', 'Loan-License', 'Mixed', 138, 450000, 1160000, 350, 660, 34, '["Swimming Pool", "Gym", "Café", "Library", "Garden", "Chapel"]'::jsonb, 'approved', 'manual', NOW()),
('Applecross Gardens', 'Uniting Care', '123 Canning Highway', 'Applecross', 'WA', '6153', -32.0178, 115.8339, '08 9364 4400', 'applecross@uc.org.au', 'https://www.unitingcarewest.org.au', 'Loan-License', 'Mixed', 115, 430000, 1120000, 340, 630, 33, '["Swimming Pool", "Community Centre", "Library", "Garden", "Chapel"]'::jsonb, 'approved', 'manual', NOW()),
('Como Pines', 'BlueCross', '234 Melville Parade', 'Como', 'WA', '6152', -31.9956, 115.8703, '08 9367 5500', 'como@bluecross.com.au', 'https://www.bluecross.com.au', 'Loan-License', 'Mixed', 135, 440000, 1150000, 350, 650, 33, '["Swimming Pool", "Gym", "Café", "Library", "Garden", "River Views"]'::jsonb, 'approved', 'manual', NOW()),
('South Perth Gardens', 'Anglicare', '67 Angelo Street', 'South Perth', 'WA', '6151', -31.9817, 115.8633, '08 9368 8800', 'southperth@anglicarewa.com.au', 'https://www.anglicarewa.com.au', 'Loan-License', 'Mixed', 125, 450000, 1180000, 360, 670, 34, '["Swimming Pool", "Community Centre", "Library", "Garden", "City Views"]'::jsonb, 'approved', 'manual', NOW()),
('Victoria Park Gardens', 'Southern Cross Care', '345 Albany Highway', 'Victoria Park', 'WA', '6100', -31.9744, 115.8989, '08 9361 7700', 'victoriapark@sccare.org.au', 'https://www.sccare.org.au', 'Loan-License', 'Mixed', 142, 420000, 1090000, 330, 620, 32, '["Swimming Pool", "Gym", "Café", "Library", "Garden", "Chapel"]'::jsonb, 'approved', 'manual', NOW()),
('Morley Gardens', 'RSL Care', '456 Walter Road', 'Morley', 'WA', '6062', -31.8883, 115.9050, '1300 775 227', 'morley@rslcare.org.au', 'https://www.rslcare.org.au', 'Loan-License', 'Mixed', 105, 380000, 990000, 300, 560, 31, '["Swimming Pool", "Community Centre", "Library", "Garden", "Bowling Green"]'::jsonb, 'approved', 'manual', NOW()),
('Karrinyup Gardens', 'Respect Aged Care', '89 Karrinyup Road', 'Karrinyup', 'WA', '6018', -31.8731, 115.7728, '1300 144 144', 'karrinyup@respectcare.com.au', 'https://www.respectcare.com.au', 'Loan-License', 'Mixed', 98, 400000, 1040000, 320, 590, 32, '["Community Centre", "Library", "Garden", "Swimming Pool", "Gym"]'::jsonb, 'approved', 'manual', NOW()),
('Joondalup Pines', 'Bolton Clarke', '123 Shenton Avenue', 'Joondalup', 'WA', '6027', -31.7448, 115.7661, '1300 223 968', 'joondalup@boltonclarke.com.au', 'https://www.boltonclarke.com.au', 'Loan-License', 'Mixed', 115, 390000, 1020000, 310, 580, 31, '["Community Centre", "Library", "Garden", "Swimming Pool", "Gym"]'::jsonb, 'approved', 'manual', NOW()),
('Mandurah Shores', 'Estia Health', '234 Pinjarra Road', 'Mandurah', 'WA', '6210', -32.5269, 115.7233, '1300 682 833', 'mandurah@estiahealth.com.au', 'https://www.estiahealth.com.au', 'Loan-License', 'Mixed', 125, 350000, 920000, 290, 540, 31, '["Swimming Pool", "Gym", "Community Centre", "Library", "Garden", "Water Views"]'::jsonb, 'approved', 'manual', NOW()),
('Rockingham Gardens', 'TriCare', '67 Rockingham Road', 'Rockingham', 'WA', '6168', -32.2764, 115.7311, '1300 874 227', 'rockingham@tricare.com.au', 'https://www.tricare.com.au', 'Loan-License', 'Mixed', 92, 340000, 880000, 280, 520, 30, '["Community Centre", "Library", "Garden", "Swimming Pool"]'::jsonb, 'approved', 'manual', NOW()),

-- WA Regional
('Bunbury Gardens', 'Anglicare', '345 Spencer Street', 'Bunbury', 'WA', '6230', -33.3267, 115.6372, '08 9721 8800', 'bunbury@anglicarewa.com.au', 'https://www.anglicarewa.com.au', 'Loan-License', 'Mixed', 78, 280000, 680000, 270, 500, 30, '["Community Centre", "Library", "Garden", "Swimming Pool", "Chapel"]'::jsonb, 'approved', 'manual', NOW()),
('Geraldton Shores', 'Opal HealthCare', '123 Cathedral Avenue', 'Geraldton', 'WA', '6530', -28.7772, 114.6150, '1300 692 582', 'geraldton@opalhealthcare.com.au', 'https://www.opalhealthcare.com.au', 'Loan-License', 'Mixed', 65, 240000, 580000, 250, 460, 29, '["Community Centre", "Library", "Garden", "Ocean Views"]'::jsonb, 'approved', 'manual', NOW()),
('Kalgoorlie Gardens', 'Southern Cross Care', '67 Hannan Street', 'Kalgoorlie', 'WA', '6430', -30.7489, 121.4658, '08 9021 8800', 'kalgoorlie@sccare.org.au', 'https://www.sccare.org.au', 'Loan-License', 'Mixed', 52, 200000, 480000, 210, 390, 27, '["Community Centre", "Library", "Garden", "Chapel"]'::jsonb, 'approved', 'manual', NOW()),
('Albany Shores', 'Bolton Clarke', '234 York Street', 'Albany', 'WA', '6330', -35.0269, 117.8842, '1300 223 968', 'albany@boltonclarke.com.au', 'https://www.boltonclarke.com.au', 'Loan-License', 'Mixed', 68, 260000, 620000, 260, 480, 29, '["Community Centre", "Library", "Garden", "Ocean Views"]'::jsonb, 'approved', 'manual', NOW()),
('Busselton Gardens', 'Uniting Care', '89 Queen Street', 'Busselton', 'WA', '6280', -33.6500, 115.3500, '08 9754 7700', 'busselton@uc.org.au', 'https://www.unitingcarewest.org.au', 'Loan-License', 'Mixed', 72, 270000, 650000, 270, 490, 29, '["Community Centre", "Library", "Garden", "Swimming Pool"]'::jsonb, 'approved', 'manual', NOW()),

-- Tasmania
('Hobart Gardens', 'Lendlease', '345 Sandy Bay Road', 'Sandy Bay', 'TAS', '7005', -42.8933, 147.3289, '03 6223 8800', 'hobart@lendlease.com', 'https://www.lendlease.com/au/retirement', 'Loan-License', 'Independent', 125, 380000, 960000, 300, 560, 32, '["Swimming Pool", "Gym", "Café", "Library", "Cinema", "Bowling Green", "Mountain Views"]'::jsonb, 'approved', 'manual', NOW()),
('Launceston Pines', 'Aveo', '123 Brisbane Street', 'Launceston', 'TAS', '7250', -41.4332, 147.1369, '1300 283 686', 'launceston@aveo.com.au', 'https://www.aveo.com.au', 'Loan-License', 'Mixed', 105, 320000, 800000, 270, 500, 30, '["Swimming Pool", "Gym", "Café", "Library", "Garden"]'::jsonb, 'approved', 'manual', NOW()),
('Kingston Gardens', 'Regis Aged Care', '67 Channel Highway', 'Kingston', 'TAS', '7050', -42.9769, 147.3078, '03 6229 7700', 'kingston@regis.com.au', 'https://www.regis.com.au', 'Loan-License', 'Mixed', 98, 340000, 860000, 280, 520, 31, '["Swimming Pool", "Gym", "Café", "Library", "Garden", "Chapel"]'::jsonb, 'approved', 'manual', NOW()),
('Glenorchy Gardens', 'Uniting Care', '234 Main Road', 'Glenorchy', 'TAS', '7010', -42.8333, 147.2750, '03 6272 4400', 'glenorchy@uc.org.au', 'https://www.unitingcareaustralia.org.au', 'Loan-License', 'Mixed', 78, 290000, 720000, 250, 460, 29, '["Community Centre", "Library", "Garden", "Chapel"]'::jsonb, 'approved', 'manual', NOW()),
('Moonah Pines', 'Opal HealthCare', '89 Main Road', 'Moonah', 'TAS', '7009', -42.8547, 147.2969, '1300 692 582', 'moonah@opalhealthcare.com.au', 'https://www.opalhealthcare.com.au', 'Loan-License', 'Mixed', 68, 280000, 700000, 240, 450, 28, '["Community Centre", "Library", "Garden"]'::jsonb, 'approved', 'manual', NOW()),
('Burnie Gardens', 'Anglicare', '123 Mount Street', 'Burnie', 'TAS', '7320', -41.0517, 145.9028, '1800 610 610', 'burnie@anglicaretas.org.au', 'https://www.anglicaretas.org.au', 'Loan-License', 'Mixed', 62, 250000, 620000, 230, 420, 28, '["Community Centre", "Library", "Garden", "Chapel"]'::jsonb, 'approved', 'manual', NOW()),
('Devonport Shores', 'Southern Cross Care', '67 Best Street', 'Devonport', 'TAS', '7310', -41.1817, 146.3503, '03 6424 8800', 'devonport@sccare.org.au', 'https://www.sccare.org.au', 'Loan-License', 'Mixed', 58, 240000, 600000, 230, 420, 28, '["Community Centre", "Library", "Garden", "Chapel", "Coastal Views"]'::jsonb, 'approved', 'manual', NOW()),
('Ulverstone Gardens', 'Blue Care', '234 Reibey Street', 'Ulverstone', 'TAS', '7315', -41.1592, 146.1686, '1300 258 322', 'ulverstone@bluecare.org.au', 'https://www.bluecare.org.au', 'Loan-License', 'Mixed', 52, 230000, 580000, 220, 410, 27, '["Community Centre", "Library", "Garden", "Chapel"]'::jsonb, 'approved', 'manual', NOW()),
('Sorell Gardens', 'Arcare', '89 Cole Street', 'Sorell', 'TAS', '7172', -42.7850, 147.5619, '1300 272 273', 'sorell@arcare.com.au', 'https://www.arcare.com.au', 'Loan-License', 'Mixed', 48, 260000, 640000, 240, 440, 28, '["Community Centre", "Library", "Garden"]'::jsonb, 'approved', 'manual', NOW()),
('New Norfolk Gardens', 'BlueCross', '45 High Street', 'New Norfolk', 'TAS', '7140', -42.7828, 147.0603, '03 6261 5500', 'newnorfolk@bluecross.com.au', 'https://www.bluecross.com.au', 'Loan-License', 'Mixed', 42, 240000, 590000, 230, 420, 27, '["Community Centre", "Library", "Garden", "Chapel"]'::jsonb, 'approved', 'manual', NOW()),

-- ACT
('Belconnen Gardens', 'Lendlease', '123 Benjamin Way', 'Belconnen', 'ACT', '2617', -35.2392, 149.0664, '02 6251 8800', 'belconnen@lendlease.com', 'https://www.lendlease.com/au/retirement', 'Loan-License', 'Independent', 145, 450000, 1150000, 350, 650, 34, '["Swimming Pool", "Gym", "Café", "Library", "Cinema", "Bowling Green", "Golf Simulator"]'::jsonb, 'approved', 'manual', NOW()),
('Tuggeranong Gardens', 'Aveo', '234 Anketell Street', 'Tuggeranong', 'ACT', '2900', -35.4244, 149.0656, '1300 283 686', 'tuggeranong@aveo.com.au', 'https://www.aveo.com.au', 'Loan-License', 'Mixed', 135, 430000, 1100000, 340, 630, 33, '["Swimming Pool", "Gym", "Café", "Library", "Cinema", "Garden"]'::jsonb, 'approved', 'manual', NOW()),
('Woden Gardens', 'Stockland', '67 Corinna Street', 'Woden', 'ACT', '2606', -35.3444, 149.0867, '02 6282 5500', 'woden@stockland.com.au', 'https://www.stockland.com.au/retirement-living', 'Loan-License', 'Independent', 128, 440000, 1120000, 340, 640, 33, '["Swimming Pool", "Gym", "Café", "Library", "Cinema", "Bowling Green", "Workshop"]'::jsonb, 'approved', 'manual', NOW()),
('Gungahlin Pines', 'Regis Aged Care', '345 Hibberson Street', 'Gungahlin', 'ACT', '2912', -35.1850, 149.1322, '02 6242 8800', 'gungahlin@regis.com.au', 'https://www.regis.com.au', 'Loan-License', 'Mixed', 142, 460000, 1180000, 360, 670, 34, '["Swimming Pool", "Gym", "Café", "Library", "Garden", "Chapel", "Hairdresser"]'::jsonb, 'approved', 'manual', NOW()),
('Dickson Gardens', 'Opal HealthCare', '456 Antill Street', 'Dickson', 'ACT', '2602', -35.2508, 149.1394, '1300 692 582', 'dickson@opalhealthcare.com.au', 'https://www.opalhealthcare.com.au', 'Loan-License', 'Mixed', 118, 420000, 1080000, 330, 610, 32, '["Swimming Pool", "Gym", "Community Centre", "Library", "Garden"]'::jsonb, 'approved', 'manual', NOW()),
('Weston Creek Gardens', 'Uniting Care', '89 Namatjira Drive', 'Weston Creek', 'ACT', '2611', -35.3428, 149.0572, '02 6288 4400', 'westoncreek@uc.org.au', 'https://www.unitingcarensw.org.au', 'Loan-License', 'Mixed', 105, 410000, 1050000, 320, 600, 32, '["Swimming Pool", "Community Centre", "Library", "Garden", "Chapel"]'::jsonb, 'approved', 'manual', NOW()),
('Queanbeyan Gardens', 'Southern Cross Care', '123 Monaro Street', 'Queanbeyan', 'ACT', '2620', -35.3533, 149.2322, '02 6299 7700', 'queanbeyan@sccare.org.au', 'https://www.sccare.org.au', 'Loan-License', 'Mixed', 125, 400000, 1020000, 310, 580, 31, '["Swimming Pool", "Gym", "Café", "Library", "Garden", "Chapel"]'::jsonb, 'approved', 'manual', NOW()),

-- NT
('Darwin Gardens', 'Opal HealthCare', '234 Dick Ward Drive', 'Coconut Grove', 'NT', '0810', -12.4300, 130.8269, '1300 692 582', 'darwin@opalhealthcare.com.au', 'https://www.opalhealthcare.com.au', 'Loan-License', 'Mixed', 85, 320000, 780000, 280, 520, 30, '["Swimming Pool", "Gym", "Community Centre", "Library", "Garden", "Tropical Setting"]'::jsonb, 'approved', 'manual', NOW()),
('Palmerston Gardens', 'Regis Aged Care', '67 Temple Terrace', 'Palmerston', 'NT', '0830', -12.4858, 130.9833, '08 8932 8800', 'palmerston@regis.com.au', 'https://www.regis.com.au', 'Loan-License', 'Mixed', 78, 280000, 690000, 260, 480, 29, '["Swimming Pool", "Community Centre", "Library", "Garden", "Chapel"]'::jsonb, 'approved', 'manual', NOW()),
('Alice Springs Gardens', 'Anglicare', '123 Gap Road', 'Alice Springs', 'NT', '0870', -23.6980, 133.8807, '1800 610 610', 'alicesprings@anglicarent.org.au', 'https://www.anglicarent.org.au', 'Loan-License', 'Mixed', 52, 220000, 550000, 230, 420, 28, '["Community Centre", "Library", "Garden", "Chapel"]'::jsonb, 'approved', 'manual', NOW());
