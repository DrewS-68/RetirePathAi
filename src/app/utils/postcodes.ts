// Australian Postcode to Coordinates Database
// Covers major population centers across all states and territories

export interface PostcodeCoordinates {
  lat: number;
  lng: number;
  suburb?: string;
  state?: string;
}

export const postcodeCoordinates: { [key: string]: PostcodeCoordinates } = {
  // NEW SOUTH WALES (2000-2999)
  // Sydney CBD & Inner
  '2000': { lat: -33.8688, lng: 151.2093, suburb: 'Sydney', state: 'NSW' },
  '2001': { lat: -33.8688, lng: 151.2093, suburb: 'Sydney', state: 'NSW' },
  '2007': { lat: -33.8792, lng: 151.1987, suburb: 'Ultimo', state: 'NSW' },
  '2008': { lat: -33.8847, lng: 151.1947, suburb: 'Chippendale', state: 'NSW' },
  '2009': { lat: -33.8809, lng: 151.1957, suburb: 'Pyrmont', state: 'NSW' },
  '2010': { lat: -33.8895, lng: 151.1903, suburb: 'Darlington', state: 'NSW' },
  '2011': { lat: -33.8795, lng: 151.2175, suburb: 'Woolloomooloo', state: 'NSW' },
  '2015': { lat: -33.8795, lng: 151.1875, suburb: 'Beaconsfield', state: 'NSW' },
  '2016': { lat: -33.8895, lng: 151.1775, suburb: 'Redfern', state: 'NSW' },
  '2017': { lat: -33.8995, lng: 151.1875, suburb: 'Waterloo', state: 'NSW' },
  '2018': { lat: -33.9095, lng: 151.1975, suburb: 'Rosebery', state: 'NSW' },
  '2019': { lat: -33.9195, lng: 151.2075, suburb: 'Banksmeadow', state: 'NSW' },
  '2020': { lat: -33.8595, lng: 151.2175, suburb: 'Mascot', state: 'NSW' },
  '2021': { lat: -33.8795, lng: 151.2375, suburb: 'Centennial Park', state: 'NSW' },
  '2022': { lat: -33.9095, lng: 151.2475, suburb: 'Bondi Junction', state: 'NSW' },
  '2023': { lat: -33.8945, lng: 151.2625, suburb: 'Bellevue Hill', state: 'NSW' },
  '2024': { lat: -33.8845, lng: 151.2475, suburb: 'Rushcutters Bay', state: 'NSW' },
  '2025': { lat: -33.8845, lng: 151.2275, suburb: 'Paddington', state: 'NSW' },
  '2026': { lat: -33.9045, lng: 151.2625, suburb: 'Bondi', state: 'NSW' },
  '2027': { lat: -33.8845, lng: 151.2775, suburb: 'Darling Point', state: 'NSW' },
  '2028': { lat: -33.8945, lng: 151.2875, suburb: 'Double Bay', state: 'NSW' },
  '2029': { lat: -33.8845, lng: 151.2975, suburb: 'Rose Bay', state: 'NSW' },
  '2030': { lat: -33.8945, lng: 151.3075, suburb: 'Dover Heights', state: 'NSW' },
  '2031': { lat: -33.9045, lng: 151.2975, suburb: 'Clovelly', state: 'NSW' },
  '2032': { lat: -33.9145, lng: 151.2575, suburb: 'Daceyville', state: 'NSW' },
  '2033': { lat: -33.9245, lng: 151.2675, suburb: 'Kingsford', state: 'NSW' },
  '2034': { lat: -33.9345, lng: 151.2875, suburb: 'Coogee', state: 'NSW' },
  '2035': { lat: -33.9245, lng: 151.2375, suburb: 'Maroubra', state: 'NSW' },
  '2036': { lat: -33.9145, lng: 151.2175, suburb: 'Hillsdale', state: 'NSW' },
  
  // Inner West
  '2038': { lat: -33.8695, lng: 151.1875, suburb: 'Annandale', state: 'NSW' },
  '2039': { lat: -33.8595, lng: 151.1775, suburb: 'Rozelle', state: 'NSW' },
  '2040': { lat: -33.8595, lng: 151.1675, suburb: 'Leichhardt', state: 'NSW' },
  '2041': { lat: -33.8495, lng: 151.1775, suburb: 'Balmain', state: 'NSW' },
  '2042': { lat: -33.8795, lng: 151.1775, suburb: 'Enmore', state: 'NSW' },
  '2043': { lat: -33.8895, lng: 151.1675, suburb: 'Erskineville', state: 'NSW' },
  '2044': { lat: -33.9195, lng: 151.1475, suburb: 'Tempe', state: 'NSW' },
  '2045': { lat: -33.8995, lng: 151.1575, suburb: 'Haberfield', state: 'NSW' },
  '2046': { lat: -33.8595, lng: 151.1475, suburb: 'Abbotsford', state: 'NSW' },
  '2047': { lat: -33.8695, lng: 151.1375, suburb: 'Drummoyne', state: 'NSW' },
  '2048': { lat: -33.8795, lng: 151.1275, suburb: 'Stanmore', state: 'NSW' },
  '2049': { lat: -33.8895, lng: 151.1475, suburb: 'Petersham', state: 'NSW' },
  '2050': { lat: -33.8895, lng: 151.1775, suburb: 'Camperdown', state: 'NSW' },
  
  // Eastern Suburbs
  '2060': { lat: -33.8395, lng: 151.2075, suburb: 'North Sydney', state: 'NSW' },
  '2061': { lat: -33.8295, lng: 151.2175, suburb: 'Kirribilli', state: 'NSW' },
  '2062': { lat: -33.8195, lng: 151.2275, suburb: 'Cammeray', state: 'NSW' },
  '2063': { lat: -33.8095, lng: 151.2375, suburb: 'Northbridge', state: 'NSW' },
  '2064': { lat: -33.8195, lng: 151.2475, suburb: 'Artarmon', state: 'NSW' },
  '2065': { lat: -33.8295, lng: 151.2575, suburb: 'Crows Nest', state: 'NSW' },
  '2066': { lat: -33.8295, lng: 151.2775, suburb: 'Lane Cove', state: 'NSW' },
  '2067': { lat: -33.8095, lng: 151.2775, suburb: 'Chatswood', state: 'NSW' },
  '2068': { lat: -33.7995, lng: 151.2875, suburb: 'Willoughby', state: 'NSW' },
  '2069': { lat: -33.7695, lng: 151.1975, suburb: 'Castle Cove', state: 'NSW' },
  '2070': { lat: -33.7395, lng: 151.1875, suburb: 'Lindfield', state: 'NSW' },
  
  // Northern Beaches
  '2095': { lat: -33.7795, lng: 151.2875, suburb: 'Manly', state: 'NSW' },
  '2096': { lat: -33.7595, lng: 151.2975, suburb: 'Freshwater', state: 'NSW' },
  '2097': { lat: -33.7495, lng: 151.2975, suburb: 'Collaroy', state: 'NSW' },
  '2099': { lat: -33.7295, lng: 151.2875, suburb: 'Dee Why', state: 'NSW' },
  '2100': { lat: -33.7195, lng: 151.2975, suburb: 'Brookvale', state: 'NSW' },
  
  // Western Suburbs
  '2110': { lat: -33.8095, lng: 151.0775, suburb: 'Hunters Hill', state: 'NSW' },
  '2111': { lat: -33.8195, lng: 151.0675, suburb: 'Gladesville', state: 'NSW' },
  '2112': { lat: -33.8295, lng: 151.0975, suburb: 'Ryde', state: 'NSW' },
  '2113': { lat: -33.8195, lng: 151.1175, suburb: 'Macquarie Park', state: 'NSW' },
  '2114': { lat: -33.7795, lng: 151.0975, suburb: 'West Ryde', state: 'NSW' },
  '2115': { lat: -33.7695, lng: 151.1275, suburb: 'Ermington', state: 'NSW' },
  '2116': { lat: -33.8095, lng: 151.0475, suburb: 'Rydalmere', state: 'NSW' },
  '2117': { lat: -33.7995, lng: 151.0675, suburb: 'Dundas', state: 'NSW' },
  '2118': { lat: -33.7895, lng: 151.0875, suburb: 'Carlingford', state: 'NSW' },
  '2119': { lat: -33.7595, lng: 151.0775, suburb: 'Beecroft', state: 'NSW' },
  '2120': { lat: -33.7495, lng: 151.0875, suburb: 'Thornleigh', state: 'NSW' },
  
  // Hills District
  '2125': { lat: -33.7295, lng: 151.0475, suburb: 'West Pennant Hills', state: 'NSW' },
  '2126': { lat: -33.7095, lng: 151.0675, suburb: 'Cherrybrook', state: 'NSW' },
  '2127': { lat: -33.6695, lng: 151.0075, suburb: 'Newington', state: 'NSW' },
  '2145': { lat: -33.8095, lng: 150.9975, suburb: 'Westmead', state: 'NSW' },
  '2146': { lat: -33.8195, lng: 150.9675, suburb: 'Toongabbie', state: 'NSW' },
  '2147': { lat: -33.7495, lng: 150.9375, suburb: 'Seven Hills', state: 'NSW' },
  '2148': { lat: -33.7295, lng: 150.9075, suburb: 'Blacktown', state: 'NSW' },
  '2150': { lat: -33.8095, lng: 150.9875, suburb: 'Parramatta', state: 'NSW' },
  '2151': { lat: -33.8295, lng: 150.9875, suburb: 'North Parramatta', state: 'NSW' },
  '2152': { lat: -33.7995, lng: 150.8675, suburb: 'Northmead', state: 'NSW' },
  '2153': { lat: -33.7695, lng: 150.8575, suburb: 'Baulkham Hills', state: 'NSW' },
  '2154': { lat: -33.7395, lng: 150.8475, suburb: 'Castle Hill', state: 'NSW' },
  '2155': { lat: -33.7195, lng: 150.9175, suburb: 'Kellyville', state: 'NSW' },
  '2156': { lat: -33.6795, lng: 150.8975, suburb: 'Annangrove', state: 'NSW' },
  '2157': { lat: -33.6595, lng: 150.9375, suburb: 'Glenorie', state: 'NSW' },
  
  // South West
  '2161': { lat: -33.8795, lng: 151.0075, suburb: 'Guildford', state: 'NSW' },
  '2162': { lat: -33.8695, lng: 150.9975, suburb: 'Chester Hill', state: 'NSW' },
  '2163': { lat: -33.8595, lng: 150.9475, suburb: 'Villawood', state: 'NSW' },
  '2164': { lat: -33.9095, lng: 150.9875, suburb: 'Sefton', state: 'NSW' },
  '2165': { lat: -33.9195, lng: 150.9975, suburb: 'Fairfield', state: 'NSW' },
  '2166': { lat: -33.8895, lng: 150.8975, suburb: 'Cabramatta', state: 'NSW' },
  '2167': { lat: -33.9395, lng: 150.9375, suburb: 'Glenfield', state: 'NSW' },
  '2168': { lat: -33.9695, lng: 150.8575, suburb: 'Ingleburn', state: 'NSW' },
  '2170': { lat: -33.9995, lng: 150.8075, suburb: 'Liverpool', state: 'NSW' },
  
  // Sutherland Shire
  '2217': { lat: -33.9695, lng: 151.1175, suburb: 'Kogarah', state: 'NSW' },
  '2218': { lat: -33.9795, lng: 151.1075, suburb: 'Allawah', state: 'NSW' },
  '2219': { lat: -33.9895, lng: 151.1175, suburb: 'Dolls Point', state: 'NSW' },
  '2220': { lat: -33.9595, lng: 151.0775, suburb: 'Hurstville', state: 'NSW' },
  '2221': { lat: -33.9695, lng: 151.0875, suburb: 'Peakhurst', state: 'NSW' },
  '2222': { lat: -33.9995, lng: 151.0575, suburb: 'Penshurst', state: 'NSW' },
  '2223': { lat: -34.0195, lng: 151.1075, suburb: 'Oatley', state: 'NSW' },
  '2224': { lat: -34.0295, lng: 151.0675, suburb: 'Mortdale', state: 'NSW' },
  '2225': { lat: -34.0495, lng: 151.0975, suburb: 'Sylvania', state: 'NSW' },
  '2226': { lat: -34.0295, lng: 151.1175, suburb: 'Miranda', state: 'NSW' },
  '2227': { lat: -34.0495, lng: 151.1275, suburb: 'Gymea', state: 'NSW' },
  '2228': { lat: -34.0695, lng: 151.1175, suburb: 'Sutherland', state: 'NSW' },
  '2229': { lat: -34.0595, lng: 151.0975, suburb: 'Caringbah', state: 'NSW' },
  '2230': { lat: -34.0795, lng: 151.1275, suburb: 'Cronulla', state: 'NSW' },
  
  // Newcastle & Hunter
  '2280': { lat: -32.9267, lng: 151.7789, suburb: 'Belmont', state: 'NSW' },
  '2281': { lat: -33.0167, lng: 151.6589, suburb: 'Blacksmiths', state: 'NSW' },
  '2282': { lat: -33.0867, lng: 151.6089, suburb: 'Marks Point', state: 'NSW' },
  '2283': { lat: -33.1467, lng: 151.5589, suburb: 'Toronto', state: 'NSW' },
  '2284': { lat: -33.0667, lng: 151.4989, suburb: 'Boolaroo', state: 'NSW' },
  '2285': { lat: -32.9867, lng: 151.6189, suburb: 'Cardiff', state: 'NSW' },
  '2286': { lat: -32.9467, lng: 151.6589, suburb: 'Glendale', state: 'NSW' },
  '2287': { lat: -32.9067, lng: 151.6889, suburb: 'Birmingham Gardens', state: 'NSW' },
  '2289': { lat: -32.8667, lng: 151.7089, suburb: 'Adamstown', state: 'NSW' },
  '2290': { lat: -32.9267, lng: 151.7189, suburb: 'Charlestown', state: 'NSW' },
  '2291': { lat: -32.9167, lng: 151.7689, suburb: 'Merewether', state: 'NSW' },
  '2292': { lat: -32.9467, lng: 151.7589, suburb: 'Broadmeadow', state: 'NSW' },
  '2293': { lat: -32.9767, lng: 151.7389, suburb: 'Maryville', state: 'NSW' },
  '2294': { lat: -32.9067, lng: 151.7889, suburb: 'Carrington', state: 'NSW' },
  '2295': { lat: -32.8867, lng: 151.7689, suburb: 'Waratah', state: 'NSW' },
  '2296': { lat: -32.8467, lng: 151.7489, suburb: 'Islington', state: 'NSW' },
  '2297': { lat: -32.8267, lng: 151.7589, suburb: 'Tighes Hill', state: 'NSW' },
  '2298': { lat: -32.8667, lng: 151.7789, suburb: 'Broadmeadow', state: 'NSW' },
  '2299': { lat: -32.8867, lng: 151.7989, suburb: 'Wickham', state: 'NSW' },
  '2300': { lat: -32.9267, lng: 151.7789, suburb: 'Newcastle', state: 'NSW' },
  
  // Central Coast
  '2250': { lat: -33.4267, lng: 151.3389, suburb: 'Gosford', state: 'NSW' },
  '2251': { lat: -33.3867, lng: 151.4189, suburb: 'Kariong', state: 'NSW' },
  '2256': { lat: -33.3467, lng: 151.1989, suburb: 'Glenworth Valley', state: 'NSW' },
  '2257': { lat: -33.2667, lng: 151.2789, suburb: 'Bucketty', state: 'NSW' },
  '2259': { lat: -33.2867, lng: 151.4989, suburb: 'Wyong', state: 'NSW' },
  '2260': { lat: -33.2467, lng: 151.5189, suburb: 'Buff Point', state: 'NSW' },
  '2261': { lat: -33.2167, lng: 151.5489, suburb: 'Bateau Bay', state: 'NSW' },
  '2262': { lat: -33.1767, lng: 151.5689, suburb: 'Toowoon Bay', state: 'NSW' },
  '2263': { lat: -33.1467, lng: 151.5989, suburb: 'Shelly Beach', state: 'NSW' },
  
  // Wollongong & Illawarra
  '2500': { lat: -34.4278, lng: 150.8931, suburb: 'Wollongong', state: 'NSW' },
  '2502': { lat: -34.4578, lng: 150.8731, suburb: 'Warrawong', state: 'NSW' },
  '2505': { lat: -34.4978, lng: 150.8331, suburb: 'Port Kembla', state: 'NSW' },
  '2515': { lat: -34.5378, lng: 150.7931, suburb: 'Shellharbour', state: 'NSW' },
  '2517': { lat: -34.5778, lng: 150.7531, suburb: 'Albion Park', state: 'NSW' },
  '2518': { lat: -34.5178, lng: 150.7731, suburb: 'Dapto', state: 'NSW' },
  '2519': { lat: -34.5578, lng: 150.7331, suburb: 'Albion Park Rail', state: 'NSW' },
  '2526': { lat: -34.7378, lng: 150.6531, suburb: 'Bomaderry', state: 'NSW' },
  '2527': { lat: -34.8378, lng: 150.6131, suburb: 'Nowra', state: 'NSW' },
  '2528': { lat: -34.8778, lng: 150.5731, suburb: 'North Nowra', state: 'NSW' },
  '2529': { lat: -34.9178, lng: 150.5331, suburb: 'Worrigee', state: 'NSW' },
  '2530': { lat: -34.5978, lng: 150.7131, suburb: 'Kiama', state: 'NSW' },
  
  // South Coast
  '2540': { lat: -35.0778, lng: 150.6131, suburb: 'Vincentia', state: 'NSW' },
  '2541': { lat: -35.1178, lng: 150.5731, suburb: 'Huskisson', state: 'NSW' },
  '2548': { lat: -35.7778, lng: 150.1731, suburb: 'Batemans Bay', state: 'NSW' },
  '2549': { lat: -35.8778, lng: 150.0931, suburb: 'Mogo', state: 'NSW' },
  '2550': { lat: -36.2178, lng: 149.9131, suburb: 'Bega', state: 'NSW' },
  '2551': { lat: -36.4178, lng: 149.8731, suburb: 'Wolumla', state: 'NSW' },
  '2548': { lat: -36.4578, lng: 149.8331, suburb: 'Merimbula', state: 'NSW' },
  '2627': { lat: -36.4978, lng: 149.7931, suburb: 'Eden', state: 'NSW' },
  
  // VICTORIA (3000-3999) - Already extensive coverage added previously
  '3000': { lat: -37.8136, lng: 144.9631, suburb: 'Melbourne', state: 'VIC' },
  '3002': { lat: -37.8080, lng: 144.9633, suburb: 'East Melbourne', state: 'VIC' },
  '3003': { lat: -37.8067, lng: 144.9484, suburb: 'West Melbourne', state: 'VIC' },
  '3004': { lat: -37.8304, lng: 144.9631, suburb: 'Melbourne', state: 'VIC' },
  '3006': { lat: -37.8235, lng: 144.9554, suburb: 'Southbank', state: 'VIC' },
  '3008': { lat: -37.8178, lng: 144.9481, suburb: 'Docklands', state: 'VIC' },
  '3011': { lat: -37.8236, lng: 144.8844, suburb: 'Footscray', state: 'VIC' },
  '3012': { lat: -37.8036, lng: 144.8644, suburb: 'Brooklyn', state: 'VIC' },
  '3020': { lat: -37.8936, lng: 144.8344, suburb: 'Sunshine', state: 'VIC' },
  '3021': { lat: -37.7736, lng: 144.8644, suburb: 'St Albans', state: 'VIC' },
  '3023': { lat: -37.7436, lng: 144.8344, suburb: 'Caroline Springs', state: 'VIC' },
  '3029': { lat: -37.9236, lng: 144.7744, suburb: 'Hoppers Crossing', state: 'VIC' },
  '3030': { lat: -37.9436, lng: 144.7944, suburb: 'Werribee', state: 'VIC' },
  '3040': { lat: -37.7336, lng: 144.9044, suburb: 'Essendon', state: 'VIC' },
  '3056': { lat: -37.7658, lng: 144.9969, suburb: 'Brunswick', state: 'VIC' },
  '3058': { lat: -37.7320, lng: 144.9697, suburb: 'Coburg', state: 'VIC' },
  '3121': { lat: -37.8255, lng: 145.0025, suburb: 'Richmond', state: 'VIC' },
  '3122': { lat: -37.8163, lng: 145.0363, suburb: 'Hawthorn', state: 'VIC' },
  '3124': { lat: -37.8282, lng: 145.0760, suburb: 'Camberwell', state: 'VIC' },
  '3128': { lat: -37.8161, lng: 145.1448, suburb: 'Box Hill', state: 'VIC' },
  '3130': { lat: -37.8161, lng: 145.1899, suburb: 'Blackburn', state: 'VIC' },
  '3134': { lat: -37.8161, lng: 145.2855, suburb: 'Ringwood', state: 'VIC' },
  '3141': { lat: -37.8467, lng: 144.9938, suburb: 'South Yarra', state: 'VIC' },
  '3144': { lat: -37.8619, lng: 145.0210, suburb: 'Malvern', state: 'VIC' },
  '3150': { lat: -37.8744, lng: 145.1389, suburb: 'Glen Waverley', state: 'VIC' },
  '3175': { lat: -37.9557, lng: 145.2136, suburb: 'Dandenong', state: 'VIC' },
  '3182': { lat: -37.8685, lng: 144.9888, suburb: 'St Kilda', state: 'VIC' },
  '3186': { lat: -37.9104, lng: 145.0021, suburb: 'Brighton', state: 'VIC' },
  '3199': { lat: -38.1421, lng: 145.1263, suburb: 'Frankston', state: 'VIC' },
  '3806': { lat: -38.0164, lng: 145.2922, suburb: 'Berwick', state: 'VIC' },
  '3810': { lat: -38.1314, lng: 145.3722, suburb: 'Pakenham', state: 'VIC' },
  '3977': { lat: -38.0993, lng: 145.2817, suburb: 'Cranbourne', state: 'VIC' },
  
  // Geelong
  '3214': { lat: -38.1499, lng: 144.3617, suburb: 'Corio', state: 'VIC' },
  '3215': { lat: -38.1099, lng: 144.3917, suburb: 'Bell Post Hill', state: 'VIC' },
  '3216': { lat: -38.1799, lng: 144.3217, suburb: 'Belmont', state: 'VIC' },
  '3217': { lat: -38.1999, lng: 144.3417, suburb: 'Grovedale', state: 'VIC' },
  '3218': { lat: -38.2199, lng: 144.3617, suburb: 'Waurn Ponds', state: 'VIC' },
  '3219': { lat: -38.2399, lng: 144.3817, suburb: 'Hamlyn Heights', state: 'VIC' },
  '3220': { lat: -38.1499, lng: 144.3417, suburb: 'Geelong', state: 'VIC' },
  
  // Ballarat
  '3350': { lat: -37.5622, lng: 143.8503, suburb: 'Ballarat', state: 'VIC' },
  '3351': { lat: -37.5822, lng: 143.8703, suburb: 'Ballarat East', state: 'VIC' },
  '3352': { lat: -37.6022, lng: 143.8903, suburb: 'Nerrina', state: 'VIC' },
  
  // Bendigo
  '3550': { lat: -36.7570, lng: 144.2794, suburb: 'Bendigo', state: 'VIC' },
  '3551': { lat: -36.7370, lng: 144.2594, suburb: 'Big Hill', state: 'VIC' },
  '3552': { lat: -36.7770, lng: 144.2994, suburb: 'California Gully', state: 'VIC' },
  
  // QUEENSLAND (4000-4999)
  // Brisbane CBD & Inner
  '4000': { lat: -27.4698, lng: 153.0251, suburb: 'Brisbane', state: 'QLD' },
  '4001': { lat: -27.4698, lng: 153.0251, suburb: 'Brisbane', state: 'QLD' },
  '4005': { lat: -27.4398, lng: 153.0351, suburb: 'New Farm', state: 'QLD' },
  '4006': { lat: -27.4198, lng: 153.0551, suburb: 'Fortitude Valley', state: 'QLD' },
  '4007': { lat: -27.4498, lng: 153.0051, suburb: 'Ascot', state: 'QLD' },
  '4008': { lat: -27.4098, lng: 153.0651, suburb: 'Newstead', state: 'QLD' },
  '4009': { lat: -27.3898, lng: 153.0751, suburb: 'Pinkenba', state: 'QLD' },
  '4010': { lat: -27.3698, lng: 153.0851, suburb: 'Hendra', state: 'QLD' },
  '4011': { lat: -27.3998, lng: 153.0451, suburb: 'Stafford', state: 'QLD' },
  '4012': { lat: -27.4298, lng: 153.0151, suburb: 'Alderley', state: 'QLD' },
  '4013': { lat: -27.3798, lng: 153.0951, suburb: 'Bridgeman Downs', state: 'QLD' },
  '4014': { lat: -27.3598, lng: 153.1051, suburb: 'Banyo', state: 'QLD' },
  '4017': { lat: -27.3298, lng: 153.1151, suburb: 'Brighton', state: 'QLD' },
  '4018': { lat: -27.3098, lng: 153.1251, suburb: 'Deagon', state: 'QLD' },
  '4019': { lat: -27.2898, lng: 153.1351, suburb: 'Clontarf', state: 'QLD' },
  '4020': { lat: -27.2698, lng: 153.1051, suburb: 'Redcliffe', state: 'QLD' },
  
  // South Brisbane
  '4101': { lat: -27.4898, lng: 153.0151, suburb: 'South Brisbane', state: 'QLD' },
  '4102': { lat: -27.4998, lng: 153.0251, suburb: 'Woolloongabba', state: 'QLD' },
  '4103': { lat: -27.5098, lng: 153.0351, suburb: 'Annerley', state: 'QLD' },
  '4104': { lat: -27.5198, lng: 153.0451, suburb: 'Yeronga', state: 'QLD' },
  '4105': { lat: -27.5298, lng: 153.0551, suburb: 'Yeerongpilly', state: 'QLD' },
  '4106': { lat: -27.5398, lng: 153.0651, suburb: 'Moorooka', state: 'QLD' },
  '4107': { lat: -27.5498, lng: 153.0751, suburb: 'Rocklea', state: 'QLD' },
  '4108': { lat: -27.5598, lng: 153.0851, suburb: 'Acacia Ridge', state: 'QLD' },
  '4109': { lat: -27.5698, lng: 153.0951, suburb: 'Sunnybank', state: 'QLD' },
  '4110': { lat: -27.5798, lng: 153.1051, suburb: 'Runcorn', state: 'QLD' },
  '4111': { lat: -27.5898, lng: 153.1151, suburb: 'Kuraby', state: 'QLD' },
  '4112': { lat: -27.5998, lng: 153.1251, suburb: 'Springwood', state: 'QLD' },
  '4113': { lat: -27.6098, lng: 153.1351, suburb: 'Underwood', state: 'QLD' },
  '4114': { lat: -27.6198, lng: 153.1451, suburb: 'Logan Central', state: 'QLD' },
  '4115': { lat: -27.6298, lng: 153.1551, suburb: 'Waterford', state: 'QLD' },
  '4116': { lat: -27.6398, lng: 153.1651, suburb: 'Woodridge', state: 'QLD' },
  '4117': { lat: -27.6498, lng: 153.1751, suburb: 'Kingston', state: 'QLD' },
  '4118': { lat: -27.6598, lng: 153.1851, suburb: 'Browns Plains', state: 'QLD' },
  
  // Western Suburbs
  '4120': { lat: -27.5598, lng: 152.9651, suburb: 'Forest Lake', state: 'QLD' },
  '4121': { lat: -27.5798, lng: 152.9451, suburb: 'Doolandella', state: 'QLD' },
  '4122': { lat: -27.5398, lng: 152.9851, suburb: 'Chelmer', state: 'QLD' },
  '4123': { lat: -27.5198, lng: 152.9651, suburb: 'Karana Downs', state: 'QLD' },
  
  // Ipswich
  '4300': { lat: -27.6129, lng: 152.7631, suburb: 'Ipswich', state: 'QLD' },
  '4301': { lat: -27.5929, lng: 152.7431, suburb: 'Brassall', state: 'QLD' },
  '4303': { lat: -27.6329, lng: 152.7831, suburb: 'Booval', state: 'QLD' },
  '4304': { lat: -27.6529, lng: 152.8031, suburb: 'Bundamba', state: 'QLD' },
  '4305': { lat: -27.6729, lng: 152.8231, suburb: 'Ebbw Vale', state: 'QLD' },
  
  // Gold Coast
  '4215': { lat: -27.9398, lng: 153.4051, suburb: 'Southport', state: 'QLD' },
  '4216': { lat: -27.9598, lng: 153.4151, suburb: 'Main Beach', state: 'QLD' },
  '4217': { lat: -27.9798, lng: 153.4251, suburb: 'Surfers Paradise', state: 'QLD' },
  '4218': { lat: -27.9998, lng: 153.4351, suburb: 'Broadbeach', state: 'QLD' },
  '4220': { lat: -28.0198, lng: 153.4451, suburb: 'Mermaid Beach', state: 'QLD' },
  '4221': { lat: -28.0398, lng: 153.4551, suburb: 'Miami', state: 'QLD' },
  '4222': { lat: -28.0598, lng: 153.4651, suburb: 'Burleigh Heads', state: 'QLD' },
  '4223': { lat: -28.0798, lng: 153.4751, suburb: 'Palm Beach', state: 'QLD' },
  '4224': { lat: -28.0998, lng: 153.4851, suburb: 'Currumbin', state: 'QLD' },
  '4225': { lat: -28.1198, lng: 153.4951, suburb: 'Tugun', state: 'QLD' },
  '4226': { lat: -28.1398, lng: 153.5051, suburb: 'Coolangatta', state: 'QLD' },
  
  // Sunshine Coast
  '4551': { lat: -26.6598, lng: 153.0651, suburb: 'Caloundra', state: 'QLD' },
  '4558': { lat: -26.6798, lng: 153.0851, suburb: 'Maroochydore', state: 'QLD' },
  '4560': { lat: -26.3998, lng: 152.9251, suburb: 'Noosa', state: 'QLD' },
  '4561': { lat: -26.4198, lng: 152.9351, suburb: 'Noosaville', state: 'QLD' },
  '4562': { lat: -26.4398, lng: 152.9451, suburb: 'Tewantin', state: 'QLD' },
  
  // Cairns
  '4870': { lat: -16.9206, lng: 145.7708, suburb: 'Cairns', state: 'QLD' },
  '4878': { lat: -16.9406, lng: 145.7908, suburb: 'Smithfield', state: 'QLD' },
  
  // Townsville
  '4810': { lat: -19.2590, lng: 146.8169, suburb: 'Townsville', state: 'QLD' },
  '4811': { lat: -19.2790, lng: 146.8369, suburb: 'South Townsville', state: 'QLD' },
  '4812': { lat: -19.2990, lng: 146.8569, suburb: 'Hermit Park', state: 'QLD' },
  '4814': { lat: -19.3190, lng: 146.8769, suburb: 'Aitkenvale', state: 'QLD' },
  
  // Toowoomba
  '4350': { lat: -27.5598, lng: 151.9531, suburb: 'Toowoomba', state: 'QLD' },
  '4352': { lat: -27.5798, lng: 151.9731, suburb: 'Newtown', state: 'QLD' },
  
  // SOUTH AUSTRALIA (5000-5999)
  // Adelaide CBD & Inner
  '5000': { lat: -34.9285, lng: 138.6007, suburb: 'Adelaide', state: 'SA' },
  '5006': { lat: -34.9085, lng: 138.5807, suburb: 'North Adelaide', state: 'SA' },
  '5008': { lat: -34.8485, lng: 138.5107, suburb: 'Prospect', state: 'SA' },
  '5009': { lat: -34.8685, lng: 138.5307, suburb: 'Kilburn', state: 'SA' },
  '5010': { lat: -34.8885, lng: 138.5507, suburb: 'Kilkenny', state: 'SA' },
  '5011': { lat: -34.9085, lng: 138.5707, suburb: 'Woodville', state: 'SA' },
  '5012': { lat: -34.9285, lng: 138.5907, suburb: 'Beverley', state: 'SA' },
  '5013': { lat: -34.9485, lng: 138.6107, suburb: 'Kurralta Park', state: 'SA' },
  '5014': { lat: -34.9685, lng: 138.6307, suburb: 'Plympton', state: 'SA' },
  '5015': { lat: -34.9885, lng: 138.6507, suburb: 'Glandore', state: 'SA' },
  '5016': { lat: -35.0085, lng: 138.6707, suburb: 'Melrose Park', state: 'SA' },
  '5017': { lat: -35.0285, lng: 138.6907, suburb: 'Edwardstown', state: 'SA' },
  '5018': { lat: -34.9485, lng: 138.5307, suburb: 'West Lakes', state: 'SA' },
  '5019': { lat: -34.9285, lng: 138.5107, suburb: 'Hendon', state: 'SA' },
  '5020': { lat: -34.9085, lng: 138.4907, suburb: 'Grange', state: 'SA' },
  '5021': { lat: -34.8885, lng: 138.4707, suburb: 'Semaphore', state: 'SA' },
  '5022': { lat: -34.8685, lng: 138.4507, suburb: 'Largs Bay', state: 'SA' },
  '5023': { lat: -34.8485, lng: 138.4307, suburb: 'Peterhead', state: 'SA' },
  '5024': { lat: -34.8285, lng: 138.4107, suburb: 'Taperoo', state: 'SA' },
  
  // Eastern Suburbs
  '5061': { lat: -34.9385, lng: 138.6407, suburb: 'Unley', state: 'SA' },
  '5062': { lat: -34.9585, lng: 138.6607, suburb: 'Brown Hill Creek', state: 'SA' },
  '5063': { lat: -34.9785, lng: 138.6807, suburb: 'Mitcham', state: 'SA' },
  '5064': { lat: -34.9985, lng: 138.7007, suburb: 'Belair', state: 'SA' },
  '5065': { lat: -35.0185, lng: 138.7207, suburb: 'Glenalta', state: 'SA' },
  '5066': { lat: -34.9185, lng: 138.6207, suburb: 'Norwood', state: 'SA' },
  '5067': { lat: -34.8985, lng: 138.6407, suburb: 'Kent Town', state: 'SA' },
  '5068': { lat: -34.8785, lng: 138.6607, suburb: 'Firle', state: 'SA' },
  '5069': { lat: -34.8585, lng: 138.6807, suburb: 'Magill', state: 'SA' },
  '5070': { lat: -34.8385, lng: 138.7007, suburb: 'Rostrevor', state: 'SA' },
  '5072': { lat: -34.8185, lng: 138.7207, suburb: 'Athelstone', state: 'SA' },
  '5073': { lat: -34.7985, lng: 138.7407, suburb: 'Montacute', state: 'SA' },
  '5074': { lat: -34.8185, lng: 138.6607, suburb: 'Paradise', state: 'SA' },
  '5075': { lat: -34.7985, lng: 138.6407, suburb: 'Dernancourt', state: 'SA' },
  '5081': { lat: -34.8785, lng: 138.6207, suburb: 'Walkerville', state: 'SA' },
  '5082': { lat: -34.8585, lng: 138.6007, suburb: 'Vale Park', state: 'SA' },
  '5083': { lat: -34.8385, lng: 138.5807, suburb: 'Manningham', state: 'SA' },
  '5084': { lat: -34.8185, lng: 138.5607, suburb: 'Gepps Cross', state: 'SA' },
  '5085': { lat: -34.7985, lng: 138.5407, suburb: 'Hampstead Gardens', state: 'SA' },
  '5086': { lat: -34.7785, lng: 138.5207, suburb: 'Clearview', state: 'SA' },
  '5087': { lat: -34.7585, lng: 138.5007, suburb: 'Dernancourt', state: 'SA' },
  
  // WESTERN AUSTRALIA (6000-6999)
  // Perth CBD & Inner
  '6000': { lat: -31.9505, lng: 115.8605, suburb: 'Perth', state: 'WA' },
  '6003': { lat: -31.9405, lng: 115.8505, suburb: 'Northbridge', state: 'WA' },
  '6004': { lat: -31.9305, lng: 115.8705, suburb: 'East Perth', state: 'WA' },
  '6005': { lat: -31.9605, lng: 115.8405, suburb: 'West Perth', state: 'WA' },
  '6006': { lat: -31.9705, lng: 115.8305, suburb: 'North Perth', state: 'WA' },
  '6007': { lat: -31.9805, lng: 115.8205, suburb: 'Leederville', state: 'WA' },
  '6008': { lat: -31.9905, lng: 115.8105, suburb: 'Subiaco', state: 'WA' },
  '6009': { lat: -32.0005, lng: 115.8005, suburb: 'Crawley', state: 'WA' },
  '6010': { lat: -32.0105, lng: 115.7905, suburb: 'Claremont', state: 'WA' },
  '6011': { lat: -32.0205, lng: 115.7805, suburb: 'Cottesloe', state: 'WA' },
  '6012': { lat: -32.0305, lng: 115.7705, suburb: 'Mosman Park', state: 'WA' },
  '6014': { lat: -31.9205, lng: 115.8105, suburb: 'Joondanna', state: 'WA' },
  '6015': { lat: -31.9105, lng: 115.8205, suburb: 'Osborne Park', state: 'WA' },
  '6016': { lat: -31.9005, lng: 115.8305, suburb: 'Glendalough', state: 'WA' },
  '6017': { lat: -31.8905, lng: 115.8405, suburb: 'Innaloo', state: 'WA' },
  '6018': { lat: -31.8805, lng: 115.8505, suburb: 'Karrinyup', state: 'WA' },
  '6019': { lat: -31.8705, lng: 115.8605, suburb: 'Balcatta', state: 'WA' },
  '6020': { lat: -31.8605, lng: 115.8705, suburb: 'Gwelup', state: 'WA' },
  
  // Northern Suburbs
  '6021': { lat: -31.8505, lng: 115.8805, suburb: 'Stirling', state: 'WA' },
  '6022': { lat: -31.8405, lng: 115.8905, suburb: 'Dianella', state: 'WA' },
  '6023': { lat: -31.8305, lng: 115.9005, suburb: 'Westminster', state: 'WA' },
  '6024': { lat: -31.8205, lng: 115.9105, suburb: 'Nollamara', state: 'WA' },
  '6025': { lat: -31.8105, lng: 115.9205, suburb: 'Balga', state: 'WA' },
  '6026': { lat: -31.8005, lng: 115.9305, suburb: 'Mirrabooka', state: 'WA' },
  '6027': { lat: -31.7905, lng: 115.9405, suburb: 'Koondoola', state: 'WA' },
  '6028': { lat: -31.7805, lng: 115.9505, suburb: 'Girrawheen', state: 'WA' },
  '6029': { lat: -31.7705, lng: 115.9605, suburb: 'Marangaroo', state: 'WA' },
  '6030': { lat: -31.7605, lng: 115.9705, suburb: 'Darch', state: 'WA' },
  
  // Southern Suburbs
  '6100': { lat: -32.0405, lng: 115.8605, suburb: 'Victoria Park', state: 'WA' },
  '6101': { lat: -32.0505, lng: 115.8705, suburb: 'East Victoria Park', state: 'WA' },
  '6102': { lat: -32.0605, lng: 115.8805, suburb: 'Lathlain', state: 'WA' },
  '6103': { lat: -32.0705, lng: 115.8905, suburb: 'Carlisle', state: 'WA' },
  '6104': { lat: -32.0805, lng: 115.9005, suburb: 'Kensington', state: 'WA' },
  '6105': { lat: -32.0905, lng: 115.9105, suburb: 'Como', state: 'WA' },
  '6106': { lat: -32.1005, lng: 115.9205, suburb: 'Manning', state: 'WA' },
  '6107': { lat: -32.1105, lng: 115.9305, suburb: 'Cannington', state: 'WA' },
  '6108': { lat: -32.1205, lng: 115.9405, suburb: 'Thornlie', state: 'WA' },
  '6109': { lat: -32.1305, lng: 115.9505, suburb: 'Gosnells', state: 'WA' },
  '6110': { lat: -32.1405, lng: 115.9605, suburb: 'Maddington', state: 'WA' },
  '6111': { lat: -32.1505, lng: 115.9705, suburb: 'Kelmscott', state: 'WA' },
  '6112': { lat: -32.1605, lng: 115.9805, suburb: 'Armadale', state: 'WA' },
  
  // Fremantle & Coastal
  '6150': { lat: -32.0605, lng: 115.8105, suburb: 'Fremantle', state: 'WA' },
  '6151': { lat: -32.0705, lng: 115.8005, suburb: 'South Fremantle', state: 'WA' },
  '6152': { lat: -32.0805, lng: 115.7905, suburb: 'Beaconsfield', state: 'WA' },
  '6153': { lat: -32.0905, lng: 115.7805, suburb: 'Coogee', state: 'WA' },
  '6154': { lat: -32.1005, lng: 115.7705, suburb: 'Munster', state: 'WA' },
  '6155': { lat: -32.1105, lng: 115.7605, suburb: 'Wattleup', state: 'WA' },
  '6156': { lat: -32.1205, lng: 115.7505, suburb: 'Bertram', state: 'WA' },
  '6157': { lat: -32.1305, lng: 115.7405, suburb: 'Wellard', state: 'WA' },
  '6158': { lat: -32.1405, lng: 115.7305, suburb: 'Baldivis', state: 'WA' },
  '6159': { lat: -32.1505, lng: 115.7205, suburb: 'Secret Harbour', state: 'WA' },
  '6160': { lat: -32.1605, lng: 115.7105, suburb: 'Pinjarra', state: 'WA' },
  '6161': { lat: -32.1705, lng: 115.7005, suburb: 'South Yunderup', state: 'WA' },
  '6162': { lat: -32.1805, lng: 115.6905, suburb: 'Mandurah', state: 'WA' },
  '6163': { lat: -32.1905, lng: 115.6805, suburb: 'Halls Head', state: 'WA' },
  '6164': { lat: -32.2005, lng: 115.6705, suburb: 'Erskine', state: 'WA' },
  '6210': { lat: -32.2105, lng: 115.6605, suburb: 'Dawesville', state: 'WA' },
  
  // AUSTRALIAN CAPITAL TERRITORY (2600-2618)
  '2600': { lat: -35.2809, lng: 149.1300, suburb: 'Canberra', state: 'ACT' },
  '2601': { lat: -35.2909, lng: 149.1200, suburb: 'Acton', state: 'ACT' },
  '2602': { lat: -35.3009, lng: 149.1100, suburb: 'Reid', state: 'ACT' },
  '2603': { lat: -35.3109, lng: 149.1000, suburb: 'Forrest', state: 'ACT' },
  '2604': { lat: -35.3209, lng: 149.0900, suburb: 'Griffith', state: 'ACT' },
  '2605': { lat: -35.3309, lng: 149.0800, suburb: 'Narrabundah', state: 'ACT' },
  '2606': { lat: -35.3409, lng: 149.0700, suburb: 'Red Hill', state: 'ACT' },
  '2607': { lat: -35.2709, lng: 149.0900, suburb: 'Yarralumla', state: 'ACT' },
  '2609': { lat: -35.2509, lng: 149.1100, suburb: 'Turner', state: 'ACT' },
  '2611': { lat: -35.2409, lng: 149.0600, suburb: 'Bruce', state: 'ACT' },
  '2612': { lat: -35.2309, lng: 149.0700, suburb: 'Belconnen', state: 'ACT' },
  '2614': { lat: -35.2209, lng: 149.0400, suburb: 'Gungahlin', state: 'ACT' },
  '2615': { lat: -35.2109, lng: 149.0500, suburb: 'Amaroo', state: 'ACT' },
  '2617': { lat: -35.2009, lng: 149.0300, suburb: 'Nicholls', state: 'ACT' },
  
  // NORTHERN TERRITORY (0800-0899)
  '0800': { lat: -12.4634, lng: 130.8456, suburb: 'Darwin', state: 'NT' },
  '0810': { lat: -12.4434, lng: 130.8256, suburb: 'Parap', state: 'NT' },
  '0820': { lat: -12.4234, lng: 130.8056, suburb: 'Nightcliff', state: 'NT' },
  '0830': { lat: -12.4034, lng: 130.7856, suburb: 'Casuarina', state: 'NT' },
  '0870': { lat: -23.6980, lng: 133.8807, suburb: 'Alice Springs', state: 'NT' },
  
  // TASMANIA (7000-7999)
  '7000': { lat: -42.8821, lng: 147.3272, suburb: 'Hobart', state: 'TAS' },
  '7004': { lat: -42.8921, lng: 147.3172, suburb: 'Battery Point', state: 'TAS' },
  '7005': { lat: -42.9021, lng: 147.3072, suburb: 'South Hobart', state: 'TAS' },
  '7008': { lat: -42.9221, lng: 147.2872, suburb: 'Dynnyrne', state: 'TAS' },
  '7009': { lat: -42.9321, lng: 147.2772, suburb: 'Mount Nelson', state: 'TAS' },
  '7010': { lat: -42.9421, lng: 147.2672, suburb: 'Tolmans Hill', state: 'TAS' },
  '7011': { lat: -42.8621, lng: 147.3172, suburb: 'New Town', state: 'TAS' },
  '7012': { lat: -42.8521, lng: 147.3072, suburb: 'Moonah', state: 'TAS' },
  '7018': { lat: -42.8421, lng: 147.2972, suburb: 'Glenorchy', state: 'TAS' },
  '7050': { lat: -42.8221, lng: 147.2772, suburb: 'Claremont', state: 'TAS' },
  '7250': { lat: -41.4332, lng: 147.1441, suburb: 'Launceston', state: 'TAS' },
  '7252': { lat: -41.4532, lng: 147.1641, suburb: 'South Launceston', state: 'TAS' },
  '7253': { lat: -41.4732, lng: 147.1841, suburb: 'Mowbray', state: 'TAS' },
};

// Helper function to calculate distance between two postcodes
export const calculateDistanceBetweenPostcodes = (
  postcode1: string,
  postcode2: string
): number | null => {
  const coords1 = postcodeCoordinates[postcode1];
  const coords2 = postcodeCoordinates[postcode2];

  if (!coords1 || !coords2) {
    return null;
  }

  return calculateDistance(coords1.lat, coords1.lng, coords2.lat, coords2.lng);
};

// Haversine formula to calculate distance between two coordinates
export const calculateDistance = (
  lat1: number,
  lng1: number,
  lat2: number,
  lng2: number
): number => {
  const R = 6371; // Radius of the Earth in km
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLng = ((lng2 - lng1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLng / 2) *
      Math.sin(dLng / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c; // Distance in km
};

// Check if a postcode is in our database
export const isPostcodeSupported = (postcode: string): boolean => {
  return postcode in postcodeCoordinates;
};

// Get state from postcode
export const getStateFromPostcode = (postcode: string): string | null => {
  const coords = postcodeCoordinates[postcode];
  return coords?.state || null;
};

// Get suburb from postcode
export const getSuburbFromPostcode = (postcode: string): string | null => {
  const coords = postcodeCoordinates[postcode];
  return coords?.suburb || null;
};
