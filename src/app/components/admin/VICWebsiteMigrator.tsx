import React, { useState } from 'react';
import { AlertCircle, CheckCircle, Database, ArrowRight } from 'lucide-react';
import { projectId, publicAnonKey } from '../../utils/supabase/info';

export function VICWebsiteMigrator() {
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);

  const handleMigrate = async () => {
    if (!confirm('⚠️ This will copy all scraped_data.website values to the main website field for VIC villages.\n\nAre you sure?')) {
      return;
    }

    setLoading(true);
    setError(null);
    setResult(null);

    try {
      console.log('🔄 Starting website migration...');
      const response = await fetch(
        `https://${projectId}.supabase.co/functions/v1/make-server-3bba8be8/database-health-check/migrate-websites`,
        {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${publicAnonKey}`,
            'Content-Type': 'application/json',
          },
        }
      );

      if (response.ok) {
        const data = await response.json();
        console.log('✅ Migration complete:', data);
        setResult(data);
      } else {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Migration failed');
      }
    } catch (err: any) {
      console.error('Migration error:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-gradient-to-r from-purple-50 to-pink-50 rounded-lg shadow-md p-6 border-2 border-purple-400">
      <h3 className="text-xl font-bold mb-2 flex items-center gap-2">
        <Database className="size-6" />
        🔄 VIC Website Migration Tool
      </h3>
      <p className="text-gray-700 mb-4">
        Copy all scraped websites from <code className="bg-purple-200 px-2 py-1 rounded">scraped_data.website</code> to the main <code className="bg-green-200 px-2 py-1 rounded">website</code> field.
      </p>

      {error && (
        <div className="mb-4 p-4 bg-red-50 border border-red-300 rounded-lg flex items-start gap-2">
          <AlertCircle className="size-5 text-red-600 flex-shrink-0 mt-0.5" />
          <div className="text-red-800 text-sm">{error}</div>
        </div>
      )}

      {result && (
        <div className="mb-4 p-4 bg-green-50 border border-green-300 rounded-lg">
          <div className="flex items-center gap-2 mb-3">
            <CheckCircle className="size-5 text-green-600" />
            <h4 className="font-semibold text-green-900">Migration Complete!</h4>
          </div>
          <div className="space-y-2 text-sm text-green-800">
            <div className="flex items-center gap-2">
              <span className="font-medium">Migrated:</span>
              <span className="font-bold text-lg">{result.migrated}</span>
              <span>villages</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="font-medium">Skipped:</span>
              <span>{result.skipped}</span>
              <span className="text-xs text-gray-600">(already had website)</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="font-medium">No Data:</span>
              <span>{result.noScrapedData}</span>
              <span className="text-xs text-gray-600">(no scraped website)</span>
            </div>
          </div>
        </div>
      )}

      <div className="bg-white p-4 rounded-lg border border-purple-200 mb-4">
        <h4 className="font-semibold mb-2 text-purple-900">What this does:</h4>
        <div className="space-y-2 text-sm">
          <div className="flex items-center gap-2">
            <span className="text-purple-600">1.</span>
            <span>Finds all VIC villages with <code className="bg-purple-100 px-1 rounded">scraped_data.website</code></span>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-purple-600">2.</span>
            <span>Copies the URL to the main <code className="bg-green-100 px-1 rounded">website</code> field</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-purple-600">3.</span>
            <span>Skips villages that already have a website field populated</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-purple-600">4.</span>
            <ArrowRight className="size-4 text-purple-500" />
            <span className="font-semibold text-purple-900">This makes websites visible to all pattern detection tools!</span>
          </div>
        </div>
      </div>

      <button
        onClick={handleMigrate}
        disabled={loading}
        className="w-full px-6 py-3 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-lg font-semibold hover:from-purple-700 hover:to-pink-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
      >
        {loading ? '⏳ Migrating...' : '🚀 Migrate Websites from scraped_data → website field'}
      </button>

      <div className="mt-4 p-3 bg-yellow-50 border border-yellow-300 rounded-lg text-sm text-yellow-800">
        <strong>⚠️ Safe Operation:</strong> This only copies data that doesn't exist in the website field yet. It won't overwrite existing websites.
      </div>
    </div>
  );
}
