import React, { useState } from 'react';
import { Card } from '../ui/card';
import { Button } from '../ui/button';
import { Upload, Download, AlertCircle, CheckCircle } from 'lucide-react';
import { getSupabaseClient } from '../../utils/supabase/client';
import Papa from 'papaparse';

interface UpdateResult {
  success: number;
  failed: number;
  errors: string[];
}

export function VICOperatorBulkUpdate() {
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<UpdateResult | null>(null);
  const [previewData, setPreviewData] = useState<any[]>([]);

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setLoading(true);
    setResult(null);

    try {
      Papa.parse(file, {
        header: true,
        skipEmptyLines: true,
        complete: async (results) => {
          const data = results.data as any[];
          
          console.log('📄 CSV Upload:', {
            rows: data.length,
            headers: results.meta.fields,
            sample: data[0]
          });

          // Validate required columns
          const firstRow = data[0];
          if (!firstRow.name && !firstRow['Village Name']) {
            alert('❌ CSV must have a "name" or "Village Name" column!');
            setLoading(false);
            return;
          }
          if (!firstRow.operator && !firstRow['Operator']) {
            alert('❌ CSV must have an "operator" or "Operator" column!');
            setLoading(false);
            return;
          }

          // Show preview
          setPreviewData(data.slice(0, 10));

          // Confirm before updating
          const confirm = window.confirm(
            `🔄 UPDATE OPERATORS FOR ${data.length} VILLAGES?\\n\\n` +
            `This will update the operator field for VIC villages based on village name matching.\\n\\n` +
            `Sample: "${data[0].name || data[0]['Village Name']}" → Operator: "${data[0].operator || data[0]['Operator']}"\\n\\n` +
            `Continue?`
          );

          if (!confirm) {
            setLoading(false);
            return;
          }

          // Perform bulk update
          await performBulkUpdate(data);
        },
        error: (error) => {
          alert(`CSV Parse Error: ${error.message}`);
          setLoading(false);
        }
      });
    } catch (err) {
      console.error('Error uploading CSV:', err);
      alert(`Error: ${err instanceof Error ? err.message : 'Failed to upload CSV'}`);
      setLoading(false);
    }
  };

  const performBulkUpdate = async (data: any[]) => {
    const supabase = getSupabaseClient();
    let success = 0;
    let failed = 0;
    const errors: string[] = [];

    for (const row of data) {
      try {
        const villageName = row.name || row['Village Name'];
        const operatorName = row.operator || row['Operator'];

        if (!villageName || !operatorName) {
          failed++;
          errors.push(`Missing name or operator: ${JSON.stringify(row)}`);
          continue;
        }

        // Update by name (case-insensitive match)
        const { data: updated, error } = await supabase
          .from('retirement_villages')
          .update({ operator: operatorName.trim() })
          .eq('state', 'VIC')
          .ilike('name', villageName.trim())
          .select();

        if (error) {
          failed++;
          errors.push(`${villageName}: ${error.message}`);
        } else if (!updated || updated.length === 0) {
          failed++;
          errors.push(`${villageName}: Village not found in database`);
        } else {
          success++;
          console.log(`✅ Updated: ${villageName} → ${operatorName}`);
        }
      } catch (err) {
        failed++;
        errors.push(`${row.name}: ${err instanceof Error ? err.message : 'Unknown error'}`);
      }
    }

    setResult({ success, failed, errors: errors.slice(0, 50) });
    setLoading(false);
  };

  const downloadTemplate = () => {
    const csv = `name,operator\nMountain View Retirement Village,Regis\nSeaview Retirement Village,Lendlease\n`;
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = 'vic_operator_update_template.csv';
    link.click();
    URL.revokeObjectURL(url);
  };

  const exportCurrentData = async () => {
    setLoading(true);
    try {
      const supabase = getSupabaseClient();
      const { data, error } = await supabase
        .from('retirement_villages')
        .select('name, operator, suburb')
        .eq('state', 'VIC')
        .order('name');

      if (error) throw error;

      const csv = [
        'name,operator,suburb',
        ...data.map(v => `"${v.name}","${v.operator || ''}","${v.suburb || ''}"`)
      ].join('\\n');

      const blob = new Blob([csv], { type: 'text/csv' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `vic_current_operators_${new Date().toISOString().split('T')[0]}.csv`;
      link.click();
      URL.revokeObjectURL(url);
    } catch (err) {
      alert(`Error: ${err instanceof Error ? err.message : 'Failed to export'}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card className="p-6 bg-gradient-to-r from-orange-50 to-red-50 border-2 border-orange-300">
      <h2 className="text-2xl font-bold mb-2 text-orange-900">🔄 VIC Operator Bulk Update</h2>
      <p className="text-sm text-orange-700 mb-4">
        Upload a CSV with village names and operators to bulk-update the operator field
      </p>

      <div className="bg-orange-100 border border-orange-300 rounded-lg p-4 mb-4">
        <h3 className="font-semibold text-orange-900 mb-2 flex items-center gap-2">
          <AlertCircle className="size-4" />
          CSV Format Required
        </h3>
        <p className="text-sm text-orange-800 mb-2">Your CSV must have these columns:</p>
        <ul className="text-sm text-orange-800 list-disc ml-5 space-y-1">
          <li><code className="bg-orange-200 px-1 rounded">name</code> or <code className="bg-orange-200 px-1 rounded">Village Name</code> - The village name (must match database exactly)</li>
          <li><code className="bg-orange-200 px-1 rounded">operator</code> or <code className="bg-orange-200 px-1 rounded">Operator</code> - The operator name to set</li>
        </ul>
      </div>

      <div className="flex gap-3 mb-6">
        <Button onClick={downloadTemplate} variant="outline">
          <Download className="size-4 mr-2" />
          Download Template
        </Button>
        <Button onClick={exportCurrentData} disabled={loading} variant="outline">
          <Download className="size-4 mr-2" />
          Export Current Data
        </Button>
        <label>
          <Button disabled={loading} className="bg-orange-600 hover:bg-orange-700">
            <Upload className="size-4 mr-2" />
            {loading ? 'Processing...' : 'Upload CSV'}
          </Button>
          <input
            type="file"
            accept=".csv"
            onChange={handleFileUpload}
            className="hidden"
          />
        </label>
      </div>

      {/* Preview */}
      {previewData.length > 0 && (
        <Card className="p-4 bg-white mb-4">
          <h3 className="font-semibold mb-2">Preview (First 10 rows)</h3>
          <div className="overflow-x-auto">
            <table className="min-w-full text-sm">
              <thead>
                <tr className="border-b">
                  <th className="text-left p-2">Village Name</th>
                  <th className="text-left p-2">New Operator</th>
                </tr>
              </thead>
              <tbody>
                {previewData.map((row, idx) => (
                  <tr key={idx} className="border-b">
                    <td className="p-2">{row.name || row['Village Name']}</td>
                    <td className="p-2 font-semibold text-orange-600">{row.operator || row['Operator']}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>
      )}

      {/* Results */}
      {result && (
        <Card className="p-4 bg-white">
          <h3 className="font-semibold mb-3 flex items-center gap-2">
            {result.failed === 0 ? (
              <CheckCircle className="size-5 text-green-600" />
            ) : (
              <AlertCircle className="size-5 text-orange-600" />
            )}
            Update Results
          </h3>
          <div className="space-y-2">
            <p className="text-sm">✅ <strong>{result.success}</strong> villages updated successfully</p>
            {result.failed > 0 && (
              <>
                <p className="text-sm text-red-600">❌ <strong>{result.failed}</strong> failed</p>
                {result.errors.length > 0 && (
                  <div className="mt-3 p-3 bg-red-50 rounded border border-red-200 max-h-60 overflow-y-auto">
                    <p className="text-sm font-semibold text-red-900 mb-2">Errors:</p>
                    <ul className="text-xs text-red-800 space-y-1">
                      {result.errors.map((err, idx) => (
                        <li key={idx}>{err}</li>
                      ))}
                    </ul>
                  </div>
                )}
              </>
            )}
          </div>
        </Card>
      )}
    </Card>
  );
}
