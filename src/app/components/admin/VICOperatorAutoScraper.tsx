import React, { useState, useRef } from 'react';
import { Card } from '../ui/card';
import { Button } from '../ui/button';
import { Progress } from '../ui/progress';
import { Badge } from '../ui/badge';
import { Alert, AlertDescription } from '../ui/alert';
import { Zap, Download, AlertTriangle, CheckCircle, XCircle, Loader2, StopCircle } from 'lucide-react';
import { getSupabaseClient } from '../../utils/supabase/client';
import { projectId, publicAnonKey } from '../../utils/supabase/info';

interface Village {
  id: string;
  name: string;
  operator: string;
  website: string;
  suburb: string;
}

interface ScrapedResult {
  villageId: string;
  villageName: string;
  oldOperator: string;
  newOperator: string | null;
  status: 'success' | 'failed' | 'skipped' | 'no_change';
  extractionMethod?: string; // NEW: Shows how the operator was extracted
  error?: string;
}

export function VICOperatorAutoScraper() {
  const [loading, setLoading] = useState(false);
  const [scraping, setScraping] = useState(false);
  const stopScraping = useRef(false);
  const [villages, setVillages] = useState<Village[]>([]);
  const [results, setResults] = useState<ScrapedResult[]>([]);
  const [progress, setProgress] = useState(0);
  const [currentVillage, setCurrentVillage] = useState<string>('');
  const [missingOperatorOnly, setMissingOperatorOnly] = useState(false); // NEW: Filter state
  const [limitCount, setLimitCount] = useState<number>(5); // NEW: Limit input
  const [operatorWhitelist, setOperatorWhitelist] = useState<string[]>([]); // NEW: Loaded from server
  const [whitelistLoading, setWhitelistLoading] = useState(false);
  const [stats, setStats] = useState({
    total: 0,
    processed: 0,
    success: 0,
    failed: 0,
    skipped: 0,
    noChange: 0,
  });
  const [villageStats, setVillageStats] = useState({ // NEW: Stats about loaded villages
    totalLoaded: 0,
    withOperators: 0,
    missingOperators: 0,
    withWebsites: 0,
    withoutWebsites: 0,
  });

  // Load whitelist on mount
  React.useEffect(() => {
    loadWhitelist();
  }, []);

  const loadWhitelist = async () => {
    setWhitelistLoading(true);
    try {
      const response = await fetch(
        `https://${projectId}.supabase.co/functions/v1/make-server-3bba8be8/vic-operator-whitelist`,
        {
          method: 'GET',
          headers: {
            'Authorization': `Bearer ${publicAnonKey}`
          }
        }
      );

      if (!response.ok) {
        throw new Error('Failed to load whitelist');
      }

      const data = await response.json();
      setOperatorWhitelist(data.operators || []);
      console.log(`✅ Loaded ${data.operators?.length || 0} operators from whitelist`);
    } catch (err) {
      console.error('Error loading whitelist:', err);
      alert('Failed to load operator whitelist. Please upload operators using the Whitelist Importer tool first.');
    } finally {
      setWhitelistLoading(false);
    }
  };

  // Extract operator name from HTML content - Returns [operator, method] or [null, null]
  const extractOperator = (html: string, villageName: string, websiteUrl: string): [string | null, string | null] => {
    // Clean up village name for better matching
    const cleanVillageName = villageName.toLowerCase().replace(/[^a-z0-9\s]/g, '');

    // Use the loaded whitelist instead of hardcoded list
    if (operatorWhitelist.length === 0) {
      console.warn('⚠️ Operator whitelist is empty! Load whitelist first.');
      return [null, null];
    }

    // ===== STEP 1: CHECK VILLAGE NAME FIRST (Most reliable!) =====
    // If the village name contains a known operator, that's almost certainly the real operator
    // Example: "Levande Patterson Lakes" → operator is "Levande"
    for (const operator of operatorWhitelist) {
      const operatorLower = operator.toLowerCase();
      if (cleanVillageName.includes(operatorLower)) {
        console.log(`✅ VILLAGE NAME MATCH: Found "${operator}" in village name "${villageName}"`);
        return [operator, '🎯 Village Name Match'];
      }
    }

    // ===== STEP 2: CHECK URL (Also very reliable) =====
    if (websiteUrl) {
      const urlLower = websiteUrl.toLowerCase();
      
      for (const operator of operatorWhitelist) {
        const operatorLower = operator.toLowerCase().replace(/\s+/g, ''); // Remove spaces for URL matching
        
        // Check if operator name is in the domain
        if (urlLower.includes(operatorLower)) {
          console.log(`✅ URL MATCH: Found "${operator}" in URL ${websiteUrl}`);
          return [operator, '🔗 URL Match'];
        }
      }
    }

    // ===== STEP 3: SCRAPE HTML (Fallback - least reliable) =====
    if (!html) return [null, null];

    // STRATEGY: Only extract if we find a KNOWN operator in a valid context
    // This prevents extracting garbage phrases like "tranquil", "retirement", etc.

    const htmlLower = html.toLowerCase();

    // Check each known operator
    for (const operator of operatorWhitelist) {
      const operatorLower = operator.toLowerCase();
      
      // Skip if operator name is part of the village name (e.g., "Regis Village" village operated by Regis)
      if (cleanVillageName.includes(operatorLower)) {
        continue;
      }

      // Check if operator appears in the HTML
      if (!htmlLower.includes(operatorLower)) {
        continue;
      }

      // Verify it appears in a STRONG context that confirms it's the operator
      const strongContexts = [
        `© ${operatorLower}`,
        `copyright ${operatorLower}`,
        `${operatorLower} pty`,
        `${operatorLower} ltd`,
        `operated by ${operatorLower}`,
        `managed by ${operatorLower}`,
        `owned by ${operatorLower}`,
        `part of ${operatorLower}`,
        `a ${operatorLower} community`,
        `a ${operatorLower} village`,
        `a ${operatorLower} retirement`,
      ];

      // Check if ANY strong context matches
      if (strongContexts.some(context => htmlLower.includes(context))) {
        console.log(`✅ STRONG MATCH: Found "${operator}" in strong context`);
        return [operator, '📄 HTML Strong Context'];
      }

      // ❌ REMOVED: Multiple occurrences check (too aggressive!)
      // Previously: If operator appeared 3+ times, we'd assume it's the real operator
      // Problem: Websites often list OTHER operators in footers/sidebars
      // This caused false positives like "Regis" being applied to non-Regis villages
      
      // const occurrences = (htmlLower.match(new RegExp(operatorLower, 'g')) || []).length;
      // if (occurrences >= 3) {
      //   console.log(`✅ MULTIPLE MATCH: Found "${operator}" ${occurrences} times`);
      //   return [operator, `📄 HTML Multiple (${occurrences}x)`];
      // }
    }

    // FALLBACK: Try very strict copyright pattern (must have proper company suffix)
    const strictCopyrightPattern = /©\s*\d{4}\s+([A-Z][a-zA-Z\s&]+?)\s+(Pty\s+Ltd|Limited|Group|Inc)/;
    const copyrightMatch = html.match(strictCopyrightPattern);
    if (copyrightMatch && copyrightMatch[1]) {
      const operator = copyrightMatch[1].trim();
      // Verify it's not the village name
      if (operator.toLowerCase() !== cleanVillageName && operator.length > 5) {
        // 🆕 VERIFY: Must be in whitelist!
        const isInWhitelist = operatorWhitelist.some(
          whitelistedOp => whitelistedOp.toLowerCase() === operator.toLowerCase()
        );
        if (isInWhitelist) {
          console.log(`✅ COPYRIGHT MATCH: Found \"${operator} ${copyrightMatch[2]}\"`);;
          return [operator, '© Copyright Pattern'];
        } else {
          console.log(`⚠️ Copyright found "${operator}" but NOT in whitelist - skipping`);
        }
      }
    }

    console.log(`❌ NO MATCH: Could not find valid operator for ${villageName}`);
    return [null, null];
  };

  // Load VIC villages
  const loadVillages = async () => {
    setLoading(true);
    try {
      const supabase = getSupabaseClient();
      
      // Load ALL VIC villages (not just ones with websites)
      const { data: allVillages, error } = await supabase
        .from('retirement_villages')
        .select('id, name, operator, website, suburb')
        .eq('state', 'VIC')
        .order('name');

      if (error) throw error;

      // Separate villages with valid websites vs without
      const withValidWebsites = (allVillages || []).filter(v => {
        if (!v.website || v.website.trim() === '') return false;
        const url = v.website.toLowerCase();
        // Skip listing sites
        if (url.includes('agedcareguide.com.au') || 
            url.includes('retirementliving.org.au') ||
            url.includes('australianageingagenda.com.au')) {
          return false;
        }
        return true;
      });

      const withoutWebsites = (allVillages || []).filter(v => {
        if (!v.website || v.website.trim() === '') return true;
        const url = v.website.toLowerCase();
        // Include listing sites in "without websites"
        if (url.includes('agedcareguide.com.au') || 
            url.includes('retirementliving.org.au') ||
            url.includes('australianageingagenda.com.au')) {
          return true;
        }
        return false;
      });

      // Calculate stats
      const totalVillages = allVillages?.length || 0;
      const withWebsites = withValidWebsites.length;
      const withoutWebsitesCount = withoutWebsites.length;
      const withOperators = withValidWebsites.filter(v => v.operator && v.operator.trim() !== '').length;
      const missingOperators = withValidWebsites.length - withOperators;

      // Store only villages with valid websites for scraping
      setVillages(withValidWebsites);
      setVillageStats({
        totalLoaded: totalVillages,
        withOperators,
        missingOperators,
        withWebsites,
        withoutWebsites: withoutWebsitesCount,
      });
      setStats(prev => ({ ...prev, total: withValidWebsites.length }));
      
      alert(`✅ Loaded ${totalVillages} VIC villages:\n\n` +
            `📊 BREAKDOWN:\n` +
            `• ${withWebsites} villages WITH valid websites\n` +
            `• ${withoutWebsitesCount} villages WITHOUT websites (can't scrape)\n\n` +
            `🎯 SCRAPEABLE VILLAGES:\n` +
            `• ${withOperators} already have operators\n` +
            `• ${missingOperators} MISSING operators (ready to scrape!)\n\n` +
            `Use the "Missing Operator Only" button to scrape the ${missingOperators} missing!`);
    } catch (err) {
      console.error('Error loading villages:', err);
      alert(`Error: ${err instanceof Error ? err.message : 'Failed to load villages'}`);
    } finally {
      setLoading(false);
    }
  };

  // Scrape all villages (or only missing operators)
  const startScraping = async (missingOnly: boolean = false) => {
    if (villages.length === 0) {
      alert('Please load villages first!');
      return;
    }

    // Filter villages based on mode
    const villagesToScrape = missingOnly 
      ? villages.filter(v => !v.operator || v.operator.trim() === '')
      : villages;

    if (villagesToScrape.length === 0) {
      alert('No villages to scrape with the current filter!');
      return;
    }

    const skipCount = villages.length - villagesToScrape.length;

    const confirmMessage = missingOnly
      ? `🎯 MISSING OPERATOR MODE\n\n` +
        `This will:\n` +
        `• Scrape ${villagesToScrape.length} villages MISSING operators\n` +
        `• Skip ${skipCount} villages that already have operators\n` +
        `• Extract real operator names\n` +
        `• Auto-update the database\n\n` +
        `Estimated time: ${Math.ceil(villagesToScrape.length * 3 / 60)} minutes\n\n` +
        `Continue?`
      : `⚡ AUTO OPERATOR SCRAPER\n\n` +
        `This will:\n` +
        `• Scrape ${villagesToScrape.length} village websites\n` +
        `• Extract real operator names\n` +
        `• Auto-update the database\n\n` +
        `Estimated time: ${Math.ceil(villagesToScrape.length * 3 / 60)} minutes\n\n` +
        `Continue?`;

    if (!confirm(confirmMessage)) {
      return;
    }

    stopScraping.current = false; // Reset stop flag
    setScraping(true);
    setMissingOperatorOnly(missingOnly);
    setResults([]);
    setProgress(0);
    setStats({ 
      total: villagesToScrape.length, 
      processed: 0, 
      success: 0, 
      failed: 0, 
      skipped: skipCount,  // Count skipped villages
      noChange: 0 
    });

    const newResults: ScrapedResult[] = [];
    const supabase = getSupabaseClient();

    for (let i = 0; i < villagesToScrape.length; i++) {
      const village = villagesToScrape[i];
      setCurrentVillage(`${village.name} (${village.suburb})`);
      setProgress(Math.round(((i + 1) / villagesToScrape.length) * 100));

      try {
        // Scrape the website
        const scrapeResponse = await fetch(
          `https://${projectId}.supabase.co/functions/v1/make-server-3bba8be8/scrape-website`,
          {
            method: 'POST',
            headers: {
              'Authorization': `Bearer ${publicAnonKey}`,
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({ url: village.website }),
          }
        );

        if (!scrapeResponse.ok) {
          throw new Error(`Scraping failed: ${scrapeResponse.status}`);
        }

        const scrapeData = await scrapeResponse.json();
        const html = scrapeData.html || '';

        // Extract operator
        const [extractedOperator, extractionMethod] = extractOperator(html, village.name, village.website);

        if (!extractedOperator) {
          newResults.push({
            villageId: village.id,
            villageName: village.name,
            oldOperator: village.operator,
            newOperator: null,
            status: 'failed',
            error: 'Could not extract operator name',
          });
          setStats(prev => ({ ...prev, processed: prev.processed + 1, failed: prev.failed + 1 }));
          continue;
        }

        // Check if operator actually changed
        if (extractedOperator === village.operator) {
          newResults.push({
            villageId: village.id,
            villageName: village.name,
            oldOperator: village.operator,
            newOperator: extractedOperator,
            status: 'no_change',
          });
          setStats(prev => ({ ...prev, processed: prev.processed + 1, noChange: prev.noChange + 1 }));
          continue;
        }

        // Update database
        const updateResponse = await fetch(
          `https://${projectId}.supabase.co/functions/v1/make-server-3bba8be8/admin/vic-operators/update-operator`,
          {
            method: 'POST',
            headers: {
              'Authorization': `Bearer ${publicAnonKey}`,
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({ 
              villageId: village.id, 
              operator: extractedOperator 
            }),
          }
        );

        if (!updateResponse.ok) {
          const errorData = await updateResponse.json();
          throw new Error(errorData.error || `Update failed: ${updateResponse.status}`);
        }

        const updateData = await updateResponse.json();
        if (!updateData.success) {
          throw new Error('Update failed - server returned success: false');
        }

        newResults.push({
          villageId: village.id,
          villageName: village.name,
          oldOperator: village.operator,
          newOperator: extractedOperator,
          status: 'success',
          extractionMethod,
        });

        setStats(prev => ({ ...prev, processed: prev.processed + 1, success: prev.success + 1 }));

      } catch (err) {
        console.error(`Error scraping ${village.name}:`, err);
        newResults.push({
          villageId: village.id,
          villageName: village.name,
          oldOperator: village.operator,
          newOperator: null,
          status: 'failed',
          error: err instanceof Error ? err.message : 'Unknown error',
        });
        setStats(prev => ({ ...prev, processed: prev.processed + 1, failed: prev.failed + 1 }));
      }

      setResults([...newResults]);

      // Rate limiting - wait 3 seconds between requests
      if (i < villagesToScrape.length - 1) {
        await new Promise(resolve => setTimeout(resolve, 3000));
      }

      // Check if scraping should be stopped
      if (stopScraping.current) {
        setScraping(false);
        setCurrentVillage('');
        alert('✅ Scraping stopped! Check the results below.');
        return;
      }
    }

    setScraping(false);
    setCurrentVillage('');
    
    // 💾 SAVE RESULTS TO LOCALSTORAGE for export/merge tools
    if (newResults.length > 0) {
      const scrapeData = {
        timestamp: new Date().toISOString(),
        results: newResults.map(r => ({
          village: r.villageName,
          operator: r.newOperator || 'NULL',
          website: villagesToScrape.find(v => v.id === r.villageId)?.website || null,
          status: r.status
        }))
      };
      localStorage.setItem('vic_scrape_results', JSON.stringify(scrapeData));
      console.log(`💾 Saved ${newResults.length} results to localStorage (key: vic_scrape_results)`);
    }
    
    alert('✅ Scraping complete! Check the results below.');
    
    // Scroll to results after a short delay
    setTimeout(() => {
      const resultsSection = document.getElementById('scraping-results-section');
      if (resultsSection) {
        resultsSection.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }
    }, 300);
  };

  // Download results as CSV
  const downloadResults = () => {
    if (results.length === 0) return;

    const csv = [
      ['Village ID', 'Village Name', 'Old Operator', 'New Operator', 'Status', 'Extraction Method', 'Error'],
      ...results.map(r => [
        r.villageId,
        r.villageName,
        r.oldOperator,
        r.newOperator || '',
        r.status,
        r.extractionMethod || '',
        r.error || '',
      ]),
    ].map(row => row.join(',')).join('\n');

    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `vic-operator-scraping-results-${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  // Clear localStorage results
  const clearStoredResults = () => {
    if (confirm('⚠️ Clear stored scraping results from localStorage?\n\nThis will remove the data used by the CSV Export and Merge tools.')) {
      localStorage.removeItem('vic_scrape_results');
      console.log('🧹 Cleared vic_scrape_results from localStorage');
      alert('✅ Cleared stored results!');
    }
  };

  return (
    <Card className="p-6 bg-gradient-to-r from-purple-50 to-pink-50 border-2 border-purple-400">
      <h2 className="text-2xl font-bold mb-2 text-purple-900 flex items-center gap-2">
        <Zap className="size-6" />
        ⚡ Auto Operator Scraper
      </h2>
      <p className="text-sm text-purple-700 mb-4">
        Automatically extract real operator names from village websites and update the database
      </p>

      <Alert className="mb-4 bg-yellow-50 border-yellow-400">
        <AlertTriangle className="size-4" />
        <AlertDescription>
          <strong>How it works:</strong>
          <ol className="list-decimal ml-4 mt-2 space-y-1 text-sm">
            <li>Loads all VIC villages with valid website URLs</li>
            <li>Visits each website and scrapes the HTML</li>
            <li>Extracts operator name from copyright notices, footers, and "About" sections</li>
            <li><strong>ONLY assigns operators from the whitelist</strong> (prevents false positives!)</li>
            <li>Automatically updates the database with correct operators</li>
            <li>Takes ~3 seconds per village (3 minutes per 60 villages)</li>
          </ol>
        </AlertDescription>
      </Alert>

      {/* Whitelist Status */}
      <Alert className="mb-4 bg-indigo-50 border-indigo-400">
        <AlertDescription className="flex items-center justify-between">
          <div>
            <strong>📋 Operator Whitelist:</strong>
            {whitelistLoading ? (
              <span className="ml-2">Loading...</span>
            ) : operatorWhitelist.length > 0 ? (
              <span className="ml-2 text-green-700 font-semibold">
                ✅ {operatorWhitelist.length} operators loaded
              </span>
            ) : (
              <span className="ml-2 text-red-700 font-semibold">
                ❌ No whitelist! Upload operators first using "VIC Operators Whitelist Importer"
              </span>
            )}
          </div>
          <Button
            size="sm"
            variant="outline"
            onClick={loadWhitelist}
            disabled={whitelistLoading}
            className="border-indigo-300"
          >
            <Loader2 className={`size-4 mr-2 ${whitelistLoading ? 'animate-spin' : ''}`} />
            Reload Whitelist
          </Button>
        </AlertDescription>
      </Alert>

      <div className="space-y-4">
        {/* Step 1: Load Villages */}
        <div>
          <Button
            onClick={loadVillages}
            disabled={loading || scraping}
            className="bg-purple-600 hover:bg-purple-700"
          >
            {loading ? (
              <>
                <Loader2 className="size-4 mr-2 animate-spin" />
                Loading Villages...
              </>
            ) : (
              <>
                <Download className="size-4 mr-2" />
                Step 1: Load VIC Villages
              </>
            )}
          </Button>
          {villages.length > 0 && (
            <Badge className="ml-3 bg-green-600">
              ✓ {villages.length} villages loaded
            </Badge>
          )}
        </div>

        {/* Village Stats Card */}
        {villages.length > 0 && !scraping && (
          <Card className="p-4 bg-white border-2 border-purple-200">
            <h3 className="text-lg font-bold mb-3 text-purple-900">📊 VIC Village Breakdown</h3>
            <div className="grid grid-cols-5 gap-3">
              <div className="text-center p-3 bg-blue-50 rounded border border-blue-200">
                <div className="text-2xl font-bold text-blue-700">{villageStats.totalLoaded}</div>
                <div className="text-xs text-blue-600">Total VIC Villages</div>
              </div>
              <div className="text-center p-3 bg-green-50 rounded border border-green-200">
                <div className="text-2xl font-bold text-green-700">{villageStats.withWebsites}</div>
                <div className="text-xs text-green-600">With Websites</div>
              </div>
              <div className="text-center p-3 bg-gray-50 rounded border border-gray-200">
                <div className="text-2xl font-bold text-gray-700">{villageStats.withoutWebsites}</div>
                <div className="text-xs text-gray-600">No Website</div>
              </div>
              <div className="text-center p-3 bg-purple-50 rounded border border-purple-200">
                <div className="text-2xl font-bold text-purple-700">{villageStats.withOperators}</div>
                <div className="text-xs text-purple-600">Has Operators</div>
              </div>
              <div className="text-center p-3 bg-orange-50 rounded border border-orange-200">
                <div className="text-2xl font-bold text-orange-700">{villageStats.missingOperators}</div>
                <div className="text-xs text-orange-600">Missing Operators</div>
              </div>
            </div>
          </Card>
        )}

        {/* Step 2: Scraping Buttons */}
        {villages.length > 0 && !scraping && (
          <>
            <div className="bg-gradient-to-r from-purple-100 to-pink-100 p-4 rounded-lg border-2 border-purple-300">
              <h3 className="text-lg font-bold mb-2 text-purple-900">🎯 Recommended: Missing Operator Only</h3>
              <p className="text-sm text-purple-700 mb-3">
                Scrape ONLY the {villageStats.missingOperators} villages missing operators. Skip the {villageStats.withOperators} that already have correct data.
              </p>
              <Button
                onClick={() => startScraping(true)}
                disabled={scraping || villageStats.missingOperators === 0}
                className="bg-purple-600 hover:bg-purple-700 text-white font-semibold"
              >
                <Zap className="size-4 mr-2" />
                🎯 Scrape Missing Operators Only ({villageStats.missingOperators} villages)
              </Button>
              <span className="ml-3 text-sm text-purple-600 font-semibold">
                ⚡ Est. time: {Math.ceil(villageStats.missingOperators * 3 / 60)} minutes
              </span>
            </div>

            <div className="bg-gray-100 p-4 rounded-lg border border-gray-300">
              <h3 className="text-lg font-bold mb-2 text-gray-800">⚙️ Alternative: Scrape All Villages</h3>
              <p className="text-sm text-gray-600 mb-3">
                Scrape ALL {villageStats.withWebsites} villages with websites (including {villageStats.withOperators} that already have operators). Less efficient.
              </p>
              <Button
                onClick={() => startScraping(false)}
                disabled={scraping}
                className="bg-gray-600 hover:bg-gray-700"
              >
                <Zap className="size-4 mr-2" />
                Scrape All Villages ({villageStats.withWebsites} villages)
              </Button>
              <span className="ml-3 text-sm text-gray-600">
                Est. time: {Math.ceil(villageStats.withWebsites * 3 / 60)} minutes
              </span>
            </div>
          </>
        )}

        {/* STOP BUTTON - Shows when scraping */}
        {scraping && (
          <div className="flex gap-3">
            <Button
              onClick={() => {
                stopScraping.current = true;
                alert('🛑 Stopping scraper after current village completes...');
              }}
              className="bg-red-600 hover:bg-red-700 text-white"
            >
              <StopCircle className="size-4 mr-2" />
              🛑 STOP SCRAPING
            </Button>
            <span className="text-sm text-red-600 font-semibold self-center">
              Click to stop after current village finishes
            </span>
          </div>
        )}

        {/* Progress */}
        {scraping && (
          <Card className="p-4 bg-white">
            <div className="space-y-3">
              <div className="flex justify-between text-sm">
                <span className="font-semibold">Progress: {stats.processed} / {stats.total}</span>
                <span>{progress}%</span>
              </div>
              <Progress value={progress} className="h-3" />
              <p className="text-sm text-gray-600">
                Currently scraping: <strong>{currentVillage}</strong>
              </p>
              <div className="flex gap-4 text-sm">
                <Badge className="bg-green-600">✓ {stats.success} Success</Badge>
                <Badge className="bg-blue-600">→ {stats.noChange} No Change</Badge>
                <Badge className="bg-red-600">✗ {stats.failed} Failed</Badge>
              </div>
            </div>
          </Card>
        )}

        {/* Results Summary */}
        {results.length > 0 && !scraping && (
          <div className="mt-8 pt-8 border-t-4 border-purple-400" id="scraping-results-section">
            <Card className="p-4 bg-white shadow-xl">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-xl font-bold text-purple-900 flex items-center gap-2">
                  📊 Scraping Results
                  <Badge className="bg-purple-600 text-lg px-3 py-1">
                    {stats.processed} villages processed
                  </Badge>
                </h3>
                <div className="flex gap-2">
                  <Button
                    size="sm"
                    onClick={downloadResults}
                    className="bg-green-600 hover:bg-green-700 text-white font-semibold"
                  >
                    <Download className="size-4 mr-2" />
                    Download CSV Report
                  </Button>
                  <Button
                    size="sm"
                    onClick={clearStoredResults}
                    variant="outline"
                    className="border-red-300 text-red-700 hover:bg-red-50"
                  >
                    <XCircle className="size-4 mr-2" />
                    Clear Stored Results
                  </Button>
                </div>
              </div>

              <div className="grid grid-cols-4 gap-4 mb-4">
                <div className="text-center p-3 bg-green-50 rounded border border-green-200">
                  <div className="text-2xl font-bold text-green-700">{stats.success}</div>
                  <div className="text-xs text-green-600">Updated</div>
                </div>
                <div className="text-center p-3 bg-blue-50 rounded border border-blue-200">
                  <div className="text-2xl font-bold text-blue-700">{stats.noChange}</div>
                  <div className="text-xs text-blue-600">No Change</div>
                </div>
                <div className="text-center p-3 bg-red-50 rounded border border-red-200">
                  <div className="text-2xl font-bold text-red-700">{stats.failed}</div>
                  <div className="text-xs text-red-600">Failed</div>
                </div>
                <div className="text-center p-3 bg-gray-50 rounded border border-gray-200">
                  <div className="text-2xl font-bold text-gray-700">{stats.total}</div>
                  <div className="text-xs text-gray-600">Total</div>
                </div>
              </div>

              {/* Results Table */}
              <div className="max-h-[400px] overflow-y-auto border rounded">
                <table className="w-full text-sm">
                  <thead className="bg-gray-100 sticky top-0">
                    <tr>
                      <th className="p-2 text-left">Village</th>
                      <th className="p-2 text-left">Old Operator</th>
                      <th className="p-2 text-left">New Operator</th>
                      <th className="p-2 text-left">Method</th>
                      <th className="p-2 text-center">Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {results.map((result, idx) => (
                      <tr key={idx} className="border-t hover:bg-gray-50">
                        <td className="p-2">{result.villageName}</td>
                        <td className="p-2 text-gray-600">{result.oldOperator || '-'}</td>
                        <td className="p-2 font-semibold text-green-700">
                          {result.newOperator || '-'}
                        </td>
                        <td className="p-2 text-xs text-purple-600">
                          {result.extractionMethod || (result.error ? '❌ Failed' : '-')}
                        </td>
                        <td className="p-2 text-center">
                          {result.status === 'success' && (
                            <Badge className="bg-green-600">
                              <CheckCircle className="size-3 mr-1" />
                              Updated
                            </Badge>
                          )}
                          {result.status === 'no_change' && (
                            <Badge className="bg-blue-600">No Change</Badge>
                          )}
                          {result.status === 'failed' && (
                            <Badge className="bg-red-600">
                              <XCircle className="size-3 mr-1" />
                              Failed
                            </Badge>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </Card>
          </div>
        )}
      </div>
    </Card>
  );
}