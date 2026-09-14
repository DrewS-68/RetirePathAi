import React, { useState, useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { projectId } from '../../utils/supabase/info';
import { 
  Globe, 
  Upload, 
  Save,
  Loader,
  CheckCircle,
  AlertCircle,
  Search,
  X,
  Link as LinkIcon
} from 'lucide-react';

interface Village {
  id: string;
  name: string;
  operator: string | null;
  suburb: string;
  state: string;
  website: string | null;
}

interface WebsiteMatch {
  villageId: string;
  villageName: string;
  website: string;
  confidence: 'high' | 'medium' | 'low' | 'manual';
}

export function WebsiteBulkEditor() {
  const { accessToken } = useAuth();
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [selectedState, setSelectedState] = useState('VIC');
  const [villages, setVillages] = useState<Village[]>([]);
  const [websiteInput, setWebsiteInput] = useState('');
  const [matches, setMatches] = useState<WebsiteMatch[]>([]);
  const [showResults, setShowResults] = useState(false);
  const [saveResults, setSaveResults] = useState<any>(null);

  // Check authentication
  if (!accessToken) {
    return (
      <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-6">
        <p className="text-yellow-800">
          ⚠️ Please log in to use the Website Bulk Editor
        </p>
      </div>
    );
  }

  useEffect(() => {
    loadVillagesWithoutWebsites();
  }, [selectedState]);

  const loadVillagesWithoutWebsites = async () => {
    try {
      setLoading(true);
      
      const response = await fetch(
        `https://${projectId}.supabase.co/functions/v1/make-server-3bba8be8/admin/villages?state=${selectedState}&without_website=true`,
        {
          headers: {
            'Authorization': `Bearer ${accessToken}`,
          },
        }
      );

      if (!response.ok) {
        throw new Error('Failed to load villages');
      }

      const data = await response.json();
      setVillages(data.villages || []);
    } catch (error) {
      console.error('Error loading villages:', error);
      alert('Error loading villages. Check console for details.');
    } finally {
      setLoading(false);
    }
  };

  const autoMatchWebsites = () => {
    const websiteLines = websiteInput
      .split('\n')
      .map(line => line.trim())
      .filter(line => line && (line.startsWith('http://') || line.startsWith('https://')));

    if (websiteLines.length === 0) {
      alert('Please paste at least one website URL (must start with http:// or https://)');
      return;
    }

    const newMatches: WebsiteMatch[] = [];

    // Try to auto-match websites to villages
    for (const website of websiteLines) {
      let bestMatch: Village | null = null;
      let confidence: 'high' | 'medium' | 'low' = 'low';

      // Extract potential village name from URL
      const urlLower = website.toLowerCase();
      
      for (const village of villages) {
        const villageName = village.name.toLowerCase();
        const villageWords = villageName.split(' ').filter(w => w.length > 3);
        
        // Check if village name appears in URL
        if (urlLower.includes(villageName.replace(/\s+/g, ''))) {
          bestMatch = village;
          confidence = 'high';
          break;
        }
        
        // Check if major words from village name appear in URL
        const matchingWords = villageWords.filter(word => urlLower.includes(word));
        if (matchingWords.length >= Math.min(2, villageWords.length)) {
          bestMatch = village;
          confidence = 'medium';
        }
      }

      if (bestMatch) {
        newMatches.push({
          villageId: bestMatch.id,
          villageName: bestMatch.name,
          website: website,
          confidence
        });
      } else {
        // Can't auto-match, add as unmatched
        newMatches.push({
          villageId: '',
          villageName: '❌ Could not auto-match',
          website: website,
          confidence: 'manual'
        });
      }
    }

    setMatches(newMatches);
    setShowResults(true);
  };

  const updateMatch = (index: number, villageId: string) => {
    const village = villages.find(v => v.id === villageId);
    if (!village) return;

    const updatedMatches = [...matches];
    updatedMatches[index] = {
      ...updatedMatches[index],
      villageId: village.id,
      villageName: village.name,
      confidence: 'manual'
    };
    setMatches(updatedMatches);
  };

  const removeMatch = (index: number) => {
    const updatedMatches = matches.filter((_, i) => i !== index);
    setMatches(updatedMatches);
  };

  const saveWebsites = async () => {
    const validMatches = matches.filter(m => m.villageId && m.villageId !== '');
    
    if (validMatches.length === 0) {
      alert('No valid matches to save. Please match websites to villages first.');
      return;
    }

    if (!confirm(`Save ${validMatches.length} website URLs to villages?`)) {
      return;
    }

    try {
      setSaving(true);
      
      const response = await fetch(
        `https://${projectId}.supabase.co/functions/v1/make-server-3bba8be8/admin/bulk-update-websites`,
        {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${accessToken}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            updates: validMatches.map(m => ({
              villageId: m.villageId,
              website: m.website
            }))
          }),
        }
      );

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to save websites');
      }

      const data = await response.json();
      setSaveResults(data);
      
      // Reload villages
      await loadVillagesWithoutWebsites();
      
      // Clear form
      setWebsiteInput('');
      setMatches([]);
      setShowResults(false);
      
    } catch (error) {
      console.error('Error saving websites:', error);
      alert(`Error saving websites: ${error.message}`);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h2 className="text-2xl mb-2">Website Bulk Editor</h2>
        <p className="text-gray-600">
          Quickly add website URLs to villages that don't have them yet
        </p>
      </div>

      {/* State Selector */}
      <div className="bg-white p-6 rounded-lg shadow">
        <label className="block text-sm mb-2">Select State:</label>
        <select
          value={selectedState}
          onChange={(e) => setSelectedState(e.target.value)}
          className="border rounded px-4 py-2"
          disabled={loading}
        >
          <option value="VIC">Victoria (VIC)</option>
          <option value="NT">Northern Territory (NT)</option>
          <option value="NSW">New South Wales (NSW)</option>
          <option value="QLD">Queensland (QLD)</option>
          <option value="WA">Western Australia (WA)</option>
          <option value="SA">South Australia (SA)</option>
          <option value="TAS">Tasmania (TAS)</option>
          <option value="ACT">Australian Capital Territory (ACT)</option>
        </select>

        {loading ? (
          <div className="mt-4 text-center py-4">
            <Loader className="w-6 h-6 animate-spin mx-auto text-gray-400" />
          </div>
        ) : (
          <div className="mt-4 p-4 bg-blue-50 border border-blue-200 rounded">
            <p className="text-sm">
              <strong>{villages.length}</strong> villages in <strong>{selectedState}</strong> without websites
            </p>
          </div>
        )}
      </div>

      {/* Save Results */}
      {saveResults && (
        <div className="bg-green-50 border-l-4 border-green-400 p-6 rounded-lg">
          <div className="flex items-start gap-3">
            <CheckCircle className="w-5 h-5 text-green-600 mt-0.5" />
            <div className="flex-1">
              <h3 className="text-green-900 mb-2">✅ Websites Saved Successfully!</h3>
              <p className="text-sm text-green-800">
                Updated {saveResults.updated} village{saveResults.updated !== 1 ? 's' : ''} with website URLs
              </p>
            </div>
            <button
              onClick={() => setSaveResults(null)}
              className="text-green-600 hover:text-green-800"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>
      )}

      {/* Paste Websites */}
      <div className="bg-white p-6 rounded-lg shadow">
        <div className="flex items-center gap-3 mb-4">
          <Upload className="w-5 h-5 text-blue-600" />
          <div>
            <h3 className="text-lg">Step 1: Paste Website URLs</h3>
            <p className="text-sm text-gray-600">
              One URL per line (must start with http:// or https://)
            </p>
          </div>
        </div>

        <textarea
          value={websiteInput}
          onChange={(e) => setWebsiteInput(e.target.value)}
          placeholder="https://example-village.com.au&#10;https://another-village.com.au&#10;https://retirement-village-name.com"
          className="w-full border rounded p-3 text-sm font-mono h-48"
          disabled={saving}
        />

        <div className="mt-4 p-4 bg-gray-50 border rounded">
          <p className="text-sm mb-2">
            <strong>💡 Tips:</strong>
          </p>
          <ul className="text-sm space-y-1 text-gray-700 list-disc list-inside">
            <li>Each URL must be on its own line</li>
            <li>URLs must start with http:// or https://</li>
            <li>The system will try to auto-match URLs to villages by name</li>
            <li>You can manually fix any incorrect matches in the next step</li>
          </ul>
        </div>

        <button
          onClick={autoMatchWebsites}
          disabled={!websiteInput.trim() || saving}
          className="mt-4 w-full flex items-center justify-center gap-2 px-4 py-3 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <Search className="w-4 h-4" />
          Auto-Match Websites to Villages
        </button>
      </div>

      {/* Matching Results */}
      {showResults && matches.length > 0 && (
        <div className="bg-white p-6 rounded-lg shadow">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <LinkIcon className="w-5 h-5 text-purple-600" />
              <div>
                <h3 className="text-lg">Step 2: Review & Confirm Matches</h3>
                <p className="text-sm text-gray-600">
                  {matches.filter(m => m.villageId).length} / {matches.length} matched
                </p>
              </div>
            </div>
          </div>

          <div className="border rounded-lg overflow-hidden mb-4">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="text-left px-4 py-3 text-sm">Website URL</th>
                  <th className="text-left px-4 py-3 text-sm">Matched Village</th>
                  <th className="text-left px-4 py-3 text-sm">Confidence</th>
                  <th className="text-right px-4 py-3 text-sm">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y">
                {matches.map((match, index) => (
                  <tr key={index} className={`hover:bg-gray-50 ${!match.villageId ? 'bg-red-50' : ''}`}>
                    <td className="px-4 py-3 text-sm font-mono text-blue-600">
                      <a href={match.website} target="_blank" rel="noopener noreferrer" className="hover:underline">
                        {match.website}
                      </a>
                    </td>
                    <td className="px-4 py-3 text-sm">
                      {match.villageId ? (
                        <select
                          value={match.villageId}
                          onChange={(e) => updateMatch(index, e.target.value)}
                          className="border rounded px-2 py-1 text-sm w-full"
                        >
                          <option value={match.villageId}>{match.villageName}</option>
                          <option value="">-- Change Match --</option>
                          {villages.map(village => (
                            <option key={village.id} value={village.id}>
                              {village.name} ({village.suburb})
                            </option>
                          ))}
                        </select>
                      ) : (
                        <select
                          value=""
                          onChange={(e) => updateMatch(index, e.target.value)}
                          className="border rounded px-2 py-1 text-sm w-full border-red-300 bg-red-50"
                        >
                          <option value="">-- Select a village --</option>
                          {villages.map(village => (
                            <option key={village.id} value={village.id}>
                              {village.name} ({village.suburb})
                            </option>
                          ))}
                        </select>
                      )}
                    </td>
                    <td className="px-4 py-3 text-sm">
                      <span className={`px-2 py-1 rounded text-xs ${
                        match.confidence === 'high' ? 'bg-green-100 text-green-800' :
                        match.confidence === 'medium' ? 'bg-yellow-100 text-yellow-800' :
                        match.confidence === 'manual' ? 'bg-blue-100 text-blue-800' :
                        'bg-red-100 text-red-800'
                      }`}>
                        {match.confidence === 'manual' ? '✏️ Manual' : match.confidence}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-sm text-right">
                      <button
                        onClick={() => removeMatch(index)}
                        className="text-red-600 hover:text-red-800 text-sm"
                      >
                        Remove
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={saveWebsites}
              disabled={saving || matches.filter(m => m.villageId).length === 0}
              className="flex-1 flex items-center justify-center gap-2 px-4 py-3 bg-green-600 text-white rounded hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {saving ? (
                <>
                  <Loader className="w-4 h-4 animate-spin" />
                  Saving...
                </>
              ) : (
                <>
                  <Save className="w-4 h-4" />
                  Save {matches.filter(m => m.villageId).length} Website{matches.filter(m => m.villageId).length !== 1 ? 's' : ''}
                </>
              )}
            </button>
            <button
              onClick={() => {
                setShowResults(false);
                setMatches([]);
              }}
              disabled={saving}
              className="px-4 py-3 border rounded hover:bg-gray-50 disabled:opacity-50"
            >
              Cancel
            </button>
          </div>
        </div>
      )}

      {/* Current Villages Without Websites */}
      {villages.length > 0 && (
        <div className="bg-white p-6 rounded-lg shadow">
          <h3 className="text-lg mb-4">Villages Without Websites ({villages.length})</h3>
          <div className="border rounded-lg overflow-hidden max-h-96 overflow-y-auto">
            <table className="w-full">
              <thead className="bg-gray-50 sticky top-0">
                <tr>
                  <th className="text-left px-4 py-3 text-sm">Village Name</th>
                  <th className="text-left px-4 py-3 text-sm">Operator</th>
                  <th className="text-left px-4 py-3 text-sm">Location</th>
                </tr>
              </thead>
              <tbody className="divide-y">
                {villages.map(village => (
                  <tr key={village.id} className="hover:bg-gray-50">
                    <td className="px-4 py-3 text-sm">{village.name}</td>
                    <td className="px-4 py-3 text-sm text-gray-600">
                      {village.operator || <span className="text-gray-400">Unknown</span>}
                    </td>
                    <td className="px-4 py-3 text-sm">
                      {village.suburb}, {village.state}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}