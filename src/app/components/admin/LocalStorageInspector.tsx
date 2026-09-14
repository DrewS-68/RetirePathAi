import React, { useState } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '../ui/card';
import { Button } from '../ui/button';
import { Badge } from '../ui/badge';
import { Eye, Download, Trash2 } from 'lucide-react';

interface ScrapeResult {
  village: {
    name: string;
    suburb: string;
    postcode: string;
    streetAddress?: string;
  };
  scrapedOperator: string | null;
  matchedOperator: string | null;
  confidence: number;
  status: 'matched' | 'no_match' | 'pending';
}

export function LocalStorageInspector() {
  const [results, setResults] = useState<ScrapeResult[]>([]);
  const [showingResults, setShowingResults] = useState(false);

  const loadFromLocalStorage = () => {
    const savedResults = localStorage.getItem('operatorScrapingResults');
    if (savedResults) {
      try {
        const parsed = JSON.parse(savedResults);
        setResults(parsed);
        setShowingResults(true);
        console.log('📦 Loaded results from localStorage:', parsed);
      } catch (err) {
        alert('Failed to parse localStorage data');
        console.error(err);
      }
    } else {
      alert('No saved results found in localStorage');
    }
  };

  const exportToJSON = () => {
    const dataStr = JSON.stringify(results, null, 2);
    const dataBlob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(dataBlob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `operator-scraping-results-${Date.now()}.json`;
    link.click();
  };

  const clearLocalStorage = () => {
    if (confirm('⚠️ This will delete all saved scraping results from localStorage. Continue?')) {
      localStorage.removeItem('operatorScrapingResults');
      localStorage.removeItem('operatorScrapingProgress');
      localStorage.removeItem('operatorScrapingVillages');
      localStorage.removeItem('operatorScrapingOperators');
      setResults([]);
      setShowingResults(false);
      alert('✅ localStorage cleared');
    }
  };

  const matched = results.filter(r => r.status === 'matched');
  const noMatch = results.filter(r => r.status === 'no_match');
  const withAddresses = results.filter(r => r.village.streetAddress);

  return (
    <Card className="p-6 bg-gradient-to-r from-gray-50 to-slate-50 border-2 border-gray-400">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-gray-900">
          <Eye className="size-5" />
          🔍 LocalStorage Inspector
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="text-sm text-gray-700 mb-4">
          View what's actually saved in your browser's localStorage from the Operator Scraper.
        </div>

        <div className="flex gap-2">
          <Button onClick={loadFromLocalStorage} className="flex-1">
            <Eye className="size-4 mr-2" />
            Load From Storage
          </Button>

          {showingResults && (
            <>
              <Button onClick={exportToJSON} variant="outline">
                <Download className="size-4 mr-2" />
                Export JSON
              </Button>
              <Button onClick={clearLocalStorage} variant="destructive">
                <Trash2 className="size-4 mr-2" />
                Clear
              </Button>
            </>
          )}
        </div>

        {showingResults && (
          <div className="space-y-3">
            <div className="grid grid-cols-3 gap-3">
              <div className="p-3 bg-white rounded border">
                <div className="text-2xl font-bold text-gray-900">{results.length}</div>
                <div className="text-xs text-gray-600">Total Results</div>
              </div>
              <div className="p-3 bg-green-50 rounded border border-green-300">
                <div className="text-2xl font-bold text-green-700">{matched.length}</div>
                <div className="text-xs text-gray-600">Matched</div>
              </div>
              <div className="p-3 bg-red-50 rounded border border-red-300">
                <div className="text-2xl font-bold text-red-700">{noMatch.length}</div>
                <div className="text-xs text-gray-600">No Match</div>
              </div>
            </div>

            <div className="p-3 bg-blue-50 rounded border border-blue-300">
              <div className="text-sm font-semibold text-blue-900">
                📍 {withAddresses.length} villages have street addresses
              </div>
              <div className="text-xs text-blue-700 mt-1">
                {withAddresses.length > 0 
                  ? `${((withAddresses.length / results.length) * 100).toFixed(0)}% of villages have addresses from VIC Gov CSV`
                  : 'No street addresses found - did you upload the VIC Gov CSV?'
                }
              </div>
            </div>

            {/* Show sample villages with addresses */}
            {withAddresses.length > 0 && (
              <div className="p-3 bg-white rounded border space-y-2">
                <div className="text-sm font-semibold text-gray-700">
                  Sample Villages with Addresses:
                </div>
                <div className="space-y-2 max-h-64 overflow-y-auto">
                  {withAddresses.slice(0, 10).map((r, i) => (
                    <div key={i} className="text-xs p-2 bg-gray-50 rounded">
                      <div className="font-semibold">{r.village.name}</div>
                      <div className="text-gray-600">
                        📍 {r.village.streetAddress}, {r.village.suburb}
                      </div>
                      <div className="mt-1">
                        {r.matchedOperator ? (
                          <Badge className="bg-green-500 text-xs">✅ {r.matchedOperator}</Badge>
                        ) : (
                          <Badge className="bg-red-500 text-xs">❌ No Match</Badge>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Show sample villages WITHOUT addresses */}
            {results.length > withAddresses.length && (
              <div className="p-3 bg-yellow-50 rounded border border-yellow-300 space-y-2">
                <div className="text-sm font-semibold text-yellow-900">
                  ⚠️ {results.length - withAddresses.length} villages missing addresses
                </div>
                <div className="text-xs text-yellow-700">
                  These villages won't get the benefit of street address in Google search
                </div>
              </div>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
