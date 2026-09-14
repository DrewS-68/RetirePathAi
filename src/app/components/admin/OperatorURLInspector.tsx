import { useState, useEffect } from 'react';
import { projectId, publicAnonKey } from '../../utils/supabase/info';

interface Village {
  id: string;
  name: string;
  website: string;
}

interface OperatorStats {
  operator: string;
  villageCount: number;
  villages: Village[];
}

export function OperatorURLInspector() {
  const [loading, setLoading] = useState(false);
  const [operators, setOperators] = useState<OperatorStats[]>([]);
  const [selectedOperator, setSelectedOperator] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadOperators();
  }, []);

  const loadOperators = async () => {
    setLoading(true);
    setError(null);
    try {
      console.log('🔄 Loading operators from diagnostics API...');
      const response = await fetch(
        `https://${projectId}.supabase.co/functions/v1/make-server-3bba8be8/pattern-diagnostics/operator-url-stats`,
        {
          headers: {
            'Authorization': `Bearer ${publicAnonKey}`,
          },
        }
      );

      if (response.ok) {
        const data = await response.json();
        console.log('📊 Diagnostics response:', data);
        
        if (data.allOperatorStats && data.allOperatorStats.length > 0) {
          setOperators(data.allOperatorStats);
          console.log(`✅ Loaded ${data.allOperatorStats.length} operators`);
        } else {
          setError('No operators found in database. Have VIC villages been imported?');
          console.warn('⚠️ No operators returned from API');
        }
      } else {
        const errorData = await response.json();
        setError(`API error: ${errorData.error || 'Unknown error'}`);
        console.error('❌ API error:', errorData);
      }
    } catch (error) {
      console.error('Failed to load operators:', error);
      setError(`Failed to load: ${error}`);
    } finally {
      setLoading(false);
    }
  };

  const filteredOperators = operators.filter(op =>
    op.operator.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const selectedOperatorData = operators.find(op => op.operator === selectedOperator);

  // Extract URL pattern info for selected operator
  const getUrlAnalysis = (villages: Village[]) => {
    if (villages.length === 0) return null;

    // Get base URLs
    const baseUrls: { [key: string]: number } = {};
    villages.forEach(v => {
      try {
        const url = new URL(v.website);
        const base = `${url.protocol}//${url.hostname}`;
        baseUrls[base] = (baseUrls[base] || 0) + 1;
      } catch {}
    });

    // Check if village names appear in URLs
    const villageUrlData = villages.map(v => {
      const slug = v.name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
      try {
        const url = new URL(v.website);
        const pathLower = url.pathname.toLowerCase();
        return {
          name: v.name,
          website: v.website,
          domain: url.hostname,
          path: url.pathname,
          slug,
          slugInPath: pathLower.includes(slug),
          nameInPath: pathLower.includes(v.name.toLowerCase())
        };
      } catch {
        return {
          name: v.name,
          website: v.website,
          error: true
        };
      }
    });

    return {
      baseUrls,
      villageUrlData
    };
  };

  if (loading) {
    return <div className="p-4">Loading operators...</div>;
  }

  return (
    <div className="p-6 max-w-7xl mx-auto">
      <div className="bg-white rounded-lg shadow-md p-6">
        <h2 className="text-2xl font-bold mb-4">🔍 Operator URL Inspector</h2>
        <p className="text-gray-600 mb-6">
          Browse operators and their village URLs to manually identify patterns
        </p>

        {/* Reload Button */}
        <div className="mb-4">
          <button
            onClick={loadOperators}
            disabled={loading}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
          >
            {loading ? '⏳ Loading...' : '🔄 Reload Data'}
          </button>
        </div>

        {/* Summary Stats */}
        <div className="grid grid-cols-4 gap-4 mb-6">
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <div className="text-2xl font-bold text-blue-600">{operators.length}</div>
            <div className="text-sm text-gray-600">Total Operators</div>
          </div>
          <div className="bg-green-50 border border-green-200 rounded-lg p-4">
            <div className="text-2xl font-bold text-green-600">
              {operators.filter(op => op.villageCount >= 2).length}
            </div>
            <div className="text-sm text-gray-600">With ≥2 Villages</div>
          </div>
          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
            <div className="text-2xl font-bold text-yellow-600">
              {operators.filter(op => op.villageCount === 1).length}
            </div>
            <div className="text-sm text-gray-600">With 1 Village</div>
          </div>
          <div className="bg-purple-50 border border-purple-200 rounded-lg p-4">
            <div className="text-2xl font-bold text-purple-600">
              {operators.reduce((sum, op) => sum + op.villageCount, 0)}
            </div>
            <div className="text-sm text-gray-600">Total Villages</div>
          </div>
        </div>

        {/* Search */}
        <div className="mb-6">
          <input
            type="text"
            placeholder="Search operators..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full border rounded-lg px-4 py-2"
          />
        </div>

        <div className="grid grid-cols-2 gap-6">
          {/* Left: Operator List */}
          <div className="border rounded-lg overflow-hidden">
            <div className="bg-gray-100 px-4 py-2 font-semibold border-b">
              Operators ({filteredOperators.length})
            </div>
            <div className="max-h-[600px] overflow-y-auto">
              {filteredOperators.length === 0 ? (
                <div className="p-4 text-gray-500 text-center">No operators found</div>
              ) : (
                filteredOperators.map((op) => (
                  <div
                    key={op.operator}
                    onClick={() => setSelectedOperator(op.operator)}
                    className={`px-4 py-3 cursor-pointer border-b hover:bg-blue-50 transition-colors ${
                      selectedOperator === op.operator ? 'bg-blue-100 border-l-4 border-l-blue-600' : ''
                    }`}
                  >
                    <div className="font-semibold">{op.operator}</div>
                    <div className="text-sm text-gray-600">
                      {op.villageCount} village{op.villageCount !== 1 ? 's' : ''}
                      {op.villageCount >= 2 && (
                        <span className="ml-2 text-green-600 font-semibold">✓ Pattern Eligible</span>
                      )}
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>

          {/* Right: Village URLs */}
          <div className="border rounded-lg overflow-hidden">
            <div className="bg-gray-100 px-4 py-2 font-semibold border-b">
              Village URLs
            </div>
            <div className="max-h-[600px] overflow-y-auto p-4">
              {!selectedOperator ? (
                <div className="text-gray-500 text-center py-8">
                  ← Select an operator to view URLs
                </div>
              ) : selectedOperatorData ? (
                <div>
                  <h3 className="font-bold text-lg mb-4">{selectedOperatorData.operator}</h3>
                  
                  {/* URL Analysis */}
                  {(() => {
                    const analysis = getUrlAnalysis(selectedOperatorData.villages);
                    if (!analysis) return null;

                    const { baseUrls, villageUrlData } = analysis;
                    const hasPattern = villageUrlData.filter(v => v.slugInPath).length >= 2;

                    return (
                      <div className="mb-6">
                        {/* Base URLs */}
                        <div className="bg-gray-50 rounded p-3 mb-4">
                          <div className="font-semibold mb-2">Base URLs:</div>
                          {Object.entries(baseUrls).map(([base, count]) => (
                            <div key={base} className="text-sm">
                              {base} <span className="text-gray-500">({count} villages)</span>
                            </div>
                          ))}
                        </div>

                        {/* Pattern Detection Hint */}
                        {hasPattern && (
                          <div className="bg-green-50 border border-green-200 rounded p-3 mb-4">
                            <div className="font-semibold text-green-700">✅ Pattern Detected!</div>
                            <div className="text-sm text-green-600">
                              Village slugs found in URLs - this operator is likely pattern-compatible
                            </div>
                          </div>
                        )}
                      </div>
                    );
                  })()}

                  {/* Villages */}
                  <div className="space-y-4">
                    {selectedOperatorData.villages.map((village, idx) => {
                      const slug = village.name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
                      let domain = '';
                      let path = '';
                      let slugInPath = false;
                      
                      try {
                        const url = new URL(village.website);
                        domain = url.hostname;
                        path = url.pathname;
                        slugInPath = path.toLowerCase().includes(slug);
                      } catch {}

                      return (
                        <div key={idx} className="border rounded-lg p-3 bg-gray-50">
                          <div className="font-semibold mb-1">{village.name}</div>
                          <div className="text-xs text-gray-600 mb-2">
                            Slug: <code className="bg-white px-1 rounded">{slug}</code>
                            {slugInPath && <span className="ml-2 text-green-600 font-semibold">✓ In URL</span>}
                          </div>
                          <div className="text-sm break-all">
                            <span className="text-gray-500">{domain}</span>
                            <span className={slugInPath ? 'font-bold text-blue-600' : ''}>{path}</span>
                          </div>
                          <a
                            href={village.website}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-xs text-blue-500 hover:underline"
                          >
                            Open →
                          </a>
                        </div>
                      );
                    })}
                  </div>
                </div>
              ) : null}
            </div>
          </div>
        </div>

        {/* Instructions */}
        <div className="mt-6 bg-blue-50 border border-blue-200 rounded-lg p-4">
          <h4 className="font-semibold mb-2">💡 How to Find Patterns:</h4>
          <ol className="text-sm space-y-1 list-decimal list-inside">
            <li>Look for operators with multiple villages (marked with "✓ Pattern Eligible")</li>
            <li>Check if the village slug appears in the URL path (highlighted in blue)</li>
            <li>Identify the common base URL and path structure</li>
            <li>Look for patterns like: <code className="bg-white px-1 rounded">/villages/&#123;slug&#125;</code> or <code className="bg-white px-1 rounded">/&#123;state&#125;/&#123;slug&#125;</code></li>
          </ol>
        </div>

        {/* Error Message */}
        {error && (
          <div className="mt-6 bg-red-50 border border-red-200 rounded-lg p-4 text-red-700">
            <h4 className="font-semibold mb-2">⚠️ Error:</h4>
            <p className="text-sm">{error}</p>
          </div>
        )}
      </div>
    </div>
  );
}