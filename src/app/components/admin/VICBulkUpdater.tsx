import React, { useState } from 'react';
import { Card } from '../ui/card';
import { Button } from '../ui/button';
import { Badge } from '../ui/badge';
import { Alert, AlertDescription } from '../ui/alert';
import { Upload, CheckCircle, XCircle, AlertTriangle, Download } from 'lucide-react';
import { getSupabaseClient } from '../../utils/supabase/client';
import Papa from 'papaparse';

interface ParsedRow {
  villageName: string;
  suburb: string;
  postcode: string;
  websiteUrl: string;
}

interface UpdateResult {
  villageName: string;
  status: 'success' | 'not_found' | 'error';
  message: string;
  oldData?: {
    suburb?: string;
    postcode?: string;
    website?: string;
  };
  newData?: {
    suburb?: string;
    postcode?: string;
    website?: string;
  };
}

export function VICBulkUpdater() {
  const [uploading, setUploading] = useState(false);
  const [parsedData, setParsedData] = useState<ParsedRow[]>([]);
  const [results, setResults] = useState<UpdateResult[]>([]);
  const [stats, setStats] = useState({
    total: 0,
    success: 0,
    notFound: 0,
    errors: 0,
  });

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setUploading(true);
    setParsedData([]);
    setResults([]);

    Papa.parse(file, {
      header: true,
      skipEmptyLines: true,
      complete: (results) => {
        try {
          console.log('📊 Raw CSV data:', results.data);
          console.log('📊 CSV headers:', results.meta.fields);

          const rows: ParsedRow[] = results.data.map((row: any) => {
            // Find the columns - handle different possible header names
            const villageName = row['Village name'] || row['Village Name'] || row['village_name'] || 
                               row['name'] || row['Name'] || row['village'] || row['Village'] || 
                               row['VILLAGE NAME'] || '';
            const suburb = row['Suburb'] || row['suburb'] || row['SUBURB'] || '';
            const postcode = row['Postcode'] || row['postcode'] || row['POSTCODE'] || row['Postcode '] || '';
            const websiteUrl = row['Website url'] || row['Website Url'] || row['Website URL'] || 
                              row['website_url'] || row['website'] || row['Website'] || 
                              row['url'] || row['URL'] || row['WEBSITE URL'] || '';

            console.log('📊 Parsed row:', { villageName, suburb, postcode, websiteUrl });

            return {
              villageName: villageName.trim(),
              suburb: suburb.trim(),
              postcode: postcode.trim(),
              websiteUrl: websiteUrl.trim(),
            };
          }).filter(row => row.villageName); // Only keep rows with village names

          console.log('✅ Total rows parsed:', rows.length);
          setParsedData(rows);
          setUploading(false);
          
          if (rows.length === 0) {
            alert('⚠️ No valid data found! Please check:\n\n1. CSV has a "Village Name" column\n2. Column names match the template\n3. File is saved as CSV format');
          }
        } catch (err) {
          console.error('CSV Parsing Error:', err);
          alert('Failed to parse CSV file. Please check the format.');
          setUploading(false);
        }
      },
      error: (error) => {
        console.error('PapaParse Error:', error);
        alert(`Failed to parse CSV: ${error.message}`);
        setUploading(false);
      },
    });
  };

  const updateDatabase = async () => {
    if (parsedData.length === 0) {
      alert('No data to update. Please upload a CSV first.');
      return;
    }

    if (!confirm(`⚠️ BULK UPDATE\n\nThis will update ${parsedData.length} villages with:\n• New website URLs\n• Suburbs\n• Postcodes\n\nContinue?`)) {
      return;
    }

    setUploading(true);
    const supabase = getSupabaseClient();
    const updateResults: UpdateResult[] = [];
    let successCount = 0;
    let notFoundCount = 0;
    let errorCount = 0;

    for (const row of parsedData) {
      try {
        // Find the village by name and state
        const { data: existingVillages, error: searchError } = await supabase
          .from('retirement_villages')
          .select('id, name, suburb, postcode, website')
          .eq('state', 'VIC')
          .ilike('name', row.villageName);

        if (searchError) throw searchError;

        if (!existingVillages || existingVillages.length === 0) {
          updateResults.push({
            villageName: row.villageName,
            status: 'not_found',
            message: 'Village not found in database - may need to be added as NEW village',
          });
          notFoundCount++;
          console.log(`❌ NOT FOUND: "${row.villageName}" - Not in VIC database`);
          continue;
        }

        // If multiple matches, use the first one
        const village = existingVillages[0];

        // Prepare update data
        const updateData: any = {};
        if (row.suburb) updateData.suburb = row.suburb;
        if (row.postcode) updateData.postcode = row.postcode;
        if (row.websiteUrl) updateData.website = row.websiteUrl;

        // Update the village
        const { error: updateError } = await supabase
          .from('retirement_villages')
          .update(updateData)
          .eq('id', village.id);

        if (updateError) throw updateError;

        updateResults.push({
          villageName: row.villageName,
          status: 'success',
          message: 'Updated successfully',
          oldData: {
            suburb: village.suburb,
            postcode: village.postcode,
            website: village.website,
          },
          newData: updateData,
        });
        successCount++;

      } catch (err) {
        console.error(`Error updating ${row.villageName}:`, err);
        updateResults.push({
          villageName: row.villageName,
          status: 'error',
          message: err instanceof Error ? err.message : 'Unknown error',
        });
        errorCount++;
      }
    }

    setResults(updateResults);
    setStats({
      total: parsedData.length,
      success: successCount,
      notFound: notFoundCount,
      errors: errorCount,
    });
    setUploading(false);

    alert(`✅ Update Complete!\n\n✓ ${successCount} updated\n✗ ${notFoundCount} not found\n⚠ ${errorCount} errors`);
  };

  const downloadResults = () => {
    if (results.length === 0) return;

    const csv = [
      ['Village Name', 'Status', 'Message', 'Old Suburb', 'New Suburb', 'Old Postcode', 'New Postcode', 'Old Website', 'New Website'],
      ...results.map(r => [
        r.villageName,
        r.status,
        r.message,
        r.oldData?.suburb || '',
        r.newData?.suburb || '',
        r.oldData?.postcode || '',
        r.newData?.postcode || '',
        r.oldData?.website || '',
        r.newData?.website || '',
      ]),
    ].map(row => row.join(',')).join('\n');

    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `vic-bulk-update-results-${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const downloadTemplate = () => {
    const csv = [
      ['Village Name', 'Suburb', 'Postcode', 'Website URL'],
      ['Example Village', 'Melbourne', '3000', 'https://example.com'],
    ].map(row => row.join(',')).join('\n');

    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'vic-bulk-update-template.csv';
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <Card className="p-6 bg-gradient-to-r from-cyan-50 to-blue-50 border-2 border-cyan-400">
      <h2 className="text-2xl font-bold mb-2 text-cyan-900 flex items-center gap-2">
        <Upload className="size-6" />
        📝 VIC Bulk Updater
      </h2>
      <p className="text-sm text-cyan-700 mb-4">
        Upload a CSV to bulk update village URLs, suburbs, and postcodes
      </p>

      <Alert className="mb-4 bg-blue-50 border-blue-400">
        <AlertTriangle className="size-4" />
        <AlertDescription>
          <strong>CSV Format Required:</strong>
          <div className="mt-2 text-sm font-mono bg-white p-2 rounded border">
            Village Name, Suburb, Postcode, Website URL
          </div>
          <p className="mt-2 text-sm">
            • Village names must match existing database entries (case-insensitive)
            • All fields are optional - only provided fields will be updated
            • Download the template below for correct format
          </p>
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
              file:bg-cyan-600 file:text-white
              hover:file:bg-cyan-700
              file:cursor-pointer cursor-pointer"
          />
          {parsedData.length > 0 && (
            <Badge className="mt-2 bg-green-600">
              ✓ {parsedData.length} villages loaded from CSV
            </Badge>
          )}
        </div>

        {/* Preview Data */}
        {parsedData.length > 0 && results.length === 0 && (
          <Card className="p-4 bg-white">
            <h3 className="font-semibold mb-3">Preview - First 5 Villages</h3>
            <div className="space-y-2 max-h-[300px] overflow-y-auto">
              {parsedData.slice(0, 5).map((row, idx) => (
                <div key={idx} className="p-3 bg-gray-50 rounded border text-sm">
                  <p><strong>Village:</strong> {row.villageName}</p>
                  <p><strong>Suburb:</strong> {row.suburb || '(not updating)'}</p>
                  <p><strong>Postcode:</strong> {row.postcode || '(not updating)'}</p>
                  <p><strong>Website:</strong> {row.websiteUrl || '(not updating)'}</p>
                </div>
              ))}
            </div>
          </Card>
        )}

        {/* Update Button */}
        {parsedData.length > 0 && results.length === 0 && (
          <Button
            onClick={updateDatabase}
            disabled={uploading}
            className="bg-cyan-600 hover:bg-cyan-700"
          >
            {uploading ? (
              <>
                <Upload className="size-4 mr-2 animate-pulse" />
                Updating Database...
              </>
            ) : (
              <>
                <Upload className="size-4 mr-2" />
                Update {parsedData.length} Villages
              </>
            )}
          </Button>
        )}

        {/* Results */}
        {results.length > 0 && (
          <Card className="p-4 bg-white">
            <div className="flex justify-between items-center mb-4">
              <h3 className="font-semibold">Update Results</h3>
              <Button
                size="sm"
                onClick={downloadResults}
                className="bg-green-600 hover:bg-green-700"
              >
                <Download className="size-4 mr-2" />
                Download Report
              </Button>
            </div>

            <div className="grid grid-cols-4 gap-4 mb-4">
              <div className="text-center p-3 bg-gray-50 rounded border">
                <div className="text-2xl font-bold text-gray-700">{stats.total}</div>
                <div className="text-xs text-gray-600">Total</div>
              </div>
              <div className="text-center p-3 bg-green-50 rounded border border-green-200">
                <div className="text-2xl font-bold text-green-700">{stats.success}</div>
                <div className="text-xs text-green-600">Updated</div>
              </div>
              <div className="text-center p-3 bg-yellow-50 rounded border border-yellow-200">
                <div className="text-2xl font-bold text-yellow-700">{stats.notFound}</div>
                <div className="text-xs text-yellow-600">Not Found</div>
              </div>
              <div className="text-center p-3 bg-red-50 rounded border border-red-200">
                <div className="text-2xl font-bold text-red-700">{stats.errors}</div>
                <div className="text-xs text-red-600">Errors</div>
              </div>
            </div>

            {/* Results Table */}
            <div className="max-h-[400px] overflow-y-auto border rounded">
              <table className="w-full text-sm">
                <thead className="bg-gray-100 sticky top-0">
                  <tr>
                    <th className="p-2 text-left">Village Name</th>
                    <th className="p-2 text-left">Status</th>
                    <th className="p-2 text-left">Changes</th>
                  </tr>
                </thead>
                <tbody>
                  {results.map((result, idx) => (
                    <tr key={idx} className="border-t hover:bg-gray-50">
                      <td className="p-2">{result.villageName}</td>
                      <td className="p-2">
                        {result.status === 'success' && (
                          <Badge className="bg-green-600">
                            <CheckCircle className="size-3 mr-1" />
                            Success
                          </Badge>
                        )}
                        {result.status === 'not_found' && (
                          <Badge className="bg-yellow-600">
                            <AlertTriangle className="size-3 mr-1" />
                            Not Found
                          </Badge>
                        )}
                        {result.status === 'error' && (
                          <Badge className="bg-red-600">
                            <XCircle className="size-3 mr-1" />
                            Error
                          </Badge>
                        )}
                      </td>
                      <td className="p-2 text-xs">
                        {result.status === 'success' && result.newData && (
                          <div className="space-y-1">
                            {result.newData.suburb && (
                              <div>Suburb: {result.oldData?.suburb || '(none)'} → {result.newData.suburb}</div>
                            )}
                            {result.newData.postcode && (
                              <div>Postcode: {result.oldData?.postcode || '(none)'} → {result.newData.postcode}</div>
                            )}
                            {result.newData.website && (
                              <div className="truncate">URL: Updated</div>
                            )}
                          </div>
                        )}
                        {result.status !== 'success' && (
                          <div className="text-gray-600">{result.message}</div>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </Card>
        )}
      </div>
    </Card>
  );
}