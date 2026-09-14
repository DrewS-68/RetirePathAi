import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { Alert, AlertDescription } from '../ui/alert';
import { Search, Database, CheckCircle, XCircle } from 'lucide-react';
import { getSupabaseClient } from '../../utils/supabase/client';

interface VillageData {
  id: string;
  name: string;
  operator: string | null;
  location: string;
  state: string;
  suburb: string;
  website: string | null;
  entry_price_min: number | null;
  entry_price_max: number | null;
  monthly_fees_min: number | null;
  monthly_fees_max: number | null;
  updated_at: string;
}

export default function QuickVillageInspector() {
  const [searchTerm, setSearchTerm] = useState('ECH');
  const [loading, setLoading] = useState(false);
  const [villages, setVillages] = useState<VillageData[]>([]);
  const [error, setError] = useState<string | null>(null);

  const searchVillages = async () => {
    if (!searchTerm.trim()) {
      setError('Please enter a search term');
      return;
    }

    try {
      setLoading(true);
      setError(null);
      
      const supabase = getSupabaseClient();
      
      // Search by name or operator
      const { data, error: queryError } = await supabase
        .from('retirement_villages')
        .select('id, name, operator, location, state, suburb, website, entry_price_min, entry_price_max, monthly_fees_min, monthly_fees_max, updated_at')
        .or(`name.ilike.%${searchTerm}%,operator.ilike.%${searchTerm}%`)
        .order('name', { ascending: true })
        .limit(20);

      if (queryError) {
        throw new Error(`Database query failed: ${queryError.message}`);
      }

      console.log('🔍 Found villages:', data);
      setVillages(data || []);
      
    } catch (err: any) {
      console.error('❌ Error searching villages:', err);
      setError(err.message || 'Unknown error');
    } finally {
      setLoading(false);
    }
  };

  const formatPrice = (price: number | null) => {
    if (price === null || price === undefined) return 'No data';
    return `$${price.toLocaleString()}`;
  };

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleString();
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Database className="h-5 w-5" />
          Quick Village Inspector
        </CardTitle>
        <CardDescription>
          Check what pricing data is actually in the database
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Search */}
        <div className="flex gap-2">
          <div className="flex-1">
            <Label htmlFor="search">Search by Name or Operator</Label>
            <Input
              id="search"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="e.g., ECH, Glendore, Myrtle Bank..."
              onKeyDown={(e) => e.key === 'Enter' && searchVillages()}
            />
          </div>
          <div className="flex items-end">
            <Button onClick={searchVillages} disabled={loading}>
              <Search className="h-4 w-4 mr-2" />
              {loading ? 'Searching...' : 'Search'}
            </Button>
          </div>
        </div>

        {/* Error */}
        {error && (
          <Alert variant="destructive">
            <XCircle className="h-4 w-4" />
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        {/* Results */}
        {villages.length > 0 && (
          <div className="space-y-4">
            <div className="text-sm font-medium">
              Found {villages.length} village{villages.length !== 1 ? 's' : ''}
            </div>
            
            <div className="space-y-3">
              {villages.map((village) => {
                const hasPricing = village.entry_price_min !== null || village.monthly_fees_min !== null;
                
                return (
                  <Card key={village.id} className={hasPricing ? 'border-green-200 bg-green-50' : 'border-yellow-200 bg-yellow-50'}>
                    <CardContent className="pt-4">
                      <div className="space-y-2">
                        {/* Header */}
                        <div className="flex items-start justify-between">
                          <div>
                            <h3 className="font-semibold text-lg">{village.name}</h3>
                            <p className="text-sm text-muted-foreground">
                              {village.operator} • {village.suburb}, {village.state}
                            </p>
                          </div>
                          {hasPricing ? (
                            <CheckCircle className="h-5 w-5 text-green-600" />
                          ) : (
                            <XCircle className="h-5 w-5 text-yellow-600" />
                          )}
                        </div>

                        {/* Website */}
                        {village.website && (
                          <div className="text-sm">
                            <span className="font-medium">Website:</span>{' '}
                            <a href={village.website} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">
                              {village.website}
                            </a>
                          </div>
                        )}

                        {/* Pricing Data */}
                        <div className="grid grid-cols-2 gap-4 pt-2 border-t">
                          <div>
                            <div className="text-xs text-muted-foreground">Entry Price</div>
                            <div className="font-medium">
                              {village.entry_price_min !== null ? (
                                <>
                                  {formatPrice(village.entry_price_min)}
                                  {village.entry_price_max && village.entry_price_max !== village.entry_price_min && 
                                    ` - ${formatPrice(village.entry_price_max)}`
                                  }
                                </>
                              ) : (
                                <span className="text-yellow-600">No data</span>
                              )}
                            </div>
                          </div>
                          
                          <div>
                            <div className="text-xs text-muted-foreground">Monthly Fees</div>
                            <div className="font-medium">
                              {village.monthly_fees_min !== null ? (
                                <>
                                  {formatPrice(village.monthly_fees_min)}
                                  {village.monthly_fees_max && village.monthly_fees_max !== village.monthly_fees_min && 
                                    ` - ${formatPrice(village.monthly_fees_max)}`
                                  }
                                </>
                              ) : (
                                <span className="text-yellow-600">No data</span>
                              )}
                            </div>
                          </div>
                        </div>

                        {/* Last Updated */}
                        <div className="text-xs text-muted-foreground pt-2 border-t">
                          Last updated: {formatDate(village.updated_at)}
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          </div>
        )}

        {/* No results */}
        {!loading && villages.length === 0 && !error && searchTerm && (
          <Alert>
            <AlertDescription>
              No villages found matching "{searchTerm}"
            </AlertDescription>
          </Alert>
        )}
      </CardContent>
    </Card>
  );
}
