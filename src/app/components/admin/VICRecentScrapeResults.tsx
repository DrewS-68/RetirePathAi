import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';
import { Loader2, ExternalLink, CheckCircle, XCircle, AlertCircle } from 'lucide-react';
import { projectId, publicAnonKey } from '../../utils/supabase/info';

interface Village {
  id: number;
  name: string;
  operator: string;
  website: string | null;
  updated_at: string;
}

export function VICRecentScrapeResults() {
  const [villages, setVillages] = useState<Village[]>([]);
  const [loading, setLoading] = useState(false);
  const [stats, setStats] = useState<any>(null);

  const loadRecentUpdates = async () => {
    setLoading(true);
    try {
      const url = `https://${projectId}.supabase.co/functions/v1/make-server-3bba8be8/admin/vic-recent-scrape-results`;
      console.log('[RECENT SCRAPE] Loading from:', url);
      
      const response = await fetch(url, {
        method: 'GET',
        headers: {
          Authorization: `Bearer ${publicAnonKey}`,
        },
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      console.log('[RECENT SCRAPE] Results:', data);
      
      if (data.villages) {
        setVillages(data.villages);
        setStats(data.stats);
      }
    } catch (error) {
      console.error('[RECENT SCRAPE] Error:', error);
      alert('Error loading recent scrape results. Check console for details.');
    } finally {
      setLoading(false);
    }
  };

  const getStatusIcon = (website: string | null) => {
    if (!website) {
      return <XCircle className="w-4 h-4 text-red-500" />;
    }
    if (website === 'No official website') {
      return <AlertCircle className="w-4 h-4 text-yellow-500" />;
    }
    if (website.startsWith('Invalid')) {
      return <XCircle className="w-4 h-4 text-orange-500" />;
    }
    if (website.startsWith('http')) {
      return <CheckCircle className="w-4 h-4 text-green-500" />;
    }
    return <AlertCircle className="w-4 h-4 text-gray-500" />;
  };

  const getStatusBadge = (website: string | null) => {
    if (!website) {
      return <span className="px-2 py-1 text-xs rounded bg-red-100 text-red-700">No Website</span>;
    }
    if (website === 'No official website') {
      return <span className="px-2 py-1 text-xs rounded bg-yellow-100 text-yellow-700">Not Found</span>;
    }
    if (website.startsWith('Invalid')) {
      return <span className="px-2 py-1 text-xs rounded bg-orange-100 text-orange-700">Invalid</span>;
    }
    if (website.startsWith('http')) {
      return <span className="px-2 py-1 text-xs rounded bg-green-100 text-green-700">Found</span>;
    }
    return <span className="px-2 py-1 text-xs rounded bg-gray-100 text-gray-700">Unknown</span>;
  };

  return (
    <Card className="border-purple-200 bg-purple-50">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          🕒 Recent Scrape Results (Last 100 Updates)
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex gap-2">
          <Button onClick={loadRecentUpdates} disabled={loading}>
            {loading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Loading...
              </>
            ) : (
              'Load Recent Scrape Results'
            )}
          </Button>
        </div>

        {stats && (
          <div className="grid grid-cols-2 md:grid-cols-5 gap-4 p-4 bg-white rounded border">
            <div className="text-center">
              <div className="text-2xl font-bold text-blue-600">{stats.total}</div>
              <div className="text-xs text-gray-600">Total Checked</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-green-600">{stats.withWebsites}</div>
              <div className="text-xs text-gray-600">Websites Found</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-yellow-600">{stats.notFound}</div>
              <div className="text-xs text-gray-600">Not Found</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-orange-600">{stats.invalid}</div>
              <div className="text-xs text-gray-600">Invalid</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-red-600">{stats.null}</div>
              <div className="text-xs text-gray-600">No Website</div>
            </div>
          </div>
        )}

        {villages.length > 0 && (
          <div className="space-y-2">
            <div className="text-sm font-medium text-gray-700">
              Showing {villages.length} most recently updated villages:
            </div>
            <div className="max-h-96 overflow-y-auto space-y-2">
              {villages.map((village) => (
                <div
                  key={village.id}
                  className="p-3 bg-white rounded border hover:border-purple-300 transition-colors"
                >
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        {getStatusIcon(village.website)}
                        <span className="font-medium text-sm truncate">
                          {village.name}
                        </span>
                        {getStatusBadge(village.website)}
                      </div>
                      <div className="text-xs text-gray-600 mb-1">
                        Operator: {village.operator}
                      </div>
                      {village.website && village.website !== 'No official website' && (
                        <div className="flex items-center gap-2">
                          <a
                            href={village.website}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-xs text-blue-600 hover:underline truncate flex items-center gap-1"
                          >
                            {village.website}
                            <ExternalLink className="w-3 h-3 flex-shrink-0" />
                          </a>
                        </div>
                      )}
                      {village.website === 'No official website' && (
                        <div className="text-xs text-yellow-600">
                          No official website found
                        </div>
                      )}
                      {village.website?.startsWith('Invalid') && (
                        <div className="text-xs text-orange-600">
                          {village.website}
                        </div>
                      )}
                      <div className="text-xs text-gray-400 mt-1">
                        Updated: {new Date(village.updated_at).toLocaleString()}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {villages.length === 0 && !loading && (
          <div className="text-center text-gray-500 py-8">
            Click "Load Recent Scrape Results" to see the latest scraped villages
          </div>
        )}
      </CardContent>
    </Card>
  );
}