import { useState } from 'react';
import { getSupabaseClient } from '../utils/supabase/client';

interface QuickVillage {
  name: string;
  suburb: string;
  postcode: string;
  state: string;
  operator?: string;
  website?: string;
}

export function QuickAddVillages() {
  const [villages, setVillages] = useState<string>('');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);

  const parseVillages = (text: string): QuickVillage[] => {
    const lines = text.trim().split('\n').filter(line => line.trim());
    const parsed: QuickVillage[] = [];

    for (const line of lines) {
      // Expected format: Name | Suburb | Postcode | State | Operator | Website
      const parts = line.split('|').map(p => p.trim());
      if (parts.length >= 4) {
        parsed.push({
          name: parts[0],
          suburb: parts[1],
          postcode: parts[2],
          state: parts[3],
          operator: parts[4] || undefined,
          website: parts[5] || undefined,
        });
      }
    }

    return parsed;
  };

  const addVillages = async () => {
    setLoading(true);
    setError(null);
    setResult(null);

    try {
      const parsed = parseVillages(villages);
      
      if (parsed.length === 0) {
        throw new Error('No valid villages to add. Check the format.');
      }

      const supabase = getSupabaseClient();
      const inserted: any[] = [];
      const errors: any[] = [];

      for (const village of parsed) {
        // Check if it already exists
        const { data: existing } = await supabase
          .from('retirement_villages')
          .select('id, name')
          .ilike('name', village.name)
          .ilike('suburb', village.suburb)
          .limit(1);

        if (existing && existing.length > 0) {
          errors.push({
            village: village.name,
            error: 'Already exists in database',
            existingId: existing[0].id
          });
          continue;
        }

        // Insert new village
        const { data, error: insertError } = await supabase
          .from('retirement_villages')
          .insert([{
            name: village.name,
            suburb: village.suburb,
            postcode: village.postcode,
            state: village.state,
            operator: village.operator,
            website: village.website,
            status: 'pending', // Needs review/approval
            source: 'manual_quick_add',
            submitted_at: new Date().toISOString(),
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
          }])
          .select()
          .single();

        if (insertError) {
          errors.push({
            village: village.name,
            error: insertError.message
          });
        } else {
          inserted.push(data);
        }
      }

      setResult({
        total: parsed.length,
        inserted: inserted.length,
        failed: errors.length,
        insertedVillages: inserted,
        errors
      });

    } catch (err: any) {
      console.error('Quick add error:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto p-6 bg-white rounded-lg shadow-lg">
      <h2 className="text-2xl font-bold mb-4">⚡ Quick Add Missing Villages</h2>
      
      <div className="mb-4 p-4 bg-blue-50 border border-blue-200 rounded-lg">
        <h3 className="font-semibold mb-2">📝 Format (one per line):</h3>
        <code className="text-sm block bg-white p-2 rounded border border-gray-300">
          Village Name | Suburb | Postcode | State | Operator | Website
        </code>
        <p className="text-sm text-gray-600 mt-2">
          Example: <code>Summerset Cranbourne | Cranbourne | 3977 | VIC | Summerset | https://example.com</code>
        </p>
        <p className="text-xs text-gray-500 mt-1">
          Note: Operator and Website are optional. Villages will be added with 'pending' status for review.
        </p>
      </div>

      <textarea
        value={villages}
        onChange={(e) => setVillages(e.target.value)}
        placeholder="Paste village data here (one per line)..."
        rows={8}
        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 font-mono text-sm"
      />

      <button
        onClick={addVillages}
        disabled={loading || !villages.trim()}
        className="mt-4 w-full px-6 py-3 bg-purple-600 text-white rounded-lg hover:bg-purple-700 disabled:opacity-50 font-semibold"
      >
        {loading ? 'Adding Villages...' : 'Add Villages'}
      </button>

      {error && (
        <div className="mt-4 p-4 bg-red-50 border border-red-200 rounded-lg text-red-700">
          ❌ Error: {error}
        </div>
      )}

      {result && (
        <div className="mt-4 space-y-4">
          <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
            <h3 className="font-semibold text-lg mb-2">✅ Results</h3>
            <p className="text-gray-700">
              Total processed: <strong>{result.total}</strong><br />
              Successfully added: <strong className="text-green-600">{result.inserted}</strong><br />
              Failed/Skipped: <strong className="text-red-600">{result.failed}</strong>
            </p>
          </div>

          {result.insertedVillages && result.insertedVillages.length > 0 && (
            <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
              <h3 className="font-semibold mb-2">🏘️ Added Villages</h3>
              <ul className="space-y-1">
                {result.insertedVillages.map((v: any) => (
                  <li key={v.id} className="text-sm text-gray-700">
                    ✓ {v.name} - {v.suburb}, {v.postcode}
                  </li>
                ))}
              </ul>
            </div>
          )}

          {result.errors && result.errors.length > 0 && (
            <div className="p-4 bg-orange-50 border border-orange-200 rounded-lg">
              <h3 className="font-semibold mb-2">⚠️ Errors/Skipped</h3>
              <ul className="space-y-1">
                {result.errors.map((e: any, idx: number) => (
                  <li key={idx} className="text-sm text-gray-700">
                    {e.village}: {e.error}
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
