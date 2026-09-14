import { useState } from 'react';
import { Download, Database } from 'lucide-react';
import { projectId, publicAnonKey } from '../../utils/supabase/info';

interface Village {
  id: string;
  name: string;
  suburb: string;
  postcode: string;
  operator: string;
  website: string | null;
}

export function VICVillagesNeedingURLsExport({ accessToken }: { accessToken: string }) {
  const [loading, setLoading] = useState(false);
  const [stats, setStats] = useState<{
    total: number;
    withOperator: number;
    withWebsite: number;
    needingURLs: number;
    sampleWithWebsites: Village[];
    sampleWithoutWebsites: Village[];
  } | null>(null);

  const fetchStats = async () => {
    setLoading(true);
    try {
      const response = await fetch(
        `https://${projectId}.supabase.co/functions/v1/make-server-3bba8be8/vic-url-stats`,
        {
          headers: {
            'Authorization': `Bearer ${publicAnonKey}`
          }
        }
      );

      const data = await response.json();
      setStats(data);
    } catch (error) {
      console.error('Error fetching stats:', error);
      alert(`Error: ${error}`);
    } finally {
      setLoading(false);
    }
  };

  const exportVillagesNeedingURLs = async () => {
    setLoading(true);
    try {
      const response = await fetch(
        `https://${projectId}.supabase.co/functions/v1/make-server-3bba8be8/export-vic-villages-needing-urls`,
        {
          headers: {
            'Authorization': `Bearer ${publicAnonKey}`
          }
        }
      );

      const villages: Village[] = await response.json();

      console.log(`📊 Exporting ${villages.length} villages needing URLs`);

      // Create CSV
      const headers = ['ID', 'Name', 'Suburb', 'Postcode', 'Operator'];
      const rows = villages.map(v => [
        v.id,
        v.name,
        v.suburb,
        v.postcode || '',
        v.operator || ''
      ]);

      const csvContent = [
        headers.join(','),
        ...rows.map(row => row.map(cell => `"${cell}"`).join(','))
      ].join('\n');

      // Download
      const blob = new Blob([csvContent], { type: 'text/csv' });
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `vic-villages-needing-urls-${new Date().toISOString().split('T')[0]}.csv`;
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

  return (
    <div className="bg-white p-6 rounded-lg shadow">
      <div className="flex items-center gap-2 mb-4">
        <Database className="w-5 h-5 text-purple-600" />
        <h2 className="text-xl font-bold">VIC Villages Needing URLs</h2>
      </div>

      <p className="text-sm text-gray-600 mb-4">
        Export the list of VIC villages that have operators but are missing website URLs.
        These are ready for URL scraping!
      </p>

      <div className="space-y-4">
        <button
          onClick={fetchStats}
          disabled={loading}
          className="px-4 py-2 bg-gray-600 text-white rounded hover:bg-gray-700 disabled:bg-gray-300 disabled:cursor-not-allowed"
        >
          {loading ? 'Loading...' : 'Refresh Stats'}
        </button>

        {stats && (
          <div className="p-4 bg-gray-50 rounded space-y-2">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <div className="text-sm text-gray-600">Total VIC Villages</div>
                <div className="text-2xl font-bold">{stats.total}</div>
              </div>
              <div>
                <div className="text-sm text-gray-600">With Operator</div>
                <div className="text-2xl font-bold text-green-600">{stats.withOperator}</div>
              </div>
              <div>
                <div className="text-sm text-gray-600">With Website</div>
                <div className="text-2xl font-bold text-blue-600">{stats.withWebsite}</div>
              </div>
              <div>
                <div className="text-sm text-gray-600">Needing URLs</div>
                <div className="text-2xl font-bold text-orange-600">{stats.needingURLs}</div>
              </div>
            </div>
            
            {stats.sampleWithWebsites && stats.sampleWithWebsites.length > 0 && (
              <div className="mt-4 pt-4 border-t">
                <h3 className="font-semibold text-sm mb-2">Sample Villages WITH Websites (first 20):</h3>
                <div className="text-xs space-y-1 max-h-60 overflow-y-auto bg-white p-2 rounded border">
                  {stats.sampleWithWebsites.map((v: any) => (
                    <div key={v.id} className="border-b pb-1 mb-1 last:border-b-0">
                      <div className="font-medium">{v.name} ({v.suburb})</div>
                      <div className="text-blue-600 truncate">{v.website}</div>
                      <div className="text-gray-500 text-[10px]">
                        Updated: {v.updated_at ? new Date(v.updated_at).toLocaleDateString() : 'N/A'}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
            
            {stats.sampleWithoutWebsites && stats.sampleWithoutWebsites.length > 0 && (
              <div className="mt-4 pt-4 border-t">
                <h3 className="font-semibold text-sm mb-2">Sample Villages WITHOUT Websites (first 10):</h3>
                <div className="text-xs space-y-1 max-h-40 overflow-y-auto bg-white p-2 rounded border">
                  {stats.sampleWithoutWebsites.map((v: any) => (
                    <div key={v.id} className="border-b pb-1 mb-1 last:border-b-0">
                      <div className="font-medium">{v.name} ({v.suburb})</div>
                      <div className="text-gray-500">Operator: {v.operator || 'None'}</div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {stats && stats.needingURLs > 0 && (
          <button
            onClick={exportVillagesNeedingURLs}
            disabled={loading}
            className="px-4 py-2 bg-purple-600 text-white rounded hover:bg-purple-700 disabled:bg-gray-300 disabled:cursor-not-allowed flex items-center gap-2"
          >
            <Download className="w-4 h-4" />
            {loading ? 'Exporting...' : `Export ${stats.needingURLs} Villages to CSV`}
          </button>
        )}
      </div>
    </div>
  );
}