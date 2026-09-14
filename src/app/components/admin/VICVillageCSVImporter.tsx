import React, { useState, useRef } from 'react';
import { Card } from '../ui/card';
import { Button } from '../ui/button';
import { Upload, CheckCircle, AlertCircle, Download, FileSpreadsheet, Trash2 } from 'lucide-react';
import { getSupabaseClient } from '../../utils/supabase/client';
import Papa from 'papaparse';

interface VillageRow {
  name: string;
  operator: string;
  suburb: string;
  postcode: string;
  website: string;
}

interface ImportResult {
  success: number;
  failed: number;
  skipped: number;
  errors: string[];
}

export function VICVillageCSVImporter() {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);
  const [results, setResults] = useState<ImportResult | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [csvHeaders, setCsvHeaders] = useState<string[]>([]);
  const [showHeaderMapping, setShowHeaderMapping] = useState(false);
  const [parsedData, setParsedData] = useState<any[]>([]);
  const [replaceExisting, setReplaceExisting] = useState(false);
  const [headerMapping, setHeaderMapping] = useState<{
    name: string;
    operator: string;
    suburb: string;
    postcode: string;
    website: string;
  }>({
    name: '',
    operator: '',
    suburb: '',
    postcode: '',
    website: ''
  });

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setUploading(true);
    setError(null);
    setResults(null);

    try {
      Papa.parse(file, {
        header: true,
        skipEmptyLines: true,
        encoding: 'UTF-8',
        complete: (results) => {
          try {
            if (!results.data || results.data.length === 0) {
              throw new Error('CSV file is empty or could not be parsed');
            }

            console.log(`📄 PapaParse results: ${results.data.length} rows`);
            console.log(`📋 Headers:`, results.meta.fields);
            
            const validHeaders = results.meta.fields?.filter(h => h && h.trim().length > 0) || [];
            
            if (validHeaders.length === 0) {
              throw new Error('No valid headers found in CSV file');
            }
            
            setCsvHeaders(validHeaders);
            setParsedData(results.data);
            
            // Smart auto-mapping
            const autoMapping = {
              name: '',
              operator: '',
              suburb: '',
              postcode: '',
              website: ''
            };
            
            validHeaders.forEach(header => {
              const lowerHeader = header.toLowerCase().trim();
              
              // Village Name
              if (lowerHeader.includes('village') && lowerHeader.includes('name') || lowerHeader === 'name' || lowerHeader === 'village name') {
                autoMapping.name = header;
              }
              // Operator
              if (lowerHeader.includes('operator') || lowerHeader === 'operator name') {
                autoMapping.operator = header;
              }
              // Suburb
              if (lowerHeader.includes('suburb') || lowerHeader === 'suburb') {
                autoMapping.suburb = header;
              }
              // Postcode
              if (lowerHeader.includes('postcode') || lowerHeader.includes('post code') || lowerHeader === 'postcode') {
                autoMapping.postcode = header;
              }
              // Website
              if (lowerHeader.includes('website') || lowerHeader.includes('url') || lowerHeader === 'website') {
                autoMapping.website = header;
              }
            });
            
            setHeaderMapping(autoMapping);
            setShowHeaderMapping(true);
            setUploading(false);

            console.log(`📊 Parsed ${results.data.length} rows from CSV`);
            console.log('🤖 Auto-mapped headers:', autoMapping);
            
          } catch (err) {
            console.error('CSV Parsing Error:', err);
            setError(err instanceof Error ? err.message : 'Failed to parse CSV file');
            setUploading(false);
          }
        },
        error: (error) => {
          console.error('PapaParse Error:', error);
          setError(`Failed to parse CSV: ${error.message}`);
          setUploading(false);
        }
      });
    } catch (err) {
      console.error('CSV Upload Error:', err);
      setError(err instanceof Error ? err.message : 'Failed to parse CSV file');
      setUploading(false);
    }
  };

  const importToDatabase = async () => {
    if (!parsedData.length) {
      setError('No data to import');
      return;
    }

    // Validate header mapping
    if (!headerMapping.name) {
      setError('Please map the Village Name field');
      return;
    }

    setUploading(true);
    setError(null);

    try {
      const supabase = getSupabaseClient();
      
      let successCount = 0;
      let failedCount = 0;
      let skippedCount = 0;
      const errors: string[] = [];
      const skippedDetails: string[] = [];

      console.log(`🚀 Starting import of ${parsedData.length} VIC villages...`);
      console.log(`🔄 Replace existing: ${replaceExisting}`);
      console.log(`✅ ACCEPTING ALL CSV ROWS - No filtering or validation`);
      
      for (const row of parsedData) {
        try {
          const villageName = row[headerMapping.name]?.trim();
          
          // ✅ REMOVED FILTER: Accept ALL villages even with empty names
          // If name is empty, use "Unknown Village" as placeholder
          const cleanVillageName = villageName || `Unknown Village ${parsedData.indexOf(row) + 1}`;

          // Extract mapped data
          const operator = headerMapping.operator ? (row[headerMapping.operator]?.trim() || '') : '';
          const suburb = headerMapping.suburb ? (row[headerMapping.suburb]?.trim() || '') : '';
          const postcode = headerMapping.postcode ? (row[headerMapping.postcode]?.trim() || '') : '';
          const website = headerMapping.website ? (row[headerMapping.website]?.trim() || '') : '';

          // 🐛 BUG FIX: Explicitly check for empty/undefined operator values
          // PapaParse sometimes returns undefined, null, or whitespace-only strings
          const cleanOperator = operator && operator.trim() !== '' ? operator.trim() : '';

          console.log(`🔍 Processing: ${cleanVillageName}`);
          console.log(`   📋 Extracted from CSV:`);
          console.log(`      Operator: "${cleanOperator || '(empty)'}"`);
          console.log(`      Suburb: "${suburb || '(empty)'}"`);
          console.log(`      Postcode: "${postcode || '(empty)'}"`);
          console.log(`      Website: "${website || '(empty)'}"`);
          console.log(`   📊 Raw CSV row data:`, row);
          console.log(`   🗺️ Header mapping used:`, headerMapping);

          // CRITICAL: Use REAL fuzzy matching to find existing villages
          // Step 1: Try exact case-insensitive match
          let { data: existingVillages, error: checkError } = await supabase
            .from('retirement_villages')
            .select('id, name, operator, suburb')
            .eq('state', 'VIC')
            .ilike('name', cleanVillageName);

          // Step 2: If no match, try partial match (database name contains CSV name)
          if (!existingVillages || existingVillages.length === 0) {
            console.log(`   🔍 No exact match, trying partial match...`);
            const { data: partialMatches } = await supabase
              .from('retirement_villages')
              .select('id, name, operator, suburb')
              .eq('state', 'VIC')
              .ilike('name', `%${cleanVillageName}%`);
            
            if (partialMatches && partialMatches.length > 0) {
              console.log(`   ✓ Found ${partialMatches.length} partial matches:`, partialMatches.map(v => v.name));
              existingVillages = partialMatches;
            }
          }

          // Step 3: If still no match, try reverse partial match (CSV name contains database name)
          if (!existingVillages || existingVillages.length === 0) {
            console.log(`   🔍 No partial match, trying reverse match...`);
            const { data: allVicVillages } = await supabase
              .from('retirement_villages')
              .select('id, name, operator, suburb')
              .eq('state', 'VIC');
            
            if (allVicVillages) {
              const reverseMatches = allVicVillages.filter(v => 
                cleanVillageName.toLowerCase().includes(v.name.toLowerCase())
              );
              
              if (reverseMatches.length > 0) {
                console.log(`   ✓ Found ${reverseMatches.length} reverse matches:`, reverseMatches.map(v => v.name));
                existingVillages = reverseMatches;
              }
            }
          }

          // Step 4: If STILL no match and we have a suburb, try matching by suburb + similar name
          if ((!existingVillages || existingVillages.length === 0) && suburb) {
            console.log(`   🔍 No match yet, trying suburb + name similarity...`);
            const { data: suburbVillages } = await supabase
              .from('retirement_villages')
              .select('id, name, operator, suburb')
              .eq('state', 'VIC')
              .ilike('suburb', suburb);
            
            if (suburbVillages && suburbVillages.length > 0) {
              // Calculate similarity score for each village in same suburb
              const scoredMatches = suburbVillages.map(v => {
                const csvWords = cleanVillageName.toLowerCase().split(/\s+/);
                const dbWords = v.name.toLowerCase().split(/\s+/);
                const matchingWords = csvWords.filter(word => dbWords.some(dbWord => dbWord.includes(word) || word.includes(dbWord)));
                const score = matchingWords.length / Math.max(csvWords.length, dbWords.length);
                return { ...v, score };
              });
              
              // Use villages with >50% word similarity
              const similarMatches = scoredMatches.filter(m => m.score > 0.5);
              
              if (similarMatches.length > 0) {
                console.log(`   ✓ Found ${similarMatches.length} similar matches in ${suburb}:`, 
                  similarMatches.map(v => `${v.name} (score: ${(v.score * 100).toFixed(0)}%)`));
                existingVillages = similarMatches;
              }
            }
          }

          if (checkError) {
            console.error(`Error checking village ${cleanVillageName}:`, checkError);
            failedCount++;
            errors.push(`${cleanVillageName}: Database check failed`);
            continue;
          }

          const villageData = {
            name: cleanVillageName,
            operator: cleanOperator || '',
            location: suburb || 'VIC',
            suburb: suburb || '',
            postcode: postcode || '',
            state: 'VIC',
            status: 'approved',
            facility_type: 'retirement_village',
            village_type: 'Retirement Village',
            care_level: 'Independent Living',
            description: `${cleanVillageName}${cleanOperator ? ` - Operated by ${cleanOperator}` : ''}`,
            website: website || '',
            submitted_at: new Date().toISOString(),
            updated_at: new Date().toISOString()
          };

          if (existingVillages && existingVillages.length > 0) {
            // Village already exists
            console.log(`   ✓ Found existing: ${existingVillages[0].name} (Old operator: ${existingVillages[0].operator})`);
            
            if (replaceExisting) {
              // SAFE UPDATE: Only update fields that have non-empty values in the CSV
              // This prevents overwriting good data with empty strings!
              const updateData: any = {};
              
              // Only update fields if they're provided AND not empty
              if (cleanVillageName) updateData.name = cleanVillageName;
              if (cleanOperator) updateData.operator = cleanOperator;
              if (suburb) {
                updateData.location = suburb;
                updateData.suburb = suburb;
              }
              if (postcode) updateData.postcode = postcode;
              if (website) {
                updateData.website = website;
                console.log(`🌐 Updating website for ${cleanVillageName}: ${website}`);
              }
              
              // Always update timestamp
              updateData.updated_at = new Date().toISOString();
              
              // Skip update if no meaningful data to update (only timestamp would change)
              if (Object.keys(updateData).length <= 1) {
                console.log(`⏭️ Skipping ${cleanVillageName} - no new data to update`);
                skippedCount++;
                skippedDetails.push(`${cleanVillageName}: No new data`);
                continue;
              }

              const { error: updateError } = await supabase
                .from('retirement_villages')
                .update(updateData)  // ✅ Only update fields that have values
                .eq('id', existingVillages[0].id);

              if (updateError) {
                console.error(`❌ Failed to update ${cleanVillageName}:`, updateError);
                failedCount++;
                errors.push(`${cleanVillageName}: ${updateError.message}`);
              } else {
                console.log(`   ✅ UPDATED ${Object.keys(updateData).length} fields: ${cleanVillageName}`);
                successCount++;
              }
            } else {
              // Skip existing village
              console.log(`   ⏭️ Skipped (exists): ${cleanVillageName}`);
              skippedCount++;
              skippedDetails.push(`${cleanVillageName}: Already exists`);
            }
          } else {
            // Insert new village
            const { error: insertError } = await supabase
              .from('retirement_villages')
              .insert([{ ...villageData, created_at: new Date().toISOString() }]);

            if (insertError) {
              console.error(`❌ Failed to insert ${cleanVillageName}:`, insertError);
              failedCount++;
              errors.push(`${cleanVillageName}: ${insertError.message}`);
            } else {
              console.log(`   ✅ INSERTED: ${cleanVillageName}`);
              successCount++;
            }
          }

        } catch (err) {
          console.error('Error processing row:', err);
          failedCount++;
          errors.push(`Row error: ${err instanceof Error ? err.message : 'Unknown error'}`);
        }

        // Small delay to avoid rate limiting
        await new Promise(resolve => setTimeout(resolve, 50));
      }

      setResults({
        success: successCount,
        failed: failedCount,
        skipped: skippedCount,
        errors: errors.slice(0, 20)
      });

      console.log(`
        🎉 VIC VILLAGE IMPORT COMPLETE!
        ✅ Success: ${successCount}
        ❌ Failed: ${failedCount}
        ⏭️ Skipped: ${skippedCount}
      `);

      if (skippedDetails.length > 0) {
        console.log(`\n⚠️  SKIPPED VILLAGES (first 20):`);
        skippedDetails.slice(0, 20).forEach(detail => console.log(`   ${detail}`));
      }

    } catch (err) {
      setError(err instanceof Error ? err.message : 'Import failed');
      console.error('Import error:', err);
    } finally {
      setUploading(false);
    }
  };

  const downloadTemplate = () => {
    const csvContent = `Village Name,Operator,Suburb,Postcode,Website
Acacia Court,Royal Freemasons,WHITTINGTON,3219,https://www.royalfreemasons.org.au/independent-living/acacia-court/
The Pines,Aveo Group,GEELONG,3220,https://www.aveo.com.au/retirement-living/vic/geelong/the-pines`;
    
    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'vic-village-import-template.csv';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    window.URL.revokeObjectURL(url);
  };

  const resetUpload = () => {
    setShowHeaderMapping(false);
    setResults(null);
    setError(null);
    setCsvHeaders([]);
    setParsedData([]);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  return (
    <Card className="p-6 bg-gradient-to-r from-green-50 to-emerald-50 border-2 border-green-400">
      <div className="flex items-start justify-between mb-6">
        <div>
          <h2 className="text-2xl font-bold text-green-900">
            ✅ VIC Village CSV Importer
          </h2>
          <p className="text-sm text-green-700">
            Import cleaned VIC village data with proper names and operators
          </p>
        </div>
        <Button
          variant="outline"
          size="sm"
          onClick={downloadTemplate}
        >
          <Download className="size-4 mr-2" />
          Download Template
        </Button>
      </div>

      {/* Upload Section */}
      {!showHeaderMapping && !results && (
        <div className="border-2 border-dashed border-green-300 rounded-lg p-8 text-center">
          <FileSpreadsheet className="size-12 text-green-500 mx-auto mb-4" />
          <h3 className="text-lg mb-2 font-semibold">Upload Cleaned VIC Village CSV</h3>
          <p className="text-sm text-gray-600 mb-4">
            CSV should have: Village Name, Operator, Suburb, Postcode, Website
          </p>
          <input
            type="file"
            accept=".csv"
            onChange={handleFileUpload}
            className="hidden"
            disabled={uploading}
            ref={fileInputRef}
          />
          <Button 
            disabled={uploading}
            onClick={() => fileInputRef.current?.click()}
            className="bg-green-600 hover:bg-green-700"
          >
            <Upload className="size-4 mr-2" />
            {uploading ? 'Processing...' : 'Select CSV File'}
          </Button>
        </div>
      )}

      {/* Header Mapping Section */}
      {showHeaderMapping && !results && (
        <div className="space-y-4">
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <h3 className="font-semibold mb-2">Map CSV Headers to Database Fields</h3>
            <p className="text-sm text-gray-700">
              Found {csvHeaders.length} columns with {parsedData.length} rows of data
            </p>
          </div>

          {/* Sample Data Preview */}
          <div className="bg-purple-50 border border-purple-200 rounded-lg p-4">
            <h3 className="font-semibold mb-3 text-purple-900">📋 Sample Data (First 3 Rows)</h3>
            <div className="space-y-3 text-xs">
              {parsedData.slice(0, 3).map((row, idx) => (
                <div key={idx} className="bg-white p-3 rounded border border-purple-200">
                  <div className="font-semibold text-purple-900 mb-2">Row {idx + 1}:</div>
                  <div className="grid grid-cols-1 gap-1">
                    {csvHeaders.map(header => (
                      <div key={header} className="flex">
                        <span className="font-medium text-purple-700 w-48 flex-shrink-0">{header}:</span>
                        <span className="text-gray-700 truncate" title={row[header]}>{row[header] || '(empty)'}</span>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            {/* Village Name - Required */}
            <div>
              <label className="block text-sm font-medium mb-2">
                Village Name <span className="text-red-500">*</span>
              </label>
              <select
                className="w-full border border-gray-300 rounded-lg p-2"
                value={headerMapping.name}
                onChange={(e) => setHeaderMapping({ ...headerMapping, name: e.target.value })}
              >
                <option value="">-- Select Column --</option>
                {csvHeaders.map(header => (
                  <option key={header} value={header}>{header}</option>
                ))}
              </select>
            </div>

            {/* Operator */}
            <div>
              <label className="block text-sm font-medium mb-2">
                Operator <span className="text-gray-400">(optional)</span>
              </label>
              <select
                className="w-full border border-gray-300 rounded-lg p-2"
                value={headerMapping.operator}
                onChange={(e) => setHeaderMapping({ ...headerMapping, operator: e.target.value })}
              >
                <option value="">-- Select Column --</option>
                {csvHeaders.map(header => (
                  <option key={header} value={header}>{header}</option>
                ))}
              </select>
            </div>

            {/* Suburb */}
            <div>
              <label className="block text-sm font-medium mb-2">
                Suburb <span className="text-gray-400">(optional)</span>
              </label>
              <select
                className="w-full border border-gray-300 rounded-lg p-2"
                value={headerMapping.suburb}
                onChange={(e) => setHeaderMapping({ ...headerMapping, suburb: e.target.value })}
              >
                <option value="">-- Select Column --</option>
                {csvHeaders.map(header => (
                  <option key={header} value={header}>{header}</option>
                ))}
              </select>
            </div>

            {/* Postcode */}
            <div>
              <label className="block text-sm font-medium mb-2">
                Postcode <span className="text-gray-400">(optional)</span>
              </label>
              <select
                className="w-full border border-gray-300 rounded-lg p-2"
                value={headerMapping.postcode}
                onChange={(e) => setHeaderMapping({ ...headerMapping, postcode: e.target.value })}
              >
                <option value="">-- Select Column --</option>
                {csvHeaders.map(header => (
                  <option key={header} value={header}>{header}</option>
                ))}
              </select>
            </div>

            {/* Website */}
            <div className="col-span-2">
              <label className="block text-sm font-medium mb-2">
                Website <span className="text-gray-400">(optional)</span>
              </label>
              <select
                className="w-full border border-gray-300 rounded-lg p-2"
                value={headerMapping.website}
                onChange={(e) => setHeaderMapping({ ...headerMapping, website: e.target.value })}
              >
                <option value="">-- Select Column --</option>
                {csvHeaders.map(header => (
                  <option key={header} value={header}>{header}</option>
                ))}
              </select>
            </div>
          </div>

          {/* Replace Existing Toggle */}
          <div className="bg-amber-50 border border-amber-300 rounded-lg p-4">
            <label className="flex items-center gap-3 cursor-pointer">
              <input
                type="checkbox"
                checked={replaceExisting}
                onChange={(e) => setReplaceExisting(e.target.checked)}
                className="size-5"
              />
              <div>
                <div className="font-semibold text-amber-900">Replace Existing Villages</div>
                <div className="text-sm text-amber-700">
                  If checked, will update existing villages with the same name. If unchecked, will skip duplicates.
                </div>
              </div>
            </label>
          </div>

          <div className="flex gap-3">
            <Button
              onClick={importToDatabase}
              disabled={uploading || !headerMapping.name}
              className="flex-1 bg-green-600 hover:bg-green-700"
            >
              {uploading ? (
                <>Processing {parsedData.length} villages...</>
              ) : (
                <>🚀 Import {parsedData.length} Villages</>
              )}
            </Button>
            <Button
              onClick={resetUpload}
              variant="outline"
              disabled={uploading}
            >
              <Trash2 className="size-4 mr-2" />
              Cancel
            </Button>
          </div>
        </div>
      )}

      {/* Results Section */}
      {results && (
        <div className="space-y-4">
          <div className="bg-white border rounded-lg p-6">
            <div className="flex items-center gap-3 mb-4">
              <CheckCircle className="size-8 text-green-600" />
              <div>
                <h3 className="text-xl font-semibold">Import Complete</h3>
                <p className="text-gray-600">VIC village import finished</p>
              </div>
            </div>

            <div className="grid grid-cols-3 gap-4 mb-4">
              <div className="text-center p-4 bg-green-50 rounded border border-green-200">
                <div className="text-3xl font-bold text-green-700">{results.success}</div>
                <div className="text-sm text-green-600">Imported</div>
              </div>
              <div className="text-center p-4 bg-red-50 rounded border border-red-200">
                <div className="text-3xl font-bold text-red-700">{results.failed}</div>
                <div className="text-sm text-red-600">Failed</div>
              </div>
              <div className="text-center p-4 bg-gray-50 rounded border border-gray-200">
                <div className="text-3xl font-bold text-gray-700">{results.skipped}</div>
                <div className="text-sm text-gray-600">Skipped</div>
              </div>
            </div>

            {results.errors.length > 0 && (
              <div className="bg-red-50 border border-red-200 rounded p-4">
                <h4 className="font-semibold text-red-900 mb-2">Errors:</h4>
                <ul className="text-sm text-red-700 space-y-1">
                  {results.errors.map((error, idx) => (
                    <li key={idx}>• {error}</li>
                  ))}
                </ul>
              </div>
            )}
          </div>

          <Button onClick={resetUpload} className="w-full">
            <Upload className="size-4 mr-2" />
            Import Another File
          </Button>
        </div>
      )}

      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4 flex items-start gap-3">
          <AlertCircle className="size-5 text-red-600 flex-shrink-0 mt-0.5" />
          <div className="text-sm text-red-800">{error}</div>
        </div>
      )}
    </Card>
  );
}