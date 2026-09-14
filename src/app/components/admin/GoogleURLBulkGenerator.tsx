import React, { useState } from 'react';
import { Search, Download, Copy, Check, AlertCircle, Loader } from 'lucide-react';
import { projectId, publicAnonKey } from '../../utils/supabase/info';

/**
 * Google Custom Search API URL Bulk Generator
 * Actually calls Google API and saves results to database
 */

const VILLAGE_NAMES = [
  'Fernleigh Flats', 'Fifty One', 'Forest Hills', 'Forestwood Close', 'Freedom Place',
  'Geelong Grove', 'Gillin Park', 'Golden Mews', 'Golden Rise', 'Good Shepherd',
  'Goodwin Village', 'Grant Street', 'Greenleigh', 'Greenview Assisted Living', 'Greenway Gardens',
  'Greenwood Mews', 'Griffin Park', 'Grovedale Place', 'Hamilton', 'Hampton Heath',
  'Hannah Village', 'Hayville', 'Heatherlie Homes', 'Heathglen', 'Hemsley Park',
  'Hepburn House', 'Heritage Lakes', 'Hidden Valley', 'Highlands', 'Hillview Bunyip',
  'Illawong Lakeside', 'Illoura', 'Inala', 'Ironbark', 'J J Waldron',
  'John Curtin', 'Karinya Village', 'Kavanagh Court', 'Kellock Lodge', 'Kennington Gardens',
  'Kensington Gardens Shepparton', 'Kialla Gardens', 'Kings Living', 'Kingston Green', 'Kirkbrae',
  'Kithbrooke Park', 'Knox Village', 'Kooringa Close', 'Koorootang Court', 'Lakeview Villas',
  'Latrobe Retirement', 'Latrobe Valley', 'Latvian Friendly Society', 'Lilydale Valley Views', 'Lincoln Surf Coast',
  'Lions Anglesea', 'Lions Torquay', 'Lionsville', 'Lisson Manor', 'Lutheran Homes Hamilton',
  'Main Street Village', 'Mallacoota District Health', 'Maranoa Close', 'Marcellin', 'Martha Bay',
  'Martha Cove', 'Marthas Point', 'Martin Luther Homes', 'Masonic Court Ballarat', 'Masonic Court Coburg',
  'Masonic Court Swan Hill', 'Masonic Court Wangaratta', 'Mayflower Macleod', 'McAuley Retirement Living', 'McAuley Village',
  'Meadowvale', 'Melaleuca', 'Melba Vale', 'Memorial Drive', 'Mercy Colac',
  'Mernda Village', 'Middle Park', 'Millrise', 'Mingarra', 'Mitchell House',
  'Monash Gardens', 'Monash Retirement', 'Moorfields', 'Morgan Glen Iris', 'Morven Manor',
  'Mount Eliza Terraces', 'Mountain View', 'Mt Martha', 'Mundarlo', 'Murchison',
  'Nazareth House Ballarat', 'Northwood Park', 'Oak Grange', 'Oak Tree Skye', 'Paddington Court',
  'Pavilions Blackburn Lake', 'Peninsula Lifestyle', 'Penshurst', 'Peppertree Hill', 'Pinetree Retirement',
  'Pinnaroo', 'Plenty Valley', 'Point Cook Village', 'Port Phillip', 'Princes Court',
  'Princess Margriet', 'Probus Women\'s Housing', 'Providence Village', 'Querencia', 'Raelene Boyle',
  'Redmond Park', 'Restdown', 'Rhodoglade', 'Rice Village', 'Richfield',
  'Ringwood Village', 'Riverside Warrandyte', 'RM Begg', 'Robin Syme Centre', 'Rodney Park',
  'Rose Lifestyle', 'Rosebank', 'Rosebud Village', 'Roseville Apartments', 'Rylands Hawthorn',
  'Rylands Kew', 'Sackville Grange', 'Sacred Heart', 'Seacliff', 'Selandra Rise',
  'Shanagolden', 'Sheridan Hall', 'Sherwin Rise', 'Sirovilla', 'Sophia Grove Tecoma',
  'Springthorpe', 'St Andrews Close', 'St Catherines', 'St Clare Precinct', 'St Georges Court',
  'St Helena Leith Park', 'St James', 'St Johns Park', 'St Josephs Court', 'St Laurence Park',
  'St Margarets', 'St Marys', 'St Thomas Close', 'St Thomas Village', 'St Vincents Care Eltham',
  'Strabane Heights', 'Strath Haven', 'Strathallan', 'Streeton Park', 'Stretton Park',
  'Summerset Oakleigh South', 'Sunnyside Lutheran', 'Swan Hill (District Health version)', 'Sylvan Glades', 'Tabulam And Templer',
  'Tarcoola', 'Tarneit Skies', 'Tarralla', 'Tarrangower', 'Templestowe Manor',
  'Templestowe Village', 'The Alba', 'The Benson', 'The Breeze', 'The Brighton On Bay',
  'The Connault', 'The Crescent', 'The Elms', 'The Grace Albert Park', 'The Heights',
  'The Lakes Delbridge', 'The Links Waterford', 'The Lorne Village', 'The Mornington', 'The Oaks',
  'The Range', 'The Residences Campbell Place', 'The Rosemont Pavilion', 'The Terrace', 'The Village Williamstown',
  'The Vines', 'The Willows', 'Toorak Place', 'Trafalgar Community Homes', 'Trinity Court',
  'Trinity Lane', 'Tudor Village', 'Twin Parks', 'UAC Kalkee', 'Ukrainian Elderly Peoples Home',
  'Urbanlife Footscray', 'Urbanlife Hobsons Bay', 'Urbanlife Yarra Ranges', 'Valley Village Mews', 'Vermont Elderly Peoples Homes',
  'Vermont Retirement Village Association', 'Veronica Gardens', 'Viewbank Gardens', 'Villa Rossi Yarragon', 'Villers Place',
  'Wangaratta Wesley Homes', 'Warramunda', 'Warrina', 'Waterford Park', 'Waverley Country Club',
  'Wesley Grange', 'Westmont Apartments', 'Westmont Lifestyle', 'Willow Village', 'Wimmera Lodge'
];

export function GoogleURLBulkGenerator() {
  const [apiKey, setApiKey] = useState('');
  const [cxId, setCxId] = useState('');
  const [urls, setUrls] = useState<string[]>([]);
  const [copied, setCopied] = useState(false);
  const [selectedFormat, setSelectedFormat] = useState<'urls' | 'csv' | 'json'>('urls');
  const [isProcessing, setIsProcessing] = useState(false);
  const [progress, setProgress] = useState({ current: 0, total: 0, success: 0, failed: 0 });
  const [results, setResults] = useState<Array<{ village: string; url: string | null; error?: string }>>([]);

  const generateURLs = async () => {
    if (!apiKey || !cxId) {
      alert('Please enter both API Key and CX ID');
      return;
    }

    setIsProcessing(true);
    setProgress({ current: 0, total: VILLAGE_NAMES.length, success: 0, failed: 0 });
    const fetchedResults: Array<{ village: string; url: string | null; error?: string }> = [];

    // Process villages in batches to avoid rate limits
    const BATCH_SIZE = 10;
    const DELAY_BETWEEN_BATCHES = 1000; // 1 second

    for (let i = 0; i < VILLAGE_NAMES.length; i += BATCH_SIZE) {
      const batch = VILLAGE_NAMES.slice(i, i + BATCH_SIZE);
      
      const batchPromises = batch.map(async (villageName) => {
        try {
          // Improved search query to find official retirement village websites
          // Exclude real estate listing sites
          const query = `"${villageName}" retirement village Victoria -site:domain.com.au -site:realestate.com.au -site:realestateview.com.au -site:aged.com.au -site:retirementliving.org.au`;
          const searchUrl = `https://www.googleapis.com/customsearch/v1?q=${encodeURIComponent(query)}&key=${apiKey}&cx=${cxId}&num=3`;
          
          const response = await fetch(searchUrl);
          const data = await response.json();

          if (data.error) {
            console.error(`Google API error for ${villageName}:`, data.error);
            return { village: villageName, url: null, error: data.error.message };
          }

          // Get top 3 results and try to find the best one
          const items = data.items || [];
          let websiteUrl = null;
          
          // Look for official website indicators
          for (const item of items.slice(0, 3)) {
            const url = item.link.toLowerCase();
            const snippet = item.snippet?.toLowerCase() || '';
            
            // Skip unwanted domains
            if (
              url.includes('domain.com.au') ||
              url.includes('realestate.com.au') ||
              url.includes('realestateview.com.au') ||
              url.includes('aged.com.au') ||
              url.includes('retirementliving.org.au') ||
              url.includes('facebook.com') ||
              url.includes('linkedin.com') ||
              url.includes('google.com')
            ) {
              continue;
            }
            
            // Prefer URLs that look like official sites
            if (
              url.includes(villageName.toLowerCase().replace(/\s+/g, '')) ||
              snippet.includes('retirement village') ||
              snippet.includes('retirement living') ||
              snippet.includes('aged care')
            ) {
              websiteUrl = item.link;
              break;
            }
          }
          
          // If no good match found, use first result (if it exists and isn't blacklisted)
          if (!websiteUrl && items.length > 0) {
            const firstUrl = items[0].link.toLowerCase();
            const isBlacklisted = 
              firstUrl.includes('domain.com.au') ||
              firstUrl.includes('realestate.com.au') ||
              firstUrl.includes('realestateview.com.au') ||
              firstUrl.includes('aged.com.au') ||
              firstUrl.includes('retirementliving.org.au');
            
            if (!isBlacklisted) {
              websiteUrl = items[0].link;
            }
          }
          
          // Save to database
          if (websiteUrl) {
            try {
              await fetch(`https://${projectId}.supabase.co/functions/v1/make-server-3bba8be8/data-enrichment/update-village-url`, {
                method: 'POST',
                headers: {
                  'Content-Type': 'application/json',
                  'Authorization': `Bearer ${publicAnonKey}`
                },
                body: JSON.stringify({ villageName, url: websiteUrl })
              });
            } catch (dbError) {
              console.error(`Database error for ${villageName}:`, dbError);
            }
          }

          return { village: villageName, url: websiteUrl };
        } catch (error) {
          console.error(`Error fetching ${villageName}:`, error);
          return { village: villageName, url: null, error: error instanceof Error ? error.message : 'Unknown error' };
        }
      });

      const batchResults = await Promise.all(batchPromises);
      fetchedResults.push(...batchResults);

      // Update progress
      const successCount = fetchedResults.filter(r => r.url !== null).length;
      const failedCount = fetchedResults.filter(r => r.url === null).length;
      setProgress({
        current: fetchedResults.length,
        total: VILLAGE_NAMES.length,
        success: successCount,
        failed: failedCount
      });

      // Delay between batches (except for the last batch)
      if (i + BATCH_SIZE < VILLAGE_NAMES.length) {
        await new Promise(resolve => setTimeout(resolve, DELAY_BETWEEN_BATCHES));
      }
    }

    setResults(fetchedResults);
    setUrls(fetchedResults.filter(r => r.url).map(r => r.url!));
    setIsProcessing(false);
  };

  const exportData = () => {
    let content = '';
    let filename = '';

    switch (selectedFormat) {
      case 'urls':
        content = urls.join('\n');
        filename = 'google-search-urls.txt';
        break;
      
      case 'csv':
        content = 'Village Name,Search URL\n';
        content += VILLAGE_NAMES.map((name, i) => 
          `"${name}","${urls[i] || ''}"`
        ).join('\n');
        filename = 'google-search-urls.csv';
        break;
      
      case 'json':
        const jsonData = VILLAGE_NAMES.map((name, i) => ({
          villageName: name,
          searchUrl: urls[i] || '',
          query: `${name} retirement village Victoria`
        }));
        content = JSON.stringify(jsonData, null, 2);
        filename = 'google-search-urls.json';
        break;
    }

    const blob = new Blob([content], { type: 'text/plain' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    window.URL.revokeObjectURL(url);
  };

  const copyToClipboard = () => {
    const content = urls.join('\n');
    navigator.clipboard.writeText(content);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="bg-white p-6 rounded-lg shadow-sm border border-blue-200">
      <div className="flex items-center gap-2 mb-4">
        <Search className="size-5 text-blue-600" />
        <h3 className="text-lg font-semibold">🔍 Google Custom Search URL Generator</h3>
      </div>

      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
        <p className="text-sm text-blue-800 mb-2">
          <strong>Generate {VILLAGE_NAMES.length} Google Custom Search API URLs</strong> for Victorian retirement villages
        </p>
        <p className="text-xs text-blue-700">
          Enter your Google API credentials below. Get them from: 
          <a href="https://developers.google.com/custom-search/v1/overview" target="_blank" rel="noopener noreferrer" className="underline ml-1">
            Google Custom Search API
          </a>
        </p>
      </div>

      {/* API Credentials Input */}
      <div className="space-y-4 mb-6">
        <div>
          <label className="block text-sm font-medium mb-2">
            Google API Key
          </label>
          <input
            type="text"
            value={apiKey}
            onChange={(e) => setApiKey(e.target.value)}
            placeholder="AIzaSy..."
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 font-mono text-sm"
          />
        </div>

        <div>
          <label className="block text-sm font-medium mb-2">
            Custom Search Engine ID (CX)
          </label>
          <input
            type="text"
            value={cxId}
            onChange={(e) => setCxId(e.target.value)}
            placeholder="017576662512468239146:omuauf_lfve"
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 font-mono text-sm"
          />
        </div>
      </div>

      {/* Generate Button */}
      <button
        onClick={generateURLs}
        disabled={isProcessing}
        className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors mb-6 disabled:bg-gray-400 disabled:cursor-not-allowed"
      >
        {isProcessing ? (
          <>
            <Loader className="size-4 animate-spin" />
            Processing {progress.current}/{progress.total}...
          </>
        ) : (
          <>
            <Search className="size-4" />
            Generate {VILLAGE_NAMES.length} URLs
          </>
        )}
      </button>

      {/* Processing Progress */}
      {isProcessing && (
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
          <div className="flex items-center gap-2 mb-3">
            <Loader className="size-4 text-blue-600 animate-spin" />
            <h4 className="font-semibold text-sm">Processing Villages...</h4>
          </div>
          
          {/* Progress Bar */}
          <div className="w-full bg-gray-200 rounded-full h-2 mb-3">
            <div 
              className="bg-blue-600 h-2 rounded-full transition-all duration-300"
              style={{ width: `${(progress.current / progress.total) * 100}%` }}
            />
          </div>

          {/* Stats */}
          <div className="grid grid-cols-3 gap-2 text-xs">
            <div className="text-center">
              <div className="font-bold text-blue-700">{progress.current}/{progress.total}</div>
              <div className="text-blue-600">Processed</div>
            </div>
            <div className="text-center">
              <div className="font-bold text-green-700">{progress.success}</div>
              <div className="text-green-600">Success</div>
            </div>
            <div className="text-center">
              <div className="font-bold text-red-700">{progress.failed}</div>
              <div className="text-red-600">Failed</div>
            </div>
          </div>

          {/* Recent Results Preview */}
          {results.length > 0 && (
            <div className="mt-3 space-y-1 max-h-32 overflow-y-auto">
              <div className="text-xs text-blue-700 font-semibold mb-1">Recent Results:</div>
              {results.slice(-3).reverse().map((result, i) => (
                <div key={i} className="text-xs bg-white p-2 rounded border border-blue-100">
                  <div className="font-semibold text-blue-600">{result.village}</div>
                  <div className="text-gray-600 truncate">
                    {result.url ? (
                      <span className="text-green-600">✓ {result.url}</span>
                    ) : (
                      <span className="text-red-600">✗ {result.error || 'No URL found'}</span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Results */}
      {urls.length > 0 && (
        <div className="space-y-4">
          {/* Format Selection */}
          <div>
            <label className="block text-sm font-medium mb-2">Export Format</label>
            <div className="flex gap-2">
              <button
                onClick={() => setSelectedFormat('urls')}
                className={`flex-1 px-3 py-2 rounded-lg border transition-colors ${
                  selectedFormat === 'urls'
                    ? 'bg-blue-600 text-white border-blue-600'
                    : 'bg-white text-gray-700 border-gray-300 hover:border-blue-400'
                }`}
              >
                URLs Only
              </button>
              <button
                onClick={() => setSelectedFormat('csv')}
                className={`flex-1 px-3 py-2 rounded-lg border transition-colors ${
                  selectedFormat === 'csv'
                    ? 'bg-blue-600 text-white border-blue-600'
                    : 'bg-white text-gray-700 border-gray-300 hover:border-blue-400'
                }`}
              >
                CSV
              </button>
              <button
                onClick={() => setSelectedFormat('json')}
                className={`flex-1 px-3 py-2 rounded-lg border transition-colors ${
                  selectedFormat === 'json'
                    ? 'bg-blue-600 text-white border-blue-600'
                    : 'bg-white text-gray-700 border-gray-300 hover:border-blue-400'
                }`}
              >
                JSON
              </button>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex gap-2">
            <button
              onClick={copyToClipboard}
              className="flex-1 flex items-center justify-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
            >
              {copied ? (
                <>
                  <Check className="size-4" />
                  Copied!
                </>
              ) : (
                <>
                  <Copy className="size-4" />
                  Copy URLs
                </>
              )}
            </button>
            <button
              onClick={exportData}
              className="flex-1 flex items-center justify-center gap-2 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
            >
              <Download className="size-4" />
              Download {selectedFormat.toUpperCase()}
            </button>
          </div>

          {/* Preview */}
          <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
            <div className="flex items-center justify-between mb-2">
              <h4 className="font-semibold text-sm">Preview ({urls.length} URLs)</h4>
              <span className="text-xs text-gray-500">
                Showing first 5 of {urls.length}
              </span>
            </div>
            <div className="space-y-2 max-h-60 overflow-y-auto">
              {urls.slice(0, 5).map((url, i) => (
                <div key={i} className="text-xs font-mono bg-white p-2 rounded border border-gray-200 break-all">
                  <div className="text-blue-600 font-semibold mb-1">{VILLAGE_NAMES[i]}</div>
                  <div className="text-gray-600">{url}</div>
                </div>
              ))}
              {urls.length > 5 && (
                <div className="text-xs text-gray-500 text-center py-2">
                  ... and {urls.length - 5} more
                </div>
              )}
            </div>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-3 gap-4 p-4 bg-green-50 border border-green-200 rounded-lg">
            <div className="text-center">
              <div className="text-2xl font-bold text-green-700">{progress.success}</div>
              <div className="text-xs text-green-600">URLs Found</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-red-700">{progress.failed}</div>
              <div className="text-xs text-red-600">Failed</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-blue-700">{Math.round((progress.success / progress.total) * 100)}%</div>
              <div className="text-xs text-blue-600">Success Rate</div>
            </div>
          </div>

          {/* Success Message */}
          <div className="bg-green-50 border border-green-200 rounded-lg p-4">
            <h4 className="font-semibold text-sm mb-2 text-green-800">✅ Processing Complete!</h4>
            <p className="text-xs text-green-700">
              Successfully generated and saved {progress.success} village URLs to the database.
              {progress.failed > 0 && ` ${progress.failed} villages could not be found and may need manual URL entry.`}
            </p>
          </div>
        </div>
      )}
    </div>
  );
}