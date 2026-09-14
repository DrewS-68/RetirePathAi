import React, { useState, useRef, useEffect } from 'react';
import { Search, CheckCircle, XCircle, AlertCircle, Pause, Play, Download } from 'lucide-react';
import { getSupabaseClient } from '../../utils/supabase/client';
import { projectId, publicAnonKey } from '../../utils/supabase/info';

// Storage key for resilience
const STORAGE_KEY = 'vic_multi_method_scraper_results';

// Track all results for CSV export
interface ScrapeResult {
  id: string;
  name: string;
  suburb: string;
  operator: string | null;
  oldWebsite: string | null;
  newWebsite: string | null;
  method: string | null;
  confidence: number | null;
  status: 'found' | 'failed';
  timestamp: string;
}

/**
 * Multi-Method VIC Website Scraper
 * Tries EVERYTHING to find websites - targeting 80%+ success rate
 * ✅ Saves to Supabase + localStorage (zero data loss)
 * ✅ CSV export for operator/domain review
 */
export const VICMultiMethodScraper = () => {
  const [isRunning, setIsRunning] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [stats, setStats] = useState({
    total: 0,
    processed: 0,
    found: 0,
    failed: 0,
    skipped: 0
  });
  const [currentVillage, setCurrentVillage] = useState<string>('');
  const [recentFinds, setRecentFinds] = useState<any[]>([]);
  const [logs, setLogs] = useState<string[]>([]);
  const [allResults, setAllResults] = useState<ScrapeResult[]>([]);
  
  const shouldStopRef = useRef(false);
  const isPausedRef = useRef(false);
  const statsRef = useRef(stats); // Track latest stats
  
  // Update ref whenever stats change
  useEffect(() => {
    statsRef.current = stats;
  }, [stats]);

  // Load saved results on mount
  useEffect(() => {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        setAllResults(parsed);
        addLog(`📦 Loaded ${parsed.length} saved results from localStorage`);
      } catch (e) {
        console.error('Failed to load saved results:', e);
      }
    }
  }, []);

  // Save results to localStorage whenever they change
  useEffect(() => {
    if (allResults.length > 0) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(allResults));
    }
  }, [allResults]);

  const addLog = (message: string) => {
    const timestamp = new Date().toLocaleTimeString();
    const logMessage = `[${timestamp}] ${message}`;
    console.log(logMessage);
    setLogs(prev => [logMessage, ...prev].slice(0, 100));
  };

  const updateStats = (key: keyof typeof stats, increment: number = 1) => {
    setStats(prev => ({ ...prev, [key]: prev[key] + increment }));
  };

  const sleep = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

  /**
   * Try Method 1: Google Search with ScraperAPI
   */
  const tryGoogleSearch = async (village: any): Promise<string | null> => {
    try {
      addLog(`  Method 1: Google Search - "${village.name} ${village.suburb} VIC retirement village"`);
      
      const searchQuery = `"${village.name}" ${village.suburb} VIC retirement village`;
      const googleUrl = `https://www.google.com/search?q=${encodeURIComponent(searchQuery)}&num=10`;
      
      const response = await fetch(
        `https://${projectId}.supabase.co/functions/v1/make-server-3bba8be8/scrape-google-search`,
        {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${publicAnonKey}`,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            url: googleUrl,
            villageName: village.name,
            suburb: village.suburb,
            operator: village.operator
          })
        }
      );

      if (!response.ok) {
        const errorText = await response.text();
        addLog(`  ❌ Method 1 failed: ${response.status} - ${errorText}`);
        return null;
      }

      const result = await response.json();
      
      if (result.website && result.confidence >= 30) {
        addLog(`  ✅ Method 1 SUCCESS: ${result.website} (confidence: ${result.confidence}%)`);
        return result.website;
      } else {
        addLog(`  ⚠️ Method 1 failed: ${result.message || 'No confident match'}`);
        return null;
      }
    } catch (error: any) {
      addLog(`  ❌ Method 1 error: ${error.message}`);
      return null;
    }
  };

  /**
   * Try Method 2: Operator Site Search
   */
  const tryOperatorSearch = async (village: any): Promise<string | null> => {
    if (!village.operator) {
      addLog(`  ⏭️ Method 2 skipped: No operator`);
      return null;
    }

    try {
      addLog(`  Method 2: Operator Search - "${village.name} site:*.com.au ${village.operator}"`);
      
      const searchQuery = `"${village.name}" site:*.com.au ${village.operator} retirement village`;
      const googleUrl = `https://www.google.com/search?q=${encodeURIComponent(searchQuery)}&num=10`;
      
      const response = await fetch(
        `https://${projectId}.supabase.co/functions/v1/make-server-3bba8be8/scrape-google-search`,
        {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${publicAnonKey}`,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            url: googleUrl,
            villageName: village.name,
            suburb: village.suburb,
            operator: village.operator
          })
        }
      );

      if (!response.ok) {
        addLog(`  ❌ Method 2 failed: ${response.status}`);
        return null;
      }

      const result = await response.json();
      
      if (result.website && result.confidence >= 30) {
        addLog(`  ✅ Method 2 SUCCESS: ${result.website} (confidence: ${result.confidence}%)`);
        return result.website;
      } else {
        addLog(`  ⚠️ Method 2 failed: ${result.message || 'No confident match'}`);
        return null;
      }
    } catch (error: any) {
      addLog(`  ❌ Method 2 error: ${error.message}`);
      return null;
    }
  };

  /**
   * Try Method 3: Simplified Search (just name + suburb)
   */
  const trySimplifiedSearch = async (village: any): Promise<string | null> => {
    try {
      addLog(`  Method 3: Simplified Search - "${village.name} ${village.suburb}"`);
      
      const searchQuery = `"${village.name}" ${village.suburb}`;
      const googleUrl = `https://www.google.com/search?q=${encodeURIComponent(searchQuery)}&num=10`;
      
      const response = await fetch(
        `https://${projectId}.supabase.co/functions/v1/make-server-3bba8be8/scrape-google-search`,
        {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${publicAnonKey}`,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            url: googleUrl,
            villageName: village.name,
            suburb: village.suburb,
            operator: village.operator
          })
        }
      );

      if (!response.ok) {
        addLog(`  ❌ Method 3 failed: ${response.status}`);
        return null;
      }

      const result = await response.json();
      
      if (result.website && result.confidence >= 30) {
        addLog(`  ✅ Method 3 SUCCESS: ${result.website} (confidence: ${result.confidence}%)`);
        return result.website;
      } else {
        addLog(`  ⚠️ Method 3 failed: ${result.message || 'No confident match'}`);
        return null;
      }
    } catch (error: any) {
      addLog(`  ❌ Method 3 error: ${error.message}`);
      return null;
    }
  };

  /**
   * Try Method 4: URL Pattern Guesser (fallback when scraping fails)
   */
  const tryPatternGuesser = async (village: any): Promise<string | null> => {
    try {
      addLog(`  Method 4: Pattern Guesser - trying common URL patterns`);
      
      const response = await fetch(
        `https://${projectId}.supabase.co/functions/v1/make-server-3bba8be8/guess-url-pattern`,
        {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${publicAnonKey}`,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            villageName: village.name,
            suburb: village.suburb,
            operator: village.operator
          })
        }
      );

      if (!response.ok) {
        addLog(`  ❌ Method 4 failed: ${response.status}`);
        return null;
      }

      const result = await response.json();
      
      if (result.success && result.website) {
        addLog(`  ✅ Method 4 SUCCESS: ${result.website} (pattern matching)`);
        return result.website;
      } else {
        addLog(`  ⚠️ Method 4 failed: No valid patterns found`);
        return null;
      }
    } catch (error: any) {
      addLog(`  ❌ Method 4 error: ${error.message}`);
      return null;
    }
  };

  /**
   * Record the result of a scrape attempt
   */
  const recordResult = (village: any, website: string | null, method: string | null, status: 'found' | 'failed') => {
    const result: ScrapeResult = {
      id: village.id,
      name: village.name,
      suburb: village.suburb,
      operator: village.operator,
      oldWebsite: village.website,
      newWebsite: website,
      method: method,
      confidence: null,
      status: status,
      timestamp: new Date().toISOString()
    };
    setAllResults(prev => [...prev, result]);
  };

  /**
   * Main scraping function
   */
  const startScraping = async () => {
    if (!confirm('🚀 Start Multi-Method Scraper?\n\nThis will try MULTIPLE methods for each village until a URL is found.\n\nTarget: 80%+ success rate!')) {
      return;
    }

    setIsRunning(true);
    shouldStopRef.current = false;
    isPausedRef.current = false;
    setStats({ total: 0, processed: 0, found: 0, failed: 0, skipped: 0 });
    setRecentFinds([]);
    setLogs([]);
    setAllResults([]); // Clear previous results
    
    try {
      const supabase = getSupabaseClient();
      
      // Get VIC villages WITHOUT websites
      const { data: villages, error } = await supabase
        .from('retirement_villages')
        .select('id, name, suburb, operator, website')
        .eq('state', 'VIC')
        .is('website', null)
        .order('name');

      if (error) throw error;

      addLog(`🎯 Found ${villages?.length || 0} VIC villages without websites`);
      setStats(prev => ({ ...prev, total: villages?.length || 0 }));

      // Process each village
      for (let i = 0; i < (villages?.length || 0); i++) {
        // Check if stopped
        if (shouldStopRef.current) {
          addLog('🛑 Scraping stopped by user');
          break;
        }

        // Check if paused
        while (isPausedRef.current && !shouldStopRef.current) {
          await sleep(1000);
        }

        const village = villages![i];
        setCurrentVillage(`${village.name} (${village.suburb})`);
        addLog(`\n🔍 [${i + 1}/${villages?.length}] ${village.name} (${village.suburb})`);

        let foundWebsite: string | null = null;

        // Try Method 1: Direct Google Search
        foundWebsite = await tryGoogleSearch(village);
        if (foundWebsite) {
          await saveWebsite(village, foundWebsite, 'Method 1: Google Search');
          updateStats('found');
          updateStats('processed');
          setRecentFinds(prev => [{ ...village, website: foundWebsite, method: 'Method 1' }, ...prev].slice(0, 10));
          await sleep(2000); // Rate limit
          continue;
        }

        await sleep(1000);

        // Try Method 2: Operator Search
        foundWebsite = await tryOperatorSearch(village);
        if (foundWebsite) {
          await saveWebsite(village, foundWebsite, 'Method 2: Operator Search');
          updateStats('found');
          updateStats('processed');
          setRecentFinds(prev => [{ ...village, website: foundWebsite, method: 'Method 2' }, ...prev].slice(0, 10));
          await sleep(2000);
          continue;
        }

        await sleep(1000);

        // Try Method 3: Simplified Search
        foundWebsite = await trySimplifiedSearch(village);
        if (foundWebsite) {
          await saveWebsite(village, foundWebsite, 'Method 3: Simplified Search');
          updateStats('found');
          updateStats('processed');
          setRecentFinds(prev => [{ ...village, website: foundWebsite, method: 'Method 3' }, ...prev].slice(0, 10));
          await sleep(2000);
          continue;
        }

        await sleep(1000);

        // Try Method 4: URL Pattern Guesser
        foundWebsite = await tryPatternGuesser(village);
        if (foundWebsite) {
          await saveWebsite(village, foundWebsite, 'Method 4: Pattern Guesser');
          updateStats('found');
          updateStats('processed');
          setRecentFinds(prev => [{ ...village, website: foundWebsite, method: 'Method 4' }, ...prev].slice(0, 10));
          await sleep(2000);
          continue;
        }

        // All methods failed - record the failure
        addLog(`  ❌ All methods failed - needs manual research`);
        recordResult(village, null, null, 'failed');
        updateStats('failed');
        updateStats('processed');
        await sleep(1000);
      }

      addLog(`\n✅ SCRAPING COMPLETE!`);
      
      // Use statsRef.current to get the latest values (avoids stale closure)
      const finalStats = statsRef.current;
      addLog(`📊 Results: ${finalStats.found} found, ${finalStats.failed} failed, ${finalStats.processed} total processed`);
      
      const successRate = finalStats.total > 0 ? ((finalStats.found / finalStats.total) * 100).toFixed(1) : 0;
      alert(`✅ Scraping Complete!\n\nFound: ${finalStats.found}\nFailed: ${finalStats.failed}\nSuccess Rate: ${successRate}%`);

    } catch (error: any) {
      console.error('Scraping error:', error);
      addLog(`❌ ERROR: ${error.message}`);
      alert(`Error: ${error.message}`);
    } finally {
      setIsRunning(false);
      setCurrentVillage('');
    }
  };

  const saveWebsite = async (village: any, website: string, method: string) => {
    try {
      const supabase = getSupabaseClient();
      const { error } = await supabase
        .from('retirement_villages')
        .update({ website })
        .eq('id', village.id);

      if (error) throw error;
      addLog(`  💾 Saved to database (${method})`);
      recordResult(village, website, method, 'found');
    } catch (error: any) {
      addLog(`  ⚠️ Save error: ${error.message}`);
    }
  };

  const togglePause = () => {
    isPausedRef.current = !isPausedRef.current;
    setIsPaused(isPausedRef.current);
    addLog(isPausedRef.current ? '⏸️ PAUSED' : '▶️ RESUMED');
  };

  const stop = () => {
    if (confirm('Stop scraping?')) {
      shouldStopRef.current = true;
      addLog('🛑 Stopping...');
    }
  };

  const successRate = stats.total > 0 ? ((stats.found / stats.total) * 100).toFixed(1) : 0;

  /**
   * Export results to CSV
   */
  const exportToCSV = () => {
    if (allResults.length === 0) {
      alert('No results to export');
      return;
    }

    // CSV header
    const headers = ['ID', 'Name', 'Suburb', 'Operator', 'Old Website', 'New Website', 'Method', 'Status', 'Timestamp'];
    
    // CSV rows
    const rows = allResults.map(r => [
      r.id,
      r.name,
      r.suburb,
      r.operator || '',
      r.oldWebsite || '',
      r.newWebsite || '',
      r.method || '',
      r.status,
      r.timestamp
    ]);

    // Combine headers and rows
    const csvContent = [
      headers.join(','),
      ...rows.map(row => row.map(cell => `"${cell}"`).join(','))
    ].join('\n');

    // Create download
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    const timestamp = new Date().toISOString().replace(/:/g, '-').split('.')[0];
    
    link.setAttribute('href', url);
    link.setAttribute('download', `vic_scraper_results_${timestamp}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    addLog(`📥 Exported ${allResults.length} results to CSV`);
  };

  /**
   * Extract unique domains from all results for blacklist review
   */
  const getDomainSummary = () => {
    const domains: { [key: string]: number } = {};
    
    allResults.forEach(r => {
      if (r.newWebsite) {
        try {
          const url = new URL(r.newWebsite);
          const domain = url.hostname;
          domains[domain] = (domains[domain] || 0) + 1;
        } catch (e) {
          // Invalid URL
        }
      }
    });

    return Object.entries(domains)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 20); // Top 20 domains
  };

  const domainSummary = allResults.length > 0 ? getDomainSummary() : [];

  return (
    <div className="bg-white rounded-lg shadow-md border border-green-200 p-6 mb-6">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <Search className="w-6 h-6 text-green-600" />
          <h2 className="text-2xl font-bold text-green-900">🚀 Multi-Method VIC Scraper</h2>
        </div>
      </div>

      <div className="mb-4 p-4 bg-green-50 rounded-lg">
        <h3 className="font-semibold text-green-900 mb-2">🎯 Target: 80%+ Success Rate</h3>
        <p className="text-sm text-green-800 mb-2">
          Tries MULTIPLE methods per village until a website is found:
        </p>
        <ul className="text-xs text-green-700 space-y-1 list-disc list-inside">
          <li><strong>Method 1:</strong> Google Search API - "[Name] [Suburb] VIC retirement village"</li>
          <li><strong>Method 2:</strong> Operator Search - "[Name] site:*.com.au [Operator]"</li>
          <li><strong>Method 3:</strong> Simplified Search - "[Name] [Suburb]"</li>
          <li><strong>Method 4:</strong> URL Pattern Guesser - tries common URL patterns (fallback)</li>
          <li>✅ Saves immediately on success (no data loss!)</li>
        </ul>
      </div>

      {!isRunning ? (
        <button
          onClick={startScraping}
          className="w-full px-4 py-3 bg-green-600 text-white rounded-lg font-semibold hover:bg-green-700 transition-colors"
        >
          🚀 Start Multi-Method Scraper
        </button>
      ) : (
        <div className="space-y-4">
          {/* Controls */}
          <div className="flex gap-2">
            <button
              onClick={togglePause}
              className="flex-1 px-4 py-2 bg-yellow-600 text-white rounded-lg font-semibold hover:bg-yellow-700 flex items-center justify-center gap-2"
            >
              {isPaused ? <Play className="w-4 h-4" /> : <Pause className="w-4 h-4" />}
              {isPaused ? 'Resume' : 'Pause'}
            </button>
            <button
              onClick={stop}
              className="flex-1 px-4 py-2 bg-red-600 text-white rounded-lg font-semibold hover:bg-red-700"
            >
              Stop
            </button>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-5 gap-2">
            <div className="p-3 bg-blue-50 rounded-lg text-center">
              <div className="text-xl font-bold text-blue-900">{stats.total}</div>
              <div className="text-xs text-blue-600">Total</div>
            </div>
            <div className="p-3 bg-gray-50 rounded-lg text-center">
              <div className="text-xl font-bold text-gray-900">{stats.processed}</div>
              <div className="text-xs text-gray-600">Processed</div>
            </div>
            <div className="p-3 bg-green-50 rounded-lg text-center">
              <div className="text-xl font-bold text-green-900">{stats.found}</div>
              <div className="text-xs text-green-600">Found ✅</div>
            </div>
            <div className="p-3 bg-red-50 rounded-lg text-center">
              <div className="text-xl font-bold text-red-900">{stats.failed}</div>
              <div className="text-xs text-red-600">Failed ❌</div>
            </div>
            <div className="p-3 bg-purple-50 rounded-lg text-center">
              <div className="text-xl font-bold text-purple-900">{successRate}%</div>
              <div className="text-xs text-purple-600">Success</div>
            </div>
          </div>

          {/* Progress Bar */}
          <div className="p-4 bg-gradient-to-r from-blue-50 to-purple-50 rounded-lg border-2 border-blue-300">
            <div className="flex justify-between items-center mb-2">
              <span className="text-sm font-semibold text-gray-900">
                Progress: {stats.processed} / {stats.total}
              </span>
              <span className="text-sm font-bold text-purple-900">
                {stats.total > 0 ? Math.round((stats.processed / stats.total) * 100) : 0}%
              </span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-6 overflow-hidden shadow-inner">
              <div 
                className="bg-gradient-to-r from-green-500 via-blue-500 to-purple-500 h-6 rounded-full transition-all duration-500 flex items-center justify-end pr-2"
                style={{ width: `${stats.total > 0 ? (stats.processed / stats.total) * 100 : 0}%` }}
              >
                {stats.processed > 0 && (
                  <span className="text-white text-xs font-bold drop-shadow-lg">
                    {stats.total > 0 ? Math.round((stats.processed / stats.total) * 100) : 0}%
                  </span>
                )}
              </div>
            </div>
            <div className="flex justify-between text-xs text-gray-600 mt-2">
              <span>🟢 Found: {stats.found}</span>
              <span>🔴 Failed: {stats.failed}</span>
              <span>📊 Success Rate: {successRate}%</span>
            </div>
          </div>

          {/* Current Village */}
          {currentVillage && (
            <div className="p-3 bg-blue-50 rounded-lg border border-blue-200">
              <div className="text-sm text-blue-600 font-semibold">Currently scraping:</div>
              <div className="text-blue-900 font-medium">{currentVillage}</div>
            </div>
          )}

          {/* Recent Finds */}
          {recentFinds.length > 0 && (
            <div className="p-4 bg-green-50 rounded-lg border border-green-200">
              <h3 className="font-semibold text-green-900 mb-2">✅ Recent Finds ({recentFinds.length})</h3>
              <div className="space-y-2 max-h-48 overflow-y-auto">
                {recentFinds.map((v, idx) => (
                  <div key={idx} className="p-2 bg-white rounded border border-green-100 text-sm">
                    <div className="font-medium text-green-900">{v.name}</div>
                    <div className="text-green-600 text-xs">{v.method}</div>
                    <a href={v.website} target="_blank" rel="noopener noreferrer" className="text-green-500 hover:underline text-xs break-all">
                      {v.website}
                    </a>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Logs */}
          <div className="p-4 bg-gray-50 rounded-lg border border-gray-200">
            <h3 className="font-semibold text-gray-900 mb-2">📝 Logs</h3>
            <div className="space-y-1 max-h-96 overflow-y-auto font-mono text-xs">
              {logs.map((log, idx) => (
                <div key={idx} className={`${
                  log.includes('✅') ? 'text-green-700' :
                  log.includes('❌') ? 'text-red-700' :
                  log.includes('⚠️') ? 'text-yellow-700' :
                  'text-gray-700'
                }`}>
                  {log}
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* CSV Export & Domain Summary - Show after scraping */}
      {!isRunning && allResults.length > 0 && (
        <div className="mt-4 space-y-4">
          <button
            onClick={exportToCSV}
            className="w-full px-4 py-3 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700 transition-colors flex items-center justify-center gap-2"
          >
            <Download className="w-5 h-5" />
            📥 Export Results to CSV ({allResults.length} results)
          </button>

          {/* Domain Summary */}
          {domainSummary.length > 0 && (
            <div className="p-4 bg-blue-50 rounded-lg border border-blue-200">
              <h3 className="font-semibold text-blue-900 mb-2">🌐 Top Domains Found (for blacklist review)</h3>
              <div className="space-y-1 max-h-64 overflow-y-auto">
                {domainSummary.map(([domain, count], idx) => (
                  <div key={idx} className="flex justify-between items-center p-2 bg-white rounded text-sm">
                    <span className="font-mono text-blue-900">{domain}</span>
                    <span className="text-blue-600 font-semibold">{count}</span>
                  </div>
                ))}
              </div>
              <p className="text-xs text-blue-700 mt-2">
                💡 Review these domains - if aggregators like realestate.com.au or yourinvestmentpropertymag.com.au appear, add them to the blacklist!
              </p>
            </div>
          )}

          {/* Results Summary */}
          <div className="p-4 bg-gray-50 rounded-lg border border-gray-200">
            <h3 className="font-semibold text-gray-900 mb-2">📊 Session Summary</h3>
            <div className="grid grid-cols-2 gap-2 text-sm">
              <div className="p-2 bg-white rounded">
                <span className="text-gray-600">Total Processed:</span>
                <span className="ml-2 font-bold text-gray-900">{allResults.length}</span>
              </div>
              <div className="p-2 bg-white rounded">
                <span className="text-gray-600">Success Rate:</span>
                <span className="ml-2 font-bold text-green-900">{successRate}%</span>
              </div>
              <div className="p-2 bg-green-50 rounded">
                <span className="text-green-600">Found:</span>
                <span className="ml-2 font-bold text-green-900">{allResults.filter(r => r.status === 'found').length}</span>
              </div>
              <div className="p-2 bg-red-50 rounded">
                <span className="text-red-600">Failed:</span>
                <span className="ml-2 font-bold text-red-900">{allResults.filter(r => r.status === 'failed').length}</span>
              </div>
            </div>
            <p className="text-xs text-gray-700 mt-2">
              ✅ All results saved to Supabase + localStorage
            </p>
          </div>
        </div>
      )}
    </div>
  );
};