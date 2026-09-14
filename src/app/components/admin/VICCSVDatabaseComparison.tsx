import { useState } from 'react';
import { Button } from '../ui/button';
import { Card, CardHeader, CardTitle, CardContent } from '../ui/card';
import { Search, Loader2 } from 'lucide-react';
import { projectId, publicAnonKey } from '../../utils/supabase/info';

interface VillageDetail {
  name: string;
  operator: string | null;
  csvOperator: string;
  match: boolean;
}

export function VICCSVDatabaseComparison() {
  const [csvFile, setCsvFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);
  const [comparison, setComparison] = useState<VillageDetail[]>([]);
  const [stats, setStats] = useState<any>(null);
  const [error, setError] = useState('');

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setCsvFile(file);
      setError('');
      setComparison([]);
      setStats(null);
    }
  };

  const compareWithDatabase = async () => {
    if (!csvFile) return;

    setLoading(true);
    setError('');
    setComparison([]);
    setStats(null);

    const reader = new FileReader();
    reader.onload = async (event) => {
      try {
        const text = event.target?.result as string;
        const lines = text.trim().split('\n');
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

        if (nameIndex === -1) {
          throw new Error(`CSV must have a name column. Found columns: ${headers.join(', ')}`);
        }
        
        if (operatorIndex === -1) {
          throw new Error(`CSV must have an operator column. Found columns: ${headers.join(', ')}`);
        }

        const csvVillages: { name: string; operator: string }[] = [];
        
        for (let i = 1; i < lines.length; i++) {
          const line = lines[i].trim();
          if (!line) continue;

          const values = line.split(',').map(v => v.trim());
          const name = values[nameIndex];
          const operator = values[operatorIndex];

          if (name && operator) {
            csvVillages.push({ name, operator });
          }
        }

        console.log(`📄 Parsed ${csvVillages.length} villages from CSV`);

        // Fetch database data for these villages
        const response = await fetch(
          `https://${projectId}.supabase.co/functions/v1/make-server-3bba8be8/admin/vic-compare-csv`,
          {
            method: 'POST',
            headers: {
              'Authorization': `Bearer ${publicAnonKey}`,
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({ villages: csvVillages }),
          }
        );

        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.error || 'Failed to compare with database');
        }

        const data = await response.json();
        
        setComparison(data.comparison);
        setStats(data.stats);
        console.log('✅ Comparison complete:', data.stats);

      } catch (err: any) {
        console.error('❌ Error:', err);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };
    
    reader.onerror = () => {
      setError('Failed to read CSV file');
      setLoading(false);
    };

    reader.readAsText(csvFile);
  };

  return (
    <Card className="border-2 border-purple-400">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Search className="size-6 text-purple-600" />
          CSV vs Database Comparison
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="bg-purple-50 border-2 border-purple-200 rounded-lg p-4">
          <p className="text-sm text-purple-900 font-semibold mb-2">
            🔍 What this does:
          </p>
          <ul className="text-sm text-purple-800 space-y-1 list-disc list-inside">
            <li>Upload your CSV with operators</li>
            <li>Compare each village's CSV operator vs database operator</li>
            <li>See which villages already have operators (and what they are)</li>
            <li>Identify mismatches between CSV and database</li>
          </ul>
        </div>

        <div className="border-2 border-dashed border-purple-300 rounded-lg p-6 bg-purple-50/50">
          <label htmlFor="csv-compare-upload" className="cursor-pointer block text-center">
            <Search className="mx-auto size-12 text-purple-400 mb-2" />
            <p className="text-sm text-purple-900 font-medium mb-1">
              Click to upload CSV file
            </p>
            <p className="text-xs text-purple-700">
              {csvFile ? `Selected: ${csvFile.name}` : 'No file selected'}
            </p>
            <input
              id="csv-compare-upload"
              type="file"
              accept=".csv"
              onChange={handleFileSelect}
              className="hidden"
            />
          </label>
        </div>

        {csvFile && (
          <Button
            onClick={compareWithDatabase}
            disabled={loading}
            className="w-full bg-purple-600 hover:bg-purple-700"
            size="lg"
          >
            {loading ? (
              <>
                <Loader2 className="mr-2 size-4 animate-spin" />
                Comparing with Database...
              </>
            ) : (
              <>
                <Search className="mr-2 size-4" />
                Compare with Database
              </>
            )}
          </Button>
        )}

        {error && (
          <div className="bg-red-50 border border-red-200 rounded p-3">
            <p className="text-sm text-red-800">
              <strong>Error:</strong> {error}
            </p>
          </div>
        )}

        {stats && (
          <div className="space-y-3">
            <div className="grid grid-cols-3 gap-3">
              <div className="text-center p-3 bg-blue-50 rounded border border-blue-200">
                <div className="text-2xl font-bold text-blue-700">{stats.total}</div>
                <div className="text-xs text-blue-600">Total</div>
              </div>

              <div className="text-center p-3 bg-green-50 rounded border border-green-200">
                <div className="text-2xl font-bold text-green-700">{stats.matching}</div>
                <div className="text-xs text-green-600">Matching</div>
              </div>

              <div className="text-center p-3 bg-orange-50 rounded border border-orange-200">
                <div className="text-2xl font-bold text-orange-700">{stats.different}</div>
                <div className="text-xs text-orange-600">Different</div>
              </div>

              <div className="text-center p-3 bg-red-50 rounded border border-red-200">
                <div className="text-2xl font-bold text-red-700">{stats.nullInDb}</div>
                <div className="text-xs text-red-600">NULL in DB</div>
              </div>

              <div className="text-center p-3 bg-purple-50 rounded border border-purple-200">
                <div className="text-2xl font-bold text-purple-700">{stats.aberleaInDb}</div>
                <div className="text-xs text-purple-600">Aberlea in DB</div>
              </div>

              <div className="text-center p-3 bg-yellow-50 rounded border border-yellow-200">
                <div className="text-2xl font-bold text-yellow-700">{stats.shouldUpdate}</div>
                <div className="text-xs text-yellow-600">Should Update</div>
              </div>
            </div>

            {comparison.length > 0 && (
              <div className="bg-white border border-purple-300 rounded-lg overflow-hidden">
                <div className="max-h-96 overflow-y-auto">
                  <table className="w-full text-xs">
                    <thead className="bg-purple-100 sticky top-0">
                      <tr>
                        <th className="p-2 text-left font-semibold">Village Name</th>
                        <th className="p-2 text-left font-semibold">CSV Operator</th>
                        <th className="p-2 text-left font-semibold">DB Operator</th>
                        <th className="p-2 text-center font-semibold">Status</th>
                      </tr>
                    </thead>
                    <tbody>
                      {comparison.map((village, i) => (
                        <tr key={i} className={i % 2 === 0 ? 'bg-gray-50' : 'bg-white'}>
                          <td className="p-2 border-t">{village.name}</td>
                          <td className="p-2 border-t text-green-700 font-medium">{village.csvOperator}</td>
                          <td className="p-2 border-t">
                            {village.operator === null ? (
                              <span className="text-red-600 font-semibold">NULL</span>
                            ) : village.operator?.toLowerCase().includes('aberlea') ? (
                              <span className="text-orange-600 font-semibold">{village.operator}</span>
                            ) : (
                              <span className="text-blue-700">{village.operator}</span>
                            )}
                          </td>
                          <td className="p-2 border-t text-center">
                            {village.match ? (
                              <span className="text-green-600 font-semibold">✓ Match</span>
                            ) : village.operator === null || village.operator?.toLowerCase().includes('aberlea') ? (
                              <span className="text-yellow-600 font-semibold">→ Update</span>
                            ) : (
                              <span className="text-orange-600 font-semibold">⚠ Differ</span>
                            )}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
}