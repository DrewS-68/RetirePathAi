// VIC Master Website Scraper - Scrape ALL VIC villages for official websites
import { Hono } from "npm:hono";
import { createClient } from "npm:@supabase/supabase-js@2";

const app = new Hono();

const supabase = createClient(
  Deno.env.get('SUPABASE_URL')!,
  Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!,
);

// Blacklist of aggregator/directory sites (same as used in other tools)
const BLACKLISTED_DOMAINS = [
  // Property aggregators & real estate sites
  'realestate.com.au',
  'domain.com.au',
  'property.com.au',
  'realcommercial.com.au',
  'yourinvestmentpropertymag.com.au',
  'homely.com.au',
  'propertyvalue.com.au',
  'harcourts.net',
  'gjgardner.com.au',
  'bhhscoastalrealtors.com',
  'youngsandco.com.au',
  'maxbrown.com.au',
  'ratemyagent.com.au',
  'jelliscraig.com.au',
  'moullmurray.com',
  'roost.com.au',
  'view.com.au',
  
  // Aged care directories & aggregators
  'villages.com.au',
  'agedcareonline.com.au',
  'agedcare101.com.au',
  'agedcarequality.gov.au',
  'agedcareview.com.au',
  'awisemove.com.au',
  'agedcareguide.com.au',
  'retirementlivingonline.com.au',
  'downsizing.com.au',
  'australianretirementvillages.com.au',
  'retirementliving.org.au',
  'retirementaustralialiving.com.au',
  'seniorshousingonline.com.au',
  'myagedcare.gov.au',
  'gen-agedcaredata.gov.au',
  'agedcaremadeeasy.com.au',
  'tricare.com.au',
  'caringco.com.au',
  'agedcarefind.com.au',
  'dailycare.com.au',
  
  // Social media & major platforms
  'google.com',
  'facebook.com',
  'instagram.com',
  'linkedin.com',
  'wikipedia.org',
  'tripadvisor.com',
  'youtube.com',
  
  // Business directories & listings
  'yellowpages.com.au',
  'whitepages.com.au',
  'hougarden.com',
  'creditorwatch.com.au',
  'acnc.gov.au',
  'streetnews.com.au',
  'aussie.com.au',
  'realsearch.com.au',
  'chalmer.com.au',
  'aussieweb.com.au',
  'yelp.com',
  'bizly.com.au',
  'infoisinfo-au.com',
  'zoominfo.com',
  'cylex-australia.com',
  'my-community.com',
  'parkopedia.com.au',
  'abr.business.gov.au',
  'dlook.com.au',
  'simplyregional.com.au',
  'australianplanet.com',
  'chinesebusinessguide.com.au',
  'touristplaces.com.au',
  'localista.com.au',
  'editorials.localista.com.au',
  
  // Government & council sites
  'slv.vic.gov.au',
  'find.slv.vic.gov.au',
  'transport.vic.gov.au',
  'asx.com.au',
  'aph.gov.au',
  'communitygrants.gov.au',
  'gazette.vic.gov.au',
  'knox.vic.gov.au',
  'southgippsland.vic.gov.au',
  'centralgoldfields.vic.gov.au',
  'greatershepparton.com.au',
  
  // Maps & location services
  'mapquest.com',
  'whereis.com',
  'moovitapp.com',
  'findlatitudeandlongitude.com',
  'mapcarta.com',
  'maptons.com',
  'waze.com',
  'geoview.info',
  'australia-streets.openalfa.com',
  
  // Document & media sites
  'issuu.com',
  'yumpu.com',
  'prezi.com',
  'shutterstock.com',
  'newspapers.com',
  
  // Archives & libraries
  'paperspast.natlib.govt.nz',
  'trove.nla.gov.au',
  'victoriancollections.net.au',
  
  // Other
  'beenverified.com',
  'chamberofcommerce.com',
  'reviews.birdeye.com',
  'donatehq.com.au',
  'warrandyte.org.au',
  'sandbox.haaa.com.au',
  'dgas.org.au',
  'mrra.asn.au',
  'acncpubfilesprodstorage.blob.core.windows.net',
  'sa-venues.com',
  'victoriashighcountry.com.au',
  'changepath.com.au',
  'bnaibrith.org.au',
  'andrews.edu',
  'warrandytediary.com.au',
  'blairsmith.com.au',
  'mallacoota.org.au',
  'afr.com.au',
  'newly.com.au',
  'singaustralia.com.au'
];

// Google Custom Search API
const GOOGLE_API_KEY = Deno.env.get('GOOGLE_CUSTOM_SEARCH_API_KEY');
const GOOGLE_CX = Deno.env.get('GOOGLE_CUSTOM_SEARCH_CX');

async function searchGoogleForWebsite(villageName: string, operatorName: string): Promise<string | null> {
  if (!GOOGLE_API_KEY || !GOOGLE_CX) {
    console.log('❌ Google API credentials not configured');
    return null;
  }

  try {
    // Build search query
    const query = `"${operatorName}" "${villageName}" retirement village`;
    console.log(`🔍 Searching Google: ${query}`);

    const url = `https://www.googleapis.com/customsearch/v1?key=${GOOGLE_API_KEY}&cx=${GOOGLE_CX}&q=${encodeURIComponent(query)}&num=10`;
    
    const response = await fetch(url);
    
    if (!response.ok) {
      console.log(`❌ Google search failed: ${response.status}`);
      return null;
    }

    const data = await response.json();
    
    if (!data.items || data.items.length === 0) {
      console.log('❌ No search results');
      return null;
    }

    // Filter out blacklisted domains
    for (const item of data.items) {
      const itemUrl = item.link;
      
      try {
        const urlObj = new URL(itemUrl);
        const domain = urlObj.hostname.toLowerCase().replace(/^www\./, '');
        
        // Check if domain is blacklisted
        const isBlacklisted = BLACKLISTED_DOMAINS.some(bl => domain.includes(bl) || bl.includes(domain));
        
        if (!isBlacklisted) {
          console.log(`✅ Found valid website: ${itemUrl}`);
          return itemUrl;
        } else {
          console.log(`⏭️ Skipping blacklisted: ${domain}`);
        }
      } catch (e) {
        console.log(`⚠️ Invalid URL: ${itemUrl}`);
      }
    }

    console.log('❌ All results were blacklisted');
    return null;

  } catch (error: any) {
    console.error('Google search error:', error);
    return null;
  }
}

/**
 * POST /make-server-3bba8be8/vic-master-scrape/start
 * Scrape websites for ALL VIC villages
 */
app.post('/make-server-3bba8be8/vic-master-scrape/start', async (c) => {
  try {
    console.log('⚡ VIC MASTER WEBSITE SCRAPER - STARTING');
    console.log('='.repeat(60));

    // Get all VIC villages
    const { data: allVic, error: fetchError } = await supabase
      .from('retirement_villages')
      .select('id, name, operator, website, suburb, state')
      .eq('state', 'VIC');

    if (fetchError) {
      return c.json({ error: fetchError.message }, 500);
    }

    console.log(`\n📊 Total VIC villages: ${allVic.length}`);

    // Filter: only villages WITH operators and WITHOUT websites
    const needsScraping = allVic.filter(v => {
      const hasOperator = v.operator && v.operator.trim() !== '';
      const hasWebsite = v.website && v.website.trim() !== '';
      return hasOperator && !hasWebsite;
    });

    console.log(`📊 Villages needing scraping (have operator, no website): ${needsScraping.length}`);
    
    const alreadyHaveWebsite = allVic.filter(v => v.website && v.website.trim() !== '');
    console.log(`⏭️ Villages already have websites: ${alreadyHaveWebsite.length}`);

    const noOperator = allVic.filter(v => !v.operator || v.operator.trim() === '');
    console.log(`⚠️ Villages without operators (can't scrape): ${noOperator.length}`);

    // Scrape each village
    let found = 0;
    let notFound = 0;
    const errors: string[] = [];

    for (let i = 0; i < needsScraping.length; i++) {
      const village = needsScraping[i];
      console.log(`\n[${i + 1}/${needsScraping.length}] ${village.name}`);
      console.log(`   Operator: ${village.operator}`);

      try {
        // Search for website
        const websiteUrl = await searchGoogleForWebsite(village.name, village.operator!);

        if (websiteUrl) {
          // Save to database
          const { error: updateError } = await supabase
            .from('retirement_villages')
            .update({ website: websiteUrl })
            .eq('id', village.id);

          if (updateError) {
            console.error(`   ❌ Database update error: ${updateError.message}`);
            errors.push(`${village.name}: DB error`);
            notFound++;
          } else {
            console.log(`   ✅ Saved: ${websiteUrl}`);
            found++;
          }
        } else {
          console.log(`   ❌ No website found`);
          notFound++;
        }

        // Rate limiting: wait 1 second between requests
        if (i < needsScraping.length - 1) {
          await new Promise(resolve => setTimeout(resolve, 1000));
        }

      } catch (error: any) {
        console.error(`   ❌ Error: ${error.message}`);
        errors.push(`${village.name}: ${error.message}`);
        notFound++;
      }
    }

    console.log('\n✅ MASTER SCRAPE COMPLETE');
    console.log(`   Processed: ${needsScraping.length}`);
    console.log(`   Found: ${found}`);
    console.log(`   Not found: ${notFound}`);
    console.log(`   Skipped (had website): ${alreadyHaveWebsite.length}`);
    console.log(`   Errors: ${errors.length}`);

    return c.json({
      success: true,
      total: needsScraping.length,
      found,
      notFound,
      skipped: alreadyHaveWebsite.length,
      noOperator: noOperator.length,
      errors: errors.length > 0 ? errors : undefined
    });

  } catch (error: any) {
    console.error('Master scrape error:', error);
    return c.json({ error: error.message }, 500);
  }
});

export default app;