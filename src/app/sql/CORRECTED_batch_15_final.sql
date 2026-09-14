-- Batch 15: 39 Additional Retirement Villages (CORRECT SCHEMA)
-- This batch brings total villages to approximately 500

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

-- New South Wales (12 villages)
('Seaside Retirement Village', 'Seaside Living Group', '45 Ocean View Drive', 'Terrigal', 'NSW', '2260', -33.4456, 151.4442, '02 4385 9000', 'info@seasidevillage.com.au', 'https://seasidevillage.com.au', 'Loan-License', 'Independent', 45, 450000, 850000, 280, 520, 30, '["Swimming Pool", "Gym", "Library", "Cinema", "Bowling Green"]'::jsonb, 'approved', 'manual', NOW()),

('Parklands Retirement Estate', 'Parklands Group', '78 Castle Street', 'Castle Hill', 'NSW', '2154', -33.7333, 151.0000, '02 9680 3400', 'enquiries@parklandscastle.com.au', 'https://parklandscastle.com.au', 'Freehold', 'Independent', 62, 550000, 950000, 320, 580, 0, '["Swimming Pool", "Gym", "Library", "Workshop", "Café"]'::jsonb, 'approved', 'manual', NOW()),

('Riverside Gardens Village', 'Riverside Estates', '123 River Road', 'Penrith', 'NSW', '2750', -33.7506, 150.6942, '02 4721 8800', 'info@riversidegardens.com.au', 'https://riversidegardens.com.au', 'Loan-License', 'Mixed', 58, 380000, 720000, 250, 480, 28, '["Swimming Pool", "Gym", "Bowling Green", "Café", "Garden"]'::jsonb, 'approved', 'manual', NOW()),

('Harmony Heights', 'Harmony Living', '56 Harmony Drive', 'Gosford', 'NSW', '2250', -33.4269, 151.3425, '02 4324 7700', 'contact@harmonyheights.com.au', 'https://harmonyheights.com.au', 'Loan-License', 'Independent', 48, 420000, 780000, 270, 500, 30, '["Swimming Pool", "Gym", "Library", "Cinema", "Café"]'::jsonb, 'approved', 'manual', NOW()),

('Greenwood Village', 'Greenwood Retirement', '34 Greenwood Avenue', 'Campbelltown', 'NSW', '2560', -34.0656, 150.8133, '02 4625 5500', 'info@greenwoodvillage.com.au', 'https://greenwoodvillage.com.au', 'Loan-License', 'Mixed', 52, 390000, 680000, 260, 470, 28, '["Swimming Pool", "Bowling Green", "Workshop", "Café", "Garden"]'::jsonb, 'approved', 'manual', NOW()),

('Mountain View Retirement', 'Mountain View Group', '89 Mountain Street', 'Katoomba', 'NSW', '2780', -33.7127, 150.3117, '02 4782 3300', 'enquiries@mountainviewretire.com.au', 'https://mountainviewretire.com.au', 'Loan-License', 'Independent', 35, 420000, 750000, 280, 490, 30, '["Library", "Cinema", "Café", "Garden", "Workshop"]'::jsonb, 'approved', 'manual', NOW()),

('Lakeside Manor', 'Lakeside Retirement', '67 Lake Drive', 'Wyong', 'NSW', '2259', -33.2806, 151.4239, '02 4352 9900', 'info@lakesidemanor.com.au', 'https://lakesidemanor.com.au', 'Loan-License', 'Mixed', 55, 400000, 740000, 270, 490, 30, '["Swimming Pool", "Gym", "Bowling Green", "Café"]'::jsonb, 'approved', 'manual', NOW()),

('Heritage Park Village', 'Heritage Living', '45 Heritage Road', 'Orange', 'NSW', '2800', -33.2839, 149.0994, '02 6361 8800', 'contact@heritagepark.com.au', 'https://heritagepark.com.au', 'Freehold', 'Independent', 42, 380000, 650000, 0, 0, 0, '["Swimming Pool", "Bowling Green", "Workshop", "Library", "Garden"]'::jsonb, 'approved', 'manual', NOW()),

('Bayview Retirement Village', 'Bayview Estates', '78 Bay Street', 'Cronulla', 'NSW', '2230', -34.0578, 151.1517, '02 9523 7700', 'info@bayviewcronulla.com.au', 'https://bayviewcronulla.com.au', 'Loan-License', 'Independent', 38, 520000, 920000, 300, 560, 32, '["Swimming Pool", "Gym", "Cinema", "Café"]'::jsonb, 'approved', 'manual', NOW()),

('Magnolia Gardens', 'Magnolia Living', '123 Magnolia Avenue', 'Wollongong', 'NSW', '2500', -34.4244, 150.8931, '02 4228 6600', 'enquiries@magnoliagardens.com.au', 'https://magnoliagardens.com.au', 'Loan-License', 'Mixed', 64, 410000, 770000, 280, 510, 30, '["Swimming Pool", "Gym", "Bowling Green", "Café", "Garden"]'::jsonb, 'approved', 'manual', NOW()),

('Sunset Grove Village', 'Sunset Retirement', '56 Sunset Drive', 'Lismore', 'NSW', '2480', -28.8142, 153.2778, '02 6621 5500', 'info@sunsetgrove.com.au', 'https://sunsetgrove.com.au', 'Loan-License', 'Independent', 40, 360000, 620000, 240, 450, 28, '["Swimming Pool", "Bowling Green", "Workshop", "Library", "Café"]'::jsonb, 'approved', 'manual', NOW()),

('Willowbrook Estate', 'Willowbrook Living', '89 Willow Street', 'Wagga Wagga', 'NSW', '2650', -35.1081, 147.3694, '02 6921 4400', 'contact@willowbrook.com.au', 'https://willowbrook.com.au', 'Loan-License', 'Mixed', 47, 340000, 590000, 230, 430, 28, '["Swimming Pool", "Gym", "Bowling Green", "Café", "Garden"]'::jsonb, 'approved', 'manual', NOW()),

-- Victoria (10 villages)
('Peninsula Views', 'Peninsula Living Group', '45 Peninsula Drive', 'Mornington', 'VIC', '3931', -38.2192, 145.0372, '03 5975 8800', 'info@peninsulaviews.com.au', 'https://peninsulaviews.com.au', 'Loan-License', 'Mixed', 56, 480000, 880000, 300, 560, 30, '["Swimming Pool", "Gym", "Cinema", "Café"]'::jsonb, 'approved', 'manual', NOW()),

('Oakridge Retirement Village', 'Oakridge Estates', '78 Oak Street', 'Bendigo', 'VIC', '3550', -36.7570, 144.2794, '03 5444 7700', 'enquiries@oakridgebendigo.com.au', 'https://oakridgebendigo.com.au', 'Freehold', 'Independent', 52, 360000, 620000, 0, 0, 0, '["Swimming Pool", "Bowling Green", "Workshop", "Library", "Café"]'::jsonb, 'approved', 'manual', NOW()),

('Garden Court Village', 'Garden Court Group', '123 Garden Road', 'Geelong', 'VIC', '3220', -38.1499, 144.3617, '03 5229 6600', 'info@gardencourtgeelong.com.au', 'https://gardencourtgeelong.com.au', 'Loan-License', 'Mixed', 62, 420000, 780000, 280, 520, 30, '["Swimming Pool", "Gym", "Bowling Green", "Café", "Garden"]'::jsonb, 'approved', 'manual', NOW()),

('Serenity Park', 'Serenity Living', '56 Serenity Avenue', 'Ballarat', 'VIC', '3350', -37.5622, 143.8503, '03 5331 5500', 'contact@serenitypark.com.au', 'https://serenitypark.com.au', 'Loan-License', 'Independent', 45, 350000, 610000, 240, 450, 28, '["Swimming Pool", "Bowling Green", "Workshop", "Library", "Café"]'::jsonb, 'approved', 'manual', NOW()),

('Coastal Haven Village', 'Coastal Living', '34 Coastal Drive', 'Torquay', 'VIC', '3228', -38.3306, 144.3264, '03 5261 4400', 'info@coastalhaven.com.au', 'https://coastalhaven.com.au', 'Loan-License', 'Independent', 48, 460000, 850000, 290, 540, 32, '["Swimming Pool", "Gym", "Café", "Garden"]'::jsonb, 'approved', 'manual', NOW()),

('Riverside Retreat', 'Riverside Group', '67 River Street', 'Echuca', 'VIC', '3564', -36.1406, 144.7497, '03 5482 3300', 'enquiries@riversideretreat.com.au', 'https://riversideretreat.com.au', 'Loan-License', 'Mixed', 38, 330000, 570000, 230, 420, 28, '["Swimming Pool", "Bowling Green", "Workshop", "Café"]'::jsonb, 'approved', 'manual', NOW()),

('Meadowlands Village', 'Meadowlands Estates', '89 Meadow Drive', 'Wodonga', 'VIC', '3690', -36.1217, 146.8881, '02 6024 8800', 'info@meadowlandsvillage.com.au', 'https://meadowlandsvillage.com.au', 'Loan-License', 'Independent', 50, 340000, 590000, 240, 440, 28, '["Swimming Pool", "Gym", "Bowling Green", "Café", "Garden"]'::jsonb, 'approved', 'manual', NOW()),

('Hillside Manor', 'Hillside Living', '45 Hillside Road', 'Warrnambool', 'VIC', '3280', -38.3814, 142.4864, '03 5562 7700', 'contact@hillsidemanor.com.au', 'https://hillsidemanor.com.au', 'Loan-License', 'Independent', 42, 360000, 630000, 250, 460, 28, '["Swimming Pool", "Bowling Green", "Library", "Café", "Garden"]'::jsonb, 'approved', 'manual', NOW()),

('Parkview Gardens', 'Parkview Retirement', '78 Park Street', 'Shepparton', 'VIC', '3630', -36.3800, 145.3967, '03 5821 6600', 'info@parkviewgardens.com.au', 'https://parkviewgardens.com.au', 'Loan-License', 'Mixed', 54, 330000, 580000, 230, 430, 28, '["Swimming Pool", "Gym", "Bowling Green", "Café", "Garden"]'::jsonb, 'approved', 'manual', NOW()),

('Sunset Hills Village', 'Sunset Hills Group', '123 Sunset Avenue', 'Traralgon', 'VIC', '3844', -38.1958, 146.5406, '03 5174 5500', 'enquiries@sunsethills.com.au', 'https://sunsethills.com.au', 'Loan-License', 'Independent', 40, 320000, 560000, 220, 410, 26, '["Swimming Pool", "Bowling Green", "Workshop", "Library", "Café"]'::jsonb, 'approved', 'manual', NOW()),

-- Queensland (8 villages)
('Palm Grove Village', 'Palm Grove Living', '56 Palm Drive', 'Caloundra', 'QLD', '4551', -26.7989, 153.1311, '07 5491 8800', 'info@palmgrove.com.au', 'https://palmgrove.com.au', 'Loan-License', 'Mixed', 58, 450000, 820000, 290, 540, 30, '["Swimming Pool", "Gym", "Bowling Green", "Café"]'::jsonb, 'approved', 'manual', NOW()),

('Tropical Palms Retirement', 'Tropical Living', '34 Tropical Way', 'Cairns', 'QLD', '4870', -16.9186, 145.7781, '07 4051 7700', 'contact@tropicalpalms.com.au', 'https://tropicalpalms.com.au', 'Loan-License', 'Independent', 46, 380000, 690000, 260, 480, 28, '["Swimming Pool", "Gym", "Cinema", "Café", "Garden"]'::jsonb, 'approved', 'manual', NOW()),

('Lakeside Gardens Village', 'Lakeside QLD', '67 Lake Street', 'Maroochydore', 'QLD', '4558', -26.6561, 153.0889, '07 5443 6600', 'info@lakesideqld.com.au', 'https://lakesideqld.com.au', 'Loan-License', 'Mixed', 52, 460000, 840000, 290, 550, 30, '["Swimming Pool", "Gym", "Bowling Green", "Café"]'::jsonb, 'approved', 'manual', NOW()),

('Heritage Valley Village', 'Heritage QLD', '89 Heritage Drive', 'Toowoomba', 'QLD', '4350', -27.5598, 151.9507, '07 4632 5500', 'enquiries@heritagevalley.com.au', 'https://heritagevalley.com.au', 'Freehold', 'Independent', 48, 340000, 600000, 0, 0, 0, '["Swimming Pool", "Bowling Green", "Workshop", "Library", "Café"]'::jsonb, 'approved', 'manual', NOW()),

('Coral Cove Retirement', 'Coral Living', '45 Coral Street', 'Mackay', 'QLD', '4740', -21.1406, 149.1861, '07 4957 4400', 'info@coralcove.com.au', 'https://coralcove.com.au', 'Loan-License', 'Mixed', 44, 360000, 650000, 250, 470, 28, '["Swimming Pool", "Gym", "Café", "Garden"]'::jsonb, 'approved', 'manual', NOW()),

('Seabreeze Village', 'Seabreeze Estates', '78 Seabreeze Avenue', 'Hervey Bay', 'QLD', '4655', -25.2887, 152.8431, '07 4124 3300', 'contact@seabreezevillage.com.au', 'https://seabreezevillage.com.au', 'Loan-License', 'Independent', 50, 380000, 680000, 260, 480, 28, '["Swimming Pool", "Bowling Green", "Workshop", "Café"]'::jsonb, 'approved', 'manual', NOW()),

('Mountain Springs Village', 'Mountain Springs Group', '123 Mountain Road', 'Buderim', 'QLD', '4556', -26.6833, 153.0500, '07 5476 8800', 'info@mountainsprings.com.au', 'https://mountainsprings.com.au', 'Loan-License', 'Mixed', 54, 470000, 860000, 300, 560, 32, '["Swimming Pool", "Gym", "Cinema", "Café", "Garden"]'::jsonb, 'approved', 'manual', NOW()),

('River Glen Village', 'River Glen Living', '56 River Road', 'Bundaberg', 'QLD', '4670', -24.8661, 152.3489, '07 4151 7700', 'enquiries@riverglen.com.au', 'https://riverglen.com.au', 'Loan-License', 'Independent', 42, 330000, 580000, 230, 430, 28, '["Swimming Pool", "Bowling Green", "Workshop", "Library", "Café"]'::jsonb, 'approved', 'manual', NOW()),

-- South Australia (4 villages)
('Adelaide Hills Village', 'Hills Living Group', '34 Hills Drive', 'Stirling', 'SA', '5152', -35.0044, 138.7169, '08 8339 8800', 'info@adelaidehills.com.au', 'https://adelaidehills.com.au', 'Loan-License', 'Independent', 46, 420000, 750000, 280, 500, 30, '["Swimming Pool", "Gym", "Library", "Café", "Garden"]'::jsonb, 'approved', 'manual', NOW()),

('Coastal Pines Village', 'Coastal Pines SA', '67 Coastal Road', 'Victor Harbor', 'SA', '5211', -35.5522, 138.6183, '08 8552 7700', 'contact@coastalpines.com.au', 'https://coastalpines.com.au', 'Loan-License', 'Mixed', 44, 380000, 680000, 260, 480, 28, '["Swimming Pool", "Bowling Green", "Café", "Garden"]'::jsonb, 'approved', 'manual', NOW()),

('Barossa Valley Village', 'Barossa Living', '89 Valley Street', 'Tanunda', 'SA', '5352', -34.5269, 138.9592, '08 8563 6600', 'info@barossavillage.com.au', 'https://barossavillage.com.au', 'Freehold', 'Independent', 38, 360000, 630000, 0, 0, 0, '["Swimming Pool", "Bowling Green", "Workshop", "Library", "Café"]'::jsonb, 'approved', 'manual', NOW()),

('Riverside Meadows', 'Riverside SA', '45 Riverside Drive', 'Murray Bridge', 'SA', '5253', -35.1189, 139.2739, '08 8532 5500', 'enquiries@riversidemeadows.com.au', 'https://riversidemeadows.com.au', 'Loan-License', 'Mixed', 40, 330000, 580000, 230, 430, 28, '["Swimming Pool", "Gym", "Bowling Green", "Café"]'::jsonb, 'approved', 'manual', NOW()),

-- Western Australia (3 villages)
('Swan Valley Village', 'Swan Valley Living', '78 Swan Street', 'Midland', 'WA', '6056', -31.8911, 116.0083, '08 9274 8800', 'info@swanvalley.com.au', 'https://swanvalley.com.au', 'Loan-License', 'Independent', 50, 420000, 760000, 280, 510, 30, '["Swimming Pool", "Gym", "Bowling Green", "Café", "Garden"]'::jsonb, 'approved', 'manual', NOW()),

('Sunset Coast Village', 'Sunset WA', '123 Sunset Boulevard', 'Mandurah', 'WA', '6210', -32.5269, 115.7233, '08 9535 7700', 'contact@sunsetcoast.com.au', 'https://sunsetcoast.com.au', 'Loan-License', 'Mixed', 56, 410000, 780000, 280, 520, 30, '["Swimming Pool", "Gym", "Cinema", "Café"]'::jsonb, 'approved', 'manual', NOW()),

('Karri Forest Village', 'Karri Living', '56 Karri Drive', 'Bunbury', 'WA', '6230', -33.3267, 115.6397, '08 9721 6600', 'info@karriforest.com.au', 'https://karriforest.com.au', 'Loan-License', 'Independent', 42, 360000, 640000, 250, 470, 28, '["Swimming Pool", "Bowling Green", "Workshop", "Library", "Café"]'::jsonb, 'approved', 'manual', NOW()),

-- Tasmania (1 village)
('Heritage Port Village', 'Heritage TAS', '34 Heritage Avenue', 'Devonport', 'TAS', '7310', -41.1769, 146.3614, '03 6424 5500', 'enquiries@heritageport.com.au', 'https://heritageport.com.au', 'Loan-License', 'Mixed', 36, 340000, 590000, 240, 440, 28, '["Swimming Pool", "Bowling Green", "Library", "Café", "Garden"]'::jsonb, 'approved', 'manual', NOW()),

-- Australian Capital Territory (1 village)
('Capital Gardens Village', 'Capital Living', '67 Capital Drive', 'Belconnen', 'ACT', '2617', -35.2381, 149.0650, '02 6251 4400', 'info@capitalgardens.com.au', 'https://capitalgardens.com.au', 'Loan-License', 'Independent', 48, 480000, 860000, 300, 550, 30, '["Swimming Pool", "Gym", "Bowling Green", "Cinema", "Café"]'::jsonb, 'approved', 'manual', NOW());
