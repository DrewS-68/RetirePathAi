import React, { useState, useRef } from 'react';
import { Card } from '../ui/card';
import { Button } from '../ui/button';
import { Upload, AlertCircle } from 'lucide-react';
import { Alert, AlertDescription } from '../ui/alert';
import Papa from 'papaparse';

interface DuplicateReport {
  totalRows: number;
  uniqueVillages: number;
  duplicateCount: number;
  duplicates: { name: string; count: number }[];
}

export function VICCSVDuplicateChecker() {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [checking, setChecking] = useState(false);
  const [report, setReport] = useState<DuplicateReport | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setChecking(true);
    setError(null);
    setReport(null);

    try {
      Papa.parse(file, {
        header: true,
        skipEmptyLines: true,
        encoding: 'UTF-8',
        complete: (results) => {
          try {
            if (!results.data || results.data.length === 0) {
              throw new Error('CSV file is empty');
            }

            console.log(`📄 Checking ${results.data.length} rows for duplicates...`);

            // Find the name column (try common variations)
            const headers = results.meta.fields || [];
            const nameColumn = headers.find(h => {
              const lower = h.toLowerCase().trim();
              return lower.includes('name') || lower === 'village name' || lower === 'village';
            });

            if (!nameColumn) {
              throw new Error(`Cannot find village name column. Available columns: ${headers.join(', ')}`);
            }

            console.log(`✅ Using column: "${nameColumn}"`);

            // Count occurrences of each village name
            const nameCount = new Map<string, number>();
            const rows = results.data as any[];

            for (const row of rows) {
              const villageName = row[nameColumn]?.trim();
              if (villageName) {
                nameCount.set(villageName, (nameCount.get(villageName) || 0) + 1);
              }
            }

            // Find duplicates
            const duplicates: { name: string; count: number }[] = [];
            nameCount.forEach((count, name) => {
              if (count > 1) {
                duplicates.push({ name, count });
              }
            });

            // Sort by count (most duplicates first)
            duplicates.sort((a, b) => b.count - a.count);

            const totalDuplicates = duplicates.reduce((sum, d) => sum + (d.count - 1), 0);

            setReport({
              totalRows: rows.length,
              uniqueVillages: nameCount.size,
              duplicateCount: totalDuplicates,
              duplicates
            });

            console.log(`\n🔍 DUPLICATE REPORT:`);
            console.log(`   📊 Total rows: ${rows.length}`);
            console.log(`   ✅ Unique villages: ${nameCount.size}`);
            console.log(`   ⚠️  Duplicate entries: ${totalDuplicates}`);
            
            if (duplicates.length > 0) {
              console.log(`\n   🚨 Duplicates found:`);
              duplicates.slice(0, 20).forEach(d => {
                console.log(`      • ${d.name}: appears ${d.count} times`);
              });
            }

          } catch (err) {
            console.error('CSV Check Error:', err);
            setError(err instanceof Error ? err.message : 'Failed to check CSV');
          } finally {
            setChecking(false);
          }
        },
        error: (error) => {
          console.error('PapaParse Error:', error);
          setError(`Failed to parse CSV: ${error.message}`);
          setChecking(false);
        }
      });
    } catch (err) {
      console.error('File Upload Error:', err);
      setError(err instanceof Error ? err.message : 'Failed to read file');
      setChecking(false);
    }
  };

  return (
    <Card className="p-6 bg-gradient-to-r from-orange-50 to-red-50 border-2 border-orange-400">
      <h2 className="text-2xl font-bold mb-2 text-orange-900 flex items-center gap-2">
        <AlertCircle className="size-6" />
        🔍 VIC CSV Duplicate Checker
      </h2>
      <p className="text-sm text-orange-700 mb-4">
        Check if your CSV has duplicate village names (which would cause "Already exists" errors)
      </p>

      <div className="space-y-4">
        <div>
          <input
            ref={fileInputRef}
            type="file"
            accept=".csv"
            onChange={handleFileUpload}
            className="hidden"
          />
          <Button
            onClick={() => fileInputRef.current?.click()}
            disabled={checking}
            className="bg-orange-600 hover:bg-orange-700"
          >
            <Upload className="size-4 mr-2" />
            {checking ? 'Checking CSV...' : 'Upload CSV to Check'}
          </Button>
        </div>

        {error && (
          <Alert variant="destructive">
            <AlertCircle className="size-4" />
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        {report && (
          <Alert className={report.duplicateCount > 0 ? 'bg-red-50 border-red-400' : 'bg-green-50 border-green-400'}>
            <AlertDescription>
              <div className="space-y-3">
                <h3 className="font-bold text-lg">
                  {report.duplicateCount > 0 ? '🚨 DUPLICATES FOUND!' : '✅ No Duplicates!'}
                </h3>

                <div className="grid grid-cols-3 gap-2 text-sm">
                  <div className="p-2 bg-white rounded">
                    <strong>Total Rows:</strong> {report.totalRows}
                  </div>
                  <div className="p-2 bg-white rounded">
                    <strong>Unique Villages:</strong> {report.uniqueVillages}
                  </div>
                  <div className={`p-2 rounded ${report.duplicateCount > 0 ? 'bg-red-100 text-red-900' : 'bg-green-100 text-green-900'}`}>
                    <strong>Duplicates:</strong> {report.duplicateCount}
                  </div>
                </div>

                {report.duplicateCount > 0 && (
                  <div className="mt-4">
                    <h4 className="font-semibold mb-2">🔍 Duplicate Villages:</h4>
                    <div className="max-h-64 overflow-y-auto space-y-1">
                      {report.duplicates.map((dup, i) => (
                        <div key={i} className="text-sm p-2 bg-white rounded flex items-center justify-between">
                          <span><strong>{dup.name}</strong></span>
                          <span className="text-red-600 font-semibold">
                            appears {dup.count} times
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {report.duplicateCount > 0 && (
                  <Alert className="mt-4 bg-yellow-50 border-yellow-400">
                    <AlertCircle className="size-4" />
                    <AlertDescription>
                      <strong>⚠️ This explains your "Already exists" errors!</strong>
                      <div className="mt-2 text-sm">
                        <p>Your CSV has {report.duplicateCount} duplicate entries.</p>
                        <p className="mt-1">When the importer processes the CSV:</p>
                        <ol className="list-decimal ml-5 mt-1 space-y-1">
                          <li>It imports the FIRST occurrence → Success ✅</li>
                          <li>It finds the SECOND occurrence → Already exists ⏭️</li>
                        </ol>
                        <p className="mt-2 font-semibold">
                          📝 Solution: Remove duplicates from your CSV before importing!
                        </p>
                      </div>
                    </AlertDescription>
                  </Alert>
                )}
              </div>
            </AlertDescription>
          </Alert>
        )}
      </div>
    </Card>
  );
}
