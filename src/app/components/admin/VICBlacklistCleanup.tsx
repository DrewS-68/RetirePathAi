import React, { useState } from 'react';
import { Trash2, AlertTriangle, Search } from 'lucide-react';
import { projectId, publicAnonKey } from '../../utils/supabase/info';
import { getSupabaseClient } from '../../utils/supabase/client';

// Same blacklist from the backend
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

/**
 * VIC Blacklist Cleanup Tool
 * Deletes all websites that match the blacklist from VIC villages
 */
export const VICBlacklistCleanup = () => {
  const [isRunning, setIsRunning] = useState(false);
  const [isScanning, setIsScanning] = useState(false);
  const [scanResults, setScanResults] = useState<any>(null);
  const [manualURL, setManualURL] = useState('');
  const [stats, setStats] = useState({
    total: 0,
    checked: 0,
    deleted: 0
  });
  const [deletedSites, setDeletedSites] = useState<string[]>([]);
  const [logs, setLogs] = useState<string[]>([]);

  const addLog = (message: string) => {
    const timestamp = new Date().toLocaleTimeString();
    const logMessage = `[${timestamp}] ${message}`;
    console.log(logMessage);
    setLogs(prev => [logMessage, ...prev].slice(0, 100));
  };

  const isBlacklisted = (url: string): boolean => {
    try {
      const domain = new URL(url).hostname.replace('www.', '');
      // Check if domain EXACTLY MATCHES or ENDS WITH blacklisted domain
      // This prevents false positives like "basscare.org.au" matching "care"
      return BLACKLIST.some(bl => {
        // Exact match: "aveo.com.au" === "aveo.com.au"
        if (domain === bl) return true;
        // Subdomain match: "www.aveo.com.au" ends with ".aveo.com.au"
        if (domain.endsWith('.' + bl)) return true;
        return false;
      });
    } catch (e) {
      return false;
    }
  };

  const runCleanup = async () => {
    if (!confirm(`⚠️ Delete Blacklisted Websites?\n\nThis will:\n1. Find all VIC villages with websites\n2. Check if they match the blacklist\n3. Set website = NULL for matches\n\nThis cannot be undone!\n\nContinue?`)) {
      return;
    }

    setIsRunning(true);
    setStats({ total: 0, checked: 0, deleted: 0 });
    setDeletedSites([]);
    setLogs([]);

    try {
      addLog('🚀 Calling backend cleanup endpoint...');
      
      // Call backend endpoint (uses SERVICE ROLE KEY to bypass RLS!)
      const response = await fetch(
        `https://${projectId}.supabase.co/functions/v1/make-server-3bba8be8/vic-blacklist-cleanup`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${publicAnonKey}`
          }
        }
      );

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Backend error: ${response.status} - ${errorText}`);
      }

      const result = await response.json();

      if (!result.success) {
        throw new Error(result.error || 'Unknown error');
      }

      addLog(`✅ Found ${result.total} VIC villages with websites`);
      addLog(`⛔ Identified ${result.bad} blacklisted URLs`);
      addLog(`✅ ${result.good} clean URLs`);
      addLog(`🗑️ Deleted ${result.deleted} blacklisted URLs`);
      
      if (result.failed > 0) {
        addLog(`❌ FAILED to delete ${result.failed} URLs - RLS ISSUE!`);
        console.error('Failed deletions:', result.failedList);
      }

      setStats({
        total: result.total,
        checked: result.total,
        deleted: result.deleted
      });

      const deletedList = result.deletedList.map((v: any) => 
        `${v.name} (${v.suburb}) - ${v.website}`
      );
      setDeletedSites(deletedList);

      // Log individual deleted sites
      for (const village of result.deletedList) {
        addLog(`  🗑️ ${village.name} - ${village.website}`);
      }

      addLog(`\n✅ CLEANUP COMPLETE!`);
      addLog(`📊 Total: ${result.total}`);
      addLog(`🗑️ Deleted: ${result.deleted}`);
      addLog(`✅ Clean: ${result.good}`);

      alert(`✅ Cleanup Complete!\n\nTotal: ${result.total}\nDeleted: ${result.deleted}\nClean: ${result.good}`);

    } catch (error: any) {
      console.error('Cleanup error:', error);
      addLog(`❌ ERROR: ${error.message}`);
      alert(`Error: ${error.message}`);
    } finally {
      setIsRunning(false);
    }
  };

  const scanForBlacklisted = async () => {
    setIsScanning(true);
    setScanResults(null);

    try {
      console.log('🔍 Scanning for blacklisted URLs...');
      
      const supabase = getSupabaseClient();
      
      // Get all VIC villages with websites
      const { data: villages, error } = await supabase
        .from('retirement_villages')
        .select('id, name, suburb, website')
        .eq('state', 'VIC')
        .not('website', 'is', null);

      if (error) {
        throw new Error(`Database error: ${error.message}`);
      }

      console.log(`📊 Found ${villages?.length || 0} VIC villages with websites`);

      const blacklisted: any[] = [];
      const clean: any[] = [];
      const byDomain: { [domain: string]: any[] } = {};

      // Check each village
      for (const village of villages || []) {
        if (isBlacklisted(village.website)) {
          const domain = new URL(village.website).hostname.replace('www.', '');
          blacklisted.push({ ...village, domain });
          
          if (!byDomain[domain]) {
            byDomain[domain] = [];
          }
          byDomain[domain].push(village);
        } else {
          clean.push(village);
        }
      }

      const results = {
        total: villages?.length || 0,
        blacklisted: blacklisted.length,
        clean: clean.length,
        blacklistedList: blacklisted,
        byDomain: byDomain
      };

      console.log('🔍 Scan results:', results);
      setScanResults(results);

    } catch (error: any) {
      console.error('Scan error:', error);
      alert(`Scan error: ${error.message}`);
    } finally {
      setIsScanning(false);
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-md border border-red-200 p-6 mb-6">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <Trash2 className="w-6 h-6 text-red-600" />
          <h2 className="text-2xl font-bold text-red-900">🗑️ Blacklist Cleanup Tool</h2>
        </div>
      </div>

      <div className="mb-4 p-4 bg-red-50 rounded-lg border border-red-200">
        <div className="flex items-start gap-2 mb-2">
          <AlertTriangle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
          <div>
            <h3 className="font-semibold text-red-900">⚠️ Warning: This Deletes Data!</h3>
            <p className="text-sm text-red-800 mt-1">
              This tool will find all VIC villages with websites that match the blacklist (aggregators, directories, etc.) and set their website field to NULL.
            </p>
            <p className="text-xs text-red-700 mt-2">
              Currently tracking <strong>{BLACKLIST.length} blacklisted domains</strong>
            </p>
          </div>
        </div>
      </div>

      {!isRunning ? (
        <button
          onClick={runCleanup}
          className="w-full px-4 py-3 bg-red-600 text-white rounded-lg font-semibold hover:bg-red-700 transition-colors"
        >
          🗑️ Run Blacklist Cleanup
        </button>
      ) : (
        <div className="space-y-4">
          {/* Stats */}
          <div className="grid grid-cols-3 gap-2">
            <div className="p-3 bg-blue-50 rounded-lg text-center">
              <div className="text-xl font-bold text-blue-900">{stats.total}</div>
              <div className="text-xs text-blue-600">Total</div>
            </div>
            <div className="p-3 bg-gray-50 rounded-lg text-center">
              <div className="text-xl font-bold text-gray-900">{stats.checked}</div>
              <div className="text-xs text-gray-600">Checked</div>
            </div>
            <div className="p-3 bg-red-50 rounded-lg text-center">
              <div className="text-xl font-bold text-red-900">{stats.deleted}</div>
              <div className="text-xs text-red-600">Deleted</div>
            </div>
          </div>

          {/* Progress Bar */}
          <div className="p-4 bg-gray-50 rounded-lg">
            <div className="flex justify-between items-center mb-2">
              <span className="text-sm font-semibold text-gray-900">
                Progress: {stats.checked} / {stats.total}
              </span>
              <span className="text-sm font-bold text-gray-900">
                {stats.total > 0 ? Math.round((stats.checked / stats.total) * 100) : 0}%
              </span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-4">
              <div 
                className="bg-red-600 h-4 rounded-full transition-all duration-300"
                style={{ width: `${stats.total > 0 ? (stats.checked / stats.total) * 100 : 0}%` }}
              />
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
                  log.includes('⛔') ? 'text-red-600 font-semibold' :
                  'text-gray-700'
                }`}>
                  {log}
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Results Summary */}
      {!isRunning && deletedSites.length > 0 && (
        <div className="mt-4 p-4 bg-red-50 rounded-lg border border-red-200">
          <h3 className="font-semibold text-red-900 mb-2">🗑️ Deleted Websites ({deletedSites.length})</h3>
          <div className="space-y-1 max-h-64 overflow-y-auto">
            {deletedSites.map((site, idx) => (
              <div key={idx} className="text-xs text-red-800 font-mono p-2 bg-white rounded">
                {site}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* DIAGNOSTIC SCANNER */}
      <div className="mt-6 pt-6 border-t border-gray-200">
        <div className="flex items-center gap-2 mb-4">
          <Search className="w-5 h-5 text-blue-600" />
          <h3 className="text-lg font-bold text-blue-900">🔍 Diagnostic Scanner</h3>
        </div>
        
        <p className="text-sm text-gray-600 mb-4">
          Scan the database to find any remaining blacklisted URLs without deleting them.
        </p>

        <button
          onClick={scanForBlacklisted}
          disabled={isScanning}
          className="w-full px-4 py-2 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700 transition-colors disabled:bg-gray-400"
        >
          {isScanning ? '⏳ Scanning...' : '🔍 Scan for Blacklisted URLs'}
        </button>

        {scanResults && (
          <div className="mt-4 space-y-4">
            {/* Summary Stats */}
            <div className="grid grid-cols-3 gap-2">
              <div className="p-3 bg-blue-50 rounded-lg text-center">
                <div className="text-xl font-bold text-blue-900">{scanResults.total}</div>
                <div className="text-xs text-blue-600">Total Websites</div>
              </div>
              <div className="p-3 bg-red-50 rounded-lg text-center">
                <div className="text-xl font-bold text-red-900">{scanResults.blacklisted}</div>
                <div className="text-xs text-red-600">Blacklisted</div>
              </div>
              <div className="p-3 bg-green-50 rounded-lg text-center">
                <div className="text-xl font-bold text-green-900">{scanResults.clean}</div>
                <div className="text-xs text-green-600">Clean</div>
              </div>
            </div>

            {/* Blacklisted URLs by Domain */}
            {scanResults.blacklisted > 0 ? (
              <div className="p-4 bg-red-50 rounded-lg border border-red-200">
                <h4 className="font-semibold text-red-900 mb-3">⚠️ Found {scanResults.blacklisted} Blacklisted URLs</h4>
                <div className="space-y-3">
                  {Object.entries(scanResults.byDomain).map(([domain, villages]: [string, any]) => (
                    <div key={domain} className="p-3 bg-white rounded border border-red-200">
                      <div className="font-semibold text-red-900 mb-2">
                        🚫 {domain} ({villages.length} {villages.length === 1 ? 'village' : 'villages'})
                      </div>
                      <div className="space-y-1">
                        {villages.map((v: any) => (
                          <div key={v.id} className="text-xs text-gray-700 pl-4">
                            • {v.name} ({v.suburb})
                          </div>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ) : (
              <div className="p-4 bg-green-50 rounded-lg border border-green-200">
                <div className="text-center">
                  <div className="text-2xl mb-2">✅</div>
                  <h4 className="font-semibold text-green-900">All Clear!</h4>
                  <p className="text-sm text-green-700 mt-1">No blacklisted URLs found in the database.</p>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};