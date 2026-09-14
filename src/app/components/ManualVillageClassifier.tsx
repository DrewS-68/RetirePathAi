import React, { useState, useEffect } from 'react';
import { Card } from './ui/card';
import { Button } from './ui/button';
import { Building2, Heart, Users, AlertCircle, ChevronLeft, ChevronRight, Check, ExternalLink, X, List } from 'lucide-react';
import { projectId, publicAnonKey } from '../utils/supabase/info';

interface Village {
  id: number;
  name: string;
  suburb: string;
  state: string;
  operator: string | null;
  description: string | null;
  amenities: string[] | null;
  care_services: string[] | null;
  activities: string[] | null;
  website: string | null;  // Fixed: column name is 'website' not 'website_url'
  facility_type: string | null;
}

interface OperatorVillage {
  id: number;
  name: string;
  suburb: string;
  state: string;
  facility_type: string | null;
  website: string | null;
}

interface ClassifierStats {
  total: number;
  classified: number;
  remaining: number;
}

export function ManualVillageClassifier() {
  const [villages, setVillages] = useState<Village[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [loading, setLoading] = useState(true);
  const [classifying, setClassifying] = useState(false);
  const [stats, setStats] = useState<ClassifierStats>({ total: 0, classified: 0, remaining: 0 });
  const [error, setError] = useState<string | null>(null);
  const [operatorVillages, setOperatorVillages] = useState<OperatorVillage[]>([]);
  const [operatorCount, setOperatorCount] = useState<number | null>(null);
  const [showOperatorModal, setShowOperatorModal] = useState(false);
  const [loadingOperatorVillages, setLoadingOperatorVillages] = useState(false);

  useEffect(() => {
    fetchUnclassifiedVillages();
  }, []);

  const fetchUnclassifiedVillages = async () => {
    try {
      setLoading(true);
      setError(null);

      const response = await fetch(
        `https://${projectId}.supabase.co/functions/v1/make-server-3bba8be8/manual-classifier/unclassified`,
        {
          headers: {
            'Authorization': `Bearer ${publicAnonKey}`,
          },
        }
      );

      if (!response.ok) {
        throw new Error(`Failed to fetch villages: ${response.statusText}`);
      }

      const data = await response.json();
      setVillages(data.villages || []);
      setStats({
        total: data.total || 0,
        classified: 0,
        remaining: data.total || 0,
      });
      
      // Log if we're showing a subset
      if (data.total > data.showing) {
        console.log(`Loaded first ${data.showing} of ${data.total} unclassified villages`);
      }
    } catch (err) {
      console.error('Error fetching unclassified villages:', err);
      setError(err instanceof Error ? err.message : 'Failed to load villages');
    } finally {
      setLoading(false);
    }
  };

  const classifyVillage = async (villageId: number, facilityType: 'retirement_village' | 'aged_care' | 'both' | 'not_a_village') => {
    try {
      setClassifying(true);
      setError(null);

      console.log(`[Classifier] Classifying village ${villageId} as ${facilityType}`);

      const response = await fetch(
        `https://${projectId}.supabase.co/functions/v1/make-server-3bba8be8/manual-classifier/classify`,
        {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${publicAnonKey}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ villageId, facilityType }),
        }
      );

      if (!response.ok) {
        const errorData = await response.json();
        console.error('[Classifier] Classification failed:', errorData);
        throw new Error(errorData.error || `Classification failed: ${response.statusText}`);
      }

      const data = await response.json();
      console.log('[Classifier] Classification successful:', data);

      // Remove the classified village from the local array
      const updatedVillages = villages.filter(v => v.id !== villageId);
      setVillages(updatedVillages);

      // Update stats
      setStats(prev => ({
        ...prev,
        classified: prev.classified + 1,
        remaining: updatedVillages.length, // Use actual remaining count
      }));

      // Stay at the same index (which now shows the next village since we removed one)
      // If we're at the end, go back one
      if (currentIndex >= updatedVillages.length && updatedVillages.length > 0) {
        setCurrentIndex(updatedVillages.length - 1);
      }

      // If no more villages, show completion message
      if (updatedVillages.length === 0) {
        alert(`🎉 All villages classified! Great work!`);
      }

    } catch (err) {
      console.error('[Classifier] Error classifying village:', err);
      setError(err instanceof Error ? err.message : 'Failed to classify village');
    } finally {
      setClassifying(false);
    }
  };

  const skipVillage = () => {
    if (currentIndex < villages.length - 1) {
      setCurrentIndex(currentIndex + 1);
    }
  };

  const fetchVillagesByOperator = async (operator: string) => {
    try {
      setLoadingOperatorVillages(true);
      const encodedOperator = encodeURIComponent(operator);
      
      const response = await fetch(
        `https://${projectId}.supabase.co/functions/v1/make-server-3bba8be8/manual-classifier/villages-by-operator/${encodedOperator}`,
        {
          headers: {
            'Authorization': `Bearer ${publicAnonKey}`,
          },
        }
      );

      if (!response.ok) {
        throw new Error(`Failed to fetch operator villages: ${response.statusText}`);
      }

      const data = await response.json();
      setOperatorVillages(data.villages || []);
      setOperatorCount(data.count || 0);
      setShowOperatorModal(true);
    } catch (err) {
      console.error('Error fetching operator villages:', err);
      alert('Failed to load operator villages');
    } finally {
      setLoadingOperatorVillages(false);
    }
  };

  // Fetch operator count when village changes
  useEffect(() => {
    const currentVillage = villages[currentIndex];
    const fetchOperatorCount = async () => {
      if (currentVillage?.operator) {
        try {
          const encodedOperator = encodeURIComponent(currentVillage.operator);
          const response = await fetch(
            `https://${projectId}.supabase.co/functions/v1/make-server-3bba8be8/manual-classifier/villages-by-operator/${encodedOperator}`,
            {
              headers: {
                'Authorization': `Bearer ${publicAnonKey}`,
              },
            }
          );

          if (response.ok) {
            const data = await response.json();
            setOperatorCount(data.count || 0);
          }
        } catch (err) {
          console.error('Error fetching operator count:', err);
        }
      } else {
        setOperatorCount(null);
      }
    };

    fetchOperatorCount();
  }, [currentIndex, villages]);

  if (loading) {
    return (
      <Card className="p-8">
        <div className="flex items-center justify-center">
          <div className="animate-spin h-8 w-8 border-4 border-blue-600 border-t-transparent rounded-full"></div>
          <span className="ml-3 text-lg">Loading unclassified villages...</span>
        </div>
      </Card>
    );
  }

  if (error) {
    return (
      <Card className="p-8 border-red-200 bg-red-50">
        <div className="flex items-center gap-3 text-red-600">
          <AlertCircle className="size-6" />
          <div>
            <p className="font-semibold">Error Loading Villages</p>
            <p className="text-sm mt-1">{error}</p>
          </div>
        </div>
        <Button onClick={fetchUnclassifiedVillages} className="mt-4">
          Try Again
        </Button>
      </Card>
    );
  }

  if (villages.length === 0) {
    return (
      <Card className="p-8 border-green-200 bg-green-50">
        <div className="flex items-center gap-3 text-green-600">
          <Check className="size-6" />
          <div>
            <p className="font-semibold">All Villages Classified! 🎉</p>
            <p className="text-sm mt-1">There are no more unclassified villages to review.</p>
          </div>
        </div>
      </Card>
    );
  }

  const currentVillage = villages[currentIndex];

  return (
    <div className="space-y-6">
      {/* Progress Bar */}
      <Card className="p-6">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="text-xl font-semibold">Manual Village Classification</h3>
            <p className="text-sm text-gray-600 mt-1">
              Review each village and classify it as a retirement village or aged care facility
            </p>
          </div>
          <div className="text-right">
            <p className="text-3xl font-bold text-blue-600">{stats.classified}</p>
            <p className="text-sm text-gray-600">of {stats.total} classified</p>
          </div>
        </div>

        {/* Progress Bar */}
        <div className="w-full bg-gray-200 rounded-full h-3">
          <div
            className="bg-blue-600 h-3 rounded-full transition-all duration-300"
            style={{ width: `${(stats.classified / stats.total) * 100}%` }}
          ></div>
        </div>
        <p className="text-sm text-gray-600 mt-2 text-center">
          {stats.remaining} remaining
        </p>
      </Card>

      {/* Village Card */}
      <Card className="p-8">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-4">
            <div className="bg-blue-100 p-3 rounded-lg">
              <Building2 className="size-6 text-blue-600" />
            </div>
            <div>
              <h2 className="text-2xl font-bold">{currentVillage.name}</h2>
              <p className="text-gray-600">
                {currentVillage.suburb}, {currentVillage.state}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setCurrentIndex(Math.max(0, currentIndex - 1))}
              disabled={currentIndex === 0}
            >
              <ChevronLeft className="size-4" />
            </Button>
            <span className="text-sm text-gray-600 px-3">
              {currentIndex + 1} / {villages.length}
            </span>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setCurrentIndex(Math.min(villages.length - 1, currentIndex + 1))}
              disabled={currentIndex === villages.length - 1}
            >
              <ChevronRight className="size-4" />
            </Button>
          </div>
        </div>

        {/* Village Data */}
        <div className="grid md:grid-cols-2 gap-6 mb-8">
          {/* Operator */}
          {currentVillage.operator && (
            <div>
              <p className="text-sm font-semibold text-gray-700 mb-1">Operator</p>
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-900">{currentVillage.operator}</p>
                  {operatorCount !== null && (
                    <p className="text-sm text-gray-500 mt-1">
                      {operatorCount} other village(s) in database
                    </p>
                  )}
                </div>
                {operatorCount !== null && operatorCount > 0 && (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => fetchVillagesByOperator(currentVillage.operator!)}
                    disabled={loadingOperatorVillages}
                    className="ml-3"
                  >
                    <List className="size-4 mr-1" />
                    View
                  </Button>
                )}
              </div>
            </div>
          )}

          {/* Website */}
          {currentVillage.website && (
            <div>
              <p className="text-sm font-semibold text-gray-700 mb-1">Website</p>
              <a
                href={currentVillage.website}
                target="_blank"
                rel="noopener noreferrer"
                className="text-blue-600 hover:underline text-sm"
              >
                {currentVillage.website}
              </a>
            </div>
          )}

          {/* Description */}
          {currentVillage.description && (
            <div className="md:col-span-2">
              <p className="text-sm font-semibold text-gray-700 mb-1">Description</p>
              <p className="text-gray-900 text-sm leading-relaxed">{currentVillage.description}</p>
            </div>
          )}

          {/* Amenities */}
          {currentVillage.amenities && currentVillage.amenities.length > 0 && (
            <div className="md:col-span-2">
              <p className="text-sm font-semibold text-gray-700 mb-2">Amenities</p>
              <div className="flex flex-wrap gap-2">
                {currentVillage.amenities.map((amenity, idx) => (
                  <span
                    key={idx}
                    className="px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-sm"
                  >
                    {amenity}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Care Services */}
          {currentVillage.care_services && currentVillage.care_services.length > 0 && (
            <div className="md:col-span-2">
              <p className="text-sm font-semibold text-gray-700 mb-2">Care Services</p>
              <div className="flex flex-wrap gap-2">
                {currentVillage.care_services.map((service, idx) => (
                  <span
                    key={idx}
                    className="px-3 py-1 bg-purple-100 text-purple-700 rounded-full text-sm"
                  >
                    {service}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Activities */}
          {currentVillage.activities && currentVillage.activities.length > 0 && (
            <div className="md:col-span-2">
              <p className="text-sm font-semibold text-gray-700 mb-2">Activities</p>
              <div className="flex flex-wrap gap-2">
                {currentVillage.activities.map((activity, idx) => (
                  <span
                    key={idx}
                    className="px-3 py-1 bg-green-100 text-green-700 rounded-full text-sm"
                  >
                    {activity}
                  </span>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Classification Buttons */}
        <div className="border-t pt-6">
          <p className="text-center font-semibold text-gray-700 mb-4">
            What type of facility is this?
          </p>
          <div className="grid md:grid-cols-2 gap-4">
            <Button
              onClick={() => classifyVillage(currentVillage.id, 'retirement_village')}
              disabled={classifying}
              className="h-auto py-4 bg-green-600 hover:bg-green-700"
            >
              <div className="flex flex-col items-center gap-2">
                <Building2 className="size-6" />
                <span className="font-semibold">Retirement Village</span>
                <span className="text-xs opacity-90">Independent living, 55+, DMF/exit fees</span>
              </div>
            </Button>

            <Button
              onClick={() => classifyVillage(currentVillage.id, 'aged_care')}
              disabled={classifying}
              className="h-auto py-4 bg-orange-600 hover:bg-orange-700"
            >
              <div className="flex flex-col items-center gap-2">
                <Heart className="size-6" />
                <span className="font-semibold">Aged Care</span>
                <span className="text-xs opacity-90">Nursing home, RAD/DAP, care services</span>
              </div>
            </Button>

            <Button
              onClick={() => classifyVillage(currentVillage.id, 'both')}
              disabled={classifying}
              className="h-auto py-4 bg-purple-600 hover:bg-purple-700"
            >
              <div className="flex flex-col items-center gap-2">
                <Users className="size-6" />
                <span className="font-semibold">Both Types</span>
                <span className="text-xs opacity-90">Offers both retirement and aged care</span>
              </div>
            </Button>

            <Button
              onClick={() => classifyVillage(currentVillage.id, 'not_a_village')}
              disabled={classifying}
              className="h-auto py-4 bg-red-600 hover:bg-red-700"
            >
              <div className="flex flex-col items-center gap-2">
                <X className="size-6" />
                <span className="font-semibold">Not a Village</span>
                <span className="text-xs opacity-90">Invalid entry / false positive</span>
              </div>
            </Button>
          </div>

          <div className="flex justify-center gap-3 mt-4">
            {currentVillage.website && (
              <Button
                variant="outline"
                onClick={() => window.open(currentVillage.website!, '_blank')}
                disabled={classifying}
                className="text-blue-600 border-blue-300 hover:bg-blue-50"
              >
                <ExternalLink className="size-4 mr-2" />
                Open Website
              </Button>
            )}
            <Button
              variant="outline"
              onClick={skipVillage}
              disabled={classifying}
              className="text-gray-600"
            >
              Skip for Now
            </Button>
          </div>
        </div>
      </Card>

      {/* Operator Villages Modal */}
      {showOperatorModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <Card className="max-w-4xl w-full max-h-[80vh] overflow-hidden flex flex-col">
            <div className="p-6 border-b">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-xl font-bold">Villages by {currentVillage.operator}</h3>
                  <p className="text-sm text-gray-600 mt-1">
                    {operatorVillages.length} village(s) found in database
                  </p>
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setShowOperatorModal(false)}
                >
                  <X className="size-4" />
                </Button>
              </div>
            </div>
            
            <div className="flex-1 overflow-y-auto p-6">
              <div className="space-y-4">
                {operatorVillages.map((village) => (
                  <Card key={village.id} className="p-4 hover:bg-gray-50">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <h4 className="font-semibold text-lg">{village.name}</h4>
                        <p className="text-sm text-gray-600">
                          {village.suburb}, {village.state}
                        </p>
                        {village.facility_type && (
                          <span
                            className={`inline-block mt-2 px-3 py-1 rounded-full text-xs font-semibold ${
                              village.facility_type === 'retirement_village'
                                ? 'bg-green-100 text-green-700'
                                : village.facility_type === 'aged_care'
                                ? 'bg-orange-100 text-orange-700'
                                : village.facility_type === 'both'
                                ? 'bg-purple-100 text-purple-700'
                                : 'bg-gray-100 text-gray-700'
                            }`}
                          >
                            {village.facility_type === 'retirement_village'
                              ? 'Retirement Village'
                              : village.facility_type === 'aged_care'
                              ? 'Aged Care'
                              : village.facility_type === 'both'
                              ? 'Both'
                              : village.facility_type}
                          </span>
                        )}
                        {!village.facility_type && (
                          <span className="inline-block mt-2 px-3 py-1 rounded-full text-xs font-semibold bg-yellow-100 text-yellow-700">
                            Unclassified
                          </span>
                        )}
                      </div>
                      {village.website && (
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => window.open(village.website!, '_blank')}
                          className="ml-4"
                        >
                          <ExternalLink className="size-4" />
                        </Button>
                      )}
                    </div>
                  </Card>
                ))}
              </div>
            </div>

            <div className="p-4 border-t bg-gray-50">
              <Button
                onClick={() => setShowOperatorModal(false)}
                className="w-full"
              >
                Close
              </Button>
            </div>
          </Card>
        </div>
      )}
    </div>
  );
}