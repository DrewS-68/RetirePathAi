import { useState } from 'react';
import { Button } from '../ui/button';
import { Card } from '../ui/card';
import { Loader2, Download, CheckCircle, AlertCircle } from 'lucide-react';
import { projectId, publicAnonKey } from '../../utils/supabase/info';

interface ScrapedVillage {
  name: string;
  suburb: string;
  state: string;
  operator: string;
  facility_type: string;
  website?: string;
}

export function COFCScraper() {
  const [scraping, setScraping] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [villages, setVillages] = useState<ScrapedVillage[]>([]);
  const [importing, setImporting] = useState(false);
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
        `https://${projectId}.supabase.co/functions/v1/make-server-3bba8be8/cleanup/scrape-cofc`,
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
        const errorMsg = result.error || 'Failed to scrape COFC website';
        const details = result.details ? `\n\nDetails: ${result.details}` : '';
        const suggestion = result.suggestion ? `\n\n💡 ${result.suggestion}` : '';
        throw new Error(errorMsg + details + suggestion);
      }

      if (result.success && result.villages && result.villages.length > 0) {
        setVillages(result.villages);
        setDebugInfo(null); // Clear debug on success
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
      setError(err instanceof Error ? err.message : 'Unknown error occurred');
    } finally {
      setScraping(false);
    }
  };

  const handleImport = async () => {
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

      // Clear villages after successful import
      if (result.imported > 0) {
        setVillages([]);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error occurred');
    } finally {
      setImporting(false);
    }
  };

  const downloadCSV = () => {
    const headers = ['name', 'suburb', 'state', 'operator', 'facility_type', 'website'];
    const rows = villages.map(v => [
      v.name,
      v.suburb,
      v.state,
      v.operator,
      v.facility_type,
      v.website || '',
    ]);

    const csv = [
      headers.join(','),
      ...rows.map(row => row.map(cell => `"${cell}"`).join(',')),
    ].join('\n');

    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `cofc-villages-${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const downloadPreparedCSV = () => {
    const csvContent = `name,suburb,state,operator,facility_type,website
Sugarlands Gardens,Avoca,QLD,COFC,retirement_village,https://www.catholichomes.com.au/retirement-villages/
Woorim Retirement Village,Woorim,QLD,COFC,retirement_village,https://www.catholichomes.com.au/retirement-villages/
Gracehaven Retirement Village,Bundaberg,QLD,COFC,retirement_village,https://www.catholichomes.com.au/retirement-villages/
Grant Street Retirement Village,Oakleigh,VIC,COFC,retirement_village,https://www.catholichomes.com.au/retirement-villages/
Kilkivan Retirement Village,Newton,QLD,COFC,retirement_village,https://www.catholichomes.com.au/retirement-villages/
Moonah Park Retirement Village,Mitchelton,QLD,COFC,retirement_village,https://www.catholichomes.com.au/retirement-villages/
Regency Park Retirement Village,Warwick,QLD,COFC,retirement_village,https://www.catholichomes.com.au/retirement-villages/
Sanctuary Park Retirement Community,Nambour,QLD,COFC,retirement_village,https://www.catholichomes.com.au/retirement-villages/
St George Serviced Apartments,St George,QLD,COFC,aged_care,https://www.catholichomes.com.au/retirement-villages/
St James Retirement Village,Heatley,QLD,COFC,retirement_village,https://www.catholichomes.com.au/retirement-villages/
Nubeena Retirement Village,Toowoomba,QLD,COFC,retirement_village,https://www.catholichomes.com.au/retirement-villages/
Bribie Island Retirement Village,Bongaree,QLD,COFC,retirement_village,https://www.catholichomes.com.au/retirement-villages/
Brig-O-Doon Retirement Village,Acacia Ridge,QLD,COFC,retirement_village,https://www.catholichomes.com.au/retirement-villages/
Chesterville Retirement Village,Cheltenham,VIC,COFC,retirement_village,https://www.catholichomes.com.au/retirement-villages/
Crows Nest Retirement Village,Crows Nest,QLD,COFC,retirement_village,https://www.catholichomes.com.au/retirement-villages/
Emmaus Lodge,Murrumbeena,VIC,COFC,retirement_village,https://www.catholichomes.com.au/retirement-villages/
Fair Haven Retirement Village,Maryborough,QLD,COFC,retirement_village,https://www.catholichomes.com.au/retirement-villages/
Fassifern Retirement Village,Boonah,QLD,COFC,retirement_village,https://www.catholichomes.com.au/retirement-villages/`;

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'cofc-villages.csv';
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-6">
      <Card className="p-6">
        <h2 className="text-xl font-semibold mb-4">COFC (Catholic Homes) Village Scraper</h2>
        <p className="text-gray-600 mb-4">
          Automatically extract all retirement villages from the COFC website (22 locations).
        </p>

        <div className="flex gap-3">
          <Button onClick={handleScrape} disabled={scraping}>
            {scraping ? (
              <>
                <Loader2 className="size-4 mr-2 animate-spin" />
                Scraping COFC Website...
              </>
            ) : (
              'Scrape COFC Villages'
            )}
          </Button>
          
          <Button onClick={downloadPreparedCSV} variant="outline">
            <Download className="size-4 mr-2" />
            Download COFC CSV (18 villages)
          </Button>

          {villages.length > 0 && (
            <>
              <Button onClick={downloadCSV} variant="outline">
                <Download className="size-4 mr-2" />
                Download CSV ({villages.length} villages)
              </Button>
              <Button onClick={handleImport} disabled={importing} variant="default">
                {importing ? (
                  <>
                    <Loader2 className="size-4 mr-2 animate-spin" />
                    Importing...
                  </>
                ) : (
                  <>
                    <CheckCircle className="size-4 mr-2" />
                    Import All Villages
                  </>
                )}
              </Button>
            </>
          )}
        </div>
      </Card>

      {/* Error Display */}
      {error && (
        <Card className="p-4 bg-red-50 border-red-200">
          <div className="flex items-start gap-2">
            <AlertCircle className="size-5 text-red-600 flex-shrink-0 mt-0.5" />
            <div className="text-red-800 whitespace-pre-wrap">{error}</div>
          </div>
        </Card>
      )}

      {/* Import Result */}
      {importResult && (
        <Card className="p-4 bg-green-50 border-green-200">
          <div className="flex items-start gap-2">
            <CheckCircle className="size-5 text-green-600 flex-shrink-0 mt-0.5" />
            <div className="text-green-800">
              <div className="font-semibold">Import Complete!</div>
              <div className="mt-1">
                ✅ Imported: {importResult.imported} villages<br />
                ⏭️ Skipped: {importResult.skipped} duplicates<br />
                📊 Total: {importResult.total} villages processed
              </div>
            </div>
          </div>
        </Card>
      )}

      {/* Scraped Villages Preview */}
      {villages.length > 0 && (
        <Card className="p-6">
          <h3 className="text-lg font-semibold mb-4">
            Found {villages.length} Villages - Preview
          </h3>
          <div className="overflow-x-auto">
            <table className="w-full border-collapse">
              <thead>
                <tr className="border-b">
                  <th className="text-left p-2 font-semibold">#</th>
                  <th className="text-left p-2 font-semibold">Name</th>
                  <th className="text-left p-2 font-semibold">Suburb</th>
                  <th className="text-left p-2 font-semibold">State</th>
                  <th className="text-left p-2 font-semibold">Operator</th>
                  <th className="text-left p-2 font-semibold">Type</th>
                  <th className="text-left p-2 font-semibold">Website</th>
                </tr>
              </thead>
              <tbody>
                {villages.map((village, idx) => (
                  <tr key={idx} className="border-b hover:bg-gray-50">
                    <td className="p-2 text-gray-600">{idx + 1}</td>
                    <td className="p-2 font-medium">{village.name}</td>
                    <td className="p-2">{village.suburb}</td>
                    <td className="p-2">{village.state}</td>
                    <td className="p-2">{village.operator}</td>
                    <td className="p-2">
                      <span className="px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded">
                        {village.facility_type}
                      </span>
                    </td>
                    <td className="p-2 text-xs text-blue-600">
                      {village.website ? (
                        <a href={village.website} target="_blank" rel="noopener noreferrer" className="hover:underline">
                          {village.website.substring(0, 40)}...
                        </a>
                      ) : (
                        <span className="text-gray-400">-</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>
      )}

      {/* Debug Info */}
      {debugInfo && (
        <Card className="p-4 bg-yellow-50 border-yellow-200">
          <h3 className="font-semibold mb-2">Debug Information:</h3>
          <pre className="text-xs overflow-auto">{JSON.stringify(debugInfo, null, 2)}</pre>
          
          {debugInfo.allFoundLinks && debugInfo.allFoundLinks.length > 0 && (
            <div className="mt-4">
              <h4 className="font-semibold mb-2">Found Links Analysis:</h4>
              <div className="overflow-auto max-h-96 text-xs">
                <table className="w-full border-collapse bg-white">
                  <thead>
                    <tr className="border-b bg-gray-100">
                      <th className="text-left p-2">#</th>
                      <th className="text-left p-2">Name</th>
                      <th className="text-left p-2">Link</th>
                      <th className="text-left p-2">Result</th>
                    </tr>
                  </thead>
                  <tbody>
                    {debugInfo.allFoundLinks.map((item: any, idx: number) => (
                      <tr key={idx} className="border-b hover:bg-gray-50">
                        <td className="p-2">{idx + 1}</td>
                        <td className="p-2">{item.name}</td>
                        <td className="p-2 text-blue-600 text-xs">{item.link.substring(0, 50)}...</td>
                        <td className={`p-2 ${item.reason?.includes('✅') ? 'text-green-600 font-semibold' : 'text-gray-500'}`}>
                          {item.reason || 'N/A'}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </Card>
      )}

      {/* HTML Snippet for debugging */}
      {htmlSnippet && (
        <Card className="p-4 bg-gray-50">
          <h3 className="font-semibold mb-2">HTML Snippet (for debugging):</h3>
          <pre className="text-xs overflow-auto max-h-96 bg-white p-3 rounded border">
            {htmlSnippet}
          </pre>
        </Card>
      )}
    </div>
  );
}