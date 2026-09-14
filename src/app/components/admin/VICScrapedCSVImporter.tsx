import { useState } from 'react';
import { Button } from '../ui/button';
import { Card, CardHeader, CardTitle, CardContent } from '../ui/card';
import { Upload, Loader2, CheckCircle, XCircle } from 'lucide-react';
import { projectId, publicAnonKey } from '../../utils/supabase/info';

export function VICScrapedCSVImporter() {
  const [importing, setImporting] = useState(false);
  const [error, setError] = useState('');
  const [result, setResult] = useState<any>(null);

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setImporting(true);
    setError('');
    setResult(null);

    try {
      // Read the CSV file
      const text = await file.text();
      const lines = text.split('\n').filter(line => line.trim());
      
      console.log(`📄 Read ${lines.length} lines from CSV`);

      // Skip header row
      const dataLines = lines.slice(1);
      
      // Parse CSV (handle quoted fields)
      const parseCSVLine = (line: string): string[] => {
        const result: string[] = [];
        let current = '';
        let inQuotes = false;
        
        for (let i = 0; i < line.length; i++) {
          const char = line[i];
          
          if (char === '"') {
            inQuotes = !inQuotes;
          } else if (char === ',' && !inQuotes) {
            result.push(current.trim());
            current = '';
          } else {
            current += char;
          }
        }
        result.push(current.trim());
        return result;
      };

      // Parse all villages
      const villages = dataLines.map(line => {
        const [name, suburb, postcode, operator, hasAberlea] = parseCSVLine(line);
        return {
          name: name.replace(/^"|"$/g, ''), // Remove quotes
          suburb: suburb.replace(/^"|"$/g, ''),
          postcode: postcode.replace(/^"|"$/g, ''),
          operator: operator.replace(/^"|"$/g, ''),
          hasAberlea: hasAberlea?.includes('YES') || false
        };
      });

      console.log(`📦 Parsed ${villages.length} villages from CSV`);

      // Filter out NULL operators, empty operators, and Aberlea
      const validVillages = villages.filter(v => {
        const hasName = v.name && v.name.trim().length > 0;
        const hasOperator = v.operator && v.operator.trim().length > 0;
        const notNull = v.operator && v.operator.toUpperCase() !== 'NULL';
        const notAberlea = !v.hasAberlea && !v.operator.toLowerCase().includes('aberlea');
        
        return hasName && hasOperator && notNull && notAberlea;
      });
      
      console.log(`✅ ${validVillages.length} villages have valid operators (excluding NULL and Aberlea)`);
      console.log(`❌ Filtered out ${villages.length - validVillages.length} invalid entries`);

      if (validVillages.length === 0) {
        throw new Error('No valid operators found in CSV!');
      }

      // Show confirmation
      const confirmMsg = `Found ${validVillages.length} villages with valid operators in CSV.\n\nThis will update these villages in the database.\n\nContinue?`;
      
      if (!confirm(confirmMsg)) {
        setImporting(false);
        return;
      }

      // Prepare merge data
      const mergeData = validVillages.map(v => ({
        name: v.name,
        operator: v.operator,
        suburb: v.suburb,
        postcode: v.postcode
      }));

      // Send to backend
      const response = await fetch(
        `https://${projectId}.supabase.co/functions/v1/make-server-3bba8be8/admin/merge-scraped-operators`,
        {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${publicAnonKey}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ operators: mergeData }),
        }
      );

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || `HTTP ${response.status}`);
      }

      const resultData = await response.json();
      console.log('✅ Import complete:', resultData);
      
      setResult(resultData);

    } catch (err: any) {
      setError(err.message);
      console.error('❌ Import error:', err);
    } finally {
      setImporting(false);
      // Reset file input
      event.target.value = '';
    }
  };

  return (
    <Card className="border-2 border-green-400">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Upload className="size-6 text-green-600" />
          Import 78 Operators from CSV
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="bg-green-50 border-2 border-green-200 rounded-lg p-4">
          <p className="text-sm text-green-900 font-semibold mb-2">
            📁 What this does:
          </p>
          <ul className="text-sm text-green-800 space-y-1 list-disc list-inside">
            <li>Upload the CSV you exported from the scraper</li>
            <li>Automatically filters out NULL and Aberlea operators</li>
            <li>Matches villages by name and updates their operators</li>
            <li>Shows you exactly what got updated</li>
          </ul>
          <p className="text-xs text-green-700 mt-3">
            💡 Expected format: Village Name, Suburb, Postcode, Operator, Has Aberlea?
          </p>
        </div>

        <div className="border-2 border-dashed border-green-300 rounded-lg p-6 text-center">
          <input
            type="file"
            accept=".csv"
            onChange={handleFileUpload}
            disabled={importing}
            className="hidden"
            id="csv-upload"
          />
          <label
            htmlFor="csv-upload"
            className={`cursor-pointer inline-flex items-center gap-2 px-4 py-2 rounded-lg ${
              importing 
                ? 'bg-gray-300 cursor-not-allowed' 
                : 'bg-green-600 hover:bg-green-700 text-white'
            }`}
          >
            {importing ? (
              <>
                <Loader2 className="size-4 animate-spin" />
                Importing...
              </>
            ) : (
              <>
                <Upload className="size-4" />
                Choose CSV File
              </>
            )}
          </label>
          <p className="text-xs text-gray-500 mt-2">
            Click to select your exported CSV file
          </p>
        </div>

        {error && (
          <div className="bg-red-50 border border-red-200 rounded p-3">
            <p className="text-red-900 font-semibold">❌ Error:</p>
            <p className="text-sm text-red-800 mt-1">{error}</p>
          </div>
        )}

        {result && (
          <div className="bg-white border-2 border-green-400 rounded-lg p-4 space-y-3">
            <div className="flex items-center gap-2 text-green-700 font-bold text-lg">
              <CheckCircle className="size-6" />
              Import Complete!
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="text-center p-3 bg-blue-50 rounded border">
                <div className="text-2xl font-bold text-blue-700">{result.received || 0}</div>
                <div className="text-xs text-blue-600">Received from CSV</div>
              </div>

              <div className="text-center p-3 bg-green-50 rounded border">
                <div className="text-2xl font-bold text-green-700">{result.valid || 0}</div>
                <div className="text-xs text-green-600">Valid Operators</div>
              </div>

              <div className="text-center p-3 bg-purple-50 rounded border">
                <div className="text-2xl font-bold text-purple-700">{result.updated || 0}</div>
                <div className="text-xs text-purple-600">Successfully Updated ✅</div>
              </div>

              <div className="text-center p-3 bg-orange-50 rounded border">
                <div className="text-2xl font-bold text-orange-700">{result.notFound || 0}</div>
                <div className="text-xs text-orange-600">Not Found in DB</div>
              </div>
            </div>

            {result.skipped > 0 && (
              <div className="bg-yellow-50 border border-yellow-300 rounded p-3">
                <p className="text-sm text-yellow-900">
                  ⚠️ <strong>{result.skipped}</strong> villages were skipped (no changes needed or invalid data)
                </p>
              </div>
            )}

            {result.notFound > 0 && result.notFoundVillages?.length > 0 && (
              <div className="bg-red-50 border border-red-300 rounded p-3">
                <p className="text-sm text-red-900 font-semibold mb-2">
                  ❌ Villages not found in database:
                </p>
                <div className="max-h-32 overflow-y-auto text-xs text-red-800 space-y-1">
                  {result.notFoundVillages.map((name: string, i: number) => (
                    <div key={i}>• {name}</div>
                  ))}
                </div>
              </div>
            )}

            {result.updated > 0 && (
              <div className="bg-green-100 border border-green-300 rounded p-3">
                <p className="text-sm text-green-900 font-semibold">
                  ✅ Successfully updated {result.updated} villages with operators!
                </p>
                <p className="text-xs text-green-700 mt-2">
                  Your database now has 78 more villages with valid operators.
                </p>
              </div>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
}