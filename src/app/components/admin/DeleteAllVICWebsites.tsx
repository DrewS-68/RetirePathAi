import { useState, useRef, useEffect } from 'react';
import { Trash2 } from 'lucide-react';
import { projectId, publicAnonKey } from '../../utils/supabase/info';

export function DeleteAllVICWebsites() {
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<{ cleared: number } | null>(null);
  const abortControllerRef = useRef<AbortController | null>(null);
  const isMountedRef = useRef(true);

  // Cleanup on unmount
  useEffect(() => {
    isMountedRef.current = true;
    
    return () => {
      isMountedRef.current = false;
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }
    };
  }, []);

  const handleDelete = async () => {
    if (!isMountedRef.current) return;
    
    if (!confirm('⚠️ This will DELETE ALL website URLs from ALL 510 VIC villages. Are you ABSOLUTELY SURE?')) {
      return;
    }

    // Cancel any existing request
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }

    // Create new abort controller for this request
    abortControllerRef.current = new AbortController();

    setLoading(true);
    setResult(null);

    try {
      const response = await fetch(
        `https://${projectId}.supabase.co/functions/v1/make-server-3bba8be8/admin/delete-all-vic-websites`,
        {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${publicAnonKey}`,
            'Content-Type': 'application/json'
          },
          signal: abortControllerRef.current.signal
        }
      );

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();

      if (data.error) {
        throw new Error(data.error);
      }

      // Only update state if component is still mounted
      if (!isMountedRef.current) return;

      setResult(data);
      alert(`✅ Successfully cleared ${data.cleared} website URLs!`);
    } catch (error: any) {
      // Ignore abort errors
      if (error.name === 'AbortError') {
        console.log('Request was aborted');
        return;
      }
      
      if (!isMountedRef.current) return;
      
      console.error('Error deleting websites:', error);
      alert(`Error: ${error.message || error}`);
    } finally {
      if (isMountedRef.current) {
        setLoading(false);
        abortControllerRef.current = null;
      }
    }
  };

  return (
    <div className="bg-red-50 border-2 border-red-300 p-6 rounded-lg shadow">
      <div className="flex items-center gap-2 mb-4">
        <Trash2 className="w-5 h-5 text-red-600" />
        <h2 className="text-xl font-bold text-red-900">Delete All VIC Websites</h2>
      </div>

      <p className="text-sm text-red-800 mb-4">
        <strong>⚠️ WARNING:</strong> This will permanently delete ALL website URLs from ALL VIC villages. 
        The bad aggregator URLs will be removed, and you'll have a clean slate for proper URL scraping.
      </p>

      {result && (
        <div className="mb-4 p-3 bg-green-100 border border-green-400 rounded">
          <p className="text-green-900 font-semibold">
            ✅ Successfully cleared {result.cleared} website URLs
          </p>
        </div>
      )}

      <button
        onClick={handleDelete}
        disabled={loading}
        className="px-6 py-3 bg-red-600 text-white rounded-lg hover:bg-red-700 disabled:bg-gray-300 disabled:cursor-not-allowed font-semibold flex items-center gap-2"
      >
        <Trash2 className="w-4 h-4" />
        {loading ? 'Deleting...' : 'Delete All VIC Website URLs'}
      </button>
    </div>
  );
}