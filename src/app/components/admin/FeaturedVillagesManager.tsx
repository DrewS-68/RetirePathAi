import { useState, useEffect } from 'react';
import { projectId, publicAnonKey } from '../../utils/supabase/info';
import { Star, Search, MapPin, DollarSign, X } from 'lucide-react';

interface Village {
  id: string;
  name: string;
  operator: string | null;
  location: string;
  suburb: string;
  state: string;
  postcode: string;
  village_type: string | null;
  entry_price_min: number | null;
  entry_price_max: number | null;
  featured: boolean;
  status: string;
  created_at: string;
}

export function FeaturedVillagesManager({ accessToken }: { accessToken: string }) {
  const [villages, setVillages] = useState<Village[]>([]);
  const [featuredVillages, setFeaturedVillages] = useState<Village[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedState, setSelectedState] = useState('');

  useEffect(() => {
    fetchVillages();
  }, []);

  const fetchVillages = async () => {
    setLoading(true);
    try {
      const response = await fetch(
        `https://${projectId}.supabase.co/functions/v1/make-server-3bba8be8/villages/admin/all`,
        {
          headers: {
            'Authorization': `Bearer ${accessToken}`,
          },
        }
      );

      if (!response.ok) throw new Error('Failed to fetch villages');

      const data = await response.json();
      const approvedVillages = (data.villages || []).filter((v: Village) => v.status === 'approved');
      setVillages(approvedVillages);
      setFeaturedVillages(approvedVillages.filter((v: Village) => v.featured));
    } catch (error) {
      console.error('Error fetching villages:', error);
    } finally {
      setLoading(false);
    }
  };

  const toggleFeatured = async (villageId: string, currentFeatured: boolean) => {
    try {
      const response = await fetch(
        `https://${projectId}.supabase.co/functions/v1/make-server-3bba8be8/villages/admin/${villageId}`,
        {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${accessToken}`,
          },
          body: JSON.stringify({
            featured: !currentFeatured,
          }),
        }
      );

      if (!response.ok) throw new Error('Failed to update village');

      await fetchVillages();
    } catch (error) {
      console.error('Error toggling featured status:', error);
      alert('Failed to update featured status');
    }
  };

  const formatCurrency = (amount: number | null) => {
    if (!amount) return 'N/A';
    return new Intl.NumberFormat('en-AU', { style: 'currency', currency: 'AUD', maximumFractionDigits: 0 }).format(amount);
  };

  const filteredVillages = villages.filter((village) => {
    const matchesSearch = village.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         village.suburb.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         (village.operator && village.operator.toLowerCase().includes(searchTerm.toLowerCase()));
    const matchesState = !selectedState || village.state === selectedState;
    return matchesSearch && matchesState;
  });

  const states = Array.from(new Set(villages.map(v => v.state))).sort();

  return (
    <div className="space-y-6">
      {/* Featured Count Banner */}
      <div className="bg-gradient-to-r from-amber-500 to-orange-500 text-white p-6 rounded-lg shadow-lg">
        <div className="flex items-center gap-3">
          <Star className="w-8 h-8" fill="currentColor" />
          <div>
            <h3 className="text-2xl">{featuredVillages.length} Featured Villages</h3>
            <p className="text-sm opacity-90">These villages appear at the top of search results</p>
          </div>
        </div>
      </div>

      {/* Search and Filters */}
      <div className="bg-white p-4 rounded-lg border border-gray-200">
        <div className="flex flex-col md:flex-row gap-4">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="text"
              placeholder="Search villages by name, suburb, or operator..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <select
            value={selectedState}
            onChange={(e) => setSelectedState(e.target.value)}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
          >
            <option value="">All States</option>
            {states.map((state) => (
              <option key={state} value={state}>{state}</option>
            ))}
          </select>
          {(searchTerm || selectedState) && (
            <button
              onClick={() => {
                setSearchTerm('');
                setSelectedState('');
              }}
              className="px-4 py-2 text-sm text-gray-600 hover:text-gray-800"
            >
              Clear Filters
            </button>
          )}
        </div>
      </div>

      {/* Featured Villages Section */}
      {featuredVillages.length > 0 && (
        <div>
          <h3 className="text-lg mb-4 flex items-center gap-2">
            <Star className="w-5 h-5 text-amber-500" fill="currentColor" />
            Currently Featured ({featuredVillages.length})
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {featuredVillages.map((village) => (
              <div key={village.id} className="bg-gradient-to-br from-amber-50 to-orange-50 border-2 border-amber-200 rounded-lg p-4">
                <div className="flex justify-between items-start mb-3">
                  <div className="flex-1">
                    <h4 className="font-medium mb-1">{village.name}</h4>
                    {village.operator && (
                      <div className="text-sm text-gray-600">{village.operator}</div>
                    )}
                  </div>
                  <Star className="w-5 h-5 text-amber-500 flex-shrink-0" fill="currentColor" />
                </div>
                <div className="space-y-2 mb-4">
                  <div className="flex items-center gap-2 text-sm text-gray-600">
                    <MapPin className="w-4 h-4" />
                    {village.suburb}, {village.state}
                  </div>
                  {(village.entry_price_min || village.entry_price_max) && (
                    <div className="flex items-center gap-2 text-sm text-gray-600">
                      <DollarSign className="w-4 h-4" />
                      {formatCurrency(village.entry_price_min)} - {formatCurrency(village.entry_price_max)}
                    </div>
                  )}
                </div>
                <button
                  onClick={() => toggleFeatured(village.id, village.featured)}
                  className="w-full px-4 py-2 bg-white border border-amber-300 text-amber-700 rounded-lg hover:bg-amber-50 transition-colors text-sm"
                >
                  Remove Featured Status
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* All Villages Table */}
      <div>
        <h3 className="text-lg mb-4">All Approved Villages ({filteredVillages.length})</h3>
        <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
          {loading ? (
            <div className="p-8 text-center text-gray-500">Loading villages...</div>
          ) : filteredVillages.length === 0 ? (
            <div className="p-8 text-center text-gray-500">No villages found</div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50 border-b border-gray-200">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs text-gray-500 uppercase tracking-wider">Village</th>
                    <th className="px-6 py-3 text-left text-xs text-gray-500 uppercase tracking-wider">Location</th>
                    <th className="px-6 py-3 text-left text-xs text-gray-500 uppercase tracking-wider">Type</th>
                    <th className="px-6 py-3 text-left text-xs text-gray-500 uppercase tracking-wider">Entry Price</th>
                    <th className="px-6 py-3 text-left text-xs text-gray-500 uppercase tracking-wider">Status</th>
                    <th className="px-6 py-3 text-left text-xs text-gray-500 uppercase tracking-wider">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {filteredVillages.map((village) => (
                    <tr key={village.id} className={village.featured ? 'bg-amber-50' : 'hover:bg-gray-50'}>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-2">
                          {village.featured && (
                            <Star className="w-4 h-4 text-amber-500 flex-shrink-0" fill="currentColor" />
                          )}
                          <div>
                            <div className="text-sm">{village.name}</div>
                            {village.operator && (
                              <div className="text-xs text-gray-500">{village.operator}</div>
                            )}
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 text-sm">
                        <div>{village.suburb}</div>
                        <div className="text-gray-500">{village.state} {village.postcode}</div>
                      </td>
                      <td className="px-6 py-4 text-sm">{village.village_type || 'N/A'}</td>
                      <td className="px-6 py-4 text-sm">
                        {village.entry_price_min && village.entry_price_max ? (
                          <div>
                            <div>{formatCurrency(village.entry_price_min)}</div>
                            <div className="text-gray-500 text-xs">to {formatCurrency(village.entry_price_max)}</div>
                          </div>
                        ) : (
                          'N/A'
                        )}
                      </td>
                      <td className="px-6 py-4">
                        {village.featured ? (
                          <span className="px-2 py-1 bg-amber-100 text-amber-700 rounded-full text-xs">
                            ⭐ Featured
                          </span>
                        ) : (
                          <span className="px-2 py-1 bg-gray-100 text-gray-600 rounded-full text-xs">
                            Standard
                          </span>
                        )}
                      </td>
                      <td className="px-6 py-4">
                        <button
                          onClick={() => toggleFeatured(village.id, village.featured)}
                          className={`px-3 py-1 rounded-lg text-sm transition-colors ${
                            village.featured
                              ? 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                              : 'bg-amber-100 text-amber-700 hover:bg-amber-200'
                          }`}
                        >
                          {village.featured ? 'Remove Featured' : 'Make Featured'}
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>

      {/* Info Box */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <div className="flex gap-3">
          <div className="text-blue-600 flex-shrink-0">
            <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
            </svg>
          </div>
          <div className="text-sm text-blue-800">
            <strong>Village Partnership Program:</strong> Featured villages appear at the top of all search results in the public directory, giving them premium visibility to users looking for retirement villages. This is a revenue opportunity - you can charge villages for featured placement.
          </div>
        </div>
      </div>
    </div>
  );
}
