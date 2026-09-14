import { useState } from 'react';
import { getSupabaseClient } from './utils/supabase/client';
import { projectId } from './utils/supabase/info';

export default function GenerateCSV() {
  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState('');
  const [villageCount, setVillageCount] = useState(0);

  const generateCSV = async () => {
    try {
      setLoading(true);
      setStatus('Connecting to database...');

      const supabase = getSupabaseClient();

      setStatus('Fetching villages without images...');

      // Query all villages - we'll filter by images array in JavaScript since Supabase array filtering can be tricky
      const { data: allVillages, error } = await supabase
        .from('retirement_villages')
        .select('id, name, state, suburb, operator, location, website, contact_phone, images')
        .eq('status', 'approved')
        .order('state', { ascending: true })
        .order('name', { ascending: true });

      if (error) {
        console.error('Database error:', error);
        setStatus(`Error: ${error.message}`);
        return;
      }

      if (!allVillages || allVillages.length === 0) {
        setStatus('No villages found in database!');
        return;
      }

      // Filter for villages with no images or empty images array
      const villages = allVillages.filter(village => {
        const images = village.images || [];
        return images.length === 0 || images.every((img: string) => !img || img.trim() === '');
      });

      setVillageCount(villages.length);
      setStatus(`Found ${villages.length} villages without images. Generating CSV...`);

      // Generate CSV content
      const headers = ['id', 'name', 'state', 'suburb', 'operator', 'location', 'website', 'contact_phone'];
      const csvContent = [
        headers.join(','),
        ...villages.map(village => {
          return headers.map(header => {
            const value = village[header] || '';
            // Escape quotes and wrap in quotes if contains comma
            const escaped = String(value).replace(/"/g, '""');
            return escaped.includes(',') || escaped.includes('"') || escaped.includes('\n')
              ? `"${escaped}"`
              : escaped;
          }).join(',');
        })
      ].join('\n');

      // Create blob and download
      const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
      const link = document.createElement('a');
      const url = URL.createObjectURL(blob);
      
      const timestamp = new Date().toISOString().slice(0, 10).replace(/-/g, '');
      const filename = `villages_without_images_${timestamp}.csv`;
      
      link.setAttribute('href', url);
      link.setAttribute('download', filename);
      link.style.visibility = 'hidden';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);

      setStatus(`✅ Success! Downloaded ${villages.length} villages to ${filename}`);

    } catch (err) {
      console.error('Generation error:', err);
      setStatus(`Error: ${err.message}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-50 p-8">
      <div className="max-w-2xl mx-auto">
        <div className="bg-white rounded-lg shadow-lg p-8">
          <h1 className="text-3xl mb-2">Generate CSV for Image Scraping</h1>
          <p className="text-gray-600 mb-8">
            This will generate a CSV file containing all retirement villages that don't have images yet.
          </p>

          <button
            onClick={generateCSV}
            disabled={loading}
            className="w-full bg-indigo-600 text-white py-3 px-6 rounded-lg hover:bg-indigo-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors"
          >
            {loading ? 'Generating...' : 'Generate & Download CSV'}
          </button>

          {status && (
            <div className={`mt-6 p-4 rounded-lg ${
              status.includes('Error') 
                ? 'bg-red-50 text-red-700' 
                : status.includes('Success')
                ? 'bg-green-50 text-green-700'
                : 'bg-blue-50 text-blue-700'
            }`}>
              <p>{status}</p>
              {villageCount > 0 && (
                <p className="mt-2">
                  <strong>{villageCount} villages</strong> ready for Google Images scraping
                </p>
              )}
            </div>
          )}

          <div className="mt-8 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
            <h2 className="text-sm mb-2">📋 Next Steps:</h2>
            <ol className="text-sm text-gray-700 space-y-1 list-decimal list-inside">
              <li>Click the button above to download the CSV</li>
              <li>Open your Google Colab notebook</li>
              <li>Upload this CSV file to Colab</li>
              <li>Enter your Supabase credentials</li>
              <li>Run the scraper!</li>
            </ol>
          </div>

          <div className="mt-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
            <h2 className="text-sm mb-2">🔑 Your Supabase Credentials:</h2>
            <div className="text-xs font-mono space-y-2">
              <div>
                <strong>Project URL:</strong>
                <div className="bg-white p-2 rounded mt-1 break-all">
                  https://{projectId}.supabase.co
                </div>
              </div>
              <div>
                <strong>Service Role Key:</strong>
                <div className="bg-white p-2 rounded mt-1 text-gray-500">
                  (Copy from Supabase Dashboard → Settings → API Keys)
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}