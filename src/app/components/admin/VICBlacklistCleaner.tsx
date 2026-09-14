import React, { useState } from 'react';
import { Trash2, AlertTriangle } from 'lucide-react';
import { getSupabaseClient } from '../../utils/supabase/client';

/**
 * Remove blacklisted URLs from VIC villages
 * These are aggregator sites and test domains, NOT official village websites
 */
export const VICBlacklistCleaner = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [results, setResults] = useState<any>(null);

  // Blacklist of aggregator/directory sites
  const BLACKLIST = [
    'agedcareonline.com.au',
    'agedcareview.com.au',
    'agedcarequality.gov.au',
    'myagedcare.gov.au',
    'downsizing.com.au',
    'retirementlivingonline.com.au',
    'theurbandeveloper.com',
    'australianretirementvillages.com.au',
    'retirementliving.org.au',
    'agedcare101.com.au',
    'agedcareguide.com.au',
    'eldernet.com.au',
    'retirementvillages.com.au',
    'villages.com.au',
    'choice.com.au',
    'domain.com.au',
    'realestate.com.au',
    'ratecity.com.au',
    'productreview.com.au',
    'yelp.com',
    'tripadvisor.com',
    'yellowpages.com.au',
    'truelocal.com.au',
    'hotfrog.com.au',
    'whereis.com',
    'careforyou.com.au',
    'retirementlivingaustralia.com.au',
    'birdeye.com',
    'reviews.birdeye.com',
    'google.com/maps',
    'goo.gl/maps',
    'seek.com.au',
    'indeed.com.au',
    'jora.com',
    'careerone.com.au',
    'ethicaljobs.com.au',
    'jobs.com.au',
    'talent.com',
    'adzuna.com.au',
    'sandbox.haaa.com.au',
    'careopinion.org.au',
    'transport.vic.gov.au',
  ];

  const cleanBlacklistedURLs = async () => {
    if (!confirm('⚠️ This will REMOVE all blacklisted URLs from VIC villages. Continue?')) {
      return;
    }

    setIsLoading(true);
    setResults(null); // Clear previous results!
    
    try {
      const supabase = getSupabaseClient();
      
      // Get ALL VIC villages WITH websites (fresh from database!)
      const { data: villages, error } = await supabase
        .from('retirement_villages')
        .select('id, name, suburb, operator, website')
        .eq('state', 'VIC')
        .not('website', 'is', null);

      if (error) throw error;

      console.log(`[${new Date().toLocaleTimeString()}] Checking ${villages?.length || 0} VIC villages for blacklisted URLs...`);

      const toRemove: any[] = [];
      const toKeep: any[] = [];

      // Check each village
      villages?.forEach(v => {
        try {
          const domain = new URL(v.website).hostname.replace('www.', '');
          // Check if domain EXACTLY MATCHES or ENDS WITH blacklisted domain
          const isBlacklisted = BLACKLIST.some(bl => {
            if (domain === bl) return true; // Exact match
            if (domain.endsWith('.' + bl)) return true; // Subdomain match
            return false;
          });

          if (isBlacklisted) {
            toRemove.push(v);
            console.log(`  ⛔ BLACKLISTED: ${v.name} - ${v.website}`);
          } else {
            toKeep.push(v);
          }
        } catch (e) {
          // Invalid URL, keep it (will be caught by other validation)
          toKeep.push(v);
        }
      });

      console.log(`[${new Date().toLocaleTimeString()}] Found ${toRemove.length} blacklisted URLs to remove`);
      console.log(`[${new Date().toLocaleTimeString()}] Keeping ${toKeep.length} valid URLs`);

      // Remove blacklisted URLs
      let removed = 0;
      for (const village of toRemove) {
        const { error: updateError } = await supabase
          .from('retirement_villages')
          .update({ website: null })
          .eq('id', village.id);

        if (updateError) {
          console.error(`Failed to remove URL from ${village.name}:`, updateError);
        } else {
          removed++;
          console.log(`✅ Removed blacklisted URL from: ${village.name} (${village.website})`);
        }
      }

      const finalResults = {
        total: villages?.length || 0,
        removed,
        kept: toKeep.length,
        toRemove,
        toKeep
      };
      
      setResults(finalResults);

      console.log(`[${new Date().toLocaleTimeString()}] CLEANUP COMPLETE: Removed ${removed} URLs, ${toKeep.length} valid URLs remain`);
      
      // Dynamic alert with actual numbers
      const alertMessage = `✅ Cleaned ${removed} blacklisted URLs!\n\n${toKeep.length} valid URLs remain.\n\nTotal checked: ${villages?.length || 0}`;
      alert(alertMessage);
      console.log(alertMessage);

    } catch (error: any) {
      console.error('Error cleaning blacklisted URLs:', error);
      alert(`Error: ${error.message}`);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-md border border-red-200 p-6 mb-6">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <Trash2 className="w-6 h-6 text-red-600" />
          <h2 className="text-2xl font-bold text-red-900">🗑️ Blacklist Cleaner</h2>
        </div>
      </div>

      <div className="mb-4 p-4 bg-red-50 rounded-lg border border-red-200">
        <div className="flex items-start gap-2">
          <AlertTriangle className="w-5 h-5 text-red-600 mt-0.5 flex-shrink-0" />
          <div>
            <h3 className="font-semibold text-red-900 mb-2">⚠️ Removes Bad URLs</h3>
            <p className="text-sm text-red-800 mb-2">
              This tool removes URLs from aggregator sites and test domains. These are NOT official village websites:
            </p>
            <ul className="text-xs text-red-700 space-y-1 list-disc list-inside">
              <li><strong>sandbox.haaa.com.au</strong> - Test/sandbox site</li>
              <li><strong>careopinion.org.au</strong> - Review aggregator</li>
              <li><strong>agedcareguide.com.au</strong> - Directory site</li>
              <li>...and {BLACKLIST.length - 3} more blacklisted domains</li>
            </ul>
          </div>
        </div>
      </div>

      <div className="space-y-4">
        <button
          onClick={cleanBlacklistedURLs}
          disabled={isLoading}
          className="w-full px-4 py-3 bg-red-600 text-white rounded-lg font-semibold hover:bg-red-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors"
        >
          {isLoading ? '🗑️ Cleaning...' : '🗑️ Remove Blacklisted URLs'}
        </button>

        {results && (
          <div className="space-y-4">
            {/* Summary */}
            <div className="grid grid-cols-3 gap-4">
              <div className="p-3 bg-gray-50 rounded-lg border border-gray-200 text-center">
                <div className="text-2xl font-bold text-gray-900">{results.total}</div>
                <div className="text-sm text-gray-600">Total Checked</div>
              </div>
              <div className="p-3 bg-red-50 rounded-lg border border-red-200 text-center">
                <div className="text-2xl font-bold text-red-600">{results.removed}</div>
                <div className="text-sm text-red-600">Removed</div>
              </div>
              <div className="p-3 bg-green-50 rounded-lg border border-green-200 text-center">
                <div className="text-2xl font-bold text-green-600">{results.kept}</div>
                <div className="text-sm text-green-600">Kept</div>
              </div>
            </div>

            {/* Removed URLs */}
            {results.toRemove.length > 0 && (
              <div className="p-4 bg-red-50 rounded-lg border border-red-200">
                <h3 className="font-semibold text-red-900 mb-3">🗑️ Removed URLs ({results.removed})</h3>
                <div className="space-y-2 max-h-64 overflow-y-auto">
                  {results.toRemove.map((v: any) => (
                    <div key={v.id} className="p-2 bg-white rounded border border-red-100 text-sm">
                      <div className="font-medium text-red-900">{v.name}</div>
                      <div className="text-red-600 text-xs break-all">{v.website}</div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Kept URLs */}
            {results.toKeep.length > 0 && (
              <div className="p-4 bg-green-50 rounded-lg border border-green-200">
                <h3 className="font-semibold text-green-900 mb-3">✅ Valid URLs Kept ({results.kept})</h3>
                <div className="space-y-2 max-h-64 overflow-y-auto">
                  {results.toKeep.slice(0, 20).map((v: any) => (
                    <div key={v.id} className="p-2 bg-white rounded border border-green-100 text-sm">
                      <div className="font-medium text-green-900">{v.name}</div>
                      <div className="text-green-600 text-xs break-all">{v.website}</div>
                    </div>
                  ))}
                  {results.toKeep.length > 20 && (
                    <div className="text-sm text-green-700 italic">
                      ...and {results.toKeep.length - 20} more
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};