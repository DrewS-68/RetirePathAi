import React, { useState } from 'react';
import { Card } from '../ui/card';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { Search, Save, Loader2, AlertCircle, CheckCircle, Trash2 } from 'lucide-react';
import { projectId, publicAnonKey } from '../../utils/supabase/info';
import { getSupabaseClient } from '../../utils/supabase/client';

interface Village {
  id: string;
  name: string;
  operator: string | null;
  suburb: string;
  state: string;
  postcode: string;
  website: string | null;
  facility_type: string;
}

export function VillageEditor() {
  const [searchTerm, setSearchTerm] = useState('');
  const [searching, setSearching] = useState(false);
  const [saving, setSaving] = useState(false);
  const [villages, setVillages] = useState<Village[]>([]);
  const [selectedVillage, setSelectedVillage] = useState<Village | null>(null);
  const [editedVillage, setEditedVillage] = useState<Village | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const searchVillages = async () => {
    if (!searchTerm.trim()) {
      setError('Please enter a search term');
      return;
    }

    try {
      setSearching(true);
      setError(null);
      setSuccess(null);
      setSelectedVillage(null);
      setEditedVillage(null);

      const supabase = getSupabaseClient();
      
      const { data, error: queryError } = await supabase
        .from('retirement_villages')
        .select('id, name, operator, suburb, state, postcode, website, facility_type')
        .or(`name.ilike.%${searchTerm}%,operator.ilike.%${searchTerm}%,suburb.ilike.%${searchTerm}%`)
        .order('name', { ascending: true })
        .limit(20);

      if (queryError) {
        throw new Error(`Database query failed: ${queryError.message}`);
      }

      console.log('🔍 Found villages:', data);
      setVillages(data || []);
      
      if (data && data.length === 0) {
        setError('No villages found. Try a different search term.');
      }

    } catch (err: any) {
      console.error('❌ Error searching villages:', err);
      setError(err.message || 'Unknown error');
    } finally {
      setSearching(false);
    }
  };

  const selectVillage = (village: Village) => {
    setSelectedVillage(village);
    setEditedVillage({ ...village });
    setError(null);
    setSuccess(null);
  };

  const updateField = (field: keyof Village, value: string) => {
    if (editedVillage) {
      setEditedVillage({
        ...editedVillage,
        [field]: value,
      });
    }
  };

  const saveVillage = async () => {
    if (!editedVillage) return;

    // Validate required fields
    if (!editedVillage.name || !editedVillage.suburb || !editedVillage.state || !editedVillage.postcode) {
      setError('Name, suburb, state, and postcode are required');
      return;
    }

    try {
      setSaving(true);
      setError(null);
      setSuccess(null);

      const response = await fetch(
        `https://${projectId}.supabase.co/functions/v1/make-server-3bba8be8/cleanup/update-village`,
        {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${publicAnonKey}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            villageId: editedVillage.id,
            updates: {
              name: editedVillage.name,
              operator: editedVillage.operator || null,
              suburb: editedVillage.suburb,
              state: editedVillage.state,
              postcode: editedVillage.postcode,
              website: editedVillage.website || null,
              facility_type: editedVillage.facility_type,
            },
          }),
        }
      );

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to update village');
      }

      setSuccess(`✅ Successfully updated "${editedVillage.name}"!`);
      
      // Update the village in the list
      setVillages(villages.map(v => v.id === editedVillage.id ? editedVillage : v));
      setSelectedVillage(editedVillage);

      // Trigger directory refresh
      window.dispatchEvent(new CustomEvent('villageDataUpdated'));

    } catch (err) {
      console.error('Error updating village:', err);
      setError(err instanceof Error ? err.message : 'Failed to update village');
    } finally {
      setSaving(false);
    }
  };

  const cancelEdit = () => {
    if (selectedVillage) {
      setEditedVillage({ ...selectedVillage });
    }
    setError(null);
    setSuccess(null);
  };

  const deleteVillage = async () => {
    if (!editedVillage) return;

    const confirmDelete = window.confirm(
      `⚠️ Are you sure you want to DELETE this village?\n\n"${editedVillage.name}"\n${editedVillage.suburb}, ${editedVillage.state}\n\nThis action CANNOT be undone!`
    );

    if (!confirmDelete) return;

    try {
      setSaving(true);
      setError(null);
      setSuccess(null);

      const response = await fetch(
        `https://${projectId}.supabase.co/functions/v1/make-server-3bba8be8/cleanup/delete-village`,
        {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${publicAnonKey}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            villageId: editedVillage.id,
          }),
        }
      );

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to delete village');
      }

      setSuccess(`✅ Successfully deleted "${editedVillage.name}"!`);
      
      // Remove from the list
      setVillages(villages.filter(v => v.id !== editedVillage.id));
      
      // Clear selection
      setSelectedVillage(null);
      setEditedVillage(null);

      // Trigger directory refresh
      window.dispatchEvent(new CustomEvent('villageDataUpdated'));

    } catch (err) {
      console.error('Error deleting village:', err);
      setError(err instanceof Error ? err.message : 'Failed to delete village');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-6">
      <Card className="p-6">
        <h2 className="text-2xl font-bold mb-4">Edit Village</h2>
        <p className="text-gray-600 mb-4">
          Search for a village by name, operator, or suburb, then edit any field and save.
        </p>

        {/* Search */}
        <div className="flex gap-2 mb-4">
          <div className="flex-1">
            <Label htmlFor="search">Search Villages</Label>
            <Input
              id="search"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="e.g., Adventist, Avondale, Sydney..."
              onKeyDown={(e) => e.key === 'Enter' && searchVillages()}
            />
          </div>
          <div className="flex items-end">
            <Button onClick={searchVillages} disabled={searching}>
              {searching ? <Loader2 className="size-4 animate-spin mr-2" /> : <Search className="size-4 mr-2" />}
              Search
            </Button>
          </div>
        </div>

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

        {/* Search Results */}
        {villages.length > 0 && !selectedVillage && (
          <div>
            <h3 className="font-semibold mb-2">Found {villages.length} village(s):</h3>
            <div className="space-y-2">
              {villages.map((village) => (
                <button
                  key={village.id}
                  onClick={() => selectVillage(village)}
                  className="w-full p-3 border rounded-lg hover:bg-gray-50 text-left transition-colors"
                >
                  <div className="font-semibold">{village.name}</div>
                  <div className="text-sm text-gray-600">
                    {village.operator} • {village.suburb}, {village.state} {village.postcode}
                  </div>
                </button>
              ))}
            </div>
          </div>
        )}
      </Card>

      {/* Edit Form */}
      {editedVillage && (
        <Card className="p-6">
          <h3 className="text-xl font-bold mb-4">
            Editing: {selectedVillage?.name}
          </h3>

          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="col-span-2">
                <Label htmlFor="name">Village Name *</Label>
                <Input
                  id="name"
                  value={editedVillage.name}
                  onChange={(e) => updateField('name', e.target.value)}
                  placeholder="e.g., Avondale Retirement Village"
                />
              </div>

              <div className="col-span-2">
                <Label htmlFor="operator">Operator</Label>
                <Input
                  id="operator"
                  value={editedVillage.operator || ''}
                  onChange={(e) => updateField('operator', e.target.value)}
                  placeholder="e.g., Adventist Senior Living"
                />
              </div>

              <div>
                <Label htmlFor="suburb">Suburb *</Label>
                <Input
                  id="suburb"
                  value={editedVillage.suburb}
                  onChange={(e) => updateField('suburb', e.target.value)}
                  placeholder="e.g., Cooranbong"
                />
              </div>

              <div>
                <Label htmlFor="state">State *</Label>
                <select
                  id="state"
                  value={editedVillage.state}
                  onChange={(e) => updateField('state', e.target.value)}
                  className="w-full px-3 py-2 border rounded-md"
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
                <Label htmlFor="postcode">Postcode *</Label>
                <Input
                  id="postcode"
                  value={editedVillage.postcode}
                  onChange={(e) => updateField('postcode', e.target.value)}
                  placeholder="e.g., 2265"
                />
              </div>

              <div>
                <Label htmlFor="facility_type">Facility Type *</Label>
                <select
                  id="facility_type"
                  value={editedVillage.facility_type}
                  onChange={(e) => updateField('facility_type', e.target.value)}
                  className="w-full px-3 py-2 border rounded-md"
                >
                  <option value="retirement_village">Retirement Village</option>
                  <option value="aged_care">Aged Care</option>
                  <option value="both">Both</option>
                  <option value="unclassified">Unclassified</option>
                </select>
              </div>

              <div className="col-span-2">
                <Label htmlFor="website">Website</Label>
                <Input
                  id="website"
                  value={editedVillage.website || ''}
                  onChange={(e) => updateField('website', e.target.value)}
                  placeholder="https://..."
                />
              </div>
            </div>

            <div className="flex gap-2">
              <Button onClick={saveVillage} disabled={saving}>
                {saving ? <Loader2 className="size-4 animate-spin mr-2" /> : <Save className="size-4 mr-2" />}
                Save Changes
              </Button>
              <Button onClick={cancelEdit} variant="outline">
                Cancel
              </Button>
              <Button 
                onClick={() => {
                  setSelectedVillage(null);
                  setEditedVillage(null);
                  setError(null);
                  setSuccess(null);
                }} 
                variant="outline"
              >
                Back to Search
              </Button>
              <Button onClick={deleteVillage} variant="destructive">
                {saving ? <Loader2 className="size-4 animate-spin mr-2" /> : <Trash2 className="size-4 mr-2" />}
                Delete Village
              </Button>
            </div>
          </div>
        </Card>
      )}
    </div>
  );
}