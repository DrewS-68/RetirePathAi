import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';
import { Badge } from '../ui/badge';
import { Loader2, Play, CheckCircle, XCircle, Zap, AlertCircle } from 'lucide-react';
import { Alert, AlertDescription } from '../ui/alert';
import { projectId, publicAnonKey } from '../../utils/supabase/info';

interface ScrapeResult {
  id: string;
  name: string;
  suburb: string;
  operator: string | null;
  method: string;
  confidence: number;
  updated: boolean;
  error?: string;
}

interface ScrapeSummary {
  success: boolean;
  processed: number;
  found: number;
  notFound: number;
  results: ScrapeResult[];
}

export function SmartOperatorScraper() {
  const [scraping, setScraping] = useState(false);
  const [selectedState, setSelectedState] = useState<string>('VIC');
  const [summary, setSummary] = useState<ScrapeSummary | null>(null);
  const [stats, setStats] = useState<any>(null);
  const [operatorWhitelist, setOperatorWhitelist] = useState<string[]>([]);
  const [loadingWhitelist, setLoadingWhitelist] = useState(false);
  
  // Load operator whitelist on mount
  useEffect(() => {
    loadOperatorWhitelist();
  }, []);
  
  // Load stats
  useEffect(() => {
    loadStats();
  }, []);
  
  async function loadOperatorWhitelist() {
    setLoadingWhitelist(true);
    try {
      const response = await fetch(
        `https://${projectId}.supabase.co/functions/v1/make-server-3bba8be8/vic-operator-whitelist/operators`,
        {
          headers: {
            'Authorization': `Bearer ${publicAnonKey}`,
          },
        }
      );
      
      if (!response.ok) {
        console.warn('Whitelist not available - continuing without it');
        setOperatorWhitelist([]);
        return;
      }
      
      const data = await response.json();
      setOperatorWhitelist(data.operators || []);
    } catch (error) {
      console.warn('Error loading whitelist - continuing without it:', error);
      setOperatorWhitelist([]);
    } finally {
      setLoadingWhitelist(false);
    }
  }
  
  async function loadStats() {
    try {
      const response = await fetch(
        `https://${projectId}.supabase.co/functions/v1/make-server-3bba8be8/smart-operator-scraper/stats`,
        {
          headers: {
            'Authorization': `Bearer ${publicAnonKey}`,
          },
        }
      );
      
      if (!response.ok) {
        throw new Error('Failed to load stats');
      }
      
      const data = await response.json();
      setStats(data);
    } catch (error) {
      console.error('Error loading stats:', error);
    }
  }
  
  async function runSmartScraper() {
    if (operatorWhitelist.length === 0) {
      alert('Please load operator whitelist first');
      return;
    }
    
    setScraping(true);
    setSummary(null);
    
    try {
      console.log(`🚀 Starting smart operator scraping for ${selectedState}...`);
      
      const response = await fetch(
        `https://${projectId}.supabase.co/functions/v1/make-server-3bba8be8/smart-operator-scraper/scrape-missing`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${publicAnonKey}`,
          },
          body: JSON.stringify({
            state: selectedState,
            operatorWhitelist: operatorWhitelist,
          }),
        }
      );
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to scrape operators');
      }
      
      const data = await response.json();
      setSummary(data);
      
      // Reload stats after scraping
      await loadStats();
      
      console.log('✅ Smart scraping complete:', data);
    } catch (error) {
      console.error('Error running smart scraper:', error);
      alert(`Error: ${error instanceof Error ? error.message : 'Unknown error'}`);
    } finally {
      setScraping(false);
    }
  }
  
  const getMethodBadge = (method: string) => {
    const methodColors: Record<string, string> = {
      'village_name': 'bg-purple-500',
      'url_domain': 'bg-blue-500',
      'google_search_url': 'bg-green-500',
      'google_search_text': 'bg-green-400',
      'website_copyright': 'bg-orange-500',
      'website_operated_by': 'bg-orange-600',
      'website_meta': 'bg-yellow-500',
      'website_frequency': 'bg-yellow-400',
      'none': 'bg-gray-500',
    };
    
    const methodLabels: Record<string, string> = {
      'village_name': 'Name',
      'url_domain': 'URL',
      'google_search_url': 'Google URL',
      'google_search_text': 'Google Text',
      'website_copyright': 'Copyright',
      'website_operated_by': 'Operated By',
      'website_meta': 'Meta Tags',
      'website_frequency': 'Frequency',
      'none': 'Not Found',
    };
    
    return (
      <Badge className={`${methodColors[method] || 'bg-gray-500'} text-white text-xs`}>
        {methodLabels[method] || method}
      </Badge>
    );
  };
  
  return (
    <Card className="border-2 border-yellow-500">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              <Zap className="w-5 h-5 text-yellow-500" />
              🧠 Smart Operator Scraper (Multi-Strategy)
            </CardTitle>
            <CardDescription>
              Advanced operator detection using 4 strategies: Name → URL → Google → Website HTML
            </CardDescription>
          </div>
          {operatorWhitelist.length > 0 && (
            <Badge variant="outline" className="text-sm">
              {operatorWhitelist.length} operators loaded
            </Badge>
          )}
        </div>
      </CardHeader>
      
      <CardContent className="space-y-4">
        {/* Whitelist Status */}
        {loadingWhitelist && (
          <Alert>
            <Loader2 className="w-4 h-4 animate-spin" />
            <AlertDescription>Loading operator whitelist...</AlertDescription>
          </Alert>
        )}
        
        {!loadingWhitelist && operatorWhitelist.length === 0 && (
          <Alert>
            <AlertCircle className="w-4 h-4" />
            <AlertDescription>
              No operators in whitelist. Please add operators first.
            </AlertDescription>
          </Alert>
        )}
        
        {/* Stats Display */}
        {stats && (
          <div className="bg-gray-50 p-4 rounded-lg">
            <h3 className="font-semibold mb-2">Missing Operators by State</h3>
            <div className="grid grid-cols-2 md:grid-cols-5 gap-2">
              {Object.entries(stats.byState || {}).map(([state, count]) => (
                <div key={state} className="text-center p-2 bg-white rounded border">
                  <div className="text-2xl font-bold text-blue-600">{count as number}</div>
                  <div className="text-xs text-gray-600">{state}</div>
                </div>
              ))}
            </div>
            <div className="mt-2 text-sm text-gray-600">
              Total missing: <strong>{stats.totalMissing}</strong>
            </div>
          </div>
        )}
        
        {/* State Selection */}
        <div className="space-y-2">
          <label className="text-sm font-medium">Select State</label>
          <div className="flex gap-2">
            {['VIC', 'NSW', 'QLD', 'SA', 'WA'].map((state) => (
              <Button
                key={state}
                variant={selectedState === state ? 'default' : 'outline'}
                size="sm"
                onClick={() => setSelectedState(state)}
              >
                {state}
              </Button>
            ))}
          </div>
        </div>
        
        {/* Strategy Explanation */}
        <div className="bg-blue-50 p-4 rounded-lg space-y-2">
          <h4 className="font-semibold text-sm text-blue-900">🎯 Detection Strategies (in order)</h4>
          <div className="text-xs space-y-1 text-blue-800">
            <div className="flex items-start gap-2">
              <span className="font-semibold">1. Village Name:</span>
              <span>Checks if village name starts with operator (e.g., "Levande Patterson Lakes" → Levande)</span>
            </div>
            <div className="flex items-start gap-2">
              <span className="font-semibold">2. Website URL:</span>
              <span>Extracts operator from domain (e.g., "rymanhealthcare.com.au" → Ryman Healthcare)</span>
            </div>
            <div className="flex items-start gap-2">
              <span className="font-semibold">3. Google Search:</span>
              <span>Searches Google with street address + village name, extracts operator from results</span>
            </div>
            <div className="flex items-start gap-2">
              <span className="font-semibold">4. Website Scraping:</span>
              <span>Scrapes village website HTML for copyright, "operated by", meta tags, and frequency analysis</span>
            </div>
          </div>
          <div className="text-xs text-blue-700 mt-2 pt-2 border-t border-blue-200">
            ✅ All matches are validated against the operator whitelist to prevent false positives
          </div>
        </div>
        
        {/* Run Button */}
        <Button
          onClick={runSmartScraper}
          disabled={scraping || operatorWhitelist.length === 0}
          className="w-full"
          size="lg"
        >
          {scraping ? (
            <>
              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              Scraping {selectedState} (this may take several minutes)...
            </>
          ) : (
            <>
              <Play className="w-4 h-4 mr-2" />
              Run Smart Scraper for {selectedState}
            </>
          )}
        </Button>
        
        {/* Results Summary */}
        {summary && (
          <div className="space-y-4 mt-6">
            <div className="grid grid-cols-3 gap-4">
              <div className="bg-blue-50 p-4 rounded-lg text-center">
                <div className="text-3xl font-bold text-blue-600">{summary.processed}</div>
                <div className="text-sm text-gray-600">Processed</div>
              </div>
              <div className="bg-green-50 p-4 rounded-lg text-center">
                <div className="text-3xl font-bold text-green-600">{summary.found}</div>
                <div className="text-sm text-gray-600">Found</div>
              </div>
              <div className="bg-red-50 p-4 rounded-lg text-center">
                <div className="text-3xl font-bold text-red-600">{summary.notFound}</div>
                <div className="text-sm text-gray-600">Not Found</div>
              </div>
            </div>
            
            <div className="text-center">
              <div className="text-2xl font-bold">
                {summary.processed > 0 ? Math.round((summary.found / summary.processed) * 100) : 0}%
              </div>
              <div className="text-sm text-gray-600">Success Rate</div>
            </div>
            
            {/* Method Breakdown */}
            <div className="bg-gray-50 p-4 rounded-lg">
              <h4 className="font-semibold mb-2">Detection Methods Used</h4>
              <div className="space-y-2">
                {Object.entries(
                  summary.results.reduce((acc, result) => {
                    acc[result.method] = (acc[result.method] || 0) + 1;
                    return acc;
                  }, {} as Record<string, number>)
                ).map(([method, count]) => (
                  <div key={method} className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      {getMethodBadge(method)}
                      <span className="text-sm">{method === 'none' ? 'Not Found' : method.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}</span>
                    </div>
                    <Badge variant="outline">{count}</Badge>
                  </div>
                ))}
              </div>
            </div>
            
            {/* Detailed Results */}
            <div className="space-y-2 max-h-96 overflow-y-auto">
              <h4 className="font-semibold sticky top-0 bg-white py-2">Detailed Results</h4>
              {summary.results.map((result, index) => (
                <div
                  key={index}
                  className={`p-3 rounded-lg border-l-4 ${
                    result.operator
                      ? 'bg-green-50 border-green-500'
                      : 'bg-red-50 border-red-500'
                  }`}
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="font-semibold">{result.name}</div>
                      <div className="text-sm text-gray-600">{result.suburb}</div>
                      {result.operator && (
                        <div className="flex items-center gap-2 mt-1">
                          <CheckCircle className="w-4 h-4 text-green-600" />
                          <span className="font-medium text-green-700">{result.operator}</span>
                          <Badge variant="outline" className="text-xs">
                            {result.confidence}% confidence
                          </Badge>
                        </div>
                      )}
                      {!result.operator && (
                        <div className="flex items-center gap-2 mt-1">
                          <XCircle className="w-4 h-4 text-red-600" />
                          <span className="text-red-700">Not found</span>
                        </div>
                      )}
                      {result.error && (
                        <div className="text-xs text-red-600 mt-1">{result.error}</div>
                      )}
                    </div>
                    <div className="flex flex-col items-end gap-1">
                      {getMethodBadge(result.method)}
                      {result.updated && <Badge className="bg-green-500 text-white text-xs">Updated</Badge>}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}