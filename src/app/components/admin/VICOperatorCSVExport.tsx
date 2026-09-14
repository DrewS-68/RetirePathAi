import { useState } from 'react';
import { Button } from '../ui/button';
import { Card, CardHeader, CardTitle, CardContent } from '../ui/card';
import { Download, Loader2, FileSpreadsheet } from 'lucide-react';
import { projectId, publicAnonKey } from '../../utils/supabase/info';

export function VICOperatorCSVExport() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [stats, setStats] = useState<{ total: number; withAberlea: number; aberleaVillages: string[] } | null>(null);

  const exportScrapedVillages = async () => {
    setLoading(true);
    setError('');
    setStats(null);
    
    try {
      // Check localStorage for scraping results first
      const localResults = localStorage.getItem('vic_scrape_results');
      let villages: any[] = [];
      
      if (localResults) {
        console.log('📦 Found scraping results in localStorage');
        const parsed = JSON.parse(localResults);
        
        // Get the village names from localStorage results
        const villageNames = parsed.results?.map((r: any) => r.village) || [];
        console.log(`Found ${villageNames.length} villages in localStorage results`);
        
        // Query database for these specific villages
        const response = await fetch(
          `https://${projectId}.supabase.co/functions/v1/make-server-3bba8be8/admin/vic-scraped-villages-check`,
          {
            method: 'POST',
            headers: {
              'Authorization': `Bearer ${publicAnonKey}`,
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({ villageNames }),
          }
        );

        if (!response.ok) {
          throw new Error('Failed to fetch scraped villages from database');
        }

        const data = await response.json();
        villages = data.villages || [];
        console.log(`Database returned ${villages.length} villages`);
      } else {
        console.log('⚠️ No localStorage results found, fetching recent 87 from database');
        
        // Fallback: get the 87 most recent villages with operators
        const response = await fetch(
          `https://${projectId}.supabase.co/functions/v1/make-server-3bba8be8/admin/vic-recently-updated-villages`,
          {
            method: 'GET',
            headers: {
              'Authorization': `Bearer ${publicAnonKey}`,
            },
          }
        );

        if (!response.ok) {
          throw new Error('Failed to fetch recent villages');
        }

        const data = await response.json();
        villages = (data.villages || []).slice(0, 87); // Take first 87
      }
      
      if (villages.length === 0) {
        throw new Error('No scraped villages found to export');
      }
      
      // Create CSV content
      const csvRows = [
        ['Village Name', 'Suburb', 'Postcode', 'Operator', 'Has Aberlea?'].join(',')
      ];
      
      let aberleaCount = 0;
      const aberleaVillages: string[] = [];
      
      villages.forEach((v: any) => {
        const hasAberlea = v.operator && v.operator.toLowerCase().includes('aberlea');
        
        const row = [
          `"${v.name || ''}"`,
          `"${v.suburb || ''}"`,
          `"${v.postcode || ''}"`,
          `"${v.operator || 'NULL'}"`,
          hasAberlea ? 'YES ⚠️' : 'No'
        ].join(',');
        csvRows.push(row);
        
        if (hasAberlea) {
          aberleaCount++;
          aberleaVillages.push(v.name);
        }
      });
      
      const csvContent = csvRows.join('\n');
      
      // Download CSV
      const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
      const link = document.createElement('a');
      const url = URL.createObjectURL(blob);
      link.setAttribute('href', url);
      link.setAttribute('download', `vic_scraped_87_villages_${new Date().toISOString().slice(0,10)}.csv`);
      link.style.visibility = 'hidden';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      
      setStats({
        total: villages.length,
        withAberlea: aberleaCount,
        aberleaVillages
      });
      
    } catch (err: any) {
      setError(err.message);
      console.error('Export error:', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card className="border-2 border-purple-400">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <FileSpreadsheet className="size-6 text-purple-600" />
          Export 87 Scraped Villages
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="bg-purple-50 border-2 border-purple-200 rounded-lg p-4">
          <p className="text-sm text-purple-900 font-semibold mb-2">
            🎯 What this does:
          </p>
          <ul className="text-sm text-purple-800 space-y-1 list-disc list-inside">
            <li>Exports the <strong>87 villages you just scraped</strong></li>
            <li>Shows their current operator values in the database</li>
            <li>Highlights any with "Aberlea" contamination</li>
            <li>Downloads as CSV for your inspection</li>
          </ul>
        </div>

        <Button
          onClick={exportScrapedVillages}
          disabled={loading}
          className="w-full bg-purple-600 hover:bg-purple-700"
        >
          {loading ? (
            <>
              <Loader2 className="mr-2 size-4 animate-spin" />
              Exporting...
            </>
          ) : (
            <>
              <Download className="mr-2 size-4" />
              Export 87 Scraped Villages to CSV
            </>
          )}
        </Button>

        {error && (
          <div className="bg-red-50 border border-red-200 rounded p-3 text-red-800 text-sm">
            <strong>Error:</strong> {error}
          </div>
        )}

        {stats && (
          <div className={`border-2 rounded-lg p-4 ${
            stats.withAberlea > 0 
              ? 'bg-red-50 border-red-300' 
              : 'bg-green-50 border-green-300'
          }`}>
            <div className="font-semibold mb-3 text-lg">
              {stats.withAberlea > 0 ? '🚨 ABERLEA CONTAMINATION DETECTED!' : '✅ CSV Downloaded - Clean!'}
            </div>
            
            <div className="space-y-2 text-sm">
              <div className="flex justify-between items-center">
                <span className="text-gray-700">Total villages exported:</span>
                <strong className="text-gray-900">{stats.total}</strong>
              </div>
              
              <div className={`flex justify-between items-center ${
                stats.withAberlea > 0 ? 'text-red-900 font-bold' : 'text-green-900'
              }`}>
                <span>Villages with Aberlea:</span>
                <strong>{stats.withAberlea}</strong>
              </div>
            </div>

            {stats.withAberlea > 0 && stats.aberleaVillages.length > 0 && (
              <div className="mt-4 p-3 bg-red-100 border border-red-300 rounded">
                <p className="font-semibold text-red-900 mb-2">
                  ⚠️ These villages have Aberlea:
                </p>
                <div className="max-h-40 overflow-y-auto">
                  <ul className="text-sm text-red-800 space-y-1">
                    {stats.aberleaVillages.map((name, i) => (
                      <li key={i} className="font-mono">• {name}</li>
                    ))}
                  </ul>
                </div>
                <p className="text-sm text-red-900 mt-3 font-semibold">
                  👉 Use the "VIC Aberlea Filter" tool below to clean these!
                </p>
              </div>
            )}

            {stats.withAberlea === 0 && (
              <div className="mt-3 p-3 bg-green-100 border border-green-300 rounded">
                <p className="text-sm text-green-900 font-semibold">
                  ✅ No Aberlea contamination detected. All {stats.total} villages have clean operators!
                </p>
              </div>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
