import { useState } from 'react';
import { Search, Database, HardDrive, Download, AlertTriangle } from 'lucide-react';
import { projectId, publicAnonKey } from '../../utils/supabase/info';
import { getSupabaseClient } from '../../utils/supabase/client';

/**
 * VIC Website Recovery Tool
 * Diagnoses where the 318 scraped websites went and attempts recovery
 */
export const VICWebsiteRecoveryTool = () => {
  const [isSearching, setIsSearching] = useState(false);
  const [results, setResults] = useState<{
    database: number;
    localStorage: number;
    kvStore: number;
    localStorageData?: any[];
  } | null>(null);

  const diagnoseAndRecover = async () => {
    setIsSearching(true);
    try {
      const supabase = getSupabaseClient();

      // 1. CHECK DATABASE - How many VIC villages actually have websites?
      console.log('🔍 Step 1: Checking Supabase database...');
      const { data: dbVillages, count: dbCount, error: dbError } = await supabase
        .from('retirement_villages')
        .select('id, name, suburb, website', { count: 'exact' })
        .eq('state', 'VIC')
        .not('website', 'is', null);

      if (dbError) {
        console.error('Database check error:', dbError);
      }
      console.log(`✅ Database has ${dbCount || 0} VIC villages with websites`);
      if (dbVillages && dbVillages.length > 0) {
        console.log('Sample database villages with websites:', dbVillages.slice(0, 3));
      }

      // 2. CHECK LOCAL STORAGE - Did the scraper save results locally?
      console.log('🔍 Step 2: Checking localStorage...');
      let localStorageCount = 0;
      let localStorageData: any[] = [];
      const localStorageKeys = [
        'vic-website-scraper-results',
        'vic-websites',
        'scraper-results',
        'website-scraper-results',
        'vic-scraping-results'
      ];

      for (const key of localStorageKeys) {
        const stored = localStorage.getItem(key);
        if (stored) {
          try {
            const parsed = JSON.parse(stored);
            console.log(`Found data in localStorage['${key}']:`, parsed);
            if (Array.isArray(parsed)) {
              localStorageCount += parsed.length;
              localStorageData = localStorageData.concat(parsed);
            } else if (parsed.results && Array.isArray(parsed.results)) {
              localStorageCount += parsed.results.length;
              localStorageData = localStorageData.concat(parsed.results);
            }
          } catch (e) {
            console.log(`Found non-JSON data in ${key}:`, stored.substring(0, 100));
          }
        }
      }
      console.log(`✅ localStorage has ${localStorageCount} entries across ${localStorageKeys.length} keys`);

      // 3. CHECK KV STORE - Did the scraper save to the KV store?
      console.log('🔍 Step 3: Checking KV store...');
      const { data: { session } } = await supabase.auth.getSession();
      let kvCount = 0;

      if (session) {
        try {
          const kvResponse = await fetch(
            `https://${projectId}.supabase.co/functions/v1/make-server-3bba8be8/admin/check-kv-websites`,
            {
              headers: {
                'Authorization': `Bearer ${session.access_token}`,
              },
            }
          );

          if (kvResponse.ok) {
            const kvData = await kvResponse.json();
            kvCount = kvData.count || 0;
            console.log(`✅ KV store has ${kvCount} website entries`);
          }
        } catch (error) {
          console.log('KV store check skipped (endpoint may not exist)');
        }
      }

      // 4. DISPLAY RESULTS
      setResults({
        database: dbCount || 0,
        localStorage: localStorageCount,
        kvStore: kvCount,
        localStorageData: localStorageData.filter(item => item && item.website).slice(0, 50) // Show first 50
      });

    } catch (error: any) {
      console.error('Diagnosis error:', error);
      alert(`Error: ${error.message}`);
    } finally {
      setIsSearching(false);
    }
  };

  const recoverFromLocalStorage = async () => {
    if (!results?.localStorageData || results.localStorageData.length === 0) {
      alert('❌ No data found in localStorage to recover!');
      return;
    }

    const confirm = window.confirm(
      `Found ${results.localStorageData.length} websites in localStorage.\n\n` +
      `Do you want to save these to the database?\n\n` +
      `This will update the database with the found websites.`
    );

    if (!confirm) return;

    try {
      const supabase = getSupabaseClient();
      const { data: { session } } = await supabase.auth.getSession();

      if (!session) {
        alert('❌ Please log in first!');
        return;
      }

      // Filter to only items with websites and valid IDs
      const validData = results.localStorageData.filter(item => 
        item && 
        (item.website || item.url) && 
        (item.villageId || item.id)
      );

      console.log(`💾 Attempting to save ${validData.length} websites...`);

      const saveResponse = await fetch(
        `https://${projectId}.supabase.co/functions/v1/make-server-3bba8be8/scraper/save-websites`,
        {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${session.access_token}`,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            results: validData.map(item => ({
              villageId: item.villageId || item.id,
              villageName: item.villageName || item.name || 'Unknown',
              website: item.website || item.url,
              status: 'found'
            }))
          })
        }
      );

      if (!saveResponse.ok) {
        const errorText = await saveResponse.text();
        throw new Error(`Save failed: ${errorText}`);
      }

      const saveData = await saveResponse.json();
      alert(`✅ Successfully saved ${saveData.updated || 0} websites to database!`);

      // Re-run diagnosis to show updated counts
      diagnoseAndRecover();

    } catch (error: any) {
      console.error('Recovery error:', error);
      alert(`❌ Recovery failed: ${error.message}`);
    }
  };

  const downloadLocalStorageData = () => {
    if (!results?.localStorageData || results.localStorageData.length === 0) {
      alert('❌ No data to download!');
      return;
    }

    const csv = [
      'Village ID,Village Name,Website,Status',
      ...results.localStorageData.map(item => 
        `${item.villageId || item.id || ''},"${item.villageName || item.name || ''}",${item.website || item.url || ''},${item.status || 'found'}`
      )
    ].join('\n');

    const blob = new Blob([csv], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `vic-websites-recovery-${new Date().toISOString().split('T')[0]}.csv`;
    document.body.appendChild(a);
    a.click();
    window.URL.revokeObjectURL(url);
    document.body.removeChild(a);

    alert('✅ CSV downloaded!');
  };

  return (
    <div className="bg-yellow-50 border-2 border-yellow-400 p-6 rounded-lg shadow-lg">
      <div className="flex items-center gap-2 mb-4">
        <AlertTriangle className="w-6 h-6 text-yellow-600" />
        <h2 className="text-2xl font-bold text-yellow-900">🔍 Website Recovery & Diagnosis Tool</h2>
      </div>

      <div className="mb-4 p-4 bg-yellow-100 border border-yellow-300 rounded-lg">
        <h3 className="font-semibold text-yellow-900 mb-2">🐛 Critical Bug Found!</h3>
        <p className="text-sm text-yellow-800 mb-2">
          The scraper was using <code className="bg-yellow-200 px-1 rounded">publicAnonKey</code> instead of your{' '}
          <code className="bg-yellow-200 px-1 rounded">access_token</code> when saving websites.
        </p>
        <p className="text-sm text-yellow-800 mb-2">
          <strong>Result:</strong> All 318 websites were found but save requests failed with 401 Unauthorized!
        </p>
        <p className="text-sm text-yellow-800 font-semibold">
          ✅ This bug is now fixed. But let's check if the websites are saved anywhere else...
        </p>
      </div>

      {!results && (
        <button
          onClick={diagnoseAndRecover}
          disabled={isSearching}
          className="w-full px-6 py-4 bg-yellow-600 text-white rounded-lg hover:bg-yellow-700 font-semibold flex items-center justify-center gap-2 text-lg mb-4"
        >
          <Search className="w-5 h-5" />
          {isSearching ? 'Searching All Storage Locations...' : 'Start Diagnosis - Find Those 318 Websites!'}
        </button>
      )}

      {results && (
        <div className="space-y-4">
          <div className="grid grid-cols-3 gap-4">
            {/* Database */}
            <div className="p-4 bg-white border-2 border-blue-300 rounded-lg text-center">
              <Database className="w-8 h-8 mx-auto mb-2 text-blue-600" />
              <div className="text-3xl font-bold text-blue-900">{results.database}</div>
              <div className="text-sm font-semibold text-blue-700">Supabase Database</div>
            </div>

            {/* LocalStorage */}
            <div className="p-4 bg-white border-2 border-green-300 rounded-lg text-center">
              <HardDrive className="w-8 h-8 mx-auto mb-2 text-green-600" />
              <div className="text-3xl font-bold text-green-900">{results.localStorage}</div>
              <div className="text-sm font-semibold text-green-700">localStorage</div>
            </div>

            {/* KV Store */}
            <div className="p-4 bg-white border-2 border-purple-300 rounded-lg text-center">
              <Database className="w-8 h-8 mx-auto mb-2 text-purple-600" />
              <div className="text-3xl font-bold text-purple-900">{results.kvStore}</div>
              <div className="text-sm font-semibold text-purple-700">KV Store</div>
            </div>
          </div>

          {/* Recovery Actions */}
          {results.localStorage > 0 && (
            <div className="p-4 bg-green-50 border-2 border-green-300 rounded-lg">
              <h3 className="font-semibold text-green-900 mb-3">✅ Found {results.localStorage} websites in localStorage!</h3>
              <p className="text-sm text-green-800 mb-3">
                We can recover these websites and save them to the database.
              </p>
              <div className="flex gap-3">
                <button
                  onClick={recoverFromLocalStorage}
                  className="flex-1 px-4 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 font-semibold flex items-center justify-center gap-2"
                >
                  <Database className="w-4 h-4" />
                  Save to Database
                </button>
                <button
                  onClick={downloadLocalStorageData}
                  className="flex-1 px-4 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-semibold flex items-center justify-center gap-2"
                >
                  <Download className="w-4 h-4" />
                  Download CSV
                </button>
              </div>
            </div>
          )}

          {results.localStorage === 0 && results.database < 100 && (
            <div className="p-4 bg-red-50 border-2 border-red-300 rounded-lg">
              <h3 className="font-semibold text-red-900 mb-2">❌ Websites Not Found Anywhere</h3>
              <p className="text-sm text-red-800 mb-2">
                The 318 websites are not in:
              </p>
              <ul className="text-sm text-red-800 list-disc list-inside mb-3">
                <li>Supabase database (only {results.database} found)</li>
                <li>Browser localStorage (0 found)</li>
                <li>KV store ({results.kvStore} found)</li>
              </ul>
              <p className="text-sm text-red-800 font-semibold">
                💡 The websites were likely lost because the save operation failed silently.
                <br />
                ✅ The bug is now fixed - you can re-run the scraper and it will save correctly!
              </p>
            </div>
          )}

          {/* Sample Data Preview */}
          {results.localStorageData && results.localStorageData.length > 0 && (
            <div className="p-4 bg-gray-50 border border-gray-300 rounded-lg">
              <h3 className="font-semibold text-gray-900 mb-2">
                📋 Sample Data (first 10 of {results.localStorageData.length}):
              </h3>
              <div className="max-h-64 overflow-y-auto">
                <table className="w-full text-xs">
                  <thead className="bg-gray-100 sticky top-0">
                    <tr>
                      <th className="px-2 py-1 text-left">Village Name</th>
                      <th className="px-2 py-1 text-left">Website</th>
                    </tr>
                  </thead>
                  <tbody>
                    {results.localStorageData.slice(0, 10).map((item, idx) => (
                      <tr key={idx} className="border-t border-gray-200">
                        <td className="px-2 py-1">{item.villageName || item.name || 'Unknown'}</td>
                        <td className="px-2 py-1 text-blue-600">{item.website || item.url || 'N/A'}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          <button
            onClick={diagnoseAndRecover}
            disabled={isSearching}
            className="w-full px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 font-semibold"
          >
            🔄 Re-run Diagnosis
          </button>
        </div>
      )}

      <div className="mt-4 p-3 bg-gray-50 border border-gray-200 rounded-lg text-xs text-gray-600">
        <p className="font-semibold mb-1">What this tool does:</p>
        <ul className="list-disc list-inside space-y-1">
          <li>Checks Supabase database for VIC villages with websites</li>
          <li>Searches browser localStorage for scraped data</li>
          <li>Checks KV store for backup data</li>
          <li>Allows you to recover and save any found data</li>
        </ul>
      </div>
    </div>
  );
};
