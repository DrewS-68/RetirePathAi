import { useState } from 'react';
import { Button } from '../ui/button';
import { Card, CardHeader, CardTitle, CardContent } from '../ui/card';
import { Upload, CheckCircle, XCircle, Loader2, FileText } from 'lucide-react';
import { projectId, publicAnonKey } from '../../utils/supabase/info';

interface CSVVillage {
  name: string;
  operator: string;
  website?: string;
}

interface MergeResult {
  success: boolean;
  received: number;
  valid: number;
  updated: number;
  notFound: number;
  skipped: number;
  notFoundVillages?: string[];
}

export function VICCSVOperatorMerge() {
  const [csvFile, setCsvFile] = useState<File | null>(null);
  const [csvData, setCsvData] = useState<CSVVillage[]>([]);
  const [merging, setMerging] = useState(false);
  const [error, setError] = useState('');
  const [result, setResult] = useState<MergeResult | null>(null);

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setCsvFile(file);
    setError('');
    setResult(null);

    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const text = event.target?.result as string;
        const lines = text.trim().split('\n');
        
        // Parse CSV
        const headers = lines[0].split(',').map(h => h.trim());
        
        console.log('📋 CSV Headers:', headers);
        
        // Find name column (case insensitive, multiple variations)
        const nameIndex = headers.findIndex(h => 
          ['name', 'village', 'village_name', 'village name', 'villagename'].includes(h.toLowerCase())
        );
        
        // Find operator column (case insensitive)
        const operatorIndex = headers.findIndex(h => 
          ['operator', 'operator_name', 'operator name', 'operatorname'].includes(h.toLowerCase())
        );
        
        // Find website column (optional)
        const websiteIndex = headers.findIndex(h => 
          ['website', 'url', 'site', 'web'].includes(h.toLowerCase())
        );

        if (nameIndex === -1) {
          throw new Error(`CSV must have a name column. Found columns: ${headers.join(', ')}`);
        }
        
        if (operatorIndex === -1) {
          throw new Error(`CSV must have an operator column. Found columns: ${headers.join(', ')}`);
        }

        const villages: CSVVillage[] = [];
        
        for (let i = 1; i < lines.length; i++) {
          const line = lines[i].trim();
          if (!line) continue;

          const values = line.split(',').map(v => v.trim());
          const name = values[nameIndex];
          const operator = values[operatorIndex];
          const website = websiteIndex !== -1 ? values[websiteIndex] : undefined;

          if (name && operator && operator !== 'NULL' && !operator.toLowerCase().includes('aberlea')) {
            villages.push({ name, operator, website });
          }
        }

        console.log(`✅ Parsed ${villages.length} valid villages from CSV`);
        setCsvData(villages);

      } catch (err: any) {
        setError(`Failed to parse CSV: ${err.message}`);
        console.error('CSV parse error:', err);
      }
    };
    
    reader.onerror = () => {
      setError('Failed to read CSV file');
    };

    reader.readAsText(file);
  };

  const mergeCsvOperators = async () => {
    if (csvData.length === 0) {
      setError('No valid data to merge. Please upload a CSV file first.');
      return;
    }

    setMerging(true);
    setError('');
    setResult(null);

    try {
      console.log(`🚀 Sending ${csvData.length} villages to merge endpoint...`);

      const response = await fetch(
        `https://${projectId}.supabase.co/functions/v1/make-server-3bba8be8/admin/merge-scraped-operators`,
        {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${publicAnonKey}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ operators: csvData }),
        }
      );

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to merge operators');
      }

      const resultData = await response.json();
      console.log('✅ Merge complete:', resultData);

      setResult(resultData);

    } catch (err: any) {
      setError(err.message);
      console.error('❌ Merge error:', err);
    } finally {
      setMerging(false);
    }
  };

  return (
    <Card className="border-2 border-indigo-400">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <FileText className="size-6 text-indigo-600" />
          CSV Upload & Merge Tool
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="bg-indigo-50 border-2 border-indigo-200 rounded-lg p-4">
          <p className="text-sm text-indigo-900 font-semibold mb-2">
            📤 Upload your CSV with operators:
          </p>
          <ul className="text-sm text-indigo-800 space-y-1 list-disc list-inside">
            <li>CSV must have columns: <code>name</code>, <code>operator</code>, and optionally <code>website</code></li>
            <li>Villages with NULL or Aberlea operators will be automatically excluded</li>
            <li>Exact name matching will be used to find villages in the database</li>
            <li>Operator field will be updated for all matched villages</li>
          </ul>
        </div>

        <div className="border-2 border-dashed border-indigo-300 rounded-lg p-6 bg-indigo-50/50">
          <label htmlFor="csv-upload" className="cursor-pointer block text-center">
            <Upload className="mx-auto size-12 text-indigo-400 mb-2" />
            <p className="text-sm text-indigo-900 font-medium mb-1">
              Click to upload CSV file
            </p>
            <p className="text-xs text-indigo-700">
              {csvFile ? `Selected: ${csvFile.name}` : 'No file selected'}
            </p>
            <input
              id="csv-upload"
              type="file"
              accept=".csv"
              onChange={handleFileUpload}
              className="hidden"
            />
          </label>
        </div>

        {csvData.length > 0 && (
          <div className="bg-green-50 border border-green-300 rounded p-3">
            <p className="text-sm text-green-900">
              ✅ <strong>Loaded {csvData.length} valid villages</strong> from CSV
            </p>
            <p className="text-xs text-green-700 mt-1">
              (Excluding NULL and Aberlea operators)
            </p>
          </div>
        )}

        <Button
          onClick={mergeCsvOperators}
          disabled={merging || csvData.length === 0}
          className="w-full bg-indigo-600 hover:bg-indigo-700"
          size="lg"
        >
          {merging ? (
            <>
              <Loader2 className="mr-2 size-4 animate-spin" />
              Merging {csvData.length} Operators...
            </>
          ) : (
            <>
              <Upload className="mr-2 size-4" />
              Merge {csvData.length || 0} Operators to Database
            </>
          )}
        </Button>

        {error && (
          <div className="bg-red-50 border border-red-200 rounded p-3">
            <div className="flex items-start gap-2">
              <XCircle className="size-5 text-red-600 flex-shrink-0 mt-0.5" />
              <div className="text-sm text-red-800">
                <strong>Error:</strong> {error}
              </div>
            </div>
          </div>
        )}

        {result && (
          <div className="bg-green-50 border-2 border-green-300 rounded-lg p-4">
            <div className="flex items-center gap-2 mb-3">
              <CheckCircle className="size-6 text-green-600" />
              <h4 className="font-bold text-green-900 text-lg">
                ✅ Merge Complete!
              </h4>
            </div>

            <div className="space-y-2 text-sm">
              <div className="flex justify-between items-center p-2 bg-white rounded">
                <span className="text-gray-700">CSV villages received:</span>
                <strong className="text-gray-900">{result.received || 0}</strong>
              </div>

              <div className="flex justify-between items-center p-2 bg-white rounded">
                <span className="text-gray-700">Valid operators:</span>
                <strong className="text-green-900">{result.valid || 0}</strong>
              </div>

              <div className="flex justify-between items-center p-2 bg-green-100 rounded border border-green-400">
                <span className="text-green-900 font-semibold">✅ Successfully updated:</span>
                <strong className="text-green-900 text-lg">{result.updated || 0} villages</strong>
              </div>

              <div className="flex justify-between items-center p-2 bg-white rounded">
                <span className="text-gray-700">Not found (name mismatch):</span>
                <strong className="text-orange-900">{result.notFound || 0}</strong>
              </div>

              <div className="flex justify-between items-center p-2 bg-white rounded">
                <span className="text-gray-700">Skipped:</span>
                <strong className="text-gray-600">{result.skipped || 0}</strong>
              </div>
            </div>

            {result.notFound > 0 && result.notFoundVillages && result.notFoundVillages.length > 0 && (
              <div className="mt-4 p-3 bg-orange-50 border border-orange-300 rounded">
                <p className="font-semibold text-orange-900 mb-2">
                  ⚠️ Villages not found in database:
                </p>
                <div className="max-h-32 overflow-y-auto text-xs">
                  <ul className="space-y-1 text-orange-800">
                    {result.notFoundVillages.map((name: string, i: number) => (
                      <li key={i}>• {name}</li>
                    ))}
                  </ul>
                </div>
              </div>
            )}

            <div className="mt-4 p-3 bg-blue-50 border border-blue-300 rounded">
              <p className="text-sm text-blue-900">
                🎉 <strong>Success!</strong> {result.updated} villages now have operators in the database.
                Check the VIC Operator Count to verify the total count increased!
              </p>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}