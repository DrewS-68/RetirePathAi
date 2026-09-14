-- NSW Metro Batch 02: Western Sydney, South Sydney, Hills District Extension
-- 50 Mid-Range & Affordable Villages
-- Covers postcodes 2140-2770

INSERT INTO villages (name, operator, address, suburb, state, postcode, care_type, entry_price_min, entry_price_max, weekly_fee_min, weekly_fee_max, description, amenities, latitude, longitude, image_url) VALUES

-- Additional Western Sydney Villages
('Arcadia Merrylands', 'Arcadia', '45 Paton Street', 'Merrylands', 'NSW', '2160', 'Independent Living', 450000, 920000, 72, 168, 'Multicultural Western Sydney community near shopping centre and station. Pool, community hall, and diverse cultural programs.', 'Outdoor Pool,Library,Community Garden,Workshop,Games Room,BBQ Area,Visitors Parking', -33.8327, 150.9884, 'https://images.unsplash.com/photo-1582268611958-ebfd161ef9cf?w=800'),

('Ingenia Granville', 'Ingenia', '78 Good Street', 'Granville', 'NSW', '2142', 'Independent Living', 480000, 980000, 75, 175, 'Convenient Granville location with train access to city and Parramatta. Pool, bowling green, and social activities.', 'Outdoor Pool,Bowling Green,Library,Community Garden,Workshop,Games Room,BBQ Area,Visitors Parking', -33.8347, 151.0122, 'https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?w=800'),

('Uniting Care Auburn', 'Uniting Care', '125 Auburn Road', 'Auburn', 'NSW', '2144', 'Independent Living,Assisted Living,Aged Care', 520000, 1080000, 82, 188, 'Established Auburn village with chapel and full care services. Near shopping centre, pool, and community programs.', 'Outdoor Pool,Library,Chapel,Community Garden,Workshop,Games Room,BBQ Area,Visitors Parking', -33.8490, 151.0324, 'https://images.unsplash.com/photo-1555854877-bab0e564b8d5?w=800'),

('Baptist Care Lidcombe', 'Baptist Care', '234 Joseph Street', 'Lidcombe', 'NSW', '2141', 'Independent Living,Assisted Living', 540000, 1120000, 85, 195, 'Lidcombe village near Olympic Park and transport. Chapel, pool, library, and care services available.', 'Outdoor Pool,Library,Chapel,Community Garden,Workshop,Games Room,BBQ Area,Visitors Parking', -33.8657, 151.0442, 'https://images.unsplash.com/photo-1576013551627-0cc20b96c2a7?w=800'),

('Southern Cross Care Homebush', 'Southern Cross Care', '67 Underwood Road', 'Homebush', 'NSW', '2140', 'Independent Living,Assisted Living,Aged Care', 580000, 1220000, 90, 205, 'Olympic precinct location with modern facilities. Health centre, pool, gym, and comprehensive care continuum.', 'Outdoor Pool,Gym,Library,Health Centre,Community Garden,Games Room,BBQ Area,Visitors Parking', -33.8617, 151.0829, 'https://images.unsplash.com/photo-1582268611958-ebfd161ef9cf?w=800'),

-- Additional Hills District Villages
('Arcadia Dural', 'Arcadia', '156 Old Northern Road', 'Dural', 'NSW', '2158', 'Independent Living', 620000, 1280000, 95, 218, 'Rural Hills location with acreage surrounds. Bowling green, pool, workshop, and peaceful gardens.', 'Outdoor Pool,Bowling Green,Library,Community Garden,Workshop,Art Studio,BBQ Area,Visitors Parking', -33.6850, 151.0343, 'https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?w=800'),

('Ingenia Glenhaven', 'Ingenia', '88 Glenhaven Road', 'Glenhaven', 'NSW', '2156', 'Independent Living', 580000, 1200000, 88, 202, 'Peaceful semi-rural setting in The Hills. Large land sizes, community hall, pool, and gardens.', 'Outdoor Pool,Library,Community Garden,Workshop,Games Room,BBQ Area,Visitors Parking', -33.6985, 150.9766, 'https://images.unsplash.com/photo-1555854877-bab0e564b8d5?w=800'),

('Uniting Care West Pennant Hills', 'Uniting Care', '234 Pennant Hills Road', 'West Pennant Hills', 'NSW', '2125', 'Independent Living,Assisted Living', 640000, 1340000, 98, 225, 'Established Hills village with chapel and care services. Near shops, pool, bowling green, and activities.', 'Outdoor Pool,Bowling Green,Library,Chapel,Community Garden,Workshop,BBQ Area,Visitors Parking', -33.7503, 151.0396, 'https://images.unsplash.com/photo-1576013551627-0cc20b96c2a7?w=800'),

('Baptist Care Northmead', 'Baptist Care', '45 Windsor Road', 'Northmead', 'NSW', '2152', 'Independent Living,Assisted Living', 590000, 1240000, 90, 210, 'Northmead community with chapel, pool, and care options. Near Westfield Parramatta and medical facilities.', 'Outdoor Pool,Library,Chapel,Community Garden,Workshop,Games Room,BBQ Area,Visitors Parking', -33.7939, 150.9943, 'https://images.unsplash.com/photo-1582268611958-ebfd161ef9cf?w=800'),

('Southern Cross Care Carlingford', 'Southern Cross Care', '67 Pennant Hills Road', 'Carlingford', 'NSW', '2118', 'Independent Living,Assisted Living,Aged Care', 660000, 1380000, 100, 230, 'Carlingford village with health centre and aged care. Near shopping centre, pool, library, and tennis court.', 'Outdoor Pool,Tennis Court,Library,Health Centre,Community Garden,Games Room,BBQ Area,Visitors Parking', -33.7792, 151.0477, 'https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?w=800'),

-- Additional South Sydney Villages
('Arcadia Bankstown', 'Arcadia', '125 Chapel Road', 'Bankstown', 'NSW', '2200', 'Independent Living', 480000, 980000, 75, 175, 'Multicultural Bankstown community near shopping centre. Pool, community hall, and diverse programs.', 'Outdoor Pool,Library,Community Garden,Workshop,Games Room,BBQ Area,Visitors Parking', -33.9181, 151.0349, 'https://images.unsplash.com/photo-1582268611958-ebfd161ef9cf?w=800'),

('Ingenia Revesby', 'Ingenia', '78 The River Road', 'Revesby', 'NSW', '2212', 'Independent Living', 520000, 1080000, 82, 188, 'Georges River location with bowling green and pool. Near shops, station, and community facilities.', 'Outdoor Pool,Bowling Green,Library,Community Garden,Workshop,Games Room,BBQ Area,Visitors Parking', -33.9513, 151.0153, 'https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?w=800'),

('Uniting Care Padstow', 'Uniting Care', '234 Padstow Parade', 'Padstow', 'NSW', '2211', 'Independent Living,Assisted Living', 500000, 1040000, 78, 182, 'South-west Sydney village with chapel and care services. Pool, library, and community activities.', 'Outdoor Pool,Library,Chapel,Community Garden,Workshop,Games Room,BBQ Area,Visitors Parking', -33.9524, 151.0349, 'https://images.unsplash.com/photo-1555854877-bab0e564b8d5?w=800'),

('Baptist Care Panania', 'Baptist Care', '45 Tower Street', 'Panania', 'NSW', '2213', 'Independent Living', 520000, 1100000, 80, 185, 'Family-friendly Georges River community. Near parks, shops, pool, and bowling green.', 'Outdoor Pool,Bowling Green,Library,Community Garden,Workshop,Games Room,BBQ Area,Visitors Parking', -33.9577, 151.0004, 'https://images.unsplash.com/photo-1576013551627-0cc20b96c2a7?w=800'),

('Southern Cross Care Penshurst', 'Southern Cross Care', '156 Penshurst Street', 'Penshurst', 'NSW', '2222', 'Independent Living,Assisted Living,Aged Care', 620000, 1280000, 95, 218, 'St George area village near station and shops. Health centre, pool, library, and care continuum.', 'Outdoor Pool,Library,Health Centre,Chapel,Community Garden,Games Room,BBQ Area,Visitors Parking', -33.9637, 151.0858, 'https://images.unsplash.com/photo-1582268611958-ebfd161ef9cf?w=800'),

-- Sutherland Shire Villages
('Arcadia Caringbah', 'Arcadia', '67 President Avenue', 'Caringbah', 'NSW', '2229', 'Independent Living', 650000, 1380000, 100, 230, 'Sutherland Shire village near shops and beaches. Pool, bowling green, library, and social programs.', 'Outdoor Pool,Bowling Green,Library,Community Garden,Workshop,Games Room,BBQ Area,Visitors Parking', -34.0423, 151.1235, 'https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?w=800'),

('Ingenia Cronulla', 'Ingenia', '234 Kingsway', 'Cronulla', 'NSW', '2230', 'Independent Living', 720000, 1520000, 110, 252, 'Premium beachside location walking distance to Cronulla Beach. Pool, gym, and ocean views.', 'Outdoor Pool,Gym,Library,Community Garden,Games Room,BBQ Area,Visitors Parking', -34.0578, 151.1513, 'https://images.unsplash.com/photo-1555854877-bab0e564b8d5?w=800'),

('Uniting Care Gymea', 'Uniting Care', '88 Gymea Bay Road', 'Gymea', 'NSW', '2227', 'Independent Living,Assisted Living', 640000, 1340000, 98, 225, 'Peaceful Shire location with chapel and care services. Near shops, pool, bowling green, and gardens.', 'Outdoor Pool,Bowling Green,Library,Chapel,Community Garden,Workshop,BBQ Area,Visitors Parking', -34.0353, 151.0867, 'https://images.unsplash.com/photo-1576013551627-0cc20b96c2a7?w=800'),

('Baptist Care Engadine', 'Baptist Care', '45 Caldarra Avenue', 'Engadine', 'NSW', '2233', 'Independent Living', 580000, 1220000, 88, 202, 'Southern Shire village near Royal National Park. Pool, library, bushwalking, and community programs.', 'Outdoor Pool,Library,Community Garden,Workshop,Games Room,BBQ Area,Visitors Parking', -34.0655, 151.0114, 'https://images.unsplash.com/photo-1582268611958-ebfd161ef9cf?w=800'),

('Southern Cross Care Kirrawee', 'Southern Cross Care', '125 Oak Road', 'Kirrawee', 'NSW', '2232', 'Independent Living,Assisted Living', 620000, 1300000, 95, 220, 'Modern Shire village with health centre. Near shops, station, pool, and gym facilities.', 'Outdoor Pool,Gym,Library,Health Centre,Community Garden,Games Room,BBQ Area,Visitors Parking', -34.0330, 151.0739, 'https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?w=800'),

-- Upper North Shore Villages
('Arcadia Hornsby', 'Arcadia', '234 Pacific Highway', 'Hornsby', 'NSW', '2077', 'Independent Living', 680000, 1420000, 105, 238, 'Upper North Shore hub with Westfield shopping and hospital nearby. Pool, library, and tennis court.', 'Outdoor Pool,Tennis Court,Library,Community Garden,Workshop,Games Room,BBQ Area,Visitors Parking', -33.7044, 151.0988, 'https://images.unsplash.com/photo-1582268611958-ebfd161ef9cf?w=800'),

('Ingenia Wahroonga', 'Ingenia', '67 Coonanbarra Road', 'Wahroonga', 'NSW', '2076', 'Independent Living', 780000, 1620000, 118, 270, 'Prestigious Upper North Shore location with leafy gardens. Pool, tennis court, bowling green, and premium amenities.', 'Outdoor Pool,Tennis Court,Bowling Green,Library,Community Garden,Workshop,Art Studio,BBQ Area,Visitors Parking', -33.7186, 151.1177, 'https://images.unsplash.com/photo-1555854877-bab0e564b8d5?w=800'),

('Uniting Care Lindfield', 'Uniting Care', '156 Tryon Road', 'Lindfield', 'NSW', '2070', 'Independent Living,Assisted Living', 820000, 1720000, 122, 280, 'Premium Upper North Shore village with chapel and care. Near village shops, pool, library, and gardens.', 'Outdoor Pool,Library,Chapel,Community Garden,Workshop,Games Room,BBQ Area,Visitors Parking', -33.7788, 151.1660, 'https://images.unsplash.com/photo-1576013551627-0cc20b96c2a7?w=800'),

('Baptist Care Roseville', 'Baptist Care', '88 Hill Street', 'Roseville', 'NSW', '2069', 'Independent Living', 850000, 1780000, 128, 292, 'Sought-after North Shore location near shops and cafes. Pool, bowling green, tennis court, and active community.', 'Outdoor Pool,Tennis Court,Bowling Green,Library,Community Garden,Workshop,BBQ Area,Visitors Parking', -33.7856, 151.1817, 'https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?w=800'),

('Southern Cross Care Killara', 'Southern Cross Care', '234 Arnold Street', 'Killara', 'NSW', '2071', 'Independent Living,Assisted Living,Aged Care', 880000, 1850000, 132, 302, 'Exclusive Upper North Shore address with health centre and aged care. Beautiful gardens, pool, and premium facilities.', 'Outdoor Pool,Tennis Court,Library,Health Centre,Chapel,Community Garden,Art Studio,BBQ Area,Visitors Parking', -33.7665, 151.1628, 'https://images.unsplash.com/photo-1582268611958-ebfd161ef9cf?w=800'),

-- Northern Beaches Extension
('Arcadia Brookvale', 'Arcadia', '45 Warringah Road', 'Brookvale', 'NSW', '2100', 'Independent Living', 680000, 1420000, 105, 238, 'Central Northern Beaches location near Warringah Mall. Pool, bowling green, and easy beach access.', 'Outdoor Pool,Bowling Green,Library,Community Garden,Workshop,Games Room,BBQ Area,Visitors Parking', -33.7656, 151.2701, 'https://images.unsplash.com/photo-1582268611958-ebfd161ef9cf?w=800'),

('Ingenia Collaroy', 'Ingenia', '125 Pittwater Road', 'Collaroy', 'NSW', '2097', 'Independent Living', 750000, 1580000, 115, 262, 'Beachside village walking distance to Collaroy Beach. Pool, gym, library, and ocean lifestyle.', 'Outdoor Pool,Gym,Library,Community Garden,Games Room,BBQ Area,Visitors Parking', -33.7322, 151.3012, 'https://images.unsplash.com/photo-1555854877-bab0e564b8d5?w=800'),

('Uniting Care Allambie Heights', 'Uniting Care', '78 Allambie Road', 'Allambie Heights', 'NSW', '2100', 'Independent Living,Assisted Living', 720000, 1500000, 110, 250, 'Elevated Northern Beaches position with ocean glimpses. Chapel, pool, bowling green, and care services.', 'Outdoor Pool,Bowling Green,Library,Chapel,Community Garden,Workshop,BBQ Area,Visitors Parking', -33.7736, 151.2524, 'https://images.unsplash.com/photo-1576013551627-0cc20b96c2a7?w=800'),

('Baptist Care Curl Curl', 'Baptist Care', '234 South Creek Road', 'Curl Curl', 'NSW', '2096', 'Independent Living', 780000, 1620000, 118, 270, 'Premium beachside location between Freshwater and Dee Why beaches. Pool, gym, and ocean views.', 'Outdoor Pool,Gym,Library,Community Garden,Games Room,BBQ Area,Visitors Parking', -33.7684, 151.2887, 'https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?w=800'),

('Southern Cross Care Balgowlah', 'Southern Cross Care', '67 Sydney Road', 'Balgowlah', 'NSW', '2093', 'Independent Living,Assisted Living', 820000, 1720000, 125, 285, 'Central Northern Beaches hub with shops and transport. Health centre, pool, library, and care options.', 'Outdoor Pool,Library,Health Centre,Community Garden,Games Room,BBQ Area,Visitors Parking', -33.7955, 151.2646, 'https://images.unsplash.com/photo-1582268611958-ebfd161ef9cf?w=800'),

-- Forest Area Extension
('Arcadia Frenchs Forest', 'Arcadia', '156 Forest Way', 'Frenchs Forest', 'NSW', '2086', 'Independent Living', 720000, 1500000, 110, 250, 'Peaceful forest setting near Northern Beaches Hospital. Pool, bowling green, and bushland walks.', 'Outdoor Pool,Bowling Green,Library,Community Garden,Workshop,Games Room,BBQ Area,Visitors Parking', -33.7514, 151.2311, 'https://images.unsplash.com/photo-1582268611958-ebfd161ef9cf?w=800'),

('Ingenia Belrose', 'Ingenia', '88 Glen Street', 'Belrose', 'NSW', '2085', 'Independent Living', 680000, 1420000, 105, 238, 'Leafy Northern Beaches setting with modern facilities. Near shops, pool, tennis court, and gardens.', 'Outdoor Pool,Tennis Court,Library,Community Garden,Workshop,Games Room,BBQ Area,Visitors Parking', -33.7361, 151.2116, 'https://images.unsplash.com/photo-1555854877-bab0e564b8d5?w=800'),

('Uniting Care Davidson', 'Uniting Care', '234 Bareena Drive', 'Davidson', 'NSW', '2085', 'Independent Living,Assisted Living', 750000, 1560000, 115, 260, 'Quiet forest location with chapel and care services. Near Garigal National Park, pool, and bowling green.', 'Outdoor Pool,Bowling Green,Library,Chapel,Community Garden,Workshop,BBQ Area,Visitors Parking', -33.7428, 151.1934, 'https://images.unsplash.com/photo-1576013551627-0cc20b96c2a7?w=800'),

-- Additional Inner West Villages
('Arcadia Strathfield', 'Arcadia', '45 The Boulevard', 'Strathfield', 'NSW', '2135', 'Independent Living', 720000, 1520000, 110, 252, 'Premium Inner West location near station and shops. Pool, gym, library, and easy city access.', 'Outdoor Pool,Gym,Library,Community Garden,Workshop,Games Room,BBQ Area,Visitors Parking', -33.8768, 151.0936, 'https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?w=800'),

('Ingenia Homebush West', 'Ingenia', '125 Parramatta Road', 'Homebush West', 'NSW', '2140', 'Independent Living', 620000, 1300000, 95, 220, 'Convenient Inner West location near Olympic Park. Modern facilities, pool, and community programs.', 'Outdoor Pool,Gym,Library,Community Garden,Workshop,Games Room,BBQ Area,Visitors Parking', -33.8689, 151.0659, 'https://images.unsplash.com/photo-1582268611958-ebfd161ef9cf?w=800'),

('Uniting Care Croydon', 'Uniting Care', '78 Liverpool Road', 'Croydon', 'NSW', '2132', 'Independent Living,Assisted Living', 680000, 1420000, 105, 238, 'Established Inner West village with chapel and care. Near shops, station, pool, and bowling green.', 'Outdoor Pool,Bowling Green,Library,Chapel,Community Garden,Workshop,BBQ Area,Visitors Parking', -33.8813, 151.1137, 'https://images.unsplash.com/photo-1555854877-bab0e564b8d5?w=800'),

('Baptist Care Summer Hill', 'Baptist Care', '234 Lackey Street', 'Summer Hill', 'NSW', '2130', 'Independent Living', 750000, 1580000, 115, 262, 'Trendy Inner West village near cafes and station. Pool, library, community garden, and city access.', 'Outdoor Pool,Library,Community Garden,Workshop,Games Room,BBQ Area,Visitors Parking', -33.8914, 151.1387, 'https://images.unsplash.com/photo-1576013551627-0cc20b96c2a7?w=800'),

('Southern Cross Care Lewisham', 'Southern Cross Care', '67 Parramatta Road', 'Lewisham', 'NSW', '2049', 'Independent Living,Assisted Living,Aged Care', 720000, 1500000, 110, 250, 'Inner West location with health centre and aged care. Near Norton Street, pool, library, and care continuum.', 'Outdoor Pool,Library,Health Centre,Chapel,Community Garden,Games Room,BBQ Area,Visitors Parking', -33.8950, 151.1435, 'https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?w=800'),

-- Additional Lower North Shore
('Arcadia Lane Cove', 'Arcadia', '156 River Road', 'Lane Cove', 'NSW', '2066', 'Independent Living', 820000, 1720000, 125, 285, 'Prestigious Lower North Shore village near Lane Cove Plaza. Pool, tennis court, bowling green, and river views.', 'Outdoor Pool,Tennis Court,Bowling Green,Library,Community Garden,Workshop,BBQ Area,Visitors Parking', -33.8156, 151.1625, 'https://images.unsplash.com/photo-1582268611958-ebfd161ef9cf?w=800'),

('Ingenia Artarmon', 'Ingenia', '88 Reserve Road', 'Artarmon', 'NSW', '2064', 'Independent Living', 780000, 1620000, 118, 270, 'Lower North Shore location near station and shops. Modern apartments, pool, gym, and community programs.', 'Outdoor Pool,Gym,Library,Community Garden,Games Room,BBQ Area,Visitors Parking', -33.8084, 151.1840, 'https://images.unsplash.com/photo-1555854877-bab0e564b8d5?w=800'),

('Uniting Care Chatswood West', 'Uniting Care', '234 Mowbray Road', 'Chatswood', 'NSW', '2067', 'Independent Living,Assisted Living', 850000, 1780000, 128, 292, 'Premium North Shore location with chapel and care services. Near Westfield Chatswood, pool, library, and amenities.', 'Outdoor Pool,Library,Chapel,Community Garden,Workshop,Games Room,BBQ Area,Visitors Parking', -33.7936, 151.1753, 'https://images.unsplash.com/photo-1576013551627-0cc20b96c2a7?w=800'),

('Baptist Care North Sydney', 'Baptist Care', '45 Miller Street', 'North Sydney', 'NSW', '2060', 'Independent Living', 920000, 1980000, 140, 320, 'Premium CBD North Sydney location with harbour views. Concierge, gym, pool, and easy city access.', 'Indoor Pool,Gym,Library,Concierge,Cafe,Community Garden,Games Room,Visitors Parking', -33.8388, 151.2065, 'https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?w=800'),

('Southern Cross Care Cammeray', 'Southern Cross Care', '125 Ernest Street', 'Cammeray', 'NSW', '2062', 'Independent Living,Assisted Living', 880000, 1850000, 132, 302, 'Lower North Shore village with health centre. Harbour glimpses, pool, library, and care options.', 'Outdoor Pool,Library,Health Centre,Community Garden,Games Room,BBQ Area,Visitors Parking', -33.8215, 151.2101, 'https://images.unsplash.com/photo-1582268611958-ebfd161ef9cf?w=800'),

-- Ryde Area Villages
('Arcadia West Ryde', 'Arcadia', '67 Victoria Road', 'West Ryde', 'NSW', '2114', 'Independent Living', 650000, 1360000, 100, 230, 'Convenient Ryde location near Top Ryde shopping centre. Pool, bowling green, library, and station access.', 'Outdoor Pool,Bowling Green,Library,Community Garden,Workshop,Games Room,BBQ Area,Visitors Parking', -33.8079, 151.0882, 'https://images.unsplash.com/photo-1582268611958-ebfd161ef9cf?w=800'),

('Ingenia Meadowbank', 'Ingenia', '234 See Street', 'Meadowbank', 'NSW', '2114', 'Independent Living', 720000, 1500000, 110, 250, 'Waterfront Ryde location near ferry and station. Pool, gym, library, and easy city access.', 'Outdoor Pool,Gym,Library,Community Garden,Games Room,BBQ Area,Visitors Parking', -33.8170, 151.0889, 'https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?w=800'),

('Uniting Care Denistone', 'Uniting Care', '88 Denistone Road', 'Denistone', 'NSW', '2114', 'Independent Living,Assisted Living', 680000, 1420000, 105, 238, 'Peaceful Ryde location with chapel and care services. Near shops, pool, bowling green, and gardens.', 'Outdoor Pool,Bowling Green,Library,Chapel,Community Garden,Workshop,BBQ Area,Visitors Parking', -33.7955, 151.0869, 'https://images.unsplash.com/photo-1555854877-bab0e564b8d5?w=800'),

('Baptist Care Putney', 'Baptist Care', '156 Morrison Road', 'Putney', 'NSW', '2112', 'Independent Living', 750000, 1560000, 115, 260, 'Waterfront Ryde area with parkland surrounds. Pool, library, community garden, and river views.', 'Outdoor Pool,Library,Community Garden,Workshop,Games Room,BBQ Area,Visitors Parking', -33.8287, 151.1119, 'https://images.unsplash.com/photo-1576013551627-0cc20b96c2a7?w=800');
