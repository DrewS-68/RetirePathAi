import { useState } from 'react';
import { Upload, CheckCircle, XCircle } from 'lucide-react';
import { getSupabaseClient } from '../../utils/supabase/client';

export function SimpleVICCSVUploader() {
  const [loading, setLoading] = useState(false);
  const [file, setFile] = useState<File | null>(null);
  const [currentCount, setCurrentCount] = useState<number | null>(null);
  const [results, setResults] = useState<{
    created: number;
    skipped: number;
    errors: string[];
    skippedRows: Array<{ row: number; reason: string; data: any }>;
  } | null>(null);

  const checkCurrentCount = async () => {
    try {
      const supabase = getSupabaseClient();
      const { count, error } = await supabase
        .from('retirement_villages')
        .select('*', { count: 'exact', head: true })
        .eq('state', 'VIC');

      if (error) throw error;
      setCurrentCount(count || 0);
      console.log(`📊 Current VIC count: ${count || 0}`);
    } catch (error) {
      console.error('Count error:', error);
    }
  };

  const parseCSV = (text: string) => {
    const lines = text.split('\n').filter(line => line.trim());
    const rows = [];
    const skipped: Array<{ row: number; reason: string; data: any }> = [];

    // Detect delimiter
    const firstLine = lines[1] || '';
    const delimiter = (firstLine.match(/\t/g) || []).length >= 2 ? '\t' : ',';

    console.log(`Using delimiter: ${delimiter === '\t' ? 'TAB' : 'COMMA'}`);
    console.log(`Header: ${lines[0]}`);

    // Skip header
    for (let i = 1; i < lines.length; i++) {
      const parts = lines[i].split(delimiter).map(p => p.trim().replace(/^"|"$/g, ''));

      if (parts.length >= 2) {
        const operator = parts[0];  // First column: Operator
        const name = parts[1];      // Second column: Village Name
        const url = parts[2] || '';  // Third column: URL (optional)

        if (!name || !name.trim()) {
          skipped.push({
            row: i + 1,
            reason: 'Missing village name',
            data: { operator, name, url }
          });
          continue;
        }

        // Allow empty URLs for villages without websites
        rows.push({
          name: name.trim(),
          operator: operator?.trim() || null,
          url: url.trim() || null
        });
      } else {
        skipped.push({
          row: i + 1,
          reason: 'Not enough columns',
          data: parts
        });
      }
    }

    console.log(`Parsed ${rows.length} valid rows, skipped ${skipped.length} rows`);
    return { rows, skipped };
  };

  const handleUpload = async () => {
    if (!file) {
      alert('Please select a file');
      return;
    }

    setLoading(true);
    setResults(null);

    try {
      const text = await file.text();
      const { rows, skipped } = parseCSV(text);

      if (rows.length === 0) {
        alert('No valid rows found');
        setLoading(false);
        return;
      }

      const supabase = getSupabaseClient();
      let created = 0;
      const errors: string[] = [];

      for (const row of rows) {
        try {
          const { error } = await supabase
            .from('retirement_villages')
            .insert({
              name: row.name,
              operator: row.operator,
              website: row.url || null,  // Allow null URLs
              state: 'VIC',
              suburb: 'TBD',
              postcode: '0000',
              location: 'Victoria',
              status: 'approved',
              village_type: null,
              care_level: null,
              entry_price_min: null,
              entry_price_max: null,
              monthly_fees_min: null,
              monthly_fees_max: null,
              amenities: [],
              care_services: [],
              activities: [],
              pet_friendly: false,
              bedrooms: [],
              age_restriction: 55,
              images: [],
              source: 'csv_import',
              verified: false
            });

          if (error) {
            errors.push(`${row.name}: ${error.message}`);
          } else {
            created++;
            console.log(`✅ Created: ${row.name}`);
          }
        } catch (error) {
          errors.push(`${row.name}: ${error}`);
        }

        await new Promise(resolve => setTimeout(resolve, 50));
      }

      setResults({ created, skipped: skipped.length, errors, skippedRows: skipped });
      alert(`✅ Done!\n\nCreated: ${created}\nSkipped: ${skipped.length}\nErrors: ${errors.length}`);
    } catch (error) {
      alert(`Error: ${error}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-white p-6 rounded-lg shadow border-4 border-green-500">
      <h2 className="text-xl font-bold text-green-600 mb-4">
        ✅ Upload Fresh VIC Village Data
      </h2>

      {/* Current Count Checker */}
      <div className="mb-4 p-3 bg-yellow-50 rounded border border-yellow-300">
        <button
          onClick={checkCurrentCount}
          className="px-4 py-2 bg-yellow-600 text-white rounded hover:bg-yellow-700 text-sm font-semibold"
        >
          🔍 Check Current Database Count
        </button>
        {currentCount !== null && (
          <div className="mt-2">
            <div className="text-lg font-bold">
              {currentCount === 0 ? (
                <span className="text-green-600">✅ Database is empty - ready to upload!</span>
              ) : (
                <span className="text-orange-600">⚠️ {currentCount} VIC villages in database</span>
              )}
            </div>
            {currentCount > 0 && (
              <div className="mt-2 text-sm text-gray-700">
                ℹ️ New villages will be added. After upload, delete old villages created before today.
              </div>
            )}
          </div>
        )}
      </div>

      <div className="mb-4 p-4 bg-green-50 rounded border border-green-200">
        <p className="font-semibold mb-2">CSV Format:</p>
        <code className="text-xs bg-white p-2 block rounded">
          Operator [TAB] Village Name [TAB] URL<br/>
          Keyton [TAB] Abervale Village [TAB] https://...<br/>
          Bolton Clarke [TAB] Alawara [TAB] https://...
        </code>
        <p className="text-sm text-gray-600 mt-2">
          Tab or comma separated. Columns: <strong>Operator, Village Name, URL</strong> (in that order)
        </p>
      </div>

      <div className="space-y-4">
        <input
          type="file"
          accept=".csv"
          onChange={(e) => setFile(e.target.files?.[0] || null)}
          className="block w-full text-sm file:mr-4 file:py-2 file:px-4 file:rounded file:bg-green-100 file:text-green-700"
        />

        {file && <p className="text-sm">Selected: {file.name}</p>}

        <button
          onClick={handleUpload}
          disabled={loading || !file}
          className="w-full px-6 py-3 bg-green-600 text-white rounded hover:bg-green-700 disabled:opacity-50 font-bold"
        >
          <Upload className="inline w-4 h-4 mr-2" />
          {loading ? 'Uploading...' : 'Upload Village Data'}
        </button>
      </div>

      {results && (
        <div className="mt-4 p-4 bg-gray-50 rounded space-y-3">
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2">
              <CheckCircle className="w-5 h-5 text-green-600" />
              <span className="font-bold">Created: {results.created}</span>
            </div>
            {results.skipped > 0 && (
              <div className="flex items-center gap-2">
                <XCircle className="w-5 h-5 text-orange-600" />
                <span className="font-bold">Skipped: {results.skipped}</span>
              </div>
            )}
            {results.errors.length > 0 && (
              <div className="flex items-center gap-2">
                <XCircle className="w-5 h-5 text-red-600" />
                <span className="font-bold">Errors: {results.errors.length}</span>
              </div>
            )}
          </div>

          {results.skippedRows.length > 0 && (
            <div className="mt-2">
              <div className="font-semibold text-orange-600 mb-1">Skipped Rows:</div>
              <div className="max-h-40 overflow-y-auto text-xs bg-white p-2 rounded border">
                {results.skippedRows.map((skip, i) => (
                  <div key={i} className="mb-1 pb-1 border-b last:border-b-0">
                    <span className="font-bold">Row {skip.row}:</span> {skip.reason}
                    <div className="text-gray-600 ml-2">{JSON.stringify(skip.data)}</div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {results.errors.length > 0 && (
            <div className="mt-2">
              <div className="font-semibold text-red-600 mb-1">Errors:</div>
              <div className="max-h-40 overflow-y-auto text-xs bg-white p-2 rounded border">
                {results.errors.map((err, i) => (
                  <div key={i} className="text-red-600">{err}</div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
