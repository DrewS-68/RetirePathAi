import React, { useState } from 'react';
import { Card } from '../ui/card';
import { Button } from '../ui/button';
import { Trash2, AlertTriangle } from 'lucide-react';
import { Alert, AlertDescription } from '../ui/alert';
import { projectId, publicAnonKey } from '../../utils/supabase/info';

export function VICVillageServerDeleter() {
  const [deleting, setDeleting] = useState(false);
  const [result, setResult] = useState<{ count: number; success: boolean; message?: string } | null>(null);

  const deleteViaServer = async () => {
    const confirmed = confirm(
      `🚨 SERVER-SIDE DELETE ALL VIC VILLAGES 🚨\n\n` +
      `This will use the backend server with FULL PERMISSIONS to delete all VIC villages.\n\n` +
      `This bypasses any Row Level Security policies.\n\n` +
      `Are you ABSOLUTELY SURE?`
    );

    if (!confirmed) return;

    const doubleConfirmed = confirm(
      `⚠️ FINAL WARNING ⚠️\n\n` +
      `You are about to PERMANENTLY delete ALL VIC villages.\n\n` +
      `Click OK to proceed.\n` +
      `Click Cancel to abort.`
    );

    if (!doubleConfirmed) return;

    setDeleting(true);
    setResult(null);

    try {
      console.log('🗑️ Calling server to delete VIC villages...');

      const response = await fetch(
        `https://${projectId}.supabase.co/functions/v1/make-server-3bba8be8/admin/delete-vic-villages`,
        {
          method: 'DELETE',
          headers: {
            'Authorization': `Bearer ${publicAnonKey}`,
            'Content-Type': 'application/json',
          },
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || `Server error: ${response.status}`);
      }

      console.log('✅ Server response:', data);

      setResult({
        count: data.deletedCount || 0,
        success: true,
        message: data.message
      });

      alert(
        `✅ SUCCESS!\n\n` +
        `Deleted ${data.deletedCount || 0} VIC villages via server.\n\n` +
        `${data.message || ''}`
      );

    } catch (err) {
      console.error('❌ Server delete error:', err);
      const errorMsg = err instanceof Error ? err.message : 'Unknown error';
      
      setResult({
        count: 0,
        success: false,
        message: errorMsg
      });

      alert(`❌ Error: ${errorMsg}`);
    } finally {
      setDeleting(false);
    }
  };

  return (
    <Card className="p-6 bg-gradient-to-r from-red-50 to-orange-50 border-2 border-red-400">
      <h2 className="text-2xl font-bold mb-2 text-red-900 flex items-center gap-2">
        <Trash2 className="size-6" />
        🚀 VIC Village Server Deleter
      </h2>
      <p className="text-sm text-red-700 mb-4">
        Delete ALL VIC villages using server-side permissions (bypasses RLS)
      </p>

      <Alert className="mb-4 bg-yellow-50 border-yellow-400">
        <AlertTriangle className="size-4" />
        <AlertDescription>
          <strong>⚠️ Warning:</strong> This uses the backend server with FULL database permissions.
          It will delete ALL villages with state='VIC' regardless of Row Level Security policies.
        </AlertDescription>
      </Alert>

      <Button
        onClick={deleteViaServer}
        disabled={deleting}
        className="bg-red-600 hover:bg-red-700"
      >
        {deleting ? 'Deleting via Server...' : '🗑️ Delete ALL VIC Villages (Server)'}
      </Button>

      {result && (
        <Alert className={`mt-4 ${result.success ? 'bg-green-50 border-green-400' : 'bg-red-50 border-red-400'}`}>
          <AlertDescription>
            <div className="space-y-2">
              <h3 className="font-bold">
                {result.success ? '✅ Success!' : '❌ Failed'}
              </h3>
              <p><strong>Villages Deleted:</strong> {result.count}</p>
              {result.message && <p className="text-sm">{result.message}</p>}
            </div>
          </AlertDescription>
        </Alert>
      )}
    </Card>
  );
}
