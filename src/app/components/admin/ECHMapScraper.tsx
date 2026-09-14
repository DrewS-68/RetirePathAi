import React, { useState } from 'react';
import { Button } from '../ui/button';
import { AlertCircle, Download, CheckCircle, Loader2 } from 'lucide-react';
import { Alert, AlertDescription } from '../ui/alert';
import { projectId, publicAnonKey } from '../../utils/supabase/info';

interface ScrapedVillage {
  name: string;
  suburb: string;
  state: string;
  operator: string;
  facility_type: string;
}

export function ECHMapScraper() {
  const [loading, setLoading] = useState(false);
  const [scraping, setScraping] = useState(false);
  const [importing, setImporting] = useState(false);
  const [villages, setVillages] = useState<ScrapedVillage[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [importResult, setImportResult] = useState<{
    imported: number;
    skipped: number;
    total: number;
  } | null>(null);
  const [htmlSnippet, setHtmlSnippet] = useState<string | null>(null);
  const [debugInfo, setDebugInfo] = useState<any>(null);

  const handleScrape = async () => {
    setScraping(true);
    setError(null);
    setVillages([]);
    setImportResult(null);
    setHtmlSnippet(null);
    setDebugInfo(null);

    try {
      const response = await fetch(
        `https://${projectId}.supabase.co/functions/v1/make-server-3bba8be8/cleanup/scrape-ech`,
        {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${publicAnonKey}`,
            'Content-Type': 'application/json',
          },
        }
      );

      const result = await response.json();

      if (!response.ok) {
        const errorMsg = result.error || 'Failed to scrape ECH website';
        const details = result.details ? `\n\nDetails: ${result.details}` : '';
        const suggestion = result.suggestion ? `\n\n💡 ${result.suggestion}` : '';
        throw new Error(errorMsg + details + suggestion);
      }

      if (result.success && result.villages && result.villages.length > 0) {
        setVillages(result.villages);
      } else {
        setError(result.message || 'No villages found. The website structure may have changed.');
        if (result.htmlSnippet) {
          setHtmlSnippet(result.htmlSnippet);
        }
        if (result.debug) {
          setDebugInfo(result.debug);
        }
      }
    } catch (err) {
      console.error('ECH scraping error:', err);
      setError(err instanceof Error ? err.message : 'Failed to scrape ECH website');
    } finally {
      setScraping(false);
    }
  };

  const handleImport = async () => {
    if (villages.length === 0) return;

    setImporting(true);
    setError(null);
    setImportResult(null);

    try {
      const response = await fetch(
        `https://${projectId}.supabase.co/functions/v1/make-server-3bba8be8/cleanup/bulk-import`,
        {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${publicAnonKey}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ villages }),
        }
      );

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || 'Failed to import villages');
      }

      setImportResult({
        imported: result.imported,
        skipped: result.skipped,
        total: result.total,
      });

      // Clear the villages list after successful import
      if (result.imported > 0) {
        setVillages([]);
      }
    } catch (err) {
      console.error('Import error:', err);
      setError(err instanceof Error ? err.message : 'Failed to import villages');
    } finally {
      setImporting(false);
    }
  };

  const downloadCSV = () => {
    if (villages.length === 0) return;

    const headers = ['name', 'operator', 'suburb', 'state', 'postcode', 'website', 'facility_type'];
    const csvContent = [
      headers.join(','),
      ...villages.map(v => 
        `"${v.name}","${v.operator}","${v.suburb}","${v.state}","","","${v.facility_type}"`
      ),
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `ech-villages-${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold mb-2">ECH Map Scraper</h2>
        <p className="text-gray-600 mb-4">
          Automatically extract all ECH villages from their website map and import them into your database.
        </p>
      </div>

      {/* Action Buttons */}
      <div className="flex gap-3">
        <Button
          onClick={handleScrape}
          disabled={scraping}
          className="bg-purple-600 hover:bg-purple-700"
        >
          {scraping ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Scraping ECH Website...
            </>
          ) : (
            <>
              <Download className="mr-2 h-4 w-4" />
              Scrape ECH Villages
            </>
          )}
        </Button>

        {villages.length > 0 && (
          <>
            <Button
              onClick={handleImport}
              disabled={importing}
              className="bg-green-600 hover:bg-green-700"
            >
              {importing ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Importing...
                </>
              ) : (
                <>
                  <CheckCircle className="mr-2 h-4 w-4" />
                  Import {villages.length} Villages
                </>
              )}
            </Button>

            <Button
              onClick={downloadCSV}
              variant="outline"
            >
              <Download className="mr-2 h-4 w-4" />
              Download CSV
            </Button>
          </>
        )}
      </div>

      {/* Error Alert */}
      {error && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {/* Import Success Alert */}
      {importResult && (
        <Alert className="bg-green-50 border-green-200">
          <CheckCircle className="h-4 w-4 text-green-600" />
          <AlertDescription className="text-green-800">
            Successfully imported {importResult.imported} villages!
            {importResult.skipped > 0 && ` (${importResult.skipped} skipped as duplicates)`}
          </AlertDescription>
        </Alert>
      )}

      {/* Scraped Villages Preview */}
      {villages.length > 0 && (
        <div className="border rounded-lg overflow-hidden">
          <div className="bg-gray-50 px-4 py-3 border-b">
            <h3 className="font-semibold">
              Found {villages.length} ECH Villages
            </h3>
            <p className="text-sm text-gray-600">
              Review the villages below, then click "Import" to add them to your database.
            </p>
          </div>

          <div className="max-h-96 overflow-y-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50 sticky top-0">
                <tr>
                  <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">
                    #
                  </th>
                  <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">
                    Name
                  </th>
                  <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">
                    Suburb
                  </th>
                  <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">
                    State
                  </th>
                  <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">
                    Operator
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {villages.map((village, index) => (
                  <tr key={index} className="hover:bg-gray-50">
                    <td className="px-4 py-2 text-sm text-gray-500">{index + 1}</td>
                    <td className="px-4 py-2 text-sm font-medium">{village.name}</td>
                    <td className="px-4 py-2 text-sm">{village.suburb}</td>
                    <td className="px-4 py-2 text-sm">{village.state}</td>
                    <td className="px-4 py-2 text-sm">{village.operator}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Debug HTML Snippet */}
      {htmlSnippet && (
        <div className="border rounded-lg overflow-hidden">
          <div className="bg-yellow-50 px-4 py-3 border-b">
            <h3 className="font-semibold text-yellow-800">
              🔍 Debug: HTML Snippet (First 5000 chars)
            </h3>
            <p className="text-sm text-yellow-700">
              The automatic parser couldn't find villages. Review the HTML below to understand the website structure.
            </p>
          </div>
          <div className="p-4 bg-gray-900 text-green-400 font-mono text-xs max-h-96 overflow-auto">
            <pre>{htmlSnippet}</pre>
          </div>
        </div>
      )}

      {/* Debug Info */}
      {debugInfo && (
        <div className="border rounded-lg overflow-hidden">
          <div className="bg-yellow-50 px-4 py-3 border-b">
            <h3 className="font-semibold text-yellow-800">
              🔍 Debug: Additional Info
            </h3>
            <p className="text-sm text-yellow-700">
              The automatic parser couldn't find villages. Review the additional info below to understand the website structure.
            </p>
          </div>
          <div className="p-4 bg-gray-900 text-green-400 font-mono text-xs max-h-96 overflow-auto">
            <pre>{JSON.stringify(debugInfo, null, 2)}</pre>
          </div>
        </div>
      )}

      {/* Instructions */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <h3 className="font-semibold text-blue-900 mb-2">How it works:</h3>
        <ol className="list-decimal list-inside space-y-1 text-sm text-blue-800">
          <li>Click "Scrape ECH Villages" to fetch all villages from https://ech.asn.au</li>
          <li>The tool will automatically parse the website and extract village data</li>
          <li>Review the extracted villages in the table below</li>
          <li>Click "Import X Villages" to add them to your database (duplicates will be skipped)</li>
          <li>Optionally download as CSV for manual review or backup</li>
        </ol>
      </div>
    </div>
  );
}