import { useState, useRef } from 'react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '../ui/card';
import { Button } from '../ui/button';
import { Upload, Loader2, CheckCircle, AlertCircle, FileSpreadsheet } from 'lucide-react';
import { projectId, publicAnonKey } from '../../utils/supabase/info';

interface MergeResult {
  updated: number;
  skipped: number;
  failed: number;
  details: {
    village: string;
    suburb: string;
    operator: string;
    status: 'updated' | 'skipped' | 'failed';
    reason?: string;
  }[];
}

export function VICOperatorCSVMerger() {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);
  const [result, setResult] = useState<MergeResult | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploading(true);
    setError(null);
    setResult(null);

    try {
      const text = await file.text();
      const lines = text.split('\n').filter(line => line.trim());

      if (lines.length === 0) {
        throw new Error('CSV file is empty');
      }

      // Parse CSV header
      const header = lines[0].toLowerCase();
      console.log('📋 CSV Header:', header);

      // Detect column positions (support multiple formats)
      const cols = header.split(',').map(h => h.trim());
      const nameIdx = cols.findIndex(c => c.includes('village') || c.includes('name'));
      const suburbIdx = cols.findIndex(c => c.includes('suburb'));
      const operatorIdx = cols.findIndex(c => c.includes('operator'));

      if (nameIdx === -1 || operatorIdx === -1) {
        throw new Error('CSV must have "Village Name" and "Operator" columns');
      }

      console.log(`📍 Column positions: Name=${nameIdx}, Suburb=${suburbIdx}, Operator=${operatorIdx}`);

      // Parse data rows
      const villages: { name: string; suburb: string; operator: string }[] = [];
      
      for (let i = 1; i < lines.length; i++) {
        const line = lines[i].trim();
        if (!line) continue;

        const values = line.split(',').map(v => v.trim().replace(/^"|"$/g, ''));
        
        const name = values[nameIdx];
        const suburb = suburbIdx >= 0 ? values[suburbIdx] : '';
        const operator = values[operatorIdx];

        if (name && operator && operator.toLowerCase() !== 'null' && operator !== '') {
          villages.push({ name, suburb, operator });
        }
      }

      console.log(`📊 Parsed ${villages.length} villages with operators from CSV`);

      if (villages.length === 0) {
        throw new Error('No valid villages found in CSV (need village name + operator)');
      }

      // Send to backend for merge
      const response = await fetch(
        `https://${projectId}.supabase.co/functions/v1/make-server-3bba8be8/vic-operator-csv-merger`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${publicAnonKey}`
          },
          body: JSON.stringify({ villages })
        }
      );

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to merge operators');
      }

      const data = await response.json();
      setResult(data);

      console.log('✅ Merge complete:', data);

    } catch (err: any) {
      console.error('❌ CSV merge error:', err);
      setError(err.message || 'Failed to merge CSV');
    } finally {
      setUploading(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  const downloadResults = () => {
    if (!result) return;

    const csvContent = [
      'Village Name,Suburb,Operator,Status,Reason',
      ...result.details.map(d => 
        `"${d.village}","${d.suburb}","${d.operator}","${d.status}","${d.reason || ''}"`
      )
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `vic-operator-merge-results-${Date.now()}.csv`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    window.URL.revokeObjectURL(url);
  };

  return (
    <Card className="p-6 bg-gradient-to-r from-green-50 to-emerald-50 border-2 border-green-400">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-green-900">
          <FileSpreadsheet className="size-6" />
          VIC Operator CSV Merger
        </CardTitle>
        <CardDescription className="text-green-700">
          Upload your scraped CSV with operators - merges into database without overwriting existing data
        </CardDescription>
      </CardHeader>

      <CardContent className="space-y-4">
        {/* Instructions */}
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 text-sm">
          <h3 className="font-semibold text-blue-900 mb-2">📋 Instructions:</h3>
          <ol className="list-decimal list-inside text-blue-800 space-y-1">
            <li><strong>Step 1:</strong> Use "VIC Aberlea Filter" tool to clear all Aberlea false matches first</li>
            <li><strong>Step 2:</strong> Upload your scraped CSV with columns: Village Name, Suburb (optional), Operator</li>
            <li><strong>Step 3:</strong> Tool will update villages with NEW operators only (won't overwrite existing ones)</li>
            <li><strong>Step 4:</strong> Download results CSV to see what was updated/skipped</li>
          </ol>
        </div>

        {/* Upload Section */}
        {!result && (
          <div className="border-2 border-dashed border-green-300 rounded-lg p-8 text-center">
            <Upload className="size-12 text-green-500 mx-auto mb-4" />
            <h3 className="text-lg mb-2 font-semibold">Upload Scraped Operators CSV</h3>
            <p className="text-sm text-gray-600 mb-4">
              CSV should have: Village Name, Suburb, Operator columns
            </p>
            <input
              type="file"
              ref={fileInputRef}
              accept=".csv"
              onChange={handleFileUpload}
              className="hidden"
              disabled={uploading}
            />
            <Button
              onClick={() => fileInputRef.current?.click()}
              disabled={uploading}
              size="lg"
              className="bg-green-600 hover:bg-green-700"
            >
              {uploading ? (
                <>
                  <Loader2 className="mr-2 size-4 animate-spin" />
                  Merging...
                </>
              ) : (
                <>
                  <Upload className="mr-2 size-4" />
                  Select CSV File
                </>
              )}
            </Button>
          </div>
        )}

        {/* Error Display */}
        {error && (
          <div className="bg-red-50 border border-red-300 rounded-lg p-4 flex items-start gap-3">
            <AlertCircle className="size-5 text-red-600 flex-shrink-0 mt-0.5" />
            <div>
              <h3 className="font-semibold text-red-900">Error</h3>
              <p className="text-sm text-red-700">{error}</p>
            </div>
          </div>
        )}

        {/* Results Display */}
        {result && (
          <div className="space-y-4">
            <div className="bg-white border-2 border-green-500 rounded-lg p-6">
              <div className="flex items-center gap-3 mb-4">
                <CheckCircle className="size-8 text-green-600" />
                <div>
                  <h3 className="text-xl font-bold text-green-900">Merge Complete!</h3>
                  <p className="text-sm text-gray-600">Operators have been merged into the database</p>
                </div>
              </div>

              <div className="grid grid-cols-3 gap-4 mb-4">
                <div className="bg-green-100 rounded-lg p-4 text-center">
                  <div className="text-3xl font-bold text-green-700">{result.updated}</div>
                  <div className="text-sm text-green-600">Updated</div>
                </div>
                <div className="bg-yellow-100 rounded-lg p-4 text-center">
                  <div className="text-3xl font-bold text-yellow-700">{result.skipped}</div>
                  <div className="text-sm text-yellow-600">Skipped</div>
                </div>
                <div className="bg-red-100 rounded-lg p-4 text-center">
                  <div className="text-3xl font-bold text-red-700">{result.failed}</div>
                  <div className="text-sm text-red-600">Failed</div>
                </div>
              </div>

              {/* Show first 10 details */}
              <div className="space-y-2 mb-4 max-h-60 overflow-y-auto">
                {result.details.slice(0, 10).map((detail, idx) => (
                  <div
                    key={idx}
                    className={`p-3 rounded-lg text-sm ${
                      detail.status === 'updated' ? 'bg-green-50 border border-green-200' :
                      detail.status === 'skipped' ? 'bg-yellow-50 border border-yellow-200' :
                      'bg-red-50 border border-red-200'
                    }`}
                  >
                    <div className="font-semibold">
                      {detail.village} {detail.suburb && `(${detail.suburb})`}
                    </div>
                    <div className="text-xs text-gray-600">
                      Operator: {detail.operator} • {detail.status.toUpperCase()}
                      {detail.reason && ` - ${detail.reason}`}
                    </div>
                  </div>
                ))}
                {result.details.length > 10 && (
                  <div className="text-center text-sm text-gray-500">
                    ... and {result.details.length - 10} more (download CSV for full results)
                  </div>
                )}
              </div>

              <div className="flex gap-3">
                <Button
                  onClick={downloadResults}
                  variant="outline"
                  className="flex-1"
                >
                  <FileSpreadsheet className="mr-2 size-4" />
                  Download Full Results CSV
                </Button>
                <Button
                  onClick={() => {
                    setResult(null);
                    setError(null);
                  }}
                  className="flex-1 bg-green-600 hover:bg-green-700"
                >
                  Merge Another CSV
                </Button>
              </div>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
