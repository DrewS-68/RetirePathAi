import { useState } from 'react';
import { Button } from '../ui/button';
import { Card, CardHeader, CardTitle, CardContent } from '../ui/card';
import { Upload, Database, AlertCircle, CheckCircle } from 'lucide-react';
import { projectId, publicAnonKey } from '../../utils/supabase/info';

export function VICOperatorCSVBulkImport() {
  const [loading, setLoading] = useState(false);
  const [results, setResults] = useState<string>('');

  const importFromCSV = async () => {
    setLoading(true);
    setResults('🔄 Reading CSV file and importing operators...\n\n');

    try {
      // Read the CSV file
      const csvResponse = await fetch('/imports/village-data.csv');
      const csvText = await csvResponse.text();
      
      // Parse CSV (tab-delimited)
      const lines = csvText.split('\r\n').filter(line => line.trim());
      const headers = lines[0].split('\t');
      
      console.log('📋 Headers:', headers);
      console.log('📊 Total lines:', lines.length);
      
      let imported = 0;
      let skipped = 0;
      let failed = 0;
      const errors: string[] = [];
      
      // Process each line (skip header)
      for (let i = 1; i < lines.length; i++) {
        const values = lines[i].split('\t');
        const villageName = values[0];
        const suburb = values[1];
        const postcode = values[2];
        const matchedOperator = values[4]; // "Matched Operator" column
        const status = values[6]; // Status column
        
        // Skip if no match or operator is "None"
        if (status !== 'MATCHED' || matchedOperator === 'None' || !matchedOperator) {
          skipped++;
          console.log(`⏭️ Skipping ${villageName} - Status: ${status}`);
          continue;
        }
        
        try {
          // Call backend to update operator
          const response = await fetch(
            `https://${projectId}.supabase.co/functions/v1/make-server-3bba8be8/vic-update-operator-by-name`,
            {
              method: 'POST',
              headers: {
                'Authorization': `Bearer ${publicAnonKey}`,
                'Content-Type': 'application/json',
              },
              body: JSON.stringify({
                villageName,
                suburb,
                postcode,
                operator: matchedOperator
              })
            }
          );
          
          if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.error || `HTTP ${response.status}`);
          }
          
          const result = await response.json();
          
          if (result.success) {
            imported++;
            console.log(`✅ Imported: ${villageName} -> ${matchedOperator}`);
          } else {
            failed++;
            errors.push(`${villageName}: ${result.error}`);
          }
          
        } catch (err: any) {
          failed++;
          errors.push(`${villageName}: ${err.message}`);
          console.error(`❌ Failed to import ${villageName}:`, err);
        }
        
        // Show progress every 10 villages
        if (i % 10 === 0) {
          setResults(`🔄 Processing... ${i}/${lines.length - 1}\n\nImported: ${imported}\nSkipped: ${skipped}\nFailed: ${failed}`);
        }
      }
      
      const summary = `✅ IMPORT COMPLETE!\n\n` +
        `📊 Summary:\n` +
        `  ✅ Successfully imported: ${imported}\n` +
        `  ⏭️ Skipped (NO_MATCH): ${skipped}\n` +
        `  ❌ Failed: ${failed}\n\n` +
        (errors.length > 0 ? `❌ Errors:\n${errors.join('\n')}` : '🎉 All imports successful!');
      
      setResults(summary);
      console.log(summary);
      
    } catch (err: any) {
      setResults(`❌ Critical Error: ${err.message}`);
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card className="border-2 border-green-500 bg-green-50">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-green-900">
          <Database className="size-6" />
          🚀 Import Missing Operators (87 Operators)
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="bg-yellow-50 border-2 border-yellow-500 rounded p-4">
          <div className="flex items-start gap-2">
            <AlertCircle className="size-5 text-yellow-600 mt-0.5 flex-shrink-0" />
            <div className="text-sm">
              <p className="font-bold text-yellow-900 mb-2">📊 MISSING OPERATORS DETECTED!</p>
              <p className="text-yellow-800 mb-2">
                <strong>Current Status:</strong> 402 villages WITH operators, 108 villages WITHOUT operators
              </p>
              <p className="text-yellow-800 mb-3">
                <strong>🔍 Discovery:</strong> Your CSV contains 87 MATCHED operators that were never imported into the database!
              </p>
              <p className="text-green-800 bg-green-100 p-2 rounded border border-green-400">
                <strong>✅ Solution:</strong> Import all 87 operators from your CSV now, reducing villages WITHOUT operators from 108 to only ~21!
              </p>
              <p className="text-xs text-gray-600 mt-2">
                This will complete the original import and leave only the truly unmatched villages to scrape.
              </p>
            </div>
          </div>
        </div>

        <Button
          onClick={importFromCSV}
          disabled={loading}
          className="w-full bg-green-600 hover:bg-green-700 text-lg py-6"
        >
          <Upload className="mr-2 size-5" />
          {loading ? '🔄 Importing 87 Operators...' : '🚀 Import All 87 Operators NOW!'}
        </Button>

        {results && (
          <div className="bg-white border-2 border-gray-300 rounded p-4">
            <pre className="text-xs whitespace-pre-wrap font-mono">{results}</pre>
          </div>
        )}

        <div className="bg-blue-50 border border-blue-300 rounded p-3 text-xs text-gray-700">
          <p className="font-semibold mb-1">📋 What this does:</p>
          <ul className="list-disc ml-4 space-y-1">
            <li>Reads <code>/imports/village-data.csv</code></li>
            <li>Imports all villages with <code>Status = MATCHED</code></li>
            <li>Skips villages with <code>Status = NO_MATCH</code></li>
            <li>Updates database with correct operator names</li>
            <li>Shows detailed success/failure report</li>
          </ul>
        </div>
      </CardContent>
    </Card>
  );
}