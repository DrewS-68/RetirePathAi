import React, { useState } from 'react';
import { Trash2, AlertTriangle } from 'lucide-react';
import { projectId, publicAnonKey } from '../../utils/supabase/info';
import { useAuth } from '../../contexts/AuthContext';

/**
 * Quick tool to delete the bad aggregator website from "2 Manningtree Road"
 */
export function DeleteBadWebsite() {
  const { accessToken } = useAuth();
  const [deleting, setDeleting] = useState(false);
  const [result, setResult] = useState<string | null>(null);

  const deleteBadWebsite = async () => {
    if (!confirm('Delete the aggregator website from "2 Manningtree Road"? This will set its website field to NULL.')) {
      return;
    }

    setDeleting(true);
    setResult(null);

    try {
      // Call backend to clear the bad website
      const response = await fetch(
        `https://${projectId}.supabase.co/functions/v1/make-server-3bba8be8/scraper/delete-bad-website`,
        {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${accessToken || publicAnonKey}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            villageName: '2 Manningtree Road',
            state: 'VIC'
          })
        }
      );

      if (!response.ok) {
        throw new Error(`Failed: ${response.status}`);
      }

      const data = await response.json();
      setResult(`✅ Success! Cleared website from "${data.villageName}". Previous website was: ${data.previousWebsite}`);

    } catch (error) {
      console.error('Error deleting bad website:', error);
      setResult(`❌ Failed: ${error}`);
    } finally {
      setDeleting(false);
    }
  };

  return (
    <div className="bg-white p-6 rounded-lg shadow-sm border border-red-200">
      <div className="flex items-center gap-2 mb-4">
        <Trash2 className="size-5 text-red-600" />
        <h3 className="text-lg font-semibold">Delete Bad Aggregator Website</h3>
      </div>

      <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-4">
        <p className="text-sm text-red-800">
          <strong>⚠️ This will delete the aggregator website</strong> from "2 Manningtree Road" (the one that got agedcareonline.com.au).
          We'll start fresh with the fixed blacklist.
        </p>
      </div>

      <button
        onClick={deleteBadWebsite}
        disabled={deleting}
        className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-red-600 text-white rounded-lg hover:bg-red-700 disabled:bg-gray-400 mb-4"
      >
        {deleting ? (
          <>
            <Trash2 className="size-4 animate-spin" />
            Deleting...
          </>
        ) : (
          <>
            <Trash2 className="size-4" />
            Delete Bad Website
          </>
        )}
      </button>

      {result && (
        <div className={`p-4 rounded-lg border ${result.startsWith('✅') ? 'bg-green-50 border-green-200' : 'bg-red-50 border-red-200'}`}>
          <p className="text-sm font-mono">{result}</p>
        </div>
      )}
    </div>
  );
}
