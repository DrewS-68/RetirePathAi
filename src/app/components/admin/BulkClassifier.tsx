import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';
import { Badge } from '../ui/badge';
import { Alert, AlertDescription } from '../ui/alert';
import { 
  AlertTriangle, 
  CheckCircle, 
  Download, 
  Play, 
  BarChart3,
  Building2,
  AlertCircle
} from 'lucide-react';
import { projectId, publicAnonKey } from '../../utils/supabase/info';

interface AnalysisResult {
  total: number;
  alreadyClassified: number;
  needsClassification: number;
  breakdown: {
    retirement_village: number;
    aged_care: number;
    both: number;
    unable_to_classify: number;
  };
  changesCount: number;
  villages: Array<{
    id: string;
    name: string;
    suburb: string;
    state: string;
    currentType: string;
    detectedType: string;
    willChange: boolean;
  }>;
}

export default function BulkClassifier({ accessToken }: { accessToken: string | null }) {
  const [loading, setLoading] = useState(false);
  const [analyzing, setAnalyzing] = useState(false);
  const [isApplying, setIsApplying] = useState(false);
  const [analysisResult, setAnalysisResult] = useState<AnalysisResult | null>(null);
  const [applyResult, setApplyResult] = useState<any>(null);
  const [applyError, setApplyError] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const runAnalysis = async () => {
    try {
      setAnalyzing(true);
      setError(null);
      setApplyResult(null);

      const response = await fetch(
        `https://${projectId}.supabase.co/functions/v1/make-server-3bba8be8/bulk-classifier/analyze`,
        {
          method: 'GET',
          headers: {
            'Authorization': `Bearer ${publicAnonKey}`,
            'Content-Type': 'application/json',
          },
        }
      );

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Analysis failed');
      }

      const result = await response.json();
      setAnalysisResult(result);
      console.log('Analysis complete:', result);
    } catch (err) {
      console.error('Analysis error:', err);
      setError(err instanceof Error ? err.message : 'Analysis failed');
    } finally {
      setAnalyzing(false);
    }
  };

  const handleApply = async () => {
    setIsApplying(true);
    setApplyResult(null);
    setApplyError(null);

    try {
      const response = await fetch(
        `https://${projectId}.supabase.co/functions/v1/make-server-3bba8be8/bulk-classifier/apply`,
        {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${publicAnonKey}`,
            'Content-Type': 'application/json',
          },
        }
      );

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to apply classifications');
      }

      const result = await response.json();
      console.log('Application complete:', result);
      
      // Log errors if they exist
      if (result.errors && result.errors.length > 0) {
        console.error('❌ APPLICATION ERRORS:', result.errors);
      }

      setApplyResult(result);

      // Refresh analysis data after applying
      await runAnalysis();
    } catch (error) {
      console.error('Apply error:', error);
      setApplyError(error instanceof Error ? error.message : 'Unknown error');
    } finally {
      setIsApplying(false);
    }
  };

  const downloadCSV = () => {
    if (!analysisResult) return;

    const csvContent = [
      ['Name', 'Suburb', 'State', 'Current Type', 'Detected Type', 'Will Change?'].join(','),
      ...analysisResult.villages.map(v => 
        [v.name, v.suburb, v.state, v.currentType, v.detectedType, v.willChange ? 'YES' : 'NO'].join(',')
      )
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `village-classification-analysis-${new Date().toISOString()}.csv`;
    a.click();
    window.URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <BarChart3 className="h-5 w-5" />
            Bulk Facility Type Classifier
          </CardTitle>
          <CardDescription>
            Analyze and classify all villages in the database as Retirement Villages, Aged Care Facilities, or Both
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <Alert>
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>
              This tool will analyze all {analysisResult?.total || '~2,569'} villages in your database and automatically classify them based on their content (name, description, amenities, care services, etc.). Review the results before applying changes.
            </AlertDescription>
          </Alert>

          {analysisResult && analysisResult.total < 2000 && (
            <Alert className="border-yellow-200 bg-yellow-50">
              <AlertCircle className="h-4 w-4 text-yellow-600" />
              <AlertDescription className="text-yellow-900">
                <strong>Note:</strong> Currently showing {analysisResult.total} villages. If you expected more (e.g., 2,569), this might be due to:
                <ul className="list-disc ml-5 mt-2 space-y-1">
                  <li>Recent database cleanup or deletion of duplicates</li>
                  <li>Filtering applied in the database (e.g., only approved villages)</li>
                  <li>Different environment (staging vs production)</li>
                </ul>
              </AlertDescription>
            </Alert>
          )}

          <div className="flex gap-3">
            <Button
              onClick={runAnalysis}
              disabled={analyzing || isApplying}
              className="flex items-center gap-2"
            >
              {analyzing ? (
                <>
                  <div className="h-4 w-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  Analyzing...
                </>
              ) : (
                <>
                  <Play className="h-4 w-4" />
                  Run Analysis
                </>
              )}
            </Button>

            {analysisResult && (
              <>
                <Button
                  variant="outline"
                  onClick={downloadCSV}
                  className="flex items-center gap-2"
                >
                  <Download className="h-4 w-4" />
                  Download CSV
                </Button>

                {analysisResult.changesCount > 0 && (
                  <Button
                    variant="default"
                    onClick={handleApply}
                    disabled={isApplying}
                    className="flex items-center gap-2 bg-green-600 hover:bg-green-700"
                  >
                    {isApplying ? (
                      <>
                        <div className="h-4 w-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                        Applying...
                      </>
                    ) : (
                      <>
                        <CheckCircle className="h-4 w-4" />
                        Apply Classifications ({analysisResult.changesCount})
                      </>
                    )}
                  </Button>
                )}
              </>
            )}
          </div>

          {error && (
            <Alert variant="destructive">
              <AlertTriangle className="h-4 w-4" />
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}
        </CardContent>
      </Card>

      {/* Analysis Results */}
      {analysisResult && (
        <Card>
          <CardHeader>
            <CardTitle>Analysis Results</CardTitle>
            <CardDescription>
              Classification breakdown for all villages
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Summary Stats */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <Card className="p-4 bg-blue-50">
                <div className="text-3xl font-bold text-blue-600">
                  {analysisResult.total}
                </div>
                <div className="text-sm text-muted-foreground">Total Villages</div>
              </Card>

              <Card className="p-4 bg-green-50">
                <div className="text-3xl font-bold text-green-600">
                  {analysisResult.breakdown.retirement_village}
                </div>
                <div className="text-sm text-muted-foreground">Retirement Villages</div>
                <div className="text-xs text-green-600 font-medium mt-1">
                  {((analysisResult.breakdown.retirement_village / analysisResult.total) * 100).toFixed(1)}%
                </div>
              </Card>

              <Card className="p-4 bg-purple-50">
                <div className="text-3xl font-bold text-purple-600">
                  {analysisResult.breakdown.aged_care}
                </div>
                <div className="text-sm text-muted-foreground">Aged Care</div>
                <div className="text-xs text-purple-600 font-medium mt-1">
                  {((analysisResult.breakdown.aged_care / analysisResult.total) * 100).toFixed(1)}%
                </div>
              </Card>

              <Card className="p-4 bg-teal-50">
                <div className="text-3xl font-bold text-teal-600">
                  {analysisResult.breakdown.both}
                </div>
                <div className="text-sm text-muted-foreground">Both Types</div>
                <div className="text-xs text-teal-600 font-medium mt-1">
                  {((analysisResult.breakdown.both / analysisResult.total) * 100).toFixed(1)}%
                </div>
              </Card>
            </div>

            {/* Additional Stats */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <Card className="p-4 border-l-4 border-l-orange-500">
                <div className="text-2xl font-bold">
                  {analysisResult.breakdown.unable_to_classify}
                </div>
                <div className="text-sm text-muted-foreground">Unable to Classify</div>
              </Card>

              <Card className="p-4 border-l-4 border-l-blue-500">
                <div className="text-2xl font-bold">
                  {analysisResult.alreadyClassified}
                </div>
                <div className="text-sm text-muted-foreground">Already Classified</div>
              </Card>

              <Card className="p-4 border-l-4 border-l-yellow-500">
                <div className="text-2xl font-bold">
                  {analysisResult.changesCount}
                </div>
                <div className="text-sm text-muted-foreground">Will Be Updated</div>
              </Card>
            </div>

            {/* Impact Alert */}
            {analysisResult.breakdown.aged_care > 0 && (
              <Alert className="border-purple-200 bg-purple-50">
                <Building2 className="h-4 w-4 text-purple-600" />
                <AlertDescription>
                  <strong className="text-purple-900">Important:</strong> {analysisResult.breakdown.aged_care} aged care facilities ({((analysisResult.breakdown.aged_care / analysisResult.total) * 100).toFixed(1)}%) will be <strong>hidden from the main app</strong> after applying classifications. They will remain visible in the admin dashboard with filtering options.
                </AlertDescription>
              </Alert>
            )}

            {/* Sample Villages Table */}
            <div>
              <h3 className="font-semibold mb-3">Sample Villages (First 20 that will change)</h3>
              <div className="border rounded-lg overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead className="bg-gray-50 border-b">
                      <tr>
                        <th className="text-left p-3 font-medium">Village Name</th>
                        <th className="text-left p-3 font-medium">Location</th>
                        <th className="text-left p-3 font-medium">Current</th>
                        <th className="text-left p-3 font-medium">Detected</th>
                        <th className="text-left p-3 font-medium">Status</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y">
                      {analysisResult.villages
                        .filter(v => v.willChange)
                        .slice(0, 20)
                        .map((village) => (
                          <tr key={village.id} className="hover:bg-gray-50">
                            <td className="p-3">{village.name}</td>
                            <td className="p-3 text-muted-foreground">
                              {village.suburb}, {village.state}
                            </td>
                            <td className="p-3">
                              <Badge variant="outline" className="bg-gray-100">
                                {village.currentType}
                              </Badge>
                            </td>
                            <td className="p-3">
                              {village.detectedType === 'retirement_village' && (
                                <Badge className="bg-blue-500">🏘️ Retirement</Badge>
                              )}
                              {village.detectedType === 'aged_care' && (
                                <Badge className="bg-purple-500">🏥 Aged Care</Badge>
                              )}
                              {village.detectedType === 'both' && (
                                <Badge className="bg-green-500">🏘️🏥 Both</Badge>
                              )}
                              {village.detectedType === 'unable_to_classify' && (
                                <Badge variant="outline">❓ Unknown</Badge>
                              )}
                            </td>
                            <td className="p-3">
                              {village.willChange ? (
                                <Badge variant="outline" className="bg-yellow-50 text-yellow-700 border-yellow-300">
                                  Will Update
                                </Badge>
                              ) : (
                                <Badge variant="outline" className="bg-gray-50">
                                  No Change
                                </Badge>
                              )}
                            </td>
                          </tr>
                        ))}
                    </tbody>
                  </table>
                </div>
              </div>
              {analysisResult.changesCount > 20 && (
                <p className="text-sm text-muted-foreground mt-2">
                  ... and {analysisResult.changesCount - 20} more villages. Download CSV for full list.
                </p>
              )}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Apply Results */}
      {applyResult && (
        <Card className="border-green-200 bg-green-50">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-green-800">
              <CheckCircle className="h-5 w-5" />
              Classifications Applied Successfully!
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2 text-sm">
              <p><strong>Total Villages:</strong> {applyResult.total}</p>
              <p><strong>Updated:</strong> {applyResult.updated}</p>
              <p><strong>Skipped (no change):</strong> {applyResult.skipped}</p>
              
              {applyResult.updated === 0 && applyResult.errors && (
                <Alert variant="destructive" className="mt-4">
                  <AlertTriangle className="h-4 w-4" />
                  <AlertDescription>
                    <strong>Warning: No villages were updated!</strong> This might indicate a database permissions issue or query error.
                  </AlertDescription>
                </Alert>
              )}
              
              {applyResult.errors && applyResult.errors.length > 0 && (
                <div className="mt-4">
                  <p className="text-red-600 font-medium">Errors ({applyResult.errors.length}):</p>
                  <ul className="list-disc pl-5 mt-2 space-y-1 text-red-600">
                    {applyResult.errors.slice(0, 5).map((err: string, i: number) => (
                      <li key={i}>{err}</li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}