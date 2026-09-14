import React, { useState, useEffect } from 'react';
import { Card } from '../ui/card';
import { Button } from '../ui/button';
import { Badge } from '../ui/badge';
import { Alert, AlertDescription } from '../ui/alert';
import { Download, CheckCircle, XCircle, AlertTriangle, Search, RefreshCw } from 'lucide-react';
import { getSupabaseClient } from '../../utils/supabase/client';

interface VillageAudit {
  id: string;
  name: string;
  operator: string;
  suburb: string;
  postcode: string;
  website: string;
  status: 'good' | 'bad' | 'missing';
  issue?: string;
}

export function VICOperatorAudit() {
  const [loading, setLoading] = useState(false);
  const [villages, setVillages] = useState<VillageAudit[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState<'all' | 'good' | 'bad' | 'missing'>('all');

  const analyzeOperator = (village: { name: string; operator: string }): VillageAudit['status'] => {
    if (!village.operator) return 'missing';
    
    const nameLower = village.name.toLowerCase().replace(/[^a-z0-9\s]/g, '');
    const operatorLower = village.operator.toLowerCase().replace(/[^a-z0-9\s]/g, '');
    
    // Check if operator is same as village name (bad)
    if (nameLower === operatorLower) return 'bad';
    
    // Check if operator contains most of the village name words (likely bad)
    const nameWords = nameLower.split(/\s+/).filter(w => w.length > 3);
    const operatorWords = operatorLower.split(/\s+/);
    const matchingWords = nameWords.filter(word => 
      operatorWords.some(opWord => opWord.includes(word) || word.includes(opWord))
    );
    
    if (nameWords.length > 0 && matchingWords.length >= nameWords.length * 0.7) {
      return 'bad';
    }
    
    // Known good operators
    const knownOperators = [
      'regis', 'aveo', 'lendlease', 'stockland', 'anglicare', 'baptist care',
      'uniting', 'mercy', 'japara', 'estia', 'bupa', 'irt', 'arcare', 'juniper',
      'southern cross care', 'villa maria', 'tricare', 'hall prior', 'bethanie',
      'bluecross', 'churches of christ', 'jewish care', 'catholic healthcare',
      'opal', 'respect', 'prescare', 'bolton clarke', 'allity', 'resthaven',
      'benetas', 'rsl care', 'wesley mission', 'whiddon', 'hammondcare'
    ];
    
    const hasKnownOperator = knownOperators.some(known => operatorLower.includes(known));
    if (hasKnownOperator) return 'good';
    
    // If operator is very different from village name and has reasonable length
    if (village.operator.length >= 3 && village.operator.length <= 50) {
      return 'good';
    }
    
    return 'bad';
  };

  const loadAudit = async () => {
    setLoading(true);
    try {
      const supabase = getSupabaseClient();
      const { data, error } = await supabase
        .from('retirement_villages')
        .select('id, name, operator, suburb, postcode, website')
        .eq('state', 'VIC')
        .order('name');

      if (error) throw error;

      const audited: VillageAudit[] = (data || []).map(village => {
        const status = analyzeOperator(village);
        let issue = '';
        
        if (status === 'bad') {
          issue = 'Operator appears to be village name or incorrect';
        } else if (status === 'missing') {
          issue = 'No operator specified';
        }
        
        return {
          id: village.id,
          name: village.name,
          operator: village.operator || '',
          suburb: village.suburb || '',
          postcode: village.postcode || '',
          website: village.website || '',
          status,
          issue,
        };
      });

      setVillages(audited);
    } catch (err) {
      console.error('Error loading audit:', err);
      alert(`Error: ${err instanceof Error ? err.message : 'Failed to load villages'}`);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadAudit();
  }, []);

  const stats = {
    total: villages.length,
    good: villages.filter(v => v.status === 'good').length,
    bad: villages.filter(v => v.status === 'bad').length,
    missing: villages.filter(v => v.status === 'missing').length,
  };

  const filteredVillages = villages.filter(v => {
    const matchesSearch = !searchTerm || 
      v.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      v.operator.toLowerCase().includes(searchTerm.toLowerCase()) ||
      v.suburb.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesFilter = filterStatus === 'all' || v.status === filterStatus;
    
    return matchesSearch && matchesFilter;
  });

  const downloadCSV = () => {
    const csv = [
      ['ID', 'Village Name', 'Current Operator', 'Suburb', 'Postcode', 'Website', 'Status', 'Issue'],
      ...villages.map(v => [
        v.id,
        v.name,
        v.operator,
        v.suburb,
        v.postcode,
        v.website,
        v.status.toUpperCase(),
        v.issue || '',
      ]),
    ].map(row => row.map(cell => `"${cell}"`).join(',')).join('\n');

    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `vic-operator-audit-${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const downloadBadOnly = () => {
    const badVillages = villages.filter(v => v.status === 'bad' || v.status === 'missing');
    const csv = [
      ['ID', 'Village Name', 'Current Operator', 'Suburb', 'Postcode', 'Website', 'Status', 'Issue'],
      ...badVillages.map(v => [
        v.id,
        v.name,
        v.operator,
        v.suburb,
        v.postcode,
        v.website,
        v.status.toUpperCase(),
        v.issue || '',
      ]),
    ].map(row => row.map(cell => `"${cell}"`).join(',')).join('\n');

    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `vic-operator-ISSUES-ONLY-${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <Card className="p-6 bg-white border-2 border-blue-400">
      <div className="flex justify-between items-start mb-4">
        <div>
          <h2 className="text-2xl font-bold text-blue-900 flex items-center gap-2">
            📊 VIC Operator Audit Report
          </h2>
          <p className="text-sm text-gray-600 mt-1">
            Complete analysis of VIC village operator data quality
          </p>
        </div>
        <Button
          size="sm"
          onClick={loadAudit}
          disabled={loading}
          className="bg-blue-600 hover:bg-blue-700"
        >
          <RefreshCw className={`size-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
          Refresh
        </Button>
      </div>

      {/* Stats Summary */}
      <div className="grid grid-cols-4 gap-4 mb-6">
        <Card className="p-4 bg-gray-50 border-gray-300">
          <div className="text-3xl font-bold text-gray-700">{stats.total}</div>
          <div className="text-sm text-gray-600">Total Villages</div>
        </Card>
        <Card className="p-4 bg-green-50 border-green-300">
          <div className="text-3xl font-bold text-green-700">{stats.good}</div>
          <div className="text-sm text-green-600">Good ({Math.round(stats.good / stats.total * 100)}%)</div>
        </Card>
        <Card className="p-4 bg-red-50 border-red-300">
          <div className="text-3xl font-bold text-red-700">{stats.bad}</div>
          <div className="text-sm text-red-600">Needs Fix ({Math.round(stats.bad / stats.total * 100)}%)</div>
        </Card>
        <Card className="p-4 bg-yellow-50 border-yellow-300">
          <div className="text-3xl font-bold text-yellow-700">{stats.missing}</div>
          <div className="text-sm text-yellow-600">Missing ({Math.round(stats.missing / stats.total * 100)}%)</div>
        </Card>
      </div>

      <Alert className="mb-4 bg-blue-50 border-blue-300">
        <AlertDescription className="text-sm">
          <strong>What this shows:</strong> Current state of ALL VIC villages after scraping.
          <br />
          <strong className="text-green-700">✓ Good:</strong> Operator looks correct (Regis, Aveo, etc.)
          <br />
          <strong className="text-red-700">✗ Needs Fix:</strong> Operator is village name or incorrect
          <br />
          <strong className="text-yellow-700">⚠ Missing:</strong> No operator data
        </AlertDescription>
      </Alert>

      {/* Filter and Search */}
      <div className="flex gap-3 mb-4">
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 size-4 text-gray-400" />
          <input
            type="text"
            placeholder="Search by village, operator, or suburb..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border rounded-lg"
          />
        </div>
        <div className="flex gap-2">
          <Button
            size="sm"
            variant={filterStatus === 'all' ? 'default' : 'outline'}
            onClick={() => setFilterStatus('all')}
          >
            All ({stats.total})
          </Button>
          <Button
            size="sm"
            variant={filterStatus === 'good' ? 'default' : 'outline'}
            onClick={() => setFilterStatus('good')}
            className={filterStatus === 'good' ? 'bg-green-600' : ''}
          >
            Good ({stats.good})
          </Button>
          <Button
            size="sm"
            variant={filterStatus === 'bad' ? 'default' : 'outline'}
            onClick={() => setFilterStatus('bad')}
            className={filterStatus === 'bad' ? 'bg-red-600' : ''}
          >
            Bad ({stats.bad})
          </Button>
          <Button
            size="sm"
            variant={filterStatus === 'missing' ? 'default' : 'outline'}
            onClick={() => setFilterStatus('missing')}
            className={filterStatus === 'missing' ? 'bg-yellow-600' : ''}
          >
            Missing ({stats.missing})
          </Button>
        </div>
      </div>

      {/* Export Buttons */}
      <div className="flex gap-3 mb-4">
        <Button
          onClick={downloadCSV}
          className="bg-green-600 hover:bg-green-700"
        >
          <Download className="size-4 mr-2" />
          Download Full Report (CSV)
        </Button>
        <Button
          onClick={downloadBadOnly}
          className="bg-red-600 hover:bg-red-700"
        >
          <Download className="size-4 mr-2" />
          Download Issues Only (CSV)
        </Button>
      </div>

      {/* Results Table */}
      {loading ? (
        <div className="text-center py-12">
          <RefreshCw className="size-8 animate-spin mx-auto mb-3 text-gray-400" />
          <p className="text-gray-600">Loading audit data...</p>
        </div>
      ) : (
        <div className="border rounded-lg overflow-hidden">
          <div className="max-h-[600px] overflow-y-auto">
            <table className="w-full text-sm">
              <thead className="bg-gray-100 sticky top-0">
                <tr>
                  <th className="text-left px-3 py-2">Status</th>
                  <th className="text-left px-3 py-2">Village Name</th>
                  <th className="text-left px-3 py-2">Current Operator</th>
                  <th className="text-left px-3 py-2">Location</th>
                  <th className="text-left px-3 py-2">Issue</th>
                </tr>
              </thead>
              <tbody className="divide-y">
                {filteredVillages.map((village) => (
                  <tr key={village.id} className="hover:bg-gray-50">
                    <td className="px-3 py-2">
                      {village.status === 'good' && (
                        <Badge className="bg-green-600">
                          <CheckCircle className="size-3 mr-1" />
                          Good
                        </Badge>
                      )}
                      {village.status === 'bad' && (
                        <Badge className="bg-red-600">
                          <XCircle className="size-3 mr-1" />
                          Bad
                        </Badge>
                      )}
                      {village.status === 'missing' && (
                        <Badge className="bg-yellow-600">
                          <AlertTriangle className="size-3 mr-1" />
                          Missing
                        </Badge>
                      )}
                    </td>
                    <td className="px-3 py-2 font-medium">{village.name}</td>
                    <td className="px-3 py-2">
                      <span className={village.status === 'good' ? 'text-green-700 font-semibold' : 'text-gray-700'}>
                        {village.operator || <span className="text-gray-400 italic">None</span>}
                      </span>
                    </td>
                    <td className="px-3 py-2 text-gray-600">
                      {village.suburb}
                      {village.postcode && ` ${village.postcode}`}
                    </td>
                    <td className="px-3 py-2 text-xs text-red-600">
                      {village.issue}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <div className="bg-gray-50 px-4 py-2 text-sm text-gray-600 border-t">
            Showing {filteredVillages.length} of {villages.length} villages
          </div>
        </div>
      )}
    </Card>
  );
}
