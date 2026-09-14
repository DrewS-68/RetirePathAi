import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';
import { Badge } from '../ui/badge';
import { Alert, AlertDescription } from '../ui/alert';
import { 
  Database, 
  RefreshCw,
  AlertCircle,
  TrendingUp,
  MapPin,
  Building2,
  Globe,
  DollarSign
} from 'lucide-react';
import { projectId, publicAnonKey } from '../../utils/supabase/info';

interface DatabaseStats {
  total: number;
  byStatus: {
    [key: string]: number;
  };
  byFacilityType: {
    [key: string]: number;
  };
  byState: {
    [key: string]: number;
  };
  withWebsite: number;
  withPricing: number;
}

export default function DatabaseStatsChecker() {
  const [loading, setLoading] = useState(false);
  const [stats, setStats] = useState<DatabaseStats | null>(null);
  const [error, setError] = useState<string | null>(null);

  const fetchStats = async () => {
    try {
      setLoading(true);
      setError(null);

      const response = await fetch(
        `https://${projectId}.supabase.co/functions/v1/make-server-3bba8be8/database-stats/villages`,
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
        throw new Error(errorData.error || 'Failed to fetch stats');
      }

      const result = await response.json();
      setStats(result);
      console.log('Database stats:', result);
    } catch (err) {
      console.error('Stats error:', err);
      setError(err instanceof Error ? err.message : 'Failed to fetch stats');
    } finally {
      setLoading(false);
    }
  };

  const getFacilityBadgeColor = (type: string) => {
    switch (type) {
      case 'retirement_village':
        return 'bg-blue-500';
      case 'aged_care':
        return 'bg-purple-500';
      case 'both':
        return 'bg-green-500';
      default:
        return 'bg-gray-500';
    }
  };

  const getStatusBadgeColor = (status: string) => {
    switch (status) {
      case 'approved':
        return 'bg-green-500';
      case 'pending':
        return 'bg-yellow-500';
      case 'rejected':
        return 'bg-red-500';
      default:
        return 'bg-gray-500';
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Database className="h-5 w-5" />
          Database Statistics
        </CardTitle>
        <CardDescription>
          Real-time count of all villages in your Supabase database
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <Button
          onClick={fetchStats}
          disabled={loading}
          className="flex items-center gap-2"
        >
          {loading ? (
            <>
              <div className="h-4 w-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
              Loading...
            </>
          ) : (
            <>
              <RefreshCw className="h-4 w-4" />
              Get Real Database Count
            </>
          )}
        </Button>

        {error && (
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        {stats && (
          <div className="space-y-6 mt-6">
            {/* Total Count - Big Display */}
            <Card className="bg-gradient-to-br from-blue-50 to-blue-100 border-blue-200">
              <CardContent className="pt-6">
                <div className="text-center">
                  <div className="text-6xl font-bold text-blue-600 mb-2">
                    {stats.total.toLocaleString()}
                  </div>
                  <div className="text-lg text-blue-800 font-medium">
                    Total Villages in Database
                  </div>
                  <div className="text-sm text-blue-600 mt-2">
                    This is the REAL count directly from Supabase 🎯
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Status Breakdown */}
            <div>
              <h3 className="font-semibold mb-3 flex items-center gap-2">
                <TrendingUp className="h-4 w-4" />
                By Approval Status
              </h3>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                {Object.entries(stats.byStatus).map(([status, count]) => (
                  <Card key={status} className="p-4">
                    <Badge className={`${getStatusBadgeColor(status)} mb-2`}>
                      {status}
                    </Badge>
                    <div className="text-2xl font-bold">{count.toLocaleString()}</div>
                    <div className="text-sm text-muted-foreground">
                      {((count / stats.total) * 100).toFixed(1)}%
                    </div>
                  </Card>
                ))}
              </div>
            </div>

            {/* Facility Type Breakdown */}
            <div>
              <h3 className="font-semibold mb-3 flex items-center gap-2">
                <Building2 className="h-4 w-4" />
                By Facility Type
              </h3>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                {Object.entries(stats.byFacilityType).map(([type, count]) => (
                  <Card key={type} className="p-4">
                    <Badge className={`${getFacilityBadgeColor(type)} mb-2`}>
                      {type === 'unclassified' ? '❓ Unknown' : 
                       type === 'retirement_village' ? '🏘️ Retirement' :
                       type === 'aged_care' ? '🏥 Aged Care' :
                       type === 'both' ? '🏘️🏥 Both' : type}
                    </Badge>
                    <div className="text-2xl font-bold">{count.toLocaleString()}</div>
                    <div className="text-sm text-muted-foreground">
                      {((count / stats.total) * 100).toFixed(1)}%
                    </div>
                  </Card>
                ))}
              </div>
            </div>

            {/* State Breakdown */}
            <div>
              <h3 className="font-semibold mb-3 flex items-center gap-2">
                <MapPin className="h-4 w-4" />
                By State/Territory
              </h3>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                {Object.entries(stats.byState)
                  .sort((a, b) => b[1] - a[1])
                  .map(([state, count]) => (
                    <Card key={state} className="p-4">
                      <div className="text-sm font-medium text-muted-foreground mb-1">
                        {state}
                      </div>
                      <div className="text-2xl font-bold">{count.toLocaleString()}</div>
                      <div className="text-sm text-muted-foreground">
                        {((count / stats.total) * 100).toFixed(1)}%
                      </div>
                    </Card>
                  ))}
              </div>
            </div>

            {/* Data Completeness */}
            <div>
              <h3 className="font-semibold mb-3">Data Completeness</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Card className="p-4 border-l-4 border-l-green-500">
                  <div className="flex items-center gap-3">
                    <Globe className="h-8 w-8 text-green-600" />
                    <div>
                      <div className="text-2xl font-bold">{stats.withWebsite.toLocaleString()}</div>
                      <div className="text-sm text-muted-foreground">
                        With Website ({((stats.withWebsite / stats.total) * 100).toFixed(1)}%)
                      </div>
                    </div>
                  </div>
                </Card>

                <Card className="p-4 border-l-4 border-l-blue-500">
                  <div className="flex items-center gap-3">
                    <DollarSign className="h-8 w-8 text-blue-600" />
                    <div>
                      <div className="text-2xl font-bold">{stats.withPricing.toLocaleString()}</div>
                      <div className="text-sm text-muted-foreground">
                        With Pricing ({((stats.withPricing / stats.total) * 100).toFixed(1)}%)
                      </div>
                    </div>
                  </div>
                </Card>
              </div>
            </div>

            {/* Summary Alert */}
            <Alert className="border-blue-200 bg-blue-50">
              <AlertCircle className="h-4 w-4 text-blue-600" />
              <AlertDescription className="text-blue-900">
                <strong>Database Summary:</strong> You have <strong>{stats.total.toLocaleString()} total villages</strong> in your database.
                {stats.byFacilityType.unclassified > 0 && (
                  <> {stats.byFacilityType.unclassified.toLocaleString()} ({((stats.byFacilityType.unclassified / stats.total) * 100).toFixed(1)}%) are unclassified and need to be processed by the Bulk Classifier tool above.</>
                )}
                {stats.byFacilityType.aged_care > 0 && (
                  <> {stats.byFacilityType.aged_care.toLocaleString()} ({((stats.byFacilityType.aged_care / stats.total) * 100).toFixed(1)}%) are aged care facilities that will be hidden from end users.</>
                )}
              </AlertDescription>
            </Alert>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
