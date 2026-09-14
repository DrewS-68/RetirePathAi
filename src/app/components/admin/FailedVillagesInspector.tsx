import React, { useState, useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { projectId, publicAnonKey } from '../../utils/supabase/info';
import { Button } from '../ui/button';
import { Card } from '../ui/card';
import { Badge } from '../ui/badge';
import { Loader, RefreshCw, AlertTriangle, ExternalLink, Eye, Copy } from 'lucide-react';

interface Village {
  id: string;
  name: string;
  suburb: string;
  state: string;
  website: string | null;
  scraped_data: any;
}

export function FailedVillagesInspector() {
  const { accessToken } = useAuth();
  const [loading, setLoading] = useState(false);
  const [failedVillages, setFailedVillages] = useState<Village[]>([]);
  const [noDataVillages, setNoDataVillages] = useState<Village[]>([]);
  const [skippedVillages, setSkippedVillages] = useState<Village[]>([]);
  const [notAttemptedVillages, setNotAttemptedVillages] = useState<Village[]>([]);
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'failed' | 'skipped' | 'noData' | 'notAttempted'>('skipped');
  const [copiedId, setCopiedId] = useState<string | null>(null);

  useEffect(() => {
    loadFailedVillages();
  }, []);

  const loadFailedVillages = async () => {
    setLoading(true);
    try {
      console.log('🔍 Loading failed villages...');
      
      const supabaseUrl = `https://${projectId}.supabase.co/rest/v1/retirement_villages`;
      
      // Get all VIC villages with websites
      const response = await fetch(
        `${supabaseUrl}?select=id,name,suburb,state,website,scraped_data&state=eq.VIC&website=not.is.null`,
        {
          headers: {
            'Authorization': `Bearer ${accessToken || publicAnonKey}`,
            'apikey': publicAnonKey,
          },
        }
      );

      if (!response.ok) {
        throw new Error('Failed to fetch villages');
      }

      const villages: Village[] = await response.json();
      
      // Filter for failed and noData villages
      const failed: Village[] = [];
      const noData: Village[] = [];
      const skipped: Village[] = [];
      const notAttempted: Village[] = [];

      villages.forEach(v => {
        if (v.scraped_data) {
          if (v.scraped_data.status === 'failed' || v.scraped_data.status === 'error') {
            failed.push(v);
          } else if (v.scraped_data.status === 'success' && v.scraped_data.noData === true) {
            noData.push(v);
          } else if (v.scraped_data.status === 'skipped') {
            skipped.push(v);
          }
        } else {
          notAttempted.push(v);
        }
      });

      console.log('📊 Found:', {
        failed: failed.length,
        noData: noData.length,
        skipped: skipped.length,
        notAttempted: notAttempted.length,
      });

      setFailedVillages(failed);
      setNoDataVillages(noData);
      setSkippedVillages(skipped);
      setNotAttemptedVillages(notAttempted);
    } catch (error) {
      console.error('❌ Error loading failed villages:', error);
      alert(`Error: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  const copyErrorDetails = (village: Village) => {
    try {
      const errorDetails = JSON.stringify(village.scraped_data || { message: 'No scraped data available' }, null, 2);
      navigator.clipboard.writeText(errorDetails);
      setCopiedId(village.id);
      setTimeout(() => setCopiedId(null), 2000);
    } catch (err) {
      console.error('Copy failed:', err);
      // Fallback: create a textarea and copy from it
      const textarea = document.createElement('textarea');
      textarea.value = JSON.stringify(village.scraped_data || { message: 'No scraped data available' }, null, 2);
      textarea.style.position = 'fixed';
      textarea.style.opacity = '0';
      document.body.appendChild(textarea);
      textarea.select();
      document.execCommand('copy');
      document.body.removeChild(textarea);
      setCopiedId(village.id);
      setTimeout(() => setCopiedId(null), 2000);
    }
  };

  const renderVillageCard = (village: Village) => {
    const isExpanded = expandedId === village.id;
    const errorMessage = village.scraped_data?.error || village.scraped_data?.message || village.scraped_data?.reason || 'Unknown error';
    const statusCode = village.scraped_data?.statusCode;
    const scrapedAt = village.scraped_data?.scrapedAt ? new Date(village.scraped_data.scrapedAt).toLocaleString() : 'Unknown';
    
    // Determine border color based on status
    const borderColor = activeTab === 'skipped' ? 'border-l-gray-500' :
                       activeTab === 'failed' ? 'border-l-red-500' :
                       activeTab === 'noData' ? 'border-l-orange-500' :
                       'border-l-gray-400';
    
    // Determine message color based on activeTab
    const messageColor = activeTab === 'skipped' ? 'bg-gray-50 border-gray-200 text-gray-900' :
                        activeTab === 'failed' ? 'bg-red-50 border-red-200 text-red-900' :
                        activeTab === 'noData' ? 'bg-orange-50 border-orange-200 text-orange-900' :
                        'bg-gray-50 border-gray-200 text-gray-900';

    return (
      <Card key={village.id} className={`p-4 border-l-4 ${borderColor}`}>
        <div className="flex items-start justify-between mb-3">
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-1">
              <h4 className="font-semibold text-lg">{village.name}</h4>
              {statusCode && (
                <Badge variant="destructive">HTTP {statusCode}</Badge>
              )}
            </div>
            <p className="text-sm text-muted-foreground mb-2">
              {village.suburb}, {village.state}
            </p>
            {village.website && (
              <a
                href={village.website}
                target="_blank"
                rel="noopener noreferrer"
                className="text-sm text-blue-600 hover:underline flex items-center gap-1"
              >
                {village.website}
                <ExternalLink className="size-3" />
              </a>
            )}
          </div>

          <div className="flex gap-2">
            <Button
              size="sm"
              variant="outline"
              onClick={() => copyErrorDetails(village)}
            >
              <Copy className="size-4" />
            </Button>
            <Button
              size="sm"
              variant="outline"
              onClick={() => setExpandedId(isExpanded ? null : village.id)}
            >
              <Eye className="size-4" />
            </Button>
          </div>
        </div>

        {/* Error/Status Summary */}
        {village.scraped_data ? (
          <div className={`border rounded p-3 mb-3 ${messageColor}`}>
            <p className="text-sm font-medium mb-1">
              {activeTab === 'skipped' ? 'Skip Reason:' : 
               activeTab === 'noData' ? 'Status:' : 'Error:'}
            </p>
            <p className="text-sm">{errorMessage}</p>
            <p className="text-xs mt-2 opacity-75">Last attempt: {scrapedAt}</p>
          </div>
        ) : (
          <div className="bg-gray-50 border border-gray-200 rounded p-3 mb-3">
            <p className="text-sm font-medium text-gray-900 mb-1">Status:</p>
            <p className="text-sm text-gray-700">Never attempted - no scraped_data field</p>
          </div>
        )}

        {/* Expanded Details */}
        {isExpanded && (
          <div className="bg-gray-50 border rounded p-3 mt-3">
            <p className="text-sm font-semibold mb-2">Full scraped_data:</p>
            <pre className="text-xs overflow-auto max-h-64 bg-white p-2 rounded border">
              {JSON.stringify(village.scraped_data || null, null, 2)}
            </pre>
          </div>
        )}
      </Card>
    );
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader className="size-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  return (
    <Card className="p-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-2xl mb-2">Failed Villages Inspector</h2>
          <p className="text-muted-foreground">
            Detailed error messages for villages that failed to scrape
          </p>
        </div>
        <Button onClick={loadFailedVillages} disabled={loading} variant="outline">
          <RefreshCw className={`size-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
          Refresh
        </Button>
      </div>

      {/* Tab Navigation */}
      <div className="flex items-center gap-4 mb-4">
        <Button
          size="sm"
          variant={activeTab === 'skipped' ? 'default' : 'outline'}
          onClick={() => setActiveTab('skipped')}
        >
          Skipped ({skippedVillages.length})
        </Button>
        <Button
          size="sm"
          variant={activeTab === 'failed' ? 'default' : 'outline'}
          onClick={() => setActiveTab('failed')}
        >
          Failed ({failedVillages.length})
        </Button>
        <Button
          size="sm"
          variant={activeTab === 'noData' ? 'default' : 'outline'}
          onClick={() => setActiveTab('noData')}
        >
          No Data ({noDataVillages.length})
        </Button>
        <Button
          size="sm"
          variant={activeTab === 'notAttempted' ? 'default' : 'outline'}
          onClick={() => setActiveTab('notAttempted')}
        >
          Not Attempted ({notAttemptedVillages.length})
        </Button>
      </div>

      {/* Skipped Villages */}
      {activeTab === 'skipped' && skippedVillages.length > 0 && (
        <div className="mb-6">
          <div className="flex items-center gap-2 mb-4">
            <AlertTriangle className="size-5 text-red-600" />
            <h3 className="text-lg font-semibold text-red-900">
              Skipped Scrapes ({skippedVillages.length})
            </h3>
          </div>
          <div className="space-y-3">
            {skippedVillages.map(village => renderVillageCard(village))}
          </div>
        </div>
      )}

      {/* Failed Villages */}
      {activeTab === 'failed' && failedVillages.length > 0 && (
        <div className="mb-6">
          <div className="flex items-center gap-2 mb-4">
            <AlertTriangle className="size-5 text-red-600" />
            <h3 className="text-lg font-semibold text-red-900">
              Failed Scrapes ({failedVillages.length})
            </h3>
          </div>
          <div className="space-y-3">
            {failedVillages.map(village => renderVillageCard(village))}
          </div>
        </div>
      )}

      {/* No Data Villages */}
      {activeTab === 'noData' && noDataVillages.length > 0 && (
        <div>
          <div className="flex items-center gap-2 mb-4">
            <AlertTriangle className="size-5 text-orange-600" />
            <h3 className="text-lg font-semibold text-orange-900">
              No Data Returned ({noDataVillages.length})
            </h3>
          </div>
          <div className="space-y-3">
            {noDataVillages.map(village => renderVillageCard(village))}
          </div>
        </div>
      )}

      {/* Not Attempted Villages */}
      {activeTab === 'notAttempted' && notAttemptedVillages.length > 0 && (
        <div>
          <div className="flex items-center gap-2 mb-4">
            <AlertTriangle className="size-5 text-gray-600" />
            <h3 className="text-lg font-semibold text-gray-900">
              Not Attempted ({notAttemptedVillages.length})
            </h3>
          </div>
          <div className="space-y-3">
            {notAttemptedVillages.map(village => renderVillageCard(village))}
          </div>
        </div>
      )}

      {failedVillages.length === 0 && noDataVillages.length === 0 && skippedVillages.length === 0 && notAttemptedVillages.length === 0 && (
        <div className="text-center py-8 text-muted-foreground">
          <p className="text-lg">✅ No failed villages found!</p>
          <p className="text-sm mt-2">All villages with websites have been successfully scraped.</p>
        </div>
      )}
    </Card>
  );
}