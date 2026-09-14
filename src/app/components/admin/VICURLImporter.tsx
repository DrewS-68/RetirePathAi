import { useState } from 'react';
import { Upload } from 'lucide-react';
import { projectId, publicAnonKey } from '../../utils/supabase/info';

interface CSVRow {
  id: string;
  name: string;
  operator: string;
  suburb: string;
  postcode: string;
  state: string;
  website: string;
}

export function VICURLImporter({ accessToken }: { accessToken: string }) {
  const [file, setFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);
  const [results, setResults] = useState<{
    updated: number;
    notFound: number;
    errors: string[];
  } | null>(null);

  const parseCSV = (text: string): CSVRow[] => {
    const lines = text.split('\n').filter(line => line.trim());
    const rows: CSVRow[] = [];

    console.log(`📄 Total lines in file: ${lines.length}`);
    console.log('📄 First line (header):', lines[0]);
    if (lines[1]) console.log('📄 Second line (first data):', lines[1]);

    // Detect delimiter - try tab first, then comma
    const firstDataLine = lines[1] || '';
    const tabCount = (firstDataLine.match(/\t/g) || []).length;
    const commaCount = (firstDataLine.match(/,/g) || []).length;
    const delimiter = tabCount >= 6 ? '\t' : ',';
    
    console.log(`📄 Detected delimiter: ${delimiter === '\t' ? 'TAB' : 'COMMA'} (tabs: ${tabCount}, commas: ${commaCount})`);

    // Skip header (line 0)
    for (let i = 1; i < lines.length; i++) {
      const line = lines[i];
      // Split by detected delimiter
      const parts = line.split(delimiter).map(p => p.trim().replace(/\r$/, '').replace(/^"|"$/g, ''));
      
      console.log(`Line ${i}: Found ${parts.length} parts`, parts);
      
      // Check if we have at least 7 fields (some CSVs may have trailing empty columns)
      if (parts.length >= 7) {
        const id = parts[0];
        const website = parts[6];
        
        if (id && website && website.startsWith('http')) {
          rows.push({
            id: parts[0],
            name: parts[1],
            operator: parts[2],
            suburb: parts[3],
            postcode: parts[4],
            state: parts[5],
            website: parts[6]
          });
          console.log(`✅ Parsed row: ${parts[1]} (${parts[0]}) - ${parts[6]}`);
        } else {
          console.log(`⚠️ Skipping line ${i}: Missing ID or invalid website`, { id, website });
        }
      } else {
        console.log(`⚠️ Skipping line ${i}: Only ${parts.length} parts, need at least 7`);
      }
    }

    console.log(`✅ Successfully parsed ${rows.length} rows`);
    return rows;
  };

  const handleImport = async () => {
    if (!file) return;

    setLoading(true);
    setResults(null);

    try {
      const text = await file.text();
      const rows = parseCSV(text);

      console.log(`📊 Parsed ${rows.length} rows from CSV`);
      console.log('First 3 rows:', rows.slice(0, 3));

      if (rows.length === 0) {
        alert('No valid rows found in CSV. Please check the file format.');
        setLoading(false);
        return;
      }

      let updated = 0;
      let notFound = 0;
      const errors: string[] = [];

      // Update each village
      for (const row of rows) {
        try {
          console.log(`🔄 Updating village ${row.name} (${row.id}) in ${row.suburb} with URL: ${row.website}`);
          
          const response = await fetch(
            `https://${projectId}.supabase.co/functions/v1/make-server-3bba8be8/update-village-website`,
            {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${publicAnonKey}`
              },
              body: JSON.stringify({
                villageId: row.id,
                name: row.name,
                suburb: row.suburb,
                website: row.website
              })
            }
          );

          const data = await response.json();
          console.log(`Response for ${row.name}:`, data);

          if (data.success) {
            updated++;
            console.log(`✅ Updated ${row.name}: ${row.website}`);
          } else if (data.error?.includes('not found')) {
            notFound++;
            console.log(`⚠️ Village not found: ${row.name} (${row.id})`);
            errors.push(`${row.name}: Village not found in database`);
          } else {
            errors.push(`${row.name}: ${data.error}`);
            console.error(`❌ Error updating ${row.name}:`, data.error);
          }
        } catch (error) {
          errors.push(`${row.name}: ${error}`);
          console.error(`❌ Exception updating ${row.name}:`, error);
        }
      }

      setResults({ updated, notFound, errors });
    } catch (error) {
      alert(`Error: ${error}`);
      console.error('Import error:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-white p-6 rounded-lg shadow">
      <div className="flex items-center gap-2 mb-4">
        <Upload className="w-5 h-5 text-blue-600" />
        <h2 className="text-xl font-bold">VIC URL Importer</h2>
      </div>

      <p className="text-sm text-gray-600 mb-4">
        Import website URLs for the 41 VIC villages from your CSV file.
        The CSV should have columns: ID, Name, Operator, Suburb, Postcode, State, New Website
      </p>

      <div className="space-y-4">
        <div>
          <input
            type="file"
            accept=".csv"
            onChange={(e) => setFile(e.target.files?.[0] || null)}
            className="block w-full text-sm text-gray-500
              file:mr-4 file:py-2 file:px-4
              file:rounded file:border-0
              file:text-sm file:font-semibold
              file:bg-blue-50 file:text-blue-700
              hover:file:bg-blue-100"
          />
        </div>

        <button
          onClick={handleImport}
          disabled={!file || loading}
          className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed"
        >
          {loading ? 'Importing...' : 'Import URLs'}
        </button>

        {results && (
          <div className="mt-4 p-4 bg-gray-50 rounded">
            <h3 className="font-semibold mb-2">Import Results:</h3>
            <div className="space-y-1 text-sm">
              <div className="text-green-600">✅ Updated: {results.updated}</div>
              {results.notFound > 0 && (
                <div className="text-yellow-600">⚠️ Not Found: {results.notFound}</div>
              )}
              {results.errors.length > 0 && (
                <div className="text-red-600">
                  ❌ Errors: {results.errors.length}
                  <div className="ml-4 mt-2">
                    {results.errors.map((err, i) => (
                      <div key={i} className="text-xs">{err}</div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}