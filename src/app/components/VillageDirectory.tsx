import { useState, useEffect } from 'react';
import { getSupabaseClient } from '../utils/supabase/client';
import { Card } from './ui/card';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { Checkbox } from './ui/checkbox';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from './ui/dialog';
import { Disclaimer } from './ui/disclaimer';
import {
  Building2,
  Search,
  Filter,
  X,
  MapPin,
  DollarSign,
  Heart,
  Home,
  Dumbbell,
  Phone,
  Mail,
  Globe,
  ChevronRight,
  Activity
} from 'lucide-react';

interface Village {
  id: string;
  name: string;
  operator: string | null;
  location: string;
  suburb: string;
  postcode: string;
  state: string;
  village_type: string | null;
  care_level: string | null;
  entry_price_min: number | null;
  entry_price_max: number | null;
  monthly_fees_min: number | null;
  monthly_fees_max: number | null;
  dmf_structure: string | null;
  dmf_percentage: number | null;
  dmf_cap: number | null;
  amenities: string[];
  care_services: string[];
  activities: string[];
  pet_friendly: boolean;
  total_units: number | null;
  bedrooms: string[];
  age_restriction: number | null;
  contact_phone: string | null;
  contact_email: string | null;
  website: string | null;
  description: string | null;
  images: string[];
  latitude?: number;
  longitude?: number;
  distance?: number;
}

export function VillageDirectory() {
  const [villages, setVillages] = useState<Village[]>([]);
  const [filteredVillages, setFilteredVillages] = useState<Village[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedVillage, setSelectedVillage] = useState<Village | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [showFilters, setShowFilters] = useState(false);
  const [proximitySearchActive, setProximitySearchActive] = useState(false);
  const [searchPostcode, setSearchPostcode] = useState<string | null>(null);
  
  const [filters, setFilters] = useState({
    state: 'all',
    villageType: 'all',
    careLevel: 'all',
    petFriendly: false,
    bedrooms: [] as string[],
  });

  useEffect(() => {
    fetchVillages();
    
    const handleVillageUpdate = () => {
      console.log('Village data updated, refreshing directory...');
      fetchVillages();
    };
    
    window.addEventListener('villageDataUpdated', handleVillageUpdate);
    
    return () => {
      window.removeEventListener('villageDataUpdated', handleVillageUpdate);
    };
  }, []);

  useEffect(() => {
    applyFilters();
  }, [villages, searchTerm, filters]);

  const fetchVillages = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const supabase = getSupabaseClient();

      const allVillages: Village[] = [];
      let page = 0;
      const pageSize = 1000;
      let hasMore = true;

      while (hasMore) {
        const from = page * pageSize;
        const to = from + pageSize - 1;

        const { data, error: supabaseError } = await supabase
          .from('retirement_villages')
          .select('*')
          .eq('status', 'approved')
          .neq('facility_type', 'aged_care')
          .not('facility_type', 'is', null)
          .order('name', { ascending: true })
          .range(from, to);

        if (supabaseError) {
          throw new Error(`Supabase error: ${supabaseError.message}`);
        }

        if (data && data.length > 0) {
          allVillages.push(...data);
          
          if (data.length < pageSize) {
            hasMore = false;
          } else {
            page++;
          }
        } else {
          hasMore = false;
        }
      }

      setVillages(allVillages);
    } catch (err) {
      console.error('Error fetching villages:', err);
      setError(err instanceof Error ? err.message : 'Failed to load villages');
    } finally {
      setLoading(false);
    }
  };

  const applyFilters = async () => {
    let filtered = [...villages];

    if (searchTerm) {
      const term = searchTerm.toLowerCase().trim();
      
      // Check if search term is a 4-digit Australian postcode
      const isPostcode = /^\d{4}$/.test(term);
      
      if (isPostcode) {
        console.log(`Attempting proximity search for postcode: ${term}`);
        
        // First, find villages with exact postcode match
        const exactPostcodeMatches = filtered.filter((v) => v.postcode === term);
        console.log(`Found ${exactPostcodeMatches.length} villages with exact postcode ${term}`);
        console.log(`Villages with exact postcode:`, exactPostcodeMatches.map(v => ({
          name: v.name,
          postcode: v.postcode,
          hasCoords: !!(v.latitude && v.longitude),
          lat: v.latitude,
          lon: v.longitude
        })));
        
        // Count villages with coordinates
        const villagesWithCoords = filtered.filter((v: any) => v.latitude && v.longitude);
        console.log(`Total villages with coordinates: ${villagesWithCoords.length} out of ${filtered.length}`);
        
        // Try proximity search
        const coords = await geocodePostcode(term);
        
        if (coords) {
          console.log(`Found coordinates for ${term}:`, coords);
          setProximitySearchActive(true);
          setSearchPostcode(term);
          
          // Filter villages with valid coordinates within 50km
          const villagesWithDistance = filtered
            .filter((v: any) => v.latitude && v.longitude)
            .map((v: any) => ({
              ...v,
              distance: calculateDistance(coords.lat, coords.lon, v.latitude, v.longitude)
            }))
            .filter((v: any) => v.distance <= 50)
            .sort((a: any, b: any) => a.distance - b.distance);
          
          console.log(`Found ${villagesWithDistance.length} villages within 50km of ${term}`);
          console.log(`Nearest villages:`, villagesWithDistance.slice(0, 5).map((v: any) => ({
            name: v.name,
            postcode: v.postcode,
            distance: v.distance.toFixed(1)
          })));
          
          // If we found villages with exact postcode but they don't have coordinates, 
          // add them to the results with distance = 0
          const exactMatchesWithoutCoords = exactPostcodeMatches.filter(
            (v) => !v.latitude || !v.longitude
          );
          
          if (exactMatchesWithoutCoords.length > 0) {
            console.log(`Adding ${exactMatchesWithoutCoords.length} villages with exact postcode but no coordinates`);
            const exactMatchesWithZeroDistance = exactMatchesWithoutCoords.map((v) => ({
              ...v,
              distance: 0
            }));
            filtered = [...exactMatchesWithZeroDistance, ...villagesWithDistance];
          } else {
            filtered = villagesWithDistance;
          }
        } else {
          console.log(`Could not geocode postcode: ${term}, falling back to text search`);
          setProximitySearchActive(false);
          setSearchPostcode(null);
          // Fall back to regular text search
          filtered = filtered.filter(
            (v) =>
              v.name.toLowerCase().includes(term) ||
              v.suburb.toLowerCase().includes(term) ||
              v.postcode.includes(term) ||
              v.operator?.toLowerCase().includes(term) ||
              v.description?.toLowerCase().includes(term)
          );
        }
      } else {
        setProximitySearchActive(false);
        setSearchPostcode(null);
        // Regular text search
        filtered = filtered.filter(
          (v) =>
            v.name.toLowerCase().includes(term) ||
            v.suburb.toLowerCase().includes(term) ||
            v.postcode.includes(term) ||
            v.operator?.toLowerCase().includes(term) ||
            v.description?.toLowerCase().includes(term)
        );
      }
    } else {
      setProximitySearchActive(false);
      setSearchPostcode(null);
    }

    if (filters.state !== 'all') {
      filtered = filtered.filter((v) => v.state === filters.state);
    }

    if (filters.villageType !== 'all') {
      filtered = filtered.filter((v) => v.village_type === filters.villageType);
    }

    if (filters.careLevel !== 'all') {
      filtered = filtered.filter((v) => v.care_level === filters.careLevel);
    }

    if (filters.petFriendly) {
      filtered = filtered.filter((v) => v.pet_friendly);
    }

    if (filters.bedrooms.length > 0) {
      filtered = filtered.filter((v) =>
        v.bedrooms && v.bedrooms.length > 0 && v.bedrooms.some((b) => filters.bedrooms.includes(b))
      );
    }

    setFilteredVillages(filtered);
  };

  const clearFilters = () => {
    setFilters({
      state: 'all',
      villageType: 'all',
      careLevel: 'all',
      petFriendly: false,
      bedrooms: [],
    });
    setSearchTerm('');
  };

  const toggleBedroom = (bedroom: string) => {
    if (filters.bedrooms.includes(bedroom)) {
      setFilters({
        ...filters,
        bedrooms: filters.bedrooms.filter((b) => b !== bedroom),
      });
    } else {
      setFilters({
        ...filters,
        bedrooms: [...filters.bedrooms, bedroom],
      });
    }
  };

  const formatPrice = (price: number | null) => {
    if (!price) return 'N/A';
    return `$${price.toLocaleString()}`;
  };

  const formatPriceRange = (min: number | null, max: number | null) => {
    if (!min && !max) return 'Contact for pricing';
    if (!max) return `From ${formatPrice(min)}`;
    if (!min) return `Up to ${formatPrice(max)}`;
    return `${formatPrice(min)} - ${formatPrice(max)}`;
  };

  // Calculate distance between two coordinates in km using Haversine formula
  const calculateDistance = (lat1: number, lon1: number, lat2: number, lon2: number): number => {
    const R = 6371; // Earth's radius in km
    const dLat = (lat2 - lat1) * Math.PI / 180;
    const dLon = (lon2 - lon1) * Math.PI / 180;
    const a = 
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
      Math.sin(dLon / 2) * Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c;
  };

  // Get coordinates for a postcode using OpenStreetMap Nominatim API
  const geocodePostcode = async (postcode: string): Promise<{ lat: number; lon: number } | null> => {
    try {
      const response = await fetch(
        `https://nominatim.openstreetmap.org/search?postalcode=${postcode}&country=Australia&format=json&limit=1`,
        {
          headers: {
            'User-Agent': 'RetirePath Village Directory'
          }
        }
      );
      const data = await response.json();
      if (data && data.length > 0) {
        return {
          lat: parseFloat(data[0].lat),
          lon: parseFloat(data[0].lon)
        };
      }
      return null;
    } catch (error) {
      console.error('Geocoding error:', error);
      return null;
    }
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="mb-2">Retirement Village Directory</h1>
        <p className="text-xl text-muted-foreground">
          Browse {filteredVillages.length} approved retirement villages across Australia
        </p>
      </div>

      <Disclaimer variant="info" className="mb-6">
        <strong>Information Accuracy:</strong> The information displayed in this directory is sourced from retirement village operators, publicly available data, and third-party sources. While we strive to maintain accuracy, RetirePath does not guarantee the completeness or current accuracy of all village details. Entry prices, monthly fees, and availability are subject to change. We strongly recommend contacting villages directly to verify all information and conducting your own due diligence before making any decisions. RetirePath is not responsible for any decisions made based on the information provided in this directory.
      </Disclaimer>

      <Card className="p-6 mb-8">
        {proximitySearchActive && searchPostcode && (
          <div className="mb-4 p-4 bg-blue-50 border border-blue-200 rounded-lg">
            <p className="text-sm text-blue-800">
              <MapPin className="inline size-4 mr-1" />
              Showing villages within 50km of postcode <strong>{searchPostcode}</strong>, sorted by distance
            </p>
          </div>
        )}

        <div className="flex flex-col md:flex-row gap-4">
          <div className="flex-1">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-5 text-muted-foreground" />
              <Input
                placeholder="Search by name, suburb, postcode, or operator..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
          </div>

          <Button
            variant={showFilters ? 'default' : 'outline'}
            onClick={() => setShowFilters(!showFilters)}
          >
            <Filter className="size-4 mr-2" />
            Filters
            {(filters.state !== 'all' || filters.villageType !== 'all' || filters.careLevel !== 'all' || filters.petFriendly || filters.bedrooms.length > 0) && (
              <Badge className="ml-2" variant="secondary">Active</Badge>
            )}
          </Button>

          {(searchTerm || filters.state !== 'all' || filters.villageType !== 'all' || filters.careLevel !== 'all' || filters.petFriendly || filters.bedrooms.length > 0) && (
            <Button variant="ghost" onClick={clearFilters}>
              <X className="size-4 mr-2" />
              Clear All
            </Button>
          )}
        </div>

        {showFilters && (
          <div className="mt-6 pt-6 border-t">
            <div className="grid md:grid-cols-3 gap-6">
              <div>
                <Label htmlFor="state-filter">State</Label>
                <Select value={filters.state} onValueChange={(value) => setFilters({ ...filters, state: value })}>
                  <SelectTrigger id="state-filter">
                    <SelectValue placeholder="All states" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All States</SelectItem>
                    <SelectItem value="VIC">Victoria</SelectItem>
                    <SelectItem value="NSW">New South Wales</SelectItem>
                    <SelectItem value="QLD">Queensland</SelectItem>
                    <SelectItem value="SA">South Australia</SelectItem>
                    <SelectItem value="WA">Western Australia</SelectItem>
                    <SelectItem value="TAS">Tasmania</SelectItem>
                    <SelectItem value="NT">Northern Territory</SelectItem>
                    <SelectItem value="ACT">Australian Capital Territory</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label htmlFor="village-type-filter">Village Type</Label>
                <Select value={filters.villageType} onValueChange={(value) => setFilters({ ...filters, villageType: value })}>
                  <SelectTrigger id="village-type-filter">
                    <SelectValue placeholder="All types" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Types</SelectItem>
                    <SelectItem value="Freehold">Freehold</SelectItem>
                    <SelectItem value="Loan-License">Loan-License</SelectItem>
                    <SelectItem value="Rental">Rental</SelectItem>
                    <SelectItem value="Strata">Strata Title</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label htmlFor="care-level-filter">Care Level</Label>
                <Select value={filters.careLevel} onValueChange={(value) => setFilters({ ...filters, careLevel: value })}>
                  <SelectTrigger id="care-level-filter">
                    <SelectValue placeholder="All levels" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Levels</SelectItem>
                    <SelectItem value="Independent">Independent Living</SelectItem>
                    <SelectItem value="Assisted">Assisted Living</SelectItem>
                    <SelectItem value="Aged Care">Aged Care</SelectItem>
                    <SelectItem value="Mixed">Mixed (Multiple Levels)</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label className="mb-3 block">Bedrooms</Label>
                <div className="flex gap-4">
                  {['1', '2', '3', '4+'].map((bedroom) => (
                    <label key={bedroom} className="flex items-center gap-2">
                      <Checkbox
                        checked={filters.bedrooms.includes(bedroom)}
                        onCheckedChange={() => toggleBedroom(bedroom)}
                      />
                      <span className="text-sm">{bedroom}</span>
                    </label>
                  ))}
                </div>
              </div>

              <div className="md:col-span-3">
                <label className="flex items-center gap-2">
                  <Checkbox
                    checked={filters.petFriendly}
                    onCheckedChange={(checked) => setFilters({ ...filters, petFriendly: checked as boolean })}
                  />
                  <span>Pet Friendly Only</span>
                </label>
              </div>
            </div>
          </div>
        )}
      </Card>

      {loading && (
        <div className="text-center py-12">
          <div className="inline-block size-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mb-4"></div>
          <p className="text-muted-foreground">Loading villages...</p>
        </div>
      )}

      {error && (
        <Card className="p-8 text-center border-red-200 bg-red-50">
          <p className="text-red-800">{error}</p>
          <Button onClick={fetchVillages} className="mt-4">
            Try Again
          </Button>
        </Card>
      )}

      {!loading && !error && filteredVillages.length === 0 && (
        <Card className="p-12 text-center">
          <Building2 className="size-16 mx-auto mb-4 text-muted-foreground opacity-50" />
          <h3 className="mb-2">No villages found</h3>
          <p className="text-muted-foreground mb-4">
            Try adjusting your filters or search terms
          </p>
          <Button onClick={clearFilters} variant="outline">
            Clear Filters
          </Button>
        </Card>
      )}

      {!loading && !error && filteredVillages.length > 0 && (
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredVillages.map((village) => (
            <Card
              key={village.id}
              className="overflow-hidden hover:shadow-lg transition-shadow cursor-pointer"
              onClick={() => {
                setSelectedVillage(village);
              }}
            >
              <div className="p-6">
                <div className="mb-4">
                  <div className="flex items-start gap-3 mb-3">
                    <div className="size-12 bg-gradient-to-br from-blue-100 to-blue-200 rounded-lg flex items-center justify-center flex-shrink-0">
                      <Building2 className="size-6 text-blue-600" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <h3 className="mb-1 break-words">{village.name}</h3>
                      <div className="flex items-center text-sm text-muted-foreground">
                        <MapPin className="size-3.5 mr-1 flex-shrink-0" />
                        <span className="truncate">{village.suburb}, {village.state} {village.postcode}</span>
                      </div>
                    </div>
                  </div>
                  {village.operator && (
                    <p className="text-sm text-muted-foreground">
                      Operated by {village.operator}
                    </p>
                  )}
                </div>

                <div className="flex flex-wrap gap-2 mb-4">
                  {proximitySearchActive && village.distance !== undefined && (
                    <Badge variant="default" className="bg-blue-600">
                      <MapPin className="size-3 mr-1" />
                      {village.distance.toFixed(1)}km away
                    </Badge>
                  )}
                  {village.village_type && (
                    <Badge variant="secondary">{village.village_type}</Badge>
                  )}
                  {village.care_level && (
                    <Badge variant="outline">{village.care_level}</Badge>
                  )}
                  {village.pet_friendly && (
                    <Badge variant="outline">
                      <Heart className="size-3 mr-1" />
                      Pet Friendly
                    </Badge>
                  )}
                </div>

                <div className="mb-4">
                  <div className="flex items-start gap-2 text-sm mb-2">
                    <DollarSign className="size-4 text-green-600 mt-0.5" />
                    <div>
                      <p className="text-muted-foreground">Entry Price</p>
                      <p className="font-medium">
                        {formatPriceRange(village.entry_price_min, village.entry_price_max)}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-start gap-2 text-sm">
                    <DollarSign className="size-4 text-blue-600 mt-0.5" />
                    <div>
                      <p className="text-muted-foreground">Monthly Fees</p>
                      <p className="font-medium">
                        {formatPriceRange(village.monthly_fees_min, village.monthly_fees_max)}
                      </p>
                    </div>
                  </div>
                </div>

                {((village.amenities && village.amenities.length > 0) || (village.bedrooms && village.bedrooms.length > 0)) && (
                  <div className="mb-4 text-sm">
                    {village.bedrooms && village.bedrooms.length > 0 && (
                      <div className="flex items-center gap-2 mb-2">
                        <Home className="size-4 text-muted-foreground" />
                        <span>{village.bedrooms.join(', ')} bedroom options</span>
                      </div>
                    )}
                    {village.amenities && village.amenities.length > 0 && (
                      <div className="flex items-center gap-2">
                        <Dumbbell className="size-4 text-muted-foreground" />
                        <span>{village.amenities.length} amenities</span>
                      </div>
                    )}
                  </div>
                )}

                <Button variant="outline" className="w-full">
                  View Details
                  <ChevronRight className="size-4 ml-2" />
                </Button>
              </div>
            </Card>
          ))}
        </div>
      )}

      {selectedVillage && (
        <Dialog open={!!selectedVillage} onOpenChange={() => setSelectedVillage(null)}>
          <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>{selectedVillage.name}</DialogTitle>
              <DialogDescription>
                <div className="flex items-center gap-2 mt-2">
                  <MapPin className="size-4" />
                  {selectedVillage.location && `${selectedVillage.location}, `}
                  {selectedVillage.suburb}, {selectedVillage.state} {selectedVillage.postcode}
                </div>
              </DialogDescription>
            </DialogHeader>

            <div className="space-y-6">
              <div>
                <h3 className="mb-4">Basic Information</h3>
                <div className="grid md:grid-cols-2 gap-4">
                  {selectedVillage.operator && (
                    <div>
                      <p className="text-sm text-muted-foreground">Operator</p>
                      <p>{selectedVillage.operator}</p>
                    </div>
                  )}
                  {selectedVillage.village_type && (
                    <div>
                      <p className="text-sm text-muted-foreground">Village Type</p>
                      <p>{selectedVillage.village_type}</p>
                    </div>
                  )}
                  {selectedVillage.care_level && (
                    <div>
                      <p className="text-sm text-muted-foreground">Care Level</p>
                      <p>{selectedVillage.care_level}</p>
                    </div>
                  )}
                  {selectedVillage.total_units && (
                    <div>
                      <p className="text-sm text-muted-foreground">Total Units</p>
                      <p>{selectedVillage.total_units}</p>
                    </div>
                  )}
                  {selectedVillage.age_restriction && (
                    <div>
                      <p className="text-sm text-muted-foreground">Minimum Age</p>
                      <p>{selectedVillage.age_restriction}+</p>
                    </div>
                  )}
                  {selectedVillage.bedrooms && selectedVillage.bedrooms.length > 0 && (
                    <div>
                      <p className="text-sm text-muted-foreground">Bedroom Options</p>
                      <p>{selectedVillage.bedrooms.join(', ')}</p>
                    </div>
                  )}
                </div>
              </div>

              {selectedVillage.description && (
                <div>
                  <h3 className="mb-4">About</h3>
                  <p className="text-muted-foreground">{selectedVillage.description}</p>
                </div>
              )}

              <div>
                <h3 className="mb-4">Pricing</h3>
                <div className="grid md:grid-cols-2 gap-4">
                  <Card className="p-4">
                    <div className="flex items-center gap-3 mb-2">
                      <div className="size-10 bg-green-100 rounded-lg flex items-center justify-center">
                        <DollarSign className="size-5 text-green-600" />
                      </div>
                      <div>
                        <p className="text-sm text-muted-foreground">Entry Price</p>
                        <p>{formatPriceRange(selectedVillage.entry_price_min, selectedVillage.entry_price_max)}</p>
                      </div>
                    </div>
                  </Card>
                  <Card className="p-4">
                    <div className="flex items-center gap-3 mb-2">
                      <div className="size-10 bg-blue-100 rounded-lg flex items-center justify-center">
                        <DollarSign className="size-5 text-blue-600" />
                      </div>
                      <div>
                        <p className="text-sm text-muted-foreground">Monthly Fees</p>
                        <p>{formatPriceRange(selectedVillage.monthly_fees_min, selectedVillage.monthly_fees_max)}</p>
                      </div>
                    </div>
                  </Card>
                </div>
                {selectedVillage.dmf_structure && (
                  <div className="mt-4">
                    <p className="text-sm text-muted-foreground mb-1">DMF/Exit Fee Structure</p>
                    <p>{selectedVillage.dmf_structure}</p>
                    {selectedVillage.dmf_percentage && (
                      <p className="text-sm text-muted-foreground mt-1">
                        {selectedVillage.dmf_percentage}% per year
                        {selectedVillage.dmf_cap && ` (capped at ${selectedVillage.dmf_cap}%)`}
                      </p>
                    )}
                  </div>
                )}
              </div>

              {selectedVillage.amenities && selectedVillage.amenities.length > 0 && (
                <div>
                  <h3 className="mb-4 flex items-center gap-2">
                    <Dumbbell className="size-5" />
                    Amenities & Facilities
                  </h3>
                  <div className="flex flex-wrap gap-2">
                    {selectedVillage.amenities.map((amenity) => (
                      <Badge key={amenity} variant="secondary">
                        {amenity}
                      </Badge>
                    ))}
                  </div>
                </div>
              )}

              {selectedVillage.care_services && selectedVillage.care_services.length > 0 && (
                <div>
                  <h3 className="mb-4 flex items-center gap-2">
                    <Heart className="size-5" />
                    Care & Support Services
                  </h3>
                  <div className="flex flex-wrap gap-2">
                    {selectedVillage.care_services.map((service) => (
                      <Badge key={service} variant="secondary">
                        {service}
                      </Badge>
                    ))}
                  </div>
                </div>
              )}

              {selectedVillage.activities && selectedVillage.activities.length > 0 && (
                <div>
                  <h3 className="mb-4 flex items-center gap-2">
                    <Activity className="size-5" />
                    Activities & Programs
                  </h3>
                  <div className="flex flex-wrap gap-2">
                    {selectedVillage.activities.map((activity) => (
                      <Badge key={activity} variant="secondary">
                        {activity}
                      </Badge>
                    ))}
                  </div>
                </div>
              )}

              <div>
                <h3 className="mb-4">Contact Information</h3>
                <div className="space-y-3">
                  {selectedVillage.contact_phone && (
                    <a
                      href={`tel:${selectedVillage.contact_phone}`}
                      className="flex items-center gap-3 p-3 rounded-lg hover:bg-gray-50 transition-colors"
                    >
                      <div className="size-10 bg-blue-100 rounded-lg flex items-center justify-center">
                        <Phone className="size-5 text-blue-600" />
                      </div>
                      <div>
                        <p className="text-sm text-muted-foreground">Phone</p>
                        <p className="font-medium">{selectedVillage.contact_phone}</p>
                      </div>
                    </a>
                  )}
                  {selectedVillage.contact_email && (
                    <a
                      href={`mailto:${selectedVillage.contact_email}`}
                      className="flex items-center gap-3 p-3 rounded-lg hover:bg-gray-50 transition-colors"
                    >
                      <div className="size-10 bg-green-100 rounded-lg flex items-center justify-center">
                        <Mail className="size-5 text-green-600" />
                      </div>
                      <div>
                        <p className="text-sm text-muted-foreground">Email</p>
                        <p className="font-medium">{selectedVillage.contact_email}</p>
                      </div>
                    </a>
                  )}
                  {selectedVillage.website && (
                    <a
                      href={selectedVillage.website}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-3 p-3 rounded-lg hover:bg-gray-50 transition-colors"
                    >
                      <div className="size-10 bg-purple-100 rounded-lg flex items-center justify-center">
                        <Globe className="size-5 text-purple-600" />
                      </div>
                      <div>
                        <p className="text-sm text-muted-foreground">Website</p>
                        <p className="font-medium">{selectedVillage.website}</p>
                      </div>
                    </a>
                  )}
                </div>
              </div>

              <div className="border-t pt-6">
                <p className="text-muted-foreground text-sm">
                  Resident reviews and ratings feature will be available soon. Please contact the village directly for resident testimonials.
                </p>
              </div>

              <div className="flex gap-4">
                <Button className="flex-1">
                  <Phone className="size-4 mr-2" />
                  Contact Village
                </Button>
                <Button variant="outline" className="flex-1">
                  <Heart className="size-4 mr-2" />
                  Save to Favorites
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
}