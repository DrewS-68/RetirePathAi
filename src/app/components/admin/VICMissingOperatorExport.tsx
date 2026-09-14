import React, { useState } from 'react';
import { Button } from '../ui/button';
import { Download, AlertCircle, CheckCircle } from 'lucide-react';
import { projectId, publicAnonKey } from '../../utils/supabase/info';

export function VICMissingOperatorExport() {
  const [loading, setLoading] = useState(false);
  const [stats, setStats] = useState<any>(null);
  const [error, setError] = useState('');

  const exportMissingOperators = async () => {
    setLoading(true);
    setError('');
    setStats(null);
    
    try {
      console.log('🔍 Fetching VIC villages without operators...');
      
      const response = await fetch(
        `https://${projectId}.supabase.co/functions/v1/make-server-3bba8be8/admin/export-unmatched-vic-villages`,
        {
          method: 'GET',
          headers: {
            'Authorization': `Bearer ${publicAnonKey}`,
          },
        }
      );

      if (!response.ok) {
        throw new Error(`Failed to fetch: ${response.statusText}`);
      }

      const data = await response.json();
      
      console.log('📊 Received data:', data);
      
      setStats({
        total: data.total,
        villages: data.villages
      });

      if (data.villages && data.villages.length > 0) {
        // Create CSV
        const headers = ['Village Name', 'Suburb', 'Postcode', 'Street Address'];
        const rows = data.villages.map((v: any) => [
          v.name,
          v.suburb,
          v.postcode,
          v.street_address || ''
        ]);

        const csvContent = [
          headers.join(','),
          ...rows.map(row => row.map(cell => `"${cell}"`).join(','))
        ].join('\n');

        // Download
        const blob = new Blob([csvContent], { type: 'text/csv' });
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = `vic_missing_operators_${new Date().toISOString().split('T')[0]}_${Date.now()}.csv`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        URL.revokeObjectURL(url);

        console.log(`✅ Downloaded CSV with ${data.villages.length} villages`);
      } else {
        console.log('✅ No villages without operators!');
      }
      
    } catch (err: any) {
      setError(`Error: ${err.message}`);
      console.error('Export error:', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-gradient-to-r from-purple-50 to-blue-50 rounded-lg shadow-lg p-6 border-2 border-purple-300">
      <div className="flex items-center gap-3 mb-4">
        <Download className="size-6 text-purple-600" />
        <div>
          <h2 className="text-2xl font-bold text-purple-900">🔍 VIC Missing Operator Export</h2>
          <p className="text-sm text-purple-700">
            Export CURRENT list of villages without operators (proof of truth)
          </p>
        </div>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 rounded p-3 mb-4 flex items-start gap-2">
          <AlertCircle className="size-5 text-red-600 flex-shrink-0 mt-0.5" />
          <span className="text-red-800 text-sm">{error}</span>
        </div>
      )}

      {stats && (
        <div className="bg-white rounded-lg border-2 border-purple-300 p-4 mb-4">
          <div className="flex items-center gap-2 mb-2">
            <CheckCircle className="size-5 text-green-600" />
            <h3 className="font-semibold text-gray-900">Export Complete</h3>
          </div>
          <div className="space-y-2">
            <p className="text-sm">
              <strong className="text-purple-900">Total villages without operators:</strong>{' '}
              <span className="text-2xl font-bold text-purple-600">{stats.total}</span>
            </p>
            {stats.total > 0 && (
              <div className="bg-purple-50 p-3 rounded border border-purple-200">
                <p className="text-xs font-semibold text-purple-900 mb-1">Sample villages:</p>
                <ul className="text-xs text-purple-800 space-y-1">
                  {stats.villages.slice(0, 10).map((v: any, idx: number) => (
                    <li key={idx}>
                      {v.name} - {v.suburb}, VIC {v.postcode}
                    </li>
                  ))}
                </ul>
                {stats.total > 10 && (
                  <p className="text-xs text-purple-600 mt-2 italic">
                    ...and {stats.total - 10} more in the CSV
                  </p>
                )}
              </div>
            )}
          </div>
        </div>
      )}

      <Button
        onClick={exportMissingOperators}
        disabled={loading}
        className="w-full bg-purple-600 hover:bg-purple-700 text-white"
        size="lg"
      >
        {loading ? '🔍 Checking Database...' : '📥 Export Missing Operators NOW'}
      </Button>

      <div className="mt-4 bg-purple-100 border border-purple-300 rounded p-3">
        <p className="text-xs text-purple-800">
          <strong>This will:</strong>
          <br />
          • Query the database RIGHT NOW
          <br />
          • Find ALL VIC villages where operator IS NULL
          <br />
          • Download a timestamped CSV as proof
          <br />
          • Show you the ACTUAL current count (not cached)
        </p>
      </div>
    </div>
  );
}
