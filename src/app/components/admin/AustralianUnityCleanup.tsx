import { useState, useEffect } from 'react';
import { projectId, publicAnonKey } from '../../utils/supabase/info';

// The 8 correct Australian Unity villages
const CORRECT_AU_VILLAGES = [
  'Campbell Place Retirement Community',
  'Drummond Place Retirement Community',
  'Geelong Grove Retirement Community',
  'Morven Manor Retirement Community',
  'Peninsula Grange Retirement Community',
  'The Grace Albert Park Lake',
  'Victoria Grange Retirement Community',
  'Walmsley Retirement Community'
];

interface Village {
  id: string;
  name: string;
  suburb: string;
  website: string | null;
  operator: string | null;
}

export function AustralianUnityCleanup() {
  const [villages, setVillages] = useState<Village[]>([]);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [stats, setStats] = useState({ total: 0, correct: 0, incorrect: 0 });

  // Load villages currently marked as Australian Unity
  const loadVillages = async () => {
    setLoading(true);
    setMessage('');
    
    try {
      const response = await fetch(
        `https://${projectId}.supabase.co/functions/v1/make-server-3bba8be8/australian-unity-audit`,
        {
          method: 'GET',
          headers: {
            'Authorization': `Bearer ${publicAnonKey}`,
            'Content-Type': 'application/json'
          }
        }
      );

      if (!response.ok) {
        throw new Error(`Server error: ${response.status}`);
      }

      const data = await response.json();
      setVillages(data.villages || []);
      
      // Calculate stats
      const total = data.villages.length;
      const correct = data.villages.filter((v: Village) => 
        CORRECT_AU_VILLAGES.includes(v.name)
      ).length;
      const incorrect = total - correct;
      
      setStats({ total, correct, incorrect });
      setMessage(`Loaded ${total} villages marked as Australian Unity`);
    } catch (error: any) {
      setMessage(`Error: ${error.message}`);
      console.error('Load error:', error);
    } finally {
      setLoading(false);
    }
  };

  // Clear operator field for incorrect villages
  const clearIncorrectOperators = async () => {
    if (!confirm(`This will set operator to NULL for ${stats.incorrect} incorrectly assigned villages. Continue?`)) {
      return;
    }

    setLoading(true);
    setMessage('Clearing incorrect operators...');
    
    try {
      const response = await fetch(
        `https://${projectId}.supabase.co/functions/v1/make-server-3bba8be8/australian-unity-cleanup`,
        {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${publicAnonKey}`,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            correctVillages: CORRECT_AU_VILLAGES
          })
        }
      );

      if (!response.ok) {
        throw new Error(`Server error: ${response.status}`);
      }

      const data = await response.json();
      setMessage(`✅ Success! Cleared ${data.clearedCount} incorrect operators. The 8 correct villages remain unchanged.`);
      
      // Reload to show updated state
      setTimeout(loadVillages, 1000);
    } catch (error: any) {
      setMessage(`❌ Error: ${error.message}`);
      console.error('Cleanup error:', error);
    } finally {
      setLoading(false);
    }
  };

  // Auto-load on mount
  useEffect(() => {
    loadVillages();
  }, []);

  const isCorrect = (villageName: string) => CORRECT_AU_VILLAGES.includes(villageName);

  return (
    <div className="bg-white rounded-lg shadow p-6 mb-6">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
            🏥 Australian Unity Verification & Cleanup
          </h3>
          <p className="text-sm text-gray-600 mt-1">
            Verify and correct operator assignments for Australian Unity villages
          </p>
        </div>
      </div>

      {/* Stats */}
      <div className="bg-blue-50 p-4 rounded-lg mb-4">
        <div className="grid grid-cols-3 gap-4 text-center">
          <div>
            <div className="text-2xl font-bold text-blue-900">{stats.total}</div>
            <div className="text-xs text-blue-700">Currently Assigned</div>
          </div>
          <div>
            <div className="text-2xl font-bold text-green-900">{stats.correct}</div>
            <div className="text-xs text-green-700">✅ Correct (Keep)</div>
          </div>
          <div>
            <div className="text-2xl font-bold text-red-900">{stats.incorrect}</div>
            <div className="text-xs text-red-700">❌ Incorrect (Clear)</div>
          </div>
        </div>
      </div>

      {/* Actions */}
      <div className="flex gap-2 mb-4">
        <button
          onClick={loadVillages}
          disabled={loading}
          className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:bg-gray-400 text-sm"
        >
          🔄 Reload Data
        </button>
        
        <button
          onClick={clearIncorrectOperators}
          disabled={loading || stats.incorrect === 0}
          className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700 disabled:bg-gray-400 text-sm font-semibold"
        >
          🧹 Clear {stats.incorrect} Incorrect Operators
        </button>
      </div>

      {/* Message */}
      {message && (
        <div className={`p-3 rounded mb-4 text-sm ${
          message.includes('Error') || message.includes('❌')
            ? 'bg-red-50 text-red-800'
            : message.includes('Success') || message.includes('✅')
            ? 'bg-green-50 text-green-800'
            : 'bg-blue-50 text-blue-800'
        }`}>
          {message}
        </div>
      )}

      {/* The 8 Correct Villages */}
      <div className="mb-6">
        <h4 className="font-semibold text-gray-900 mb-2">
          ✅ The 8 Correct Australian Unity Villages (Will Keep):
        </h4>
        <div className="bg-green-50 p-3 rounded">
          <ul className="text-sm text-green-900 space-y-1">
            {CORRECT_AU_VILLAGES.map((name, idx) => (
              <li key={idx} className="flex items-center gap-2">
                <span className="text-green-600">✓</span> {name}
              </li>
            ))}
          </ul>
        </div>
      </div>

      {/* Villages List */}
      {villages.length > 0 && (
        <div>
          <h4 className="font-semibold text-gray-900 mb-2">
            All Villages Currently Marked as Australian Unity:
          </h4>
          <div className="max-h-96 overflow-y-auto border rounded">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50 sticky top-0">
                <tr>
                  <th className="px-3 py-2 text-left text-xs font-medium text-gray-500">Status</th>
                  <th className="px-3 py-2 text-left text-xs font-medium text-gray-500">Village Name</th>
                  <th className="px-3 py-2 text-left text-xs font-medium text-gray-500">Suburb</th>
                  <th className="px-3 py-2 text-left text-xs font-medium text-gray-500">Website</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {villages.map((village) => {
                  const correct = isCorrect(village.name);
                  return (
                    <tr key={village.id} className={correct ? 'bg-green-50' : 'bg-red-50'}>
                      <td className="px-3 py-2 text-sm">
                        {correct ? (
                          <span className="text-green-700 font-semibold">✅ KEEP</span>
                        ) : (
                          <span className="text-red-700 font-semibold">❌ CLEAR</span>
                        )}
                      </td>
                      <td className="px-3 py-2 text-sm font-medium">
                        {village.name}
                      </td>
                      <td className="px-3 py-2 text-sm text-gray-600">
                        {village.suburb}
                      </td>
                      <td className="px-3 py-2 text-sm text-gray-600 max-w-xs truncate">
                        {village.website || 'No website'}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Next Steps */}
      <div className="mt-6 bg-yellow-50 p-4 rounded border border-yellow-200">
        <h4 className="font-semibold text-yellow-900 mb-2">📋 Recommended Workflow:</h4>
        <ol className="text-sm text-yellow-800 space-y-1 list-decimal list-inside">
          <li>Review the list above to confirm correct vs incorrect villages</li>
          <li>Click <strong>"Clear Incorrect Operators"</strong> to set them to NULL</li>
          <li>The 8 correct villages will keep "Australian Unity" as operator</li>
          <li>Go to VIC Operator Domain Scraper</li>
          <li>Filter for NULL operators and run the scraper</li>
          <li>Auto-correction will detect correct operators from URLs! 🎯</li>
        </ol>
      </div>
    </div>
  );
}
