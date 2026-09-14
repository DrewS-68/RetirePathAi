import { useState } from 'react';
import { Button } from '../ui/button';
import { Card, CardHeader, CardTitle, CardContent } from '../ui/card';
import { Download, Database, Search } from 'lucide-react';
import { projectId, publicAnonKey } from '../../utils/supabase/info';

export function VICOperatorFullExport() {
  const [loading, setLoading] = useState(false);
  const [stats, setStats] = useState<string>('');
  const [csvData, setCsvData] = useState<string>('');
  const [csvDataWithoutOperators, setCsvDataWithoutOperators] = useState<string>('');

  const checkDatabase = async () => {
    setLoading(true);
    setStats('Checking database...');

    try {
      const response = await fetch(
        `https://${projectId}.supabase.co/functions/v1/make-server-3bba8be8/vic-operator-full-check`,
        {
          method: 'GET',
          headers: {
            'Authorization': `Bearer ${publicAnonKey}`,
            'Content-Type': 'application/json',
          },
        }
      );

      if (!response.ok) {
        throw new Error(`Server error: ${response.status}`);
      }

      const data = await response.json();
      
      const statsText = `📊 VIC DATABASE STATS:\n\n` +
        `Total VIC villages: ${data.total}\n` +
        `Villages WITH operators: ${data.withOperators}\n` +
        `Villages WITHOUT operators: ${data.withoutOperators}\n\n` +
        `📋 Operator Breakdown:\n${data.operatorBreakdown?.map((op: any) => 
          `  ${op.operator}: ${op.count} villages`
        ).join('\n') || 'No operators found'}\n\n` +
        `🔤 Alphabetical Distribution (WITH operators):\n${data.alphabeticalDistribution?.map((dist: any) => 
          `  ${dist.letter}: ${dist.count} villages`
        ).join('\n') || 'No distribution data'}`;

      setStats(statsText);

      // Generate CSV WITH operators
      if (data.villages && data.villages.length > 0) {
        const headers = 'ID,Name,Suburb,Postcode,Operator,State,Website';
        const rows = data.villages.map((v: any) => 
          `${v.id},"${v.name}","${v.suburb}",${v.postcode},"${v.operator || ''}",${v.state},"${v.website || ''}"`
        );
        const csv = [headers, ...rows].join('\n');
        setCsvData(csv);
      }

      // Generate CSV WITHOUT operators (for scraping)
      if (data.villagesWithoutOperators && data.villagesWithoutOperators.length > 0) {
        const headers = 'ID,Name,Suburb,Postcode,State,Website';
        const rows = data.villagesWithoutOperators.map((v: any) => 
          `${v.id},"${v.name}","${v.suburb}",${v.postcode},${v.state},"${v.website || ''}"`
        );
        const csv = [headers, ...rows].join('\n');
        setCsvDataWithoutOperators(csv);
      }

    } catch (err: any) {
      setStats(`❌ Error: ${err.message}`);
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleDownload = () => {
    const blob = new Blob([csvData], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `vic-with-operators-${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleDownloadWithoutOperators = () => {
    const blob = new Blob([csvDataWithoutOperators], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `vic-WITHOUT-operators-TO-SCRAPE-${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <Card className="border-2 border-purple-400">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Database className="size-6 text-purple-600" />
          VIC Full Database Export (All 510 Villages)
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <p className="text-sm text-gray-700">
          Check exactly how many VIC villages have operators and export ALL of them (not just A-C)
        </p>

        <Button
          onClick={checkDatabase}
          disabled={loading}
          className="w-full bg-purple-600 hover:bg-purple-700"
        >
          <Search className="mr-2 size-4" />
          {loading ? 'Checking Database...' : 'Check & Export ALL VIC Operators'}
        </Button>

        {stats && (
          <div className="bg-purple-50 border border-purple-300 rounded p-3">
            <pre className="text-xs whitespace-pre-wrap font-mono">{stats}</pre>
          </div>
        )}

        {(csvData || csvDataWithoutOperators) && (
          <div className="space-y-3">
            <div className="bg-blue-50 border border-blue-300 rounded p-3">
              <p className="font-semibold text-sm mb-2">📥 Download Options:</p>
              <div className="space-y-2">
                {csvData && (
                  <Button
                    onClick={handleDownload}
                    className="w-full bg-green-600 hover:bg-green-700"
                  >
                    <Download className="mr-2 size-4" />
                    ✅ Download WITH Operators ({csvData.split('\n').length - 1} villages)
                  </Button>
                )}
                {csvDataWithoutOperators && (
                  <Button
                    onClick={handleDownloadWithoutOperators}
                    className="w-full bg-red-600 hover:bg-red-700"
                  >
                    <Download className="mr-2 size-4" />
                    🎯 Download WITHOUT Operators - TO SCRAPE ({csvDataWithoutOperators.split('\n').length - 1} villages)
                  </Button>
                )}
              </div>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}