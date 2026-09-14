import { createClient } from 'npm:@supabase/supabase-js@2.39.7';
import { Hono } from 'npm:hono@4';

const app = new Hono();

// Expanded blacklist of directory/garbage domains
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
  'rslcaresa.com.au',
  'providencevillages.com.au'
];

const cleanURL = (url: string): string => {
  try {
    const urlObj = new URL(url);
    
    // Remove tracking parameters
    urlObj.searchParams.delete('srsltid');
    urlObj.searchParams.delete('utm_source');
    urlObj.searchParams.delete('utm_medium');
    urlObj.searchParams.delete('utm_campaign');
    urlObj.searchParams.delete('fbclid');
    urlObj.searchParams.delete('gclid');
    
    // Remove /for-sale and other unnecessary paths
    let pathname = urlObj.pathname;
    pathname = pathname.replace(/\/for-sale\/?.*$/, '/');
    pathname = pathname.replace(/\/contact\/?$/, '/');
    pathname = pathname.replace(/\/about\/?$/, '/');
    
    urlObj.pathname = pathname;
    
    // Reconstruct URL
    let cleanedUrl = urlObj.toString();
    
    // Remove trailing slash if it's just the domain
    if (cleanedUrl.endsWith('/') && urlObj.pathname === '/') {
      cleanedUrl = cleanedUrl.slice(0, -1);
    }
    
    return cleanedUrl;
  } catch {
    return url;
  }
};

const isDomainBlacklisted = (url: string): boolean => {
  try {
    const urlObj = new URL(url);
    const hostname = urlObj.hostname.replace('www.', '');
    return BLACKLIST_DOMAINS.some(domain => hostname.includes(domain));
  } catch {
    return false;
  }
};

const isPDF = (url: string): boolean => {
  return url.toLowerCase().includes('.pdf');
};

const isGenericPage = (url: string): boolean => {
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
  
  return genericPaths.some(path => url.includes(path));
};

// Remove blacklisted URLs
app.post('/make-server-3bba8be8/vic-url-cleanup/remove-blacklisted', async (c) => {
  const supabase = createClient(
    Deno.env.get('SUPABASE_URL')!,
    Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
  );

  try {
    console.log('🔍 Fetching all VIC villages with websites...');
    
    const { data: villages, error } = await supabase
      .from('retirement_villages')
      .select('id, name, operator, website')
      .eq('state', 'VIC')
      .not('website', 'is', null);

    if (error) {
      console.error('Database error:', error);
      return c.json({ success: false, error: error.message }, 500);
    }

    console.log(`✅ Found ${villages.length} villages with websites`);

    const logs: string[] = [];
    let blacklistedCount = 0;
    let pdfCount = 0;
    let genericCount = 0;

    for (const village of villages) {
      if (!village.website) continue;

      const isBlacklisted = isDomainBlacklisted(village.website);
      const isPdf = isPDF(village.website);
      const isGeneric = isGenericPage(village.website);

      if (isBlacklisted || isPdf || isGeneric) {
        const reason = isBlacklisted ? '🚫 Blacklisted domain' :
                      isPdf ? '📄 PDF file' :
                      '⚠️ Generic page';
        
        logs.push(`${reason}: ${village.name}`);
        logs.push(`   Operator: ${village.operator}`);
        logs.push(`   URL: ${village.website}`);

        const { error: updateError } = await supabase
          .from('retirement_villages')
          .update({ website: null })
          .eq('id', village.id);

        if (updateError) {
          logs.push(`   ❌ Error: ${updateError.message}`);
          console.error(`Update error for ${village.name}:`, updateError);
        } else {
          logs.push(`   ✅ Removed`);
          if (isBlacklisted) blacklistedCount++;
          if (isPdf) pdfCount++;
          if (isGeneric) genericCount++;
        }
        logs.push('');
      }
    }

    logs.push('');
    logs.push('📊 SUMMARY:');
    logs.push(`   Blacklisted domains removed: ${blacklistedCount}`);
    logs.push(`   PDF files removed: ${pdfCount}`);
    logs.push(`   Generic pages removed: ${genericCount}`);
    logs.push(`   Total removed: ${blacklistedCount + pdfCount + genericCount}`);

    console.log('Summary:', { blacklistedCount, pdfCount, genericCount });

    return c.json({
      success: true,
      logs,
      summary: {
        blacklisted: blacklistedCount,
        pdfs: pdfCount,
        generic: genericCount,
        total: blacklistedCount + pdfCount + genericCount
      }
    });

  } catch (error: any) {
    console.error('Cleanup error:', error);
    return c.json({ success: false, error: error.message }, 500);
  }
});

// Clean up URLs (remove tracking parameters)
app.post('/make-server-3bba8be8/vic-url-cleanup/clean-urls', async (c) => {
  const supabase = createClient(
    Deno.env.get('SUPABASE_URL')!,
    Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
  );

  try {
    console.log('🧹 Cleaning up URLs (removing tracking parameters)...');
    
    const { data: villages, error } = await supabase
      .from('retirement_villages')
      .select('id, name, website')
      .eq('state', 'VIC')
      .not('website', 'is', null);

    if (error) {
      console.error('Database error:', error);
      return c.json({ success: false, error: error.message }, 500);
    }

    console.log(`✅ Found ${villages.length} villages with websites`);

    const logs: string[] = [];
    let cleanedCount = 0;

    for (const village of villages) {
      if (!village.website) continue;

      const cleanedUrl = cleanURL(village.website);

      if (cleanedUrl !== village.website) {
        logs.push(`🧹 ${village.name}`);
        logs.push(`   Old: ${village.website}`);
        logs.push(`   New: ${cleanedUrl}`);

        const { error: updateError } = await supabase
          .from('retirement_villages')
          .update({ website: cleanedUrl })
          .eq('id', village.id);

        if (updateError) {
          logs.push(`   ❌ Error: ${updateError.message}`);
          console.error(`Update error for ${village.name}:`, updateError);
        } else {
          logs.push(`   ✅ Updated`);
          cleanedCount++;
        }
        logs.push('');
      }
    }

    logs.push('');
    logs.push('📊 SUMMARY:');
    logs.push(`   URLs cleaned: ${cleanedCount}`);

    console.log('Summary:', { cleanedCount });

    return c.json({
      success: true,
      logs,
      summary: { cleaned: cleanedCount }
    });

  } catch (error: any) {
    console.error('Cleanup error:', error);
    return c.json({ success: false, error: error.message }, 500);
  }
});

// Fix Australian Unity over-assignment
app.post('/make-server-3bba8be8/vic-url-cleanup/fix-australian-unity', async (c) => {
  const supabase = createClient(
    Deno.env.get('SUPABASE_URL')!,
    Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
  );

  try {
    console.log('🔍 Finding Australian Unity villages with generic homepages...');
    
    const { data: villages, error } = await supabase
      .from('retirement_villages')
      .select('id, name, website')
      .eq('state', 'VIC')
      .eq('operator', 'Australian Unity')
      .not('website', 'is', null);

    if (error) {
      console.error('Database error:', error);
      return c.json({ success: false, error: error.message }, 500);
    }

    console.log(`✅ Found ${villages.length} Australian Unity villages`);

    const logs: string[] = [];
    let fixedCount = 0;
    const VALID_AU_PATHS = [
      '/assisted-living/retirement-communities/locations/victoria/'
    ];

    for (const village of villages) {
      if (!village.website) continue;

      const isGenericHomepage = village.website === 'https://www.australianunity.com.au' ||
                               village.website === 'https://www.australianunity.com.au/' ||
                               village.website.includes('australianunity.com.au/?srsltid=') ||
                               isPDF(village.website) ||
                               isGenericPage(village.website);

      const hasValidPath = VALID_AU_PATHS.some(path => village.website.includes(path));

      if (isGenericHomepage || !hasValidPath) {
        logs.push(`❌ ${village.name}`);
        logs.push(`   URL: ${village.website}`);
        logs.push(`   Action: Removing generic/invalid URL AND clearing operator`);

        const { error: updateError } = await supabase
          .from('retirement_villages')
          .update({ 
            website: null,
            operator: null  // Also clear the incorrect operator assignment
          })
          .eq('id', village.id);

        if (updateError) {
          logs.push(`   ❌ Error: ${updateError.message}`);
          console.error(`Update error for ${village.name}:`, updateError);
        } else {
          logs.push(`   ✅ Removed URL and cleared operator`);
          fixedCount++;
        }
        logs.push('');
      }
    }

    logs.push('');
    logs.push('📊 SUMMARY:');
    logs.push(`   Australian Unity URLs removed: ${fixedCount}`);
    logs.push(`   Australian Unity operators cleared: ${fixedCount}`);
    logs.push(`   Remaining valid Australian Unity villages: ${villages.length - fixedCount}`);

    console.log('Summary:', { fixedCount, remaining: villages.length - fixedCount });

    return c.json({
      success: true,
      logs,
      summary: {
        fixed: fixedCount,
        remaining: villages.length - fixedCount
      }
    });

  } catch (error: any) {
    console.error('Cleanup error:', error);
    return c.json({ success: false, error: error.message }, 500);
  }
});

export default app;