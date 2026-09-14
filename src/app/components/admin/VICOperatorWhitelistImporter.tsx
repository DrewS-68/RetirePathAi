import React, { useState, useRef } from 'react';
import { Card } from '../ui/card';
import { Button } from '../ui/button';
import { Upload, CheckCircle, AlertCircle, Download, FileSpreadsheet, Trash2 } from 'lucide-react';
import { projectId, publicAnonKey } from '../../utils/supabase/info';
import Papa from 'papaparse';

interface ImportResult {
  success: number;
  failed: number;
  skipped: number;
  duplicates: number;
  operators: string[];
}

export function VICOperatorWhitelistImporter() {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);
  const [results, setResults] = useState<ImportResult | null>(null);
  const [error, setError] = useState<string | null>(null);

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
        complete: async (parseResults) => {
          try {
            if (!parseResults.data || parseResults.data.length === 0) {
              throw new Error('CSV file is empty or could not be parsed');
            }

            console.log(`📄 Parsed ${parseResults.data.length} rows from CSV`);
            console.log(`📋 Headers:`, parseResults.meta.fields);

            // Find the operator name column
            const headers = parseResults.meta.fields || [];
            const operatorColumn = headers.find(h => 
              h.toLowerCase().includes('operator') || 
              h.toLowerCase().includes('name')
            );

            if (!operatorColumn) {
              throw new Error('Could not find operator name column. Expected column named "Operator Name", "Operator", or "Name"');
            }

            console.log(`✅ Using column: "${operatorColumn}"`);

            // Extract operator names
            const operators: string[] = [];
            const seen = new Set<string>();
            let duplicates = 0;
            let skipped = 0;

            for (const row of parseResults.data as any[]) {
              const operatorName = row[operatorColumn]?.trim();
              
              if (!operatorName || operatorName === '') {
                skipped++;
                continue;
              }

              // Normalize for duplicate detection (case-insensitive)
              const normalized = operatorName.toLowerCase();
              
              if (seen.has(normalized)) {
                console.log(`⏭️ Duplicate: "${operatorName}"`);
                duplicates++;
                continue;
              }

              seen.add(normalized);
              operators.push(operatorName);
              console.log(`✅ Added: "${operatorName}"`);
            }

            if (operators.length === 0) {
              throw new Error('No valid operator names found in CSV');
            }

            console.log(`\n📊 Extracted ${operators.length} unique operators`);

            // Save to KV store
            const response = await fetch(
              `https://${projectId}.supabase.co/functions/v1/make-server-3bba8be8/vic-operator-whitelist`,
              {
                method: 'POST',
                headers: {
                  'Content-Type': 'application/json',
                  'Authorization': `Bearer ${publicAnonKey}`
                },
                body: JSON.stringify({ operators })
              }
            );

            if (!response.ok) {
              const errorText = await response.text();
              throw new Error(`Failed to save whitelist: ${errorText}`);
            }

            const result = await response.json();
            console.log('✅ Whitelist saved:', result);

            setResults({
              success: operators.length,
              failed: 0,
              skipped,
              duplicates,
              operators: operators.sort()
            });

          } catch (err) {
            console.error('CSV Processing Error:', err);
            setError(err instanceof Error ? err.message : 'Failed to process CSV file');
          } finally {
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

  const downloadTemplate = () => {
    const csvContent = `Operator Name
Regis
Aveo Group
Lendlease
Royal Freemasons
Baptist Care
Uniting AgeWell
Ryman Healthcare
Stockland
Japara Healthcare
Blue Cross`;
    
    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'vic-operators-whitelist-template.csv';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    window.URL.revokeObjectURL(url);
  };

  const resetUpload = () => {
    setResults(null);
    setError(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  return (
    <Card className="p-6 bg-gradient-to-r from-indigo-50 to-purple-50 border-2 border-indigo-400">
      <div className="flex items-start justify-between mb-6">
        <div>
          <h2 className="text-2xl font-bold text-indigo-900">
            📋 VIC Operators Whitelist Importer
          </h2>
          <p className="text-sm text-indigo-700">
            Upload CSV of valid VIC operator names to prevent false positives during scraping
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
      {!results && (
        <div className="border-2 border-dashed border-indigo-300 rounded-lg p-8 text-center">
          <FileSpreadsheet className="size-12 text-indigo-500 mx-auto mb-4" />
          <h3 className="text-lg mb-2 font-semibold">Upload VIC Operators Whitelist CSV</h3>
          <p className="text-sm text-gray-600 mb-4">
            CSV should have one column: "Operator Name" with one operator per row
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
            className="bg-indigo-600 hover:bg-indigo-700"
          >
            <Upload className="size-4 mr-2" />
            {uploading ? 'Processing...' : 'Select CSV File'}
          </Button>
        </div>
      )}

      {/* Results Section */}
      {results && (
        <div className="space-y-4">
          <div className="bg-white border rounded-lg p-6">
            <div className="flex items-center gap-3 mb-4">
              <CheckCircle className="size-8 text-green-600" />
              <div>
                <h3 className="text-xl font-semibold">Whitelist Imported Successfully</h3>
                <p className="text-gray-600">{results.success} unique operators added</p>
              </div>
            </div>

            <div className="grid grid-cols-4 gap-4 mb-6">
              <div className="text-center p-4 bg-green-50 rounded border border-green-200">
                <div className="text-3xl font-bold text-green-700">{results.success}</div>
                <div className="text-sm text-green-600">Imported</div>
              </div>
              <div className="text-center p-4 bg-blue-50 rounded border border-blue-200">
                <div className="text-3xl font-bold text-blue-700">{results.duplicates}</div>
                <div className="text-sm text-blue-600">Duplicates</div>
              </div>
              <div className="text-center p-4 bg-gray-50 rounded border border-gray-200">
                <div className="text-3xl font-bold text-gray-700">{results.skipped}</div>
                <div className="text-sm text-gray-600">Skipped</div>
              </div>
              <div className="text-center p-4 bg-red-50 rounded border border-red-200">
                <div className="text-3xl font-bold text-red-700">{results.failed}</div>
                <div className="text-sm text-red-600">Failed</div>
              </div>
            </div>

            {/* Show operators list */}
            <div className="bg-indigo-50 border border-indigo-200 rounded p-4 max-h-96 overflow-y-auto">
              <h4 className="font-semibold text-indigo-900 mb-3">✅ Imported Operators ({results.operators.length})</h4>
              <div className="grid grid-cols-2 gap-2 text-sm">
                {results.operators.map((operator, idx) => (
                  <div key={idx} className="bg-white px-3 py-2 rounded border border-indigo-200 text-gray-700">
                    {idx + 1}. {operator}
                  </div>
                ))}
              </div>
            </div>
          </div>

          <Button onClick={resetUpload} className="w-full">
            <Upload className="size-4 mr-2" />
            Import Another File (Replace Whitelist)
          </Button>
        </div>
      )}

      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4 flex items-start gap-3">
          <AlertCircle className="size-5 text-red-600 flex-shrink-0 mt-0.5" />
          <div className="text-sm text-red-800">{error}</div>
        </div>
      )}

      {/* Info Box */}
      <div className="mt-6 bg-blue-50 border border-blue-200 rounded-lg p-4">
        <h4 className="font-semibold text-blue-900 mb-2">ℹ️ How This Works</h4>
        <ul className="text-sm text-blue-800 space-y-1">
          <li>• Upload a CSV with all valid VIC retirement village operators</li>
          <li>• The Auto Operator Scraper will ONLY assign operators from this whitelist</li>
          <li>• This prevents false positives (e.g., "Regis" appearing in unrelated content)</li>
          <li>• If a scraped operator isn't in the whitelist, the village will remain without an operator</li>
          <li>• You can re-upload at any time to update the whitelist</li>
        </ul>
      </div>
    </Card>
  );
}
