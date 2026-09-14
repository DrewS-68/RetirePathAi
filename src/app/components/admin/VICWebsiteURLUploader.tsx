import { useState } from 'react';
import { Upload, Download, Database, CheckCircle, XCircle } from 'lucide-react';
import { projectId, publicAnonKey } from '../../utils/supabase/info';

interface Village {
  id: string;
  name: string;
  operator: string;
  suburb: string;
  postcode: string;
  state: string;
  website: string | null;
}

interface CSVRow {
  id: string;
  name: string;
  operator: string;
  suburb: string;
  postcode: string;
  state: string;
  website: string;
}

export function VICWebsiteURLUploader({ accessToken }: { accessToken: string }) {
  const [loading, setLoading] = useState(false);
  const [file, setFile] = useState<File | null>(null);
  const [stats, setStats] = useState<{
    total: number;
    withWebsite: number;
    withoutWebsite: number;
  } | null>(null);
  const [uploadResults, setUploadResults] = useState<{
    updated: number;
    skipped: number;
    errors: string[];
  } | null>(null);

  // Fetch current stats
  const fetchStats = async () => {
    setLoading(true);
    try {
      const response = await fetch(
        `https://${projectId}.supabase.co/rest/v1/retirement_villages?state=eq.VIC&status=eq.approved&select=id,website`,
        {
          headers: {
            'apikey': publicAnonKey,
            'Authorization': `Bearer ${accessToken}`
          }
        }
      );

      const villages = await response.json();
      const withWebsite = villages.filter((v: any) => v.website && v.website.startsWith('http')).length;

      setStats({
        total: villages.length,
        withWebsite,
        withoutWebsite: villages.length - withWebsite
      });
    } catch (error) {
      console.error('Error fetching stats:', error);
      alert(`Error: ${error}`);
    } finally {
      setLoading(false);
    }
  };

  // Export villages to CSV for scraping
  const exportForScraping = async () => {
    setLoading(true);
    try {
      const response = await fetch(
        `https://${projectId}.supabase.co/rest/v1/retirement_villages?state=eq.VIC&status=eq.approved&select=id,name,operator,suburb,postcode,state,website&order=name.asc`,
        {
          headers: {
            'apikey': publicAnonKey,
            'Authorization': `Bearer ${accessToken}`
          }
        }
      );

      const villages: Village[] = await response.json();

      console.log(`📊 Exporting ${villages.length} VIC villages for URL scraping`);

      // Create CSV with tab delimiter for Excel compatibility
      const headers = ['ID', 'Name', 'Operator', 'Suburb', 'Postcode', 'State', 'Website'];
      const rows = villages.map(v => [
        v.id,
        v.name,
        v.operator || '',
        v.suburb,
        v.postcode || '',
        v.state,
        v.website || ''
      ]);

      const csvContent = [
        headers.join('\t'),
        ...rows.map(row => row.map(cell => `${cell}`).join('\t'))
      ].join('\n');

      // Download
      const blob = new Blob([csvContent], { type: 'text/csv' });
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `vic-villages-for-url-scraping-${new Date().toISOString().split('T')[0]}.csv`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      window.URL.revokeObjectURL(url);

      alert(`✅ Exported ${villages.length} villages to CSV`);
    } catch (error) {
      console.error('Error exporting:', error);
      alert(`Error: ${error}`);
    } finally {
      setLoading(false);
    }
  };

  // Parse CSV file
  const parseCSV = (text: string): CSVRow[] => {
    const lines = text.split('\n').filter(line => line.trim());
    const rows: CSVRow[] = [];

    console.log(`📄 Total lines in file: ${lines.length}`);

    // Detect delimiter - try tab first, then comma
    const firstDataLine = lines[1] || '';
    const tabCount = (firstDataLine.match(/\t/g) || []).length;
    const commaCount = (firstDataLine.match(/,/g) || []).length;
    const delimiter = tabCount >= 6 ? '\t' : ',';

    console.log(`📄 Detected delimiter: ${delimiter === '\t' ? 'TAB' : 'COMMA'} (tabs: ${tabCount}, commas: ${commaCount})`);

    // Skip header (line 0)
    for (let i = 1; i < lines.length; i++) {
      const line = lines[i];
      const parts = line.split(delimiter).map(p => p.trim().replace(/\r$/, '').replace(/^"|"$/g, ''));

      if (parts.length >= 7) {
        const id = parts[0];
        const website = parts[6];

        // Only include rows that have an ID and a valid website
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
          console.log(`✅ Parsed: ${parts[1]} - ${parts[6]}`);
        }
      }
    }

    console.log(`✅ Successfully parsed ${rows.length} rows with valid websites`);
    return rows;
  };

  // Upload URLs from CSV
  const handleUpload = async () => {
    if (!file) {
      alert('Please select a CSV file first');
      return;
    }

    setLoading(true);
    setUploadResults(null);

    try {
      const text = await file.text();
      const rows = parseCSV(text);

      console.log(`📊 Uploading ${rows.length} website URLs`);

      if (rows.length === 0) {
        alert('No valid rows found in CSV. Make sure it has ID and Website columns.');
        setLoading(false);
        return;
      }

      let updated = 0;
      let skipped = 0;
      const errors: string[] = [];

      // Update in batches of 50
      const batchSize = 50;
      for (let i = 0; i < rows.length; i += batchSize) {
        const batch = rows.slice(i, i + batchSize);

        for (const row of batch) {
          try {
            const response = await fetch(
              `https://${projectId}.supabase.co/rest/v1/retirement_villages?id=eq.${row.id}`,
              {
                method: 'PATCH',
                headers: {
                  'apikey': publicAnonKey,
                  'Authorization': `Bearer ${accessToken}`,
                  'Content-Type': 'application/json',
                  'Prefer': 'return=minimal'
                },
                body: JSON.stringify({
                  website: row.website,
                  updated_at: new Date().toISOString()
                })
              }
            );

            if (response.ok) {
              updated++;
              console.log(`✅ Updated: ${row.name} (${row.id})`);
            } else {
              skipped++;
              console.log(`⚠️ Skipped: ${row.name} (${response.status})`);
            }
          } catch (error) {
            errors.push(`Error updating ${row.name}: ${error}`);
            console.error(`❌ Error: ${row.name}`, error);
          }
        }

        // Progress update
        console.log(`Progress: ${Math.min(i + batchSize, rows.length)}/${rows.length}`);
      }

      setUploadResults({
        updated,
        skipped,
        errors
      });

      // Refresh stats
      await fetchStats();

      alert(`✅ Upload complete!\n\nUpdated: ${updated}\nSkipped: ${skipped}\nErrors: ${errors.length}`);
    } catch (error) {
      console.error('Upload error:', error);
      alert(`Error uploading: ${error}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-white p-6 rounded-lg shadow">
      <div className="flex items-center gap-2 mb-4">
        <Database className="w-5 h-5 text-blue-600" />
        <h2 className="text-xl font-bold">VIC Website URL Manager</h2>
      </div>

      <p className="text-sm text-gray-600 mb-6">
        Export villages for URL scraping, then import the scraped URLs back into the database.
      </p>

      {/* Stats Section */}
      <div className="mb-6">
        <button
          onClick={fetchStats}
          disabled={loading}
          className="px-4 py-2 bg-gray-600 text-white rounded hover:bg-gray-700 disabled:bg-gray-300 disabled:cursor-not-allowed mb-4"
        >
          {loading ? 'Loading...' : 'Refresh Stats'}
        </button>

        {stats && (
          <div className="grid grid-cols-3 gap-4 p-4 bg-gray-50 rounded">
            <div>
              <div className="text-sm text-gray-600">Total VIC Villages</div>
              <div className="text-2xl font-bold">{stats.total}</div>
            </div>
            <div>
              <div className="text-sm text-gray-600">With Website</div>
              <div className="text-2xl font-bold text-green-600">{stats.withWebsite}</div>
            </div>
            <div>
              <div className="text-sm text-gray-600">Without Website</div>
              <div className="text-2xl font-bold text-orange-600">{stats.withoutWebsite}</div>
            </div>
          </div>
        )}
      </div>

      {/* Export Section */}
      <div className="mb-6 p-4 bg-blue-50 rounded">
        <h3 className="font-semibold mb-2 flex items-center gap-2">
          <Download className="w-4 h-4" />
          Step 1: Export for URL Scraping
        </h3>
        <p className="text-sm text-gray-600 mb-3">
          Download a CSV of all VIC villages to fill in their website URLs.
        </p>
        <button
          onClick={exportForScraping}
          disabled={loading}
          className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed flex items-center gap-2"
        >
          <Download className="w-4 h-4" />
          {loading ? 'Exporting...' : 'Export Villages to CSV'}
        </button>
      </div>

      {/* Upload Section */}
      <div className="p-4 bg-green-50 rounded">
        <h3 className="font-semibold mb-2 flex items-center gap-2">
          <Upload className="w-4 h-4" />
          Step 2: Upload Scraped URLs
        </h3>
        <p className="text-sm text-gray-600 mb-3">
          Upload the CSV with filled-in website URLs to update the database.
          CSV must have columns: ID, Name, Operator, Suburb, Postcode, State, Website
        </p>

        <div className="space-y-3">
          <input
            type="file"
            accept=".csv"
            onChange={(e) => setFile(e.target.files?.[0] || null)}
            className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded file:border-0 file:text-sm file:font-semibold file:bg-green-50 file:text-green-700 hover:file:bg-green-100"
          />

          {file && (
            <div className="text-sm text-gray-600">
              Selected: <span className="font-medium">{file.name}</span>
            </div>
          )}

          <button
            onClick={handleUpload}
            disabled={loading || !file}
            className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700 disabled:bg-gray-300 disabled:cursor-not-allowed flex items-center gap-2"
          >
            <Upload className="w-4 h-4" />
            {loading ? 'Uploading...' : 'Upload URLs to Database'}
          </button>
        </div>

        {uploadResults && (
          <div className="mt-4 p-4 bg-white rounded border space-y-2">
            <div className="flex items-center gap-2 text-green-600">
              <CheckCircle className="w-5 h-5" />
              <span className="font-semibold">Updated: {uploadResults.updated}</span>
            </div>
            {uploadResults.skipped > 0 && (
              <div className="flex items-center gap-2 text-orange-600">
                <XCircle className="w-5 h-5" />
                <span className="font-semibold">Skipped: {uploadResults.skipped}</span>
              </div>
            )}
            {uploadResults.errors.length > 0 && (
              <div className="mt-2">
                <div className="font-semibold text-red-600 mb-1">Errors:</div>
                <div className="text-xs max-h-40 overflow-y-auto bg-red-50 p-2 rounded">
                  {uploadResults.errors.map((err, i) => (
                    <div key={i} className="mb-1">{err}</div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
