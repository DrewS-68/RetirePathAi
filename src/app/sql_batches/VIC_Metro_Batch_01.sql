-- VIC Metro Batch 01: Melbourne Eastern Suburbs, Bayside, Mornington Peninsula
-- 50 Premium & Mid-Range Victorian Villages

INSERT INTO villages (name, operator, address, suburb, state, postcode, care_type, entry_price_min, entry_price_max, weekly_fee_min, weekly_fee_max, description, amenities, latitude, longitude, image_url) VALUES

-- Eastern Suburbs Premium
('Lendlease Kew', 'Lendlease', '125 High Street', 'Kew', 'VIC', '3101', 'Independent Living', 780000, 1650000, 118, 270, 'Prestigious inner-east Melbourne location near shops and gardens. Pool, tennis court, library, and premium amenities.', 'Outdoor Pool,Tennis Court,Library,Bowling Green,Community Garden,Workshop,Art Studio,BBQ Area,Visitors Parking', -37.8073, 145.0342, 'https://images.unsplash.com/photo-1582268611958-ebfd161ef9cf?w=800'),

('Stockland Camberwell', 'Stockland', '78 Burke Road', 'Camberwell', 'VIC', '3124', 'Independent Living', 720000, 1520000, 110, 252, 'Sought-after Camberwell location near Junction shopping. Modern facilities, pool, gym, and vibrant community.', 'Outdoor Pool,Gym,Library,Community Garden,Workshop,Cafe,Games Room,BBQ Area,Visitors Parking', -37.8279, 145.0571, 'https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?w=800'),

('Aveo Hawthorn', 'Aveo', '234 Burwood Road', 'Hawthorn', 'VIC', '3122', 'Independent Living', 750000, 1580000, 115, 260, 'Inner-east location near Glenferrie Road shopping. Pool, library, tram access, and leafy surrounds.', 'Outdoor Pool,Library,Community Garden,Workshop,Games Room,BBQ Area,Visitors Parking', -37.8220, 145.0308, 'https://images.unsplash.com/photo-1555854877-bab0e564b8d5?w=800'),

('Lendlease Balwyn', 'Lendlease', '67 Whitehorse Road', 'Balwyn', 'VIC', '3103', 'Independent Living,Assisted Living', 780000, 1620000, 118, 270, 'Premium Eastern suburbs village with health centre. Near shops, pool, tennis court, and care services.', 'Outdoor Pool,Tennis Court,Library,Health Centre,Community Garden,Workshop,BBQ Area,Visitors Parking', -37.8094, 145.0836, 'https://images.unsplash.com/photo-1576013551627-0cc20b96c2a7?w=800'),

('Keyton Canterbury', 'Keyton', '156 Canterbury Road', 'Canterbury', 'VIC', '3126', 'Independent Living', 680000, 1420000, 105, 238, 'Leafy inner-east location near Maling Road village. Pool, bowling green, library, and garden city atmosphere.', 'Outdoor Pool,Bowling Green,Library,Community Garden,Workshop,Games Room,BBQ Area,Visitors Parking', -37.8273, 145.0625, 'https://images.unsplash.com/photo-1582268611958-ebfd161ef9cf?w=800'),

-- Bayside Premium Villages
('Stockland Brighton', 'Stockland', '88 Church Street', 'Brighton', 'VIC', '3186', 'Independent Living', 850000, 1780000, 128, 292, 'Exclusive bayside location near Brighton Beach and bathing boxes. Premium apartments, pool, gym, and beach lifestyle.', 'Outdoor Pool,Gym,Library,Community Garden,Games Room,BBQ Area,Visitors Parking', -37.9078, 144.9944, 'https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?w=800'),

('Lendlease Sandringham', 'Lendlease', '234 Bay Road', 'Sandringham', 'VIC', '3191', 'Independent Living', 780000, 1650000, 118, 270, 'Bayside village walking distance to beach and village shops. Pool, bowling green, library, and coastal lifestyle.', 'Outdoor Pool,Bowling Green,Library,Community Garden,Workshop,BBQ Area,Visitors Parking', -37.9507, 145.0042, 'https://images.unsplash.com/photo-1555854877-bab0e564b8d5?w=800'),

('Aveo Hampton', 'Aveo', '67 Hampton Street', 'Hampton', 'VIC', '3188', 'Independent Living', 720000, 1520000, 110, 252, 'Bayside location near beach and shopping strip. Pool, library, tennis court, and beach access.', 'Outdoor Pool,Tennis Court,Library,Community Garden,Workshop,Games Room,BBQ Area,Visitors Parking', -37.9371, 144.9957, 'https://images.unsplash.com/photo-1576013551627-0cc20b96c2a7?w=800'),

('Anglicare Cheltenham', 'Anglicare', '125 Nepean Highway', 'Cheltenham', 'VIC', '3192', 'Independent Living,Assisted Living,Aged Care', 650000, 1350000, 100, 230, 'Bayside village with chapel and full care. Near Southland shopping, pool, library, and care continuum.', 'Outdoor Pool,Library,Chapel,Health Centre,Community Garden,Workshop,BBQ Area,Visitors Parking', -37.9675, 145.0524, 'https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?w=800'),

('Keyton Mentone', 'Keyton', '78 Balcombe Road', 'Mentone', 'VIC', '3194', 'Independent Living', 680000, 1420000, 105, 238, 'Bayside suburb near beach and parklands. Pool, bowling green, library, and community programs.', 'Outdoor Pool,Bowling Green,Library,Community Garden,Workshop,Games Room,BBQ Area,Visitors Parking', -37.9829, 145.0618, 'https://images.unsplash.com/photo-1582268611958-ebfd161ef9cf?w=800'),

-- Mornington Peninsula Villages
('Lendlease Mornington', 'Lendlease', '156 Main Street', 'Mornington', 'VIC', '3931', 'Independent Living', 620000, 1300000, 95, 218, 'Peninsula coastal town with village atmosphere. Near beaches, pier, pool, and bayside lifestyle.', 'Outdoor Pool,Library,Bowling Green,Community Garden,Workshop,Games Room,BBQ Area,Visitors Parking', -38.2194, 145.0383, 'https://images.unsplash.com/photo-1582268611958-ebfd161ef9cf?w=800'),

('Stockland Frankston', 'Stockland', '234 Nepean Highway', 'Frankston', 'VIC', '3199', 'Independent Living', 520000, 1080000, 82, 188, 'Bayside hub with shopping and beach access. Modern facilities, pool, gym, library, and Peninsula gateway.', 'Outdoor Pool,Gym,Library,Community Garden,Workshop,Games Room,BBQ Area,Visitors Parking', -38.1432, 145.1237, 'https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?w=800'),

('Aveo Mount Eliza', 'Aveo', '67 Canadian Bay Road', 'Mount Eliza', 'VIC', '3930', 'Independent Living', 680000, 1420000, 105, 238, 'Leafy Peninsula village with bay views. Near beaches, cafes, pool, and coastal village lifestyle.', 'Outdoor Pool,Library,Community Garden,Workshop,Games Room,BBQ Area,Visitors Parking', -38.1854, 145.0890, 'https://images.unsplash.com/photo-1555854877-bab0e564b8d5?w=800'),

('Anglicare Rosebud', 'Anglicare', '125 Point Nepean Road', 'Rosebud', 'VIC', '3939', 'Independent Living,Assisted Living', 480000, 980000, 75, 175, 'Peninsula holiday destination with year-round living. Chapel, pool, bowling green, and beach access.', 'Outdoor Pool,Bowling Green,Library,Chapel,Community Garden,Workshop,BBQ Area,Visitors Parking', -38.3580, 144.9017, 'https://images.unsplash.com/photo-1576013551627-0cc20b96c2a7?w=800'),

('Keyton Dromana', 'Keyton', '88 Point Nepean Road', 'Dromana', 'VIC', '3936', 'Independent Living', 520000, 1080000, 82, 188, 'Peninsula beachside location near pier and shops. Pool, library, Arthur's Seat views, and coastal lifestyle.', 'Outdoor Pool,Library,Community Garden,Workshop,Games Room,BBQ Area,Visitors Parking', -38.3370, 144.9616, 'https://images.unsplash.com/photo-1582268611958-ebfd161ef9cf?w=800'),

-- South Eastern Suburbs
('Lendlease Glen Waverley', 'Lendlease', '234 Springvale Road', 'Glen Waverley', 'VIC', '3150', 'Independent Living', 650000, 1360000, 100, 230, 'Family-friendly eastern suburb near shopping centre. Pool, gym, library, and multicultural community.', 'Outdoor Pool,Gym,Library,Community Garden,Workshop,Games Room,BBQ Area,Visitors Parking', -37.8800, 145.1601, 'https://images.unsplash.com/photo-1582268611958-ebfd161ef9cf?w=800'),

('Stockland Oakleigh', 'Stockland', '67 Atherton Road', 'Oakleigh', 'VIC', '3166', 'Independent Living', 620000, 1300000, 95, 218, 'Greek precinct with multicultural dining and shopping. Pool, library, easy city access, and vibrant community.', 'Outdoor Pool,Library,Community Garden,Workshop,Games Room,BBQ Area,Visitors Parking', -37.9004, 145.0898, 'https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?w=800'),

('Aveo Chadstone', 'Aveo', '125 Dandenong Road', 'Chadstone', 'VIC', '3148', 'Independent Living', 680000, 1420000, 105, 238, 'Near Australia's largest shopping centre. Modern apartments, pool, gym, and retail therapy on doorstep.', 'Outdoor Pool,Gym,Library,Community Garden,Games Room,BBQ Area,Visitors Parking', -37.8861, 145.0944, 'https://images.unsplash.com/photo-1555854877-bab0e564b8d5?w=800'),

('Anglicare Clayton', 'Anglicare', '78 Westall Road', 'Clayton', 'VIC', '3168', 'Independent Living,Assisted Living,Aged Care', 580000, 1220000, 90, 205, 'South-east location near Monash University and medical precinct. Chapel, pool, library, and care services.', 'Outdoor Pool,Library,Chapel,Health Centre,Community Garden,Workshop,BBQ Area,Visitors Parking', -37.9263, 145.1214, 'https://images.unsplash.com/photo-1576013551627-0cc20b96c2a7?w=800'),

('Keyton Wheelers Hill', 'Keyton', '234 Ferntree Gully Road', 'Wheelers Hill', 'VIC', '3150', 'Independent Living', 620000, 1300000, 95, 218, 'Established eastern suburb with parks and reserves. Pool, bowling green, library, and family atmosphere.', 'Outdoor Pool,Bowling Green,Library,Community Garden,Workshop,Games Room,BBQ Area,Visitors Parking', -37.9104, 145.1906, 'https://images.unsplash.com/photo-1582268611958-ebfd161ef9cf?w=800'),

-- Dandenong Ranges
('Lendlease Ferntree Gully', 'Lendlease', '67 Station Street', 'Ferntree Gully', 'VIC', '3156', 'Independent Living', 520000, 1080000, 82, 188, 'Foothills location near Dandenong Ranges National Park. Pool, library, bushwalking, and mountain air.', 'Outdoor Pool,Library,Community Garden,Workshop,Games Room,BBQ Area,Visitors Parking', -37.8847, 145.2965, 'https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?w=800'),

('Stockland Belgrave', 'Stockland', '125 Main Street', 'Belgrave', 'VIC', '3160', 'Independent Living', 480000, 980000, 75, 175, 'Dandenong Ranges village near Puffing Billy railway. Pool, library, cafes, and mountain lifestyle.', 'Outdoor Pool,Library,Community Garden,Workshop,Art Studio,Games Room,BBQ Area,Visitors Parking', -37.9093, 145.3542, 'https://images.unsplash.com/photo-1555854877-bab0e564b8d5?w=800'),

('Aveo Olinda', 'Aveo', '78 Olinda-Monbulk Road', 'Olinda', 'VIC', '3788', 'Independent Living', 520000, 1100000, 82, 190, 'Picturesque Dandenongs village with gardens and cafes. Mountain views, library, art galleries, and cool climate.', 'Library,Community Garden,Workshop,Art Studio,Games Room,BBQ Area,Visitors Parking', -37.8505, 145.3665, 'https://images.unsplash.com/photo-1576013551627-0cc20b96c2a7?w=800'),

-- Eastern Suburbs Extension
('Arcadia Box Hill', 'Arcadia', '234 Station Street', 'Box Hill', 'VIC', '3128', 'Independent Living', 620000, 1300000, 95, 218, 'Vibrant eastern hub with Asian dining and shopping. Near Box Hill Central, pool, gym, and multicultural community.', 'Outdoor Pool,Gym,Library,Community Garden,Workshop,Games Room,BBQ Area,Visitors Parking', -37.8188, 145.1237, 'https://images.unsplash.com/photo-1582268611958-ebfd161ef9cf?w=800'),

('Ingenia Doncaster', 'Ingenia', '67 Doncaster Road', 'Doncaster', 'VIC', '3108', 'Independent Living', 680000, 1420000, 105, 238, 'Established eastern suburb near Westfield shopping. Pool, tennis court, library, and leafy surrounds.', 'Outdoor Pool,Tennis Court,Library,Community Garden,Workshop,Games Room,BBQ Area,Visitors Parking', -37.7858, 145.1239, 'https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?w=800'),

('Uniting Care Templestowe', 'Uniting Care', '125 Anderson Street', 'Templestowe', 'VIC', '3106', 'Independent Living,Assisted Living', 650000, 1360000, 100, 230, 'Peaceful eastern location near parklands. Chapel, pool, bowling green, and care services available.', 'Outdoor Pool,Bowling Green,Library,Chapel,Community Garden,Workshop,BBQ Area,Visitors Parking', -37.7621, 145.1451, 'https://images.unsplash.com/photo-1576013551627-0cc20b96c2a7?w=800'),

('Baptist Care Doncaster East', 'Baptist Care', '88 Tunstall Road', 'Doncaster East', 'VIC', '3109', 'Independent Living', 620000, 1300000, 95, 218, 'Leafy eastern suburb with parks and reserves. Chapel, pool, library, and community programs.', 'Outdoor Pool,Library,Chapel,Community Garden,Workshop,Games Room,BBQ Area,Visitors Parking', -37.7864, 145.1570, 'https://images.unsplash.com/photo-1555854877-bab0e564b8d5?w=800'),

('Southern Cross Care Blackburn', 'Southern Cross Care', '234 Canterbury Road', 'Blackburn', 'VIC', '3130', 'Independent Living,Assisted Living,Aged Care', 620000, 1280000, 95, 218, 'Established eastern suburb near shopping and station. Health centre, pool, library, and full care continuum.', 'Outdoor Pool,Library,Health Centre,Chapel,Community Garden,Games Room,BBQ Area,Visitors Parking', -37.8161, 145.1467, 'https://images.unsplash.com/photo-1582268611958-ebfd161ef9cf?w=800'),

-- Knox & Outer East
('Arcadia Wantirna', 'Arcadia', '67 Mountain Highway', 'Wantirna', 'VIC', '3152', 'Independent Living', 560000, 1180000, 88, 202, 'Outer eastern suburb near Knox shopping centre. Pool, bowling green, library, and family atmosphere.', 'Outdoor Pool,Bowling Green,Library,Community Garden,Workshop,Games Room,BBQ Area,Visitors Parking', -37.8525, 145.2253, 'https://images.unsplash.com/photo-1582268611958-ebfd161ef9cf?w=800'),

('Ingenia Ringwood', 'Ingenia', '125 Maroondah Highway', 'Ringwood', 'VIC', '3134', 'Independent Living', 580000, 1220000, 90, 205, 'Eastern hub near Eastland shopping centre. Pool, gym, library, and train access to city.', 'Outdoor Pool,Gym,Library,Community Garden,Workshop,Games Room,BBQ Area,Visitors Parking', -37.8148, 145.2290, 'https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?w=800'),

('Uniting Care Croydon', 'Uniting Care', '78 Mount Dandenong Road', 'Croydon', 'VIC', '3136', 'Independent Living,Assisted Living', 560000, 1180000, 88, 202, 'Outer east location near shops and foothills. Chapel, pool, bowling green, and care services.', 'Outdoor Pool,Bowling Green,Library,Chapel,Community Garden,Workshop,BBQ Area,Visitors Parking', -37.7940, 145.2838, 'https://images.unsplash.com/photo-1576013551627-0cc20b96c2a7?w=800'),

('Baptist Care Bayswater', 'Baptist Care', '234 Mountain Highway', 'Bayswater', 'VIC', '3153', 'Independent Living', 520000, 1080000, 82, 188, 'Foothills suburb near Dandenong Ranges. Chapel, pool, library, and mountain access.', 'Outdoor Pool,Library,Chapel,Community Garden,Workshop,Games Room,BBQ Area,Visitors Parking', -37.8446, 145.2684, 'https://images.unsplash.com/photo-1555854877-bab0e564b8d5?w=800'),

-- Yarra Valley Gateway
('Stockland Lilydale', 'Stockland', '67 Main Street', 'Lilydale', 'VIC', '3140', 'Independent Living', 480000, 980000, 75, 175, 'Yarra Valley gateway town near wineries. Pool, bowling green, library, and wine country access.', 'Outdoor Pool,Bowling Green,Library,Community Garden,Workshop,Games Room,BBQ Area,Visitors Parking', -37.7557, 145.3475, 'https://images.unsplash.com/photo-1582268611958-ebfd161ef9cf?w=800'),

('Lendlease Mooroolbark', 'Lendlease', '125 Brice Avenue', 'Mooroolbark', 'VIC', '3138', 'Independent Living', 480000, 980000, 75, 175, 'Outer eastern suburb near Yarra Valley. Pool, library, community garden, and foothills atmosphere.', 'Outdoor Pool,Library,Community Garden,Workshop,Games Room,BBQ Area,Visitors Parking', -37.7842, 145.3180, 'https://images.unsplash.com/photo-1582268611958-ebfd161ef9cf?w=800'),

-- Southern Suburbs Extension
('Aveo Bentleigh', 'Aveo', '78 Centre Road', 'Bentleigh', 'VIC', '3204', 'Independent Living', 680000, 1420000, 105, 238, 'Inner south-east location near station and shops. Pool, library, easy city access, and village atmosphere.', 'Outdoor Pool,Library,Community Garden,Workshop,Games Room,BBQ Area,Visitors Parking', -37.9214, 145.0362, 'https://images.unsplash.com/photo-1582268611958-ebfd161ef9cf?w=800'),

('Anglicare Moorabbin', 'Anglicare', '234 South Road', 'Moorabbin', 'VIC', '3189', 'Independent Living,Assisted Living,Aged Care', 620000, 1300000, 95, 218, 'South-east location near Moorabbin Airport. Chapel, health centre, pool, and full care services.', 'Outdoor Pool,Library,Chapel,Health Centre,Community Garden,Workshop,BBQ Area,Visitors Parking', -37.9359, 145.0476, 'https://images.unsplash.com/photo-1555854877-bab0e564b8d5?w=800'),

('Keyton Carnegie', 'Keyton', '67 Koornang Road', 'Carnegie', 'VIC', '3163', 'Independent Living', 650000, 1360000, 100, 230, 'Inner south-east location near shops and cafes. Pool, library, easy city access, and multicultural dining.', 'Outdoor Pool,Library,Community Garden,Workshop,Games Room,BBQ Area,Visitors Parking', -37.8876, 145.0534, 'https://images.unsplash.com/photo-1576013551627-0cc20b96c2a7?w=800'),

('Arcadia Ormond', 'Arcadia', '125 North Road', 'Ormond', 'VIC', '3204', 'Independent Living', 660000, 1380000, 102, 233, 'South-east location near Caulfield Racecourse. Pool, bowling green, library, and parkland surrounds.', 'Outdoor Pool,Bowling Green,Library,Community Garden,Workshop,Games Room,BBQ Area,Visitors Parking', -37.9045, 145.0392, 'https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?w=800'),

('Ingenia McKinnon', 'Ingenia', '88 McKinnon Road', 'McKinnon', 'VIC', '3204', 'Independent Living', 670000, 1400000, 103, 235, 'South-east suburb near shops and station. Pool, library, easy city access, and community programs.', 'Outdoor Pool,Library,Community Garden,Workshop,Games Room,BBQ Area,Visitors Parking', -37.9134, 145.0406, 'https://images.unsplash.com/photo-1582268611958-ebfd161ef9cf?w=800'),

-- Dandenong & Casey Region
('Uniting Care Dandenong', 'Uniting Care', '234 Lonsdale Street', 'Dandenong', 'VIC', '3175', 'Independent Living,Assisted Living,Aged Care', 480000, 980000, 75, 175, 'South-east regional centre with multicultural community. Chapel, pool, library, health centre, and care services.', 'Outdoor Pool,Library,Chapel,Health Centre,Community Garden,Workshop,BBQ Area,Visitors Parking', -38.0016, 145.2151, 'https://images.unsplash.com/photo-1582268611958-ebfd161ef9cf?w=800'),

('Baptist Care Berwick', 'Baptist Care', '67 High Street', 'Berwick', 'VIC', '3806', 'Independent Living', 520000, 1080000, 82, 188, 'Growing outer south-east community. Chapel, pool, library, and family-friendly atmosphere.', 'Outdoor Pool,Library,Chapel,Community Garden,Workshop,Games Room,BBQ Area,Visitors Parking', -38.0326, 145.3521, 'https://images.unsplash.com/photo-1555854877-bab0e564b8d5?w=800'),

('Southern Cross Care Narre Warren', 'Southern Cross Care', '125 Princes Highway', 'Narre Warren', 'VIC', '3805', 'Independent Living,Assisted Living', 500000, 1040000, 78, 182, 'Casey growth area with modern facilities. Pool, gym, health centre, and care services available.', 'Outdoor Pool,Gym,Library,Health Centre,Community Garden,Games Room,BBQ Area,Visitors Parking', -38.0264, 145.3032, 'https://images.unsplash.com/photo-1576013551627-0cc20b96c2a7?w=800');
