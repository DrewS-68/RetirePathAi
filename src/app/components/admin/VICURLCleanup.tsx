import { useState } from 'react';
import { createClient } from '@supabase/supabase-js';
import { projectId, publicAnonKey } from '../../utils/supabase/info';

const supabase = createClient(
  `https://${projectId}.supabase.co`,
  publicAnonKey
);

/**
 * VIC URL Cleanup & Bulk Fix Tool
 * - Removes directory/garbage websites
 * - Cleans up tracking parameters and long URLs
 * - Fixes Australian Unity over-assignment
 */
export const VICURLCleanup = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [results, setResults] = useState<string[]>([]);
  const [diagnosticResults, setDiagnosticResults] = useState<any>(null);

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
    'rslcaresa.com.au'
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

  const removeBlacklistedURLs = async () => {
    setIsLoading(true);
    setResults([]);

    try {
      const response = await fetch(
        `https://${projectId}.supabase.co/functions/v1/make-server-3bba8be8/vic-url-cleanup/remove-blacklisted`,
        {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${publicAnonKey}`,
            'Content-Type': 'application/json'
          }
        }
      );
      
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}`);
      }
      
      const data = await response.json();
      
      if (data.success) {
        setResults(data.logs || []);
      } else {
        setResults([`❌ Error: ${data.error}`]);
      }
    } catch (error: any) {
      console.error('Cleanup error:', error);
      setResults([`❌ Failed: ${error.message}`]);
    } finally {
      setIsLoading(false);
    }
  };

  const cleanupURLs = async () => {
    setIsLoading(true);
    setResults([]);

    try {
      const response = await fetch(
        `https://${projectId}.supabase.co/functions/v1/make-server-3bba8be8/vic-url-cleanup/clean-urls`,
        {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${publicAnonKey}`,
            'Content-Type': 'application/json'
          }
        }
      );
      
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}`);
      }
      
      const data = await response.json();
      
      if (data.success) {
        setResults(data.logs || []);
      } else {
        setResults([`❌ Error: ${data.error}`]);
      }
    } catch (error: any) {
      console.error('Cleanup error:', error);
      setResults([`❌ Failed: ${error.message}`]);
    } finally {
      setIsLoading(false);
    }
  };

  const fixAustralianUnity = async () => {
    setIsLoading(true);
    setResults([]);

    try {
      const response = await fetch(
        `https://${projectId}.supabase.co/functions/v1/make-server-3bba8be8/vic-url-cleanup/fix-australian-unity`,
        {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${publicAnonKey}`,
            'Content-Type': 'application/json'
          }
        }
      );
      
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}`);
      }
      
      const data = await response.json();
      
      if (data.success) {
        setResults(data.logs || []);
      } else {
        setResults([`❌ Error: ${data.error}`]);
      }
    } catch (error: any) {
      console.error('Cleanup error:', error);
      setResults([`❌ Failed: ${error.message}`]);
    } finally {
      setIsLoading(false);
    }
  };

  const runAll = async () => {
    setResults(['🚀 Running all cleanup operations...\\n']);
    await removeBlacklistedURLs();
    setResults(prev => [...prev, '\\n', '─'.repeat(60), '\\n']);
    await cleanupURLs();
    setResults(prev => [...prev, '\\n', '─'.repeat(60), '\\n']);
    await fixAustralianUnity();
    setResults(prev => [...prev, '\\n', '✅ ALL CLEANUP COMPLETE!']);
  };

  const runDiagnostic = async () => {
    setIsLoading(true);
    setDiagnosticResults(null);
    try {
      const response = await fetch(
        `https://${projectId}.supabase.co/functions/v1/make-server-3bba8be8/vic-url-diagnostic`,
        {
          headers: {
            'Authorization': `Bearer ${publicAnonKey}`
          }
        }
      );
      
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}`);
      }
      
      const data = await response.json();
      setDiagnosticResults(data);
    } catch (error: any) {
      console.error('Diagnostic error:', error);
      setResults([`❌ Diagnostic failed: ${error.message}`]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="bg-white rounded-lg shadow p-6 mb-6">
      <h3 className="text-lg font-semibold text-gray-900 mb-2">
        🧹 VIC URL Cleanup & Bulk Fix
      </h3>
      <p className="text-sm text-gray-600 mb-4">
        Remove directory websites, clean tracking parameters, and fix Australian Unity over-assignment
      </p>

      <div className="flex gap-2 mb-4 flex-wrap">
        <button
          onClick={removeBlacklistedURLs}
          disabled={isLoading}
          className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700 disabled:bg-gray-400 text-sm"
        >
          {isLoading ? '⏳ Processing...' : '🚫 Remove Blacklisted URLs'}
        </button>

        <button
          onClick={cleanupURLs}
          disabled={isLoading}
          className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:bg-gray-400 text-sm"
        >
          {isLoading ? '⏳ Processing...' : '🧹 Clean Up URLs'}
        </button>

        <button
          onClick={fixAustralianUnity}
          disabled={isLoading}
          className="px-4 py-2 bg-orange-600 text-white rounded hover:bg-orange-700 disabled:bg-gray-400 text-sm"
        >
          {isLoading ? '⏳ Processing...' : '🔧 Fix Australian Unity'}
        </button>

        <button
          onClick={runAll}
          disabled={isLoading}
          className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700 disabled:bg-gray-400 text-sm font-semibold"
        >
          {isLoading ? '⏳ Processing...' : '🚀 Run All Fixes'}
        </button>

        <button
          onClick={runDiagnostic}
          disabled={isLoading}
          className="px-4 py-2 bg-purple-600 text-white rounded hover:bg-purple-700 disabled:bg-gray-400 text-sm"
        >
          {isLoading ? '⏳ Processing...' : '🔍 Run Diagnostic'}
        </button>
      </div>

      {/* Blacklist Info */}
      <div className="bg-gray-50 p-3 rounded text-xs mb-4">
        <strong>🚫 Blacklisted Domains:</strong>
        <div className="mt-1 space-y-1">
          {BLACKLIST_DOMAINS.map(domain => (
            <div key={domain} className="text-gray-700">• {domain}</div>
          ))}
        </div>
      </div>

      {/* Results */}
      {results.length > 0 && (
        <div className="mt-4 p-4 bg-gray-50 rounded max-h-96 overflow-y-auto">
          <pre className="text-xs font-mono whitespace-pre-wrap">
            {results.join('\n')}
          </pre>
        </div>
      )}

      {/* Diagnostic Results */}
      {diagnosticResults && (
        <div className="mt-4 p-4 bg-gray-50 rounded max-h-96 overflow-y-auto">
          <pre className="text-xs font-mono whitespace-pre-wrap">
            {JSON.stringify(diagnosticResults, null, 2)}
          </pre>
        </div>
      )}
    </div>
  );
};