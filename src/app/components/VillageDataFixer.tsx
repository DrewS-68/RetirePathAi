import React, { useState } from 'react';
import { Card } from './ui/card';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Search, Save, AlertCircle, CheckCircle } from 'lucide-react';
import { projectId, publicAnonKey } from '../utils/supabase/info';

interface Village {
  id: number;
  name: string;
  suburb: string;
  state: string;
  operator: string | null;
  website: string | null;
  facility_type: string | null;
  description: string | null;
}

export function VillageDataFixer() {
  const [searchTerm, setSearchTerm] = useState('');
  const [village, setVillage] = useState<Village | null>(null);
  const [searchResults, setSearchResults] = useState<Village[]>([]);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  
  // Form fields
  const [editedName, setEditedName] = useState('');
  const [editedSuburb, setEditedSuburb] = useState('');
  const [editedState, setEditedState] = useState('');
  const [editedOperator, setEditedOperator] = useState('');
  const [editedWebsite, setEditedWebsite] = useState('');
  const [editedFacilityType, setEditedFacilityType] = useState('');

  const searchVillage = async () => {
    if (!searchTerm.trim()) {
      setError('Please enter a village name to search');
      return;
    }

    try {
      setLoading(true);
      setError(null);
      setSuccess(null);
      setVillage(null);
      setSearchResults([]);

      const response = await fetch(
        `https://${projectId}.supabase.co/functions/v1/make-server-3bba8be8/village-fixer/search?name=${encodeURIComponent(searchTerm)}`,
        {
          headers: {
            'Authorization': `Bearer ${publicAnonKey}`,
          },
        }
      );

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ error: 'Unknown error' }));
        console.error('Search failed:', errorData);
        throw new Error(errorData.details || errorData.error || response.statusText);
      }

      const data = await response.json();
      
      console.log('Search response:', data);
      
      if (data.village) {
        setVillage(data.village);
        // Populate form fields
        setEditedName(data.village.name || '');
        setEditedSuburb(data.village.suburb || '');
        setEditedState(data.village.state || '');
        setEditedOperator(data.village.operator || '');
        setEditedWebsite(data.village.website || '');
        setEditedFacilityType(data.village.facility_type || '');
      } else if (data.villages && data.villages.length > 0) {
        setSearchResults(data.villages);
      } else {
        setError(`No village found matching "${searchTerm}". Try searching for part of the name.`);
      }
    } catch (err) {
      console.error('Error searching village:', err);
      setError(err instanceof Error ? err.message : 'Failed to search');
    } finally {
      setLoading(false);
    }
  };

  const saveChanges = async () => {
    if (!village) return;

    try {
      setSaving(true);
      setError(null);
      setSuccess(null);

      const response = await fetch(
        `https://${projectId}.supabase.co/functions/v1/make-server-3bba8be8/village-fixer/update`,
        {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${publicAnonKey}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            id: village.id,
            name: editedName,
            suburb: editedSuburb,
            state: editedState,
            operator: editedOperator || null,
            website: editedWebsite || null,
            facility_type: editedFacilityType || null,
          }),
        }
      );

      if (!response.ok) {
        throw new Error(`Failed to update: ${response.statusText}`);
      }

      setSuccess(`Successfully updated village ID ${village.id}`);
      
      // Refresh the village data
      const updatedVillage = {
        ...village,
        name: editedName,
        suburb: editedSuburb,
        state: editedState,
        operator: editedOperator || null,
        website: editedWebsite || null,
        facility_type: editedFacilityType || null,
      };
      setVillage(updatedVillage);
    } catch (err) {
      console.error('Error updating village:', err);
      setError(err instanceof Error ? err.message : 'Failed to update');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <Card className="p-6">
        <h2 className="text-2xl font-bold mb-4">Village Data Fixer</h2>
        <p className="text-muted-foreground mb-6">
          Search for a village by name and correct its data
        </p>

        {/* Search */}
        <div className="space-y-4">
          <div className="flex gap-2">
            <Input
              placeholder="Enter village name (e.g., Colonial Light Gardens)"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && searchVillage()}
            />
            <Button onClick={searchVillage} disabled={loading}>
              <Search className="size-4 mr-2" />
              {loading ? 'Searching...' : 'Search'}
            </Button>
          </div>

          {error && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-4 flex items-start gap-3">
              <AlertCircle className="size-5 text-red-600 mt-0.5 flex-shrink-0" />
              <div>
                <p className="font-semibold text-red-900">Error</p>
                <p className="text-sm text-red-700">{error}</p>
              </div>
            </div>
          )}

          {success && (
            <div className="bg-green-50 border border-green-200 rounded-lg p-4 flex items-start gap-3">
              <CheckCircle className="size-5 text-green-600 mt-0.5 flex-shrink-0" />
              <div>
                <p className="font-semibold text-green-900">Success</p>
                <p className="text-sm text-green-700">{success}</p>
              </div>
            </div>
          )}
        </div>
      </Card>

      {/* Multiple Search Results */}
      {searchResults.length > 0 && (
        <Card className="p-6">
          <h3 className="text-xl font-bold mb-4">
            Found {searchResults.length} matching villages
          </h3>
          <p className="text-sm text-muted-foreground mb-4">
            Click on a village to edit it
          </p>
          <div className="space-y-2">
            {searchResults.map((result) => (
              <button
                key={result.id}
                onClick={() => {
                  setVillage(result);
                  setSearchResults([]);
                  setEditedName(result.name || '');
                  setEditedSuburb(result.suburb || '');
                  setEditedState(result.state || '');
                  setEditedOperator(result.operator || '');
                  setEditedWebsite(result.website || '');
                  setEditedFacilityType(result.facility_type || '');
                }}
                className="w-full text-left p-4 border rounded-lg hover:bg-gray-50 transition-colors"
              >
                <div className="font-semibold">{result.name}</div>
                <div className="text-sm text-muted-foreground">
                  {result.suburb}, {result.state}
                  {result.operator && ` • ${result.operator}`}
                  {result.facility_type && ` • ${result.facility_type}`}
                </div>
              </button>
            ))}
          </div>
        </Card>
      )}

      {/* Edit Form */}
      {village && (
        <Card className="p-6">
          <h3 className="text-xl font-bold mb-4">Edit Village (ID: {village.id})</h3>
          
          <div className="space-y-4">
            <div>
              <Label htmlFor="name">Village Name *</Label>
              <Input
                id="name"
                value={editedName}
                onChange={(e) => setEditedName(e.target.value)}
                placeholder="e.g., ECH Crescent Lodge"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="suburb">Suburb *</Label>
                <Input
                  id="suburb"
                  value={editedSuburb}
                  onChange={(e) => setEditedSuburb(e.target.value)}
                />
              </div>

              <div>
                <Label htmlFor="state">State *</Label>
                <Input
                  id="state"
                  value={editedState}
                  onChange={(e) => setEditedState(e.target.value)}
                />
              </div>
            </div>

            <div>
              <Label htmlFor="operator">Operator</Label>
              <Input
                id="operator"
                value={editedOperator}
                onChange={(e) => setEditedOperator(e.target.value)}
                placeholder="e.g., ECH"
              />
            </div>

            <div>
              <Label htmlFor="website">Website URL</Label>
              <Input
                id="website"
                type="url"
                value={editedWebsite}
                onChange={(e) => setEditedWebsite(e.target.value)}
                placeholder="https://..."
              />
            </div>

            <div>
              <Label htmlFor="facility_type">Facility Type</Label>
              <select
                id="facility_type"
                value={editedFacilityType}
                onChange={(e) => setEditedFacilityType(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="">Unclassified</option>
                <option value="retirement_village">Retirement Village</option>
                <option value="aged_care">Aged Care</option>
                <option value="both">Both</option>
                <option value="not_a_village">Not a Village</option>
              </select>
            </div>

            <Button 
              onClick={saveChanges} 
              disabled={saving || !editedName || !editedSuburb || !editedState}
              className="w-full"
            >
              <Save className="size-4 mr-2" />
              {saving ? 'Saving...' : 'Save Changes'}
            </Button>
          </div>
        </Card>
      )}
    </div>
  );
}