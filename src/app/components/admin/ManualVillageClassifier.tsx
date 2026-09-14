import React, { useState, useEffect } from 'react';
import { Card } from '../ui/card';
import { Button } from '../ui/button';
import { Badge } from '../ui/badge';
import { 
  AlertCircle, 
  Loader2, 
  CheckCircle, 
  ExternalLink, 
  Trash2, 
  Home,
  Building2,
  ChevronRight,
  ChevronLeft,
  SkipForward
} from 'lucide-react';
import { projectId, publicAnonKey } from '../../utils/supabase/info';

interface Village {
  id: string;
  name: string;
  operator: string | null;
  suburb: string;
  state: string;
  postcode: string;
  website: string | null;
  contact_phone: string | null;
  contact_email: string | null;
}

export function ManualVillageClassifier() {
  const [loading, setLoading] = useState(false);
  const [processing, setProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [villages, setVillages] = useState<Village[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [totalCount, setTotalCount] = useState(0);

  const currentVillage = villages[currentIndex];

  useEffect(() => {
    loadUnclassifiedVillages();
  }, []);

  const loadUnclassifiedVillages = async () => {
    try {
      setLoading(true);
      setError(null);

      console.log('[Classifier] Loading unclassified villages...');

      const response = await fetch(
        `https://${projectId}.supabase.co/functions/v1/make-server-3bba8be8/cleanup/get-unclassified`,
        {
          headers: {
            'Authorization': `Bearer ${publicAnonKey}`,
          },
        }
      );

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to load villages');
      }

      const data = await response.json();
      console.log('[Classifier] Loaded villages:', data);

      setVillages(data.villages || []);
      setTotalCount(data.count || 0);
      setCurrentIndex(0);

    } catch (err) {
      console.error('[Classifier] Error loading villages:', err);
      setError(err instanceof Error ? err.message : 'Failed to load villages');
    } finally {
      setLoading(false);
    }
  };

  const classifyVillage = async (facilityType: string) => {
    if (!currentVillage) return;

    try {
      setProcessing(true);
      setError(null);
      setSuccess(null);

      console.log(`[Classifier] Classifying ${currentVillage.name} as ${facilityType}...`);

      const response = await fetch(
        `https://${projectId}.supabase.co/functions/v1/make-server-3bba8be8/cleanup/classify-village`,
        {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${publicAnonKey}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            villageId: currentVillage.id,
            facilityType,
          }),
        }
      );

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to classify village');
      }

      setSuccess(`✅ Classified as ${facilityType}!`);
      
      // Remove from list and move to next
      const newVillages = villages.filter(v => v.id !== currentVillage.id);
      setVillages(newVillages);
      setTotalCount(prev => prev - 1);
      
      // Stay at same index (which now shows the next village)
      if (currentIndex >= newVillages.length && currentIndex > 0) {
        setCurrentIndex(currentIndex - 1);
      }

      // Clear success message after 1 second
      setTimeout(() => setSuccess(null), 1000);

    } catch (err) {
      console.error('[Classifier] Error classifying village:', err);
      setError(err instanceof Error ? err.message : 'Failed to classify village');
    } finally {
      setProcessing(false);
    }
  };

  const deleteVillage = async () => {
    if (!currentVillage) return;

    if (!confirm(`❌ DELETE "${currentVillage.name}"?\n\nThis will permanently remove this village from the database.\n\nThis action cannot be undone!`)) {
      return;
    }

    try {
      setProcessing(true);
      setError(null);
      setSuccess(null);

      console.log(`[Classifier] Deleting ${currentVillage.name}...`);

      const response = await fetch(
        `https://${projectId}.supabase.co/functions/v1/make-server-3bba8be8/cleanup/bulk-delete-fakes`,
        {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${publicAnonKey}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ villageIds: [currentVillage.id] }),
        }
      );

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to delete village');
      }

      setSuccess('🗑️ Deleted successfully!');
      
      // Remove from list and move to next
      const newVillages = villages.filter(v => v.id !== currentVillage.id);
      setVillages(newVillages);
      setTotalCount(prev => prev - 1);
      
      // Stay at same index (which now shows the next village)
      if (currentIndex >= newVillages.length && currentIndex > 0) {
        setCurrentIndex(currentIndex - 1);
      }

      // Clear success message after 1 second
      setTimeout(() => setSuccess(null), 1000);

    } catch (err) {
      console.error('[Classifier] Error deleting village:', err);
      setError(err instanceof Error ? err.message : 'Failed to delete village');
    } finally {
      setProcessing(false);
    }
  };

  const skipVillage = () => {
    if (currentIndex < villages.length - 1) {
      setCurrentIndex(currentIndex + 1);
    }
    setError(null);
    setSuccess(null);
  };

  const previousVillage = () => {
    if (currentIndex > 0) {
      setCurrentIndex(currentIndex - 1);
    }
    setError(null);
    setSuccess(null);
  };

  if (loading) {
    return (
      <Card className="p-12 text-center">
        <Loader2 className="size-12 animate-spin mx-auto mb-4 text-blue-600" />
        <div className="text-gray-600">Loading unclassified villages...</div>
      </Card>
    );
  }

  if (totalCount === 0) {
    return (
      <Card className="p-12 text-center">
        <div className="text-green-400 mb-4">
          <CheckCircle className="size-16 mx-auto" />
        </div>
        <h3 className="text-2xl font-bold mb-2">🎉 All Done!</h3>
        <p className="text-gray-600 mb-4">
          No unclassified villages remaining. Great work!
        </p>
        <Button onClick={loadUnclassifiedVillages}>
          Refresh List
        </Button>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Priority Operators Reminder */}
      <Card className="p-6 bg-gradient-to-r from-purple-50 to-blue-50 border-2 border-purple-200">
        <h3 className="text-lg font-bold text-purple-900 mb-3 flex items-center gap-2">
          🎯 Priority: Don't Forget These Large Operators!
        </h3>
        <div className="grid md:grid-cols-2 gap-3 text-sm">
          <div className="p-3 bg-white rounded border border-purple-200">
            <div className="font-semibold text-purple-900">Adventist Senior Living</div>
            <a 
              href="https://adventistseniorliving.org.au" 
              target="_blank" 
              rel="noopener noreferrer"
              className="text-blue-600 hover:underline text-xs flex items-center gap-1"
            >
              adventistseniorliving.org.au <ExternalLink className="size-3" />
            </a>
            <div className="text-xs text-gray-600 mt-1">Multiple villages to add</div>
          </div>
          <div className="p-3 bg-white rounded border border-purple-200">
            <div className="font-semibold text-purple-900">Add more as you discover them...</div>
            <div className="text-xs text-gray-600 mt-1">Use CSV Import or Quick Add tools</div>
          </div>
        </div>
      </Card>

      {/* Progress Header */}
      <Card className="p-6">
        <div className="flex justify-between items-center mb-4">
          <div>
            <h2 className="text-2xl font-bold mb-2">Manual Village Classification</h2>
            <p className="text-gray-600">
              Review unclassified villages and approve legitimate ones or delete fakes.
            </p>
          </div>
          <div className="text-right">
            <div className="text-3xl font-bold text-blue-600">
              {currentIndex + 1} / {totalCount}
            </div>
            <div className="text-sm text-gray-600">
              {Math.round(((currentIndex + 1) / totalCount) * 100)}% complete
            </div>
          </div>
        </div>

        {/* Progress Bar */}
        <div className="h-3 bg-gray-200 rounded-full overflow-hidden">
          <div 
            className="h-full bg-gradient-to-r from-blue-500 to-purple-500 transition-all duration-300"
            style={{ width: `${((currentIndex + 1) / totalCount) * 100}%` }}
          />
        </div>
      </Card>

      {/* Status Messages */}
      {error && (
        <div className="p-4 bg-red-50 border border-red-200 rounded-lg flex items-start gap-2">
          <AlertCircle className="size-5 text-red-600 flex-shrink-0 mt-0.5" />
          <div className="text-red-800">{error}</div>
        </div>
      )}

      {success && (
        <div className="p-4 bg-green-50 border border-green-200 rounded-lg flex items-start gap-2">
          <CheckCircle className="size-5 text-green-600 flex-shrink-0 mt-0.5" />
          <div className="text-green-800">{success}</div>
        </div>
      )}

      {/* Current Village Card */}
      {currentVillage && (
        <Card className="p-8">
          <div className="mb-6">
            <h3 className="text-3xl font-bold mb-2">{currentVillage.name}</h3>
            <div className="text-lg text-gray-600">
              {currentVillage.suburb}, {currentVillage.state} {currentVillage.postcode}
            </div>
          </div>

          {/* Village Details Grid */}
          <div className="grid md:grid-cols-2 gap-4 mb-6 p-4 bg-gray-50 rounded-lg">
            <div>
              <div className="text-sm font-semibold text-gray-700 mb-1">Operator</div>
              <div className="text-lg">
                {currentVillage.operator ? (
                  <span className="font-medium">{currentVillage.operator}</span>
                ) : (
                  <span className="text-red-500">⚠️ No operator</span>
                )}
              </div>
            </div>

            <div>
              <div className="text-sm font-semibold text-gray-700 mb-1">Website</div>
              <div>
                {currentVillage.website ? (
                  <a
                    href={currentVillage.website}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-blue-600 hover:underline flex items-center gap-1"
                  >
                    <ExternalLink className="size-4" />
                    Open Website
                  </a>
                ) : (
                  <span className="text-red-500">⚠️ No website</span>
                )}
              </div>
            </div>

            <div>
              <div className="text-sm font-semibold text-gray-700 mb-1">Phone</div>
              <div>
                {currentVillage.contact_phone || (
                  <span className="text-gray-400">Not available</span>
                )}
              </div>
            </div>

            <div>
              <div className="text-sm font-semibold text-gray-700 mb-1">Email</div>
              <div>
                {currentVillage.contact_email || (
                  <span className="text-gray-400">Not available</span>
                )}
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="space-y-4">
            <div>
              <h4 className="text-sm font-semibold text-gray-700 mb-3">✅ Classify as:</h4>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                <Button
                  onClick={() => classifyVillage('retirement_village')}
                  disabled={processing}
                  className="h-20 text-lg bg-green-600 hover:bg-green-700"
                >
                  <Home className="size-6 mr-2" />
                  Retirement Village
                </Button>

                <Button
                  onClick={() => classifyVillage('aged_care')}
                  disabled={processing}
                  className="h-20 text-lg bg-blue-600 hover:bg-blue-700"
                >
                  <Building2 className="size-6 mr-2" />
                  Aged Care
                </Button>

                <Button
                  onClick={() => classifyVillage('both')}
                  disabled={processing}
                  className="h-20 text-lg bg-purple-600 hover:bg-purple-700"
                >
                  <div className="flex items-center gap-2">
                    <Home className="size-5" />
                    <span>+</span>
                    <Building2 className="size-5" />
                  </div>
                  <span className="ml-2">Both</span>
                </Button>
              </div>
            </div>

            <div className="flex gap-3 pt-4 border-t">
              <Button
                onClick={deleteVillage}
                disabled={processing}
                variant="destructive"
                className="flex-1 h-14"
              >
                <Trash2 className="size-5 mr-2" />
                Delete (Fake)
              </Button>

              <Button
                onClick={skipVillage}
                disabled={processing}
                variant="outline"
                className="flex-1 h-14"
              >
                <SkipForward className="size-5 mr-2" />
                Skip (Review Later)
              </Button>
            </div>
          </div>

          {/* Navigation */}
          <div className="flex justify-between items-center mt-6 pt-6 border-t">
            <Button
              onClick={previousVillage}
              disabled={currentIndex === 0 || processing}
              variant="outline"
            >
              <ChevronLeft className="size-5 mr-2" />
              Previous
            </Button>

            <div className="text-sm text-gray-600">
              Village {currentIndex + 1} of {totalCount}
            </div>

            <Button
              onClick={skipVillage}
              disabled={currentIndex >= villages.length - 1 || processing}
              variant="outline"
            >
              Next
              <ChevronRight className="size-5 ml-2" />
            </Button>
          </div>
        </Card>
      )}

      {/* Keyboard Shortcuts Help */}
      <Card className="p-4 bg-blue-50 border-blue-200">
        <h4 className="font-semibold text-blue-900 mb-2">⌨️ Quick Tips:</h4>
        <ul className="text-sm text-blue-800 space-y-1">
          <li>• <strong>Open website</strong> to verify if it's a real village</li>
          <li>• <strong>Check operator name</strong> - if it's a known operator, probably real</li>
          <li>• <strong>No website/phone/email</strong> = likely fake (delete it)</li>
          <li>• <strong>Skip</strong> if you're unsure - you can come back to it later</li>
        </ul>
      </Card>
    </div>
  );
}
