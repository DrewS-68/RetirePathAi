import React, { useState, useEffect } from 'react';
import { Card } from '../ui/card';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Badge } from '../ui/badge';
import { Loader2, Search, ExternalLink, AlertTriangle, Flag, Download } from 'lucide-react';
import { getSupabaseClient } from '../../utils/supabase/client';

interface Village {
  id: string;
  name: string;
  operator: string;
  suburb: string;
  postcode: string;
  website: string;
  state: string;
}

export function VICVillageBrowser() {
  const [loading, setLoading] = useState(false);
  const [villages, setVillages] = useState<Village[]>([]);
  const [filteredVillages, setFilteredVillages] = useState<Village[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [flaggedIds, setFlaggedIds] = useState<Set<string>>(new Set());
  const [showFlaggedOnly, setShowFlaggedOnly] = useState(false);
  const [stats, setStats] = useState({
    total: 0,
    hasOperator: 0,
    noOperator: 0,
    suspiciousNames: 0,
  });

  // Load villages
  const loadVillages = async () => {
    setLoading(true);
    try {
      const supabase = getSupabaseClient();
      const { data, error } = await supabase
        .from('retirement_villages')
        .select('id, name, operator, suburb, postcode, website, state')
        .eq('state', 'VIC')
        .order('name');

      if (error) throw error;

      const villageData = data || [];
      setVillages(villageData);
      setFilteredVillages(villageData);

      // Calculate stats
      const hasOperator = villageData.filter(v => v.operator && v.operator.trim()).length;
      const suspiciousNames = villageData.filter(v => isSuspiciousName(v.name)).length;

      setStats({
        total: villageData.length,
        hasOperator,
        noOperator: villageData.length - hasOperator,
        suspiciousNames,
      });
    } catch (err) {
      console.error('Error loading villages:', err);
      alert(`Error: ${err instanceof Error ? err.message : 'Failed to load villages'}`);
    } finally {
      setLoading(false);
    }
  };

  // Check if name is suspicious (address or operator name)
  const isSuspiciousName = (name: string): boolean => {
    if (!name) return true;
    
    const lowerName = name.toLowerCase();
    
    // Check for address patterns
    const addressKeywords = [
      'road', 'rd', 'street', 'st', 'avenue', 'ave', 'drive', 'dr',
      'lane', 'ln', 'crescent', 'cres', 'court', 'ct', 'place', 'pl',
      'boulevard', 'blvd', 'highway', 'hwy', 'terrace', 'tce'
    ];
    
    if (addressKeywords.some(keyword => lowerName.includes(` ${keyword}`))) {
      return true;
    }
    
    // Check if it's just a number (like "2 Manningtree Road")
    if (/^\d+\s/.test(name)) {
      return true;
    }
    
    // Check for known operators
    const knownOperators = [
      'regis', 'aveo', 'lendlease', 'stockland', 'anglicare', 'baptist care',
      'uniting', 'mercy health', 'japara', 'estia', 'bupa', 'irt',
      'arcare', 'juniper', 'southern cross care', 'tricare', 'abound'
    ];
    
    if (knownOperators.some(operator => lowerName === operator || lowerName.includes(operator))) {
      return true;
    }
    
    return false;
  };

  // Toggle flag for a village
  const toggleFlag = (villageId: string) => {
    setFlaggedIds(prev => {
      const newSet = new Set(prev);
      if (newSet.has(villageId)) {
        newSet.delete(villageId);
      } else {
        newSet.add(villageId);
      }
      return newSet;
    });
  };

  // Flag all suspicious villages
  const flagAllSuspicious = () => {
    const suspiciousVillages = villages.filter(v => isSuspiciousName(v.name));
    setFlaggedIds(new Set(suspiciousVillages.map(v => v.id)));
    alert(`Flagged ${suspiciousVillages.length} suspicious villages`);
  };

  // Clear all flags
  const clearAllFlags = () => {
    setFlaggedIds(new Set());
  };

  // Download flagged villages as CSV
  const downloadFlaggedCSV = () => {
    const flaggedVillages = villages.filter(v => flaggedIds.has(v.id));
    
    if (flaggedVillages.length === 0) {
      alert('No villages flagged for deletion');
      return;
    }

    const headers = ['ID', 'Name', 'Operator', 'Suburb', 'Postcode', 'Website'];
    const rows = flaggedVillages.map(v => [
      v.id,
      v.name,
      v.operator || '',
      v.suburb || '',
      v.postcode || '',
      v.website || ''
    ]);

    const csvContent = [
      headers.join(','),
      ...rows.map(row => row.map(cell => `"${cell}"`).join(','))
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `flagged-vic-villages-${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  // Filter villages based on search and flagged status
  useEffect(() => {
    let filtered = villages;

    // Filter by flagged status if enabled
    if (showFlaggedOnly) {
      filtered = filtered.filter(v => flaggedIds.has(v.id));
    }

    // Filter by search term
    if (searchTerm.trim()) {
      const term = searchTerm.toLowerCase();
      filtered = filtered.filter(v => 
        v.name.toLowerCase().includes(term) ||
        (v.operator && v.operator.toLowerCase().includes(term)) ||
        (v.suburb && v.suburb.toLowerCase().includes(term))
      );
    }

    setFilteredVillages(filtered);
  }, [searchTerm, villages, showFlaggedOnly, flaggedIds]);

  // Load on mount
  useEffect(() => {
    loadVillages();
  }, []);

  return (
    <Card className="p-6 bg-white border-2 border-blue-400">
      <div className="flex justify-between items-center mb-4">
        <div>
          <h2 className="text-2xl font-bold text-blue-900">
            📋 VIC Village Browser
          </h2>
          <p className="text-sm text-gray-600">
            Complete view of all Victorian retirement villages
          </p>
        </div>
        <Button
          onClick={loadVillages}
          disabled={loading}
          className="bg-blue-600 hover:bg-blue-700"
        >
          {loading ? (
            <>
              <Loader2 className="size-4 mr-2 animate-spin" />
              Loading...
            </>
          ) : (
            '🔄 Refresh Data'
          )}
        </Button>
      </div>

      {/* Stats */}
      {villages.length > 0 && (
        <div className="grid grid-cols-5 gap-4 mb-6">
          <div className="text-center p-4 bg-blue-50 rounded border border-blue-200">
            <div className="text-3xl font-bold text-blue-700">{stats.total}</div>
            <div className="text-xs text-blue-600 mt-1">Total Villages</div>
          </div>
          <div className="text-center p-4 bg-green-50 rounded border border-green-200">
            <div className="text-3xl font-bold text-green-700">{stats.hasOperator}</div>
            <div className="text-xs text-green-600 mt-1">Has Operator</div>
          </div>
          <div className="text-center p-4 bg-red-50 rounded border border-red-200">
            <div className="text-3xl font-bold text-red-700">{stats.noOperator}</div>
            <div className="text-xs text-red-600 mt-1">No Operator</div>
          </div>
          <div className="text-center p-4 bg-orange-50 rounded border border-orange-200">
            <div className="text-3xl font-bold text-orange-700">{stats.suspiciousNames}</div>
            <div className="text-xs text-orange-600 mt-1">Suspicious Names</div>
          </div>
          <div className="text-center p-4 bg-purple-50 rounded border border-purple-200">
            <div className="text-3xl font-bold text-purple-700">{flaggedIds.size}</div>
            <div className="text-xs text-purple-600 mt-1">Flagged</div>
          </div>
        </div>
      )}

      {/* Action Buttons */}
      {villages.length > 0 && (
        <div className="flex gap-3 mb-4 flex-wrap">
          <Button
            onClick={flagAllSuspicious}
            className="bg-orange-600 hover:bg-orange-700"
          >
            <Flag className="size-4 mr-2" />
            Flag All Suspicious ({stats.suspiciousNames})
          </Button>
          <Button
            onClick={clearAllFlags}
            variant="outline"
            disabled={flaggedIds.size === 0}
          >
            Clear All Flags
          </Button>
          <Button
            onClick={() => setShowFlaggedOnly(!showFlaggedOnly)}
            variant={showFlaggedOnly ? "default" : "outline"}
          >
            {showFlaggedOnly ? 'Show All' : `Show Flagged Only (${flaggedIds.size})`}
          </Button>
          <Button
            onClick={downloadFlaggedCSV}
            disabled={flaggedIds.size === 0}
            className="bg-purple-600 hover:bg-purple-700"
          >
            <Download className="size-4 mr-2" />
            Download Flagged CSV ({flaggedIds.size})
          </Button>
        </div>
      )}

      {/* Search */}
      <div className="mb-4">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 size-4" />
          <Input
            placeholder="Search by village name, operator, or suburb..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>
        <p className="text-xs text-gray-500 mt-1">
          Showing {filteredVillages.length} of {villages.length} villages
        </p>
      </div>

      {/* Table */}
      {loading ? (
        <div className="text-center py-12">
          <Loader2 className="size-8 animate-spin mx-auto text-blue-600" />
          <p className="text-gray-600 mt-2">Loading villages...</p>
        </div>
      ) : (
        <div className="border rounded overflow-hidden">
          <div className="max-h-[600px] overflow-y-auto">
            <table className="w-full text-sm">
              <thead className="bg-gray-100 sticky top-0 z-10">
                <tr>
                  <th className="p-3 text-center font-semibold">Flag</th>
                  <th className="p-3 text-left font-semibold">#</th>
                  <th className="p-3 text-left font-semibold">Village Name</th>
                  <th className="p-3 text-left font-semibold">Operator</th>
                  <th className="p-3 text-left font-semibold">Suburb</th>
                  <th className="p-3 text-left font-semibold">Postcode</th>
                  <th className="p-3 text-center font-semibold">Website</th>
                  <th className="p-3 text-center font-semibold">Status</th>
                </tr>
              </thead>
              <tbody>
                {filteredVillages.length === 0 ? (
                  <tr>
                    <td colSpan={8} className="p-8 text-center text-gray-500">
                      No villages found
                    </td>
                  </tr>
                ) : (
                  filteredVillages.map((village, idx) => {
                    const suspicious = isSuspiciousName(village.name);
                    return (
                      <tr 
                        key={village.id} 
                        className={`border-t hover:bg-gray-50 ${suspicious ? 'bg-orange-50' : ''}`}
                      >
                        <td className="p-3 text-center">
                          <Button
                            onClick={() => toggleFlag(village.id)}
                            size="sm"
                            variant={flaggedIds.has(village.id) ? "default" : "outline"}
                            className={flaggedIds.has(village.id) ? "bg-purple-600 hover:bg-purple-700" : ""}
                          >
                            <Flag className="size-4" />
                          </Button>
                        </td>
                        <td className="p-3 text-gray-500">{idx + 1}</td>
                        <td className="p-3">
                          <div className="flex items-center gap-2">
                            {suspicious && (
                              <AlertTriangle className="size-4 text-orange-600 flex-shrink-0" />
                            )}
                            <span className={suspicious ? 'text-orange-900 font-semibold' : 'font-medium'}>
                              {village.name}
                            </span>
                          </div>
                        </td>
                        <td className="p-3">
                          {village.operator ? (
                            <span className="text-green-700 font-medium">{village.operator}</span>
                          ) : (
                            <span className="text-gray-400 italic">No operator</span>
                          )}
                        </td>
                        <td className="p-3 text-gray-700">{village.suburb || '-'}</td>
                        <td className="p-3 text-gray-700">{village.postcode || '-'}</td>
                        <td className="p-3 text-center">
                          {village.website ? (
                            <a
                              href={village.website}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="inline-flex items-center gap-1 text-blue-600 hover:text-blue-800"
                            >
                              <ExternalLink className="size-3" />
                              <span className="text-xs">Visit</span>
                            </a>
                          ) : (
                            <span className="text-gray-400 text-xs">No website</span>
                          )}
                        </td>
                        <td className="p-3 text-center">
                          {suspicious ? (
                            <Badge className="bg-orange-600">
                              <AlertTriangle className="size-3 mr-1" />
                              Suspicious
                            </Badge>
                          ) : village.operator ? (
                            <Badge className="bg-green-600">OK</Badge>
                          ) : (
                            <Badge className="bg-gray-500">Missing Op</Badge>
                          )}
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Legend */}
      {villages.length > 0 && (
        <div className="mt-4 p-4 bg-gray-50 rounded border">
          <h4 className="font-semibold text-sm mb-2">🔍 What makes a name "Suspicious"?</h4>
          <ul className="text-xs text-gray-600 space-y-1">
            <li>• Contains street address words (Road, Street, Avenue, Drive, etc.)</li>
            <li>• Starts with a number (e.g., "2 Manningtree Road")</li>
            <li>• Matches a known operator name (e.g., "Abound Communities", "Regis")</li>
          </ul>
        </div>
      )}
    </Card>
  );
}