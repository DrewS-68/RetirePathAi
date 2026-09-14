import { createClient } from 'npm:@supabase/supabase-js@2.39.7';
import { Hono } from 'npm:hono@4';

const app = new Hono();

// Diagnostic endpoint to check what URLs exist and why cleanup didn't work
app.get('/make-server-3bba8be8/vic-url-diagnostic', async (c) => {
  const supabase = createClient(
    Deno.env.get('SUPABASE_URL')!,
    Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
  );

  try {
    console.log('🔍 VIC URL Diagnostic - Checking all URLs...');

    // Get all VIC villages with websites
    const { data: villages, error } = await supabase
      .from('retirement_villages')
      .select('id, name, operator, website')
      .eq('state', 'VIC')
      .not('website', 'is', null);

    if (error) {
      console.error('Database error:', error);
      return c.json({ error: error.message }, 500);
    }

    console.log(`Found ${villages.length} VIC villages with websites`);

    // Blacklist from cleanup tool
    const BLACKLIST_DOMAINS = [
      'villages.com.au',
      'agedcareguide.com.au',
      'retirementliving.org.au',
      'australianretirementliving.com.au',
      'northeastdirectory.com.au',
      'careopinion.org.au',
      'herniman.com.au',
      'library.olivet.org.au',
      'echucaca.com.au',
      'unitingvictas.org.au',
      'ncnhealth.org.au',
      'rslcaresa.com.au'
    ];

    // Categorize URLs
    const analysis = {
      total: villages.length,
      blacklisted: [] as any[],
      pdfs: [] as any[],
      generic: [] as any[],
      trackingParams: [] as any[],
      australianUnityGeneric: [] as any[],
      clean: [] as any[],
      sampleUrls: [] as string[]
    };

    villages.forEach((village) => {
      if (!village.website) return;

      const url = village.website;
      
      // Sample first 20 URLs
      if (analysis.sampleUrls.length < 20) {
        analysis.sampleUrls.push(url);
      }

      try {
        const urlObj = new URL(url);
        const hostname = urlObj.hostname.replace('www.', '');

        // Check blacklist
        const isBlacklisted = BLACKLIST_DOMAINS.some(domain => hostname.includes(domain));
        if (isBlacklisted) {
          analysis.blacklisted.push({
            name: village.name,
            operator: village.operator,
            url: url,
            domain: hostname
          });
          return;
        }

        // Check PDF
        if (url.toLowerCase().includes('.pdf')) {
          analysis.pdfs.push({
            name: village.name,
            operator: village.operator,
            url: url
          });
          return;
        }

        // Check generic pages
        const genericPaths = [
          '/privacy',
          '/terms-of-use',
          '/contact',
          '/about/privacy-and-policies',
          '/help-and-support/contact',
          '/media-centre/news-and-media',
          '/files/documents/',
          '/continuing-our-growth',
          '/find-a-lions-club',
          'intranet.tigcorp.com.au'
        ];
        
        const isGeneric = genericPaths.some(path => url.includes(path));
        if (isGeneric) {
          analysis.generic.push({
            name: village.name,
            operator: village.operator,
            url: url
          });
          return;
        }

        // Check tracking parameters
        if (url.includes('?srsltid=') || url.includes('utm_') || url.includes('fbclid') || url.includes('gclid')) {
          analysis.trackingParams.push({
            name: village.name,
            operator: village.operator,
            url: url
          });
        }

        // Check Australian Unity
        if (village.operator === 'Australian Unity') {
          const isGenericAU = url === 'https://www.australianunity.com.au' ||
                             url === 'https://www.australianunity.com.au/' ||
                             url.includes('australianunity.com.au/?srsltid=');
          
          const hasValidPath = url.includes('/assisted-living/retirement-communities/locations/victoria/');
          
          if (isGenericAU || !hasValidPath) {
            analysis.australianUnityGeneric.push({
              name: village.name,
              url: url,
              reason: isGenericAU ? 'generic homepage' : 'invalid path'
            });
            return;
          }
        }

        // If we got here, it's clean
        analysis.clean.push({
          name: village.name,
          operator: village.operator,
          url: url
        });

      } catch (e) {
        console.error(`Invalid URL for ${village.name}: ${url}`, e);
      }
    });

    const summary = {
      total: analysis.total,
      blacklisted: analysis.blacklisted.length,
      pdfs: analysis.pdfs.length,
      generic: analysis.generic.length,
      trackingParams: analysis.trackingParams.length,
      australianUnityGeneric: analysis.australianUnityGeneric.length,
      clean: analysis.clean.length,
      shouldBeDeleted: analysis.blacklisted.length + analysis.pdfs.length + analysis.generic.length + analysis.australianUnityGeneric.length
    };

    console.log('📊 Summary:', summary);

    return c.json({
      summary,
      sampleUrls: analysis.sampleUrls,
      details: {
        blacklistedSample: analysis.blacklisted.slice(0, 5),
        pdfsSample: analysis.pdfs.slice(0, 5),
        genericSample: analysis.generic.slice(0, 5),
        trackingParamsSample: analysis.trackingParams.slice(0, 5),
        australianUnitySample: analysis.australianUnityGeneric.slice(0, 5),
        cleanSample: analysis.clean.slice(0, 10)
      }
    });

  } catch (error: any) {
    console.error('Diagnostic error:', error);
    return c.json({ error: error.message, stack: error.stack }, 500);
  }
});

export default app;
