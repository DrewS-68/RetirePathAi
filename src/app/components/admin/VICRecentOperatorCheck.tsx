import React, { useState } from 'react';
import { Button } from '../ui/button';
import { AlertCircle, CheckCircle, XCircle, Search, Download } from 'lucide-react';
import { projectId, publicAnonKey } from '../../utils/supabase/info';

interface Village {
  id: string;
  name: string;
  suburb: string;
  postcode: string;
  operator: string | null;
}

export function VICRecentOperatorCheck() {
  const [stats, setStats] = useState<any>(null);
  const [recentlyUpdated, setRecentlyUpdated] = useState<Village[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [exportingAll, setExportingAll] = useState(false);
  const [breakingOut, setBreakingOut] = useState(false);
  const [breakoutStats, setBreakoutStats] = useState<any>(null);

  const checkDatabase = async () => {
    setLoading(true);
    setError('');
    setStats(null);
    setRecentlyUpdated([]);
    
    try {
      console.log('🔍 Fetching VIC operator stats...');
      
      // Get stats on all VIC villages
      const statsResponse = await fetch(
        `https://${projectId}.supabase.co/functions/v1/make-server-3bba8be8/admin/vic-operator-stats`,
        {
          method: 'GET',
          headers: {
            'Authorization': `Bearer ${publicAnonKey}`,
          },
        }
      );

      if (!statsResponse.ok) {
        throw new Error(`Failed to fetch stats: ${statsResponse.statusText}`);
      }

      const statsData = await statsResponse.json();
      console.log('📊 Stats received:', statsData);
      setStats(statsData);
      
      // Get recently updated villages (those with operators)
      const recentResponse = await fetch(
        `https://${projectId}.supabase.co/functions/v1/make-server-3bba8be8/admin/vic-recently-updated-villages`,
        {
          method: 'GET',
          headers: {
            'Authorization': `Bearer ${publicAnonKey}`,
          },
        }
      );

      if (!recentResponse.ok) {
        throw new Error(`Failed to fetch recent: ${recentResponse.statusText}`);
      }

      const recentData = await recentResponse.json();
      console.log('📋 Recent villages:', recentData);
      setRecentlyUpdated(recentData.villages || []);
      
    } catch (err: any) {
      setError(`Error: ${err.message}`);
      console.error('❌ Error fetching data:', err);
    } finally {
      setLoading(false);
    }
  };

  const exportAllVICVillages = async () => {
    setExportingAll(true);
    setError('');
    
    try {
      console.log('📥 Exporting ALL VIC villages...');
      
      const response = await fetch(
        `https://${projectId}.supabase.co/functions/v1/make-server-3bba8be8/admin/export-vic-all-villages-csv`,
        {
          method: 'GET',
          headers: {
            'Authorization': `Bearer ${publicAnonKey}`,
          },
        }
      );

      if (!response.ok) {
        throw new Error(`Failed to export: ${response.statusText}`);
      }

      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `vic_all_villages_${new Date().toISOString().split('T')[0]}.csv`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
      
      console.log('✅ Export complete!');
    } catch (err: any) {
      setError(`Export error: ${err.message}`);
      console.error('❌ Error exporting:', err);
    } finally {
      setExportingAll(false);
    }
  };

  const breakoutAndExport = async () => {
    setBreakingOut(true);
    setError('');
    setBreakoutStats(null);
    
    try {
      console.log('📊 Breaking out VIC villages by operator status...');
      
      const response = await fetch(
        `https://${projectId}.supabase.co/functions/v1/make-server-3bba8be8/admin/breakout-vic-villages`,
        {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${publicAnonKey}`,
          },
        }
      );

      if (!response.ok) {
        throw new Error(`Failed to breakout: ${response.statusText}`);
      }

      const result = await response.json();
      console.log('📊 Breakout result:', result);
      setBreakoutStats(result);
      
      console.log('✅ Breakout complete! CSVs stored in KV.');
    } catch (err: any) {
      setError(`Breakout error: ${err.message}`);
      console.error('❌ Error breaking out:', err);
    } finally {
      setBreakingOut(false);
    }
  };

  const downloadNeedsScraping = async () => {
    try {
      console.log('📥 Downloading needs_scraping CSV...');
      const response = await fetch(
        `https://${projectId}.supabase.co/functions/v1/make-server-3bba8be8/admin/download-csv/vic_needs_scraping`,
        {
          method: 'GET',
          headers: {
            'Authorization': `Bearer ${publicAnonKey}`,
          },
        }
      );

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Failed to download: ${errorText}`);
      }

      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `vic_needs_scraping_${new Date().toISOString().split('T')[0]}.csv`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
      console.log('✅ Download complete!');
    } catch (err: any) {
      const errorMsg = `Download error: ${err.message}`;
      setError(errorMsg);
      console.error('❌', errorMsg);
    }
  };

  const downloadHasOperators = async () => {
    try {
      console.log('📥 Downloading has_operators CSV...');
      const response = await fetch(
        `https://${projectId}.supabase.co/functions/v1/make-server-3bba8be8/admin/download-csv/vic_has_operators`,
        {
          method: 'GET',
          headers: {
            'Authorization': `Bearer ${publicAnonKey}`,
          },
        }
      );

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Failed to download: ${errorText}`);
      }

      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `vic_has_operators_${new Date().toISOString().split('T')[0]}.csv`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
      console.log('✅ Download complete!');
    } catch (err: any) {
      const errorMsg = `Download error: ${err.message}`;
      setError(errorMsg);
      console.error('❌', errorMsg);
    }
  };

  const getOperatorCount = (operatorName: string) => {
    if (!stats?.operatorBreakdown) return 0;
    const operator = stats.operatorBreakdown.find((op: any) => op.operator === operatorName);
    return operator?.count || 0;
  };

  const getRealOperatorCount = () => {
    if (!stats) return 0;
    const aberleaCount = getOperatorCount('Aberlea Inc');
    return stats.withOperator - aberleaCount;
  };

  return (
    <div className="space-y-6">
      <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg shadow-lg p-6 border-2 border-blue-300">
        <div className="flex items-center gap-3 mb-4">
          <Search className="size-6 text-blue-600" />
          <div>
            <h2 className="text-2xl font-bold text-blue-900">🔍 VIC Operator Status Dashboard</h2>
            <p className="text-sm text-blue-700">
              Complete breakdown of VIC villages by operator status
            </p>
          </div>
        </div>

        {error && (
          <div className="bg-red-50 border border-red-200 rounded p-3 mb-4 flex items-start gap-2">
            <XCircle className="size-5 text-red-600 flex-shrink-0 mt-0.5" />
            <span className="text-red-800 text-sm">{error}</span>
          </div>
        )}

        <Button
          onClick={checkDatabase}
          disabled={loading}
          className="w-full bg-blue-600 hover:bg-blue-700 text-white"
          size="lg"
        >
          {loading ? '🔍 Checking Database...' : '🔍 Refresh VIC Operator Stats'}
        </Button>
      </div>

      {stats && (
        <div className="bg-white rounded-lg shadow-lg p-6 border-2 border-gray-200">
          <h3 className="text-xl font-bold mb-6">
            📊 VIC Database Statistics
          </h3>
          
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
            <div className="p-4 bg-blue-50 rounded-lg border-2 border-blue-200">
              <div className="text-3xl font-bold text-blue-900">{stats.total}</div>
              <div className="text-sm font-semibold text-blue-700">Total VIC Villages</div>
            </div>
            
            <div className="p-4 bg-red-50 rounded-lg border-2 border-red-300">
              <div className="text-3xl font-bold text-red-900">{stats.withoutOperator}</div>
              <div className="text-sm font-semibold text-red-700">NULL Operators</div>
              <div className="text-xs text-red-600 mt-1">Need scraping</div>
            </div>
            
            <div className="p-4 bg-orange-50 rounded-lg border-2 border-orange-300">
              <div className="text-3xl font-bold text-orange-900">{getOperatorCount('Aberlea Inc')}</div>
              <div className="text-sm font-semibold text-orange-700">Aberlea Inc</div>
              <div className="text-xs text-orange-600 mt-1">Contaminated results</div>
            </div>
            
            <div className="p-4 bg-green-50 rounded-lg border-2 border-green-300">
              <div className="text-3xl font-bold text-green-900">{getRealOperatorCount()}</div>
              <div className="text-sm font-semibold text-green-700">Real Operators</div>
              <div className="text-xs text-green-600 mt-1">Successfully matched</div>
            </div>
          </div>

          <div className="bg-gradient-to-r from-purple-50 to-blue-50 rounded-lg p-4 border-2 border-purple-200 mb-6">
            <h4 className="font-bold text-purple-900 mb-3 text-lg">📈 Summary Breakdown:</h4>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between items-center">
                <span className="text-gray-700">Total VIC villages:</span>
                <span className="font-bold text-gray-900">{stats.total}</span>
              </div>
              <div className="h-px bg-gray-300"></div>
              <div className="flex justify-between items-center">
                <span className="text-red-700">🚫 NULL operators (need scraping):</span>
                <span className="font-bold text-red-900">{stats.withoutOperator}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-orange-700">⚠️ "Aberlea Inc" (false matches):</span>
                <span className="font-bold text-orange-900">{getOperatorCount('Aberlea Inc')}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-green-700">✅ Real operators (correct):</span>
                <span className="font-bold text-green-900">{getRealOperatorCount()}</span>
              </div>
              <div className="h-px bg-gray-300"></div>
              <div className="flex justify-between items-center bg-purple-100 -mx-2 px-2 py-1 rounded">
                <span className="font-semibold text-purple-900">Total with ANY operator:</span>
                <span className="font-bold text-purple-900">{stats.withOperator}</span>
              </div>
            </div>
          </div>

          {stats.operatorBreakdown && stats.operatorBreakdown.length > 0 && (
            <div>
              <h4 className="font-semibold mb-3 text-lg">🏢 Top Operators:</h4>
              <div className="space-y-1 max-h-[400px] overflow-y-auto">
                {stats.operatorBreakdown.slice(0, 30).map((op: any) => (
                  <div
                    key={op.operator}
                    className={`p-3 rounded text-sm flex justify-between items-center ${
                      op.operator.includes('Aberlea') 
                        ? 'bg-orange-50 border-2 border-orange-300' 
                        : 'bg-gray-50 border border-gray-200'
                    }`}
                  >
                    <span className={`${op.operator.includes('Aberlea') ? 'font-bold text-orange-900' : 'text-gray-900'}`}>
                      {op.operator}
                    </span>
                    <span className="font-semibold text-gray-700">{op.count} villages</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {recentlyUpdated.length > 0 && (
        <div className="bg-white rounded-lg shadow-lg p-6 border-2 border-gray-200">
          <h3 className="text-xl font-bold mb-4 flex items-center gap-2">
            <CheckCircle className="size-6 text-green-600" />
            📋 Villages with Operators ({recentlyUpdated.length})
          </h3>
          
          <div className="mb-4 p-3 bg-blue-50 rounded border border-blue-200 text-sm">
            <strong>Note:</strong> Showing up to 100 villages that currently have operators assigned. 
            Orange = Aberlea (likely false match), Green = Real operator
          </div>
          
          <div className="space-y-2 max-h-[600px] overflow-y-auto">
            {recentlyUpdated.map((village) => {
              const hasAberlea = village.operator?.includes('Aberlea');
              
              return (
                <div
                  key={village.id}
                  className={`p-3 rounded border-2 ${
                    hasAberlea
                      ? 'bg-orange-50 border-orange-300'
                      : 'bg-green-50 border-green-300'
                  }`}
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <h4 className="font-semibold text-gray-900">{village.name}</h4>
                      <p className="text-sm text-gray-600">
                        {village.suburb}, VIC {village.postcode}
                      </p>
                      <p className="text-sm mt-1">
                        <span className="text-gray-500">Operator: </span>
                        <span className={`font-medium ${hasAberlea ? 'text-orange-900' : 'text-green-900'}`}>
                          {village.operator || 'None'}
                        </span>
                      </p>
                    </div>
                    {hasAberlea ? (
                      <AlertCircle className="size-5 text-orange-600 flex-shrink-0 ml-2" />
                    ) : (
                      <CheckCircle className="size-5 text-green-600 flex-shrink-0 ml-2" />
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      <div className="bg-gradient-to-r from-green-50 to-emerald-50 rounded-lg shadow-lg p-6 border-2 border-green-300">
        <h3 className="text-xl font-bold mb-4 flex items-center gap-2">
          <Download className="size-6 text-green-600" />
          📥 Export Raw Data to CSV
        </h3>
        
        <div className="mb-4 p-4 bg-yellow-50 rounded-lg border-2 border-yellow-300">
          <p className="font-bold text-yellow-900 mb-2">🔍 INVESTIGATE THE MYSTERY!</p>
          <p className="text-sm text-yellow-800">
            Export all 510 VIC villages to CSV to see the actual database state. 
            This will show you exactly which villages have operators and which don't.
          </p>
        </div>
        
        <Button
          onClick={exportAllVICVillages}
          disabled={exportingAll}
          className="w-full bg-green-600 hover:bg-green-700 text-white"
          size="lg"
        >
          <Download className="size-5 mr-2" />
          {exportingAll ? '📥 Exporting...' : '📥 Export All 510 VIC Villages to CSV'}
        </Button>
        
        <div className="mt-4">
          <Button
            onClick={breakoutAndExport}
            disabled={breakingOut}
            className="w-full bg-purple-600 hover:bg-purple-700 text-white"
            size="lg"
          >
            <Download className="size-5 mr-2" />
            {breakingOut ? '📊 Breaking out...' : '📊 Breakout VIC Villages by Operator Status'}
          </Button>
        </div>
        
        {breakoutStats && (
          <div className="mt-6 p-4 bg-gradient-to-r from-purple-50 to-indigo-50 rounded-lg border-2 border-purple-300">
            <h4 className="font-bold text-purple-900 mb-3">✅ Breakout Complete!</h4>
            <div className="space-y-2 text-sm mb-4">
              <div className="flex justify-between items-center">
                <span className="text-gray-700">Total VIC villages:</span>
                <span className="font-bold text-gray-900">{breakoutStats.total}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-red-700">🚫 Villages needing operators:</span>
                <span className="font-bold text-red-900">{breakoutStats.needsScraping}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-green-700">✅ Villages with operators:</span>
                <span className="font-bold text-green-900">{breakoutStats.hasOperators}</span>
              </div>
            </div>
            
            <div className="space-y-2">
              <Button
                onClick={downloadNeedsScraping}
                className="w-full bg-red-600 hover:bg-red-700 text-white"
                size="sm"
              >
                <Download className="size-4 mr-2" />
                📥 Download vic_needs_scraping.csv ({breakoutStats.needsScraping} villages)
              </Button>
              
              <Button
                onClick={downloadHasOperators}
                className="w-full bg-green-600 hover:bg-green-700 text-white"
                size="sm"
              >
                <Download className="size-4 mr-2" />
                📥 Download vic_has_operators.csv ({breakoutStats.hasOperators} villages)
              </Button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}