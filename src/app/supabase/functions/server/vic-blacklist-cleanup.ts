import { Hono } from "npm:hono";
import { createClient } from "npm:@supabase/supabase-js@2";

const app = new Hono();

// Expanded blacklist - exact and subdomain matching only
// COMPREHENSIVE MASTER LIST - merged from frontend + backend + new discoveries
const BLACKLIST = [
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

const isBlacklisted = (url: string): boolean => {
  try {
    const domain = new URL(url).hostname.replace('www.', '');
    // Check if domain EXACTLY MATCHES or ENDS WITH blacklisted domain
    // This prevents false positives like "basscare.org.au" matching "care"
    return BLACKLIST.some(bl => {
      if (domain === bl) return true; // Exact match
      if (domain.endsWith('.' + bl)) return true; // Subdomain match
      return false;
    });
  } catch (e) {
    return false;
  }
};

/**
 * DELETE all blacklisted URLs from VIC villages
 */
app.post('/make-server-3bba8be8/vic-blacklist-cleanup', async (c) => {
  try {
    console.log('[VIC Blacklist Cleanup] Starting cleanup...');

    // Create Supabase client with SERVICE ROLE KEY (bypasses RLS)
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    // Get all VIC villages WITH websites
    const { data: villages, error: fetchError } = await supabase
      .from('retirement_villages')
      .select('id, name, suburb, website')
      .eq('state', 'VIC')
      .not('website', 'is', null);

    if (fetchError) {
      console.error('[VIC Blacklist Cleanup] Fetch error:', fetchError);
      return c.json({ success: false, error: fetchError.message }, 500);
    }

    console.log(`[VIC Blacklist Cleanup] Found ${villages?.length || 0} VIC villages with websites`);

    const badURLs: any[] = [];
    const goodURLs: any[] = [];

    // Check each village
    for (const village of villages || []) {
      if (isBlacklisted(village.website)) {
        badURLs.push(village);
        console.log(`  ⛔ BLACKLISTED: ${village.name} - ${village.website}`);
      } else {
        goodURLs.push(village);
      }
    }

    console.log(`[VIC Blacklist Cleanup] Found ${badURLs.length} blacklisted URLs`);
    console.log(`[VIC Blacklist Cleanup] Found ${goodURLs.length} good URLs`);

    // Delete blacklisted URLs (using SERVICE ROLE KEY - no RLS restrictions!)
    let deletedCount = 0;
    const deletedList: any[] = [];
    const failedList: any[] = [];

    for (const village of badURLs) {
      console.log(`[VIC Blacklist Cleanup] Attempting to delete: ${village.name} (ID: ${village.id})`);
      
      const { data, error: updateError } = await supabase
        .from('retirement_villages')
        .update({ website: null })
        .eq('id', village.id)
        .select();

      if (updateError) {
        console.error(`  ❌ Failed to delete ${village.name}:`, updateError);
        failedList.push({
          id: village.id,
          name: village.name,
          error: updateError.message
        });
      } else if (!data || data.length === 0) {
        console.error(`  ⚠️ No rows updated for ${village.name} (ID: ${village.id})`);
        failedList.push({
          id: village.id,
          name: village.name,
          error: 'No rows updated - possible RLS issue'
        });
      } else {
        deletedCount++;
        deletedList.push({
          id: village.id,
          name: village.name,
          suburb: village.suburb,
          website: village.website
        });
        console.log(`  ✅ Deleted: ${village.name}`);
      }
    }

    console.log(`[VIC Blacklist Cleanup] Complete! Deleted ${deletedCount} URLs, Failed ${failedList.length}`);

    return c.json({
      success: true,
      total: villages?.length || 0,
      bad: badURLs.length,
      good: goodURLs.length,
      deleted: deletedCount,
      failed: failedList.length,
      deletedList,
      failedList
    });

  } catch (error: any) {
    console.error('[VIC Blacklist Cleanup] Error:', error);
    return c.json({ success: false, error: error.message }, 500);
  }
});

export default app;