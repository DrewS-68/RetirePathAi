import React, { useState } from 'react';
import { Trash2, AlertTriangle, Download, Database } from 'lucide-react';
import { getSupabaseClient } from '../../utils/supabase/client';

/**
 * VIC Scraper Results Cleanup Tool
 * Analyzes bad scraping results and cleans up the database
 */
export const VICScraperCleanup = () => {
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysis, setAnalysis] = useState<any>(null);
  const [logs, setLogs] = useState<string[]>([]);

  const addLog = (message: string) => {
    const timestamp = new Date().toLocaleTimeString();
    const logMessage = `[${timestamp}] ${message}`;
    console.log(logMessage);
    setLogs(prev => [logMessage, ...prev].slice(0, 100));
  };

  /**
   * Known directory/aggregator domains that should be blacklisted
   */
  const KNOWN_DIRECTORIES = [
    'gen-agedcaredata.gov.au',
    'property.com.au',
    'parkopedia.com.au',
    'my-community.com',
    'agedcaremadeeasy.com.au',
    'tricare.com.au',
    'caringco.com.au',
    'abr.business.gov.au',
    'dlook.com.au',
    'agedcarefind.com.au',
    'dailycare.com.au',
    'simplyregional.com.au',
    'retirementaustralialiving.com.au',
    'tripadvisor.com',
    'instagram.com',
    'facebook.com',
    'realestate.com.au',
    'domain.com.au',
    'yourinvestmentpropertymag.com.au',
    'retirementliving.org.au',
    'australianplanet.com',
    'roost.com.au',
    'view.com.au',
    'chinesebusinessguide.com.au',
    'touristplaces.com.au',
    'asx.com.au',
    'aph.gov.au',
    'communitygrants.gov.au',
    'yumpu.com',
    'prezi.com',
    'gazette.vic.gov.au',
    'australia-streets.openalfa.com',
    'localista.com.au',
    'sa-venues.com',
    'geoview.info',
    'victoriashighcountry.com.au',
    'changepath.com.au',
    'bnaibrith.org.au',
    'andrews.edu',
    'warrandytediary.com.au',
    'blairsmith.com.au',
    'greatershepparton.com.au',
    'knox.vic.gov.au',
    'southgippsland.vic.gov.au',
    'mallacoota.org.au',
    'centralgoldfields.vic.gov.au',
    'afr.com.au',
    'newly.com.au',
    'singaustralia.com.au',
    'seniorshousingonline.com.au',
    'editorials.localista.com.au'
  ];

  /**
   * Analyze a URL to determine if it's bad
   */
  const analyzeURL = (url: string, operator: string | null): { isBad: boolean; reason: string; domain: string } => {
    if (!url || url.trim() === '') {
      return { isBad: true, reason: 'Empty URL', domain: '' };
    }

    try {
      const urlObj = new URL(url);
      const domain = urlObj.hostname.replace('www.', '');

      // Check if it's a PDF
      if (url.toLowerCase().endsWith('.pdf') || url.includes('.pdf')) {
        return { isBad: true, reason: 'PDF file', domain };
      }

      // Check if it's a known directory
      if (KNOWN_DIRECTORIES.some(dir => domain.includes(dir))) {
        return { isBad: true, reason: 'Directory/Aggregator', domain };
      }

      // Check for image files
      if (url.match(/\.(jpg|jpeg|png|gif|svg|webp)$/i)) {
        return { isBad: true, reason: 'Image file', domain };
      }

      // Check for document files
      if (url.match(/\.(xlsx|xls|doc|docx)$/i)) {
        return { isBad: true, reason: 'Document file', domain };
      }

      // Check for social media
      if (domain.includes('facebook.com') || domain.includes('instagram.com') || domain.includes('twitter.com') || domain.includes('linkedin.com')) {
        return { isBad: true, reason: 'Social media', domain };
      }

      // Check for generic listing sites
      if (domain.includes('realestate.com') || domain.includes('domain.com') || domain.includes('property.com')) {
        return { isBad: true, reason: 'Real estate listing', domain };
      }

      // Check for government/ABN sites
      if (domain.includes('abr.business.gov.au') || domain.includes('abn.business.gov.au') || domain.includes('gov.au')) {
        return { isBad: true, reason: 'Government/ABN site', domain };
      }

      // Check for aged care directories
      if (domain.includes('agedcare') || domain.includes('caringco') || domain.includes('dailycare')) {
        return { isBad: true, reason: 'Aged care directory', domain };
      }

      // NEW: Check if URL matches operator (CRITICAL!)
      if (operator && operator.trim() !== '') {
        const operatorLower = operator.toLowerCase();
        const urlLower = url.toLowerCase();
        const domainLower = domain.toLowerCase();
        
        // Extract operator words (filter out common words)
        const operatorWords = operatorLower.split(/\s+/).filter(w => 
          w.length > 3 && 
          !['retirement', 'village', 'villages', 'homes', 'living', 'care', 'aged', 'group'].includes(w)
        );
        
        // Check if ANY operator word appears in URL or domain
        const operatorInUrl = operatorWords.some(word => {
          const normalized = word.replace(/[^a-z0-9]/g, '');
          return urlLower.includes(normalized) || domainLower.includes(normalized);
        });
        
        // Known major operators with their typical domains
        const OPERATOR_DOMAINS: { [key: string]: string[] } = {
          'australian unity': ['australianunity.com.au'],
          'keyton': ['keyton.com.au'],
          'aveo': ['aveo.com.au'],
          'stockland': ['stockland.com.au', 'retireatliving.com.au'],
          'lendlease': ['lendlease.com', 'retireaustralia.com.au'],
          'bolton clarke': ['boltonclarke.com.au'],
          'ryman healthcare': ['rymanhealthcare.com.au'],
          'levande': ['levande.com.au'],
          'lifestyle communities': ['lifestylecommunities.com.au'],
          'centennial living': ['centennialliving.com.au'],
          'rca villages': ['retirementbyarv.com.au'],
          'royal freemasons': ['royalfreemasons.org.au']
        };
        
        // Check if URL matches a DIFFERENT major operator
        for (const [opName, domains] of Object.entries(OPERATOR_DOMAINS)) {
          if (operatorLower.includes(opName)) {
            // This IS the operator - URL should match these domains
            continue;
          } else {
            // This is NOT the operator - if URL matches these domains, it's WRONG
            const matchesWrongOperator = domains.some(d => domainLower.includes(d));
            if (matchesWrongOperator) {
              return { isBad: true, reason: `Wrong operator (${opName} URL for ${operator})`, domain };
            }
          }
        }
        
        // If operator has specific words but none appear in URL, it's suspicious
        if (operatorWords.length > 0 && !operatorInUrl) {
          return { isBad: true, reason: 'Operator mismatch (operator not in URL)', domain };
        }
      }

      // URL is potentially good
      return { isBad: false, reason: 'Looks OK', domain };
    } catch (e) {
      return { isBad: true, reason: 'Invalid URL format', domain: '' };
    }
  };

  /**
   * Analyze all VIC villages with websites
   */
  const analyzeResults = async () => {
    if (!confirm('🔍 Analyze VIC scraping results?\n\nThis will check all VIC villages with websites and identify bad URLs.')) {
      return;
    }

    setIsAnalyzing(true);
    setLogs([]);
    
    try {
      const supabase = getSupabaseClient();
      
      addLog('📊 Loading VIC villages with websites...');
      
      const { data: villages, error } = await supabase
        .from('retirement_villages')
        .select('id, name, suburb, operator, website')
        .eq('state', 'VIC')
        .not('website', 'is', null);

      if (error) throw error;

      addLog(`✅ Loaded ${villages?.length || 0} VIC villages with websites`);

      // Analyze each URL
      const badURLs: any[] = [];
      const goodURLs: any[] = [];
      const domainCounts: { [key: string]: number } = {};
      const reasonCounts: { [key: string]: number } = {};
      const newBlacklistDomains = new Set<string>();

      for (const village of villages || []) {
        const result = analyzeURL(village.website, village.operator);
        
        // Track domain frequency
        if (result.domain) {
          domainCounts[result.domain] = (domainCounts[result.domain] || 0) + 1;
        }

        if (result.isBad) {
          badURLs.push({
            ...village,
            reason: result.reason,
            domain: result.domain
          });
          reasonCounts[result.reason] = (reasonCounts[result.reason] || 0) + 1;

          // Add to new blacklist if it's a directory/aggregator
          if (result.domain && !KNOWN_DIRECTORIES.includes(result.domain)) {
            newBlacklistDomains.add(result.domain);
          }
        } else {
          goodURLs.push(village);
        }
      }

      // Sort domains by frequency
      const topDomains = Object.entries(domainCounts)
        .sort((a, b) => b[1] - a[1])
        .slice(0, 30);

      setAnalysis({
        total: villages?.length || 0,
        bad: badURLs.length,
        good: goodURLs.length,
        badURLs,
        goodURLs,
        topDomains,
        reasonCounts,
        newBlacklistDomains: Array.from(newBlacklistDomains)
      });

      addLog(`\n📊 ANALYSIS COMPLETE:`);
      addLog(`   Total: ${villages?.length || 0}`);
      addLog(`   Bad URLs: ${badURLs.length} (${((badURLs.length / (villages?.length || 1)) * 100).toFixed(1)}%)`);
      addLog(`   Good URLs: ${goodURLs.length} (${((goodURLs.length / (villages?.length || 1)) * 100).toFixed(1)}%)`);
      addLog(`   New blacklist candidates: ${newBlacklistDomains.size}`);

    } catch (error: any) {
      console.error('Analysis error:', error);
      addLog(`❌ ERROR: ${error.message}`);
      alert(`Error: ${error.message}`);
    } finally {
      setIsAnalyzing(false);
    }
  };

  /**
   * Delete all bad URLs from database
   */
  const deleteAllBadURLs = async () => {
    if (!analysis) {
      alert('Please run analysis first');
      return;
    }

    if (!confirm(`🗑️ DELETE ${analysis.bad} bad URLs from database?\n\nThis will set the website field to NULL for all bad URLs.\n\nThis action cannot be undone!`)) {
      return;
    }

    setIsAnalyzing(true);
    
    try {
      const supabase = getSupabaseClient();
      let deletedCount = 0;

      addLog(`\n🗑️ Starting deletion of ${analysis.bad} bad URLs...`);

      // Delete in batches
      for (const village of analysis.badURLs) {
        const { error } = await supabase
          .from('retirement_villages')
          .update({ website: null })
          .eq('id', village.id);

        if (error) {
          addLog(`❌ Failed to delete ${village.name}: ${error.message}`);
        } else {
          deletedCount++;
          if (deletedCount % 50 === 0) {
            addLog(`   Progress: ${deletedCount}/${analysis.bad}`);
          }
        }
      }

      addLog(`\n✅ DELETION COMPLETE: ${deletedCount} bad URLs removed`);
      alert(`✅ Successfully deleted ${deletedCount} bad URLs!`);

      // Clear analysis and prompt to re-analyze
      setAnalysis(null);

    } catch (error: any) {
      console.error('Deletion error:', error);
      addLog(`❌ ERROR: ${error.message}`);
      alert(`Error: ${error.message}`);
    } finally {
      setIsAnalyzing(false);
    }
  };

  /**
   * Export blacklist domains to CSV
   */
  const exportBlacklist = () => {
    if (!analysis) return;

    const allDomains = [
      ...KNOWN_DIRECTORIES,
      ...analysis.newBlacklistDomains
    ].sort();

    const csvContent = ['Domain', ...allDomains.map(d => `"${d}"`)].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    
    link.setAttribute('href', url);
    link.setAttribute('download', `vic_blacklist_domains_${new Date().toISOString().split('T')[0]}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    addLog(`📥 Exported ${allDomains.length} blacklist domains`);
  };

  /**
   * Export bad URLs to CSV for review
   */
  const exportBadURLs = () => {
    if (!analysis) return;

    const headers = ['Name', 'Suburb', 'Operator', 'Bad URL', 'Reason', 'Domain'];
    const rows = analysis.badURLs.map((v: any) => [
      v.name,
      v.suburb,
      v.operator || '',
      v.website,
      v.reason,
      v.domain
    ]);

    const csvContent = [
      headers.join(','),
      ...rows.map((row: any) => row.map((cell: any) => `"${cell}"`).join(','))
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    
    link.setAttribute('href', url);
    link.setAttribute('download', `vic_bad_urls_${new Date().toISOString().split('T')[0]}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    addLog(`📥 Exported ${analysis.badURLs.length} bad URLs`);
  };

  return (
    <div className="bg-white rounded-lg shadow-md border border-red-200 p-6 mb-6">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <Trash2 className="w-6 h-6 text-red-600" />
          <h2 className="text-2xl font-bold text-red-900">🧹 VIC Scraper Cleanup Tool</h2>
        </div>
      </div>

      <div className="mb-4 p-4 bg-red-50 rounded-lg border border-red-200">
        <h3 className="font-semibold text-red-900 mb-2">⚠️ Bad Scraping Results Cleanup</h3>
        <p className="text-sm text-red-800 mb-2">
          This tool analyzes VIC scraping results and removes bad URLs:
        </p>
        <ul className="text-xs text-red-700 space-y-1 list-disc list-inside">
          <li>🔴 <strong>Directories:</strong> Aged care directories, real estate listings, government sites</li>
          <li>📄 <strong>Documents:</strong> PDFs, Excel files, Word docs</li>
          <li>📱 <strong>Social Media:</strong> Facebook, Instagram, Twitter links</li>
          <li>🌐 <strong>Aggregators:</strong> property.com.au, domain.com.au, etc.</li>
          <li>✅ Exports new blacklist domains for next scrape</li>
        </ul>
      </div>

      {!isAnalyzing && !analysis ? (
        <button
          onClick={analyzeResults}
          className="w-full px-4 py-3 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700 transition-colors"
        >
          🔍 Analyze VIC Scraping Results
        </button>
      ) : null}

      {analysis && (
        <div className="space-y-4">
          {/* Summary Stats */}
          <div className="grid grid-cols-3 gap-3">
            <div className="p-4 bg-blue-50 rounded-lg border border-blue-200 text-center">
              <div className="text-2xl font-bold text-blue-900">{analysis.total}</div>
              <div className="text-sm text-blue-600">Total URLs</div>
            </div>
            <div className="p-4 bg-red-50 rounded-lg border border-red-200 text-center">
              <div className="text-2xl font-bold text-red-900">{analysis.bad}</div>
              <div className="text-sm text-red-600">Bad URLs ❌</div>
              <div className="text-xs text-red-500 mt-1">
                {((analysis.bad / analysis.total) * 100).toFixed(1)}%
              </div>
            </div>
            <div className="p-4 bg-green-50 rounded-lg border border-green-200 text-center">
              <div className="text-2xl font-bold text-green-900">{analysis.good}</div>
              <div className="text-sm text-green-600">Good URLs ✅</div>
              <div className="text-xs text-green-500 mt-1">
                {((analysis.good / analysis.total) * 100).toFixed(1)}%
              </div>
            </div>
          </div>

          {/* Reason Breakdown */}
          <div className="p-4 bg-orange-50 rounded-lg border border-orange-200">
            <h3 className="font-semibold text-orange-900 mb-2">🔍 Why URLs are Bad</h3>
            <div className="space-y-1">
              {Object.entries(analysis.reasonCounts)
                .sort((a: any, b: any) => b[1] - a[1])
                .map(([reason, count]: any, idx: number) => (
                  <div key={idx} className="flex justify-between items-center text-sm">
                    <span className="text-orange-800">{reason}</span>
                    <span className="font-bold text-orange-900">{count}</span>
                  </div>
                ))}
            </div>
          </div>

          {/* Top Domains */}
          <div className="p-4 bg-purple-50 rounded-lg border border-purple-200">
            <h3 className="font-semibold text-purple-900 mb-2">🌐 Top Domains Found (Top 30)</h3>
            <div className="space-y-1 max-h-64 overflow-y-auto">
              {analysis.topDomains.map(([domain, count]: any, idx: number) => (
                <div key={idx} className="flex justify-between items-center text-sm p-2 bg-white rounded">
                  <span className="font-mono text-purple-800">{domain}</span>
                  <span className="font-bold text-purple-900">{count}</span>
                </div>
              ))}
            </div>
          </div>

          {/* New Blacklist Candidates */}
          {analysis.newBlacklistDomains.length > 0 && (
            <div className="p-4 bg-yellow-50 rounded-lg border border-yellow-200">
              <h3 className="font-semibold text-yellow-900 mb-2">
                ⚠️ New Blacklist Candidates ({analysis.newBlacklistDomains.length})
              </h3>
              <div className="space-y-1 max-h-48 overflow-y-auto">
                {analysis.newBlacklistDomains.map((domain: string, idx: number) => (
                  <div key={idx} className="text-sm p-2 bg-white rounded font-mono text-yellow-800">
                    {domain}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Action Buttons */}
          <div className="grid grid-cols-3 gap-3">
            <button
              onClick={deleteAllBadURLs}
              disabled={isAnalyzing}
              className="px-4 py-3 bg-red-600 text-white rounded-lg font-semibold hover:bg-red-700 transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
            >
              <Trash2 className="w-5 h-5" />
              Delete All Bad URLs
            </button>
            <button
              onClick={exportBadURLs}
              className="px-4 py-3 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700 transition-colors flex items-center justify-center gap-2"
            >
              <Download className="w-5 h-5" />
              Export Bad URLs
            </button>
            <button
              onClick={exportBlacklist}
              className="px-4 py-3 bg-purple-600 text-white rounded-lg font-semibold hover:bg-purple-700 transition-colors flex items-center justify-center gap-2"
            >
              <Download className="w-5 h-5" />
              Export Blacklist
            </button>
          </div>
        </div>
      )}

      {/* Logs */}
      {logs.length > 0 && (
        <div className="mt-4 p-4 bg-gray-50 rounded-lg border border-gray-200">
          <h3 className="font-semibold text-gray-900 mb-2">📝 Logs</h3>
          <div className="space-y-1 max-h-64 overflow-y-auto font-mono text-xs">
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
      )}
    </div>
  );
};