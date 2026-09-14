import React, { useState } from 'react';
import { Card } from '../ui/card';
import { Button } from '../ui/button';
import { Wrench, Loader2, CheckCircle } from 'lucide-react';
import { projectId, publicAnonKey } from '../../utils/supabase/info';

interface Result {
  villageName: string;
  extractedOperator: string;
  success: boolean;
  error?: string;
}

export function VICExtractOperatorsFromDescription() {
  const [loading, setLoading] = useState(false);
  const [results, setResults] = useState<Result[]>([]);
  const [summary, setSummary] = useState<string>('');

  const extractOperators = async () => {
    setLoading(true);
    setResults([]);
    setSummary('');

    try {
      const response = await fetch(
        `https://${projectId}.supabase.co/functions/v1/make-server-3bba8be8/admin/vic-villages/extract-operators-from-descriptions`,
        {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${publicAnonKey}`,
            'Content-Type': 'application/json',
          },
        }
      );

      if (!response.ok) {
        const errorData = await response.json().catch(() => null);
        throw new Error(errorData?.error || `Request failed: ${response.status}`);
      }

      const data = await response.json();
      setResults(data.results || []);
      setSummary(data.summary || '');

    } catch (err: any) {
      console.error('Error:', err);
      alert(`Error: ${err.message}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card className="p-6 bg-gradient-to-r from-green-50 to-emerald-50 border-2 border-green-400">
      <h2 className="text-2xl font-bold mb-2 text-green-900 flex items-center gap-2">
        <Wrench className="size-6" />
        🔧 Extract Operators from Descriptions
      </h2>
      <p className="text-sm text-green-700 mb-4">
        The CSV import put operator data in descriptions like "Village Name - Operated by OperatorName".
        This tool extracts that data and moves it to the operator field.
      </p>

      <div className="bg-yellow-50 border border-yellow-300 rounded p-4 mb-4">
        <h3 className="font-semibold text-yellow-900 mb-2">🔍 What this does:</h3>
        <ol className="text-sm text-yellow-800 space-y-1 list-decimal list-inside">
          <li>Find all VIC villages with descriptions like "Village - Operated by X"</li>
          <li>Extract the operator name from the description</li>
          <li>Update the operator field with the extracted name</li>
          <li>Show you the results</li>
        </ol>
      </div>

      <Button
        onClick={extractOperators}
        disabled={loading}
        className="bg-green-600 hover:bg-green-700 text-white mb-4 w-full"
        size="lg"
      >
        {loading ? (
          <>
            <Loader2 className="size-5 mr-2 animate-spin" />
            Extracting Operators...
          </>
        ) : (
          <>
            <Wrench className="size-5 mr-2" />
            Extract & Fix Operators
          </>
        )}
      </Button>

      {summary && (
        <div className="bg-white p-4 rounded border mb-4">
          <h3 className="font-semibold mb-2 flex items-center gap-2">
            <CheckCircle className="size-5 text-green-600" />
            Summary
          </h3>
          <div className="text-sm whitespace-pre-wrap">{summary}</div>
        </div>
      )}

      {results.length > 0 && (
        <div className="bg-white p-4 rounded border max-h-96 overflow-y-auto">
          <h3 className="font-semibold mb-3">Results ({results.length} villages processed)</h3>
          <div className="space-y-2">
            {results.map((r, idx) => (
              <div key={idx} className={`p-3 rounded border text-xs ${r.success ? 'bg-green-50 border-green-200' : 'bg-red-50 border-red-200'}`}>
                <div className="font-semibold">{r.villageName}</div>
                <div className="mt-1">
                  {r.success ? (
                    <span className="text-green-700">✅ Operator set to: <strong>{r.extractedOperator}</strong></span>
                  ) : (
                    <span className="text-red-700">❌ {r.error}</span>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </Card>
  );
}
