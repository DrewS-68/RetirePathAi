import React, { useState } from 'react';
import { projectId, publicAnonKey } from '../utils/supabase/info';
import { Button } from './ui/button';
import { Alert, AlertDescription } from './ui/alert';
import { AlertCircle, Download } from 'lucide-react';
import { AutoUrlFinder } from './AutoUrlFinder';
import { Loader2, RefreshCw } from 'lucide-react';

interface VillageUrl {
  id: number;
  name: string;
  website: string;
  state: string;
  status: string;
}

// Known listing/directory sites that should ALWAYS be flagged as bad
const ALWAYS_BAD_SITES = [
  'agedcareonline.com.au',
  'retirementlivingonline.com.au',
  'agedcareview.com.au',
  'agedcarequality.gov.au',
  'downsizing.com.au',
  'myagedcare.gov.au',
  'theurbandeveloper.com',
  'hougarden.com.au',
  'domain.com.au',
  'realestate.com.au',
  'mapquest.com',
  'google.co',
  'google.com',
  'maps.google',
];

// Operator domains that might have specific village pages (need smart checking)
const OPERATOR_DOMAINS = [
  'keyton.com.au',
  'aveo.com.au',
  'retirement.vmch.com.au',
  'centennialliving.com.au',
  'baptcare.org.au',
  'regis.com.au',
  'stockland.com.au',
  'lendlease.com',
  'uniting.org',
  'anglicare.org.au',
];

export function VicUrlChecker() {
  const [loading, setLoading] = useState(false);
  const [villages, setVillages] = useState<VillageUrl[]>([]);
  const [error, setError] = useState<string | null>(null);

  const checkUrls = async () => {
    setLoading(true);
    setError(null);
    
    try {
      console.log('🔍 Fetching VIC URLs from backend...');
      console.log('URL:', `https://${projectId}.supabase.co/functions/v1/make-server-3bba8be8/database-stats/vic-urls`);
      
      const response = await fetch(
        `https://${projectId}.supabase.co/functions/v1/make-server-3bba8be8/database-stats/vic-urls`,
        {
          headers: {
            'Authorization': `Bearer ${publicAnonKey}`,
          },
        }
      );

      console.log('Response status:', response.status);
      console.log('Response ok:', response.ok);

      if (!response.ok) {
        const errorText = await response.text();
        console.error('Response error:', errorText);
        throw new Error(`HTTP ${response.status}: ${errorText}`);
      }

      const data = await response.json();
      console.log('✅ Received data:', data);
      setVillages(data.villages || []);
    } catch (err: any) {
      console.error('❌ Error fetching VIC URLs:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  // Refresh bad villages from database (to exclude manually corrected ones)
  const refreshBadVillages = async () => {
    setLoading(true);
    setError(null);

    try {
      console.log('🔄 Refreshing bad villages list from database...');
      
      const response = await fetch(
        `https://${projectId}.supabase.co/functions/v1/make-server-3bba8be8/check-vic-urls`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${publicAnonKey}`,
          },
          body: JSON.stringify({})
        }
      );

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${await response.text()}`);
      }

      const data = await response.json();
      
      console.log('✅ Refreshed village data:', {
        total: data.total,
        badUrls: data.badUrls.length,
        goodUrls: data.goodUrls.length
      });

      alert(`✅ Refreshed!\n\nTotal VIC villages: ${data.total}\n✅ Good URLs: ${data.goodUrls.length}\n❌ Bad URLs: ${data.badUrls.length}\n\nThe list is now up-to-date!`);
      
      // This will trigger parent component to re-fetch
      window.location.reload();

    } catch (err: any) {
      setError(err.message);
      console.error('Error refreshing villages:', err);
    } finally {
      setLoading(false);
    }
  };

  // Smart URL checking: only flag truly bad URLs
  const isBadUrl = (url: string | null): boolean => {
    if (!url) return false;
    
    const urlLower = url.toLowerCase();
    
    // Always flag listing/directory sites
    if (ALWAYS_BAD_SITES.some(site => urlLower.includes(site))) {
      return true;
    }
    
    // For operator domains, check if it's a generic page or specific village page
    for (const domain of OPERATOR_DOMAINS) {
      if (urlLower.includes(domain)) {
        try {
          const urlObj = new URL(url);
          const path = urlObj.pathname;
          
          // Check if URL is just the homepage or a generic page
          // BAD: /, /villages, /our-villages, /retirement-villages
          // GOOD: /villages/specific-village-name, /home/our-villages/vic/village-name
          
          if (
            path === '/' ||
            path === '' ||
            path === '/villages' ||
            path === '/villages/' ||
            path === '/our-villages' ||
            path === '/our-villages/' ||
            path === '/retirement-villages' ||
            path === '/retirement-villages/'
          ) {
            return true; // Generic operator page
          }
          
          // If the path has multiple segments (e.g., /villages/long-island), it's probably good
          const pathSegments = path.split('/').filter(s => s.length > 0);
          if (pathSegments.length >= 2) {
            return false; // Specific village page - GOOD!
          }
          
          // Single segment path on operator domain - probably generic
          return true;
        } catch {
          return true; // Invalid URL
        }
      }
    }
    
    return false; // Not a known bad domain
  };

  // Categorize villages
  const badUrlVillages = villages.filter(v => isBadUrl(v.website));
  const officialSiteVillages = villages.filter(v => v.website && !isBadUrl(v.website));
  const noWebsiteVillages = villages.filter(v => !v.website);

  // Debug logging
  console.log('📊 VicUrlChecker stats:', {
    total: villages.length,
    badUrlVillages: badUrlVillages.length,
    officialSiteVillages: officialSiteVillages.length,
    noWebsiteVillages: noWebsiteVillages.length,
    shouldShowAutoFinder: (badUrlVillages.length > 0 || noWebsiteVillages.length > 0)
  });

  // Analyze URL domains
  const urlAnalysis = villages.reduce((acc, v) => {
    if (!v.website) {
      acc['❌ No Website'] = (acc['❌ No Website'] || 0) + 1;
      return acc;
    }
    
    try {
      const domain = new URL(v.website).hostname.replace('www.', '');
      const isBad = isBadUrl(v.website);
      const label = isBad ? `❌ ${domain}` : `✅ ${domain}`;
      acc[label] = (acc[label] || 0) + 1;
    } catch {
      acc['❌ Invalid URL'] = (acc['❌ Invalid URL'] || 0) + 1;
    }
    
    return acc;
  }, {} as Record<string, number>);

  // Export to CSV for manual correction
  const exportToCSV = () => {
    const csv = [
      ['Village ID', 'Village Name', 'Current URL', 'Status', 'Issue Type'].join(','),
      ...badUrlVillages.map(v => [
        v.id,
        `"${v.name}"`,
        v.website || '',
        v.status,
        'Listing Site - Needs Official URL'
      ].join(',')),
      ...noWebsiteVillages.map(v => [
        v.id,
        `"${v.name}"`,
        '',
        v.status,
        'No Website - Needs Research'
      ].join(','))
    ].join('\n');

    const blob = new Blob([csv], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `vic-villages-url-corrections-${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    window.URL.revokeObjectURL(url);
  };

  // Export ALL villages for manual review
  const exportAllVillagesToCsv = () => {
    const csv = [
      ['Village ID', 'Village Name', 'Current URL', 'Corrected URL (FILL THIS IN)', 'Status', 'Notes'].join(','),
      ...villages.map(v => {
        const issue = !v.website ? 'No Website' : isBadUrl(v.website) ? 'Listing/Operator Site' : 'Check Manually';
        return [
          v.id,
          `"${v.name}"`,
          v.website || '',
          '', // Empty column for user to fill in
          v.status,
          issue
        ].join(',');
      })
    ].join('\n');

    const blob = new Blob([csv], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `vic-villages-ALL-manual-check-${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    window.URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-6">
      <div className="flex gap-3 mb-6">
        <Button onClick={checkUrls} disabled={loading} size="lg">
          {loading ? (
            <>
              <Loader2 className="size-4 mr-2 animate-spin" />
              Checking URLs...
            </>
          ) : (
            'Check VIC Village URLs'
          )}
        </Button>

        {/* REFRESH BUTTON - Reload data from database */}
        <Button 
          onClick={() => {
            if (confirm('🔄 Refresh the village data from the database?\n\nThis will reload all VIC villages and update the bad URL count.')) {
              checkUrls();
            }
          }}
          disabled={loading}
          size="lg"
          variant="outline"
          className="border-blue-300 text-blue-600 hover:bg-blue-50"
        >
          <RefreshCw className="size-4 mr-2" />
          🔄 Refresh from Database
        </Button>

        {villages.length > 0 && (
          <Button
            onClick={exportAllVillagesToCsv}
            disabled={loading}
            size="lg"
            className="bg-blue-600 hover:bg-blue-700"
          >
            <Download className="size-4 mr-2" />
            📋 Export ALL VIC Villages for Manual Check ({villages.length} total)
          </Button>
        )}

        {badUrlVillages.length > 0 && (
          <Button
            onClick={exportToCSV}
            disabled={loading}
            size="lg"
            variant="outline"
          >
            <Download className="size-4 mr-2" />
            Export Only Bad URLs ({badUrlVillages.length} villages)
          </Button>
        )}
      </div>

      {/* Initial Instructions */}
      {villages.length === 0 && !loading && !error && (
        <Alert className="bg-blue-50 border-blue-300">
          <AlertCircle className="size-4 text-blue-600" />
          <AlertDescription className="text-blue-800">
            <strong>👆 Click "Check VIC Village URLs"</strong> above to load all Victorian villages and analyze their URLs. 
            This will show you which villages have listing site URLs that need correction.
          </AlertDescription>
        </Alert>
      )}

      {error && (
        <Alert variant="destructive">
          <AlertCircle className="size-4" />
          <AlertDescription>Error: {error}</AlertDescription>
        </Alert>
      )}

      {villages.length > 0 && (
        <div className="space-y-6">
          {/* Instructions */}
          <Alert className="bg-blue-50 border-blue-300">
            <AlertCircle className="size-4 text-blue-600" />
            <AlertDescription className="text-blue-800">
              <strong>Recommended Approach:</strong> Click "Export ALL VIC Villages" to get a CSV with all {villages.length} villages. 
              Manually check/correct each URL, then use the Bulk URL Importer tool below to update them all at once.
            </AlertDescription>
          </Alert>

          {/* Summary Stats */}
          <div className="grid grid-cols-3 gap-4">
            <div className="p-4 bg-red-50 border-2 border-red-300 rounded-lg">
              <div className="text-3xl font-bold text-red-700">{badUrlVillages.length}</div>
              <div className="text-sm text-red-600">❌ Listing Site URLs</div>
              <div className="text-xs text-red-500 mt-1">Need official village websites</div>
            </div>
            
            <div className="p-4 bg-green-50 border-2 border-green-300 rounded-lg">
              <div className="text-3xl font-bold text-green-700">{officialSiteVillages.length}</div>
              <div className="text-sm text-green-600">✅ Possibly Official URLs</div>
              <div className="text-xs text-green-500 mt-1">Check manually to confirm</div>
            </div>
            
            <div className="p-4 bg-gray-50 border-2 border-gray-300 rounded-lg">
              <div className="text-3xl font-bold text-gray-700">{noWebsiteVillages.length}</div>
              <div className="text-sm text-gray-600">❌ No Website</div>
              <div className="text-xs text-gray-500 mt-1">Need research</div>
            </div>
          </div>

          {/* URL Domain Analysis */}
          <div>
            <h3 className="text-xl font-semibold mb-3">📊 URL Domain Breakdown</h3>
            <div className="bg-white border-2 border-gray-200 rounded-lg p-4 max-h-64 overflow-y-auto">
              {Object.entries(urlAnalysis)
                .sort((a, b) => b[1] - a[1])
                .map(([domain, count]) => (
                  <div key={domain} className="flex justify-between py-2 border-b last:border-b-0">
                    <span className={domain.startsWith('❌') ? 'text-red-600 font-semibold' : 'text-green-600 font-semibold'}>
                      {domain}
                    </span>
                    <span className="font-mono font-bold">{count}</span>
                  </div>
                ))}
            </div>
          </div>

          {/* Listing Site Villages (THE PROBLEM) */}
          {badUrlVillages.length > 0 && (
            <div>
              <h3 className="text-xl font-semibold mb-3 text-red-700">
                🚨 Villages with Listing Site URLs ({badUrlVillages.length})
              </h3>
              <p className="text-sm text-red-600 mb-3">
                These villages have directory/listing URLs instead of their official websites. They need to be corrected before scraping.
              </p>
              <div className="space-y-2 max-h-96 overflow-y-auto border-2 border-red-300 rounded-lg p-4 bg-red-50">
                {badUrlVillages.map((v) => (
                  <div key={v.id} className="p-3 bg-white border border-red-200 rounded">
                    <div className="font-semibold text-gray-900">{v.name}</div>
                    <div className="text-sm text-red-600 break-all">
                      ❌ {v.website}
                    </div>
                    <div className="text-xs text-gray-500 mt-1">
                      ID: {v.id} • Status: {v.status}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* AUTO URL FINDER - Put it AFTER the red list so it's easier to see */}
          {(badUrlVillages.length > 0 || noWebsiteVillages.length > 0) && (
            <div className="border-4 border-blue-500 rounded-lg p-2">
              <AutoUrlFinder badVillages={[...badUrlVillages, ...noWebsiteVillages]} />
            </div>
          )}
        </div>
      )}
    </div>
  );
}