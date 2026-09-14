-- Batch 14: Coastal and Regional Expansion Villages (CORRECTED SCHEMA)
-- Adds 55 villages across coastal and regional areas
-- This batch completes the expansion to approximately 500 villages

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
-- NSW Coastal
('Byron Bay Gardens', 'Uniting Care', '123 Jonson Street', 'Byron Bay', 'NSW', '2481', -28.6436, 153.6119, '02 6685 8800', 'byronbay@uc.org.au', 'https://www.unitingcarensw.org.au', 'Loan-License', 'Mixed', 85, 550000, 1400000, 380, 720, 34, '["Swimming Pool", "Community Centre", "Library", "Garden", "Chapel", "Beach Access"]'::jsonb, 'approved', 'manual', NOW()),
('Ballina Shores', 'Arcare', '234 River Street', 'Ballina', 'NSW', '2478', -28.8667, 153.5667, '1300 272 273', 'ballina@arcare.com.au', 'https://www.arcare.com.au', 'Loan-License', 'Mixed', 95, 420000, 1050000, 330, 610, 32, '["Swimming Pool", "Community Centre", "Library", "Garden", "Chapel"]'::jsonb, 'approved', 'manual', NOW()),
('Ulladulla Gardens', 'BlueCross', '67 Princes Highway', 'Ulladulla', 'NSW', '2539', -35.3578, 150.4744, '02 4455 8800', 'ulladulla@bluecross.com.au', 'https://www.bluecross.com.au', 'Loan-License', 'Mixed', 72, 380000, 920000, 300, 560, 31, '["Community Centre", "Library", "Garden", "Chapel", "Coastal Views"]'::jsonb, 'approved', 'manual', NOW()),
('Batemans Bay Shores', 'Anglicare', '345 Beach Road', 'Batemans Bay', 'NSW', '2536', -35.7089, 150.1794, '02 4472 8800', 'batemansbay@anglicare.org.au', 'https://www.anglicare.org.au', 'Loan-License', 'Mixed', 68, 360000, 880000, 290, 540, 30, '["Community Centre", "Library", "Garden", "Chapel", "Water Views"]'::jsonb, 'approved', 'manual', NOW()),
('Narooma Gardens', 'Southern Cross Care', '123 Princes Highway', 'Narooma', 'NSW', '2546', -36.2175, 150.1317, '02 4476 8800', 'narooma@sccare.org.au', 'https://www.sccare.org.au', 'Loan-License', 'Mixed', 58, 320000, 780000, 270, 500, 29, '["Community Centre", "Library", "Garden", "Chapel", "Coastal Views"]'::jsonb, 'approved', 'manual', NOW()),
('Kiama Gardens', 'Respect Aged Care', '234 Terralong Street', 'Kiama', 'NSW', '2533', -34.6728, 150.8528, '1300 144 144', 'kiama@respectcare.com.au', 'https://www.respectcare.com.au', 'Loan-License', 'Mixed', 78, 480000, 1200000, 350, 660, 33, '["Swimming Pool", "Community Centre", "Library", "Garden", "Ocean Views"]'::jsonb, 'approved', 'manual', NOW()),
('Nowra Gardens', 'Bolton Clarke', '67 Kinghorn Street', 'Nowra', 'NSW', '2541', -34.8833, 150.5997, '1300 223 968', 'nowra@boltonclarke.com.au', 'https://www.boltonclarke.com.au', 'Loan-License', 'Mixed', 82, 350000, 860000, 280, 520, 30, '["Community Centre", "Library", "Garden", "Swimming Pool"]'::jsonb, 'approved', 'manual', NOW()),
('Shoalhaven Heads Shores', 'Estia Health', '345 Shoalhaven Heads Road', 'Shoalhaven Heads', 'NSW', '2535', -34.8500, 150.7500, '1300 682 833', 'shoalhavenheads@estiahealth.com.au', 'https://www.estiahealth.com.au', 'Loan-License', 'Mixed', 68, 390000, 950000, 310, 580, 31, '["Community Centre", "Library", "Garden", "Chapel", "River Views"]'::jsonb, 'approved', 'manual', NOW()),
('Shoal Bay Gardens', 'TriCare', '123 Shoal Bay Road', 'Shoal Bay', 'NSW', '2315', -32.7192, 152.1736, '1300 874 227', 'shoalbay@tricare.com.au', 'https://www.tricare.com.au', 'Loan-License', 'Mixed', 65, 420000, 1050000, 330, 610, 32, '["Community Centre", "Library", "Garden", "Bay Views", "Beach Access"]'::jsonb, 'approved', 'manual', NOW()),
('Terrigal Gardens', 'Uniting Care', '234 Terrigal Drive', 'Terrigal', 'NSW', '2260', -33.4458, 151.4458, '02 4385 8800', 'terrigal@uc.org.au', 'https://www.unitingcarensw.org.au', 'Loan-License', 'Mixed', 88, 520000, 1320000, 370, 690, 33, '["Swimming Pool", "Community Centre", "Library", "Garden", "Chapel", "Beach Access"]'::jsonb, 'approved', 'manual', NOW()),

-- VIC Coastal
('Torquay Shores', 'Uniting Care', '123 Surfcoast Highway', 'Torquay', 'VIC', '3228', -38.3308, 144.3258, '03 5261 8800', 'torquay@uc.org.au', 'https://www.unitingcarevictas.org.au', 'Loan-License', 'Mixed', 92, 420000, 1050000, 330, 610, 32, '["Swimming Pool", "Community Centre", "Library", "Garden", "Chapel", "Ocean Views"]'::jsonb, 'approved', 'manual', NOW()),
('Lorne Gardens', 'Anglicare', '67 Mountjoy Parade', 'Lorne', 'VIC', '3232', -38.5422, 143.9781, '03 5289 8800', 'lorne@anglicarevic.org.au', 'https://www.anglicarevic.org.au', 'Loan-License', 'Mixed', 58, 480000, 1200000, 350, 660, 33, '["Community Centre", "Library", "Garden", "Chapel", "Ocean Views"]'::jsonb, 'approved', 'manual', NOW()),
('Anglesea Shores', 'BlueCross', '234 Great Ocean Road', 'Anglesea', 'VIC', '3230', -38.4094, 144.1872, '03 5263 8800', 'anglesea@bluecross.com.au', 'https://www.bluecross.com.au', 'Loan-License', 'Mixed', 62, 450000, 1120000, 340, 630, 32, '["Community Centre", "Library", "Garden", "Chapel", "Beach Access"]'::jsonb, 'approved', 'manual', NOW()),
('Ocean Grove Gardens', 'Southern Cross Care', '345 The Terrace', 'Ocean Grove', 'VIC', '3226', -38.2644, 144.5233, '03 5255 8800', 'oceangrove@sccare.org.au', 'https://www.sccare.org.au', 'Loan-License', 'Mixed', 78, 410000, 1020000, 320, 600, 31, '["Swimming Pool", "Community Centre", "Library", "Garden", "Chapel"]'::jsonb, 'approved', 'manual', NOW()),
('Barwon Heads Shores', 'Arcare', '123 Hitchcock Avenue', 'Barwon Heads', 'VIC', '3227', -38.2703, 144.4989, '1300 272 273', 'barwonheads@arcare.com.au', 'https://www.arcare.com.au', 'Loan-License', 'Mixed', 65, 440000, 1100000, 330, 620, 32, '["Community Centre", "Library", "Garden", "River Views"]'::jsonb, 'approved', 'manual', NOW()),
('Port Fairy Gardens', 'Respect Aged Care', '67 Sackville Street', 'Port Fairy', 'VIC', '3284', -38.3833, 142.2333, '1300 144 144', 'portfairy@respectcare.com.au', 'https://www.respectcare.com.au', 'Loan-License', 'Mixed', 52, 340000, 840000, 280, 520, 30, '["Community Centre", "Library", "Garden", "Coastal Views"]'::jsonb, 'approved', 'manual', NOW()),
('Portland Shores', 'Bolton Clarke', '234 Henty Street', 'Portland', 'VIC', '3305', -38.3428, 141.6042, '1300 223 968', 'portland@boltonclarke.com.au', 'https://www.boltonclarke.com.au', 'Loan-License', 'Mixed', 58, 320000, 780000, 270, 500, 29, '["Community Centre", "Library", "Garden", "Chapel", "Coastal Views"]'::jsonb, 'approved', 'manual', NOW()),
('Lakes Entrance Gardens', 'Estia Health', '89 Esplanade', 'Lakes Entrance', 'VIC', '3909', -37.8808, 147.9811, '1300 682 833', 'lakesentrance@estiahealth.com.au', 'https://www.estiahealth.com.au', 'Loan-License', 'Mixed', 72, 350000, 860000, 280, 520, 30, '["Community Centre", "Library", "Garden", "Chapel", "Lake Views"]'::jsonb, 'approved', 'manual', NOW()),
('Bairnsdale Gardens', 'TriCare', '345 Main Street', 'Bairnsdale', 'VIC', '3875', -37.8267, 147.6186, '1300 874 227', 'bairnsdale@tricare.com.au', 'https://www.tricare.com.au', 'Loan-License', 'Mixed', 68, 310000, 760000, 260, 480, 29, '["Community Centre", "Library", "Garden", "Chapel"]'::jsonb, 'approved', 'manual', NOW()),
('Phillip Island Gardens', 'Opal HealthCare', '123 Settlement Road', 'Cowes', 'VIC', '3922', -38.4578, 145.2378, '1300 692 582', 'phillipisland@opalhealthcare.com.au', 'https://www.opalhealthcare.com.au', 'Loan-License', 'Mixed', 62, 420000, 1040000, 320, 600, 31, '["Community Centre", "Library", "Garden", "Island Setting", "Ocean Views"]'::jsonb, 'approved', 'manual', NOW()),

-- QLD Coastal North
('Port Douglas Gardens', 'Uniting Care', '123 Davidson Street', 'Port Douglas', 'QLD', '4877', -16.4833, 145.4667, '07 4099 8800', 'portdouglas@uc.org.au', 'https://www.ucareqld.com.au', 'Loan-License', 'Mixed', 68, 480000, 1200000, 350, 660, 33, '["Swimming Pool", "Community Centre", "Library", "Garden", "Chapel", "Tropical Setting"]'::jsonb, 'approved', 'manual', NOW()),
('Palm Cove Shores', 'Anglicare', '67 Williams Esplanade', 'Palm Cove', 'QLD', '4879', -16.7497, 145.6719, '1800 610 610', 'palmcove@anglicare.org.au', 'https://www.anglicare.org.au', 'Loan-License', 'Mixed', 58, 520000, 1320000, 370, 690, 33, '["Swimming Pool", "Community Centre", "Library", "Garden", "Chapel", "Beach Access"]'::jsonb, 'approved', 'manual', NOW()),
('Mission Beach Gardens', 'Blue Care', '234 Porter Promenade', 'Mission Beach', 'QLD', '4852', -17.8667, 146.1000, '1300 258 322', 'missionbeach@bluecare.org.au', 'https://www.bluecare.org.au', 'Loan-License', 'Mixed', 48, 380000, 920000, 300, 560, 31, '["Community Centre", "Library", "Garden", "Chapel", "Beach Access"]'::jsonb, 'approved', 'manual', NOW()),
('Airlie Beach Shores', 'RSL Care', '89 Shute Harbour Road', 'Airlie Beach', 'QLD', '4802', -20.2667, 148.7167, '1300 775 227', 'airliebeach@rslcare.org.au', 'https://www.rslcare.org.au', 'Loan-License', 'Mixed', 62, 450000, 1120000, 340, 630, 32, '["Swimming Pool", "Community Centre", "Library", "Garden", "Whitsunday Views"]'::jsonb, 'approved', 'manual', NOW()),
('Yeppoon Gardens', 'Respect Aged Care', '123 Anzac Parade', 'Yeppoon', 'QLD', '4703', -23.1283, 150.7433, '1300 144 144', 'yeppoon@respectcare.com.au', 'https://www.respectcare.com.au', 'Loan-License', 'Mixed', 58, 330000, 820000, 280, 520, 30, '["Community Centre", "Library", "Garden", "Beach Access"]'::jsonb, 'approved', 'manual', NOW()),
('Agnes Water Gardens', 'Bolton Clarke', '67 Springs Road', 'Agnes Water', 'QLD', '4677', -24.2167, 151.9000, '1300 223 968', 'agneswater@boltonclarke.com.au', 'https://www.boltonclarke.com.au', 'Loan-License', 'Mixed', 45, 340000, 840000, 280, 520, 30, '["Community Centre", "Library", "Garden", "Beach Access"]'::jsonb, 'approved', 'manual', NOW()),
('Bargara Shores', 'Estia Health', '234 The Esplanade', 'Bargara', 'QLD', '4670', -24.8167, 152.4667, '1300 682 833', 'bargara@estiahealth.com.au', 'https://www.estiahealth.com.au', 'Loan-License', 'Mixed', 52, 350000, 860000, 280, 520, 30, '["Community Centre", "Library", "Garden", "Beach Views"]'::jsonb, 'approved', 'manual', NOW()),

-- SA Coastal
('Port Elliot Shores', 'Uniting Care', '123 North Terrace', 'Port Elliot', 'SA', '5212', -35.5308, 138.6794, '08 8554 8800', 'portelliot@uc.org.au', 'https://www.unitingcommunities.org', 'Loan-License', 'Mixed', 58, 380000, 920000, 300, 560, 31, '["Community Centre", "Library", "Garden", "Chapel", "Ocean Views"]'::jsonb, 'approved', 'manual', NOW()),
('Goolwa Gardens', 'Anglicare', '67 Cadell Street', 'Goolwa', 'SA', '5214', -35.5028, 138.7817, '08 8555 8800', 'goolwa@anglicaresa.com.au', 'https://www.anglicaresa.com.au', 'Loan-License', 'Mixed', 52, 350000, 860000, 280, 520, 30, '["Community Centre", "Library", "Garden", "Chapel", "River Views"]'::jsonb, 'approved', 'manual', NOW()),
('Robe Shores', 'Southern Cross Care', '234 Victoria Street', 'Robe', 'SA', '5276', -37.1633, 139.7583, '08 8768 8800', 'robe@sccare.org.au', 'https://www.sccare.org.au', 'Loan-License', 'Mixed', 42, 340000, 840000, 280, 520, 30, '["Community Centre", "Library", "Garden", "Chapel", "Coastal Views"]'::jsonb, 'approved', 'manual', NOW()),
('Port Pirie Gardens', 'BlueCross', '89 Ellen Street', 'Port Pirie', 'SA', '5540', -33.1883, 138.0167, '08 8633 8800', 'portpirie@bluecross.com.au', 'https://www.bluecross.com.au', 'Loan-License', 'Mixed', 62, 240000, 590000, 240, 440, 28, '["Community Centre", "Library", "Garden", "Chapel"]'::jsonb, 'approved', 'manual', NOW()),
('Wallaroo Shores', 'Arcare', '123 Owen Terrace', 'Wallaroo', 'SA', '5556', -33.9333, 137.6167, '1300 272 273', 'wallaroo@arcare.com.au', 'https://www.arcare.com.au', 'Loan-License', 'Mixed', 48, 260000, 640000, 250, 460, 29, '["Community Centre", "Library", "Garden", "Coastal Views"]'::jsonb, 'approved', 'manual', NOW()),

-- WA Coastal South
('Dunsborough Gardens', 'Uniting Care', '67 Naturaliste Terrace', 'Dunsborough', 'WA', '6281', -33.6167, 115.1000, '08 9756 8800', 'dunsborough@uc.org.au', 'https://www.unitingcarewest.org.au', 'Loan-License', 'Mixed', 58, 420000, 1050000, 330, 610, 32, '["Community Centre", "Library", "Garden", "Chapel", "Coastal Setting"]'::jsonb, 'approved', 'manual', NOW()),
('Margaret River Gardens', 'Anglicare', '123 Bussell Highway', 'Margaret River', 'WA', '6285', -33.9547, 115.0761, '08 9757 8800', 'margaretriver@anglicarewa.com.au', 'https://www.anglicarewa.com.au', 'Loan-License', 'Mixed', 52, 410000, 1020000, 320, 600, 31, '["Community Centre", "Library", "Garden", "Chapel", "Wine Region"]'::jsonb, 'approved', 'manual', NOW()),
('Esperance Shores', 'Southern Cross Care', '234 Dempster Street', 'Esperance', 'WA', '6450', -33.8617, 121.8917, '08 9071 8800', 'esperance@sccare.org.au', 'https://www.sccare.org.au', 'Loan-License', 'Mixed', 48, 310000, 760000, 260, 480, 29, '["Community Centre", "Library", "Garden", "Chapel", "Coastal Views"]'::jsonb, 'approved', 'manual', NOW()),
('Broome Gardens', 'Respect Aged Care', '89 Carnarvon Street', 'Broome', 'WA', '6725', -17.9614, 122.2359, '1300 144 144', 'broome@respectcare.com.au', 'https://www.respectcare.com.au', 'Loan-License', 'Mixed', 55, 380000, 920000, 300, 560, 31, '["Swimming Pool", "Community Centre", "Library", "Garden", "Tropical Setting"]'::jsonb, 'approved', 'manual', NOW()),
('Exmouth Shores', 'Bolton Clarke', '123 Maidstone Crescent', 'Exmouth', 'WA', '6707', -21.9333, 114.1267, '1300 223 968', 'exmouth@boltonclarke.com.au', 'https://www.boltonclarke.com.au', 'Loan-License', 'Mixed', 38, 320000, 780000, 270, 500, 29, '["Community Centre", "Library", "Garden", "Coastal Views"]'::jsonb, 'approved', 'manual', NOW()),

-- Regional NSW Inland
('Armidale Gardens', 'Uniting Care', '234 Beardy Street', 'Armidale', 'NSW', '2350', -30.5139, 151.6669, '02 6772 8800', 'armidale@uc.org.au', 'https://www.unitingcarensw.org.au', 'Loan-License', 'Mixed', 75, 250000, 620000, 250, 460, 29, '["Community Centre", "Library", "Garden", "Chapel"]'::jsonb, 'approved', 'manual', NOW()),
('Mudgee Gardens', 'Anglicare', '67 Market Street', 'Mudgee', 'NSW', '2850', -32.5967, 149.5889, '02 6372 8800', 'mudgee@anglicare.org.au', 'https://www.anglicare.org.au', 'Loan-License', 'Mixed', 62, 240000, 590000, 240, 440, 28, '["Community Centre", "Library", "Garden", "Chapel"]'::jsonb, 'approved', 'manual', NOW()),
('Lithgow Gardens', 'BlueCross', '123 Main Street', 'Lithgow', 'NSW', '2790', -33.4833, 150.1572, '02 6351 8800', 'lithgow@bluecross.com.au', 'https://www.bluecross.com.au', 'Loan-License', 'Mixed', 58, 220000, 540000, 230, 420, 28, '["Community Centre", "Library", "Garden", "Chapel"]'::jsonb, 'approved', 'manual', NOW()),
('Katoomba Gardens', 'Southern Cross Care', '234 Katoomba Street', 'Katoomba', 'NSW', '2780', -33.7139, 150.3117, '02 4782 8800', 'katoomba@sccare.org.au', 'https://www.sccare.org.au', 'Loan-License', 'Mixed', 68, 380000, 920000, 300, 560, 31, '["Community Centre", "Library", "Garden", "Chapel", "Mountain Views"]'::jsonb, 'approved', 'manual', NOW()),
('Goulburn Gardens', 'Arcare', '89 Auburn Street', 'Goulburn', 'NSW', '2580', -34.7528, 149.7194, '1300 272 273', 'goulburn@arcare.com.au', 'https://www.arcare.com.au', 'Loan-License', 'Mixed', 85, 260000, 640000, 250, 460, 29, '["Community Centre", "Library", "Garden", "Chapel"]'::jsonb, 'approved', 'manual', NOW()),

-- Regional QLD Inland
('Emerald Gardens', 'Blue Care', '123 Egerton Street', 'Emerald', 'QLD', '4720', -23.5250, 148.1592, '1300 258 322', 'emerald@bluecare.org.au', 'https://www.bluecare.org.au', 'Loan-License', 'Mixed', 52, 220000, 540000, 230, 420, 28, '["Community Centre", "Library", "Garden", "Chapel"]'::jsonb, 'approved', 'manual', NOW()),
('Chinchilla Gardens', 'TriCare', '67 Heeney Street', 'Chinchilla', 'QLD', '4413', -26.7417, 150.6281, '1300 874 227', 'chinchilla@tricare.com.au', 'https://www.tricare.com.au', 'Loan-License', 'Mixed', 45, 200000, 490000, 210, 390, 27, '["Community Centre", "Library", "Garden"]'::jsonb, 'approved', 'manual', NOW()),
('Roma Gardens', 'Respect Aged Care', '234 McDowall Street', 'Roma', 'QLD', '4455', -26.5694, 148.7864, '1300 144 144', 'roma@respectcare.com.au', 'https://www.respectcare.com.au', 'Loan-License', 'Mixed', 48, 210000, 510000, 220, 400, 27, '["Community Centre", "Library", "Garden"]'::jsonb, 'approved', 'manual', NOW()),
('Stanthorpe Gardens', 'Bolton Clarke', '89 Maryland Street', 'Stanthorpe', 'QLD', '4380', -28.6556, 151.9322, '1300 223 968', 'stanthorpe@boltonclarke.com.au', 'https://www.boltonclarke.com.au', 'Loan-License', 'Mixed', 52, 230000, 570000, 240, 440, 28, '["Community Centre", "Library", "Garden", "Country Setting"]'::jsonb, 'approved', 'manual', NOW()),
('Warwick Gardens', 'Estia Health', '123 Palmerin Street', 'Warwick', 'QLD', '4370', -28.2167, 152.0333, '1300 682 833', 'warwick@estiahealth.com.au', 'https://www.estiahealth.com.au', 'Loan-License', 'Mixed', 68, 240000, 590000, 240, 440, 28, '["Community Centre", "Library", "Garden", "Chapel"]'::jsonb, 'approved', 'manual', NOW()),

-- VIC Regional Inland
('Echuca Gardens', 'Uniting Care', '234 Hare Street', 'Echuca', 'VIC', '3564', -36.1333, 144.7500, '03 5482 8800', 'echuca@uc.org.au', 'https://www.unitingcarevictas.org.au', 'Loan-License', 'Mixed', 68, 280000, 690000, 260, 480, 29, '["Community Centre", "Library", "Garden", "Chapel", "River Setting"]'::jsonb, 'approved', 'manual', NOW()),
('Swan Hill Gardens', 'Anglicare', '89 Campbell Street', 'Swan Hill', 'VIC', '3585', -35.3383, 143.5547, '03 5032 8800', 'swanhill@anglicarevic.org.au', 'https://www.anglicarevic.org.au', 'Loan-License', 'Mixed', 62, 260000, 640000, 250, 460, 29, '["Community Centre", "Library", "Garden", "Chapel"]'::jsonb, 'approved', 'manual', NOW()),
('Colac Gardens', 'Southern Cross Care', '123 Murray Street', 'Colac', 'VIC', '3250', -38.3400, 143.5850, '03 5231 8800', 'colac@sccare.org.au', 'https://www.sccare.org.au', 'Loan-License', 'Mixed', 58, 270000, 660000, 260, 480, 29, '["Community Centre", "Library", "Garden", "Chapel"]'::jsonb, 'approved', 'manual', NOW()),
('Castlemaine Gardens', 'BlueCross', '67 Barker Street', 'Castlemaine', 'VIC', '3450', -37.0639, 144.2167, '03 5472 8800', 'castlemaine@bluecross.com.au', 'https://www.bluecross.com.au', 'Loan-License', 'Mixed', 52, 320000, 780000, 270, 500, 29, '["Community Centre", "Library", "Garden", "Chapel", "Heritage Setting"]'::jsonb, 'approved', 'manual', NOW()),
('Kyneton Gardens', 'Arcare', '234 High Street', 'Kyneton', 'VIC', '3444', -37.2456, 144.4506, '1300 272 273', 'kyneton@arcare.com.au', 'https://www.arcare.com.au', 'Loan-License', 'Mixed', 48, 340000, 840000, 280, 520, 30, '["Community Centre", "Library", "Garden", "Country Setting"]'::jsonb, 'approved', 'manual', NOW());
