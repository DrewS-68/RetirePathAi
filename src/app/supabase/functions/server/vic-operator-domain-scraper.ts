import { createClient } from 'npm:@supabase/supabase-js@2.39.3';

// Embedded operator-domain CSV data
export const OPERATOR_DOMAIN_CSV = `"Operator,Domain"
"Abound Communities,aboundcommunities.org.au"
"ACH Group,achgroup.org.au"
"Advent Care,adventcare.org.au"
"Anglican / Benetas,benetas.com.au"
"Arcadia Group,"
"Ardency,ardency.com.au"
"Arpad Society,"
"Aspen Group,aspengroup.com.au"
"Australian Unity,australianunity.com.au"
"Aveo,aveo.com.au"
"Avington Living,avintonliving.com.au"
"Baptcare,baptcare.org.au"
"Barwon Health,barwonhealth.org.au"
"BASScare,basscare.org.au"
"Bellarine Community Health,bch.org.au"
"Benetas,benetas.com.au"
"Bendigo Lifestyle Village,bendigolifestylevillage.com.au"
"Bendigo retirement Village,bendigoretirementvillage.com.au"
"Berkeley Living,berkeleyliving.com.au"
"Blue Hills Group,bluehillsresidences.com.au"
"BlueCross,bluecross.com.au"
"Bolton Clarke,boltonclarke.com.au"
"Calvary,calvarycare.org.au"
"Canterbury Homes,canterburyhomes.org.au"
"Centennial Living,centennialliving.com.au"
"Country Club Living,countryclubliving.com.au"
"Cooinda Benalla,cooindabenalla.com.au"
"Cumberland View,cumberlandview.com.au"
"Dunmunkle Lodge,dunmunklelodge.org.au"
"Edgarley Home,edgarley.com.au"
"Edith Bendall,edithbendall.org.au"
"Emmy Monash,emmyMonash.asn.au"
"Encore Living,encoreliving.com.au"
"Euchuca Community For The Aged,"
"Euroa Health,euroahealth.com.au"
"Fairview,fairviewvillage.org.au"
"Glengollan,glengollan.com.au"
"Goldcare,"
"Good Shepherd,goodshep.org.au"
"Havilah Inc,havilah.org.au"
"Inala,inala.org.au"
"IP Living,ipliving.com.au"
"Jewish Care Victoria,jewishcare.org.au"
"Kardis Retirement Villages,kardisretirementvillages.com.au"
"Karinya,"
"Kellock Lodge,kellocklodge.org.au"
"Keyton,keyton.com.au"
"Kings Living,kingsliving.com.au"
"Kirkbrae (Presbyterian),kirkbrae.org.au"
"Latrobe Valley Village,lvv.org.au"
"Latvian Friendly Society,"
"Levande,levande.com.au"
"Lincoln Place,lincolnplace.com.au"
"Lifestyle Communities,lifestylecommunities.com.au"
"Linton Court,lintoncourt.com.au"
"Lions Club,lionsclubs.org.au"
"Long Island Village,longislandvillage.com.au"
"Martin Luther Homes,martinlutherhomes.com.au"
"Mayflower,mayflower.org.au"
"mecwacare,mecwacare.org.au"
"Mercy Health,mercyhealth.com.au"
"Menzies,menzies.org.au"
"MiCare,micare.com.au"
"Mildura Gardens,milduragardens.com.au"
"Mitchell House,mitchellhouse.com.au"
"Moyola Gardens,moyola.com.au"
"Murchison Community Care,murchisoncommunitycare.com.au"
"Nazareth Care,nazarethcare.com"
"Oak Tree Group,oaktreegroup.com.au"
"Old Colonists' Association,ocav.com.au"
"Olivet,olivet.org.au"
"One To Another,"
"Outlook Christian Village,outlookvillage.com.au"
"Palm Lake resort,palmlakeresort.com.au"
"Park lane Living,parklaneliving.com.au"
"Pinnacle Living,pinnacleliving.com.au"
"Princes Court Ltd,princescourt.com.au"
"Private Operator,"
"Probus Women's Housing,"
"Providence,providencevillages.com.au"
"Querencia Living,querencialiving.com.au"
"RCA Villages,rcavillages.com.au"
"Restdown,"
"RM Begg,rmbegg.org.au"
"Royal Freemasons,royalfreemasons.org.au"
"Ryman Healthcare,rymanhealthcare.com.au"
"Shepparton Villages,sheppartonvillages.com.au"
"Sirovilla,sirovilla.org.au"
"St Vincent's Care,stvincentscare.com.au"
"Strath Haven,strathhaven.com.au"
"Stretton Park,strettonpark.com.au"
"Summerset,summerset.com.au"
"Sunnyside Lutheran Homes,sunnysidelutheran.org.au"
"Swan Hill District Health,shdh.org.au"
"Teman Communities,teman.com.au"
"The Connault,"
"Tigcorp,tigcorp.com.au"
"TTHA,ttha.org.au"
"Ukrainian Elderly Peoples Home,"
"Uniting AgeWell,unitingagewell.org"
"UrbanLife,urbanlife.com.au"
"Vermont Elderly Homes,"
"Vermont Retirement Village,vermontvillage.com.au"
"Victorian Welfare Association,"
"Village Baxter,villagebaxter.com"
"Village Glen,villageglen.com.au"
"VMCH,vmch.com.au"
"Warramunda,warramunda.com.au"
"WDHS,wdhs.net"
"Wesley Homes,wesley.org.au"
"Westmont,westmont.org.au"
"Whitehaven,"
"Wintringham,wintringham.org.au"
"Wonthaggi Elderly Citizens,"
"Woorayl Lodge,woorayllodge.com.au"
"Yackandandah Health,yackandandahhealth.com.au"`;

interface OperatorDomain {
  operator: string;
  domain: string;
}

// Parse the operator_domain.csv data
export function parseOperatorDomainCSV(csvText: string): Map<string, string> {
  const operatorDomainMap = new Map<string, string>();
  
  const lines = csvText.split('\n');
  
  // Skip header row and process data rows
  for (let i = 1; i < lines.length; i++) {
    const line = lines[i].trim();
    if (!line) continue;
    
    // Remove surrounding quotes if present
    const cleanLine = line.replace(/^"(.*)"$/, '$1');
    
    // Split on the first comma only
    const commaIndex = cleanLine.indexOf(',');
    if (commaIndex === -1) continue;
    
    const operator = cleanLine.substring(0, commaIndex).trim();
    const domain = cleanLine.substring(commaIndex + 1).trim();
    
    if (operator) {
      // Store with empty string if domain is blank
      operatorDomainMap.set(operator, domain || '');
    }
  }
  
  console.log(`📊 Parsed ${operatorDomainMap.size} operators from CSV`);
  return operatorDomainMap;
}

// Forbidden domains that should never be returned
const FORBIDDEN_DOMAINS = [
  'villages.com.au',
  'agedcareguide.com.au',
  'agedcareonline.com.au',
  'retirementlivingonline.com.au',
  'realestate.com.au',
  'domain.com.au',
  'property.com.au',
  'realcommercial.com.au',
  'homes.com.au',
  'homely.com.au',
  'northeastdirectory.com.au',
  'careopinion.org.au',
  'herniman.com.au',
  'unitingvictas.org.au',
  'ncnhealth.org.au',
  'rslcaresa.com.au',
];

// Check if URL contains any forbidden domain
function containsForbiddenDomain(url: string): boolean {
  const lowerUrl = url.toLowerCase();
  return FORBIDDEN_DOMAINS.some(forbidden => lowerUrl.includes(forbidden));
}

// Clean URL by removing tracking parameters and unnecessary paths
function cleanURL(url: string): string {
  try {
    const urlObj = new URL(url);
    
    // Remove tracking parameters
    urlObj.searchParams.delete('srsltid');
    urlObj.searchParams.delete('utm_source');
    urlObj.searchParams.delete('utm_medium');
    urlObj.searchParams.delete('utm_campaign');
    urlObj.searchParams.delete('fbclid');
    urlObj.searchParams.delete('gclid');
    urlObj.searchParams.delete('hsLang');
    
    // Remove /for-sale and other unnecessary paths
    let pathname = urlObj.pathname;
    pathname = pathname.replace(/\/for-sale\/?.*$/, '/');
    
    // If path ends with just '/', and we have no query params, clean it up
    if (pathname === '/' && urlObj.search === '') {
      return `${urlObj.protocol}//${urlObj.host}`;
    }
    
    urlObj.pathname = pathname;
    
    return urlObj.toString();
  } catch {
    return url;
  }
}

// Check if URL is a PDF or generic page that's not useful
function isInvalidPageType(url: string): boolean {
  const lowerUrl = url.toLowerCase();
  
  // PDFs
  if (lowerUrl.includes('.pdf')) {
    return true;
  }
  
  // Generic/non-useful paths
  const invalidPaths = [
    '/privacy',
    '/terms-of-use',
    '/about/privacy-and-policies',
    '/help-and-support/contact',
    '/media-centre/news-and-media',
    '/files/documents/',
    '/continuing-our-growth',
    '/find-a-lions-club',
    'intranet.tigcorp.com.au',
    '/residential-aged-care/', // We want retirement villages, not aged care
    '/aged-care/',
  ];
  
  return invalidPaths.some(path => lowerUrl.includes(path));
}

// Validate URL contains the operator domain
function validateDomain(url: string, operatorDomain: string): boolean {
  if (!operatorDomain) return false;
  const lowerUrl = url.toLowerCase();
  const lowerDomain = operatorDomain.toLowerCase();
  return lowerUrl.includes(lowerDomain);
}

// Normalize village name for better search results
// Removes punctuation, extra spaces, hyphens, and trailing words like "Village", "Retirement Village", etc.
function normalizeVillageName(villageName: string): string {
  let normalized = villageName;
  
  // Remove punctuation (except spaces and hyphens for now)
  normalized = normalized.replace(/[.,;:!?'"()[\]{}]/g, '');
  
  // Remove common trailing words
  const trailingWords = [
    'Retirement Village',
    'Retirement',
    'Village',
    'Community',
    'Estate',
    'Residences',
    'Living',
    'Lifestyle Village',
    'Lifestyle',
  ];
  
  for (const word of trailingWords) {
    const regex = new RegExp(`\\s+${word}\\s*$`, 'i');
    normalized = normalized.replace(regex, '');
  }
  
  // Remove hyphens
  normalized = normalized.replace(/-/g, ' ');
  
  // Remove extra spaces
  normalized = normalized.replace(/\s+/g, ' ').trim();
  
  return normalized;
}

// Extract domain from URL
export function extractDomain(url: string): string | null {
  try {
    const urlObj = new URL(url);
    // Remove www. prefix for consistency
    return urlObj.hostname.replace(/^www\./, '');
  } catch {
    return null;
  }
}

// Find operator by domain in the operator domain map
export function findOperatorByDomain(
  domain: string,
  operatorDomainMap: Map<string, string>
): string | null {
  for (const [operator, operatorDomain] of operatorDomainMap.entries()) {
    if (operatorDomain && domain.toLowerCase().includes(operatorDomain.toLowerCase())) {
      return operator;
    }
  }
  return null;
}

// List of known multi-site operators (operators with multiple villages on the same domain)
const MULTI_SITE_OPERATORS = [
  'Ryman Healthcare',
  'Keyton',
  'Levande',
  'RCA',
  'Palm Lake resort',
  'Lifestyle Communities',
  'Aveo',
  'Lendlease',
  'Stockland',
  'Ingenia Communities',
  'Bolton Clarke',
  'BlueCross',
  'Baptcare',
  'Australian Unity',
  'Benetas',
  'mecwacare',
  'Mercy Health',
];

// Check if an operator is a known multi-site operator
function isMultiSiteOperator(operatorName: string): boolean {
  return MULTI_SITE_OPERATORS.some(op => 
    operatorName.toLowerCase().includes(op.toLowerCase()) ||
    op.toLowerCase().includes(operatorName.toLowerCase())
  );
}

// Search for the operator's hub page (Communities/Villages/Locations page)
async function findOperatorHubPage(
  operatorDomain: string,
  scraperApiKey: string
): Promise<string | null> {
  // Search for hub page with common terms
  const hubQuery = `site:${operatorDomain} (communities OR villages OR locations OR "our villages" OR "retirement living")`;
  
  console.log(`   🏢 Searching for hub page: ${hubQuery}`);
  
  const scraperUrl = `https://api.scraperapi.com/structured/google/search?api_key=${scraperApiKey}&query=${encodeURIComponent(hubQuery)}&country=au&num=10`;
  
  try {
    const response = await fetch(scraperUrl, {
      method: 'GET',
      headers: { 'Content-Type': 'application/json' }
    });
    
    if (!response.ok) {
      console.log(`   ❌ Hub search error: ${response.status}`);
      return null;
    }
    
    const data = await response.json();
    
    if (!data.organic_results || data.organic_results.length === 0) {
      console.log(`   ℹ️ No hub page found`);
      return null;
    }
    
    // Return the first result (likely the hub page)
    const hubPage = data.organic_results[0]?.link;
    if (hubPage) {
      console.log(`   ✅ Hub page found: ${hubPage}`);
      return hubPage;
    }
    
    return null;
  } catch (error) {
    console.log(`   ❌ Hub search error: ${error.message}`);
    return null;
  }
}

// Perform Google Custom Search via ScraperAPI
async function performGoogleSearch(
  villageName: string,
  operatorDomain: string,
  scraperApiKey: string
): Promise<string | null> {
  // Query format: site:domain.com.au "Village Name"
  const searchQuery = `site:${operatorDomain} "${villageName}"`;
  
  console.log(`   🔍 Search query: ${searchQuery}`);
  
  const scraperUrl = `https://api.scraperapi.com/structured/google/search?api_key=${scraperApiKey}&query=${encodeURIComponent(searchQuery)}&country=au&num=10`;
  
  try {
    const response = await fetch(scraperUrl, {
      method: 'GET',
      headers: { 'Content-Type': 'application/json' }
    });
    
    if (!response.ok) {
      console.log(`   ❌ ScraperAPI error: ${response.status}`);
      return null;
    }
    
    const data = await response.json();
    
    if (!data.organic_results || data.organic_results.length === 0) {
      console.log(`   ℹ️ No results found`);
      return null;
    }
    
    // Return the first valid result
    for (const result of data.organic_results) {
      if (result.link) {
        console.log(`   ✅ Found: ${result.link}`);
        return result.link;
      }
    }
    
    return null;
  } catch (error) {
    console.log(`   ❌ Search error: ${error.message}`);
    return null;
  }
}

// Main workflow function implementing village-search-logic.md
export async function findVillageWebsite(
  villageName: string,
  operatorName: string,
  operatorDomainMap: Map<string, string>,
  scraperApiKey: string,
  retryCount: number = 0
): Promise<string> {
  console.log(`\n🔍 Processing: ${villageName} (${operatorName})`);
  
  // RULE 1: DOMAIN CHECK
  const operatorDomain = operatorDomainMap.get(operatorName);
  
  if (!operatorDomain || operatorDomain === '') {
    console.log(`   ❌ No domain found for operator: ${operatorName}`);
    return 'No official website';
  }
  
  console.log(`   ✅ Operator domain: ${operatorDomain}`);
  
  // NORMALIZATION: Create normalized village name
  const normalizedVillageName = normalizeVillageName(villageName);
  console.log(`   📝 Original name: "${villageName}"`);
  console.log(`   📝 Normalized name: "${normalizedVillageName}"`);
  
  // MULTI-SITE OPERATOR DETECTION: Check if this is a known multi-site operator
  const isMultiSite = isMultiSiteOperator(operatorName);
  if (isMultiSite) {
    console.log(`   🏢 Multi-site operator detected: ${operatorName}`);
    
    // Try to find the hub page first (with delay to avoid rate limits)
    console.log(`   ⏳ Waiting 1 second before hub page search...`);
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    const hubPage = await findOperatorHubPage(operatorDomain, scraperApiKey);
    if (hubPage) {
      console.log(`   ℹ️ Hub page context will improve village search accuracy`);
    }
  }
  
  // RULE 2: DUAL-QUERY DOMAIN-BOUND SEARCH
  // Query 1 (primary): Search with original village name
  console.log(`   🔍 Query 1: Searching with original name...`);
  let searchResult = await performGoogleSearch(villageName, operatorDomain, scraperApiKey);
  
  // Query 2 (fallback): If Query 1 fails, try normalized village name
  if (!searchResult && normalizedVillageName !== villageName) {
    // Add 1-second delay before Query 2 to avoid rate limits
    console.log(`   ⏳ Waiting 1 second before Query 2...`);
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    console.log(`   🔍 Query 2: Searching with normalized name...`);
    searchResult = await performGoogleSearch(normalizedVillageName, operatorDomain, scraperApiKey);
  }
  
  if (!searchResult) {
    // RULE 5: FALLBACK TO OPERATOR HOMEPAGE
    console.log(`   ℹ️ No village-specific page found, trying operator homepage...`);
    
    // Add 1-second delay before operator search
    console.log(`   ⏳ Waiting 1 second before operator search...`);
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    // Try with just the operator name
    const operatorResult = await performGoogleSearch(operatorName, operatorDomain, scraperApiKey);
    
    if (operatorResult) {
      // Validate operator homepage
      if (!validateDomain(operatorResult, operatorDomain)) {
        console.log(`   ❌ Operator homepage domain mismatch`);
        return 'No official website';
      }
      
      if (containsForbiddenDomain(operatorResult)) {
        console.log(`   ❌ Operator homepage is forbidden domain`);
        return 'No official website';
      }
      
      console.log(`   ✅ Using operator homepage: ${operatorResult}`);
      return operatorResult;
    }
    
    // Try constructing operator homepage as last resort
    const constructedHomepage = `https://${operatorDomain}`;
    console.log(`   ℹ️ Using constructed homepage: ${constructedHomepage}`);
    return constructedHomepage;
  }
  
  // RULE 8: URL VALIDATION
  if (!validateDomain(searchResult, operatorDomain)) {
    console.log(`   ❌ Domain mismatch: ${searchResult} does not contain ${operatorDomain}`);
    
    // RULE 9: RETRY RULE
    if (retryCount === 0) {
      console.log(`   🔄 Retrying search...`);
      return findVillageWebsite(villageName, operatorName, operatorDomainMap, scraperApiKey, 1);
    }
    
    return 'Invalid – domain mismatch';
  }
  
  // RULE 3: FORBIDDEN SOURCES
  if (containsForbiddenDomain(searchResult)) {
    console.log(`   ❌ Forbidden domain detected: ${searchResult}`);
    
    // RULE 9: RETRY RULE
    if (retryCount === 0) {
      console.log(`   🔄 Retrying search...`);
      return findVillageWebsite(villageName, operatorName, operatorDomainMap, scraperApiKey, 1);
    }
    
    return 'Invalid – directory/advertising URL';
  }
  
  // RULE 4: VILLAGE-SPECIFIC PAGE LOGIC
  console.log(`   ✅ Valid village URL found: ${searchResult}`);
  return searchResult;
}

export async function vicOperatorDomainScraperRoute(request: Request) {
  const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
  const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
  const scraperApiKey = Deno.env.get('SCRAPERAPI_KEY')!;
  const supabase = createClient(supabaseUrl, supabaseServiceKey);
  
  // READ THE BODY ONCE and store it
  const body = await request.json();
  const { action, villages } = body;
  
  if (action === 'load-operators') {
    // Load and parse the operator_domain.csv file
    try {
      // Use embedded CSV data
      const csvText = OPERATOR_DOMAIN_CSV;
      const operatorDomainMap = parseOperatorDomainCSV(csvText);
      
      // Convert map to array for frontend
      const operators: OperatorDomain[] = [];
      operatorDomainMap.forEach((domain, operator) => {
        operators.push({ operator, domain });
      });
      
      return new Response(JSON.stringify({
        success: true,
        operators,
        totalOperators: operators.length,
        operatorsWithDomains: operators.filter(o => o.domain).length,
        operatorsWithoutDomains: operators.filter(o => !o.domain).length
      }), {
        headers: { 'Content-Type': 'application/json' }
      });
    } catch (error) {
      console.error('❌ Error loading operators:', error);
      return new Response(JSON.stringify({
        success: false,
        error: error.message
      }), {
        status: 500,
        headers: { 'Content-Type': 'application/json' }
      });
    }
  }
  
  if (action === 'scrape-batch') {
    console.log(`\n🚀 VIC Operator Domain Scraper - Batch Mode`);
    console.log(`📊 Processing ${villages.length} villages\n`);
    
    // Load operator domain map
    const csvText = OPERATOR_DOMAIN_CSV;
    const operatorDomainMap = parseOperatorDomainCSV(csvText);
    
    const results = [];
    
    for (const village of villages) {
      const { id, name, operator, currentWebsite } = village;
      
      try {
        // Find website using the workflow
        const foundUrl = await findVillageWebsite(
          name,
          operator,
          operatorDomainMap,
          scraperApiKey
        );
        
        // RULE 10: OVERWRITE PROTECTION
        let finalUrl = foundUrl;
        let overwriteProtected = false;
        
        if (currentWebsite && 
            (foundUrl.startsWith('Invalid') || foundUrl === 'No official website')) {
          console.log(`   🛡️ Overwrite protection: Keeping existing URL`);
          finalUrl = currentWebsite;
          overwriteProtected = true;
        }
        
        // URL CLEANING & VALIDATION: Clean URL and check if it's invalid
        if (finalUrl && finalUrl.startsWith('http')) {
          // Check if it's a PDF or invalid page type
          if (isInvalidPageType(finalUrl)) {
            console.log(`   ❌ Invalid page type detected (PDF or generic page): ${finalUrl}`);
            finalUrl = 'Invalid – PDF or generic page';
          } else {
            // Clean the URL (remove tracking parameters, etc.)
            const cleanedUrl = cleanURL(finalUrl);
            if (cleanedUrl !== finalUrl) {
              console.log(`   🧹 URL cleaned:`);
              console.log(`      Before: ${finalUrl}`);
              console.log(`      After: ${cleanedUrl}`);
              finalUrl = cleanedUrl;
            }
          }
        }
        
        // OPERATOR CORRECTION: Check if URL domain matches a different verified operator
        let correctedOperator = operator;
        let operatorCorrected = false;
        
        if (finalUrl && finalUrl.startsWith('http')) {
          const urlDomain = extractDomain(finalUrl);
          if (urlDomain) {
            const domainOperator = findOperatorByDomain(urlDomain, operatorDomainMap);
            
            // If URL domain matches an operator AND (operator is blank OR different), update it
            if (domainOperator && (!operator || operator.trim() === '' || domainOperator !== operator)) {
              if (!operator || operator.trim() === '') {
                console.log(`   ✨ OPERATOR DETECTED: URL domain (${urlDomain}) belongs to \"${domainOperator}\"`);
                console.log(`   📝 Setting blank operator to \"${domainOperator}\"`);
              } else {
                console.log(`   🔄 OPERATOR CORRECTION: URL domain (${urlDomain}) belongs to \"${domainOperator}\", not \"${operator}\"`);
                console.log(`   📝 Updating operator from \"${operator}\" to \"${domainOperator}\"`);
              }
              correctedOperator = domainOperator;
              operatorCorrected = true;
            }
          }
        }
        
        // Update village if we have a valid URL and it's different from current, or operator needs correction
        if ((finalUrl !== 'No official website' && 
            !finalUrl.startsWith('Invalid') &&
            finalUrl !== currentWebsite) || operatorCorrected) {
          
          const updateData: any = {};
          if (finalUrl !== currentWebsite) {
            updateData.website = finalUrl;
          }
          if (operatorCorrected) {
            updateData.operator = correctedOperator;
          }
          
          const { error: updateError } = await supabase
            .from('retirement_villages')
            .update(updateData)
            .eq('id', id);
          
          if (updateError) {
            console.log(`   ❌ Database update error: ${updateError.message}`);
          } else {
            if (finalUrl !== currentWebsite && operatorCorrected) {
              console.log(`   💾 Updated database with new URL and corrected operator`);
            } else if (finalUrl !== currentWebsite) {
              console.log(`   💾 Updated database with new URL`);
            } else if (operatorCorrected) {
              console.log(`   💾 Updated database with corrected operator`);
            }
          }
        }
        
        results.push({
          id,
          name,
          operator: correctedOperator, // Use corrected operator in results
          operatorDomain: operatorDomainMap.get(correctedOperator) || '',
          currentWebsite,
          foundUrl,
          finalUrl,
          overwriteProtected,
          operatorCorrected,
          originalOperator: operator, // Keep track of original for reference
          status: finalUrl === 'No official website' ? 'not_found' :
                  finalUrl.startsWith('Invalid') ? 'invalid' :
                  overwriteProtected ? 'protected' :
                  operatorCorrected && finalUrl === currentWebsite ? 'operator_corrected' :
                  finalUrl !== currentWebsite ? 'updated' : 'unchanged'
        });
        
        // Add delay between villages to avoid ScraperAPI rate limits (2 seconds)
        if (village !== villages[villages.length - 1]) {
          console.log(`   ⏳ Waiting 2 seconds before next village...`);
          await new Promise(resolve => setTimeout(resolve, 2000));
        }
        
      } catch (error) {
        console.log(`   ❌ Error processing village: ${error.message}`);
        results.push({
          id,
          name,
          operator,
          operatorDomain: operatorDomainMap.get(operator) || '',
          currentWebsite,
          foundUrl: 'Error',
          finalUrl: currentWebsite || 'Error',
          overwriteProtected: false,
          status: 'error',
          error: error.message
        });
      }
    }
    
    // Summary
    const summary = {
      total: results.length,
      updated: results.filter(r => r.status === 'updated').length,
      notFound: results.filter(r => r.status === 'not_found').length,
      invalid: results.filter(r => r.status === 'invalid').length,
      protected: results.filter(r => r.status === 'protected').length,
      unchanged: results.filter(r => r.status === 'unchanged').length,
      operatorCorrected: results.filter(r => r.status === 'operator_corrected').length,
      errors: results.filter(r => r.status === 'error').length
    };
    
    console.log(`\n✅ Batch complete!`);
    console.log(`   Updated: ${summary.updated}`);
    console.log(`   Not found: ${summary.notFound}`);
    console.log(`   Invalid: ${summary.invalid}`);
    console.log(`   Protected: ${summary.protected}`);
    console.log(`   Unchanged: ${summary.unchanged}`);
    console.log(`   Operator corrected: ${summary.operatorCorrected}`);
    console.log(`   Errors: ${summary.errors}`);
    
    return new Response(JSON.stringify({
      success: true,
      results,
      summary
    }), {
      headers: { 'Content-Type': 'application/json' }
    });
  }
  
  return new Response(JSON.stringify({ error: 'Invalid action' }), {
    status: 400,
    headers: { 'Content-Type': 'application/json' }
  });
}