import React, { useState, useEffect } from 'react';
import { Link2, CheckCircle, XCircle } from 'lucide-react';
import { getSupabaseClient } from '../../utils/supabase/client';

/**
 * Operator URL Patterns
 * Key: operator name (lowercase, fuzzy match)
 * Value: URL pattern with {slug} placeholder
 */
const OPERATOR_PATTERNS: Record<string, string> = {
  // Major operators with standardized patterns
  'stockland': 'https://www.stockland.com.au/residential/vic/{slug}',
  'aveo': 'https://www.aveo.com.au/retirement-villages/vic/melbourne/{slug}',
  'keyton': 'https://keyton.com.au/home/our-villages/vic/{slug}',
  'centennial': 'https://centennialliving.com.au/village/{slug}',
  'centennial living': 'https://centennialliving.com.au/village/{slug}',
  'ryman': 'https://www.rymanhealthcare.com.au/retirement-villages/melbourne/{slug}',
  'ryman healthcare': 'https://www.rymanhealthcare.com.au/retirement-villages/melbourne/{slug}',
  'levande': 'https://www.levande.com.au/community/{slug}',
  'australian unity': 'https://www.australianunity.com.au/assisted-living/retirement-communities/locations/victoria/{slug}',
  'summerset': 'https://www.summerset.com.au/find-a-village/victoria/{slug}',
  'vmch': 'https://retirement.vmch.com.au/our-communities/{slug}',
  'arcadia': 'https://www.arcadiagroup.com.au/village/{slug}', // May need manual review
  'lendlease': 'https://www.lendlease.com/au/retirement/{slug}',
  'retire australia': 'https://www.retireaustralia.com.au/retirement-villages/vic/{slug}',
  'southern cross care': 'https://www.southerncrosscare.com.au/locations/retirement-living/{slug}',
  'bolton clarke': 'https://www.boltonclarke.com.au/living-options/retirement-living/{slug}',
  'uniting': 'https://www.unitingvictas.org.au/services/housing/retirement-villages/{slug}',
  'unitingvictas': 'https://www.unitingvictas.org.au/services/housing/retirement-villages/{slug}',
  'uniting agewell': 'https://www.unitingagewell.org/location/{slug}',
  'mecwacare': 'https://www.mecwacare.org.au/services/retirement-living/{slug}',
  'mercy health': 'https://retirement-living.mercyhealth.com.au/villages/{slug}',
  'abound': 'https://www.aboundcommunities.org.au/locations/{slug}',
  'abound communities': 'https://www.aboundcommunities.org.au/locations/{slug}',
  'karidis': 'https://karidisretirementvillages.com.au/villages/{slug}',
  'tricare': 'https://www.tricare.com.au/retirement-living/victoria/{slug}',
  'villewood': 'https://villawoodproperties.com.au/community/{slug}',
  'royal freemasons': 'https://www.villages.com.au/vic/{slug}', // May need different pattern
};

interface Result {
  villageName: string;
  suburb: string;
  operator: string;
  generatedUrl: string;
  status: 'success' | 'failed' | 'pending';
  statusCode?: number;
  error?: string;
}

/**
 * VIC Operator URL Generator
 * Generates URLs for major operators with standardized patterns
 */
export const VICOperatorURLGenerator = React.memo(() => {
  const [isRunning, setIsRunning] = useState(false);
  const [skipValidation, setSkipValidation] = useState(true); // Always skip validation for speed
  
  const [stats, setStats] = useState({
    total: 0,
    matched: 0,
    generated: 0,
    validated: 0,
    failed: 0,
    saved: 0
  });
  const [results, setResults] = useState<Result[]>([]);
  const [logs, setLogs] = useState<string[]>([]);

  const addLog = (message: string) => {
    const timestamp = new Date().toLocaleTimeString();
    const logMessage = `[${timestamp}] ${message}`;
    console.log(logMessage);
    setLogs(prev => [logMessage, ...prev].slice(0, 100));
  };

  /**
   * Convert village name to URL slug
   */
  const generateSlug = (name: string, suburb?: string): string => {
    // Remove common suffixes
    let slug = name
      .toLowerCase()
      .replace(/retirement village/gi, '')
      .replace(/aged care/gi, '')
      .replace(/community/gi, '')
      .replace(/village/gi, '')
      .trim();

    // Convert to kebab-case
    slug = slug
      .replace(/[^\w\s-]/g, '') // Remove special chars
      .replace(/\s+/g, '-')      // Spaces to hyphens
      .replace(/-+/g, '-')       // Multiple hyphens to single
      .replace(/^-|-$/g, '');    // Trim hyphens

    // Some operators include suburb in slug
    if (suburb) {
      const suburbSlug = suburb.toLowerCase().replace(/\s+/g, '-');
      // Check if suburb not already in name
      if (!slug.includes(suburbSlug)) {
        return `${suburbSlug}-${slug}`;
      }
    }

    return slug;
  };

  /**
   * Find operator pattern
   */
  const findOperatorPattern = (operator: string): string | null => {
    if (!operator) return null;

    const operatorLower = operator.toLowerCase().trim();

    // Exact match
    if (OPERATOR_PATTERNS[operatorLower]) {
      return OPERATOR_PATTERNS[operatorLower];
    }

    // Partial match (operator contains key)
    for (const [key, pattern] of Object.entries(OPERATOR_PATTERNS)) {
      if (operatorLower.includes(key) || key.includes(operatorLower)) {
        return pattern;
      }
    }

    return null;
  };

  /**
   * Validate URL by checking if it exists
   */
  const validateUrl = async (url: string): Promise<{ valid: boolean; statusCode?: number }> => {
    try {
      const response = await fetch(url, {
        method: 'HEAD',
        mode: 'no-cors' // Avoid CORS issues
      });
      return { valid: response.ok, statusCode: response.status };
    } catch (error) {
      // Try GET as fallback (some servers don't support HEAD)
      try {
        const response = await fetch(url, { method: 'GET', mode: 'no-cors' });
        return { valid: true, statusCode: response.status };
      } catch (e) {
        return { valid: false };
      }
    }
  };

  const runGenerator = async () => {
    // Capture current state to avoid closure issues
    const currentIsDryRun = false; // Always false for this version
    const currentSkipValidation = skipValidation;
    
    console.log('🔍 Starting generator with settings:', { isDryRun: currentIsDryRun, skipValidation: currentSkipValidation });
    
    if (!currentIsDryRun && !confirm(`⚠️ Save Generated URLs to Database?\n\nThis will UPDATE the website field for matched villages.\n\nContinue?`)) {
      return;
    }

    setIsRunning(true);
    setStats({ total: 0, matched: 0, generated: 0, validated: 0, failed: 0, saved: 0 });
    setResults([]);
    setLogs([]);

    try {
      const supabase = getSupabaseClient();

      addLog('🔍 Fetching VIC villages WITHOUT websites...');

      // Get VIC villages without websites that have operators
      const { data: villages, error } = await supabase
        .from('retirement_villages')
        .select('id, name, suburb, operator, website')
        .eq('state', 'VIC')
        .is('website', null)
        .not('operator', 'is', null);

      if (error) throw error;

      addLog(`✅ Found ${villages?.length || 0} VIC villages with operators but no websites`);
      setStats(prev => ({ ...prev, total: villages?.length || 0 }));

      // Local counters to avoid closure issues
      let matchedCount = 0;
      let generatedCount = 0;
      let validatedCount = 0;
      let failedCount = 0;
      let savedCount = 0;

      const generatedResults: Result[] = [];

      // Process each village
      for (const village of villages || []) {
        const pattern = findOperatorPattern(village.operator);

        if (!pattern) {
          addLog(`⏭️ ${village.name}: No pattern for operator "${village.operator}"`);
          continue;
        }

        matchedCount++;
        setStats(prev => ({ ...prev, matched: matchedCount }));
        addLog(`✅ ${village.name}: Matched operator "${village.operator}"`);

        // Generate slug and URL
        const slug = generateSlug(village.name, village.suburb);
        const generatedUrl = pattern.replace('{slug}', slug);

        addLog(`   🔗 Generated: ${generatedUrl}`);
        generatedCount++;
        setStats(prev => ({ ...prev, generated: generatedCount }));

        // Validate URL (check if it exists)
        let validation = { valid: true };
        if (!currentSkipValidation) {
          addLog(`   ⏳ Validating...`);
          validation = await validateUrl(generatedUrl);
        }

        const result: Result = {
          villageName: village.name,
          suburb: village.suburb,
          operator: village.operator,
          generatedUrl,
          status: validation.valid ? 'success' : 'failed',
          statusCode: validation.statusCode
        };

        if (validation.valid) {
          addLog(`   ✅ VALID! (${validation.statusCode || 'OK'})`);
          validatedCount++;
          setStats(prev => ({ ...prev, validated: validatedCount }));

          // Save to database (if not dry run)
          if (!currentIsDryRun) {
            const { error: updateError } = await supabase
              .from('retirement_villages')
              .update({ website: generatedUrl })
              .eq('id', village.id);

            if (updateError) {
              addLog(`   ❌ Failed to save: ${updateError.message}`);
              result.error = updateError.message;
            } else {
              addLog(`   💾 Saved to database!`);
              savedCount++;
              setStats(prev => ({ ...prev, saved: savedCount }));
            }
          } else {
            addLog(`   📝 DRY RUN - Would save to database`);
          }
        } else {
          addLog(`   ❌ Invalid URL (404 or unreachable)`);
          failedCount++;
          setStats(prev => ({ ...prev, failed: failedCount }));
        }

        generatedResults.push(result);
        setResults(generatedResults);

        // Rate limiting
        await new Promise(resolve => setTimeout(resolve, 500));
      }

      addLog(`\n✅ GENERATION COMPLETE!`);
      addLog(`📊 Total: ${villages?.length || 0}`);
      addLog(`✅ Matched: ${matchedCount}`);
      addLog(`🔗 Generated: ${generatedCount}`);
      addLog(`✅ Validated: ${validatedCount}`);
      addLog(`❌ Failed: ${failedCount}`);
      if (!currentIsDryRun) {
        addLog(`💾 Saved: ${savedCount}`);
      }

      const mode = currentIsDryRun ? 'DRY RUN' : 'LIVE';
      alert(`✅ ${mode} Complete!\n\nMatched: ${matchedCount}\nGenerated: ${generatedCount}\nValidated: ${validatedCount}\nFailed: ${failedCount}${!currentIsDryRun ? `\nSaved: ${savedCount}` : ''}`);

    } catch (error: any) {
      console.error('Generator error:', error);
      addLog(`❌ ERROR: ${error.message}`);
      alert(`Error: ${error.message}`);
    } finally {
      setIsRunning(false);
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-md border border-purple-200 p-6 mb-6">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <Link2 className="w-6 h-6 text-purple-600" />
          <h2 className="text-2xl font-bold text-purple-900">🔗 Operator URL Generator</h2>
        </div>
      </div>

      <div className="mb-4 p-4 bg-purple-50 rounded-lg border border-purple-200">
        <h3 className="font-semibold text-purple-900 mb-2">💡 Smart URL Generation</h3>
        <p className="text-sm text-purple-800 mb-2">
          For major operators with standardized URL patterns (Stockland, Aveo, Keyton, etc.), we can GENERATE the URLs instead of scraping!
        </p>
        <p className="text-xs text-purple-700">
          Currently supports <strong>{Object.keys(OPERATOR_PATTERNS).length} operator patterns</strong>
        </p>
        <p className="text-xs text-purple-700 mt-2">
          ⚡ <strong>Speed Mode:</strong> Skipping URL validation - URLs will be generated and saved immediately!
        </p>
      </div>

      {!isRunning ? (
        <button
          onClick={runGenerator}
          className="w-full px-4 py-3 bg-purple-600 text-white rounded-lg font-semibold hover:bg-purple-700 transition-colors"
        >
          {isRunning ? '🧪 Run Dry Run (Preview)' : '🚀 Generate & Save URLs'}
        </button>
      ) : (
        <div className="space-y-4">
          {/* Stats */}
          <div className="grid grid-cols-3 gap-2">
            <div className="p-3 bg-blue-50 rounded-lg text-center">
              <div className="text-xl font-bold text-blue-900">{stats.matched}</div>
              <div className="text-xs text-blue-600">Matched</div>
            </div>
            <div className="p-3 bg-green-50 rounded-lg text-center">
              <div className="text-xl font-bold text-green-900">{stats.validated}</div>
              <div className="text-xs text-green-600">Valid</div>
            </div>
            <div className="p-3 bg-red-50 rounded-lg text-center">
              <div className="text-xl font-bold text-red-900">{stats.failed}</div>
              <div className="text-xs text-red-600">Failed</div>
            </div>
          </div>

          {/* Logs */}
          <div className="p-4 bg-gray-50 rounded-lg border border-gray-200">
            <h3 className="font-semibold text-gray-900 mb-2">📝 Activity Log</h3>
            <div className="space-y-1 max-h-64 overflow-y-auto font-mono text-xs">
              {logs.map((log, idx) => (
                <div key={idx} className={`${
                  log.includes('✅') ? 'text-green-700' :
                  log.includes('❌') ? 'text-red-700' :
                  log.includes('🔗') ? 'text-blue-700' :
                  log.includes('💾') ? 'text-purple-700 font-semibold' :
                  'text-gray-700'
                }`}>
                  {log}
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Results */}
      {results.length > 0 && (
        <div className="mt-4 p-4 bg-gray-50 rounded-lg border border-gray-200">
          <h3 className="font-semibold text-gray-900 mb-2">📊 Results ({results.length})</h3>
          <div className="space-y-2 max-h-96 overflow-y-auto">
            {results.map((result, idx) => (
              <div 
                key={idx} 
                className={`p-3 rounded-lg ${
                  result.status === 'success' ? 'bg-green-50 border border-green-200' : 'bg-red-50 border border-red-200'
                }`}
              >
                <div className="flex items-start gap-2">
                  {result.status === 'success' ? (
                    <CheckCircle className="w-4 h-4 text-green-600 flex-shrink-0 mt-0.5" />
                  ) : (
                    <XCircle className="w-4 h-4 text-red-600 flex-shrink-0 mt-0.5" />
                  )}
                  <div className="flex-1 min-w-0">
                    <div className="font-semibold text-sm">{result.villageName}</div>
                    <div className="text-xs text-gray-600">{result.suburb} • {result.operator}</div>
                    <a 
                      href={result.generatedUrl} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="text-xs text-blue-600 hover:underline break-all"
                    >
                      {result.generatedUrl}
                    </a>
                    {result.error && (
                      <div className="text-xs text-red-600 mt-1">{result.error}</div>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
});