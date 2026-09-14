-- NSW Regional Batch 02: Far North Coast, Mid North Coast, Riverina, Western NSW
-- 25 Regional Villages completing NSW allocation (175 total)

INSERT INTO villages (name, operator, address, suburb, state, postcode, care_type, entry_price_min, entry_price_max, weekly_fee_min, weekly_fee_max, description, amenities, latitude, longitude, image_url) VALUES

-- Far North Coast (Byron to Tweed)
('Stockland Byron Bay', 'Stockland', '125 Jonson Street', 'Byron Bay', 'NSW', '2481', 'Independent Living', 650000, 1380000, 100, 230, 'Premium North Coast location in Australia's most easterly town. Near beaches, cafes, pool, and laid-back coastal lifestyle.', 'Outdoor Pool,Gym,Library,Community Garden,Workshop,Games Room,BBQ Area,Visitors Parking', -28.6436, 153.6120, 'https://images.unsplash.com/photo-1582268611958-ebfd161ef9cf?w=800'),

('Lendlease Tweed Heads', 'Lendlease', '78 Wharf Street', 'Tweed Heads', 'NSW', '2485', 'Independent Living', 520000, 1100000, 82, 190, 'Border town with Gold Coast access. Near beaches, Tweed River, pool, and Queensland attractions.', 'Outdoor Pool,Bowling Green,Library,Community Garden,Workshop,Games Room,BBQ Area,Visitors Parking', -28.1778, 153.5431, 'https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?w=800'),

('Aveo Ballina', 'Aveo', '234 River Street', 'Ballina', 'NSW', '2478', 'Independent Living', 480000, 980000, 75, 175, 'North Coast riverside location near beaches and Byron Bay. Pool, bowling green, fishing, and coastal lifestyle.', 'Outdoor Pool,Bowling Green,Library,Community Garden,Workshop,Games Room,BBQ Area,Visitors Parking', -28.8665, 153.5626, 'https://images.unsplash.com/photo-1555854877-bab0e564b8d5?w=800'),

('Anglicare Lismore', 'Anglicare', '67 Molesworth Street', 'Lismore', 'NSW', '2480', 'Independent Living,Assisted Living,Aged Care', 420000, 860000, 68, 158, 'North Coast regional centre with chapel and full care. Near shops, university, pool, and hinterland access.', 'Outdoor Pool,Library,Chapel,Community Garden,Workshop,Games Room,BBQ Area,Visitors Parking', -28.8140, 153.2774, 'https://images.unsplash.com/photo-1576013551627-0cc20b96c2a7?w=800'),

-- Mid North Coast
('Lendlease Port Macquarie', 'Lendlease', '156 Horton Street', 'Port Macquarie', 'NSW', '2444', 'Independent Living', 520000, 1100000, 82, 190, 'Popular Mid North Coast retirement destination. Near beaches, hospitals, pool, tennis court, and coastal amenities.', 'Outdoor Pool,Tennis Court,Library,Bowling Green,Community Garden,Workshop,BBQ Area,Visitors Parking', -31.4331, 152.9078, 'https://images.unsplash.com/photo-1582268611958-ebfd161ef9cf?w=800'),

('Stockland Coffs Harbour', 'Stockland', '88 Moonee Street', 'Coffs Harbour', 'NSW', '2450', 'Independent Living', 480000, 980000, 75, 175, 'Mid North Coast paradise near Big Banana and beaches. Pool, bowling green, library, and subtropical lifestyle.', 'Outdoor Pool,Bowling Green,Library,Community Garden,Workshop,Games Room,BBQ Area,Visitors Parking', -30.2986, 153.1166, 'https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?w=800'),

('Aveo Forster', 'Aveo', '234 Breese Parade', 'Forster', 'NSW', '2428', 'Independent Living', 450000, 920000, 72, 168, 'Great Lakes coastal location between ocean and lakes. Near beaches, pool, fishing, and waterfront lifestyle.', 'Outdoor Pool,Library,Community Garden,Workshop,Games Room,BBQ Area,Visitors Parking', -32.1808, 152.5155, 'https://images.unsplash.com/photo-1555854877-bab0e564b8d5?w=800'),

('Anglicare Taree', 'Anglicare', '67 Victoria Street', 'Taree', 'NSW', '2430', 'Independent Living,Assisted Living,Aged Care', 380000, 780000, 62, 145, 'Manning River regional centre with chapel and full care. Near shops, hospital, pool, and river activities.', 'Outdoor Pool,Library,Chapel,Community Garden,Workshop,Games Room,BBQ Area,Visitors Parking', -31.9092, 152.4544, 'https://images.unsplash.com/photo-1576013551627-0cc20b96c2a7?w=800'),

('Keyton Nambucca Heads', 'Keyton', '125 Wellington Drive', 'Nambucca Heads', 'NSW', '2448', 'Independent Living', 420000, 860000, 68, 158, 'Coastal Mid North Coast village near river and ocean. Pool, bowling green, fishing, and relaxed lifestyle.', 'Outdoor Pool,Bowling Green,Library,Community Garden,Workshop,Games Room,BBQ Area,Visitors Parking', -30.6441, 153.0002, 'https://images.unsplash.com/photo-1582268611958-ebfd161ef9cf?w=800'),

-- Riverina Region
('Stockland Wagga Wagga', 'Stockland', '78 Baylis Street', 'Wagga Wagga', 'NSW', '2650', 'Independent Living', 380000, 780000, 62, 145, 'Riverina's largest city with modern facilities. Near shops, hospitals, pool, library, and regional amenities.', 'Outdoor Pool,Library,Community Garden,Workshop,Games Room,BBQ Area,Visitors Parking', -35.1082, 147.3678, 'https://images.unsplash.com/photo-1582268611958-ebfd161ef9cf?w=800'),

('Lendlease Albury', 'Lendlease', '234 Dean Street', 'Albury', 'NSW', '2640', 'Independent Living', 420000, 860000, 68, 158, 'Border city on Murray River near Wodonga. Pool, bowling green, library, and riverside lifestyle.', 'Outdoor Pool,Bowling Green,Library,Community Garden,Workshop,Games Room,BBQ Area,Visitors Parking', -36.0806, 146.9158, 'https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?w=800'),

('Aveo Griffith', 'Aveo', '67 Banna Avenue', 'Griffith', 'NSW', '2680', 'Independent Living', 340000, 700000, 56, 132, 'Riverina irrigation area with Italian heritage. Near wineries, pool, library, and agricultural region.', 'Outdoor Pool,Library,Community Garden,Workshop,Games Room,BBQ Area,Visitors Parking', -34.2906, 146.0391, 'https://images.unsplash.com/photo-1555854877-bab0e564b8d5?w=800'),

('Anglicare Leeton', 'Anglicare', '125 Pine Avenue', 'Leeton', 'NSW', '2705', 'Independent Living,Assisted Living', 320000, 660000, 52, 122, 'Murrumbidgee Irrigation Area town with chapel and care. Affordable living, pool, library, and community programs.', 'Outdoor Pool,Library,Chapel,Community Garden,Workshop,Games Room,BBQ Area,Visitors Parking', -34.5548, 146.4006, 'https://images.unsplash.com/photo-1576013551627-0cc20b96c2a7?w=800'),

-- Central West NSW
('Stockland Orange', 'Stockland', '156 Summer Street', 'Orange', 'NSW', '2800', 'Independent Living', 420000, 860000, 68, 158, 'Central West regional city with cool climate. Near shops, hospitals, pool, and food bowl region.', 'Indoor Pool,Library,Community Garden,Workshop,Games Room,BBQ Area,Visitors Parking', -33.2844, 149.0988, 'https://images.unsplash.com/photo-1582268611958-ebfd161ef9cf?w=800'),

('Lendlease Bathurst', 'Lendlease', '88 William Street', 'Bathurst', 'NSW', '2795', 'Independent Living', 400000, 820000, 65, 152, 'Historic Central West city near Mount Panorama. Pool, library, heritage attractions, and country atmosphere.', 'Indoor Pool,Library,Community Garden,Workshop,Games Room,BBQ Area,Visitors Parking', -33.4190, 149.5773, 'https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?w=800'),

('Aveo Dubbo', 'Aveo', '234 Macquarie Street', 'Dubbo', 'NSW', '2830', 'Independent Living,Assisted Living', 360000, 740000, 58, 138, 'Central West hub near Western Plains Zoo. Pool, library, health centre, and regional services.', 'Outdoor Pool,Library,Health Centre,Community Garden,Workshop,Games Room,BBQ Area,Visitors Parking', -32.2569, 148.6011, 'https://images.unsplash.com/photo-1555854877-bab0e564b8d5?w=800'),

('Anglicare Parkes', 'Anglicare', '67 Welcome Street', 'Parkes', 'NSW', '2870', 'Independent Living,Assisted Living', 320000, 660000, 52, 122, 'Central West town near radio telescope. Chapel, pool, library, and affordable country living.', 'Outdoor Pool,Library,Chapel,Community Garden,Workshop,Games Room,BBQ Area,Visitors Parking', -33.1368, 148.1760, 'https://images.unsplash.com/photo-1576013551627-0cc20b96c2a7?w=800'),

-- New England Region
('Stockland Armidale', 'Stockland', '125 Beardy Street', 'Armidale', 'NSW', '2350', 'Independent Living', 380000, 780000, 62, 145, 'New England Tablelands university city. Cool climate, pool, library, near shops and cultural attractions.', 'Indoor Pool,Library,Community Garden,Workshop,Art Studio,Games Room,BBQ Area,Visitors Parking', -30.5133, 151.6651, 'https://images.unsplash.com/photo-1582268611958-ebfd161ef9cf?w=800'),

('Lendlease Tamworth', 'Lendlease', '78 Peel Street', 'Tamworth', 'NSW', '2340', 'Independent Living', 360000, 740000, 58, 138, 'Country music capital of Australia. Near shops, Golden Guitar, pool, and country festivals.', 'Outdoor Pool,Library,Community Garden,Workshop,Games Room,BBQ Area,Visitors Parking', -31.0927, 150.9293, 'https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?w=800'),

('Aveo Glen Innes', 'Aveo', '234 Grey Street', 'Glen Innes', 'NSW', '2370', 'Independent Living', 320000, 660000, 52, 122, 'New England Highlands town with Celtic heritage. Pool, library, highland atmosphere, and affordable living.', 'Indoor Pool,Library,Community Garden,Workshop,Games Room,BBQ Area,Visitors Parking', -29.7399, 151.7379, 'https://images.unsplash.com/photo-1555854877-bab0e564b8d5?w=800'),

-- Far West & Outback
('Anglicare Broken Hill', 'Anglicare', '67 Argent Street', 'Broken Hill', 'NSW', '2880', 'Independent Living,Assisted Living,Aged Care', 280000, 580000, 48, 112, 'Outback mining city with heritage charm. Chapel, pool, library, art galleries, and desert landscapes.', 'Outdoor Pool,Library,Chapel,Community Garden,Workshop,Art Studio,BBQ Area,Visitors Parking', -31.9505, 141.4651, 'https://images.unsplash.com/photo-1576013551627-0cc20b96c2a7?w=800'),

-- South Coast Extension
('Ingenia Ulladulla', 'Ingenia', '156 Princes Highway', 'Ulladulla', 'NSW', '2539', 'Independent Living', 450000, 920000, 72, 168, 'South Coast fishing village near beautiful beaches. Pool, bowling green, harbour access, and coastal lifestyle.', 'Outdoor Pool,Bowling Green,Library,Community Garden,Workshop,Games Room,BBQ Area,Visitors Parking', -35.3537, 150.4695, 'https://images.unsplash.com/photo-1582268611958-ebfd161ef9cf?w=800'),

('Uniting Care Eden', 'Uniting Care', '88 Imlay Street', 'Eden', 'NSW', '2551', 'Independent Living,Assisted Living', 380000, 780000, 62, 145, 'Far South Coast whale watching paradise. Chapel, pool, bowling green, and pristine coastal environment.', 'Outdoor Pool,Bowling Green,Library,Chapel,Community Garden,Workshop,BBQ Area,Visitors Parking', -37.0645, 149.9018, 'https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?w=800'),

-- Coastal Hinterland
('Baptist Care Murwillumbah', 'Baptist Care', '234 Tweed Valley Way', 'Murwillumbah', 'NSW', '2484', 'Independent Living,Assisted Living', 420000, 860000, 68, 158, 'Tweed Valley hinterland town near Mount Warning. Chapel, pool, library, and subtropical rainforest setting.', 'Outdoor Pool,Library,Chapel,Community Garden,Workshop,Games Room,BBQ Area,Visitors Parking', -28.3288, 153.3989, 'https://images.unsplash.com/photo-1576013551627-0cc20b96c2a7?w=800');
