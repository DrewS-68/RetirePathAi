import { useState, useEffect } from 'react';
import { projectId, publicAnonKey } from '../../utils/supabase/info';

interface OperatorPattern {
  operator: string;
  baseUrl: string;
  pattern: string;
  verified: boolean;
  exampleUrl?: string;
}

export function OperatorPatternManager() {
  const [patterns, setPatterns] = useState<OperatorPattern[]>([]);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [autoDetecting, setAutoDetecting] = useState(false);
  const [autoDetectResults, setAutoDetectResults] = useState<any>(null);
  
  // Form state for adding new pattern
  const [newPattern, setNewPattern] = useState<Partial<OperatorPattern>>({
    operator: '',
    baseUrl: '',
    pattern: '',
    verified: false,
    exampleUrl: ''
  });

  useEffect(() => {
    loadPatterns();
  }, []);

  const loadPatterns = async () => {
    setLoading(true);
    try {
      const response = await fetch(
        `https://${projectId}.supabase.co/functions/v1/make-server-3bba8be8/vic-operator-patterns`,
        {
          headers: {
            'Authorization': `Bearer ${publicAnonKey}`,
          },
        }
      );

      if (response.ok) {
        const data = await response.json();
        setPatterns(data.patterns || []);
      }
    } catch (error) {
      console.error('Failed to load patterns:', error);
    } finally {
      setLoading(false);
    }
  };

  const addPattern = async () => {
    if (!newPattern.operator || !newPattern.baseUrl || !newPattern.pattern) {
      alert('Please fill in operator, base URL, and pattern');
      return;
    }

    setSaving(true);
    try {
      const response = await fetch(
        `https://${projectId}.supabase.co/functions/v1/make-server-3bba8be8/vic-operator-patterns/add`,
        {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${publicAnonKey}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(newPattern),
        }
      );

      if (response.ok) {
        await loadPatterns();
        setNewPattern({
          operator: '',
          baseUrl: '',
          pattern: '',
          verified: false,
          exampleUrl: ''
        });
        alert('Pattern added successfully!');
      } else {
        const error = await response.json();
        alert(`Failed to add pattern: ${error.error}`);
      }
    } catch (error) {
      console.error('Failed to add pattern:', error);
      alert('Failed to add pattern');
    } finally {
      setSaving(false);
    }
  };

  const addKeytonPattern = async () => {
    const keytonPattern: OperatorPattern = {
      operator: 'Keyton',
      baseUrl: 'https://keyton.com.au',
      pattern: '/home/our-villages/{state}/{villageSlug}',
      verified: true,
      exampleUrl: 'https://keyton.com.au/home/our-villages/vic/abervale'
    };

    setSaving(true);
    try {
      const response = await fetch(
        `https://${projectId}.supabase.co/functions/v1/make-server-3bba8be8/vic-operator-patterns/add`,
        {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${publicAnonKey}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(keytonPattern),
        }
      );

      if (response.ok) {
        await loadPatterns();
        alert('Keyton pattern added successfully!');
      }
    } catch (error) {
      console.error('Failed to add Keyton pattern:', error);
    } finally {
      setSaving(false);
    }
  };

  const autoDetectAllPatterns = async () => {
    if (!confirm('This will analyze all 65 operators and auto-detect patterns. This may take 1-2 minutes. Continue?')) {
      return;
    }

    setAutoDetecting(true);
    setAutoDetectResults(null);
    
    try {
      console.log('🚀 Starting auto-detection for all operators...');
      
      const response = await fetch(
        `https://${projectId}.supabase.co/functions/v1/make-server-3bba8be8/auto-pattern-detector/detect-all-patterns`,
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
        setAutoDetectResults(data);
        await loadPatterns(); // Reload patterns
        alert(`✅ Auto-detection complete!\n\n${data.summary.patternsDetected} patterns detected out of ${data.summary.totalOperators} operators`);
      } else {
        const error = await response.json();
        alert(`Failed: ${error.error}`);
      }
    } catch (error) {
      console.error('Auto-detection failed:', error);
      alert('Auto-detection failed. Check console for details.');
    } finally {
      setAutoDetecting(false);
    }
  };

  const runDiagnostics = async () => {
    try {
      console.log('📊 Running pattern diagnostics...');
      
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
        console.log('📊 DIAGNOSTICS RESULTS:', data);
        
        alert(`📊 Diagnostics Complete!\n\n` +
          `Total operators: ${data.summary.totalOperators}\n` +
          `Operators with ≥2 villages: ${data.summary.operatorsWithMultipleVillages}\n` +
          `Operators with 1 village: ${data.summary.operatorsWithOnlyOneVillage}\n` +
          `\nCheck console for detailed operator list`);
      } else {
        alert('Diagnostics failed');
      }
    } catch (error) {
      console.error('Diagnostics error:', error);
      alert('Diagnostics failed. Check console.');
    }
  };

  if (loading) {
    return <div className="p-4">Loading patterns...</div>;
  }

  return (
    <div className="p-6 max-w-6xl mx-auto">
      <div className="bg-white rounded-lg shadow-md p-6 mb-6">
        <h2 className="text-2xl font-bold mb-4">🎯 Operator URL Pattern Manager</h2>
        <p className="text-gray-600 mb-4">
          Define URL patterns for operators to automatically construct village URLs instead of searching Google.
          Much faster and more reliable!
        </p>

        {/* Quick Add Keyton */}
        <div className="bg-blue-50 border-2 border-blue-200 rounded-lg p-4 mb-6">
          <div className="flex items-start justify-between mb-4">
            <div className="flex-1">
              <h3 className="font-semibold mb-2">✨ Quick Actions</h3>
            </div>
          </div>
          
          <div className="space-y-3">
            {/* Keyton Quick Add */}
            <div className="bg-white rounded p-3">
              <p className="text-sm text-gray-600 mb-2">
                <strong>Keyton Pattern:</strong> <code className="bg-gray-100 px-2 py-1 rounded text-xs">https://keyton.com.au/home/our-villages/&#123;state&#125;/&#123;villageSlug&#125;</code>
              </p>
              <button
                onClick={addKeytonPattern}
                disabled={saving || patterns.some(p => p.operator.toLowerCase() === 'keyton')}
                className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed text-sm"
              >
                {patterns.some(p => p.operator.toLowerCase() === 'keyton') ? '✅ Already Added' : '➕ Add Keyton Pattern'}
              </button>
            </div>

            {/* Auto-Detect All */}
            <div className="bg-gradient-to-r from-purple-50 to-pink-50 border-2 border-purple-200 rounded p-3">
              <p className="text-sm text-gray-700 mb-2">
                <strong>🤖 Auto-Detect All Patterns:</strong> Automatically analyze all 65 operators and detect URL patterns from existing village websites
              </p>
              <button
                onClick={autoDetectAllPatterns}
                disabled={autoDetecting}
                className="bg-purple-600 text-white px-4 py-2 rounded hover:bg-purple-700 disabled:bg-gray-400 disabled:cursor-not-allowed text-sm font-semibold"
              >
                {autoDetecting ? '🔄 Detecting Patterns... (1-2 min)' : '🚀 Auto-Detect All Patterns'}
              </button>
              {autoDetectResults && (
                <div className="mt-3 p-2 bg-white rounded text-sm">
                  <strong>Results:</strong> {autoDetectResults.summary.patternsDetected} patterns detected ({autoDetectResults.summary.successRate} success rate)
                </div>
              )}
            </div>

            {/* Run Diagnostics */}
            <div className="bg-gradient-to-r from-yellow-50 to-yellow-100 border-2 border-yellow-200 rounded p-3">
              <p className="text-sm text-gray-700 mb-2">
                <strong>🔍 Run Diagnostics:</strong> Analyze operator URL patterns and provide statistics
              </p>
              <button
                onClick={runDiagnostics}
                className="bg-yellow-600 text-white px-4 py-2 rounded hover:bg-yellow-700 disabled:bg-gray-400 disabled:cursor-not-allowed text-sm font-semibold"
              >
                🔍 Run Diagnostics
              </button>
            </div>
          </div>
        </div>

        {/* Existing Patterns */}
        <div className="mb-6">
          <h3 className="font-semibold mb-3">📋 Existing Patterns ({patterns.length})</h3>
          {patterns.length === 0 ? (
            <p className="text-gray-500 italic">No patterns defined yet</p>
          ) : (
            <div className="space-y-3">
              {patterns.map((pattern, index) => (
                <div key={index} className="border rounded-lg p-4 bg-gray-50">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="font-semibold text-lg">{pattern.operator}</div>
                      <div className="text-sm text-gray-600 mt-1">
                        <span className="font-medium">Base:</span> {pattern.baseUrl}
                      </div>
                      <div className="text-sm text-gray-600">
                        <span className="font-medium">Pattern:</span> <code className="bg-white px-2 py-1 rounded">{pattern.pattern}</code>
                      </div>
                      {pattern.exampleUrl && (
                        <div className="text-sm text-gray-600 mt-1">
                          <span className="font-medium">Example:</span>{' '}
                          <a href={pattern.exampleUrl} target="_blank" rel="noopener noreferrer" className="text-blue-600 underline">
                            {pattern.exampleUrl}
                          </a>
                        </div>
                      )}
                    </div>
                    <div>
                      {pattern.verified ? (
                        <span className="text-green-600 font-semibold">✅ Verified</span>
                      ) : (
                        <span className="text-yellow-600">⚠️ Unverified</span>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Add New Pattern Form */}
        <div className="border-t pt-6">
          <h3 className="font-semibold mb-3">➕ Add New Pattern</h3>
          <div className="space-y-3">
            <div>
              <label className="block text-sm font-medium mb-1">Operator Name</label>
              <input
                type="text"
                value={newPattern.operator || ''}
                onChange={(e) => setNewPattern({ ...newPattern, operator: e.target.value })}
                placeholder="e.g., Keyton"
                className="w-full border rounded px-3 py-2"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Base URL</label>
              <input
                type="text"
                value={newPattern.baseUrl || ''}
                onChange={(e) => setNewPattern({ ...newPattern, baseUrl: e.target.value })}
                placeholder="e.g., https://keyton.com.au"
                className="w-full border rounded px-3 py-2"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">
                URL Pattern <span className="text-gray-500">(use &#123;state&#125;, &#123;village&#125;, &#123;villageSlug&#125;)</span>
              </label>
              <input
                type="text"
                value={newPattern.pattern || ''}
                onChange={(e) => setNewPattern({ ...newPattern, pattern: e.target.value })}
                placeholder="e.g., /home/our-villages/{state}/{villageSlug}"
                className="w-full border rounded px-3 py-2"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Example URL (optional)</label>
              <input
                type="text"
                value={newPattern.exampleUrl || ''}
                onChange={(e) => setNewPattern({ ...newPattern, exampleUrl: e.target.value })}
                placeholder="e.g., https://keyton.com.au/home/our-villages/vic/abervale"
                className="w-full border rounded px-3 py-2"
              />
            </div>
            <div className="flex items-center">
              <input
                type="checkbox"
                checked={newPattern.verified || false}
                onChange={(e) => setNewPattern({ ...newPattern, verified: e.target.checked })}
                className="mr-2"
              />
              <label className="text-sm">Mark as verified (I've tested this pattern)</label>
            </div>
            <button
              onClick={addPattern}
              disabled={saving}
              className="bg-green-600 text-white px-6 py-2 rounded hover:bg-green-700 disabled:bg-gray-400"
            >
              {saving ? 'Adding...' : 'Add Pattern'}
            </button>
          </div>
        </div>

        {/* Help Section */}
        <div className="mt-6 bg-yellow-50 border border-yellow-200 rounded-lg p-4">
          <h4 className="font-semibold mb-2">📚 Pattern Placeholders:</h4>
          <ul className="text-sm space-y-1">
            <li><code className="bg-white px-2 py-1 rounded">&#123;state&#125;</code> - State code in lowercase (e.g., "vic")</li>
            <li><code className="bg-white px-2 py-1 rounded">&#123;village&#125;</code> - Village name as-is (e.g., "Abervale")</li>
            <li><code className="bg-white px-2 py-1 rounded">&#123;villageSlug&#125;</code> - Village name slugified (e.g., "abervale")</li>
          </ul>
        </div>
      </div>
    </div>
  );
}