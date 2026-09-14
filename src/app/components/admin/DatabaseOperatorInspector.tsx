import React, { useState } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '../ui/card';
import { Button } from '../ui/button';
import { Badge } from '../ui/badge';
import { Database, Loader2, CheckCircle, XCircle, MapPin } from 'lucide-react';
import { projectId, publicAnonKey } from '../../utils/supabase/info';

interface Village {
  id: string;
  name: string;
  suburb: string;
  postcode: string;
  state: string;
  operator: string | null;
  website: string | null;
  street_address: string | null;
}

export function DatabaseOperatorInspector() {
  const [loading, setLoading] = useState(false);
  const [villages, setVillages] = useState<Village[]>([]);
  const [error, setError] = useState<string | null>(null);

  const fetchVillages = async () => {
    setLoading(true);
    setError(null);

    try {
      const response = await fetch(
        `https://${projectId}.supabase.co/functions/v1/make-server-3bba8be8/villages/vic-all`,
        {
          method: 'GET',
          headers: {
            'Authorization': `Bearer ${publicAnonKey}`,
          },
        }
      );

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${await response.text()}`);
      }

      const data = await response.json();
      console.log('📦 Fetched VIC villages from database:', data);
      
      setVillages(data.villages || []);
    } catch (err: any) {
      console.error('❌ Failed to fetch villages:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const withOperator = villages.filter(v => v.operator && v.operator.trim() !== '');
  const withoutOperator = villages.filter(v => !v.operator || v.operator.trim() === '');
  const withAddress = villages.filter(v => v.street_address && v.street_address.trim() !== '');
  const withoutOperatorButHasAddress = withoutOperator.filter(v => v.street_address && v.street_address.trim() !== '');
  const withoutOperatorAndNoAddress = withoutOperator.filter(v => !v.street_address || v.street_address.trim() === '');

  const exportNoOperatorCSV = () => {
    if (withoutOperator.length === 0) return;

    const csvHeaders = 'Name,Suburb,Postcode,Street Address,Website\n';
    const csvRows = withoutOperator.map(v => 
      `"${v.name}","${v.suburb}","${v.postcode}","${v.street_address || ''}","${v.website || ''}"`
    ).join('\n');

    const csv = csvHeaders + csvRows;
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `vic-villages-no-operator-${Date.now()}.csv`;
    link.click();
  };

  const exportHasAddressCSV = () => {
    if (withoutOperatorButHasAddress.length === 0) return;

    const csvHeaders = 'Name,Suburb,Postcode,Street Address,Website\n';
    const csvRows = withoutOperatorButHasAddress.map(v => 
      `"${v.name}","${v.suburb}","${v.postcode}","${v.street_address || ''}","${v.website || ''}"`
    ).join('\n');

    const csv = csvHeaders + csvRows;
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `vic-villages-no-operator-has-address-${Date.now()}.csv`;
    link.click();
  };

  return (
    <Card className="p-6 bg-gradient-to-r from-blue-50 to-indigo-50 border-2 border-blue-400">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-blue-900">
          <Database className="size-5" />
          🗄️ Database Operator Inspector
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="text-sm text-gray-700 mb-4">
          Query the actual Supabase database to see which VIC villages have operators and street addresses.
        </div>

        <Button 
          onClick={fetchVillages} 
          disabled={loading}
          className="w-full"
        >
          {loading ? (
            <>
              <Loader2 className="size-4 mr-2 animate-spin" />
              Loading from Database...
            </>
          ) : (
            <>
              <Database className="size-4 mr-2" />
              Fetch VIC Villages
            </>
          )}
        </Button>

        {error && (
          <div className="p-3 bg-red-100 border border-red-400 rounded text-red-800 text-sm">
            ❌ {error}
          </div>
        )}

        {villages.length > 0 && (
          <div className="space-y-4">
            {/* Summary Cards */}
            <div className="grid grid-cols-2 gap-3">
              <div className="p-4 bg-white rounded-lg border shadow-sm">
                <div className="text-3xl font-bold text-gray-900">{villages.length}</div>
                <div className="text-sm text-gray-600">Total VIC Villages</div>
              </div>
              <div className="p-4 bg-blue-50 rounded-lg border border-blue-300 shadow-sm">
                <div className="text-3xl font-bold text-blue-700">{withAddress.length}</div>
                <div className="text-sm text-gray-600">Have Street Addresses</div>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="p-4 bg-green-50 rounded-lg border border-green-300 shadow-sm">
                <div className="flex items-center gap-2">
                  <CheckCircle className="size-5 text-green-600" />
                  <div className="text-3xl font-bold text-green-700">{withOperator.length}</div>
                </div>
                <div className="text-sm text-gray-600">Have Operators</div>
                <div className="text-xs text-green-600 mt-1">
                  {((withOperator.length / villages.length) * 100).toFixed(1)}% complete
                </div>
              </div>
              <div className="p-4 bg-red-50 rounded-lg border border-red-300 shadow-sm">
                <div className="flex items-center gap-2">
                  <XCircle className="size-5 text-red-600" />
                  <div className="text-3xl font-bold text-red-700">{withoutOperator.length}</div>
                </div>
                <div className="text-sm text-gray-600">Missing Operators</div>
                <div className="text-xs text-red-600 mt-1">
                  {((withoutOperator.length / villages.length) * 100).toFixed(1)}% incomplete
                </div>
              </div>
            </div>

            {/* Breakdown of Missing Operators */}
            <div className="p-4 bg-yellow-50 rounded-lg border border-yellow-300">
              <div className="text-sm font-semibold text-yellow-900 mb-2">
                🔍 Missing Operators Breakdown:
              </div>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-700">
                    <MapPin className="size-4 inline mr-1 text-green-600" />
                    Have address (ready for scraping)
                  </span>
                  <Badge className="bg-green-600">{withoutOperatorButHasAddress.length}</Badge>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-700">
                    <XCircle className="size-4 inline mr-1 text-red-600" />
                    No address (harder to scrape)
                  </span>
                  <Badge className="bg-red-600">{withoutOperatorAndNoAddress.length}</Badge>
                </div>
              </div>
            </div>

            {/* Export Buttons */}
            <div className="flex gap-2">
              <Button 
                onClick={exportNoOperatorCSV}
                disabled={withoutOperator.length === 0}
                variant="outline"
                className="flex-1"
              >
                Export All {withoutOperator.length} No-Operator Villages
              </Button>
              <Button 
                onClick={exportHasAddressCSV}
                disabled={withoutOperatorButHasAddress.length === 0}
                className="flex-1 bg-green-600 hover:bg-green-700"
              >
                Export {withoutOperatorButHasAddress.length} Ready-to-Scrape
              </Button>
            </div>

            {/* Sample Villages with Addresses but No Operators */}
            {withoutOperatorButHasAddress.length > 0 && (
              <div className="p-4 bg-white rounded-lg border">
                <div className="text-sm font-semibold text-gray-700 mb-3">
                  Sample: Ready to Scrape ({withoutOperatorButHasAddress.length} total)
                </div>
                <div className="space-y-2 max-h-64 overflow-y-auto">
                  {withoutOperatorButHasAddress.slice(0, 10).map(v => (
                    <div key={v.id} className="p-2 bg-green-50 rounded text-xs border border-green-200">
                      <div className="font-semibold text-gray-900">{v.name}</div>
                      <div className="text-gray-600">
                        📍 {v.street_address}, {v.suburb} {v.postcode}
                      </div>
                      {v.website && (
                        <div className="text-blue-600 truncate">🌐 {v.website}</div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Sample Villages WITHOUT Addresses */}
            {withoutOperatorAndNoAddress.length > 0 && (
              <div className="p-4 bg-white rounded-lg border">
                <div className="text-sm font-semibold text-gray-700 mb-3">
                  Sample: No Address ({withoutOperatorAndNoAddress.length} total)
                </div>
                <div className="space-y-2 max-h-64 overflow-y-auto">
                  {withoutOperatorAndNoAddress.slice(0, 10).map(v => (
                    <div key={v.id} className="p-2 bg-red-50 rounded text-xs border border-red-200">
                      <div className="font-semibold text-gray-900">{v.name}</div>
                      <div className="text-gray-600">
                        {v.suburb} {v.postcode}
                      </div>
                      {v.website && (
                        <div className="text-blue-600 truncate">🌐 {v.website}</div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
