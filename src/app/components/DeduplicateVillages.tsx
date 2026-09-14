import { useState } from 'react';
import { getSupabaseClient } from '../utils/supabase/client';
import { Button } from './ui/button';
import { AlertCircle, CheckCircle, Trash2, Eye } from 'lucide-react';

interface DuplicateGroup {
  key: string;
  name: string;
  suburb: string;
  postcode: string;
  villages: any[];
}

export function DeduplicateVillages() {
  const [checking, setChecking] = useState(false);
  const [removing, setRemoving] = useState(false);
  const [duplicates, setDuplicates] = useState<DuplicateGroup[]>([]);
  const [removeResult, setRemoveResult] = useState<any>(null);

  const findDuplicates = async () => {
    setChecking(true);
    setDuplicates([]);
    setRemoveResult(null);
    
    try {
      const supabase = getSupabaseClient();
      
      // Fetch all villages
      const { data: villages, error } = await supabase
        .from('retirement_villages')
        .select('*')
        .order('created_at', { ascending: true });
      
      if (error) throw error;
      
      console.log(`Checking ${villages?.length} villages for duplicates...`);
      
      // Group by name + suburb + postcode (case insensitive)
      const groups = new Map<string, any[]>();
      
      villages?.forEach((village) => {
        const name = (village.name || '').toLowerCase().trim();
        const suburb = (village.suburb || '').toLowerCase().trim();
        const postcode = (village.postcode || '').trim();
        
        // Create a unique key
        const key = `${name}|||${suburb}|||${postcode}`;
        
        if (!groups.has(key)) {
          groups.set(key, []);
        }
        groups.get(key)!.push(village);
      });
      
      // Find groups with duplicates (2+ villages)
      const duplicateGroups: DuplicateGroup[] = [];
      
      groups.forEach((villages, key) => {
        if (villages.length > 1) {
          const [name, suburb, postcode] = key.split('|||');
          duplicateGroups.push({
            key,
            name,
            suburb,
            postcode,
            villages: villages.sort((a, b) => {
              // Sort by data completeness (more complete = better)
              const scoreA = calculateCompletenessScore(a);
              const scoreB = calculateCompletenessScore(b);
              return scoreB - scoreA; // Best first
            })
          });
        }
      });
      
      console.log(`Found ${duplicateGroups.length} duplicate groups with ${duplicateGroups.reduce((sum, g) => sum + g.villages.length, 0)} total villages`);
      setDuplicates(duplicateGroups);
      
    } catch (err: any) {
      console.error(err);
      alert(`Error: ${err.message}`);
    } finally {
      setChecking(false);
    }
  };

  const calculateCompletenessScore = (village: any): number => {
    let score = 0;
    
    // Check for important fields
    if (village.postcode) score += 10;
    if (village.suburb) score += 10;
    if (village.latitude && village.longitude) score += 20;
    if (village.description) score += 5;
    if (village.contact_phone) score += 5;
    if (village.contact_email) score += 5;
    if (village.website) score += 5;
    if (village.operator) score += 5;
    if (village.entry_price_min || village.entry_price_max) score += 5;
    if (village.monthly_fees_min || village.monthly_fees_max) score += 5;
    if (village.amenities && village.amenities.length > 0) score += 5;
    if (village.care_services && village.care_services.length > 0) score += 5;
    if (village.bedrooms && village.bedrooms.length > 0) score += 5;
    
    return score;
  };

  const removeDuplicates = async () => {
    if (duplicates.length === 0) return;
    
    const confirmed = confirm(
      `This will remove ${duplicates.reduce((sum, g) => sum + (g.villages.length - 1), 0)} duplicate villages.\n\n` +
      `For each duplicate group, we'll KEEP the most complete record and DELETE the rest.\n\n` +
      `Continue?`
    );
    
    if (!confirmed) return;
    
    setRemoving(true);
    setRemoveResult(null);
    
    try {
      const supabase = getSupabaseClient();
      
      let kept = 0;
      let removed = 0;
      const errors: string[] = [];
      
      for (const group of duplicates) {
        try {
          // Keep the first one (most complete)
          const toKeep = group.villages[0];
          const toRemove = group.villages.slice(1);
          
          console.log(`Keeping: ${toKeep.name} (ID: ${toKeep.id}, Score: ${calculateCompletenessScore(toKeep)})`);
          
          // Remove duplicates
          for (const village of toRemove) {
            console.log(`  Removing: ${village.name} (ID: ${village.id}, Score: ${calculateCompletenessScore(village)})`);
            
            const { error: deleteError } = await supabase
              .from('retirement_villages')
              .delete()
              .eq('id', village.id);
            
            if (deleteError) throw deleteError;
            
            removed++;
          }
          
          kept++;
          
        } catch (err: any) {
          console.error(`Error processing group ${group.name}:`, err);
          errors.push(`${group.name}: ${err.message}`);
        }
        
        // Small delay
        await new Promise(resolve => setTimeout(resolve, 50));
      }
      
      setRemoveResult({
        success: true,
        kept,
        removed,
        errors: errors.slice(0, 10)
      });
      
      console.log(`✅ Kept ${kept} villages, removed ${removed} duplicates`);
      
      // Trigger refresh
      window.dispatchEvent(new Event('villageDataUpdated'));
      
    } catch (err: any) {
      console.error(err);
      setRemoveResult({ success: false, error: err.message });
    } finally {
      setRemoving(false);
    }
  };

  return (
    <div className="max-w-6xl mx-auto p-6 bg-white rounded-lg shadow-lg">
      <h2 className="text-2xl font-bold mb-4 flex items-center gap-2">
        <Trash2 className="size-6 text-red-600" />
        Remove Duplicate Villages
      </h2>
      
      <div className="mb-4 p-4 bg-yellow-50 border border-yellow-200 rounded">
        <p className="text-sm text-gray-700 mb-2">
          <strong>What this does:</strong> Finds villages with the same name, suburb, and postcode.
        </p>
        <p className="text-sm text-gray-700">
          For each duplicate group, it keeps the most complete record and deletes the rest.
        </p>
      </div>
      
      <div className="space-y-4">
        <button 
          onClick={findDuplicates} 
          disabled={checking}
          className="w-full px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 font-semibold"
        >
          {checking ? 'Checking...' : 'Find Duplicates'}
        </button>

        {duplicates.length > 0 && (
          <div className="space-y-4">
            <div className="p-4 bg-orange-50 border border-orange-200 rounded">
              <strong className="text-orange-900">
                Found {duplicates.length} duplicate groups ({duplicates.reduce((sum, g) => sum + g.villages.length, 0)} total villages)
              </strong>
              <p className="text-sm text-orange-700 mt-1">
                {duplicates.reduce((sum, g) => sum + (g.villages.length - 1), 0)} duplicates will be removed
              </p>
            </div>
            
            {/* Show preview of duplicates */}
            <div className="max-h-96 overflow-y-auto border rounded-lg">
              <div className="divide-y">
                {duplicates.slice(0, 20).map((group) => (
                  <div key={group.key} className="p-4 bg-white hover:bg-gray-50">
                    <div className="font-semibold text-gray-900 mb-2">
                      {group.name} - {group.suburb} {group.postcode}
                    </div>
                    <div className="space-y-2">
                      {group.villages.map((village, idx) => (
                        <div 
                          key={village.id} 
                          className={`text-sm p-2 rounded border ${
                            idx === 0 
                              ? 'bg-green-50 border-green-300' 
                              : 'bg-red-50 border-red-300'
                          }`}
                        >
                          <div className="flex items-center justify-between">
                            <div>
                              <strong className={idx === 0 ? 'text-green-700' : 'text-red-700'}>
                                {idx === 0 ? '✓ KEEP' : '✗ DELETE'}
                              </strong>
                              <span className="ml-2 text-gray-600">
                                ID: {village.id.slice(0, 8)}... | 
                                Score: {calculateCompletenessScore(village)} | 
                                Created: {new Date(village.created_at).toLocaleDateString()}
                              </span>
                            </div>
                            <div className="flex gap-2 text-xs">
                              {village.postcode && <span className="px-2 py-1 bg-blue-100 rounded">Has Postcode</span>}
                              {village.latitude && <span className="px-2 py-1 bg-purple-100 rounded">Has Coords</span>}
                              {village.contact_phone && <span className="px-2 py-1 bg-green-100 rounded">Has Phone</span>}
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
              
              {duplicates.length > 20 && (
                <div className="p-4 bg-gray-50 text-center text-sm text-gray-600">
                  ... and {duplicates.length - 20} more duplicate groups
                </div>
              )}
            </div>
            
            <button 
              onClick={removeDuplicates} 
              disabled={removing}
              className="w-full px-6 py-3 bg-red-600 text-white rounded-lg hover:bg-red-700 disabled:opacity-50 font-semibold"
            >
              {removing ? 'Removing...' : `Remove ${duplicates.reduce((sum, g) => sum + (g.villages.length - 1), 0)} Duplicates`}
            </button>
          </div>
        )}
        
        {duplicates.length === 0 && !checking && (
          <div className="p-4 bg-green-50 border border-green-200 rounded text-green-700">
            No duplicates found! ✅
          </div>
        )}
        
        {removeResult && removeResult.success && (
          <div className="p-4 bg-green-50 border border-green-200 rounded">
            <div className="flex items-center gap-2 mb-2">
              <CheckCircle className="size-5 text-green-600" />
              <strong className="text-green-900">
                ✅ Removed {removeResult.removed} duplicates, kept {removeResult.kept} villages!
              </strong>
            </div>
            
            {removeResult.errors.length > 0 && (
              <div className="mt-2">
                <p className="text-sm text-orange-700">
                  ⚠️ Some errors occurred:
                </p>
                <div className="mt-2 text-xs space-y-1 max-h-32 overflow-y-auto">
                  {removeResult.errors.map((err: string, i: number) => (
                    <div key={i} className="text-orange-600">{err}</div>
                  ))}
                </div>
              </div>
            )}
            
            <p className="text-sm text-green-700 mt-3">
              The directory will refresh automatically! 🎉
            </p>
          </div>
        )}
        
        {removeResult && !removeResult.success && (
          <div className="p-4 bg-red-50 border border-red-200 rounded text-red-700">
            <div className="flex items-center gap-2">
              <AlertCircle className="size-5" />
              <strong>Error:</strong>
            </div>
            <p className="mt-1">{removeResult.error}</p>
          </div>
        )}
      </div>
    </div>
  );
}
