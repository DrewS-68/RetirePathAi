import React, { useState } from 'react';
import { Card } from '../ui/card';
import { Button } from '../ui/button';
import { Search, Loader2 } from 'lucide-react';
import { projectId, publicAnonKey } from '../../utils/supabase/info';

interface Village {
  id: string;
  name: string;
  operator: string | null;
  suburb: string | null;
  postcode: string | null;
  website: string | null;
  description: string | null;
  updated_at: string;
}

export function VICOperatorFieldInspector() {
  const [loading, setLoading] = useState(false);
  const [villages, setVillages] = useState<Village[]>([]);

  const inspectVillages = async () => {
    setLoading(true);

    try {
      const response = await fetch(
        `https://${projectId}.supabase.co/functions/v1/make-server-3bba8be8/admin/vic-villages/inspect-fields`,
        {
          method: 'GET',
          headers: {
            'Authorization': `Bearer ${publicAnonKey}`,
          },
        }
      );

      if (!response.ok) {
        throw new Error(`Request failed: ${response.status}`);
      }

      const data = await response.json();
      setVillages(data.villages || []);

    } catch (err: any) {
      console.error('Error:', err);
      alert(`Error: ${err.message}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card className="p-6 bg-gradient-to-r from-purple-50 to-pink-50 border-2 border-purple-400">
      <h2 className="text-2xl font-bold mb-2 text-purple-900 flex items-center gap-2">
        <Search className="size-6" />
        🔍 VIC Field Inspector
      </h2>
      <p className="text-sm text-purple-700 mb-4">
        Inspect ALL fields in the database to see what's actually there
      </p>

      <Button
        onClick={inspectVillages}
        disabled={loading}
        className="bg-purple-600 hover:bg-purple-700 text-white mb-4"
      >
        {loading ? (
          <>
            <Loader2 className="size-4 mr-2 animate-spin" />
            Loading...
          </>
        ) : (
          <>
            <Search className="size-4 mr-2" />
            Inspect All VIC Villages
          </>
        )}
      </Button>

      {villages.length > 0 && (
        <div className="space-y-2">
          <div className="bg-white p-4 rounded border">
            <h3 className="font-bold mb-2">Found {villages.length} villages</h3>
            <div className="text-xs space-y-1">
              <div>Villages with operator: {villages.filter(v => v.operator && v.operator !== '').length}</div>
              <div>Villages with suburb: {villages.filter(v => v.suburb && v.suburb !== '').length}</div>
              <div>Villages with website: {villages.filter(v => v.website && v.website !== '').length}</div>
            </div>
          </div>

          <div className="max-h-96 overflow-y-auto space-y-2">
            {villages.slice(0, 10).map(v => (
              <div key={v.id} className="bg-white p-3 rounded border text-xs">
                <div className="font-bold text-purple-900">{v.name}</div>
                <div className="mt-2 space-y-1 text-gray-700">
                  <div><strong>Operator:</strong> {v.operator || '(empty)'}</div>
                  <div><strong>Suburb:</strong> {v.suburb || '(empty)'}</div>
                  <div><strong>Postcode:</strong> {v.postcode || '(empty)'}</div>
                  <div><strong>Website:</strong> {v.website ? v.website.substring(0, 50) : '(empty)'}</div>
                  <div><strong>Description:</strong> {v.description ? v.description.substring(0, 60) : '(empty)'}</div>
                  <div><strong>Updated:</strong> {new Date(v.updated_at).toLocaleString()}</div>
                  <div className="text-purple-600">
                    <strong>Last updated:</strong> {Math.floor((Date.now() - new Date(v.updated_at).getTime()) / 60000)} minutes ago
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </Card>
  );
}