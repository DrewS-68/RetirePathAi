import { useState } from 'react';
import { Button } from './ui/button';
import { Card } from './ui/card';
import { projectId, publicAnonKey } from '../utils/supabase/info';
import { AlertCircle, CheckCircle, Loader2 } from 'lucide-react';

/**
 * Fix Duplicate Images Component
 * 
 * Problem: UUID-based matching assigned the same image URL to multiple villages
 * Solution: Remove duplicate images, keeping only unique ones
 */
export function FixDuplicateImages() {
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);

  const fixDuplicates = async () => {
    try {
      setLoading(true);
      setError(null);
      setResult(null);

      console.log('🔧 FIXING DUPLICATE IMAGES...');

      // Call the backend API to fix duplicates
      const response = await fetch(
        `https://${projectId}.supabase.co/functions/v1/make-server-3bba8be8/fix-duplicate-images`,
        {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${publicAnonKey}`,
            'Content-Type': 'application/json',
          },
        }
      );

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ error: 'Failed to parse error response' }));
        throw new Error(errorData.error || `Server returned ${response.status}`);
      }

      const data = await response.json();
      console.log('🎉 DUPLICATE FIX COMPLETE:', data);
      setResult(data);

    } catch (err) {
      console.error('❌ Error fixing duplicates:', err);
      setError(err instanceof Error ? err.message : 'Failed to fix duplicates');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card className="p-6 max-w-4xl mx-auto">
      <div className="mb-6">
        <h2 className="mb-2">🔧 Fix Duplicate Images</h2>
        <p className="text-muted-foreground">
          Remove duplicate image URLs that are shared across multiple villages.
          Each image will be kept for the first village only.
        </p>
      </div>

      {error && (
        <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg flex items-start gap-3">
          <AlertCircle className="size-5 text-red-600 mt-0.5" />
          <div>
            <p className="font-medium text-red-900">Error</p>
            <p className="text-sm text-red-700">{error}</p>
          </div>
        </div>
      )}

      {result && (
        <div className="mb-6 space-y-4">
          <div className="p-4 bg-green-50 border border-green-200 rounded-lg flex items-start gap-3">
            <CheckCircle className="size-5 text-green-600 mt-0.5" />
            <div className="flex-1">
              <p className="font-medium text-green-900 mb-2">Fix Complete!</p>
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <p className="text-muted-foreground">Total Villages:</p>
                  <p className="text-lg">{result.totalVillages}</p>
                </div>
                <div>
                  <p className="text-muted-foreground">Villages with Images:</p>
                  <p className="text-lg">{result.villagesWithImages}</p>
                </div>
                <div>
                  <p className="text-muted-foreground">Duplicate URLs Found:</p>
                  <p className="text-lg text-yellow-600">{result.duplicateUrls}</p>
                </div>
                <div>
                  <p className="text-muted-foreground">Villages Updated:</p>
                  <p className="text-lg text-green-600">{result.villagesUpdated}</p>
                </div>
              </div>
            </div>
          </div>

          {result.duplicateExamples && result.duplicateExamples.length > 0 && (
            <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
              <p className="font-medium mb-3">Duplicate Examples:</p>
              <div className="space-y-3">
                {result.duplicateExamples.map((example: any, index: number) => (
                  <div key={index} className="text-sm">
                    <p className="font-mono text-xs text-muted-foreground mb-1 break-all">
                      {example.url}
                    </p>
                    <p>
                      <span className="text-orange-600">Used by {example.affectedVillages} villages:</span>{' '}
                      {example.villages}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      <Button
        onClick={fixDuplicates}
        disabled={loading}
        size="lg"
        className="w-full"
      >
        {loading ? (
          <>
            <Loader2 className="size-4 mr-2 animate-spin" />
            Fixing Duplicates...
          </>
        ) : (
          <>
            🔧 Fix Duplicate Images
          </>
        )}
      </Button>

      <div className="mt-4 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
        <p className="text-sm text-yellow-900">
          <strong>⚠️ What this does:</strong>
        </p>
        <ul className="text-sm text-yellow-800 mt-2 space-y-1 list-disc list-inside">
          <li>Finds all image URLs used by multiple villages</li>
          <li>Keeps each image for the FIRST village only</li>
          <li>Removes the duplicate from all other villages</li>
          <li>Updates the database immediately</li>
        </ul>
      </div>
    </Card>
  );
}