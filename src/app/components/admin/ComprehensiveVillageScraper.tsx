import { useState, useRef } from 'react';
import { Play, Pause, Square, RotateCcw, Download, CheckCircle, XCircle } from 'lucide-react';
import { getSupabaseClient } from '../../utils/supabase/client';
import { projectId, publicAnonKey } from '../../utils/supabase/info';

export function ComprehensiveVillageScraper() {
  const [loading, setLoading] = useState(false);
  const [running, setRunning] = useState(false);
  const [paused, setPaused] = useState(false);
  const [currentVillage, setCurrentVillage] = useState<string>('');
  const [progress, setProgress] = useState({ current: 0, total: 0 });
  const [results, setResults] = useState<any[]>([]);

  // Use refs for immediate state access in async loop
  const pausedRef = useRef(false);
  const stoppedRef = useRef(false);

  const startScraping = async () => {
    setRunning(true);
    setPaused(false);
    pausedRef.current = false;
    stoppedRef.current = false;
    setResults([]);

    try {
      const supabase = getSupabaseClient();

      // ONLY scrape villages created TODAY (the new upload)
      const today = new Date().toISOString().split('T')[0];
      console.log(`🔍 Looking for villages created on or after ${today}`);

      // Get VIC villages with websites created TODAY
      const { data: villages, error } = await supabase
        .from('retirement_villages')
        .select('id,name,operator,website,created_at')
        .eq('state', 'VIC')
        .eq('status', 'approved')
        .gte('created_at', `${today}T00:00:00`)
        .not('website', 'is', null);

      if (error) throw error;

      const villagesToScrape = villages?.filter((v: any) => v.website?.startsWith('http')) || [];
      setProgress({ current: 0, total: villagesToScrape.length });

      console.log(`🚀 Starting scrape of ${villagesToScrape.length} NEW villages (created today)`);

      // Process in batches of 3
      const BATCH_SIZE = 3;
      for (let i = 0; i < villagesToScrape.length; i += BATCH_SIZE) {
        // Check for pause or stop using refs for immediate access
        if (pausedRef.current) {
          console.log('⏸️ Scraping paused');
          break;
        }
        if (stoppedRef.current) {
          console.log('⏹️ Scraping stopped');
          break;
        }

        const batch = villagesToScrape.slice(i, i + BATCH_SIZE);

        // Show current villages being scraped
        setCurrentVillage(batch.map(v => v.name).join(', '));

        const batchResults = await Promise.all(
          batch.map(village => scrapeVillage(village, supabase))
        );

        setResults(prev => [...prev, ...batchResults]);
        setProgress({ current: i + batch.length, total: villagesToScrape.length });

        // Delay between batches
        if (i + BATCH_SIZE < villagesToScrape.length && !pausedRef.current && !stoppedRef.current) {
          await new Promise(resolve => setTimeout(resolve, 2000));
        }
      }

      if (!stoppedRef.current && !pausedRef.current) {
        alert(`✅ Scraping complete!`);
      }
    } catch (error) {
      alert(`Error: ${error}`);
    } finally {
      setRunning(false);
      setCurrentVillage('');
    }
  };

  const handlePause = () => {
    setPaused(true);
    pausedRef.current = true;
    console.log('⏸️ Pause requested');
  };

  const handleResume = () => {
    setPaused(false);
    pausedRef.current = false;
    console.log('▶️ Resume requested (note: cannot resume mid-scrape, start fresh instead)');
  };

  const handleStop = () => {
    stoppedRef.current = true;
    setRunning(false);
    setCurrentVillage('');
    console.log('⏹️ Stop requested');
  };

  const handleReset = () => {
    setRunning(false);
    setPaused(false);
    pausedRef.current = false;
    stoppedRef.current = false;
    setProgress({ current: 0, total: 0 });
    setResults([]);
    setCurrentVillage('');
    console.log('🔄 Reset complete');
  };

  const scrapeVillage = async (village: any, supabase: any) => {
    try {
      console.log(`🔍 Scraping: ${village.name}`);

      // Call backend scraper
      const response = await fetch(
        `https://${projectId}.supabase.co/functions/v1/make-server-3bba8be8/scrape-village-comprehensive`,
        {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${publicAnonKey}`,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            villageId: village.id,
            villageName: village.name,
            website: village.website,
            operator: village.operator
          })
        }
      );

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}`);
      }

      const data = await response.json();

      if (data.success) {
        // Update database
        const { error: updateError } = await supabase
          .from('retirement_villages')
          .update({
            ...data.data,
            updated_at: new Date().toISOString()
          })
          .eq('id', village.id);

        if (updateError) throw updateError;

        return {
          id: village.id,
          name: village.name,
          status: 'success',
          message: `✅ Updated`,
          data: data.data
        };
      } else {
        return {
          id: village.id,
          name: village.name,
          status: 'failed',
          message: `❌ ${data.error}`
        };
      }
    } catch (error) {
      console.error(`Error scraping ${village.name}:`, error);
      return {
        id: village.id,
        name: village.name,
        status: 'failed',
        message: `❌ ${error}`
      };
    }
  };

  const successCount = results.filter(r => r.status === 'success').length;
  const failedCount = results.filter(r => r.status === 'failed').length;

  return (
    <div className="bg-white p-6 rounded-lg shadow border-4 border-purple-500">
      <h2 className="text-xl font-bold text-purple-600 mb-4">
        🚀 Comprehensive Village Scraper (All Formats)
      </h2>

      <div className="mb-4 p-3 bg-blue-50 rounded border border-blue-300">
        <p className="text-sm font-semibold text-blue-800">
          ℹ️ This scraper only processes villages uploaded TODAY - ignores old data
        </p>
      </div>

      <div className="mb-6 p-4 bg-purple-50 rounded border border-purple-200">
        <h3 className="font-semibold mb-2">What This Scrapes:</h3>
        <ul className="text-sm space-y-1">
          <li>✅ HTML pages (regular website content)</li>
          <li>✅ PDF documents (pricing guides, brochures)</li>
          <li>✅ Amenities, services, activities</li>
          <li>✅ Descriptions, contact info</li>
          <li>✅ Pricing details (from PDFs and HTML)</li>
          <li>✅ Bedroom options, pet-friendly status</li>
        </ul>
      </div>

      <div className="space-y-4">
        {/* Control Buttons */}
        <div className="flex gap-3">
          {!running && !paused && (
            <button
              onClick={startScraping}
              disabled={loading}
              className="px-6 py-3 bg-purple-600 text-white rounded hover:bg-purple-700 disabled:opacity-50 font-bold"
            >
              <Play className="inline w-4 h-4 mr-2" />
              Start Scraping New Villages (Today Only)
            </button>
          )}

          {running && !paused && (
            <>
              <button
                onClick={handlePause}
                className="px-6 py-3 bg-orange-600 text-white rounded hover:bg-orange-700 font-bold"
              >
                <Pause className="inline w-4 h-4 mr-2" />
                Pause
              </button>
              <button
                onClick={handleStop}
                className="px-6 py-3 bg-red-600 text-white rounded hover:bg-red-700 font-bold"
              >
                <Square className="inline w-4 h-4 mr-2" />
                Stop
              </button>
            </>
          )}

          {paused && (
            <>
              <button
                onClick={handleResume}
                className="px-6 py-3 bg-green-600 text-white rounded hover:bg-green-700 font-bold"
              >
                <Play className="inline w-4 h-4 mr-2" />
                Resume
              </button>
              <button
                onClick={handleStop}
                className="px-6 py-3 bg-red-600 text-white rounded hover:bg-red-700 font-bold"
              >
                <Square className="inline w-4 h-4 mr-2" />
                Stop
              </button>
            </>
          )}

          {results.length > 0 && (
            <button
              onClick={handleReset}
              disabled={running}
              className="px-6 py-3 bg-gray-600 text-white rounded hover:bg-gray-700 disabled:opacity-50 font-bold"
            >
              <RotateCcw className="inline w-4 h-4 mr-2" />
              Reset
            </button>
          )}
        </div>

        {/* Currently Scraping */}
        {currentVillage && (
          <div className="p-3 bg-blue-50 rounded border border-blue-200">
            <div className="text-sm font-semibold text-blue-800">
              🔍 Currently scraping: {currentVillage}
            </div>
          </div>
        )}

        {progress.total > 0 && (
          <div className="p-4 bg-gray-50 rounded">
            <div className="flex justify-between mb-2">
              <span className="font-semibold">Progress: {progress.current} / {progress.total}</span>
              <span>{Math.round((progress.current / progress.total) * 100)}%</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-3">
              <div
                className="bg-purple-600 h-3 rounded-full transition-all"
                style={{ width: `${(progress.current / progress.total) * 100}%` }}
              />
            </div>
          </div>
        )}

        {results.length > 0 && (
          <div className="space-y-3">
            <div className="flex gap-4">
              <div className="flex items-center gap-2">
                <CheckCircle className="w-5 h-5 text-green-600" />
                <span className="font-bold">Success: {successCount}</span>
              </div>
              <div className="flex items-center gap-2">
                <XCircle className="w-5 h-5 text-red-600" />
                <span className="font-bold">Failed: {failedCount}</span>
              </div>
            </div>

            <div className="max-h-96 overflow-y-auto border rounded">
              <table className="w-full text-sm">
                <thead className="bg-gray-50 sticky top-0">
                  <tr>
                    <th className="text-left p-2 border-b">Village</th>
                    <th className="text-left p-2 border-b">Status</th>
                    <th className="text-left p-2 border-b">Data Found</th>
                  </tr>
                </thead>
                <tbody>
                  {results.map(r => (
                    <tr key={r.id} className="border-b">
                      <td className="p-2">{r.name}</td>
                      <td className="p-2">
                        {r.status === 'success' ? (
                          <span className="text-green-600">✓</span>
                        ) : (
                          <span className="text-red-600">✗</span>
                        )}
                      </td>
                      <td className="p-2 text-xs">
                        {r.data && (
                          <div>
                            {r.data.amenities?.length > 0 && <span>🏊 {r.data.amenities.length} amenities </span>}
                            {r.data.care_services?.length > 0 && <span>💊 {r.data.care_services.length} services </span>}
                            {r.data.description && <span>📝 desc </span>}
                          </div>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
