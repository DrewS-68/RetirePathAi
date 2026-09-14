import React, { useState } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { projectId, publicAnonKey } from '../../utils/supabase/info';
import { 
  AlertCircle, 
  CheckCircle, 
  XCircle, 
  BarChart3, 
  Loader,
  FileText,
  Globe,
  MapPin,
  Building2,
  Download,
  Copy
} from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';
import { Badge } from '../ui/badge';

interface StateAnalysis {
  state: string;
  totalVillages: number;
  directoryUrls: number;
  realWebsites: number;
  noWebsite: number;
  directoryUrlPercentage: number;
  realWebsitePercentage: number;
  noWebsitePercentage: number;
  examples: {
    directory: Array<{name: string; website: string; operator: string}>;
    real: Array<{name: string; website: string; operator: string}>;
    noWebsite: Array<{name: string; operator: string}>;
  };
  dataQualityIssues: {
    operatorIsAddress: number;
    villageNameIsAddress: number;
    missingOperator: number;
  };
  // Store full village data for export
  directoryUrlVillages?: any[];
}

interface AnalysisReport {
  totalVillages: number;
  byState: StateAnalysis[];
  overallStats: {
    totalDirectoryUrls: number;
    totalRealWebsites: number;
    totalNoWebsite: number;
    directoryUrlPercentage: number;
    realWebsitePercentage: number;
    noWebsitePercentage: number;
  };
  analyzedAt: string;
  // Store all villages for export
  allVillages?: any[];
}

const DIRECTORY_PATTERNS = [
  'agedcareonline.com.au',
  'retirementliving.com.au/directory',
  'retirementvillages.com.au/village',
  'aged-care-guide.com.au',
  'yourlifechoices.com.au/retirement'
];

export function DataQualityAnalyzer() {
  const { accessToken } = useAuth();
  const [loading, setLoading] = useState(false);
  const [report, setReport] = useState<AnalysisReport | null>(null);

  const isDirectoryUrl = (url: string | null): boolean => {
    if (!url) return false;
    const lowerUrl = url.toLowerCase();
    return DIRECTORY_PATTERNS.some(pattern => lowerUrl.includes(pattern));
  };

  const isAddressLike = (text: string | null): boolean => {
    if (!text) return false;
    // Check if text contains street indicators
    const streetKeywords = [' st ', ' street ', ' rd ', ' road ', ' ave ', ' avenue ', ' dr ', ' drive ', ' cres ', ' crescent ', ' way ', ' pl ', ' place '];
    const lowerText = text.toLowerCase();
    return streetKeywords.some(keyword => lowerText.includes(keyword)) || /^\d+\s/.test(text);
  };

  const runAnalysis = async () => {
    try {
      setLoading(true);
      
      // Fetch all villages from database
      const response = await fetch(
        `https://${projectId}.supabase.co/functions/v1/make-server-3bba8be8/villages/all`,
        {
          headers: {
            'Authorization': `Bearer ${publicAnonKey}`,
            'Content-Type': 'application/json'
          }
        }
      );

      if (!response.ok) {
        throw new Error('Failed to fetch villages');
      }

      const villages = await response.json();
      console.log(`Analyzing ${villages.length} total villages...`);

      // Group by state
      const stateGroups: {[key: string]: any[]} = {};
      villages.forEach((village: any) => {
        const state = village.state || 'UNKNOWN';
        if (!stateGroups[state]) {
          stateGroups[state] = [];
        }
        stateGroups[state].push(village);
      });

      // Analyze each state
      const stateAnalyses: StateAnalysis[] = [];
      
      for (const [state, stateVillages] of Object.entries(stateGroups)) {
        const directoryVillages = stateVillages.filter(v => isDirectoryUrl(v.website));
        const realWebsiteVillages = stateVillages.filter(v => v.website && !isDirectoryUrl(v.website));
        const noWebsiteVillages = stateVillages.filter(v => !v.website);

        const operatorIsAddress = stateVillages.filter(v => isAddressLike(v.operator)).length;
        const villageNameIsAddress = stateVillages.filter(v => isAddressLike(v.name)).length;
        const missingOperator = stateVillages.filter(v => !v.operator || v.operator === '').length;

        stateAnalyses.push({
          state,
          totalVillages: stateVillages.length,
          directoryUrls: directoryVillages.length,
          realWebsites: realWebsiteVillages.length,
          noWebsite: noWebsiteVillages.length,
          directoryUrlPercentage: (directoryVillages.length / stateVillages.length) * 100,
          realWebsitePercentage: (realWebsiteVillages.length / stateVillages.length) * 100,
          noWebsitePercentage: (noWebsiteVillages.length / stateVillages.length) * 100,
          examples: {
            directory: directoryVillages.slice(0, 5).map(v => ({
              name: v.name,
              website: v.website,
              operator: v.operator || 'N/A'
            })),
            real: realWebsiteVillages.slice(0, 5).map(v => ({
              name: v.name,
              website: v.website,
              operator: v.operator || 'N/A'
            })),
            noWebsite: noWebsiteVillages.slice(0, 5).map(v => ({
              name: v.name,
              operator: v.operator || 'N/A'
            }))
          },
          dataQualityIssues: {
            operatorIsAddress,
            villageNameIsAddress,
            missingOperator
          },
          directoryUrlVillages: directoryVillages
        });
      }

      // Sort by state name
      stateAnalyses.sort((a, b) => a.state.localeCompare(b.state));

      // Calculate overall stats
      const totalDirectoryUrls = stateAnalyses.reduce((sum, s) => sum + s.directoryUrls, 0);
      const totalRealWebsites = stateAnalyses.reduce((sum, s) => sum + s.realWebsites, 0);
      const totalNoWebsite = stateAnalyses.reduce((sum, s) => sum + s.noWebsite, 0);
      const totalVillages = villages.length;

      const analysisReport: AnalysisReport = {
        totalVillages,
        byState: stateAnalyses,
        overallStats: {
          totalDirectoryUrls,
          totalRealWebsites,
          totalNoWebsite,
          directoryUrlPercentage: (totalDirectoryUrls / totalVillages) * 100,
          realWebsitePercentage: (totalRealWebsites / totalVillages) * 100,
          noWebsitePercentage: (totalNoWebsite / totalVillages) * 100
        },
        analyzedAt: new Date().toISOString(),
        allVillages: villages
      };

      setReport(analysisReport);
      console.log('Analysis complete:', analysisReport);
    } catch (error) {
      console.error('Error running analysis:', error);
      alert(`Analysis failed: ${error}`);
    } finally {
      setLoading(false);
    }
  };

  const getHealthStatus = (percentage: number) => {
    if (percentage >= 80) return { color: 'text-red-600', bg: 'bg-red-50', label: '🔴 CRITICAL' };
    if (percentage >= 50) return { color: 'text-orange-600', bg: 'bg-orange-50', label: '🟡 POOR' };
    if (percentage >= 20) return { color: 'text-yellow-600', bg: 'bg-yellow-50', label: '⚠️ FAIR' };
    return { color: 'text-green-600', bg: 'bg-green-50', label: '✅ GOOD' };
  };

  const exportDirectoryUrlVillages = (state: string) => {
    if (!report) return;
    
    const stateData = report.byState.find(s => s.state === state);
    if (!stateData || !stateData.directoryUrlVillages) return;
    
    const villages = stateData.directoryUrlVillages;
    
    // Create CSV content
    const headers = ['ID', 'Name', 'Operator', 'Suburb', 'Postcode', 'State', 'Current Website (BAD)', 'Location', 'New URL (PASTE CORRECT URL HERE)'];
    const rows = villages.map(v => [
      v.id,
      v.name,
      v.operator || '',
      v.suburb || '',
      v.postcode || '',
      v.state,
      v.website || '',
      v.location || '',
      '' // Empty column for user to fill in
    ]);
    
    const csv = [
      headers.join(','),
      ...rows.map(row => row.map(cell => `"${cell}"`).join(','))
    ].join('\n');
    
    // Download CSV
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${state}_bad_directory_urls_${villages.length}_villages.csv`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    window.URL.revokeObjectURL(url);
    
    console.log(`✅ Exported ${villages.length} ${state} villages with directory URLs`);
  };

  const copyVillageIDsToClipboard = (state: string) => {
    if (!report) return;
    
    const stateData = report.byState.find(s => s.state === state);
    if (!stateData || !stateData.directoryUrlVillages) return;
    
    const ids = stateData.directoryUrlVillages.map(v => v.id).join('\n');
    
    navigator.clipboard.writeText(ids).then(() => {
      alert(`✅ Copied ${stateData.directoryUrlVillages?.length} village IDs to clipboard!\n\nYou can now paste these into your URL fixer tool.`);
    }).catch(err => {
      console.error('Failed to copy:', err);
      alert('Failed to copy to clipboard');
    });
  };

  return (
    <div className="p-6 max-w-7xl mx-auto">
      <div className="mb-6">
        <h1 className="text-3xl font-bold mb-2 flex items-center gap-2">
          <BarChart3 className="size-8" />
          Data Quality Analyzer
        </h1>
        <p className="text-gray-600">
          Comprehensive analysis of all villages in the database to identify data quality issues
        </p>
      </div>

      <Card className="mb-6">
        <CardHeader>
          <CardTitle>Run Analysis</CardTitle>
          <CardDescription>
            This will analyze all villages across all states to identify:
            <ul className="list-disc list-inside mt-2 space-y-1">
              <li>Directory URLs vs Real Village Websites</li>
              <li>Operator name quality (detecting address-like entries)</li>
              <li>Village name quality (detecting incomplete names)</li>
              <li>Missing data fields</li>
            </ul>
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Button 
            onClick={runAnalysis} 
            disabled={loading}
            size="lg"
            className="w-full sm:w-auto"
          >
            {loading ? (
              <>
                <Loader className="mr-2 size-4 animate-spin" />
                Analyzing Database...
              </>
            ) : (
              <>
                <BarChart3 className="mr-2 size-4" />
                Run Full Analysis
              </>
            )}
          </Button>
        </CardContent>
      </Card>

      {report && (
        <div className="space-y-6">
          {/* Overall Summary */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Globe className="size-5" />
                Overall Summary
              </CardTitle>
              <CardDescription>
                Analyzed {report.totalVillages} villages across {report.byState.length} states on {new Date(report.analyzedAt).toLocaleString()}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className={`p-4 rounded-lg ${getHealthStatus(report.overallStats.directoryUrlPercentage).bg}`}>
                  <div className="text-sm text-gray-600 mb-1">Directory URLs</div>
                  <div className={`text-2xl font-bold ${getHealthStatus(report.overallStats.directoryUrlPercentage).color}`}>
                    {report.overallStats.totalDirectoryUrls}
                  </div>
                  <div className="text-sm text-gray-600">
                    {report.overallStats.directoryUrlPercentage.toFixed(1)}% of total
                  </div>
                  <Badge className="mt-2" variant="outline">
                    {getHealthStatus(report.overallStats.directoryUrlPercentage).label}
                  </Badge>
                </div>

                <div className="p-4 rounded-lg bg-green-50">
                  <div className="text-sm text-gray-600 mb-1">Real Village Websites</div>
                  <div className="text-2xl font-bold text-green-600">
                    {report.overallStats.totalRealWebsites}
                  </div>
                  <div className="text-sm text-gray-600">
                    {report.overallStats.realWebsitePercentage.toFixed(1)}% of total
                  </div>
                  <Badge className="mt-2" variant="outline">✅ GOOD</Badge>
                </div>

                <div className="p-4 rounded-lg bg-gray-50">
                  <div className="text-sm text-gray-600 mb-1">No Website</div>
                  <div className="text-2xl font-bold text-gray-600">
                    {report.overallStats.totalNoWebsite}
                  </div>
                  <div className="text-sm text-gray-600">
                    {report.overallStats.noWebsitePercentage.toFixed(1)}% of total
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* State-by-State Breakdown */}
          <div>
            <h2 className="text-2xl font-bold mb-4">State-by-State Analysis</h2>
            <div className="space-y-4">
              {report.byState.map(state => {
                const health = getHealthStatus(state.directoryUrlPercentage);
                
                return (
                  <Card key={state.state}>
                    <CardHeader>
                      <div className="flex items-center justify-between">
                        <CardTitle className="flex items-center gap-2">
                          <MapPin className="size-5" />
                          {state.state}
                        </CardTitle>
                        <Badge className={health.bg + ' ' + health.color}>
                          {health.label}
                        </Badge>
                      </div>
                      <CardDescription>
                        {state.totalVillages} total villages
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      {/* Stats Grid */}
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                        <div className={`p-3 rounded-lg ${health.bg}`}>
                          <div className="text-xs text-gray-600 mb-1">Directory URLs</div>
                          <div className={`text-xl font-bold ${health.color}`}>
                            {state.directoryUrls} ({state.directoryUrlPercentage.toFixed(1)}%)
                          </div>
                        </div>

                        <div className="p-3 rounded-lg bg-green-50">
                          <div className="text-xs text-gray-600 mb-1">Real Websites</div>
                          <div className="text-xl font-bold text-green-600">
                            {state.realWebsites} ({state.realWebsitePercentage.toFixed(1)}%)
                          </div>
                        </div>

                        <div className="p-3 rounded-lg bg-gray-50">
                          <div className="text-xs text-gray-600 mb-1">No Website</div>
                          <div className="text-xl font-bold text-gray-600">
                            {state.noWebsite} ({state.noWebsitePercentage.toFixed(1)}%)
                          </div>
                        </div>
                      </div>

                      {/* Data Quality Issues */}
                      <div className="mb-6">
                        <h4 className="font-semibold mb-2 flex items-center gap-2">
                          <AlertCircle className="size-4" />
                          Data Quality Issues
                        </h4>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-2 text-sm">
                          <div className="flex items-center gap-2">
                            {state.dataQualityIssues.operatorIsAddress > 0 ? (
                              <XCircle className="size-4 text-red-500" />
                            ) : (
                              <CheckCircle className="size-4 text-green-500" />
                            )}
                            <span>Operator is Address: <strong>{state.dataQualityIssues.operatorIsAddress}</strong></span>
                          </div>
                          <div className="flex items-center gap-2">
                            {state.dataQualityIssues.villageNameIsAddress > 0 ? (
                              <XCircle className="size-4 text-red-500" />
                            ) : (
                              <CheckCircle className="size-4 text-green-500" />
                            )}
                            <span>Village Name is Address: <strong>{state.dataQualityIssues.villageNameIsAddress}</strong></span>
                          </div>
                          <div className="flex items-center gap-2">
                            {state.dataQualityIssues.missingOperator > 0 ? (
                              <XCircle className="size-4 text-red-500" />
                            ) : (
                              <CheckCircle className="size-4 text-green-500" />
                            )}
                            <span>Missing Operator: <strong>{state.dataQualityIssues.missingOperator}</strong></span>
                          </div>
                        </div>
                      </div>

                      {/* Examples */}
                      {state.directoryUrls > 0 && (
                        <div className="border-t pt-4">
                          <div className="flex items-center justify-between mb-3">
                            <h4 className="font-semibold text-sm">Directory URL Examples (showing 5 of {state.directoryUrls}):</h4>
                            <div className="flex gap-2">
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => copyVillageIDsToClipboard(state.state)}
                              >
                                <Copy className="size-3 mr-1" />
                                Copy IDs
                              </Button>
                              <Button
                                size="sm"
                                onClick={() => exportDirectoryUrlVillages(state.state)}
                              >
                                <Download className="size-3 mr-1" />
                                Export CSV ({state.directoryUrls})
                              </Button>
                            </div>
                          </div>
                          <div className="space-y-2 text-sm">
                            {state.examples.directory.map((ex, idx) => (
                              <div key={idx} className="bg-red-50 p-2 rounded">
                                <div className="font-medium">{ex.name}</div>
                                <div className="text-xs text-gray-600">Operator: {ex.operator}</div>
                                <div className="text-xs text-red-600 truncate">URL: {ex.website}</div>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}

                      {state.realWebsites > 0 && state.examples.real.length > 0 && (
                        <div className="border-t pt-4 mt-4">
                          <h4 className="font-semibold mb-2 text-sm">Real Website Examples (Good Data):</h4>
                          <div className="space-y-2 text-sm">
                            {state.examples.real.map((ex, idx) => (
                              <div key={idx} className="bg-green-50 p-2 rounded">
                                <div className="font-medium">{ex.name}</div>
                                <div className="text-xs text-gray-600">Operator: {ex.operator}</div>
                                <div className="text-xs text-green-600 truncate">URL: {ex.website}</div>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          </div>

          {/* Recommendations */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <FileText className="size-5" />
                Recommendations
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {report.byState.map(state => {
                  if (state.directoryUrlPercentage >= 80) {
                    return (
                      <div key={state.state} className="p-4 bg-red-50 border border-red-200 rounded-lg">
                        <div className="flex items-start gap-2">
                          <AlertCircle className="size-5 text-red-600 mt-0.5" />
                          <div>
                            <div className="font-semibold text-red-900">
                              🔴 CRITICAL: {state.state} - Delete and Rebuild
                            </div>
                            <div className="text-sm text-red-800 mt-1">
                              {state.directoryUrlPercentage.toFixed(1)}% of villages have directory URLs. 
                              <strong> Recommend deleting all {state.totalVillages} {state.state} villages and rebuilding from scratch.</strong>
                            </div>
                          </div>
                        </div>
                      </div>
                    );
                  } else if (state.directoryUrlPercentage >= 50) {
                    return (
                      <div key={state.state} className="p-4 bg-orange-50 border border-orange-200 rounded-lg">
                        <div className="flex items-start gap-2">
                          <AlertCircle className="size-5 text-orange-600 mt-0.5" />
                          <div>
                            <div className="font-semibold text-orange-900">
                              🟡 POOR: {state.state} - Build URL Fixer Tool
                            </div>
                            <div className="text-sm text-orange-800 mt-1">
                              {state.directoryUrlPercentage.toFixed(1)}% directory URLs. 
                              Consider building a tool to extract real URLs from directory pages or manually fixing {state.directoryUrls} villages.
                            </div>
                          </div>
                        </div>
                      </div>
                    );
                  } else if (state.directoryUrlPercentage >= 20) {
                    return (
                      <div key={state.state} className="p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
                        <div className="flex items-start gap-2">
                          <AlertCircle className="size-5 text-yellow-600 mt-0.5" />
                          <div>
                            <div className="font-semibold text-yellow-900">
                              ⚠️ FAIR: {state.state} - Manual Cleanup
                            </div>
                            <div className="text-sm text-yellow-800 mt-1">
                              {state.directoryUrlPercentage.toFixed(1)}% directory URLs. 
                              Manually fix {state.directoryUrls} villages with bad data.
                            </div>
                          </div>
                        </div>
                      </div>
                    );
                  }
                  return null;
                })}

                {report.byState.every(s => s.directoryUrlPercentage < 20) && (
                  <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
                    <div className="flex items-start gap-2">
                      <CheckCircle className="size-5 text-green-600 mt-0.5" />
                      <div>
                        <div className="font-semibold text-green-900">
                          ✅ All States Look Good!
                        </div>
                        <div className="text-sm text-green-800 mt-1">
                          No critical data quality issues detected. Minor cleanup may be needed for some villages.
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}