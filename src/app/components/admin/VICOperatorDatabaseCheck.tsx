import React, { useState } from 'react';
import { Card } from '../ui/card';
import { Button } from '../ui/button';
import { Alert, AlertDescription } from '../ui/alert';
import { Download, Database, AlertTriangle } from 'lucide-react';
import { getSupabaseClient } from '../../utils/supabase/client';

export function VICOperatorDatabaseCheck() {
  const [loading, setLoading] = useState(false);
  const [results, setResults] = useState<any>(null);

  const checkDatabase = async () => {
    setLoading(true);
    try {
      const supabase = getSupabaseClient();
      
      // Get ALL VIC villages with their current operator values
      const { data, error } = await supabase
        .from('retirement_villages')
        .select('id, name, operator, description, suburb, website')
        .eq('state', 'VIC')
        .order('name')
        .limit(1000);

      if (error) throw error;

      // Analyze what we actually have
      const total = data?.length || 0;
      const withOperator = data?.filter(v => v.operator && v.operator.trim() !== '') || [];
      const withoutOperator = data?.filter(v => !v.operator || v.operator.trim() === '') || [];
      
      // Sample data
      const sampleWithOperator = withOperator.slice(0, 10);
      const sampleWithoutOperator = withoutOperator.slice(0, 10);

      setResults({
        total,
        withOperator: withOperator.length,
        withoutOperator: withoutOperator.length,
        sampleWithOperator,
        sampleWithoutOperator,
        allData: data,
      });

      console.log('DATABASE CHECK RESULTS:', {
        total,
        withOperator: withOperator.length,
        withoutOperator: withoutOperator.length,
        samples: {
          withOperator: sampleWithOperator,
          withoutOperator: sampleWithoutOperator,
        },
      });

    } catch (err) {
      console.error('Database check error:', err);
      alert(`Error: ${err instanceof Error ? err.message : 'Failed to check database'}`);
    } finally {
      setLoading(false);
    }
  };

  const downloadFullReport = () => {
    if (!results) return;

    const csv = [
      ['ID', 'Village Name', 'Operator', 'Description', 'Suburb', 'Website'],
      ...results.allData.map((v: any) => [
        v.id,
        v.name,
        v.operator || '[EMPTY]',
        v.description || '',
        v.suburb || '',
        v.website || '',
      ]),
    ].map(row => row.map(cell => `"${cell}"`).join(',')).join('\n');

    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `vic-operator-database-check-${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <Card className="p-6 bg-red-50 border-2 border-red-400">
      <div className="flex justify-between items-start mb-4">
        <div>
          <h2 className="text-2xl font-bold text-red-900 flex items-center gap-2">
            🔍 VIC Operator Database Check
          </h2>
          <p className="text-sm text-red-700 mt-1">
            Direct database query to see ACTUAL current state of operator fields
          </p>
        </div>
      </div>

      <Alert className="mb-4 bg-yellow-50 border-yellow-400">
        <AlertTriangle className="size-4" />
        <AlertDescription>
          <strong>Purpose:</strong> This checks what's ACTUALLY in the database right now.
          <br />If the scraper ran but we see 0 operators, the scraper failed to update the DB.
        </AlertDescription>
      </Alert>

      <Button
        onClick={checkDatabase}
        disabled={loading}
        className="bg-red-600 hover:bg-red-700 mb-4"
      >
        <Database className="size-4 mr-2" />
        {loading ? 'Checking Database...' : 'Check Database Now'}
      </Button>

      {results && (
        <div className="space-y-4">
          {/* Summary */}
          <div className="grid grid-cols-3 gap-4">
            <Card className="p-4 bg-gray-50">
              <div className="text-2xl font-bold">{results.total}</div>
              <div className="text-sm text-gray-600">Total VIC Villages</div>
            </Card>
            <Card className="p-4 bg-green-50">
              <div className="text-2xl font-bold text-green-700">{results.withOperator}</div>
              <div className="text-sm text-green-600">With Operator</div>
            </Card>
            <Card className="p-4 bg-red-50">
              <div className="text-2xl font-bold text-red-700">{results.withoutOperator}</div>
              <div className="text-sm text-red-600">Without Operator (NULL/Empty)</div>
            </Card>
          </div>

          {/* Diagnosis */}
          <Alert className={results.withOperator === 0 ? 'bg-red-50 border-red-400' : 'bg-blue-50 border-blue-400'}>
            <AlertDescription>
              {results.withOperator === 0 ? (
                <div>
                  <strong className="text-red-700">❌ PROBLEM CONFIRMED:</strong>
                  <p className="mt-2">ALL {results.total} VIC villages have NULL/empty operator fields.</p>
                  <p className="mt-1">The scraper either:</p>
                  <ul className="list-disc ml-6 mt-1">
                    <li>Failed to extract operators from websites</li>
                    <li>Had an error updating the database</li>
                    <li>Didn't actually run successfully despite showing "complete"</li>
                  </ul>
                </div>
              ) : (
                <div>
                  <strong className="text-blue-700">✅ PARTIAL SUCCESS:</strong>
                  <p className="mt-2">{results.withOperator} villages have operator data, but {results.withoutOperator} are still missing.</p>
                </div>
              )}
            </AlertDescription>
          </Alert>

          {/* Sample Data */}
          {results.sampleWithOperator.length > 0 && (
            <div>
              <h3 className="text-lg font-bold mb-2">✅ Sample Villages WITH Operators:</h3>
              <div className="border rounded overflow-hidden">
                <table className="w-full text-sm">
                  <thead className="bg-gray-100">
                    <tr>
                      <th className="text-left px-3 py-2">Village Name</th>
                      <th className="text-left px-3 py-2">Operator</th>
                      <th className="text-left px-3 py-2">Suburb</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y">
                    {results.sampleWithOperator.map((v: any) => (
                      <tr key={v.id}>
                        <td className="px-3 py-2">{v.name}</td>
                        <td className="px-3 py-2 font-semibold text-green-700">{v.operator}</td>
                        <td className="px-3 py-2 text-gray-600">{v.suburb}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {results.sampleWithoutOperator.length > 0 && (
            <div>
              <h3 className="text-lg font-bold mb-2">❌ Sample Villages WITHOUT Operators:</h3>
              <div className="border rounded overflow-hidden">
                <table className="w-full text-sm">
                  <thead className="bg-gray-100">
                    <tr>
                      <th className="text-left px-3 py-2">Village Name</th>
                      <th className="text-left px-3 py-2">Operator</th>
                      <th className="text-left px-3 py-2">Suburb</th>
                      <th className="text-left px-3 py-2">Website</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y">
                    {results.sampleWithoutOperator.map((v: any) => (
                      <tr key={v.id}>
                        <td className="px-3 py-2">{v.name}</td>
                        <td className="px-3 py-2 text-red-600 italic">[EMPTY]</td>
                        <td className="px-3 py-2 text-gray-600">{v.suburb}</td>
                        <td className="px-3 py-2 text-xs text-gray-500">
                          {v.website ? (
                            <a href={v.website} target="_blank" rel="noopener" className="text-blue-600 hover:underline">
                              Link
                            </a>
                          ) : (
                            'No URL'
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          <Button
            onClick={downloadFullReport}
            className="bg-green-600 hover:bg-green-700"
          >
            <Download className="size-4 mr-2" />
            Download Full Database Report (CSV)
          </Button>
        </div>
      )}
    </Card>
  );
}