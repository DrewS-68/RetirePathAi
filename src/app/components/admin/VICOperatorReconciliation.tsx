import { useState } from 'react';
import { Button } from '../ui/button';
import { Card, CardHeader, CardTitle, CardContent } from '../ui/card';
import { Upload, Download, X } from 'lucide-react';

export function VICOperatorReconciliation() {
  const [file402, setFile402] = useState<File | null>(null);
  const [file87, setFile87] = useState<File | null>(null);
  const [result, setResult] = useState<string>('');
  const [stats, setStats] = useState<string>('');
  const [debugInfo, setDebugInfo] = useState<string>('');

  const handleClear = () => {
    setFile402(null);
    setFile87(null);
    setResult('');
    setStats('');
    setDebugInfo('');
  };

  const parseCSV = (text: string) => {
    const lines = text.trim().split('\n');
    const headers = lines[0].split(',').map(h => h.trim());
    const rows: any[] = [];

    for (let i = 1; i < lines.length; i++) {
      const line = lines[i].trim();
      if (!line) continue;
      
      const values = line.split(',').map(v => v.trim());
      const row: any = {};
      
      headers.forEach((header, idx) => {
        row[header] = values[idx] || '';
      });
      
      rows.push(row);
    }

    return { headers, rows };
  };

  const handleMerge = async () => {
    if (!file402 || !file87) return;

    try {
      // Parse both CSVs
      const text402 = await file402.text();
      const text87 = await file87.text();
      
      const csv402 = parseCSV(text402);
      const csv87 = parseCSV(text87);

      console.log('=== CSV PARSING DEBUG ===');
      console.log('402 headers:', csv402.headers);
      console.log('402 row count:', csv402.rows.length);
      console.log('402 first 3 rows:', csv402.rows.slice(0, 3));
      console.log('87 headers:', csv87.headers);
      console.log('87 row count:', csv87.rows.length);
      console.log('87 first 3 rows:', csv87.rows.slice(0, 3));

      // Use the 402 structure (with ID column)
      const outputHeaders = csv402.headers;
      
      // Store existing villages by name
      const existing = new Map<string, any>();
      const existingNames = new Set<string>();
      
      csv402.rows.forEach(row => {
        const name = row.Name?.toLowerCase().trim();
        if (name) {
          existing.set(name, row);
          existingNames.add(name);
        }
      });

      console.log('Existing names count:', existingNames.size);
      console.log('First 5 existing names:', Array.from(existingNames).slice(0, 5));

      // Debug: check 87 names against existing
      const duplicateNames: string[] = [];
      const newNames: string[] = [];

      csv87.rows.forEach(row => {
        const name = row.Name?.toLowerCase().trim();
        console.log('Processing 87 row:', row, 'Name:', name);
        if (name) {
          if (existingNames.has(name)) {
            duplicateNames.push(row.Name);
          } else {
            newNames.push(row.Name);
          }
        }
      });

      console.log('New names:', newNames.length, newNames.slice(0, 5));
      console.log('Duplicate names:', duplicateNames.length, duplicateNames.slice(0, 5));

      // Add new villages from 87 CSV
      let addedCount = 0;
      let duplicateCount = 0;
      let nextId = 1;

      // Find highest existing ID if present
      if (outputHeaders.includes('ID')) {
        csv402.rows.forEach(row => {
          const id = row.ID || '';
          const match = id.match(/^[a-f0-9]+/);
          if (match) {
            nextId = Math.max(nextId, parseInt(match[0], 16) + 1);
          }
        });
      }

      csv87.rows.forEach(row => {
        const name = row.Name?.toLowerCase().trim();
        
        if (name && !existing.has(name)) {
          // Create new row with ID if needed
          const newRow: any = {};
          
          outputHeaders.forEach(header => {
            if (header === 'ID') {
              // Generate new ID in same format
              newRow.ID = `${nextId.toString(16).padStart(7, '0')}-`;
              nextId++;
            } else if (row[header] !== undefined) {
              newRow[header] = row[header];
            } else {
              newRow[header] = '';
            }
          });
          
          existing.set(name, newRow);
          addedCount++;
        } else {
          duplicateCount++;
        }
      });

      // Build output CSV
      const outputRows = Array.from(existing.values());
      const csvLines = [
        outputHeaders.join(','),
        ...outputRows.map(row => 
          outputHeaders.map(h => row[h] || '').join(',')
        )
      ];
      
      const mergedCSV = csvLines.join('\n');

      setStats(`✅ Merged Successfully!\n\nOriginal 402: ${csv402.rows.length} villages\nAdded from 87: ${addedCount} new villages\nSkipped duplicates: ${duplicateCount}\nTotal merged: ${outputRows.length} villages`);
      
      // Debug info
      const debug = `🔍 DEBUG INFO:\n\n` +
        `402 CSV: ${csv402.rows.length} rows, ${existingNames.size} valid names\n` +
        `87 CSV: ${csv87.rows.length} rows\n\n` +
        `New villages (${newNames.length}):\n${newNames.slice(0, 10).join('\n')}${newNames.length > 10 ? '\n...' : ''}\n\n` +
        `Duplicates (${duplicateNames.length}):\n${duplicateNames.slice(0, 10).join('\n')}${duplicateNames.length > 10 ? '\n...' : ''}\n\n` +
        `⚠️ Check browser console (F12) for detailed parsing logs`;
      
      setDebugInfo(debug);
      setResult(mergedCSV);
    } catch (err: any) {
      setStats(`❌ Error: ${err.message}`);
      console.error(err);
    }
  };

  const handleDownload = () => {
    const blob = new Blob([result], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'merged-operators.csv';
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <Card className="border-2 border-cyan-400">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Upload className="size-6 text-cyan-600" />
          Merge 402 + 87 CSVs (Smart Column Mapping)
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <p className="text-sm text-gray-700">
          Upload both CSVs - automatically handles different column structures and generates IDs for new entries.
        </p>

        <div className="space-y-2">
          <label className="text-sm font-semibold block">
            402 CSV (Base list with IDs):
          </label>
          <input
            type="file"
            accept=".csv"
            onChange={(e) => setFile402(e.target.files?.[0] || null)}
            className="w-full text-sm"
          />
          {file402 && <p className="text-xs text-green-600">✓ {file402.name}</p>}
        </div>

        <div className="space-y-2">
          <label className="text-sm font-semibold block">
            87 CSV (To add - IDs will be auto-generated):
          </label>
          <input
            type="file"
            accept=".csv"
            onChange={(e) => setFile87(e.target.files?.[0] || null)}
            className="w-full text-sm"
          />
          {file87 && <p className="text-xs text-green-600">✓ {file87.name}</p>}
        </div>

        <Button
          onClick={handleMerge}
          disabled={!file402 || !file87}
          className="w-full bg-cyan-600 hover:bg-cyan-700"
        >
          Merge CSVs (Smart Column Mapping)
        </Button>

        {stats && (
          <div className="bg-blue-50 border border-blue-300 rounded p-3">
            <pre className="text-sm whitespace-pre-wrap">{stats}</pre>
          </div>
        )}

        {debugInfo && (
          <div className="bg-yellow-50 border border-yellow-300 rounded p-3">
            <pre className="text-xs whitespace-pre-wrap max-h-60 overflow-y-auto">{debugInfo}</pre>
          </div>
        )}

        {result && (
          <div className="space-y-2">
            <div className="bg-green-50 border border-green-300 rounded p-3">
              <p className="text-xs text-gray-600 mb-2">Preview (first 500 chars):</p>
              <pre className="text-xs whitespace-pre-wrap">
                {result.substring(0, 500)}...
              </pre>
            </div>
            <Button
              onClick={handleDownload}
              className="w-full bg-green-600 hover:bg-green-700"
            >
              <Download className="mr-2 size-4" />
              Download Merged CSV ({result.split('\n').length - 1} villages)
            </Button>
          </div>
        )}

        <Button
          onClick={handleClear}
          className="w-full bg-red-600 hover:bg-red-700"
        >
          <X className="mr-2 size-4" />
          Clear & Start Over
        </Button>
      </CardContent>
    </Card>
  );
}