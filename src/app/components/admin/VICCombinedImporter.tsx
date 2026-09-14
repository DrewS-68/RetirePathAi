import React, { useState } from 'react';
import { Card } from '../ui/card';
import { Button } from '../ui/button';
import { Badge } from '../ui/badge';
import { Alert, AlertDescription } from '../ui/alert';
import { Upload, CheckCircle, XCircle, AlertTriangle, Download, Sparkles } from 'lucide-react';
import { getSupabaseClient } from '../../utils/supabase/client';
import { projectId, publicAnonKey } from '../../utils/supabase/info';
import Papa from 'papaparse';

interface ParsedRow {
  originalName: string; // Name from CSV (may be corrected)
  operator?: string;
  suburb?: string;
  postcode?: string;
  websiteUrl?: string;
}

interface ImportResult {
  csvName: string;
  matchedDbName?: string;
  status: 'success' | 'not_found' | 'error';
  message: string;
  updatedFields: string[];
  oldData?: any;
  newData?: any;
}

export function VICCombinedImporter() {
  const [uploading, setUploading] = useState(false);
  const [parsedData, setParsedData] = useState<ParsedRow[]>([]);
  const [results, setResults] = useState<ImportResult[]>([]);
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
            // Find village name - try multiple variations
            const originalName = 
              row['Name'] || row['name'] || row['NAME'] ||
              row['Village name'] || row['Village Name'] || row['village_name'] ||
              row['Village'] || row['village'] || row['VILLAGE NAME'] || '';

            const operator = 
              row['Operator'] || row['operator'] || row['OPERATOR'] || '';

            const suburb = 
              row['Suburb'] || row['suburb'] || row['SUBURB'] || '';

            const postcode = 
              row['Postcode'] || row['postcode'] || row['POSTCODE'] || 
              row['Postcode '] || ''; // Handle trailing space

            const websiteUrl = 
              row['Website url'] || row['Website Url'] || row['Website URL'] ||
              row['website_url'] || row['website'] || row['Website'] ||
              row['url'] || row['URL'] || row['WEBSITE URL'] || '';

            return {
              originalName: originalName.trim(),
              operator: operator.trim() || undefined,
              suburb: suburb.trim() || undefined,
              postcode: postcode.trim() || undefined,
              websiteUrl: websiteUrl.trim() || undefined,
            };
          }).filter(row => row.originalName); // Only keep rows with names

          console.log('✅ Total rows parsed:', rows.length);
          setParsedData(rows);
          setUploading(false);
          
          if (rows.length === 0) {
            alert('⚠️ No valid data found! Please check:\n\n1. CSV has a "Name" column\n2. Column names are correct\n3. File is saved as CSV format');
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

  const importData = async () => {
    if (parsedData.length === 0) {
      alert('No data to import. Please upload a CSV first.');
      return;
    }

    if (!confirm(`⚠️ BULK IMPORT\n\nThis will update ${parsedData.length} VIC villages with any data you provide:\n• Corrected names\n• Operators\n• Website URLs\n• Suburbs\n• Postcodes\n\nContinue?`)) {
      return;
    }

    setUploading(true);
    const supabase = getSupabaseClient();
    const importResults: ImportResult[] = [];
    let successCount = 0;
    let notFoundCount = 0;
    let errorCount = 0;

    for (const row of parsedData) {
      try {
        console.log(`\n🔍 Processing: "${row.originalName}"`);

        // Try to find the village by fuzzy name matching
        // First, try exact match
        let { data: existingVillages, error: searchError } = await supabase
          .from('retirement_villages')
          .select('id, name, operator, suburb, postcode, website')
          .eq('state', 'VIC')
          .ilike('name', row.originalName);

        if (searchError) throw searchError;

        // If no exact match, try fuzzy match
        if (!existingVillages || existingVillages.length === 0) {
          console.log(`  ↳ No exact match, trying fuzzy search...`);
          
          // Extract first significant word for fuzzy matching
          const firstWord = row.originalName.split(' ')[0];
          
          const { data: fuzzyVillages, error: fuzzyError } = await supabase
            .from('retirement_villages')
            .select('id, name, operator, suburb, postcode, website')
            .eq('state', 'VIC')
            .ilike('name', `%${firstWord}%`);

          if (fuzzyError) throw fuzzyError;

          existingVillages = fuzzyVillages;
        }

        if (!existingVillages || existingVillages.length === 0) {
          console.log(`  ✗ NOT FOUND: "${row.originalName}" - CREATING NEW VILLAGE VIA SERVER`);
          
          // CREATE new village via server endpoint (uses service role key)
          const newVillageData = {
            name: row.originalName,
            state: 'VIC',
            operator: row.operator || null,
            suburb: row.suburb || null,
            postcode: row.postcode || null,
            website: row.websiteUrl || null,
            location: row.suburb || 'Victoria, Australia', // Required field: use suburb as location
            contact_email: 'admin@retirepath.com.au', // Required field: placeholder email
            status: 'approved', // Auto-approve CSV imports
            source: 'csv_import',
          };

          const response = await fetch(`https://${projectId}.supabase.co/functions/v1/make-server-3bba8be8/villages/csv-import`, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${publicAnonKey}`,
            },
            body: JSON.stringify(newVillageData),
          });

          if (!response.ok) {
            const errorData = await response.json();
            console.error('❌ SERVER ERROR RESPONSE:', errorData);
            console.error('❌ SERVER STATUS:', response.status);
            throw new Error(errorData.details || errorData.error || `Server error: ${response.status}`);
          }

          const { village: newVillage } = await response.json();

          console.log(`  ✓ CREATED NEW VILLAGE: "${row.originalName}"`);
          
          importResults.push({
            csvName: row.originalName,
            matchedDbName: '🆕 NEW',
            status: 'success',
            message: `Created new VIC village`,
            updatedFields: ['name', 'operator', 'suburb', 'postcode', 'website'].filter(f => newVillageData[f as keyof typeof newVillageData]),
            newData: newVillageData,
          });
          successCount++;
          continue;
        }

        // Use the first match (or closest match)
        const village = existingVillages[0];
        console.log(`  ✓ MATCHED: "${row.originalName}" → DB: "${village.name}"`);

        // Prepare update data
        const updateData: any = {};
        const updatedFields: string[] = [];

        // Update NAME if it's different (corrected spelling)
        if (row.originalName !== village.name) {
          updateData.name = row.originalName;
          updatedFields.push('name');
        }

        if (row.operator && row.operator !== village.operator) {
          updateData.operator = row.operator;
          updatedFields.push('operator');
        }

        if (row.suburb && row.suburb !== village.suburb) {
          updateData.suburb = row.suburb;
          updatedFields.push('suburb');
        }

        if (row.postcode && row.postcode !== village.postcode) {
          updateData.postcode = row.postcode;
          updatedFields.push('postcode');
        }

        if (row.websiteUrl && row.websiteUrl !== village.website) {
          updateData.website = row.websiteUrl;
          updatedFields.push('website');
        }

        // Only update if there are changes
        if (updatedFields.length === 0) {
          console.log(`  ⊘ SKIPPED: No changes needed for "${village.name}"`);
          importResults.push({
            csvName: row.originalName,
            matchedDbName: village.name,
            status: 'success',
            message: 'No changes needed - data already up to date',
            updatedFields: [],
          });
          successCount++;
          continue;
        }

        // Update the village
        const { error: updateError } = await supabase
          .from('retirement_villages')
          .update(updateData)
          .eq('id', village.id);

        if (updateError) throw updateError;

        console.log(`  ✓ UPDATED: ${updatedFields.join(', ')}`);

        importResults.push({
          csvName: row.originalName,
          matchedDbName: village.name,
          status: 'success',
          message: `Updated ${updatedFields.length} field(s)`,
          updatedFields,
          oldData: {
            name: village.name,
            operator: village.operator,
            suburb: village.suburb,
            postcode: village.postcode,
            website: village.website,
          },
          newData: updateData,
        });
        successCount++;

      } catch (err) {
        console.error(`❌ Error processing ${row.originalName}:`, err);
        importResults.push({
          csvName: row.originalName,
          status: 'error',
          message: err instanceof Error ? err.message : 'Unknown error',
          updatedFields: [],
        });
        errorCount++;
      }
    }

    setResults(importResults);
    setStats({
      total: parsedData.length,
      success: successCount,
      notFound: notFoundCount,
      errors: errorCount,
    });
    setUploading(false);

    alert(`✅ Import Complete!\n\n✓ ${successCount} updated\n✗ ${notFoundCount} not found\n⚠ ${errorCount} errors`);
  };

  const downloadResults = () => {
    if (results.length === 0) return;

    const csv = [
      ['CSV Name', 'Matched DB Name', 'Status', 'Updated Fields', 'Message', 'Old Name', 'New Name', 'Old Operator', 'New Operator', 'Old Suburb', 'New Suburb', 'Old Postcode', 'New Postcode'],
      ...results.map(r => [
        r.csvName,
        r.matchedDbName || '',
        r.status,
        r.updatedFields.join(', '),
        r.message,
        r.oldData?.name || '',
        r.newData?.name || '',
        r.oldData?.operator || '',
        r.newData?.operator || '',
        r.oldData?.suburb || '',
        r.newData?.suburb || '',
        r.oldData?.postcode || '',
        r.newData?.postcode || '',
      ]),
    ].map(row => row.map(cell => `"${cell}"`).join(',')).join('\n');

    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `vic-combined-import-results-${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const downloadTemplate = () => {
    const csv = [
      ['Name', 'Operator', 'Suburb', 'Postcode', 'Website URL'],
      ['Yarrabat Place Pinnacle Living', 'Pinnacle Living', 'BALWYN', '3103', 'https://example.com'],
      ['Example Village', 'Regis', 'Melbourne', '3000', ''],
    ].map(row => row.map(cell => `"${cell}"`).join(',')).join('\n');

    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'vic-combined-import-template.csv';
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <Card className="p-6 bg-gradient-to-r from-purple-50 via-pink-50 to-orange-50 border-2 border-purple-400">
      <h2 className="text-2xl font-bold mb-2 text-purple-900 flex items-center gap-2">
        <Sparkles className="size-6" />
        🚀 VIC Combined Data Importer
      </h2>
      <p className="text-sm text-purple-700 mb-4">
        Upload ONE CSV to update names, operators, URLs, suburbs, and postcodes - all at once!
      </p>

      <Alert className="mb-4 bg-blue-50 border-blue-400">
        <AlertTriangle className="size-4" />
        <AlertDescription>
          <strong>✨ Smart Import Features:</strong>
          <div className="mt-2 space-y-1 text-sm">
            <div>• <strong>Fuzzy Matching:</strong> Finds villages even if names don't match exactly</div>
            <div>• <strong>Corrected Names:</strong> Updates village names to correct spellings</div>
            <div>• <strong>Flexible Columns:</strong> Only include the fields you want to update</div>
            <div>• <strong>All Fields Optional:</strong> Name is required, everything else is optional</div>
          </div>
          <div className="mt-3 text-sm font-mono bg-white p-2 rounded border">
            Required: <strong>Name</strong><br />
            Optional: Operator, Suburb, Postcode, Website URL
          </div>
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
              file:bg-purple-600 file:text-white
              hover:file:bg-purple-700
              file:cursor-pointer cursor-pointer
              disabled:opacity-50"
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
                <div key={idx} className="p-3 bg-gradient-to-r from-purple-50 to-pink-50 rounded border text-sm">
                  <p><strong>Name:</strong> {row.originalName}</p>
                  {row.operator && <p><strong>Operator:</strong> {row.operator}</p>}
                  {row.suburb && <p><strong>Suburb:</strong> {row.suburb}</p>}
                  {row.postcode && <p><strong>Postcode:</strong> {row.postcode}</p>}
                  {row.websiteUrl && <p><strong>Website:</strong> {row.websiteUrl}</p>}
                </div>
              ))}
              {parsedData.length > 5 && (
                <p className="text-xs text-gray-600 text-center">
                  ... and {parsedData.length - 5} more villages
                </p>
              )}
            </div>
          </Card>
        )}

        {/* Import Button */}
        {parsedData.length > 0 && results.length === 0 && (
          <Button
            onClick={importData}
            disabled={uploading}
            className="bg-purple-600 hover:bg-purple-700 w-full"
            size="lg"
          >
            {uploading ? (
              <>
                <Upload className="size-5 mr-2 animate-pulse" />
                Importing... (This may take a minute)
              </>
            ) : (
              <>
                <Sparkles className="size-5 mr-2" />
                Import {parsedData.length} Villages
              </>
            )}
          </Button>
        )}

        {/* Results */}
        {results.length > 0 && (
          <Card className="p-4 bg-white">
            <div className="flex justify-between items-center mb-4">
              <h3 className="font-semibold text-lg">Import Results</h3>
              <Button
                size="sm"
                onClick={downloadResults}
                className="bg-green-600 hover:bg-green-700"
              >
                <Download className="size-4 mr-2" />
                Download Report
              </Button>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-4 gap-4 mb-4">
              <div className="text-center p-3 bg-gray-50 rounded border">
                <div className="text-2xl font-bold text-gray-700">{stats.total}</div>
                <div className="text-xs text-gray-600">Total</div>
              </div>
              <div className="text-center p-3 bg-green-50 rounded border border-green-200">
                <div className="text-2xl font-bold text-green-700">{stats.success}</div>
                <div className="text-xs text-green-600">✓ Updated</div>
              </div>
              <div className="text-center p-3 bg-yellow-50 rounded border border-yellow-200">
                <div className="text-2xl font-bold text-yellow-700">{stats.notFound}</div>
                <div className="text-xs text-yellow-600">⚠ Not Found</div>
              </div>
              <div className="text-center p-3 bg-red-50 rounded border border-red-200">
                <div className="text-2xl font-bold text-red-700">{stats.errors}</div>
                <div className="text-xs text-red-600">✗ Errors</div>
              </div>
            </div>

            {/* Success Summary */}
            {stats.success > 0 && (
              <Alert className="mb-4 bg-green-50 border-green-400">
                <CheckCircle className="size-4" />
                <AlertDescription>
                  <strong className="text-green-700">🎉 SUCCESS!</strong>
                  <p className="mt-1">{stats.success} villages updated successfully!</p>
                  {stats.notFound > 0 && (
                    <p className="mt-1 text-yellow-700">
                      ⚠ {stats.notFound} villages not found - check spelling or add them as new villages
                    </p>
                  )}
                </AlertDescription>
              </Alert>
            )}

            {/* Results Table */}
            <div className="max-h-[500px] overflow-y-auto border rounded">
              <table className="w-full text-sm">
                <thead className="bg-gray-100 sticky top-0">
                  <tr>
                    <th className="p-2 text-left">Status</th>
                    <th className="p-2 text-left">CSV Name</th>
                    <th className="p-2 text-left">Matched DB Name</th>
                    <th className="p-2 text-left">Updated Fields</th>
                    <th className="p-2 text-left">Message</th>
                  </tr>
                </thead>
                <tbody>
                  {results.map((result, idx) => (
                    <tr key={idx} className="border-t hover:bg-gray-50">
                      <td className="p-2">
                        {result.status === 'success' && (
                          <CheckCircle className="size-4 text-green-600" />
                        )}
                        {result.status === 'not_found' && (
                          <AlertTriangle className="size-4 text-yellow-600" />
                        )}
                        {result.status === 'error' && (
                          <XCircle className="size-4 text-red-600" />
                        )}
                      </td>
                      <td className="p-2 font-medium">{result.csvName}</td>
                      <td className="p-2 text-gray-600 text-xs">
                        {result.matchedDbName || '—'}
                      </td>
                      <td className="p-2">
                        {result.updatedFields.length > 0 ? (
                          <div className="flex flex-wrap gap-1">
                            {result.updatedFields.map(field => (
                              <Badge key={field} className="bg-purple-600 text-xs">
                                {field}
                              </Badge>
                            ))}
                          </div>
                        ) : (
                          <span className="text-gray-400 text-xs">—</span>
                        )}
                      </td>
                      <td className="p-2 text-xs text-gray-600">{result.message}</td>
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