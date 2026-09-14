import { useState } from 'react';
import { Button } from './ui/button';
import { Card } from './ui/card';
import { projectId, publicAnonKey } from '../utils/supabase/info';
import { Link, CheckCircle2, XCircle, Loader2, Database, ImagePlus } from 'lucide-react';

interface LinkResult {
  villageId: string;
  success: boolean;
  imageCount?: number;
  previousCount?: number;
  error?: string;
}

export function LinkImagesToDatabase() {
  const [linking, setLinking] = useState(false);
  const [progress, setProgress] = useState({ current: 0, total: 0 });
  const [results, setResults] = useState<LinkResult[]>([]);
  const [error, setError] = useState<string>('');
  const [scanResults, setScanResults] = useState<any>(null);

  const scanStorage = async () => {
    try {
      setError('');
      setLinking(true);
      setResults([]);
      setScanResults(null);

      console.log('🔍 Scanning Supabase Storage for images...');

      const response = await fetch(
        `https://${projectId}.supabase.co/functions/v1/make-server-3bba8be8/storage/scan-images`,
        {
          method: 'GET',
          headers: {
            'Authorization': `Bearer ${publicAnonKey}`,
            'Content-Type': 'application/json'
          }
        }
      );

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || `HTTP ${response.status}`);
      }

      const data = await response.json();
      setScanResults(data);

      console.log(`✅ Found ${data.villageCount} villages with images`);

      return data;
    } catch (err: any) {
      console.error('Error scanning storage:', err);
      setError(err.message || 'Failed to scan storage');
      setLinking(false);
      return null;
    }
  };

  const linkImages = async () => {
    try {
      setError('');
      setLinking(true);
      setResults([]);

      // First scan storage
      const scanData = await scanStorage();
      if (!scanData || !scanData.villages) {
        throw new Error('No images found in storage');
      }

      const villages = scanData.villages;
      setProgress({ current: 0, total: villages.length });

      console.log(`🔗 Linking ${villages.length} villages to database...`);

      const linkResults: LinkResult[] = [];

      // Process in batches of 10
      const batchSize = 10;
      for (let i = 0; i < villages.length; i += batchSize) {
        const batch = villages.slice(i, i + batchSize);

        const batchPromises = batch.map(async (village: any) => {
          try {
            const response = await fetch(
              `https://${projectId}.supabase.co/functions/v1/make-server-3bba8be8/storage/link-village-images`,
              {
                method: 'POST',
                headers: {
                  'Authorization': `Bearer ${publicAnonKey}`,
                  'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                  villageId: village.villageId,
                  imageUrls: village.images
                })
              }
            );

            if (!response.ok) {
              const errorData = await response.json();
              throw new Error(errorData.error || `HTTP ${response.status}`);
            }

            const data = await response.json();

            setProgress(prev => ({ ...prev, current: prev.current + 1 }));

            return {
              villageId: village.villageId,
              success: true,
              imageCount: data.newCount,
              previousCount: data.previousCount
            };
          } catch (err: any) {
            console.error(`Error linking ${village.villageId}:`, err);

            setProgress(prev => ({ ...prev, current: prev.current + 1 }));

            return {
              villageId: village.villageId,
              success: false,
              error: err.message
            };
          }
        });

        const batchResults = await Promise.all(batchPromises);
        linkResults.push(...batchResults);

        // Update results after each batch
        setResults([...linkResults]);

        // Small delay between batches
        if (i + batchSize < villages.length) {
          await new Promise(resolve => setTimeout(resolve, 300));
        }
      }

      const successCount = linkResults.filter(r => r.success).length;
      const failCount = linkResults.filter(r => !r.success).length;

      console.log(`✅ Linking complete: ${successCount} success, ${failCount} failed`);

    } catch (err: any) {
      console.error('Error linking images:', err);
      setError(err.message || 'Failed to link images');
    } finally {
      setLinking(false);
    }
  };

  const successCount = results.filter(r => r.success).length;
  const failCount = results.filter(r => !r.success).length;
  const progressPercent = progress.total > 0 ? (progress.current / progress.total) * 100 : 0;

  return (
    <div className="max-w-4xl mx-auto">
      <div className="mb-8">
        <h1 className="text-4xl mb-2">🔗 Link Images to Database</h1>
        <p className="text-muted-foreground">
          Connect uploaded images (named by UUID) to village records in your database
        </p>
      </div>

      {/* Main Action Card */}
      <Card className="p-6 mb-6">
        <div className="flex items-center gap-3 mb-6">
          <Database className="size-8 text-blue-600" />
          <div>
            <h2 className="text-2xl">Link Storage Images to Villages</h2>
            <p className="text-sm text-muted-foreground">
              This will scan Supabase Storage and match UUIDs to village records
            </p>
          </div>
        </div>

        <div className="space-y-4">
          {/* Action Button */}
          <Button
            onClick={linkImages}
            disabled={linking}
            size="lg"
            className="w-full"
          >
            {linking ? (
              <Loader2 className="size-5 mr-2 animate-spin" />
            ) : (
              <Link className="size-5 mr-2" />
            )}
            {linking ? 'Linking Images...' : 'Start Linking Process'}
          </Button>

          {/* Scan Results Preview */}
          {scanResults && !results.length && (
            <div className="p-4 rounded-lg bg-blue-50 border border-blue-200">
              <div className="flex items-center gap-2 mb-2">
                <ImagePlus className="size-5 text-blue-600" />
                <h3 className="text-sm">Scan Results:</h3>
              </div>
              <div className="text-sm space-y-1">
                <div>✅ Found <strong>{scanResults.villageCount}</strong> villages with images</div>
                <div>📁 Total images: <strong>{scanResults.totalImages}</strong></div>
              </div>
            </div>
          )}

          {/* Progress Bar */}
          {linking && progress.total > 0 && (
            <div className="space-y-2">
              <div className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground">
                  Processing {progress.current} of {progress.total} villages
                </span>
                <span>{progressPercent.toFixed(1)}%</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-3 overflow-hidden">
                <div 
                  className="bg-blue-600 h-full transition-all duration-300 ease-out"
                  style={{ width: `${progressPercent}%` }}
                />
              </div>
            </div>
          )}

          {/* Error Message */}
          {error && (
            <div className="p-4 rounded-lg bg-red-50 text-red-700 border border-red-200">
              <div className="flex items-center gap-2">
                <XCircle className="size-5" />
                <p><strong>Error:</strong> {error}</p>
              </div>
            </div>
          )}

          {/* Results Summary */}
          {results.length > 0 && !linking && (
            <div className="p-6 rounded-lg bg-gradient-to-br from-green-50 to-blue-50 border border-green-200">
              <div className="flex items-center gap-3 mb-4">
                <CheckCircle2 className="size-8 text-green-600" />
                <div>
                  <h3 className="text-xl">Linking Complete! 🎉</h3>
                  <p className="text-sm text-muted-foreground">
                    Village images have been linked to your database
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-3 gap-4 mt-4">
                <div className="bg-white rounded-lg p-4 text-center">
                  <div className="text-3xl mb-1">{results.length}</div>
                  <div className="text-xs text-muted-foreground">Total Villages</div>
                </div>
                <div className="bg-white rounded-lg p-4 text-center">
                  <div className="text-3xl mb-1 text-green-600">{successCount}</div>
                  <div className="text-xs text-muted-foreground">Success</div>
                </div>
                <div className="bg-white rounded-lg p-4 text-center">
                  <div className="text-3xl mb-1 text-red-600">{failCount}</div>
                  <div className="text-xs text-muted-foreground">Failed</div>
                </div>
              </div>

              {/* Success Details */}
              {successCount > 0 && (
                <div className="mt-4 p-3 bg-green-50 border border-green-200 rounded-lg">
                  <h4 className="text-sm mb-2">✅ Successfully Linked Villages:</h4>
                  <div className="max-h-60 overflow-y-auto text-xs space-y-1">
                    {results.filter(r => r.success).slice(0, 10).map((r, i) => (
                      <div key={i} className="text-gray-700 font-mono">
                        {r.villageId.substring(0, 8)}...: {r.previousCount} → {r.imageCount} images
                      </div>
                    ))}
                    {results.filter(r => r.success).length > 10 && (
                      <div className="text-gray-500 italic pt-2">
                        ...and {results.filter(r => r.success).length - 10} more
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* Failure Details */}
              {failCount > 0 && (
                <div className="mt-4 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
                  <h4 className="text-sm mb-2">⚠️ Failed Villages:</h4>
                  <div className="max-h-40 overflow-y-auto text-xs font-mono text-gray-700">
                    {results.filter(r => !r.success).map((r, i) => (
                      <div key={i} className="py-1">
                        {r.villageId.substring(0, 8)}...: {r.error}
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </Card>

      {/* Instructions Card */}
      <Card className="p-6">
        <div className="flex items-center gap-3 mb-4">
          <ImagePlus className="size-6 text-purple-600" />
          <h2 className="text-xl">📋 How This Works</h2>
        </div>

        <div className="space-y-3">
          <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
            <h3 className="text-sm mb-2">🔍 Step 1: Scan Storage</h3>
            <p className="text-sm text-gray-700">
              Scans your Supabase Storage bucket to find all uploaded images. 
              Each filename is a village UUID (e.g., <code className="bg-white px-1 rounded">00a6e727-6c9b-4029-8913-fcaac1628321.jpg</code>).
            </p>
          </div>

          <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
            <h3 className="text-sm mb-2">🔗 Step 2: Match UUIDs</h3>
            <p className="text-sm text-gray-700">
              Extracts the UUID from each filename and matches it directly to village IDs in your database.
              No fuzzy matching needed - exact UUID match!
            </p>
          </div>

          <div className="p-4 bg-purple-50 border border-purple-200 rounded-lg">
            <h3 className="text-sm mb-2">✅ Step 3: Update Database</h3>
            <p className="text-sm text-gray-700">
              Updates each village record with the public URLs of their images.
              Safe to run multiple times - won't duplicate images!
            </p>
          </div>

          <div className="p-4 bg-orange-50 border border-orange-200 rounded-lg">
            <h3 className="text-sm mb-2">⏱️ Expected Results:</h3>
            <ul className="text-sm text-gray-700 space-y-1 list-disc list-inside">
              <li>Your images are named by UUID, so matching should be 100% accurate</li>
              <li>Process runs in batches of 10 for reliability</li>
              <li>Expected: ~1700 villages matched (all your uploaded images!)</li>
            </ul>
          </div>
        </div>
      </Card>
    </div>
  );
}
