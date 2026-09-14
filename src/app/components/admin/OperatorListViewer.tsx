import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';
import { Loader2, Trash2, Download } from 'lucide-react';
import { projectId, publicAnonKey } from '../../utils/supabase/info';

export function OperatorListViewer() {
  const [operators, setOperators] = useState<Array<{ name: string; count: number }>>([]);
  const [loading, setLoading] = useState(false);
  const [exporting, setExporting] = useState(false);
  const [restoring, setRestoring] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const loadOperators = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await fetch(
        `https://${projectId}.supabase.co/functions/v1/make-server-3bba8be8/admin/all-operators`,
        {
          headers: {
            Authorization: `Bearer ${publicAnonKey}`,
          },
        }
      );
      
      if (!response.ok) {
        console.log(`[OPERATOR LIST] Endpoint not available (${response.status})`);
        setError('Endpoint not available. This feature requires server configuration.');
        return;
      }
      
      const data = await response.json();
      console.log('All operators:', data);
      if (data.operators) {
        setOperators(data.operators);
      }
    } catch (error) {
      console.error('Error loading operators:', error);
      setError('Failed to load operators. Check console for details.');
    } finally {
      setLoading(false);
    }
  };

  // DISABLED: Don't load on mount to prevent 404 errors
  // Uncomment if you need this feature and the endpoint is created
  // useEffect(() => {
  //   loadOperators();
  // }, []);

  const clearOperator = async (operatorName: string) => {
    try {
      const response = await fetch(
        `https://${projectId}.supabase.co/functions/v1/make-server-3bba8be8/admin/bulk-clear-operator`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${publicAnonKey}`,
          },
          body: JSON.stringify({ operatorName }),
        }
      );
      const data = await response.json();
      alert(`Cleared ${data.cleared} villages with operator "${operatorName}"`);
      loadOperators(); // Reload list
    } catch (error) {
      console.error('Error clearing operator:', error);
    }
  };

  const exportReconciliationCSV = async () => {
    setExporting(true);
    try {
      const response = await fetch(
        `https://${projectId}.supabase.co/functions/v1/make-server-3bba8be8/admin/export-vic-reconciliation`,
        {
          headers: {
            Authorization: `Bearer ${publicAnonKey}`,
          },
        }
      );
      const data = await response.json();
      
      if (data.success && data.villages) {
        // Create CSV content with the actual fields from database
        const csvRows = [
          ['Village Name', 'Suburb', 'Postcode', 'Matched Operator', 'Street Address'],
          ...data.villages.map((v: any) => [
            v.name || '',
            v.suburb || '',
            v.postcode || '',
            v.operator || '', // This is the "Matched Operator" column where Aberlea would appear
            v.street_address || ''
          ])
        ];
        
        // Escape fields that contain commas
        const csvContent = csvRows.map(row => 
          row.map(field => {
            const str = String(field);
            return str.includes(',') || str.includes('"') || str.includes('\n')
              ? `"${str.replace(/"/g, '""')}"` 
              : str;
          }).join(',')
        ).join('\n');
        
        // Create blob and download
        const blob = new Blob([csvContent], { type: 'text/csv' });
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `vic-reconciliation-${new Date().toISOString().slice(0, 10)}.csv`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        window.URL.revokeObjectURL(url);
        
        alert(`Exported ${data.villages.length} VIC villages to CSV`);
      } else {
        alert('Failed to export: ' + (data.error || 'Unknown error'));
      }
    } catch (error) {
      console.error('Error exporting reconciliation CSV:', error);
      alert('Error exporting CSV');
    } finally {
      setExporting(false);
    }
  };

  const restoreOperatorsFromCSV = async () => {
    if (!confirm('This will restore operators from /imports/village-data.csv (only 100% matches, excluding Aberlea). Continue?')) {
      return;
    }

    setRestoring(true);
    try {
      // Fetch the CSV file
      const csvResponse = await fetch('/imports/village-data.csv');
      const csvText = await csvResponse.text();
      
      console.log(`Fetched CSV, length: ${csvText.length}`);
      
      // Send raw CSV to server for parsing (v3 endpoint with proper tab-delimited parsing)
      const response = await fetch(
        `https://${projectId}.supabase.co/functions/v1/make-server-3bba8be8/admin/restore-operators-v3`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${publicAnonKey}`,
          },
          body: JSON.stringify({ csvContent: csvText }),
        }
      );
      
      const data = await response.json();
      
      if (data.success) {
        alert(`✅ Restored ${data.restored} operators out of ${data.totalInCSV} candidates in CSV!`);
        console.log('Restored villages:', data.restoredList);
        loadOperators(); // Reload the list
      } else {
        alert('Failed to restore: ' + (data.error || 'Unknown error'));
      }
    } catch (error) {
      console.error('Error restoring operators:', error);
      alert('Error restoring operators from CSV');
    } finally {
      setRestoring(false);
    }
  };

  const showUnmatchedVillages = async () => {
    try {
      const response = await fetch(
        `https://${projectId}.supabase.co/functions/v1/make-server-3bba8be8/admin/unmatched-villages`,
        {
          headers: {
            Authorization: `Bearer ${publicAnonKey}`,
          },
        }
      );
      
      const data = await response.json();
      
      if (data.success) {
        console.log('Unmatched villages:', data.villages);
        
        // Show first 20 in alert
        const sample = data.villages.slice(0, 20).map((v: any) => 
          `${v.name} (${v.suburb}, ${v.postcode})`
        ).join('\n');
        
        alert(`Found ${data.count} unmatched villages:\n\n${sample}\n\n(Full list in console)`);
      } else {
        alert('Failed to load unmatched villages: ' + (data.error || 'Unknown error'));
      }
    } catch (error) {
      console.error('Error loading unmatched villages:', error);
      alert('Error loading unmatched villages');
    }
  };

  const diagnoseRestore = async () => {
    setRestoring(true);
    try {
      // Fetch the CSV file
      const csvResponse = await fetch('/imports/village-data.csv');
      const csvText = await csvResponse.text();
      
      console.log(`Fetched CSV for diagnosis, length: ${csvText.length}`);
      
      // Send to diagnostic endpoint
      const response = await fetch(
        `https://${projectId}.supabase.co/functions/v1/make-server-3bba8be8/admin/diagnose-restore`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${publicAnonKey}`,
          },
          body: JSON.stringify({ csvContent: csvText }),
        }
      );
      
      const data = await response.json();
      
      if (data.success) {
        console.log('DIAGNOSIS RESULTS:', data);
        console.log('Sample lines from CSV:', data.sampleLines);
        console.log('Sample candidates:', data.sampleCandidates);
        
        alert(
          `📊 RESTORE DIAGNOSIS\n\n` +
          `Current unmatched: ${data.currentUnmatched}\n` +
          `CSV total lines: ${data.csvTotalLines}\n` +
          `CSV candidates (100%, not Aberlea): ${data.csvCandidates}\n\n` +
          `Check console for detailed CSV parsing info`
        );
      } else {
        alert('Failed to diagnose: ' + (data.error || 'Unknown error'));
      }
    } catch (error) {
      console.error('Error diagnosing restore:', error);
      alert('Error diagnosing restore');
    } finally {
      setRestoring(false);
    }
  };

  const exportAllVicVillages = async () => {
    setExporting(true);
    try {
      const response = await fetch(
        `https://${projectId}.supabase.co/functions/v1/make-server-3bba8be8/admin/export-all-vic-villages`,
        {
          headers: {
            Authorization: `Bearer ${publicAnonKey}`,
          },
        }
      );
      const data = await response.json();
      
      if (data.success && data.villages) {
        // Create CSV content
        const csvRows = [
          ['Village Name', 'Suburb', 'Postcode', 'Operator', 'Street Address'],
          ...data.villages.map((v: any) => [
            v.name || '',
            v.suburb || '',
            v.postcode || '',
            v.operator || 'NULL',
            v.street_address || ''
          ])
        ];
        
        // Escape fields that contain commas
        const csvContent = csvRows.map(row => 
          row.map(field => {
            const str = String(field);
            return str.includes(',') || str.includes('"') || str.includes('\n')
              ? `"${str.replace(/"/g, '""')}"` 
              : str;
          }).join(',')
        ).join('\n');
        
        // Create blob and download
        const blob = new Blob([csvContent], { type: 'text/csv' });
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `all-vic-villages-${new Date().toISOString().slice(0, 10)}.csv`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        window.URL.revokeObjectURL(url);
        
        // Count villages with operators
        const withOperators = data.villages.filter((v: any) => v.operator).length;
        const withoutOperators = data.villages.filter((v: any) => !v.operator).length;
        
        alert(
          `✅ Exported ${data.total} VIC villages!\n\n` +
          `With operators: ${withOperators}\n` +
          `Without operators: ${withoutOperators}`
        );
      } else {
        alert('Failed to export: ' + (data.error || 'Unknown error'));
      }
    } catch (error) {
      console.error('Error exporting all VIC villages:', error);
      alert('Error exporting villages');
    } finally {
      setExporting(false);
    }
  };

  const exportUnmatchedVillages = async () => {
    setExporting(true);
    try {
      const response = await fetch(
        `https://${projectId}.supabase.co/functions/v1/make-server-3bba8be8/admin/export-unmatched-vic-villages`,
        {
          headers: {
            Authorization: `Bearer ${publicAnonKey}`,
          },
        }
      );
      const data = await response.json();
      
      if (data.success && data.villages) {
        // Create CSV content
        const csvRows = [
          ['Village Name', 'Suburb', 'Postcode', 'Operator', 'Street Address'],
          ...data.villages.map((v: any) => [
            v.name || '',
            v.suburb || '',
            v.postcode || '',
            v.operator || 'NULL',
            v.street_address || ''
          ])
        ];
        
        // Escape fields that contain commas
        const csvContent = csvRows.map(row => 
          row.map(field => {
            const str = String(field);
            return str.includes(',') || str.includes('"') || str.includes('\n')
              ? `"${str.replace(/"/g, '""')}"` 
              : str;
          }).join(',')
        ).join('\n');
        
        // Create blob and download
        const blob = new Blob([csvContent], { type: 'text/csv' });
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `unmatched-vic-villages-${new Date().toISOString().slice(0, 10)}.csv`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        window.URL.revokeObjectURL(url);
        
        alert(
          `✅ Exported ${data.total} unmatched VIC villages!\n\n` +
          `Check console for details`
        );
      } else {
        alert('Failed to export: ' + (data.error || 'Unknown error'));
      }
    } catch (error) {
      console.error('Error exporting unmatched VIC villages:', error);
      alert('Error exporting villages');
    } finally {
      setExporting(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle>All VIC Operators ({operators.length})</CardTitle>
          <div className="flex gap-2">
            <Button
              size="sm"
              variant="outline"
              onClick={loadOperators}
              disabled={loading}
            >
              {loading ? <Loader2 className="w-3 h-3 animate-spin" /> : 'Refresh'}
            </Button>
            <Button
              size="sm"
              variant="outline"
              onClick={exportReconciliationCSV}
              disabled={exporting}
            >
              {exporting ? (
                <><Loader2 className="w-3 h-3 mr-1 animate-spin" /> Exporting...</>
              ) : (
                <><Download className="w-3 h-3 mr-1" /> Export Reconciliation CSV</>
              )}
            </Button>
            <Button
              size="sm"
              variant="outline"
              onClick={restoreOperatorsFromCSV}
              disabled={restoring}
            >
              {restoring ? (
                <><Loader2 className="w-3 h-3 mr-1 animate-spin" /> Restoring...</>
              ) : (
                <><Download className="w-3 h-3 mr-1" /> Restore from CSV</>
              )}
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {loading ? (
          <Loader2 className="w-6 h-6 animate-spin" />
        ) : (
          <div className="space-y-1 max-h-96 overflow-y-auto">
            {operators.map((op) => (
              <div key={op.name} className="flex items-center justify-between p-2 border-b text-sm">
                <span>
                  <strong>{op.name}</strong> ({op.count} villages)
                </span>
                <Button
                  size="sm"
                  variant="destructive"
                  onClick={() => clearOperator(op.name)}
                >
                  <Trash2 className="w-3 h-3 mr-1" />
                  Clear
                </Button>
              </div>
            ))}
          </div>
        )}
        {error && <p className="text-red-500 mt-2">{error}</p>}
        
        {/* Show unmatched villages */}
        <div className="mt-6 pt-4 border-t">
          <h3 className="font-semibold mb-2">🔍 Diagnosis</h3>
          <p className="text-sm text-gray-600 mb-2">
            <strong>108 villages</strong> currently have no operator assigned (NULL).
          </p>
          <p className="text-sm text-yellow-700 bg-yellow-50 p-2 rounded mb-3">
            ⚠️ <strong>Likely cause:</strong> The 87 MATCHED operators from your CSV were never imported initially.
            Use the "Import Missing Operators" tool to complete the import.
          </p>
          <div className="flex gap-2">
            <Button
              size="sm"
              variant="outline"
              onClick={diagnoseRestore}
              disabled={restoring}
            >
              {restoring ? (
                <><Loader2 className="w-3 h-3 mr-1 animate-spin" /> Diagnosing...</>
              ) : (
                'Diagnose CSV Restore'
              )}
            </Button>
            <Button
              size="sm"
              variant="outline"
              onClick={showUnmatchedVillages}
            >
              Show Unmatched Villages
            </Button>
          </div>
        </div>
        
        {/* Export all VIC villages */}
        <div className="mt-6 pt-4 border-t">
          <h3 className="font-semibold mb-2">📊 Export Data</h3>
          <p className="text-sm text-gray-600 mb-2">
            Export all VIC villages with their current operator assignments.
          </p>
          <div className="flex gap-2">
            <Button
              size="sm"
              variant="outline"
              onClick={exportAllVicVillages}
              disabled={exporting}
            >
              {exporting ? (
                <><Loader2 className="w-3 h-3 mr-1 animate-spin" /> Exporting...</>
              ) : (
                <><Download className="w-3 h-3 mr-1" /> Export All VIC Villages</>
              )}
            </Button>
            <Button
              size="sm"
              variant="outline"
              onClick={exportUnmatchedVillages}
              disabled={exporting}
            >
              {exporting ? (
                <><Loader2 className="w-3 h-3 mr-1 animate-spin" /> Exporting...</>
              ) : (
                <><Download className="w-3 h-3 mr-1" /> Export 108 Unmatched Villages</>
              )}
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}