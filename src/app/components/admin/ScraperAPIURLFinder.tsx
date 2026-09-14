import React, { useState } from 'react';
import { Search, Loader, Check, AlertCircle, Download } from 'lucide-react';
import { projectId, publicAnonKey } from '../../utils/supabase/info';

/**
 * ScraperAPI URL Finder (DuckDuckGo Edition)
 * Uses ScraperAPI to scrape DuckDuckGo search results and find retirement village websites
 * No Google API quota limits - uses your existing ScraperAPI credits
 * Based on Copilot workflow - cheaper and no daily limits!
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

interface Result {
  village: string;
  url: string | null;
  error?: string;
  scraperApiUsed?: boolean;
}

export function ScraperAPIURLFinder() {
  const [isProcessing, setIsProcessing] = useState(false);
  const [progress, setProgress] = useState({ current: 0, total: 0, success: 0, failed: 0 });
  const [results, setResults] = useState<Result[]>([]);
  const [isPaused, setIsPaused] = useState(false);
  const [isExporting, setIsExporting] = useState(false);

  const findURLs = async () => {
    setIsProcessing(true);
    setIsPaused(false);
    setProgress({ current: 0, total: VILLAGE_NAMES.length, success: 0, failed: 0 });
    const fetchedResults: Result[] = [];

    // Process in smaller batches to avoid rate limits
    const BATCH_SIZE = 5;
    const DELAY_BETWEEN_BATCHES = 3000; // 3 seconds between batches

    for (let i = 0; i < VILLAGE_NAMES.length; i += BATCH_SIZE) {
      if (isPaused) {
        console.log('⏸️ Scraping paused by user');
        break;
      }

      const batch = VILLAGE_NAMES.slice(i, i + BATCH_SIZE);
      
      const batchPromises = batch.map(async (villageName) => {
        try {
          // Call backend to scrape Google search results via ScraperAPI
          const response = await fetch(
            `https://${projectId}.supabase.co/functions/v1/make-server-3bba8be8/scraper/find-url-google`,
            {
              method: 'POST',
              headers: {
                'Authorization': `Bearer ${publicAnonKey}`,
                'Content-Type': 'application/json',
              },
              body: JSON.stringify({ villageName })
            }
          );

          if (!response.ok) {
            const errorData = await response.json();
            console.error(`❌ Error for ${villageName}:`, errorData);
            return { 
              village: villageName, 
              url: null, 
              error: errorData.error || 'Server error',
              scraperApiUsed: true
            };
          }

          const data = await response.json();
          
          return { 
            village: villageName, 
            url: data.url || null,
            error: data.url ? undefined : 'No URL found',
            scraperApiUsed: true
          };
        } catch (error) {
          console.error(`❌ Exception for ${villageName}:`, error);
          return { 
            village: villageName, 
            url: null, 
            error: error instanceof Error ? error.message : 'Unknown error',
            scraperApiUsed: false
          };
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

      setResults([...fetchedResults]);

      // Delay between batches (except for the last batch)
      if (i + BATCH_SIZE < VILLAGE_NAMES.length && !isPaused) {
        console.log(`⏳ Waiting 3 seconds before next batch...`);
        await new Promise(resolve => setTimeout(resolve, DELAY_BETWEEN_BATCHES));
      }
    }

    setIsProcessing(false);
  };

  const pauseScraping = () => {
    setIsPaused(true);
    setIsProcessing(false);
  };

  const exportResults = () => {
    const csv = 'Village Name,URL,Status\n' + 
      results.map(r => `"${r.village}","${r.url || ''}","${r.url ? 'Found' : 'Failed'}"`).join('\n');
    
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'scraperapi-village-urls.csv';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    window.URL.revokeObjectURL(url);
  };

  // Export what's currently in the database for these 220 villages
  const exportFromDatabase = async () => {
    setIsExporting(true);
    try {
      const response = await fetch(
        `https://${projectId}.supabase.co/functions/v1/make-server-3bba8be8/scraper/export-scraped-urls`,
        {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${publicAnonKey}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ villageNames: VILLAGE_NAMES })
        }
      );

      const data = await response.json();
      
      if (!response.ok || data.error) {
        console.error('Export error:', data);
        alert('Failed to export: ' + (data.error || 'Unknown error'));
        setIsExporting(false);
        return;
      }
      
      // Create CSV from database results
      const csv = 'Village Name,URL,Status\n' + 
        data.villages.map((v: any) => 
          `"${v.name}","${v.website || ''}","${v.website ? 'Found' : 'Not Found'}"`
        ).join('\n');
      
      const blob = new Blob([csv], { type: 'text/csv' });
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `scraped-urls-from-database-${new Date().toISOString().split('T')[0]}.csv`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      window.URL.revokeObjectURL(url);
      
      alert(`✅ Exported ${data.villages.length} villages!\n${data.withUrls} have URLs, ${data.withoutUrls} missing URLs.`);
    } catch (error) {
      console.error('Export error:', error);
      alert('Failed to export from database');
    } finally {
      setIsExporting(false);
    }
  };

  return (
    <div className="bg-white p-6 rounded-lg shadow-sm border border-purple-200">
      <div className="flex items-center gap-2 mb-4">
        <Search className="size-5 text-purple-600" />
        <h3 className="text-lg font-semibold">🦆 ScraperAPI + DuckDuckGo URL Finder</h3>
      </div>

      <div className="bg-purple-50 border border-purple-200 rounded-lg p-4 mb-6">
        <p className="text-sm text-purple-800 mb-2">
          <strong>🦆 Find {VILLAGE_NAMES.length} URLs using ScraperAPI + DuckDuckGo</strong>
        </p>
        <p className="text-xs text-purple-700">
          ✅ Uses your existing ScraperAPI subscription<br/>
          ✅ No Google quota limits or billing required<br/>
          ✅ Scrapes DuckDuckGo HTML (free, no API keys needed)<br/>
          ✅ Filters out real estate sites automatically<br/>
          ✅ Saves URLs directly to database
        </p>
      </div>

      {/* Control Buttons */}
      <div className="flex gap-2 mb-6">
        <button
          onClick={findURLs}
          disabled={isProcessing}
          className="flex-1 flex items-center justify-center gap-2 px-4 py-3 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors disabled:bg-gray-400 disabled:cursor-not-allowed"
        >
          {isProcessing ? (
            <>
              <Loader className="size-4 animate-spin" />
              Processing {progress.current}/{progress.total}...
            </>
          ) : (
            <>
              <Search className="size-4" />
              Start Finding URLs
            </>
          )}
        </button>

        {isProcessing && (
          <button
            onClick={pauseScraping}
            className="px-4 py-3 bg-orange-600 text-white rounded-lg hover:bg-orange-700 transition-colors"
          >
            Pause
          </button>
        )}

        {results.length > 0 && !isProcessing && (
          <button
            onClick={exportResults}
            className="px-4 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors flex items-center gap-2"
          >
            <Download className="size-4" />
            Export CSV
          </button>
        )}

        {isExporting ? (
          <button
            className="px-4 py-3 bg-gray-400 text-white rounded-lg hover:bg-gray-500 transition-colors cursor-not-allowed"
          >
            <Loader className="size-4 animate-spin" />
            Exporting...
          </button>
        ) : (
          <button
            onClick={exportFromDatabase}
            className="px-4 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2"
          >
            <Download className="size-4" />
            Export from Database
          </button>
        )}
      </div>

      {/* Processing Progress */}
      {(isProcessing || results.length > 0) && (
        <div className="bg-purple-50 border border-purple-200 rounded-lg p-4 mb-6">
          <div className="flex items-center gap-2 mb-3">
            {isProcessing ? (
              <>
                <Loader className="size-4 text-purple-600 animate-spin" />
                <h4 className="font-semibold text-sm">Processing Villages...</h4>
              </>
            ) : (
              <>
                <Check className="size-4 text-green-600" />
                <h4 className="font-semibold text-sm">Processing Complete</h4>
              </>
            )}
          </div>
          
          {/* Progress Bar */}
          <div className="w-full bg-gray-200 rounded-full h-2 mb-3">
            <div 
              className="bg-purple-600 h-2 rounded-full transition-all duration-300"
              style={{ width: `${(progress.current / progress.total) * 100}%` }}
            />
          </div>

          {/* Stats */}
          <div className="grid grid-cols-4 gap-2 text-xs mb-3">
            <div className="text-center">
              <div className="font-bold text-purple-700">{progress.current}/{progress.total}</div>
              <div className="text-purple-600">Processed</div>
            </div>
            <div className="text-center">
              <div className="font-bold text-green-700">{progress.success}</div>
              <div className="text-green-600">Found</div>
            </div>
            <div className="text-center">
              <div className="font-bold text-red-700">{progress.failed}</div>
              <div className="text-red-600">Failed</div>
            </div>
            <div className="text-center">
              <div className="font-bold text-blue-700">{Math.round((progress.success / Math.max(progress.total, 1)) * 100)}%</div>
              <div className="text-blue-600">Success</div>
            </div>
          </div>

          {/* Recent Results Preview */}
          {results.length > 0 && (
            <div className="space-y-1 max-h-48 overflow-y-auto">
              <div className="text-xs text-purple-700 font-semibold mb-1">Recent Results:</div>
              {results.slice(-5).reverse().map((result, i) => (
                <div key={i} className="text-xs bg-white p-2 rounded border border-purple-100">
                  <div className="font-semibold text-purple-600 flex items-center gap-2">
                    {result.url ? (
                      <Check className="size-3 text-green-600" />
                    ) : (
                      <AlertCircle className="size-3 text-red-600" />
                    )}
                    {result.village}
                  </div>
                  <div className="text-gray-600 truncate mt-1">
                    {result.url ? (
                      <a href={result.url} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">
                        {result.url}
                      </a>
                    ) : (
                      <span className="text-red-600">{result.error || 'No URL found'}</span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Final Summary */}
      {!isProcessing && results.length > 0 && (
        <div className={`border rounded-lg p-4 ${
          progress.success > 0 ? 'bg-green-50 border-green-200' : 'bg-red-50 border-red-200'
        }`}>
          <h4 className={`font-semibold text-sm mb-2 ${
            progress.success > 0 ? 'text-green-800' : 'text-red-800'
          }`}>
            {progress.success > 0 ? '✅ URLs Found!' : '❌ No URLs Found'}
          </h4>
          <p className={`text-xs ${
            progress.success > 0 ? 'text-green-700' : 'text-red-700'
          }`}>
            Found {progress.success} out of {progress.total} village URLs ({Math.round((progress.success / progress.total) * 100)}% success rate)
            {progress.success > 0 && ' and saved them to the database.'}
          </p>
        </div>
      )}
    </div>
  );
}