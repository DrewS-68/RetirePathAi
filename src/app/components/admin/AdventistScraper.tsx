import React, { useState } from 'react';
import { Card } from '../ui/card';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { AlertCircle, CheckCircle, Loader2, Trash2, Plus, ExternalLink } from 'lucide-react';
import { projectId, publicAnonKey } from '../../utils/supabase/info';

interface ScrapedVillage {
  name: string;
  suburb: string;
  state: string;
  postcode: string;
  website: string;
  address?: string;
  contact_phone?: string;
  contact_email?: string;
  operator: string;
  facility_type: string;
}

export function AdventistScraper() {
  const [url, setUrl] = useState('https://adventistseniorliving.com.au/locations/');
  const [scraping, setScraping] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [scrapedVillages, setScrapedVillages] = useState<ScrapedVillage[]>([]);
  const [editingIndex, setEditingIndex] = useState<number | null>(null);

  const scrapeAdventist = async () => {
    try {
      setScraping(true);
      setError(null);
      setSuccess(null);
      setScrapedVillages([]);

      const response = await fetch(
        `https://${projectId}.supabase.co/functions/v1/make-server-3bba8be8/scraper/scrape-adventist`,
        {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${publicAnonKey}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ url }),
        }
      );

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to scrape Adventist sites');
      }

      const data = await response.json();
      
      if (data.villages && data.villages.length > 0) {
        setScrapedVillages(data.villages);
        setSuccess(`Found ${data.villages.length} Adventist villages! Review and edit before importing.`);
      } else {
        setError('No villages found. The website structure may have changed.');
      }

    } catch (err) {
      console.error('Error scraping Adventist sites:', err);
      setError(err instanceof Error ? err.message : 'Failed to scrape Adventist sites');
    } finally {
      setScraping(false);
    }
  };

  const deleteAdventistRetirementPlus = async () => {
    if (!confirm('Delete ALL villages from "Adventist Retirement Plus"?\n\nThis will permanently remove all villages with this operator name.\n\nThis cannot be undone!')) {
      return;
    }

    try {
      setDeleting(true);
      setError(null);

      const response = await fetch(
        `https://${projectId}.supabase.co/functions/v1/make-server-3bba8be8/cleanup/delete-operator-villages`,
        {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${publicAnonKey}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ operator: 'Adventist Retirement Plus' }),
        }
      );

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to delete villages');
      }

      const data = await response.json();
      setSuccess(`Successfully deleted ${data.deletedCount} "Adventist Retirement Plus" villages! 🎉`);

    } catch (err) {
      console.error('Error deleting villages:', err);
      setError(err instanceof Error ? err.message : 'Failed to delete villages');
    } finally {
      setDeleting(false);
    }
  };

  const updateVillage = (index: number, field: keyof ScrapedVillage, value: string) => {
    const updated = [...scrapedVillages];
    updated[index] = { ...updated[index], [field]: value };
    setScrapedVillages(updated);
  };

  const removeVillage = (index: number) => {
    setScrapedVillages(scrapedVillages.filter((_, i) => i !== index));
  };

  const importVillages = async () => {
    if (scrapedVillages.length === 0) {
      setError('No villages to import');
      return;
    }

    // Validate required fields
    const invalid = scrapedVillages.filter(v => !v.name || !v.suburb || !v.state);
    if (invalid.length > 0) {
      setError(`${invalid.length} village(s) are missing required fields (name, suburb, state)`);
      return;
    }

    if (!confirm(`Import ${scrapedVillages.length} Adventist villages?\n\nThis will add them to the database.`)) {
      return;
    }

    try {
      setScraping(true);
      setError(null);
      setSuccess(null);

      console.log('🚀 Starting import of', scrapedVillages.length, 'villages...');

      let successCount = 0;
      let failCount = 0;
      const errors: string[] = [];

      for (const village of scrapedVillages) {
        try {
          console.log('📤 Importing:', village.name);
          
          const response = await fetch(
            `https://${projectId}.supabase.co/functions/v1/make-server-3bba8be8/cleanup/add-village`,
            {
              method: 'POST',
              headers: {
                'Authorization': `Bearer ${publicAnonKey}`,
                'Content-Type': 'application/json',
              },
              body: JSON.stringify(village),
            }
          );

          if (response.ok) {
            const data = await response.json();
            console.log('✅ Success:', village.name, data);
            successCount++;
          } else {
            failCount++;
            const errorData = await response.json();
            console.error('❌ Failed:', village.name, errorData);
            errors.push(`${village.name}: ${errorData.error}`);
          }
        } catch (err) {
          failCount++;
          console.error('❌ Error importing:', village.name, err);
          errors.push(`${village.name}: ${err instanceof Error ? err.message : 'Unknown error'}`);
        }
      }

      console.log('🎉 Import complete!', { successCount, failCount });

      if (successCount > 0) {
        setSuccess(`Successfully imported ${successCount} village(s)! ${failCount > 0 ? `(${failCount} failed)` : ''}`);
        setScrapedVillages([]);
        
        // Trigger directory refresh
        window.dispatchEvent(new CustomEvent('villageDataUpdated'));
      } else {
        setError('All imports failed. Check console for details.');
      }

      if (errors.length > 0) {
        console.error('Import errors:', errors);
        setError(`Some imports failed. Check console for details. (${successCount} succeeded, ${failCount} failed)`);
      }

    } catch (err) {
      console.error('Error importing villages:', err);
      setError(err instanceof Error ? err.message : 'Failed to import villages');
    } finally {
      setScraping(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Delete Fake Adventist Sites */}
      <Card className="p-6 bg-red-50 border-red-200">
        <h2 className="text-xl font-bold mb-2 text-red-900">🗑️ Delete Fake Adventist Sites</h2>
        <p className="text-red-800 mb-4">
          Remove all "Adventist Retirement Plus" villages (fake/parked domains) before importing real ones.
        </p>
        <Button 
          onClick={deleteAdventistRetirementPlus} 
          disabled={deleting}
          variant="destructive"
        >
          {deleting ? <Loader2 className="size-4 animate-spin mr-2" /> : <Trash2 className="size-4 mr-2" />}
          Delete All "Adventist Retirement Plus" Villages
        </Button>
      </Card>

      {/* Scraper */}
      <Card className="p-6">
        <h2 className="text-2xl font-bold mb-4">Adventist Senior Living Scraper</h2>
        <p className="text-gray-600 mb-4">
          Scrape villages from the Adventist Senior Living website. Review and edit the data before importing.
        </p>

        {/* Status Messages */}
        {error && (
          <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-lg flex items-start gap-2">
            <AlertCircle className="size-5 text-red-600 flex-shrink-0 mt-0.5" />
            <div className="text-red-800">{error}</div>
          </div>
        )}

        {success && (
          <div className="mb-4 p-4 bg-green-50 border border-green-200 rounded-lg flex items-start gap-2">
            <CheckCircle className="size-5 text-green-600 flex-shrink-0 mt-0.5" />
            <div className="text-green-800">{success}</div>
          </div>
        )}

        {/* URL Input */}
        <div className="mb-4">
          <Label htmlFor="adventist-url">Adventist Senior Living URL</Label>
          <div className="flex gap-2">
            <Input
              id="adventist-url"
              type="url"
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              placeholder="https://adventistseniorliving.com.au/locations/"
              className="flex-1"
            />
            <Button onClick={scrapeAdventist} disabled={scraping}>
              {scraping ? <Loader2 className="size-4 animate-spin mr-2" /> : null}
              Scrape Villages
            </Button>
          </div>
        </div>

        {/* Instructions */}
        <div className="p-4 bg-blue-50 rounded-lg border border-blue-200 mb-4">
          <h3 className="font-semibold mb-2">📋 Instructions:</h3>
          <ol className="text-sm space-y-1 text-gray-700 list-decimal list-inside">
            <li>Click "Scrape Villages" to extract data from the website</li>
            <li>Review the scraped data (name, suburb, website, etc.)</li>
            <li>Click "Edit" to manually fix any missing or incorrect fields</li>
            <li>Remove any villages you don't want to import</li>
            <li>Click "Import All Villages" to add them to the database</li>
          </ol>
        </div>
      </Card>

      {/* Scraped Results */}
      {scrapedVillages.length > 0 && (
        <Card className="p-6">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-xl font-bold">Scraped Villages ({scrapedVillages.length})</h3>
            <Button onClick={importVillages} disabled={scraping}>
              {scraping ? <Loader2 className="size-4 animate-spin mr-2" /> : <Plus className="size-4 mr-2" />}
              Import All Villages
            </Button>
          </div>

          <div className="space-y-4">
            {scrapedVillages.map((village, index) => (
              <div key={index} className="p-4 border rounded-lg">
                {editingIndex === index ? (
                  // Edit Mode
                  <div className="space-y-3">
                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <Label className="text-xs">Village Name *</Label>
                        <Input
                          value={village.name}
                          onChange={(e) => updateVillage(index, 'name', e.target.value)}
                          className="text-sm"
                        />
                      </div>
                      <div>
                        <Label className="text-xs">Suburb *</Label>
                        <Input
                          value={village.suburb}
                          onChange={(e) => updateVillage(index, 'suburb', e.target.value)}
                          className="text-sm"
                        />
                      </div>
                      <div>
                        <Label className="text-xs">State *</Label>
                        <select
                          value={village.state}
                          onChange={(e) => updateVillage(index, 'state', e.target.value)}
                          className="w-full px-3 py-2 border rounded-md text-sm"
                        >
                          <option value="ACT">ACT</option>
                          <option value="NSW">NSW</option>
                          <option value="NT">NT</option>
                          <option value="QLD">QLD</option>
                          <option value="SA">SA</option>
                          <option value="TAS">TAS</option>
                          <option value="VIC">VIC</option>
                          <option value="WA">WA</option>
                        </select>
                      </div>
                      <div>
                        <Label className="text-xs">Postcode</Label>
                        <Input
                          value={village.postcode}
                          onChange={(e) => updateVillage(index, 'postcode', e.target.value)}
                          className="text-sm"
                        />
                      </div>
                      <div>
                        <Label className="text-xs">Phone</Label>
                        <Input
                          value={village.contact_phone || ''}
                          onChange={(e) => updateVillage(index, 'contact_phone', e.target.value)}
                          className="text-sm"
                        />
                      </div>
                      <div>
                        <Label className="text-xs">Email</Label>
                        <Input
                          value={village.contact_email || ''}
                          onChange={(e) => updateVillage(index, 'contact_email', e.target.value)}
                          className="text-sm"
                        />
                      </div>
                      <div className="col-span-2">
                        <Label className="text-xs">Website</Label>
                        <Input
                          value={village.website}
                          onChange={(e) => updateVillage(index, 'website', e.target.value)}
                          className="text-sm"
                        />
                      </div>
                      <div className="col-span-2">
                        <Label className="text-xs">Address</Label>
                        <Input
                          value={village.address || ''}
                          onChange={(e) => updateVillage(index, 'address', e.target.value)}
                          className="text-sm"
                        />
                      </div>
                      <div>
                        <Label className="text-xs">Facility Type</Label>
                        <select
                          value={village.facility_type}
                          onChange={(e) => updateVillage(index, 'facility_type', e.target.value)}
                          className="w-full px-3 py-2 border rounded-md text-sm"
                        >
                          <option value="retirement_village">Retirement Village</option>
                          <option value="aged_care">Aged Care</option>
                          <option value="both">Both</option>
                          <option value="unclassified">Unclassified</option>
                        </select>
                      </div>
                      <div>
                        <Label className="text-xs">Operator</Label>
                        <Input
                          value={village.operator}
                          onChange={(e) => updateVillage(index, 'operator', e.target.value)}
                          className="text-sm"
                        />
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <Button onClick={() => setEditingIndex(null)} size="sm">
                        <CheckCircle className="size-4 mr-2" />
                        Done
                      </Button>
                      <Button onClick={() => setEditingIndex(null)} size="sm" variant="outline">
                        Cancel
                      </Button>
                    </div>
                  </div>
                ) : (
                  // View Mode
                  <div>
                    <div className="flex justify-between items-start mb-2">
                      <div>
                        <h4 className="font-semibold text-lg">{village.name}</h4>
                        <p className="text-gray-600 text-sm">
                          {village.suburb}, {village.state} {village.postcode || <span className="text-red-600 font-semibold">⚠️ NO POSTCODE</span>}
                        </p>
                      </div>
                      <div className="flex gap-2">
                        <Button onClick={() => setEditingIndex(index)} size="sm" variant="outline">
                          Edit
                        </Button>
                        <Button onClick={() => removeVillage(index)} size="sm" variant="destructive">
                          <Trash2 className="size-4" />
                        </Button>
                      </div>
                    </div>
                    <div className="grid grid-cols-2 gap-2 text-sm mt-3">
                      <div>
                        <span className="text-gray-500">Operator:</span> {village.operator}
                      </div>
                      <div>
                        <span className="text-gray-500">Facility Type:</span> {village.facility_type}
                      </div>
                      {village.contact_phone && (
                        <div>
                          <span className="text-gray-500">Phone:</span> {village.contact_phone}
                        </div>
                      )}
                      {village.contact_email && (
                        <div>
                          <span className="text-gray-500">Email:</span> {village.contact_email}
                        </div>
                      )}
                      {village.address && (
                        <div className="col-span-2">
                          <span className="text-gray-500">Address:</span> {village.address}
                        </div>
                      )}
                      {village.website && (
                        <div className="col-span-2">
                          <a
                            href={village.website}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-blue-600 hover:underline flex items-center gap-1"
                          >
                            {village.website}
                            <ExternalLink className="size-3" />
                          </a>
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        </Card>
      )}

      {/* Empty State */}
      {!scraping && scrapedVillages.length === 0 && (
        <Card className="p-12 text-center">
          <div className="text-gray-400 mb-4">
            <Plus className="size-16 mx-auto" />
          </div>
          <h3 className="text-xl font-semibold mb-2">No Villages Scraped Yet</h3>
          <p className="text-gray-600">
            Click "Scrape Villages" to extract data from the Adventist Senior Living website.
          </p>
        </Card>
      )}
    </div>
  );
}