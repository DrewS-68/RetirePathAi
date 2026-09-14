import React, { useState } from 'react';
import { Card } from '../ui/card';
import { Button } from '../ui/button';
import { Alert, AlertDescription } from '../ui/alert';
import { Upload, CheckCircle, XCircle, AlertTriangle, Download } from 'lucide-react';
import { getSupabaseClient } from '../../utils/supabase/client';

interface ImportResult {
  villageName: string;
  operator: string;
  status: 'success' | 'failed' | 'not_found';
  error?: string;
}

export function VICOperatorCSVImporter() {
  const [importing, setImporting] = useState(false);
  const [results, setResults] = useState<ImportResult[]>([]);
  const [stats, setStats] = useState({ total: 0, success: 0, failed: 0, notFound: 0 });

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setImporting(true);
    setResults([]);

    try {
      const text = await file.text();
      const lines = text.split('\n').filter(line => line.trim());
      const headers = lines[0].split(',').map(h => h.trim().replace(/"/g, ''));
      
      // Find column indices
      const nameIndex = headers.findIndex(h => h.toLowerCase() === 'name' || h.toLowerCase() === 'village name');
      const operatorIndex = headers.findIndex(h => h.toLowerCase() === 'operator');

      if (nameIndex === -1 || operatorIndex === -1) {
        alert('CSV must have "Name" and "Operator" columns');
        setImporting(false);
        return;
      }

      const importResults: ImportResult[] = [];
      const supabase = getSupabaseClient();

      // Process each row (skip header)
      for (let i = 1; i < lines.length; i++) {
        const line = lines[i].trim();
        if (!line) continue;

        // Parse CSV row (handle quoted values)
        const values = line.match(/(".*?"|[^,]+)(?=\s*,|\s*$)/g)?.map(v => v.trim().replace(/^"|"$/g, '')) || [];
        
        const villageName = values[nameIndex]?.trim();
        const operator = values[operatorIndex]?.trim();

        if (!villageName || !operator) {
          continue;
        }

        try {
          // Find village by name (case-insensitive, exact match first, then fuzzy)
          const { data: villages, error: searchError } = await supabase
            .from('retirement_villages')
            .select('id, name, operator')
            .eq('state', 'VIC')
            .ilike('name', villageName);

          if (searchError) throw searchError;

          if (!villages || villages.length === 0) {
            // Try fuzzy match
            const { data: fuzzyVillages, error: fuzzyError } = await supabase
              .from('retirement_villages')
              .select('id, name, operator')
              .eq('state', 'VIC')
              .ilike('name', `%${villageName}%`);

            if (fuzzyError) throw fuzzyError;

            if (!fuzzyVillages || fuzzyVillages.length === 0) {
              importResults.push({
                villageName,
                operator,
                status: 'not_found',
                error: 'Village not found in database',
              });
              continue;
            }

            // Use first fuzzy match
            const village = fuzzyVillages[0];
            const { error: updateError } = await supabase
              .from('retirement_villages')
              .update({ operator })
              .eq('id', village.id);

            if (updateError) throw updateError;

            importResults.push({
              villageName: `${villageName} (matched: ${village.name})`,
              operator,
              status: 'success',
            });
          } else {
            // Exact match found
            const village = villages[0];
            const { error: updateError } = await supabase
              .from('retirement_villages')
              .update({ operator })
              .eq('id', village.id);

            if (updateError) throw updateError;

            importResults.push({
              villageName,
              operator,
              status: 'success',
            });
          }
        } catch (err) {
          console.error(`Error importing ${villageName}:`, err);
          importResults.push({
            villageName,
            operator,
            status: 'failed',
            error: err instanceof Error ? err.message : 'Unknown error',
          });
        }
      }

      // Calculate stats
      const success = importResults.filter(r => r.status === 'success').length;
      const failed = importResults.filter(r => r.status === 'failed').length;
      const notFound = importResults.filter(r => r.status === 'not_found').length;

      setStats({
        total: importResults.length,
        success,
        failed,
        notFound,
      });
      setResults(importResults);

    } catch (err) {
      console.error('Import error:', err);
      alert(`Error: ${err instanceof Error ? err.message : 'Failed to import CSV'}`);
    } finally {
      setImporting(false);
    }
  };

  const downloadResults = () => {
    const csv = [
      ['Village Name', 'Operator', 'Status', 'Error'],
      ...results.map(r => [
        r.villageName,
        r.operator,
        r.status.toUpperCase(),
        r.error || '',
      ]),
    ].map(row => row.map(cell => `"${cell}"`).join(',')).join('\n');

    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `vic-operator-import-results-${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <Card className="p-6 bg-green-50 border-2 border-green-400">
      <div className="mb-4">
        <h2 className="text-2xl font-bold text-green-900 flex items-center gap-2">
          📤 Import Operators from YOUR CSV
        </h2>
        <p className="text-sm text-green-700 mt-1">
          Upload your CSV with "Name" and "Operator" columns to update the database directly
        </p>
      </div>

      <Alert className="mb-4 bg-blue-50 border-blue-400">
        <AlertTriangle className="size-4" />
        <AlertDescription>
          <strong>CSV Format Required:</strong>
          <br />
          • Must have columns: <code className="bg-white px-1">Name</code> and <code className="bg-white px-1">Operator</code>
          <br />
          • Will match villages by name (fuzzy matching enabled)
          <br />
          • Only updates VIC villages
          <br />
          • <strong>This will IMMEDIATELY update the database - no scraping needed!</strong>
        </AlertDescription>
      </Alert>

      <div className="mb-4">
        <input
          type="file"
          accept=".csv"
          onChange={handleFileUpload}
          disabled={importing}
          className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-semibold file:bg-green-600 file:text-white hover:file:bg-green-700 disabled:opacity-50"
        />
      </div>

      {importing && (
        <Alert className="mb-4 bg-yellow-50 border-yellow-400">
          <AlertDescription>
            <strong>Importing...</strong> Please wait while we update the database.
          </AlertDescription>
        </Alert>
      )}

      {results.length > 0 && (
        <div className="space-y-4">
          {/* Stats */}
          <div className="grid grid-cols-4 gap-4">
            <Card className="p-4 bg-gray-50">
              <div className="text-2xl font-bold">{stats.total}</div>
              <div className="text-sm text-gray-600">Total Rows</div>
            </Card>
            <Card className="p-4 bg-green-100">
              <div className="text-2xl font-bold text-green-700">{stats.success}</div>
              <div className="text-sm text-green-600">✓ Imported</div>
            </Card>
            <Card className="p-4 bg-red-100">
              <div className="text-2xl font-bold text-red-700">{stats.failed}</div>
              <div className="text-sm text-red-600">✗ Failed</div>
            </Card>
            <Card className="p-4 bg-yellow-100">
              <div className="text-2xl font-bold text-yellow-700">{stats.notFound}</div>
              <div className="text-sm text-yellow-600">⚠ Not Found</div>
            </Card>
          </div>

          <Alert className={stats.success > 0 ? 'bg-green-50 border-green-400' : 'bg-red-50 border-red-400'}>
            <AlertDescription>
              {stats.success > 0 ? (
                <>
                  <strong className="text-green-700">✅ SUCCESS!</strong>
                  <p className="mt-1">{stats.success} operators imported successfully!</p>
                  {stats.notFound > 0 && (
                    <p className="mt-1 text-yellow-700">⚠ {stats.notFound} villages not found in database (check spelling)</p>
                  )}
                </>
              ) : (
                <>
                  <strong className="text-red-700">❌ Import failed</strong>
                  <p className="mt-1">No operators were imported. Check the results below.</p>
                </>
              )}
            </AlertDescription>
          </Alert>

          <Button onClick={downloadResults} className="bg-blue-600 hover:bg-blue-700">
            <Download className="size-4 mr-2" />
            Download Import Results (CSV)
          </Button>

          {/* Results Table */}
          <div className="border rounded-lg overflow-hidden">
            <div className="max-h-[400px] overflow-y-auto">
              <table className="w-full text-sm">
                <thead className="bg-gray-100 sticky top-0">
                  <tr>
                    <th className="text-left px-3 py-2">Status</th>
                    <th className="text-left px-3 py-2">Village Name</th>
                    <th className="text-left px-3 py-2">Operator</th>
                    <th className="text-left px-3 py-2">Notes</th>
                  </tr>
                </thead>
                <tbody className="divide-y">
                  {results.map((result, idx) => (
                    <tr key={idx} className="hover:bg-gray-50">
                      <td className="px-3 py-2">
                        {result.status === 'success' && (
                          <CheckCircle className="size-4 text-green-600" />
                        )}
                        {result.status === 'failed' && (
                          <XCircle className="size-4 text-red-600" />
                        )}
                        {result.status === 'not_found' && (
                          <AlertTriangle className="size-4 text-yellow-600" />
                        )}
                      </td>
                      <td className="px-3 py-2 font-medium">{result.villageName}</td>
                      <td className="px-3 py-2 text-green-700 font-semibold">{result.operator}</td>
                      <td className="px-3 py-2 text-xs text-red-600">{result.error || '—'}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}
    </Card>
  );
}
