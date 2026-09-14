import React, { useState } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '../ui/card';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Badge } from '../ui/badge';
import { Loader2, Bug, Search, CheckCircle, XCircle } from 'lucide-react';
import { projectId, publicAnonKey } from '../../utils/supabase/info';

interface DiagnosticResult {
  villageName: string;
  suburb: string;
  streetAddress: string;
  searchQuery: string;
  searchResults: any[];
  scrapedOperator: string | null;
  matchedOperator: string | null;
  confidence: number;
  error?: string;
}

export function OperatorScraperDiagnostic() {
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<DiagnosticResult | null>(null);
  const [error, setError] = useState<string | null>(null);

  // Test data
  const [villageName, setVillageName] = useState('Aberlea Aged Care Facility');
  const [suburb, setSuburb] = useState('Hawthorn East');
  const [streetAddress, setStreetAddress] = useState('11 Manningtree Road');

  const testScrape = async () => {
    setLoading(true);
    setError(null);
    setResult(null);

    try {
      console.log('🔍 Testing scrape for:', { villageName, suburb, streetAddress });

      // Load operators from localStorage (118 whitelist)
      const savedOperators = localStorage.getItem('operatorScrapingOperators');
      if (!savedOperators) {
        throw new Error('No operator whitelist found. Please upload the 118-operator CSV in the Operator Scraper tab first.');
      }

      const operators = JSON.parse(savedOperators);
      const operatorWhitelist = operators.map((o: any) => o.name);

      console.log('📋 Using whitelist:', operatorWhitelist.length, 'operators');

      const response = await fetch(
        `https://${projectId}.supabase.co/functions/v1/make-server-3bba8be8/operator-scraper/scrape`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${publicAnonKey}`,
          },
          body: JSON.stringify({
            villageName,
            suburb,
            streetAddress,
            operatorWhitelist,
          }),
        }
      );

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`HTTP ${response.status}: ${errorText}`);
      }

      const data = await response.json();

      console.log('✅ Scrape result:', data);

      setResult({
        villageName,
        suburb,
        streetAddress,
        searchQuery: streetAddress 
          ? `"${villageName}" "${streetAddress}" ${suburb} VIC`
          : `"${villageName}" ${suburb} VIC retirement village`,
        searchResults: [],
        scrapedOperator: data.scrapedOperator,
        matchedOperator: data.matchedOperator,
        confidence: data.confidence,
        error: data.error,
      });

    } catch (err: any) {
      console.error('❌ Test scrape failed:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card className="p-6 bg-gradient-to-r from-yellow-50 to-orange-50 border-2 border-yellow-400">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-yellow-900">
          <Bug className="size-5" />
          🐛 Operator Scraper Diagnostic
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="text-sm text-gray-700 mb-4">
          Test a single village to see what the scraper is finding. This helps debug why operators aren't being detected.
        </div>

        <div className="space-y-3">
          <div>
            <label className="text-sm font-medium text-gray-700">Village Name</label>
            <Input
              value={villageName}
              onChange={(e) => setVillageName(e.target.value)}
              placeholder="e.g., Aberlea Aged Care Facility"
            />
          </div>

          <div>
            <label className="text-sm font-medium text-gray-700">Suburb</label>
            <Input
              value={suburb}
              onChange={(e) => setSuburb(e.target.value)}
              placeholder="e.g., Hawthorn East"
            />
          </div>

          <div>
            <label className="text-sm font-medium text-gray-700">Street Address</label>
            <Input
              value={streetAddress}
              onChange={(e) => setStreetAddress(e.target.value)}
              placeholder="e.g., 11 Manningtree Road"
            />
          </div>
        </div>

        <Button 
          onClick={testScrape} 
          disabled={loading || !villageName || !suburb}
          className="w-full"
        >
          {loading ? (
            <>
              <Loader2 className="size-4 mr-2 animate-spin" />
              Scraping...
            </>
          ) : (
            <>
              <Search className="size-4 mr-2" />
              Test Scrape
            </>
          )}
        </Button>

        {error && (
          <div className="p-3 bg-red-100 border border-red-400 rounded text-red-800 text-sm">
            ❌ {error}
          </div>
        )}

        {result && (
          <div className="space-y-3 p-4 bg-white rounded-lg border">
            <div>
              <div className="text-sm font-semibold text-gray-700">Search Query:</div>
              <div className="text-sm text-gray-600 font-mono bg-gray-50 p-2 rounded">
                {result.searchQuery}
              </div>
            </div>

            <div className="flex items-center gap-2">
              <div className="text-sm font-semibold text-gray-700">Result:</div>
              {result.matchedOperator ? (
                <Badge className="bg-green-500">
                  <CheckCircle className="size-3 mr-1" />
                  Found Operator
                </Badge>
              ) : (
                <Badge className="bg-red-500">
                  <XCircle className="size-3 mr-1" />
                  No Match
                </Badge>
              )}
            </div>

            {result.matchedOperator && (
              <div>
                <div className="text-sm font-semibold text-gray-700">Matched Operator:</div>
                <div className="text-lg font-bold text-green-700">
                  {result.matchedOperator}
                </div>
                <div className="text-xs text-gray-500">
                  Confidence: {result.confidence}%
                </div>
              </div>
            )}

            {!result.matchedOperator && (
              <div className="text-sm text-red-600">
                ⚠️ No operator found in search results. The village website may not mention the operator name, or the operator might not be in the 118-whitelist.
              </div>
            )}

            {result.error && (
              <div className="text-sm text-red-600">
                Error: {result.error}
              </div>
            )}

            <div className="pt-3 border-t">
              <div className="text-xs text-gray-500">
                💡 Check the browser console (F12) for detailed logs showing:
                <ul className="list-disc ml-5 mt-1">
                  <li>Google search results</li>
                  <li>URL domains checked</li>
                  <li>Text snippets analyzed</li>
                  <li>Whitelist operators tried</li>
                </ul>
              </div>
            </div>
          </div>
        )}

        <div className="text-xs text-gray-500 pt-3 border-t">
          <strong>Troubleshooting Tips:</strong>
          <ul className="list-disc ml-5 mt-1 space-y-1">
            <li>Make sure you uploaded the 118-operator whitelist CSV first</li>
            <li>Check if the operator name appears on the village's website</li>
            <li>Some villages are independently operated (no operator company)</li>
            <li>Street addresses help find the correct website in Google results</li>
          </ul>
        </div>
      </CardContent>
    </Card>
  );
}
