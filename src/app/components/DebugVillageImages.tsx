import { useState } from 'react';
import { Button } from './ui/button';
import { Card } from './ui/card';
import { projectId, publicAnonKey } from '../utils/supabase/info';
import { Search, AlertCircle } from 'lucide-react';

export function DebugVillageImages() {
  const [villageId, setVillageId] = useState('');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<any>(null);

  const checkVillage = async () => {
    if (!villageId.trim()) return;

    try {
      setLoading(true);
      setResult(null);

      const response = await fetch(
        `https://${projectId}.supabase.co/functions/v1/make-server-3bba8be8/storage/debug-village/${villageId.trim()}`,
        {
          method: 'GET',
          headers: {
            'Authorization': `Bearer ${publicAnonKey}`,
            'Content-Type': 'application/json'
          }
        }
      );

      const data = await response.json();
      setResult(data);
      console.log('🔍 Village Debug:', data);
    } catch (err: any) {
      console.error('Debug error:', err);
      setResult({ error: err.message });
    } finally {
      setLoading(false);
    }
  };

  const testVillageNames = [
    'ACH Group Glenelg',
    'Glenelg'
  ];

  const searchByName = async (searchTerm: string) => {
    try {
      setLoading(true);
      setResult(null);

      const response = await fetch(
        `https://${projectId}.supabase.co/functions/v1/make-server-3bba8be8/villages/search`,
        {
          headers: {
            'Authorization': `Bearer ${publicAnonKey}`,
          }
        }
      );

      const data = await response.json();
      const found = data.villages?.find((v: any) => 
        v.name.toLowerCase().includes(searchTerm.toLowerCase())
      );

      if (found) {
        setResult({
          villageId: found.id,
          villageName: found.name,
          images: found.images || [],
          imageCount: found.images?.length || 0,
          hasImages: !!(found.images && found.images.length > 0),
          fullVillage: found
        });
      } else {
        setResult({ error: `No village found matching "${searchTerm}"` });
      }
    } catch (err: any) {
      console.error('Search error:', err);
      setResult({ error: err.message });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto p-6">
      <div className="mb-8">
        <h1 className="text-4xl mb-2">🔍 Debug Village Images</h1>
        <p className="text-muted-foreground">
          Check what images are stored for a specific village
        </p>
      </div>

      <Card className="p-6 mb-6">
        <div className="space-y-4">
          <div>
            <label className="text-sm mb-2 block">Enter Village ID:</label>
            <div className="flex gap-2">
              <input
                type="text"
                value={villageId}
                onChange={(e) => setVillageId(e.target.value)}
                placeholder="e.g., 00a6e727-6c9b-4029-8913-fcaac1628321"
                className="flex-1 px-3 py-2 border rounded-md font-mono text-sm"
              />
              <Button onClick={checkVillage} disabled={loading || !villageId.trim()}>
                <Search className="size-4 mr-2" />
                Check
              </Button>
            </div>
          </div>

          <div className="border-t pt-4">
            <p className="text-sm mb-2">Or search by village name:</p>
            <div className="flex flex-wrap gap-2">
              {testVillageNames.map(name => (
                <Button
                  key={name}
                  variant="outline"
                  size="sm"
                  onClick={() => searchByName(name)}
                  disabled={loading}
                >
                  {name}
                </Button>
              ))}
            </div>
          </div>
        </div>
      </Card>

      {result && (
        <Card className="p-6">
          {result.error ? (
            <div className="p-4 rounded-lg bg-red-50 border border-red-200 text-red-700">
              <div className="flex items-center gap-2">
                <AlertCircle className="size-5" />
                <p><strong>Error:</strong> {result.error}</p>
              </div>
            </div>
          ) : (
            <div className="space-y-4">
              <div>
                <h3 className="text-sm text-muted-foreground mb-1">Village Name:</h3>
                <p className="text-xl">{result.villageName}</p>
              </div>

              <div>
                <h3 className="text-sm text-muted-foreground mb-1">Village ID:</h3>
                <p className="font-mono text-sm bg-gray-100 p-2 rounded">{result.villageId}</p>
              </div>

              <div>
                <h3 className="text-sm text-muted-foreground mb-1">Has Images:</h3>
                <p className="text-2xl">{result.hasImages ? '✅ YES' : '❌ NO'}</p>
              </div>

              <div>
                <h3 className="text-sm text-muted-foreground mb-1">Image Count:</h3>
                <p className="text-2xl">{result.imageCount}</p>
              </div>

              {result.images && result.images.length > 0 && (
                <div>
                  <h3 className="text-sm text-muted-foreground mb-2">Image URLs:</h3>
                  <div className="space-y-4">
                    {result.images.map((url: string, i: number) => (
                      <div key={i} className="bg-gray-50 p-3 rounded-lg">
                        <p className="font-mono text-xs mb-2 break-all text-gray-600">{url}</p>
                        <img 
                          src={url} 
                          alt={`Village image ${i + 1}`}
                          className="w-full max-w-md rounded-lg border border-gray-200"
                          onError={(e) => {
                            e.currentTarget.style.display = 'none';
                            e.currentTarget.parentElement!.insertAdjacentHTML(
                              'beforeend',
                              '<div class="p-4 bg-red-50 text-red-700 rounded text-sm">❌ Image failed to load</div>'
                            );
                          }}
                        />
                      </div>
                    ))}
                  </div>
                </div>
              )}

              <details className="mt-6">
                <summary className="cursor-pointer text-sm text-muted-foreground hover:text-foreground">
                  Show Full Village Data
                </summary>
                <pre className="mt-2 p-4 bg-gray-900 text-gray-100 rounded-lg overflow-x-auto text-xs">
                  {JSON.stringify(result.fullVillage || result, null, 2)}
                </pre>
              </details>
            </div>
          )}
        </Card>
      )}
    </div>
  );
}