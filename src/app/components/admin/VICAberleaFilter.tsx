import React, { useState } from 'react';
import { Button } from '../ui/button';
import { AlertCircle, CheckCircle, XCircle, Trash2 } from 'lucide-react';
import { projectId, publicAnonKey } from '../../utils/supabase/info';

interface Village {
  id: string;
  name: string;
  suburb: string;
  postcode: string;
  operator: string;
}

export function VICAberleaFilter() {
  const [villages, setVillages] = useState<Village[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [selectedToKeep, setSelectedToKeep] = useState<Set<string>>(new Set());

  // Known legitimate Aberlea villages
  const LEGITIMATE_ABERLEA = [
    'Aberlea Dan Brumley Homes',
    'Aberlea Timboon'
  ];

  const fetchAberleaVillages = async () => {
    setLoading(true);
    setError('');
    setSuccess('');
    
    try {
      const response = await fetch(
        `https://${projectId}.supabase.co/functions/v1/make-server-3bba8be8/admin/villages-with-operator-containing`,
        {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${publicAnonKey}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ 
            state: 'VIC',
            operatorPattern: 'Aberlea'
          }),
        }
      );

      if (!response.ok) {
        throw new Error(`Failed to fetch: ${response.statusText}`);
      }

      const data = await response.json();
      setVillages(data.villages || []);
      
      // Auto-select legitimate Aberlea villages
      const autoSelect = new Set<string>();
      data.villages.forEach((v: Village) => {
        if (LEGITIMATE_ABERLEA.includes(v.name)) {
          autoSelect.add(v.id);
        }
      });
      setSelectedToKeep(autoSelect);
      
      setSuccess(`Found ${data.villages.length} villages with "Aberlea" as operator`);
    } catch (err: any) {
      setError(`Error: ${err.message}`);
    } finally {
      setLoading(false);
    }
  };

  const toggleSelection = (villageId: string) => {
    const newSelection = new Set(selectedToKeep);
    if (newSelection.has(villageId)) {
      newSelection.delete(villageId);
    } else {
      newSelection.add(villageId);
    }
    setSelectedToKeep(newSelection);
  };

  const clearFalseMatches = async () => {
    if (!confirm(
      `This will:\n\n` +
      `✅ KEEP operator for ${selectedToKeep.size} selected villages\n` +
      `❌ CLEAR operator for ${villages.length - selectedToKeep.size} unselected villages\n\n` +
      `Continue?`
    )) {
      return;
    }

    setLoading(true);
    setError('');
    setSuccess('');

    try {
      const villagesToClear = villages
        .filter(v => !selectedToKeep.has(v.id))
        .map(v => v.id);

      const response = await fetch(
        `https://${projectId}.supabase.co/functions/v1/make-server-3bba8be8/admin/bulk-clear-operators`,
        {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${publicAnonKey}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ 
            villageIds: villagesToClear
          }),
        }
      );

      if (!response.ok) {
        throw new Error(`Failed to clear: ${response.statusText}`);
      }

      const data = await response.json();
      setSuccess(`✅ Cleared ${data.cleared} false Aberlea matches. ${selectedToKeep.size} legitimate villages kept.`);
      
      // Refresh the list
      await fetchAberleaVillages();
    } catch (err: any) {
      setError(`Error: ${err.message}`);
    } finally {
      setLoading(false);
    }
  };

  const isLegitimate = (villageName: string) => {
    return LEGITIMATE_ABERLEA.includes(villageName);
  };

  return (
    <div className="space-y-6">
      <div className="bg-white rounded-lg shadow p-6">
        <div className="flex items-center gap-3 mb-4">
          <AlertCircle className="size-6 text-orange-600" />
          <div>
            <h2 className="text-2xl font-bold">VIC Aberlea Filter Tool</h2>
            <p className="text-sm text-gray-600">
              Aberlea only operates 2 villages but often contaminates search results. 
              This tool finds and removes false matches.
            </p>
          </div>
        </div>

        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-4">
          <h3 className="font-semibold text-blue-900 mb-2">✅ Known Legitimate Aberlea Villages:</h3>
          <ul className="list-disc list-inside text-blue-800 text-sm space-y-1">
            <li>Aberlea Dan Brumley Homes</li>
            <li>Aberlea Timboon</li>
          </ul>
        </div>

        {error && (
          <div className="bg-red-50 border border-red-200 rounded p-3 mb-4 flex items-start gap-2">
            <XCircle className="size-5 text-red-600 flex-shrink-0 mt-0.5" />
            <span className="text-red-800 text-sm">{error}</span>
          </div>
        )}

        {success && (
          <div className="bg-green-50 border border-green-200 rounded p-3 mb-4 flex items-start gap-2">
            <CheckCircle className="size-5 text-green-600 flex-shrink-0 mt-0.5" />
            <span className="text-green-800 text-sm">{success}</span>
          </div>
        )}

        <div className="flex gap-3">
          <Button
            onClick={fetchAberleaVillages}
            disabled={loading}
            className="flex-1"
          >
            {loading ? '🔍 Searching...' : '🔍 Find Aberlea Villages'}
          </Button>

          {villages.length > 0 && (
            <Button
              onClick={clearFalseMatches}
              disabled={loading}
              variant="destructive"
              className="flex-1"
            >
              <Trash2 className="size-4 mr-2" />
              Clear {villages.length - selectedToKeep.size} False Matches
            </Button>
          )}
        </div>
      </div>

      {villages.length > 0 && (
        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-lg font-semibold mb-4">
            Review {villages.length} Villages with "Aberlea" Operator
          </h3>
          
          <div className="mb-4 p-3 bg-gray-50 rounded border text-sm">
            <strong>Instructions:</strong> The 2 legitimate Aberlea villages are pre-selected. 
            Uncheck any village to remove "Aberlea" as its operator.
          </div>

          <div className="space-y-2 max-h-[600px] overflow-y-auto">
            {villages.map((village) => {
              const isSelected = selectedToKeep.has(village.id);
              const isKnownLegit = isLegitimate(village.name);
              
              return (
                <div
                  key={village.id}
                  className={`p-4 border rounded-lg cursor-pointer transition-all ${
                    isSelected 
                      ? 'bg-green-50 border-green-300' 
                      : 'bg-red-50 border-red-300 hover:bg-red-100'
                  }`}
                  onClick={() => toggleSelection(village.id)}
                >
                  <div className="flex items-start gap-3">
                    <div className="flex-shrink-0 mt-1">
                      {isSelected ? (
                        <CheckCircle className="size-5 text-green-600" />
                      ) : (
                        <XCircle className="size-5 text-red-600" />
                      )}
                    </div>
                    
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <h4 className="font-semibold text-gray-900">{village.name}</h4>
                        {isKnownLegit && (
                          <span className="px-2 py-0.5 bg-blue-100 text-blue-800 text-xs font-medium rounded">
                            LEGITIMATE
                          </span>
                        )}
                      </div>
                      <p className="text-sm text-gray-600">
                        {village.suburb}, VIC {village.postcode}
                      </p>
                      <p className="text-sm text-gray-500 mt-1">
                        Operator: <span className="font-medium">{village.operator}</span>
                      </p>
                    </div>

                    <div className="flex-shrink-0">
                      {isSelected ? (
                        <span className="text-xs text-green-700 font-medium">KEEP</span>
                      ) : (
                        <span className="text-xs text-red-700 font-medium">CLEAR</span>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          <div className="mt-4 p-4 bg-gray-50 rounded-lg border">
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <span className="font-semibold text-green-700">✅ Will keep operator:</span>
                <span className="ml-2 text-green-900">{selectedToKeep.size} villages</span>
              </div>
              <div>
                <span className="font-semibold text-red-700">❌ Will clear operator:</span>
                <span className="ml-2 text-red-900">{villages.length - selectedToKeep.size} villages</span>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
