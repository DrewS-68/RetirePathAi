import { useState } from 'react';
import { getSupabaseClient } from '../utils/supabase/client';
import { Button } from './ui/button';
import { AlertCircle, CheckCircle, Trash2 } from 'lucide-react';

interface DuplicateGroup {
  key: string;
  name: string;
  state: string;
  villages: any[];
  matchReason: string;
}

export function FindVictorianDuplicatesHybrid() {
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
      
      // Fetch only Victorian villages
      const { data: villages, error } = await supabase
        .from('retirement_villages')
        .select('*')
        .eq('state', 'VIC')
        .order('created_at', { ascending: true });
      
      if (error) throw error;
      
      console.log(`Checking ${villages?.length} Victorian villages for duplicates...`);
      
      // Strategy: Find duplicates using HYBRID matching
      // 1. If both have postcode/suburb: Match on name + suburb + postcode
      // 2. If one is missing postcode/suburb: Match on name + address similarity
      // 3. If both have coords: Match on name + coords within 100m
      
      const duplicateGroups = new Map<string, any[]>();
      const processed = new Set<number>();
      
      for (let i = 0; i < villages!.length; i++) {
        if (processed.has(i)) continue;
        
        const village1 = villages![i];
        const group: any[] = [village1];
        
        // Normalize village 1 name
        const name1 = normalizeName(village1.name);
        
        // Look for duplicates
        for (let j = i + 1; j < villages!.length; j++) {
          if (processed.has(j)) continue;
          
          const village2 = villages![j];
          const name2 = normalizeName(village2.name);
          
          // Name must match
          if (name1 !== name2) continue;
          
          // Check if they're duplicates using hybrid logic
          if (areDuplicates(village1, village2)) {
            group.push(village2);
            processed.add(j);
          }
        }
        
        // If we found duplicates, add to groups
        if (group.length > 1) {
          duplicateGroups.set(`${name1}-${i}`, group);
        }
        
        processed.add(i);
      }
      
      // Convert to array
      const duplicateArray: DuplicateGroup[] = [];
      
      duplicateGroups.forEach((villages, key) => {
        const matchReason = getMatchReason(villages);
        
        duplicateArray.push({
          key,
          name: villages[0].name,
          state: 'VIC',
          villages: villages.sort((a, b) => {
            // Sort by data completeness (more complete = better)
            const scoreA = calculateCompletenessScore(a);
            const scoreB = calculateCompletenessScore(b);
            if (scoreB !== scoreA) return scoreB - scoreA;
            
            // If equal completeness, prefer older record (first import)
            return new Date(a.created_at).getTime() - new Date(b.created_at).getTime();
          }),
          matchReason
        });
      });
      
      // Sort by number of duplicates
      duplicateArray.sort((a, b) => b.villages.length - a.villages.length);
      
      console.log(`Found ${duplicateArray.length} duplicate groups with ${duplicateArray.reduce((sum, g) => sum + g.villages.length, 0)} total villages`);
      setDuplicates(duplicateArray);
      
    } catch (err: any) {
      console.error(err);
      alert(`Error: ${err.message}`);
    } finally {
      setChecking(false);
    }
  };

  const normalizeName = (name: string): string => {
    return (name || '')
      .toLowerCase()
      .trim()
      .replace(/\s+/g, ' ');
  };

  const areDuplicates = (v1: any, v2: any): boolean => {
    // Strategy 1: Exact match on postcode + suburb
    if (v1.postcode && v2.postcode && v1.suburb && v2.suburb) {
      if (v1.postcode === v2.postcode && 
          v1.suburb.toLowerCase().trim() === v2.suburb.toLowerCase().trim()) {
        return true;
      }
    }
    
    // Strategy 2: One has postcode, other doesn't - match on address similarity
    if ((v1.postcode && !v2.postcode) || (!v1.postcode && v2.postcode)) {
      const addr1 = (v1.address || '').toLowerCase().trim();
      const addr2 = (v2.address || '').toLowerCase().trim();
      
      if (addr1 && addr2) {
        // Calculate similarity (simple approach: check if one contains the other)
        const similarity = calculateAddressSimilarity(addr1, addr2);
        if (similarity > 0.6) return true;
      }
      
      // Also check if the one WITH postcode matches the address of the one WITHOUT
      const withPostcode = v1.postcode ? v1 : v2;
      const withoutPostcode = v1.postcode ? v2 : v1;
      
      const addrWithout = (withoutPostcode.address || '').toLowerCase();
      const suburbWith = (withPostcode.suburb || '').toLowerCase();
      const postcodeWith = (withPostcode.postcode || '');
      
      // Check if address contains suburb and postcode
      if (addrWithout.includes(suburbWith) && addrWithout.includes(postcodeWith)) {
        return true;
      }
    }
    
    // Strategy 3: Both have coordinates - match if within 100m
    if (v1.latitude && v1.longitude && v2.latitude && v2.longitude) {
      const distance = calculateDistance(
        v1.latitude, v1.longitude,
        v2.latitude, v2.longitude
      );
      
      if (distance < 0.1) return true; // Within 100m
    }
    
    return false;
  };

  const calculateAddressSimilarity = (addr1: string, addr2: string): number => {
    // Simple Jaccard similarity on words
    const words1 = new Set(addr1.split(/\s+/));
    const words2 = new Set(addr2.split(/\s+/));
    
    const intersection = new Set([...words1].filter(x => words2.has(x)));
    const union = new Set([...words1, ...words2]);
    
    return intersection.size / union.size;
  };

  const calculateDistance = (lat1: number, lon1: number, lat2: number, lon2: number): number => {
    // Haversine formula (returns distance in km)
    const R = 6371;
    const dLat = (lat2 - lat1) * Math.PI / 180;
    const dLon = (lon2 - lon1) * Math.PI / 180;
    const a = 
      Math.sin(dLat/2) * Math.sin(dLat/2) +
      Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
      Math.sin(dLon/2) * Math.sin(dLon/2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
    return R * c;
  };

  const getMatchReason = (villages: any[]): string => {
    if (villages.length < 2) return '';
    
    const v1 = villages[0];
    const v2 = villages[1];
    
    // Check which strategy matched
    if (v1.postcode && v2.postcode && v1.suburb && v2.suburb &&
        v1.postcode === v2.postcode && v1.suburb === v2.suburb) {
      return 'Exact match (suburb + postcode)';
    }
    
    if ((v1.postcode && !v2.postcode) || (!v1.postcode && v2.postcode)) {
      return 'Hybrid match (one missing postcode)';
    }
    
    if (v1.latitude && v2.latitude) {
      const dist = calculateDistance(v1.latitude, v1.longitude, v2.latitude, v2.longitude);
      return `GPS match (${Math.round(dist * 1000)}m apart)`;
    }
    
    return 'Address similarity';
  };

  const calculateCompletenessScore = (village: any): number => {
    let score = 0;
    
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
    
    const totalToRemove = duplicates.reduce((sum, g) => sum + (g.villages.length - 1), 0);
    
    const confirmed = confirm(
      `⚠️ HYBRID VICTORIAN DUPLICATE REMOVAL\n\n` +
      `This will remove ${totalToRemove} duplicate Victorian villages.\n\n` +
      `Matching strategies:\n` +
      `✅ Exact: name + suburb + postcode\n` +
      `✅ Hybrid: name + address (when postcode missing)\n` +
      `✅ GPS: name + coordinates (within 100m)\n\n` +
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
          const toKeep = group.villages[0];
          const toRemove = group.villages.slice(1);
          
          console.log(`Keeping: ${toKeep.name} (ID: ${toKeep.id}, Score: ${calculateCompletenessScore(toKeep)}, ${toKeep.suburb || 'No suburb'} ${toKeep.postcode || 'No PC'})`);
          
          for (const village of toRemove) {
            console.log(`  Removing: ${village.name} (ID: ${village.id}, Score: ${calculateCompletenessScore(village)}, ${village.suburb || 'No suburb'} ${village.postcode || 'No PC'})`);
            
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
        
        await new Promise(resolve => setTimeout(resolve, 50));
      }
      
      setRemoveResult({
        success: true,
        kept,
        removed,
        errors: errors.slice(0, 10)
      });
      
      console.log(`✅ Kept ${kept} villages, removed ${removed} duplicates`);
      
      window.dispatchEvent(new Event('villageDataUpdated'));
      
    } catch (err: any) {
      console.error(err);
      setRemoveResult({ success: false, error: err.message });
    } finally {
      setRemoving(false);
    }
  };

  return (
    <div className="max-w-6xl mx-auto p-6 bg-white rounded-lg shadow-lg border-2 border-indigo-300">
      <h2 className="text-2xl font-bold mb-4 flex items-center gap-2">
        <Trash2 className="size-6 text-indigo-600" />
        Find Victorian Duplicates (Hybrid Matcher)
      </h2>
      
      <div className="mb-4 p-4 bg-indigo-50 border border-indigo-200 rounded">
        <p className="text-sm text-gray-700 mb-2">
          <strong>🎯 Hybrid Matching:</strong> This uses 3 strategies to find Victorian duplicates:
        </p>
        <ul className="text-sm text-gray-700 space-y-1 ml-4">
          <li>✅ <strong>Exact:</strong> Same name + suburb + postcode</li>
          <li>✅ <strong>Hybrid:</strong> Same name + address similarity (when one is missing postcode)</li>
          <li>✅ <strong>GPS:</strong> Same name + coordinates within 100m</li>
        </ul>
        <p className="text-sm text-gray-600 mt-2">
          Perfect for finding duplicates when one import had missing suburb/postcode data!
        </p>
      </div>
      
      <div className="space-y-4">
        <button 
          onClick={findDuplicates} 
          disabled={checking}
          className="w-full px-6 py-3 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 disabled:opacity-50 font-semibold"
        >
          {checking ? 'Scanning VIC Villages...' : 'Find Victorian Duplicates (Hybrid)'}
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
            
            <div className="max-h-96 overflow-y-auto border rounded-lg">
              <div className="divide-y">
                {duplicates.slice(0, 30).map((group) => (
                  <div key={group.key} className="p-4 bg-white hover:bg-gray-50">
                    <div className="flex items-center justify-between mb-2">
                      <div className="font-semibold text-gray-900">
                        {group.villages[0].name} ({group.villages.length} copies)
                      </div>
                      <div className="text-xs px-2 py-1 bg-blue-100 text-blue-700 rounded">
                        {group.matchReason}
                      </div>
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
                                {village.suburb || 'No Suburb'} {village.postcode || 'No PC'}
                              </span>
                              {village.latitude && (
                                <span className="ml-2 text-xs text-purple-600">
                                  GPS: {village.latitude.toFixed(4)}, {village.longitude.toFixed(4)}
                                </span>
                              )}
                            </div>
                            <div className="flex gap-1 text-xs">
                              <span className="px-2 py-1 bg-gray-100 rounded">
                                Score: {calculateCompletenessScore(village)}
                              </span>
                              {village.postcode && <span className="px-2 py-1 bg-blue-100 rounded">PC</span>}
                              {village.latitude && <span className="px-2 py-1 bg-purple-100 rounded">GPS</span>}
                            </div>
                          </div>
                          <div className="text-xs text-gray-500 mt-1">
                            {village.address || 'No address'}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
              
              {duplicates.length > 30 && (
                <div className="p-4 bg-gray-50 text-center text-sm text-gray-600">
                  ... and {duplicates.length - 30} more duplicate groups
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
