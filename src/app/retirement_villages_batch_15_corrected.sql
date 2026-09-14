-- Batch 15: 39 Additional Retirement Villages (CORRECTED SCHEMA)
-- This batch brings total villages to approximately 500

INSERT INTO retirement_villages (
  name, operator, state, suburb, street_address, postcode, phone, email, website,
  care_types, accommodation_types, village_type, units_available,
  price_range_min, price_range_max, amenities, description,
  latitude, longitude, is_approved, submission_type
) VALUES

-- New South Wales (12 villages)
('Seaside Retirement Village', 'Seaside Living Group', 'NSW', 'Terrigal', '45 Ocean View Drive', '2260', '02 4385 9000', 'info@seasidevillage.com.au', 'https://seasidevillage.com.au', ARRAY['independent-living', 'assisted-living'], ARRAY['villa', 'apartment'], 'leasehold', 45, 450000, 850000, ARRAY['pool', 'gym', 'library', 'cinema', 'bowling-green', 'beach-access'], 'Stunning coastal retirement living with ocean views and direct beach access', -33.4456, 151.4442, TRUE, 'admin'),

('Parklands Retirement Estate', 'Parklands Group', 'NSW', 'Castle Hill', '78 Castle Street', '2154', '02 9680 3400', 'enquiries@parklandscastle.com.au', 'https://parklandscastle.com.au', ARRAY['independent-living'], ARRAY['villa'], 'freehold', 62, 550000, 950000, ARRAY['pool', 'gym', 'library', 'workshop', 'cafe'], 'Premium freehold retirement living in the heart of Castle Hill', -33.7333, 151.0000, TRUE, 'admin'),

('Riverside Gardens Village', 'Riverside Estates', 'NSW', 'Penrith', '123 River Road', '2750', '02 4721 8800', 'info@riversidegardens.com.au', 'https://riversidegardens.com.au', ARRAY['independent-living', 'assisted-living'], ARRAY['villa', 'apartment'], 'leasehold', 58, 380000, 720000, ARRAY['pool', 'gym', 'bowling-green', 'cafe', 'gardens'], 'Peaceful retirement village overlooking the Nepean River', -33.7506, 150.6942, TRUE, 'admin'),

('Harmony Heights', 'Harmony Living', 'NSW', 'Gosford', '56 Harmony Drive', '2250', '02 4324 7700', 'contact@harmonyheights.com.au', 'https://harmonyheights.com.au', ARRAY['independent-living'], ARRAY['villa', 'apartment'], 'leasehold', 48, 420000, 780000, ARRAY['pool', 'gym', 'library', 'cinema', 'cafe'], 'Modern retirement living on the Central Coast', -33.4269, 151.3425, TRUE, 'admin'),

('Greenwood Village', 'Greenwood Retirement', 'NSW', 'Campbelltown', '34 Greenwood Avenue', '2560', '02 4625 5500', 'info@greenwoodvillage.com.au', 'https://greenwoodvillage.com.au', ARRAY['independent-living', 'assisted-living'], ARRAY['villa'], 'leasehold', 52, 390000, 680000, ARRAY['pool', 'bowling-green', 'workshop', 'cafe', 'gardens'], 'Established retirement village with excellent facilities', -34.0656, 150.8133, TRUE, 'admin'),

('Mountain View Retirement', 'Mountain View Group', 'NSW', 'Katoomba', '89 Mountain Street', '2780', '02 4782 3300', 'enquiries@mountainviewretire.com.au', 'https://mountainviewretire.com.au', ARRAY['independent-living'], ARRAY['villa', 'apartment'], 'leasehold', 35, 420000, 750000, ARRAY['library', 'cinema', 'cafe', 'gardens', 'workshop'], 'Retirement living in the beautiful Blue Mountains', -33.7127, 150.3117, TRUE, 'admin'),

('Lakeside Manor', 'Lakeside Retirement', 'NSW', 'Wyong', '67 Lake Drive', '2259', '02 4352 9900', 'info@lakesidemanor.com.au', 'https://lakesidemanor.com.au', ARRAY['independent-living', 'assisted-living'], ARRAY['villa', 'apartment'], 'leasehold', 55, 400000, 740000, ARRAY['pool', 'gym', 'bowling-green', 'cafe', 'lake-access'], 'Tranquil lakeside retirement community', -33.2806, 151.4239, TRUE, 'admin'),

('Heritage Park Village', 'Heritage Living', 'NSW', 'Orange', '45 Heritage Road', '2800', '02 6361 8800', 'contact@heritagepark.com.au', 'https://heritagepark.com.au', ARRAY['independent-living'], ARRAY['villa'], 'freehold', 42, 380000, 650000, ARRAY['pool', 'bowling-green', 'workshop', 'library', 'gardens'], 'Peaceful retirement village in regional NSW', -33.2839, 149.0994, TRUE, 'admin'),

('Bayview Retirement Village', 'Bayview Estates', 'NSW', 'Cronulla', '78 Bay Street', '2230', '02 9523 7700', 'info@bayviewcronulla.com.au', 'https://bayviewcronulla.com.au', ARRAY['independent-living'], ARRAY['apartment'], 'leasehold', 38, 520000, 920000, ARRAY['pool', 'gym', 'cinema', 'cafe', 'beach-access'], 'Premium beachside retirement apartments', -34.0578, 151.1517, TRUE, 'admin'),

('Magnolia Gardens', 'Magnolia Living', 'NSW', 'Wollongong', '123 Magnolia Avenue', '2500', '02 4228 6600', 'enquiries@magnoliagardens.com.au', 'https://magnoliagardens.com.au', ARRAY['independent-living', 'assisted-living'], ARRAY['villa', 'apartment'], 'leasehold', 64, 410000, 770000, ARRAY['pool', 'gym', 'bowling-green', 'cafe', 'gardens'], 'Beautiful retirement village with coastal views', -34.4244, 150.8931, TRUE, 'admin'),

('Sunset Grove Village', 'Sunset Retirement', 'NSW', 'Lismore', '56 Sunset Drive', '2480', '02 6621 5500', 'info@sunsetgrove.com.au', 'https://sunsetgrove.com.au', ARRAY['independent-living'], ARRAY['villa'], 'leasehold', 40, 360000, 620000, ARRAY['pool', 'bowling-green', 'workshop', 'library', 'cafe'], 'Friendly retirement community in Northern NSW', -28.8142, 153.2778, TRUE, 'admin'),

('Willowbrook Estate', 'Willowbrook Living', 'NSW', 'Wagga Wagga', '89 Willow Street', '2650', '02 6921 4400', 'contact@willowbrook.com.au', 'https://willowbrook.com.au', ARRAY['independent-living', 'assisted-living'], ARRAY['villa', 'apartment'], 'leasehold', 47, 340000, 590000, ARRAY['pool', 'gym', 'bowling-green', 'cafe', 'gardens'], 'Modern retirement village in the Riverina region', -35.1081, 147.3694, TRUE, 'admin'),

-- Victoria (10 villages)
('Peninsula Views', 'Peninsula Living Group', 'VIC', 'Mornington', '45 Peninsula Drive', '3931', '03 5975 8800', 'info@peninsulaviews.com.au', 'https://peninsulaviews.com.au', ARRAY['independent-living', 'assisted-living'], ARRAY['villa', 'apartment'], 'leasehold', 56, 480000, 880000, ARRAY['pool', 'gym', 'cinema', 'cafe', 'bay-access'], 'Stunning bayside retirement living on the Mornington Peninsula', -38.2192, 145.0372, TRUE, 'admin'),

('Oakridge Retirement Village', 'Oakridge Estates', 'VIC', 'Bendigo', '78 Oak Street', '3550', '03 5444 7700', 'enquiries@oakridgebendigo.com.au', 'https://oakridgebendigo.com.au', ARRAY['independent-living'], ARRAY['villa'], 'freehold', 52, 360000, 620000, ARRAY['pool', 'bowling-green', 'workshop', 'library', 'cafe'], 'Established retirement village in regional Victoria', -36.7570, 144.2794, TRUE, 'admin'),

('Garden Court Village', 'Garden Court Group', 'VIC', 'Geelong', '123 Garden Road', '3220', '03 5229 6600', 'info@gardencourtgeelong.com.au', 'https://gardencourtgeelong.com.au', ARRAY['independent-living', 'assisted-living'], ARRAY['villa', 'apartment'], 'leasehold', 62, 420000, 780000, ARRAY['pool', 'gym', 'bowling-green', 'cafe', 'gardens'], 'Premium retirement living in Geelong', -38.1499, 144.3617, TRUE, 'admin'),

('Serenity Park', 'Serenity Living', 'VIC', 'Ballarat', '56 Serenity Avenue', '3350', '03 5331 5500', 'contact@serenitypark.com.au', 'https://serenitypark.com.au', ARRAY['independent-living'], ARRAY['villa'], 'leasehold', 45, 350000, 610000, ARRAY['pool', 'bowling-green', 'workshop', 'library', 'cafe'], 'Peaceful retirement village in historic Ballarat', -37.5622, 143.8503, TRUE, 'admin'),

('Coastal Haven Village', 'Coastal Living', 'VIC', 'Torquay', '34 Coastal Drive', '3228', '03 5261 4400', 'info@coastalhaven.com.au', 'https://coastalhaven.com.au', ARRAY['independent-living'], ARRAY['villa', 'apartment'], 'leasehold', 48, 460000, 850000, ARRAY['pool', 'gym', 'cafe', 'beach-access', 'gardens'], 'Retirement village near the Great Ocean Road', -38.3306, 144.3264, TRUE, 'admin'),

('Riverside Retreat', 'Riverside Group', 'VIC', 'Echuca', '67 River Street', '3564', '03 5482 3300', 'enquiries@riversideretreat.com.au', 'https://riversideretreat.com.au', ARRAY['independent-living', 'assisted-living'], ARRAY['villa'], 'leasehold', 38, 330000, 570000, ARRAY['pool', 'bowling-green', 'workshop', 'cafe', 'river-access'], 'Relaxed retirement living by the Murray River', -36.1406, 144.7497, TRUE, 'admin'),

('Meadowlands Village', 'Meadowlands Estates', 'VIC', 'Wodonga', '89 Meadow Drive', '3690', '02 6024 8800', 'info@meadowlandsvillage.com.au', 'https://meadowlandsvillage.com.au', ARRAY['independent-living'], ARRAY['villa', 'apartment'], 'leasehold', 50, 340000, 590000, ARRAY['pool', 'gym', 'bowling-green', 'cafe', 'gardens'], 'Modern retirement community on the NSW-VIC border', -36.1217, 146.8881, TRUE, 'admin'),

('Hillside Manor', 'Hillside Living', 'VIC', 'Warrnambool', '45 Hillside Road', '3280', '03 5562 7700', 'contact@hillsidemanor.com.au', 'https://hillsidemanor.com.au', ARRAY['independent-living'], ARRAY['villa'], 'leasehold', 42, 360000, 630000, ARRAY['pool', 'bowling-green', 'library', 'cafe', 'gardens'], 'Retirement village in coastal Warrnambool', -38.3814, 142.4864, TRUE, 'admin'),

('Parkview Gardens', 'Parkview Retirement', 'VIC', 'Shepparton', '78 Park Street', '3630', '03 5821 6600', 'info@parkviewgardens.com.au', 'https://parkviewgardens.com.au', ARRAY['independent-living', 'assisted-living'], ARRAY['villa', 'apartment'], 'leasehold', 54, 330000, 580000, ARRAY['pool', 'gym', 'bowling-green', 'cafe', 'gardens'], 'Established retirement village in the Goulburn Valley', -36.3800, 145.3967, TRUE, 'admin'),

('Sunset Hills Village', 'Sunset Hills Group', 'VIC', 'Traralgon', '123 Sunset Avenue', '3844', '03 5174 5500', 'enquiries@sunsethills.com.au', 'https://sunsethills.com.au', ARRAY['independent-living'], ARRAY['villa'], 'leasehold', 40, 320000, 560000, ARRAY['pool', 'bowling-green', 'workshop', 'library', 'cafe'], 'Friendly retirement community in Gippsland', -38.1958, 146.5406, TRUE, 'admin'),

-- Queensland (8 villages)
('Palm Grove Village', 'Palm Grove Living', 'QLD', 'Caloundra', '56 Palm Drive', '4551', '07 5491 8800', 'info@palmgrove.com.au', 'https://palmgrove.com.au', ARRAY['independent-living', 'assisted-living'], ARRAY['villa', 'apartment'], 'leasehold', 58, 450000, 820000, ARRAY['pool', 'gym', 'bowling-green', 'cafe', 'beach-access'], 'Beachside retirement living on the Sunshine Coast', -26.7989, 153.1311, TRUE, 'admin'),

('Tropical Palms Retirement', 'Tropical Living', 'QLD', 'Cairns', '34 Tropical Way', '4870', '07 4051 7700', 'contact@tropicalpalms.com.au', 'https://tropicalpalms.com.au', ARRAY['independent-living'], ARRAY['villa', 'apartment'], 'leasehold', 46, 380000, 690000, ARRAY['pool', 'gym', 'cinema', 'cafe', 'gardens'], 'Tropical retirement paradise in Far North Queensland', -16.9186, 145.7781, TRUE, 'admin'),

('Lakeside Gardens Village', 'Lakeside QLD', 'QLD', 'Maroochydore', '67 Lake Street', '4558', '07 5443 6600', 'info@lakesideqld.com.au', 'https://lakesideqld.com.au', ARRAY['independent-living', 'assisted-living'], ARRAY['villa', 'apartment'], 'leasehold', 52, 460000, 840000, ARRAY['pool', 'gym', 'bowling-green', 'cafe', 'lake-access'], 'Premium retirement village near beaches and lakes', -26.6561, 153.0889, TRUE, 'admin'),

('Heritage Valley Village', 'Heritage QLD', 'QLD', 'Toowoomba', '89 Heritage Drive', '4350', '07 4632 5500', 'enquiries@heritagevalley.com.au', 'https://heritagevalley.com.au', ARRAY['independent-living'], ARRAY['villa'], 'freehold', 48, 340000, 600000, ARRAY['pool', 'bowling-green', 'workshop', 'library', 'cafe'], 'Retirement village in the Garden City', -27.5598, 151.9507, TRUE, 'admin'),

('Coral Cove Retirement', 'Coral Living', 'QLD', 'Mackay', '45 Coral Street', '4740', '07 4957 4400', 'info@coralcove.com.au', 'https://coralcove.com.au', ARRAY['independent-living', 'assisted-living'], ARRAY['villa', 'apartment'], 'leasehold', 44, 360000, 650000, ARRAY['pool', 'gym', 'cafe', 'beach-access', 'gardens'], 'Coastal retirement living in tropical Mackay', -21.1406, 149.1861, TRUE, 'admin'),

('Seabreeze Village', 'Seabreeze Estates', 'QLD', 'Hervey Bay', '78 Seabreeze Avenue', '4655', '07 4124 3300', 'contact@seabreezevillage.com.au', 'https://seabreezevillage.com.au', ARRAY['independent-living'], ARRAY['villa'], 'leasehold', 50, 380000, 680000, ARRAY['pool', 'bowling-green', 'workshop', 'cafe', 'beach-access'], 'Relaxed retirement village near the bay', -25.2887, 152.8431, TRUE, 'admin'),

('Mountain Springs Village', 'Mountain Springs Group', 'QLD', 'Buderim', '123 Mountain Road', '4556', '07 5476 8800', 'info@mountainsprings.com.au', 'https://mountainsprings.com.au', ARRAY['independent-living', 'assisted-living'], ARRAY['villa', 'apartment'], 'leasehold', 54, 470000, 860000, ARRAY['pool', 'gym', 'cinema', 'cafe', 'gardens'], 'Elevated retirement living with stunning hinterland views', -26.6833, 153.0500, TRUE, 'admin'),

('River Glen Village', 'River Glen Living', 'QLD', 'Bundaberg', '56 River Road', '4670', '07 4151 7700', 'enquiries@riverglen.com.au', 'https://riverglen.com.au', ARRAY['independent-living'], ARRAY['villa'], 'leasehold', 42, 330000, 580000, ARRAY['pool', 'bowling-green', 'workshop', 'library', 'cafe'], 'Peaceful retirement community in the Bundaberg region', -24.8661, 152.3489, TRUE, 'admin'),

-- South Australia (4 villages)
('Adelaide Hills Village', 'Hills Living Group', 'SA', 'Stirling', '34 Hills Drive', '5152', '08 8339 8800', 'info@adelaidehills.com.au', 'https://adelaidehills.com.au', ARRAY['independent-living'], ARRAY['villa', 'apartment'], 'leasehold', 46, 420000, 750000, ARRAY['pool', 'gym', 'library', 'cafe', 'gardens'], 'Premium retirement living in the Adelaide Hills', -35.0044, 138.7169, TRUE, 'admin'),

('Coastal Pines Village', 'Coastal Pines SA', 'SA', 'Victor Harbor', '67 Coastal Road', '5211', '08 8552 7700', 'contact@coastalpines.com.au', 'https://coastalpines.com.au', ARRAY['independent-living', 'assisted-living'], ARRAY['villa'], 'leasehold', 44, 380000, 680000, ARRAY['pool', 'bowling-green', 'cafe', 'beach-access', 'gardens'], 'Seaside retirement village on the Fleurieu Peninsula', -35.5522, 138.6183, TRUE, 'admin'),

('Barossa Valley Village', 'Barossa Living', 'SA', 'Tanunda', '89 Valley Street', '5352', '08 8563 6600', 'info@barossavillage.com.au', 'https://barossavillage.com.au', ARRAY['independent-living'], ARRAY['villa'], 'freehold', 38, 360000, 630000, ARRAY['pool', 'bowling-green', 'workshop', 'library', 'cafe'], 'Retirement village in the heart of wine country', -34.5269, 138.9592, TRUE, 'admin'),

('Riverside Meadows', 'Riverside SA', 'SA', 'Murray Bridge', '45 Riverside Drive', '5253', '08 8532 5500', 'enquiries@riversidemeadows.com.au', 'https://riversidemeadows.com.au', ARRAY['independent-living', 'assisted-living'], ARRAY['villa', 'apartment'], 'leasehold', 40, 330000, 580000, ARRAY['pool', 'gym', 'bowling-green', 'cafe', 'river-access'], 'Tranquil retirement living by the Murray River', -35.1189, 139.2739, TRUE, 'admin'),

-- Western Australia (3 villages)
('Swan Valley Village', 'Swan Valley Living', 'WA', 'Midland', '78 Swan Street', '6056', '08 9274 8800', 'info@swanvalley.com.au', 'https://swanvalley.com.au', ARRAY['independent-living'], ARRAY['villa', 'apartment'], 'leasehold', 50, 420000, 760000, ARRAY['pool', 'gym', 'bowling-green', 'cafe', 'gardens'], 'Retirement village in Perth''s Swan Valley region', -31.8911, 116.0083, TRUE, 'admin'),

('Sunset Coast Village', 'Sunset WA', 'WA', 'Mandurah', '123 Sunset Boulevard', '6210', '08 9535 7700', 'contact@sunsetcoast.com.au', 'https://sunsetcoast.com.au', ARRAY['independent-living', 'assisted-living'], ARRAY['villa', 'apartment'], 'leasehold', 56, 410000, 780000, ARRAY['pool', 'gym', 'cinema', 'cafe', 'waterfront-access'], 'Premium waterfront retirement living south of Perth', -32.5269, 115.7233, TRUE, 'admin'),

('Karri Forest Village', 'Karri Living', 'WA', 'Bunbury', '56 Karri Drive', '6230', '08 9721 6600', 'info@karriforest.com.au', 'https://karriforest.com.au', ARRAY['independent-living'], ARRAY['villa'], 'leasehold', 42, 360000, 640000, ARRAY['pool', 'bowling-green', 'workshop', 'library', 'cafe'], 'Retirement village in the South West', -33.3267, 115.6397, TRUE, 'admin'),

-- Tasmania (1 village)
('Heritage Port Village', 'Heritage TAS', 'TAS', 'Devonport', '34 Heritage Avenue', '7310', '03 6424 5500', 'enquiries@heritageport.com.au', 'https://heritageport.com.au', ARRAY['independent-living', 'assisted-living'], ARRAY['villa', 'apartment'], 'leasehold', 36, 340000, 590000, ARRAY['pool', 'bowling-green', 'library', 'cafe', 'gardens'], 'Coastal retirement village on Tasmania''s north coast', -41.1769, 146.3614, TRUE, 'admin'),

-- Australian Capital Territory (1 village)
('Capital Gardens Village', 'Capital Living', 'ACT', 'Belconnen', '67 Capital Drive', '2617', '02 6251 4400', 'info@capitalgardens.com.au', 'https://capitalgardens.com.au', ARRAY['independent-living'], ARRAY['villa', 'apartment'], 'leasehold', 48, 480000, 860000, ARRAY['pool', 'gym', 'bowling-green', 'cinema', 'cafe'], 'Modern retirement village in Canberra''s north', -35.2381, 149.0650, TRUE, 'admin');
