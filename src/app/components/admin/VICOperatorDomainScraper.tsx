import { useState } from 'react';
import { createClient } from '@supabase/supabase-js';
import { projectId, publicAnonKey } from '../../utils/supabase/info';

const supabase = createClient(
  `https://${projectId}.supabase.co`,
  publicAnonKey
);

interface OperatorDomain {
  operator: string;
  domain: string;
}

interface ScrapeResult {
  id: string;
  name: string;
  operator: string;
  operatorDomain: string;
  currentWebsite: string | null;
  foundUrl: string;
  finalUrl: string;
  overwriteProtected: boolean;
  status: 'updated' | 'not_found' | 'invalid' | 'protected' | 'unchanged' | 'error';
  error?: string;
}

interface Summary {
  total: number;
  updated: number;
  notFound: number;
  invalid: number;
  protected: number;
  unchanged: number;
  errors: number;
}

/**
 * VIC Operator Domain Scraper
 * Uses verified operator domains from CSV to find village websites
 * Implements the village-search-logic.md workflow
 */
export const VICOperatorDomainScraper = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [shouldStop, setShouldStop] = useState(false);
  const [operators, setOperators] = useState<OperatorDomain[]>([]);
  const [results, setResults] = useState<ScrapeResult[]>([]);
  const [summary, setSummary] = useState<Summary | null>(null);
  const [progress, setProgress] = useState<{ current: number; total: number } | null>(null);
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [maxVillages, setMaxVillages] = useState<number>(20); // Default to 20 for testing
  const [operatorFilter, setOperatorFilter] = useState<string>('all'); // New: filter by operator
  const [availableOperators, setAvailableOperators] = useState<string[]>([]);

  const loadOperators = async () => {
    setIsLoading(true);
    try {
      const response = await fetch(
        `https://${projectId}.supabase.co/functions/v1/make-server-3bba8be8/vic-operator-domain-scraper`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${publicAnonKey}`
          },
          body: JSON.stringify({ action: 'load-operators' })
        }
      );

      if (!response.ok) {
        throw new Error(`Failed to load operators: ${response.statusText}`);
      }

      const data = await response.json();
      
      if (data.success) {
        setOperators(data.operators);
        console.log(`✅ Loaded ${data.totalOperators} operators`);
        console.log(`   With domains: ${data.operatorsWithDomains}`);
        console.log(`   Without domains: ${data.operatorsWithoutDomains}`);
        
        // Set available operators for filtering
        const operatorNames = data.operators.map(o => o.operator);
        setAvailableOperators(operatorNames);
      } else {
        throw new Error(data.error || 'Failed to load operators');
      }
    } catch (error: any) {
      console.error('Error loading operators:', error);
      alert(`Error: ${error.message}`);
    } finally {
      setIsLoading(false);
    }
  };

  const runScraper = async () => {
    console.log('🚀 runScraper function called');
    console.log('📊 Current maxVillages setting:', maxVillages);
    
    const villageCount = maxVillages > 0 ? maxVillages : 'ALL';
    
    try {
      const confirmed = confirm(
        `🚀 Start VIC Operator Domain Scraper?\n\n` +
        `Processing: ${villageCount} villages\n\n` +
        `This will:\n` +
        `1. Look up operator domains from CSV\n` +
        `2. Search within operator domains only\n` +
        `3. Update villages with validated URLs\n` +
        `4. Protect existing good URLs\n\n` +
        `You can pause or stop at any time.\n\n` +
        `Continue?`
      );
      
      console.log('✅ User confirmed:', confirmed);
      
      if (!confirmed) {
        console.log('❌ User cancelled scraping');
        return;
      }
    } catch (confirmError) {
      console.error('❌ Error showing confirmation dialog:', confirmError);
      alert('Error showing confirmation dialog. Check console for details.');
      return;
    }

    console.log('🔄 Setting loading state...');
    setIsLoading(true);
    setIsPaused(false);
    setShouldStop(false);
    setResults([]);
    setSummary(null);
    setProgress(null);
    console.log('✅ Loading state set, starting scraper...');

    try {
      // Fetch VIC villages
      console.log('📊 Fetching VIC villages from Supabase...');
      let query = supabase
        .from('retirement_villages')
        .select('id, name, operator, website')
        .eq('state', 'VIC')
        .order('name');
      
      // Filter by operator if selected
      if (operatorFilter !== 'all') {
        console.log(`🎯 Filtering by operator: ${operatorFilter}`);
        query = query.eq('operator', operatorFilter);
      }
      
      // Limit if maxVillages is set
      if (maxVillages > 0) {
        console.log(`🎯 Limiting query to ${maxVillages} villages`);
        query = query.limit(maxVillages);
      }
      
      const { data: villages, error } = await query;

      if (error) {
        console.error('❌ Supabase query error:', error);
        throw error;
      }

      if (!villages || villages.length === 0) {
        console.warn('⚠️ No VIC villages found in database');
        alert('No VIC villages found in database');
        return;
      }

      const totalToProcess = villages.length;
      console.log(`📊 Found ${totalToProcess} VIC villages to process`);
      console.log(`🎯 Limit setting: ${maxVillages > 0 ? maxVillages : 'none'}`);
      setProgress({ current: 0, total: totalToProcess });
      console.log('✅ Progress state initialized');

      // Process in batches of 1 to avoid Edge Function worker limits
      // Each village can trigger 2-3 API calls, processing one at a time prevents compute resource exhaustion
      const batchSize = 1;
      const allResults: ScrapeResult[] = [];

      for (let i = 0; i < totalToProcess; i += batchSize) {
        // Check if user requested stop
        if (shouldStop) {
          console.log('⏹️ Scraping stopped by user');
          break;
        }
        
        // Check if user requested pause
        if (isPaused) {
          console.log('⏸️ Scraping paused - waiting for resume...');
          // Wait for resume or stop
          while (isPaused && !shouldStop) {
            await new Promise(resolve => setTimeout(resolve, 500));
          }
          
          if (shouldStop) {
            console.log('⏹️ Scraping stopped during pause');
            break;
          }
          
          console.log('▶️ Scraping resumed');
        }
        
        const batch = villages.slice(i, i + batchSize);
        const batchNum = Math.floor(i / batchSize) + 1;
        const totalBatches = Math.ceil(totalToProcess / batchSize);
        
        console.log(`\n📦 Processing batch ${batchNum}/${totalBatches} (villages ${i + 1}-${Math.min(i + batchSize, totalToProcess)})`);
        
        const url = `https://${projectId}.supabase.co/functions/v1/make-server-3bba8be8/vic-operator-domain-scraper`;
        console.log(`🌐 Calling server endpoint: ${url}`);
        
        const response = await fetch(url, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${publicAnonKey}`
          },
          body: JSON.stringify({
            action: 'scrape-batch',
            villages: batch.map(v => ({
              id: v.id,
              name: v.name,
              operator: v.operator,
              currentWebsite: v.website
            }))
          })
        });

        console.log(`📡 Server response status: ${response.status} ${response.statusText}`);

        if (!response.ok) {
          const errorText = await response.text();
          console.error(`❌ Batch ${batchNum} failed:`, errorText);
          throw new Error(`Batch ${batchNum} failed: ${response.statusText} - ${errorText}`);
        }

        const data = await response.json();
        console.log(`✅ Batch ${batchNum} completed:`, data);
        
        if (data.success) {
          allResults.push(...data.results);
          setResults([...allResults]);
          setProgress({ current: Math.min(i + batchSize, totalToProcess), total: totalToProcess });
          
          // Calculate interim summary
          const interimSummary: Summary = {
            total: allResults.length,
            updated: allResults.filter(r => r.status === 'updated').length,
            notFound: allResults.filter(r => r.status === 'not_found').length,
            invalid: allResults.filter(r => r.status === 'invalid').length,
            protected: allResults.filter(r => r.status === 'protected').length,
            unchanged: allResults.filter(r => r.status === 'unchanged').length,
            errors: allResults.filter(r => r.status === 'error').length
          };
          setSummary(interimSummary);
          console.log(`📊 Interim summary:`, interimSummary);
        } else {
          console.error(`❌ Batch processing failed:`, data);
          throw new Error(data.error || 'Batch processing failed');
        }

        // Small delay between batches to avoid rate limits
        if (i + batchSize < totalToProcess && !shouldStop && !isPaused) {
          console.log('⏳ Waiting 2 seconds before next village...');
          await new Promise(resolve => setTimeout(resolve, 2000));
        }
      }

      // Calculate final summary
      const finalSummary: Summary = {
        total: allResults.length,
        updated: allResults.filter(r => r.status === 'updated').length,
        notFound: allResults.filter(r => r.status === 'not_found').length,
        invalid: allResults.filter(r => r.status === 'invalid').length,
        protected: allResults.filter(r => r.status === 'protected').length,
        unchanged: allResults.filter(r => r.status === 'unchanged').length,
        errors: allResults.filter(r => r.status === 'error').length
      };

      setSummary(finalSummary);
      setProgress(null);

      const statusMsg = shouldStop ? '⏹️ SCRAPING STOPPED' : '✅ SCRAPING COMPLETE!';
      console.log(`\n${statusMsg}`);
      console.log(`   Total: ${finalSummary.total}`);
      console.log(`   ✅ Updated: ${finalSummary.updated}`);
      console.log(`   ❌ Not found: ${finalSummary.notFound}`);
      console.log(`   ⚠️ Invalid: ${finalSummary.invalid}`);
      console.log(`   🛡️ Protected: ${finalSummary.protected}`);
      console.log(`   ➖ Unchanged: ${finalSummary.unchanged}`);
      console.log(`   🐛 Errors: ${finalSummary.errors}`);

    } catch (error: any) {
      console.error('💥 ERROR in runScraper:', error);
      console.error('Error details:', {
        message: error.message,
        stack: error.stack,
        name: error.name
      });
      alert(`Error: ${error.message}\n\nCheck console for full details.`);
    } finally {
      console.log('🏁 Finally block - cleaning up...');
      setIsLoading(false);
      setIsPaused(false);
      setShouldStop(false);
      console.log('✅ Cleanup complete');
    }
  };

  const handlePause = () => {
    setIsPaused(true);
    console.log('⏸️ Pause requested - will pause after current batch completes');
  };

  const handleResume = () => {
    setIsPaused(false);
    console.log('▶️ Resume requested');
  };

  const handleStop = () => {
    if (confirm('⏹️ Stop scraping?\n\nProgress will be saved, but remaining villages will not be processed.\n\nContinue?')) {
      setShouldStop(true);
      setIsPaused(false);
      console.log('⏹️ Stop requested - will stop after current batch completes');
    }
  };

  const downloadResultsCSV = () => {
    if (results.length === 0) {
      alert('No results to download');
      return;
    }

    // Create CSV content
    const headers = [
      'ID',
      'Village Name',
      'Operator',
      'Operator Domain',
      'Current Website',
      'Found URL',
      'Final URL',
      'Status',
      'Overwrite Protected',
      'Operator Corrected',
      'Original Operator',
      'Error'
    ];

    const rows = results.map(r => [
      r.id,
      r.name,
      r.operator,
      r.operatorDomain,
      r.currentWebsite || '',
      r.foundUrl || '',
      r.finalUrl || '',
      r.status,
      r.overwriteProtected ? 'Yes' : 'No',
      (r as any).operatorCorrected ? 'Yes' : 'No',
      (r as any).originalOperator || '',
      r.error || ''
    ]);

    const csvContent = [
      headers.join(','),
      ...rows.map(row => row.map(cell => {
        // Escape cells containing commas, quotes, or newlines
        const cellStr = String(cell);
        if (cellStr.includes(',') || cellStr.includes('"') || cellStr.includes('\n')) {
          return `"${cellStr.replace(/"/g, '""')}"`;
        }
        return cellStr;
      }).join(','))
    ].join('\n');

    // Create download
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    
    const timestamp = new Date().toISOString().slice(0, 19).replace(/:/g, '-');
    link.setAttribute('href', url);
    link.setAttribute('download', `vic-scraper-results-${timestamp}.csv`);
    link.style.visibility = 'hidden';
    
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    console.log(`📥 Downloaded ${results.length} results to CSV`);
  };

  const loadAllVICVillages = async () => {
    setIsLoading(true);
    try {
      console.log('📊 Loading ALL VIC village data from database (ignoring limits)...');
      
      const { data: villages, error } = await supabase
        .from('retirement_villages')
        .select('id, name, operator, website')
        .eq('state', 'VIC')
        .order('name');
      
      if (error) throw error;
      
      // Convert to results format for display
      const loadedResults: ScrapeResult[] = villages.map(v => ({
        id: v.id,
        name: v.name,
        operator: v.operator || 'No operator',
        operatorDomain: '',
        currentWebsite: v.website,
        foundUrl: v.website || 'No website',
        finalUrl: v.website || 'No website',
        overwriteProtected: false,
        status: v.website ? 'unchanged' : 'not_found'
      }));
      
      setResults(loadedResults);
      
      const summary: Summary = {
        total: loadedResults.length,
        updated: 0,
        notFound: loadedResults.filter(r => !r.currentWebsite).length,
        invalid: 0,
        protected: 0,
        unchanged: loadedResults.filter(r => r.currentWebsite).length,
        errors: 0
      };
      setSummary(summary);
      
      console.log(`✅ Loaded ALL ${loadedResults.length} VIC villages from database`);
      alert(`Loaded ${loadedResults.length} villages!\n\nNow click "📥 Download CSV" to export all data.`);
    } catch (error: any) {
      console.error('Error loading village data:', error);
      alert(`Error: ${error.message}`);
    } finally {
      setIsLoading(false);
    }
  };

  const filteredResults = statusFilter === 'all' 
    ? results 
    : results.filter(r => r.status === statusFilter);

  return (
    <div className="bg-gradient-to-r from-red-50 to-orange-50 rounded-lg shadow p-6 border-4 border-red-400">
      <div className="bg-red-600 text-white font-bold text-center py-3 px-4 rounded mb-4 text-lg">
        ⚠️ DEPRECATED - DO NOT USE THIS SCRAPER ⚠️
      </div>
      
      <div className="bg-yellow-100 border-4 border-yellow-400 rounded p-4 mb-4">
        <h3 className="font-bold text-xl text-red-900 mb-2">❌ This is the OLD Single-Strategy Scraper</h3>
        <p className="text-red-800 font-semibold mb-3">
          Success Rate: ~20-30% (Only tries ONE search strategy)
        </p>
        <div className="bg-green-100 border-2 border-green-500 rounded p-3">
          <p className="font-bold text-green-900 text-lg mb-2">
            ✅ USE THE NEW "MULTI-STRATEGY SCRAPER" INSTEAD!
          </p>
          <p className="text-green-800">
            Scroll down to find "🎯 VIC Multi-Strategy Scraper"<br/>
            Success Rate: 60-80% (Tries FIVE different search strategies!)
          </p>
        </div>
      </div>

      <h2 className="text-2xl font-bold mb-4 opacity-50">🎯 OLD VIC Operator Domain Scraper (Deprecated)</h2>

      {/* Operator Stats */}
      {operators.length > 0 && (
        <div className="bg-blue-50 p-4 rounded-lg mb-4">
          <div className="grid grid-cols-3 gap-4 text-center">
            <div>
              <div className="text-2xl font-bold text-blue-900">{operators.length}</div>
              <div className="text-xs text-blue-700">Total Operators</div>
            </div>
            <div>
              <div className="text-2xl font-bold text-green-900">
                {operators.filter(o => o.domain).length}
              </div>
              <div className="text-xs text-green-700">With Domains</div>
            </div>
            <div>
              <div className="text-2xl font-bold text-orange-900">
                {operators.filter(o => !o.domain).length}
              </div>
              <div className="text-xs text-orange-700">Without Domains</div>
            </div>
          </div>
        </div>
      )}

      {/* Summary */}
      {summary && (
        <div className="bg-gray-50 p-4 rounded-lg mb-4">
          <h4 className="font-semibold mb-3">📊 Results Summary</h4>
          <div className="grid grid-cols-4 gap-3 text-sm">
            <div className="text-center">
              <div className="text-xl font-bold text-green-600">{summary.updated}</div>
              <div className="text-xs text-gray-600">✅ Updated</div>
            </div>
            <div className="text-center">
              <div className="text-xl font-bold text-red-600">{summary.notFound}</div>
              <div className="text-xs text-gray-600">❌ Not Found</div>
            </div>
            <div className="text-center">
              <div className="text-xl font-bold text-yellow-600">{summary.invalid}</div>
              <div className="text-xs text-gray-600">⚠️ Invalid</div>
            </div>
            <div className="text-center">
              <div className="text-xl font-bold text-blue-600">{summary.protected}</div>
              <div className="text-xs text-gray-600">🛡️ Protected</div>
            </div>
          </div>
        </div>
      )}

      {/* Progress */}
      {progress && (
        <div className="mb-4">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm text-gray-600">
              Processing: {progress.current} / {progress.total}
              {isPaused && <span className="ml-2 text-yellow-600 font-semibold">⏸️ PAUSED</span>}
            </span>
            <span className="text-sm font-semibold text-blue-600">
              {Math.round((progress.current / progress.total) * 100)}%
            </span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div 
              className="bg-blue-600 h-2 rounded-full transition-all duration-300"
              style={{ width: `${(progress.current / progress.total) * 100}%` }}
            />
          </div>
        </div>
      )}

      {/* Action Buttons */}
      <div className="flex gap-2 mb-4 flex-wrap">
        <button
          onClick={loadOperators}
          disabled={isLoading}
          className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:bg-gray-400 text-sm"
        >
          {isLoading ? '⏳ Loading...' : '📋 Load Operators'}
        </button>
        
        <button
          onClick={loadAllVICVillages}
          disabled={isLoading}
          className="px-4 py-2 bg-indigo-600 text-white rounded hover:bg-indigo-700 disabled:bg-gray-400 text-sm font-semibold"
        >
          {isLoading ? '⏳ Loading...' : '📊 Load ALL VIC Data'}
        </button>
        
        <button
          onClick={runScraper}
          disabled={isLoading}
          className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700 disabled:bg-gray-400 text-sm font-semibold"
        >
          {isLoading ? '⏳ Scraping...' : '🚀 Run Scraper'}
        </button>
        
        {isLoading && !isPaused && (
          <button
            onClick={handlePause}
            disabled={isPaused}
            className="px-4 py-2 bg-yellow-600 text-white rounded hover:bg-yellow-700 disabled:bg-gray-400 text-sm"
          >
            ⏸️ Pause
          </button>
        )}
        
        {isLoading && isPaused && (
          <button
            onClick={handleResume}
            className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 text-sm"
          >
            ▶️ Resume
          </button>
        )}
        
        {isLoading && (
          <button
            onClick={handleStop}
            className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700 text-sm"
          >
            ⏹️ Stop
          </button>
        )}
        
        {results.length > 0 && (
          <button
            onClick={downloadResultsCSV}
            className="px-4 py-2 bg-gray-600 text-white rounded hover:bg-gray-700 text-sm"
          >
            📥 Download CSV
          </button>
        )}
      </div>

      {/* Configuration */}
      <div className="mb-4 p-3 bg-gray-50 rounded-lg">
        <label className="block text-sm font-medium text-gray-700 mb-2">
          🎯 Filter by Operator (Optional):
        </label>
        <select
          value={operatorFilter}
          onChange={(e) => setOperatorFilter(e.target.value)}
          disabled={isLoading}
          className="w-full px-3 py-2 border rounded text-sm disabled:bg-gray-200 mb-4"
        >
          <option value="all">All Operators</option>
          {availableOperators.sort().map((operator) => (
            <option key={operator} value={operator}>
              {operator}
            </option>
          ))}
        </select>
        
        <label className="block text-sm font-medium text-gray-700 mb-2">
          🎛️ Number of villages to process:
        </label>
        <div className="flex items-center gap-3">
          <input
            type="number"
            min="0"
            value={maxVillages}
            onChange={(e) => setMaxVillages(parseInt(e.target.value) || 0)}
            disabled={isLoading}
            className="px-3 py-2 border rounded w-32 text-sm disabled:bg-gray-200"
            placeholder="0 = All"
          />
          <span className="text-sm text-gray-600">
            {maxVillages === 0 ? 'All villages (~505)' : `First ${maxVillages} villages`}
          </span>
          <div className="flex gap-2 ml-auto">
            <button
              onClick={() => setMaxVillages(20)}
              disabled={isLoading}
              className="px-3 py-1 bg-gray-200 text-gray-700 rounded hover:bg-gray-300 disabled:bg-gray-100 text-xs"
            >
              20 (Test)
            </button>
            <button
              onClick={() => setMaxVillages(50)}
              disabled={isLoading}
              className="px-3 py-1 bg-gray-200 text-gray-700 rounded hover:bg-gray-300 disabled:bg-gray-100 text-xs"
            >
              50
            </button>
            <button
              onClick={() => setMaxVillages(100)}
              disabled={isLoading}
              className="px-3 py-1 bg-gray-200 text-gray-700 rounded hover:bg-gray-300 disabled:bg-gray-100 text-xs"
            >
              100
            </button>
            <button
              onClick={() => setMaxVillages(0)}
              disabled={isLoading}
              className="px-3 py-1 bg-gray-200 text-gray-700 rounded hover:bg-gray-300 disabled:bg-gray-100 text-xs"
            >
              All
            </button>
          </div>
        </div>
        <p className="text-xs text-gray-500 mt-2">
          💡 Start with 20 villages to test the scraper, then increase to process more.
        </p>
      </div>

      {/* Filter */}
      {results.length > 0 && (
        <div className="mb-4">
          <label className="text-sm text-gray-600 mr-2">Filter by status:</label>
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-3 py-1 border rounded text-sm"
          >
            <option value="all">All ({results.length})</option>
            <option value="updated">✅ Updated ({results.filter(r => r.status === 'updated').length})</option>
            <option value="not_found">❌ Not Found ({results.filter(r => r.status === 'not_found').length})</option>
            <option value="invalid">⚠️ Invalid ({results.filter(r => r.status === 'invalid').length})</option>
            <option value="protected">🛡️ Protected ({results.filter(r => r.status === 'protected').length})</option>
            <option value="unchanged">➖ Unchanged ({results.filter(r => r.status === 'unchanged').length})</option>
            <option value="error">🐛 Error ({results.filter(r => r.status === 'error').length})</option>
          </select>
        </div>
      )}

      {/* Results */}
      {filteredResults.length > 0 && (
        <div className="mt-4 max-h-96 overflow-y-auto border rounded">
          <table className="min-w-full divide-y divide-gray-200 text-sm">
            <thead className="bg-gray-50 sticky top-0">
              <tr>
                <th className="px-3 py-2 text-left text-xs font-medium text-gray-500">Village</th>
                <th className="px-3 py-2 text-left text-xs font-medium text-gray-500">Operator</th>
                <th className="px-3 py-2 text-left text-xs font-medium text-gray-500">Domain</th>
                <th className="px-3 py-2 text-left text-xs font-medium text-gray-500">Found URL</th>
                <th className="px-3 py-2 text-left text-xs font-medium text-gray-500">Status</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredResults.map((result, idx) => (
                <tr key={idx} className={
                  result.status === 'updated' ? 'bg-green-50' :
                  result.status === 'not_found' ? 'bg-red-50' :
                  result.status === 'invalid' ? 'bg-yellow-50' :
                  result.status === 'protected' ? 'bg-blue-50' :
                  result.status === 'error' ? 'bg-red-100' : ''
                }>
                  <td className="px-3 py-2 text-xs">{result.name}</td>
                  <td className="px-3 py-2 text-xs">{result.operator}</td>
                  <td className="px-3 py-2 text-xs">
                    {result.operatorDomain ? (
                      <span className="text-blue-600">{result.operatorDomain}</span>
                    ) : (
                      <span className="text-gray-400">No domain</span>
                    )}
                  </td>
                  <td className="px-3 py-2 text-xs max-w-xs truncate">
                    {result.foundUrl === 'No official website' ? (
                      <span className="text-red-600">Not found</span>
                    ) : result.foundUrl.startsWith('Invalid') ? (
                      <span className="text-yellow-600">{result.foundUrl}</span>
                    ) : (
                      <a 
                        href={result.foundUrl} 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="text-blue-600 hover:underline"
                      >
                        {result.foundUrl}
                      </a>
                    )}
                  </td>
                  <td className="px-3 py-2 text-xs">
                    {result.status === 'updated' && <span className="text-green-600">✅ Updated</span>}
                    {result.status === 'not_found' && <span className="text-red-600">❌ Not found</span>}
                    {result.status === 'invalid' && <span className="text-yellow-600">⚠️ Invalid</span>}
                    {result.status === 'protected' && <span className="text-blue-600">🛡️ Protected</span>}
                    {result.status === 'unchanged' && <span className="text-gray-600">➖ Unchanged</span>}
                    {result.status === 'error' && <span className="text-red-600">🐛 Error</span>}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Instructions */}
      <div className="mt-4 p-3 bg-blue-50 rounded text-xs text-blue-900">
        <strong>🎯 How This Works (Enhanced with Dual-Query Search):</strong>
        <ol className="mt-2 ml-4 space-y-1 list-decimal">
          <li>Loads verified operator domains from CSV (117 operators, ~92 with domains)</li>
          <li>For each VIC village, looks up operator domain</li>
          <li><strong>Normalizes village name</strong> - removes "Retirement Village", "Community", punctuation, etc.</li>
          <li><strong>Query 1 (Primary):</strong> <code className="bg-white px-1">site:domain.com.au "Full Village Name"</code></li>
          <li><strong>Query 2 (Fallback):</strong> <code className="bg-white px-1">site:domain.com.au "Normalized Name"</code></li>
          <li>Validates results against operator domain (strict domain enforcement)</li>
          <li>Blocks forbidden directories (villages.com.au, agedcareguide.com.au, etc.)</li>
          <li>Protects existing good URLs from being overwritten</li>
          <li>Fallback chain: Village-specific page → Operator homepage → "No official website"</li>
        </ol>
        <div className="mt-2 pt-2 border-t border-blue-200">
          <strong>✨ NEW: Multi-Name Matching</strong> - Handles villages like "The Heights Retirement Village" by also searching for "The Heights" if the full name fails.
        </div>
      </div>
    </div>
  );
};