import React, { useState } from 'react';
import { Card } from '../ui/card';
import { Button } from '../ui/button';
import { Badge } from '../ui/badge';
import { Alert, AlertDescription } from '../ui/alert';
import { PlusCircle, Download, CheckCircle, XCircle, AlertTriangle } from 'lucide-react';
import { getSupabaseClient } from '../../utils/supabase/client';
import Papa from 'papaparse';

interface ParsedRow {
  villageName: string;
  suburb: string;
  postcode: string;
  websiteUrl: string;
}

interface ImportResult {
  villageName: string;
  suburb: string;
  postcode: string;
  websiteUrl: string;
  status: 'success' | 'already_exists' | 'error';
  message: string;
  errorCode?: string;
  errorDetails?: string;
  errorHint?: string;
  insertedData?: any;
}

export function VICNewVillageImporter() {
  const [uploading, setUploading] = useState(false);
  const [parsedData, setParsedData] = useState<ParsedRow[]>([]);
  const [results, setResults] = useState<ImportResult[]>([]);
  const [vicCount, setVicCount] = useState<number | null>(null);
  const [loading, setLoading] = useState(false);
  const [stats, setStats] = useState({
    total: 0,
    success: 0,
    alreadyExists: 0,
    errors: 0,
  });

  // Fetch VIC village count
  const fetchVicCount = async () => {
    setLoading(true);
    try {
      const supabase = getSupabaseClient();
      const { count, error } = await supabase
        .from('retirement_villages')
        .select('*', { count: 'exact', head: true })
        .eq('state', 'VIC');

      if (error) {
        console.error('Error fetching VIC count:', error);
        return;
      }

      setVicCount(count || 0);
      console.log(`📊 Total VIC villages: ${count}`);
    } catch (err) {
      console.error('Error:', err);
    } finally {
      setLoading(false);
    }
  };

  // Fetch count on component mount
  React.useEffect(() => {
    console.log('🔍 VICNewVillageImporter mounted, fetching VIC count...');
    fetchVicCount();
  }, []);

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setUploading(true);
    setParsedData([]);
    setResults([]);

    console.log('========================================');
    console.log('📁 STARTING CSV PARSE');
    console.log('========================================');

    Papa.parse(file, {
      header: true,
      skipEmptyLines: true,
      complete: (results) => {
        try {
          console.log('📊 Raw CSV Results:', results);
          console.log('📊 CSV Headers:', results.meta.fields);
          console.log('📊 Total Rows:', results.data.length);

          const rows: ParsedRow[] = results.data.map((row: any, index: number) => {
            console.log(`\n--- Row ${index + 1} ---`);
            console.log('Raw row data:', row);

            const villageName = row['Village name'] || row['Village Name'] || row['village_name'] || 
                               row['name'] || row['Name'] || '';
            const suburb = row['Suburb'] || row['suburb'] || '';
            const postcode = row['Postcode'] || row['postcode'] || '';
            const websiteUrl = row['Website url'] || row['Website Url'] || row['Website URL'] || 
                              row['website_url'] || row['website'] || row['url'] || '';

            const parsed = {
              villageName: villageName.trim(),
              suburb: suburb.trim(),
              postcode: postcode.trim(),
              websiteUrl: websiteUrl.trim(),
            };

            console.log('Parsed:', parsed);
            console.log('Valid:', !!(parsed.villageName && parsed.suburb && parsed.postcode && parsed.websiteUrl));

            return parsed;
          }).filter(row => row.villageName && row.suburb && row.postcode && row.websiteUrl);

          console.log('\n✅ Total valid rows parsed:', rows.length);
          console.log('========================================\n');

          setParsedData(rows);
          setUploading(false);
          
          if (rows.length === 0) {
            alert('⚠️ No valid data found! Please ensure all rows have:\n• Village name\n• Suburb\n• Postcode\n• Website url');
          }
        } catch (err) {
          console.error('❌ CSV PARSING ERROR:', err);
          alert('Failed to parse CSV file. Please check the format.');
          setUploading(false);
        }
      },
      error: (error) => {
        console.error('❌ PAPAPARSE ERROR:', error);
        alert(`Failed to parse CSV: ${error.message}`);
        setUploading(false);
      },
    });
  };

  const importNewVillages = async () => {
    if (parsedData.length === 0) {
      alert('No data to import. Please upload a CSV first.');
      return;
    }

    if (!confirm(`🆕 ADD NEW VILLAGES\n\nThis will ADD ${parsedData.length} NEW villages to the VIC database.\n\nNote: Villages that already exist will be skipped.\n\nContinue?`)) {
      return;
    }

    console.log('========================================');
    console.log('🚀 SENDING TO SERVER');
    console.log(`Total villages to send: ${parsedData.length}`);
    console.log('========================================\n');

    setUploading(true);

    try {
      const { projectId, publicAnonKey } = await import('../../utils/supabase/info');
      
      const response = await fetch(
        `https://${projectId}.supabase.co/functions/v1/make-server-3bba8be8/admin/vic-villages/bulk-add`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${publicAnonKey}`,
          },
          body: JSON.stringify({ villages: parsedData }),
        }
      );

      if (!response.ok) {
        const errorData = await response.json();
        console.error('❌ Server error:', errorData);
        throw new Error(errorData.error || errorData.message || 'Server request failed');
      }

      const data = await response.json();
      console.log('✅ Server response:', data);

      setResults(data.results);
      setStats(data.stats);
      setUploading(false);

      // Refresh the VIC count after successful import
      fetchVicCount();

      alert(`✅ Import Complete!\n\n✓ ${data.stats.success} villages added\n⏭️ ${data.stats.alreadyExists} already existed\n⚠ ${data.stats.errors} errors\n\nCheck results below for details.`);

    } catch (err: any) {
      console.error('❌ FATAL ERROR:', err);
      alert(`Error: ${err.message}\n\nCheck the console for details.`);
      setUploading(false);
    }
  };

  const downloadResults = () => {
    if (results.length === 0) return;

    const csv = [
      ['Village Name', 'Suburb', 'Postcode', 'Website', 'Status', 'Message', 'Error Code', 'Error Details', 'Error Hint'],
      ...results.map(r => [
        r.villageName,
        r.suburb,
        r.postcode,
        r.websiteUrl,
        r.status,
        r.message,
        r.errorCode || '',
        r.errorDetails || '',
        r.errorHint || '',
      ]),
    ].map(row => row.map(cell => `"${String(cell).replace(/"/g, '""')}"`).join(',')).join('\n');

    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `vic-new-villages-import-${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const downloadTemplate = () => {
    const csv = [
      ['Village name', 'Suburb', 'Postcode', 'Website url'],
      ['Example Village', 'Melbourne', '3000', 'https://example.com'],
    ].map(row => row.join(',')).join('\n');

    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'vic-new-villages-template.csv';
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <Card className="p-6 bg-gradient-to-r from-green-50 to-emerald-50 border-2 border-green-400">
      <h2 className="text-2xl font-bold mb-2 text-green-900 flex items-center gap-2">
        <PlusCircle className="size-6" />
        🆕 Add New VIC Villages
      </h2>
      <p className="text-sm text-green-700 mb-2">
        Import brand new villages that don't exist in the database yet (with comprehensive error logging)
      </p>

      {/* VIC Count Display */}
      <div className="mb-4 p-3 bg-white rounded border-2 border-green-300">
        <div className="flex items-center justify-between">
          <span className="text-sm font-semibold text-gray-700">Total VIC Villages in Database:</span>
          <div className="flex items-center gap-2">
            {loading ? (
              <Badge className="bg-gray-400">Loading...</Badge>
            ) : (
              <Badge className="bg-green-600 text-lg px-3 py-1">
                {vicCount !== null ? vicCount : '?'}
              </Badge>
            )}
            <Button
              size="sm"
              variant="outline"
              onClick={fetchVicCount}
              disabled={loading}
              className="text-xs"
            >
              Refresh
            </Button>
          </div>
        </div>
      </div>

      <Alert className="mb-4 bg-yellow-50 border-yellow-400">
        <AlertTriangle className="size-4" />
        <AlertDescription>
          <strong>Important:</strong>
          <ul className="list-disc ml-4 mt-2 space-y-1 text-sm">
            <li>This tool ADDS NEW villages - use "VIC Bulk Updater" to update existing ones</li>
            <li>All 4 fields are required: Village name, Suburb, Postcode, Website url</li>
            <li>Villages that already exist will be automatically skipped</li>
            <li>Operator names will be extracted later by the Auto Scraper</li>
            <li><strong>Check browser console (F12) for detailed error logs</strong></li>
          </ul>
        </AlertDescription>
      </Alert>

      <div className="space-y-4">
        {/* Template Download */}
        <div>
          <Button
            onClick={downloadTemplate}
            variant="outline"
            className="bg-white hover:bg-gray-50"
          >
            <Download className="size-4 mr-2" />
            Download CSV Template
          </Button>
        </div>

        {/* File Upload */}
        <div>
          <input
            type="file"
            accept=".csv"
            onChange={handleFileUpload}
            disabled={uploading}
            className="block w-full text-sm text-gray-500
              file:mr-4 file:py-2 file:px-4
              file:rounded file:border-0
              file:text-sm file:font-semibold
              file:bg-green-600 file:text-white
              hover:file:bg-green-700
              file:cursor-pointer cursor-pointer"
          />
          {parsedData.length > 0 && (
            <Badge className="mt-2 bg-green-600">
              ✓ {parsedData.length} new villages ready to import
            </Badge>
          )}
        </div>

        {/* Preview Data */}
        {parsedData.length > 0 && results.length === 0 && (
          <Card className="p-4 bg-white">
            <h3 className="font-semibold mb-3">Preview - First 5 Villages</h3>
            <div className="space-y-2 max-h-[300px] overflow-y-auto">
              {parsedData.slice(0, 5).map((row, idx) => (
                <div key={idx} className="p-3 bg-green-50 rounded border border-green-200 text-sm">
                  <p><strong>Village:</strong> {row.villageName}</p>
                  <p><strong>Suburb:</strong> {row.suburb}</p>
                  <p><strong>Postcode:</strong> {row.postcode}</p>
                  <p><strong>Website:</strong> {row.websiteUrl}</p>
                </div>
              ))}
            </div>
          </Card>
        )}

        {/* Import Button */}
        {parsedData.length > 0 && results.length === 0 && (
          <Button
            onClick={importNewVillages}
            disabled={uploading}
            className="bg-green-600 hover:bg-green-700"
          >
            {uploading ? (
              <>
                <PlusCircle className="size-4 mr-2 animate-pulse" />
                Adding Villages...
              </>
            ) : (
              <>
                <PlusCircle className="size-4 mr-2" />
                Add {parsedData.length} New Villages
              </>
            )}
          </Button>
        )}

        {/* Results */}
        {results.length > 0 && (
          <Card className="p-4 bg-white">
            <div className="flex justify-between items-center mb-4">
              <h3 className="font-semibold">Import Results</h3>
              <Button
                size="sm"
                onClick={downloadResults}
                className="bg-green-600 hover:bg-green-700"
              >
                <Download className="size-4 mr-2" />
                Download Full Report
              </Button>
            </div>

            <div className="grid grid-cols-4 gap-4 mb-4">
              <div className="text-center p-3 bg-gray-50 rounded border">
                <div className="text-2xl font-bold text-gray-700">{stats.total}</div>
                <div className="text-xs text-gray-600">Total</div>
              </div>
              <div className="text-center p-3 bg-green-50 rounded border border-green-200">
                <div className="text-2xl font-bold text-green-700">{stats.success}</div>
                <div className="text-xs text-green-600">Added</div>
              </div>
              <div className="text-center p-3 bg-blue-50 rounded border border-blue-200">
                <div className="text-2xl font-bold text-blue-700">{stats.alreadyExists}</div>
                <div className="text-xs text-blue-600">Already Exists</div>
              </div>
              <div className="text-center p-3 bg-red-50 rounded border border-red-200">
                <div className="text-2xl font-bold text-red-700">{stats.errors}</div>
                <div className="text-xs text-red-600">Errors</div>
              </div>
            </div>

            {/* Results Table */}
            <div className="max-h-[500px] overflow-y-auto border rounded">
              <table className="w-full text-sm">
                <thead className="bg-gray-100 sticky top-0">
                  <tr>
                    <th className="p-2 text-left">Village Name</th>
                    <th className="p-2 text-left">Suburb</th>
                    <th className="p-2 text-left">Postcode</th>
                    <th className="p-2 text-center">Status</th>
                    <th className="p-2 text-left">Details</th>
                  </tr>
                </thead>
                <tbody>
                  {results.map((result, idx) => (
                    <tr key={idx} className={`border-t hover:bg-gray-50 ${result.status === 'error' ? 'bg-red-50' : ''}`}>
                      <td className="p-2 font-medium">{result.villageName}</td>
                      <td className="p-2 text-xs text-gray-600">{result.suburb}</td>
                      <td className="p-2 text-xs text-gray-600">{result.postcode}</td>
                      <td className="p-2 text-center">
                        {result.status === 'success' && (
                          <Badge className="bg-green-600">
                            <CheckCircle className="size-3 mr-1" />
                            Added
                          </Badge>
                        )}
                        {result.status === 'already_exists' && (
                          <Badge className="bg-blue-600">
                            <AlertTriangle className="size-3 mr-1" />
                            Exists
                          </Badge>
                        )}
                        {result.status === 'error' && (
                          <Badge className="bg-red-600">
                            <XCircle className="size-3 mr-1" />
                            Error
                          </Badge>
                        )}
                      </td>
                      <td className="p-2">
                        <div className="space-y-1">
                          <div className="text-xs text-gray-700">{result.message}</div>
                          {result.errorCode && (
                            <div className="text-[10px] text-red-700">
                              <strong>Code:</strong> {result.errorCode}
                            </div>
                          )}
                          {result.errorDetails && (
                            <div className="text-[10px] text-red-600 bg-red-100 p-1 rounded font-mono max-w-md overflow-x-auto">
                              {result.errorDetails}
                            </div>
                          )}
                          {result.errorHint && (
                            <div className="text-[10px] text-orange-700">
                              <strong>Hint:</strong> {result.errorHint}
                            </div>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Console Reminder */}
            {stats.errors > 0 && (
              <Alert className="mt-4 bg-red-50 border-red-400">
                <AlertTriangle className="size-4" />
                <AlertDescription className="text-sm">
                  <strong>⚠️ {stats.errors} errors detected!</strong> Open your browser console (press F12) to see full error details and stack traces.
                </AlertDescription>
              </Alert>
            )}
          </Card>
        )}
      </div>
    </Card>
  );
}