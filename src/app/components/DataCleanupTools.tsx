import React, { useState, useEffect } from 'react';
import { Card } from './ui/card';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Textarea } from './ui/textarea';
import { Search, Save, RefreshCw, Plus, Merge, AlertCircle, CheckCircle, Loader2, BookOpen } from 'lucide-react';
import { projectId, publicAnonKey } from '../utils/supabase/info';
import { DataCleanupGuide } from './DataCleanupGuide';
import QuickVillageInspector from './admin/QuickVillageInspector';
import CSVImportTool from './admin/CSVImportTool';
import { ECHMapScraper } from './admin/ECHMapScraper';
import { COFCScraper } from './admin/COFCScraper';
import { OperatorVerificationTool } from './admin/OperatorVerificationTool';
import { FakeDetectionTool } from './admin/FakeDetectionTool';
import { AdventistScraper } from './admin/AdventistScraper';
import { DatabaseStats } from './admin/DatabaseStats';
import { ManualVillageClassifier } from './ManualVillageClassifier';
import { VillageEditor } from './admin/VillageEditor';
import { OperatorScraper } from './admin/OperatorScraper';
import { VicUrlChecker } from './VicUrlChecker';
import { BulkURLFixerCSV } from './admin/BulkURLFixerCSV';
import { BatchScrapingDashboard } from './admin/BatchScrapingDashboard';
import { CsvDuplicateFilter } from './CsvDuplicateFilter';

type TabType = 'stats' | 'operators' | 'add' | 'inspector' | 'import' | 'ech' | 'cofc' | 'verify' | 'fakes' | 'adventist' | 'classifier' | 'editor' | 'scraper' | 'vic-url';

interface Operator {
  operator: string;
  count: number;
}

interface NewVillage {
  name: string;
  operator: string;
  suburb: string;
  state: string;
  postcode: string;
  website: string;
  facility_type: string;
}

export function DataCleanupTools() {
  const [activeTab, setActiveTab] = useState<TabType>('stats');
  
  // Operator Standardization
  const [operators, setOperators] = useState<Operator[]>([]);
  const [selectedOperators, setSelectedOperators] = useState<string[]>([]);
  const [newOperatorName, setNewOperatorName] = useState('');
  const [searchFilter, setSearchFilter] = useState('');
  const [loadingOperators, setLoadingOperators] = useState(false);
  
  // Quick Add Village
  const [newVillage, setNewVillage] = useState<NewVillage>({
    name: '',
    operator: '',
    suburb: '',
    state: 'SA',
    postcode: '',
    website: '',
    facility_type: 'retirement_village'
  });
  
  const [loading, setLoading] = useState(false);
  const [scraping, setScraping] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [showGuide, setShowGuide] = useState(false);
  
  // Debug search
  const [debugSearch, setDebugSearch] = useState('');
  const [debugResults, setDebugResults] = useState<any[]>([]);
  const [debugLoading, setDebugLoading] = useState(false);

  useEffect(() => {
    if (activeTab === 'operators') {
      loadOperators();
    }
  }, [activeTab]);

  const loadOperators = async () => {
    try {
      setLoadingOperators(true);
      setError(null);

      const response = await fetch(
        `https://${projectId}.supabase.co/functions/v1/make-server-3bba8be8/cleanup/operators`,
        {
          headers: {
            'Authorization': `Bearer ${publicAnonKey}`,
          },
        }
      );

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to load operators');
      }

      const data = await response.json();
      setOperators(data.operators || []);
    } catch (err) {
      console.error('Error loading operators:', err);
      setError(err instanceof Error ? err.message : 'Failed to load operators');
    } finally {
      setLoadingOperators(false);
    }
  };

  const mergeOperators = async () => {
    if (selectedOperators.length < 2) {
      setError('Please select at least 2 operators to merge');
      return;
    }

    if (!newOperatorName.trim()) {
      setError('Please enter a new operator name');
      return;
    }

    try {
      setLoading(true);
      setError(null);
      setSuccess(null);

      const response = await fetch(
        `https://${projectId}.supabase.co/functions/v1/make-server-3bba8be8/cleanup/merge-operators`,
        {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${publicAnonKey}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            oldOperators: selectedOperators,
            newOperator: newOperatorName.trim(),
          }),
        }
      );

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to merge operators');
      }

      const data = await response.json();
      setSuccess(`Successfully updated ${data.updatedCount} villages`);
      setSelectedOperators([]);
      setNewOperatorName('');
      loadOperators(); // Reload the list
    } catch (err) {
      console.error('Error merging operators:', err);
      setError(err instanceof Error ? err.message : 'Failed to merge operators');
    } finally {
      setLoading(false);
    }
  };

  const renameOperator = async (oldName: string, newName: string) => {
    if (!newName.trim()) {
      setError('Please enter a new operator name');
      return;
    }

    try {
      setLoading(true);
      setError(null);
      setSuccess(null);

      const response = await fetch(
        `https://${projectId}.supabase.co/functions/v1/make-server-3bba8be8/cleanup/merge-operators`,
        {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${publicAnonKey}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            oldOperators: [oldName],
            newOperator: newName.trim(),
          }),
        }
      );

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to rename operator');
      }

      const data = await response.json();
      setSuccess(`Successfully updated ${data.updatedCount} villages`);
      loadOperators(); // Reload the list
    } catch (err) {
      console.error('Error renaming operator:', err);
      setError(err instanceof Error ? err.message : 'Failed to rename operator');
    } finally {
      setLoading(false);
    }
  };

  const addVillage = async () => {
    if (!newVillage.name.trim() || !newVillage.suburb.trim()) {
      setError('Village name and suburb are required');
      return;
    }

    try {
      setLoading(true);
      setError(null);
      setSuccess(null);

      const response = await fetch(
        `https://${projectId}.supabase.co/functions/v1/make-server-3bba8be8/cleanup/add-village`,
        {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${publicAnonKey}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(newVillage),
        }
      );

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.details || errorData.error || 'Failed to add village');
      }

      const data = await response.json();
      setSuccess(`Successfully added village: ${data.village.name}. Check the Village Directory to see it!`);
      
      // Reset form
      setNewVillage({
        name: '',
        operator: '',
        suburb: '',
        state: 'SA',
        postcode: '',
        website: '',
        facility_type: 'retirement_village'
      });
      
      // Trigger a custom event to notify other components that data has changed
      window.dispatchEvent(new CustomEvent('villageDataUpdated'));
    } catch (err) {
      console.error('Error adding village:', err);
      setError(err instanceof Error ? err.message : 'Failed to add village');
    } finally {
      setLoading(false);
    }
  };

  const scrapeFromUrl = async () => {
    if (!newVillage.website.trim()) {
      setError('Please enter a website URL first');
      return;
    }

    try {
      setScraping(true);
      setError(null);
      setSuccess(null);

      const response = await fetch(
        `https://${projectId}.supabase.co/functions/v1/make-server-3bba8be8/scraper/scrape-url-only`,
        {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${publicAnonKey}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ url: newVillage.website }),
        }
      );

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to scrape website');
      }

      const result = await response.json();

      if (result.success && result.data) {
        // Auto-fill the form with scraped data
        setNewVillage({
          ...newVillage,
          facility_type: result.data.facility_type || newVillage.facility_type,
        });

        setSuccess('Successfully scraped website data! Review and add the village.');
      } else {
        throw new Error('Failed to extract data from website');
      }
    } catch (err) {
      console.error('Error scraping website:', err);
      setError(err instanceof Error ? err.message : 'Failed to scrape website');
    } finally {
      setScraping(false);
    }
  };

  const fixMissingStatus = async () => {
    try {
      setLoading(true);
      setError(null);
      setSuccess(null);

      const response = await fetch(
        `https://${projectId}.supabase.co/functions/v1/make-server-3bba8be8/cleanup/fix-status`,
        {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${publicAnonKey}`,
            'Content-Type': 'application/json',
          },
        }
      );

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to fix status');
      }

      const data = await response.json();
      setSuccess(`Fixed ${data.updatedCount} villages! They should now appear in the directory.`);
      
      // Trigger directory refresh
      window.dispatchEvent(new CustomEvent('villageDataUpdated'));
    } catch (err) {
      console.error('Error fixing status:', err);
      setError(err instanceof Error ? err.message : 'Failed to fix status');
    } finally {
      setLoading(false);
    }
  };

  const searchVillage = async () => {
    if (!debugSearch.trim()) {
      setError('Please enter a search term');
      return;
    }

    try {
      setDebugLoading(true);
      setError(null);
      setDebugResults([]);

      const response = await fetch(
        `https://${projectId}.supabase.co/functions/v1/make-server-3bba8be8/cleanup/search-village?name=${encodeURIComponent(debugSearch)}`,
        {
          headers: {
            'Authorization': `Bearer ${publicAnonKey}`,
          },
        }
      );

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to search');
      }

      const data = await response.json();
      setDebugResults(data.villages || []);
      
      if (data.count === 0) {
        setError(`No villages found matching "${debugSearch}"`);
      }
    } catch (err) {
      console.error('Error searching villages:', err);
      setError(err instanceof Error ? err.message : 'Failed to search villages');
    } finally {
      setDebugLoading(false);
    }
  };

  const updateFacilityType = async (villageId: string, villageName: string, currentType: string) => {
    const newType = prompt(
      `Update facility type for "${villageName}"?\n\nCurrent: ${currentType}\n\nEnter new type:`,
      'retirement_village'
    );

    if (!newType || newType === currentType) {
      return;
    }

    try {
      setLoading(true);
      setError(null);
      setSuccess(null);

      const response = await fetch(
        `https://${projectId}.supabase.co/functions/v1/make-server-3bba8be8/cleanup/update-facility-type`,
        {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${publicAnonKey}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            villageId,
            facilityType: newType,
          }),
        }
      );

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to update facility type');
      }

      const data = await response.json();
      setSuccess(`Updated "${villageName}" to facility type: ${newType}`);
      
      // Refresh search results
      searchVillage();
      
      // Trigger directory refresh
      window.dispatchEvent(new CustomEvent('villageDataUpdated'));
    } catch (err) {
      console.error('Error updating facility type:', err);
      setError(err instanceof Error ? err.message : 'Failed to update facility type');
    } finally {
      setLoading(false);
    }
  };

  const editVillage = async (village: any) => {
    // Create a form dialog for editing
    const newName = prompt(`Village Name:`, village.name);
    if (newName === null) return; // User cancelled

    const newOperator = prompt(`Operator:`, village.operator || '');
    if (newOperator === null) return;

    const newFacilityType = prompt(
      `Facility Type (retirement_village, aged_care, both, unclassified):`,
      village.facility_type || 'retirement_village'
    );
    if (newFacilityType === null) return;

    try {
      setLoading(true);
      setError(null);
      setSuccess(null);

      const updates: any = {};
      if (newName !== village.name) updates.name = newName;
      if (newOperator !== village.operator) updates.operator = newOperator;
      if (newFacilityType !== village.facility_type) updates.facility_type = newFacilityType;

      if (Object.keys(updates).length === 0) {
        setError('No changes made');
        setLoading(false);
        return;
      }

      const response = await fetch(
        `https://${projectId}.supabase.co/functions/v1/make-server-3bba8be8/cleanup/update-village`,
        {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${publicAnonKey}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            villageId: village.id,
            updates,
          }),
        }
      );

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to update village');
      }

      const data = await response.json();
      setSuccess(`Updated village successfully!`);
      
      // Refresh search results
      searchVillage();
      
      // Trigger directory refresh
      window.dispatchEvent(new CustomEvent('villageDataUpdated'));
    } catch (err) {
      console.error('Error updating village:', err);
      setError(err instanceof Error ? err.message : 'Failed to update village');
    } finally {
      setLoading(false);
    }
  };

  const toggleOperatorSelection = (operator: string) => {
    if (selectedOperators.includes(operator)) {
      setSelectedOperators(selectedOperators.filter(o => o !== operator));
    } else {
      setSelectedOperators([...selectedOperators, operator]);
    }
  };

  const filteredOperators = operators.filter(op => 
    searchFilter ? op.operator?.toLowerCase().includes(searchFilter.toLowerCase()) : true
  );

  return (
    <div className="max-w-7xl mx-auto p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">Data Cleanup Tools</h1>
        <div className="flex gap-2">
          <Button onClick={fixMissingStatus} disabled={loading} variant="outline" size="sm">
            <CheckCircle className="size-4 mr-2" />
            Fix Missing Status
          </Button>
          <Button onClick={() => setShowGuide(true)} variant="outline">
            <BookOpen className="size-4 mr-2" />
            View Guide
          </Button>
        </div>
      </div>

      {/* Show Guide Modal */}
      {showGuide && <DataCleanupGuide onClose={() => setShowGuide(false)} />}

      {/* Debug Search - Find Villages in Database */}
      <Card className="p-4 mb-6 bg-yellow-50 border-yellow-200">
        <div className="flex items-start gap-4">
          <div className="flex-1">
            <Label htmlFor="debug-search" className="font-semibold">🔍 Debug Search (Check if village exists in database)</Label>
            <div className="flex gap-2 mt-2">
              <Input
                id="debug-search"
                type="text"
                placeholder="Type village name or suburb (e.g., Colonel Light Gardens)"
                value={debugSearch}
                onChange={(e) => setDebugSearch(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && searchVillage()}
                className="flex-1"
              />
              <Button onClick={searchVillage} disabled={debugLoading}>
                {debugLoading ? <Loader2 className="size-4 animate-spin" /> : <Search className="size-4" />}
              </Button>
            </div>
            
            {/* Debug Results */}
            {debugResults.length > 0 && (
              <div className="mt-4 space-y-2">
                <div className="font-semibold text-green-700">Found {debugResults.length} village(s):</div>
                {debugResults.map((village) => (
                  <div key={village.id} className="p-3 bg-white border rounded-lg text-sm">
                    <div className="font-medium">{village.name}</div>
                    <div className="text-gray-600">
                      {village.suburb}, {village.state} {village.postcode}
                    </div>
                    <div className="mt-2 grid grid-cols-2 gap-2 text-xs">
                      <div><span className="font-medium">Operator:</span> {village.operator || '(none)'}</div>
                      <div><span className="font-medium">Status:</span> <span className={village.status === 'approved' ? 'text-green-600' : 'text-red-600'}>{village.status || '(null)'}</span></div>
                      <div><span className="font-medium">Facility Type:</span> {village.facility_type}</div>
                      <div><span className="font-medium">ID:</span> {village.id}</div>
                    </div>
                    <div className="mt-2">
                      <Button
                        onClick={() => updateFacilityType(village.id, village.name, village.facility_type)}
                        size="sm"
                        variant="outline"
                        className="mr-2"
                      >
                        Update Facility Type
                      </Button>
                      <Button
                        onClick={() => editVillage(village)}
                        size="sm"
                        variant="outline"
                      >
                        Edit Village
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </Card>

      {/* Tab Navigation */}
      <div className="flex flex-wrap gap-4 mb-6 border-b">
        <button
          onClick={() => setActiveTab('stats')}
          className={`px-4 py-2 font-medium ${
            activeTab === 'stats'
              ? 'border-b-2 border-blue-600 text-blue-600'
              : 'text-gray-600 hover:text-gray-900'
          }`}
        >
          Database Stats
        </button>
        <button
          onClick={() => setActiveTab('operators')}
          className={`px-4 py-2 font-medium ${
            activeTab === 'operators'
              ? 'border-b-2 border-blue-600 text-blue-600'
              : 'text-gray-600 hover:text-gray-900'
          }`}
        >
          Operator Standardization
        </button>
        <button
          onClick={() => setActiveTab('add')}
          className={`px-4 py-2 font-medium ${
            activeTab === 'add'
              ? 'border-b-2 border-blue-600 text-blue-600'
              : 'text-gray-600 hover:text-gray-900'
          }`}
        >
          Quick Add Village
        </button>
        <button
          onClick={() => setActiveTab('inspector')}
          className={`px-4 py-2 font-medium ${
            activeTab === 'inspector'
              ? 'border-b-2 border-blue-600 text-blue-600'
              : 'text-gray-600 hover:text-gray-900'
          }`}
        >
          Quick Village Inspector
        </button>
        <button
          onClick={() => setActiveTab('import')}
          className={`px-4 py-2 font-medium ${
            activeTab === 'import'
              ? 'border-b-2 border-blue-600 text-blue-600'
              : 'text-gray-600 hover:text-gray-900'
          }`}
        >
          CSV Import Tool
        </button>
        <button
          onClick={() => setActiveTab('ech')}
          className={`px-4 py-2 font-medium ${
            activeTab === 'ech'
              ? 'border-b-2 border-blue-600 text-blue-600'
              : 'text-gray-600 hover:text-gray-900'
          }`}
        >
          ECH Map Scraper
        </button>
        <button
          onClick={() => setActiveTab('cofc')}
          className={`px-4 py-2 font-medium ${
            activeTab === 'cofc'
              ? 'border-b-2 border-blue-600 text-blue-600'
              : 'text-gray-600 hover:text-gray-900'
          }`}
        >
          COFC Scraper
        </button>
        <button
          onClick={() => setActiveTab('verify')}
          className={`px-4 py-2 font-medium ${
            activeTab === 'verify'
              ? 'border-b-2 border-blue-600 text-blue-600'
              : 'text-gray-600 hover:text-gray-900'
          }`}
        >
          Operator Verification
        </button>
        <button
          onClick={() => setActiveTab('fakes')}
          className={`px-4 py-2 font-medium ${
            activeTab === 'fakes'
              ? 'border-b-2 border-blue-600 text-blue-600'
              : 'text-gray-600 hover:text-gray-900'
          }`}
        >
          Fake Detection
        </button>
        <button
          onClick={() => setActiveTab('adventist')}
          className={`px-4 py-2 font-medium ${
            activeTab === 'adventist'
              ? 'border-b-2 border-blue-600 text-blue-600'
              : 'text-gray-600 hover:text-gray-900'
          }`}
        >
          Adventist Scraper
        </button>
        <button
          onClick={() => setActiveTab('classifier')}
          className={`px-4 py-2 font-medium ${
            activeTab === 'classifier'
              ? 'border-b-2 border-blue-600 text-blue-600'
              : 'text-gray-600 hover:text-gray-900'
          }`}
        >
          Manual Village Classifier
        </button>
        <button
          onClick={() => setActiveTab('editor')}
          className={`px-4 py-2 font-medium ${
            activeTab === 'editor'
              ? 'border-b-2 border-blue-600 text-blue-600'
              : 'text-gray-600 hover:text-gray-900'
          }`}
        >
          Village Editor
        </button>
        <button
          onClick={() => setActiveTab('scraper')}
          className={`px-4 py-2 font-medium ${
            activeTab === 'scraper'
              ? 'border-b-2 border-blue-600 text-blue-600'
              : 'text-gray-600 hover:text-gray-900'
          }`}
        >
          Operator Scraper
        </button>
        <button
          onClick={() => setActiveTab('vic-url')}
          className={`px-4 py-2 font-medium ${
            activeTab === 'vic-url'
              ? 'border-b-2 border-blue-600 text-blue-600'
              : 'text-gray-600 hover:text-gray-900'
          }`}
        >
          VIC URL Checker
        </button>
        <button
          onClick={() => setActiveTab('bulk-url')}
          className={`px-4 py-2 font-medium ${
            activeTab === 'bulk-url'
              ? 'border-b-2 border-blue-600 text-blue-600'
              : 'text-gray-600 hover:text-gray-900'
          }`}
        >
          Bulk URL Fixer CSV
        </button>
        <button
          onClick={() => setActiveTab('batch-scraping')}
          className={`px-4 py-2 font-medium ${
            activeTab === 'batch-scraping'
              ? 'border-b-2 border-blue-600 text-blue-600'
              : 'text-gray-600 hover:text-gray-900'
          }`}
        >
          Batch Scraping Dashboard
        </button>
        <button
          onClick={() => setActiveTab('csv-duplicate')}
          className={`px-4 py-2 font-medium ${
            activeTab === 'csv-duplicate'
              ? 'border-b-2 border-blue-600 text-blue-600'
              : 'text-gray-600 hover:text-gray-900'
          }`}
        >
          CSV Duplicate Filter
        </button>
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

      {/* Database Stats Tab */}
      {activeTab === 'stats' && (
        <DatabaseStats />
      )}

      {/* Operator Standardization Tab */}
      {activeTab === 'operators' && (
        <div className="space-y-6">
          <Card className="p-6">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-semibold">Operator List ({operators.length} unique)</h2>
              <Button onClick={loadOperators} disabled={loadingOperators} variant="outline" size="sm">
                <RefreshCw className={`size-4 mr-2 ${loadingOperators ? 'animate-spin' : ''}`} />
                Refresh
              </Button>
            </div>

            {/* Search Filter */}
            <div className="mb-4">
              <Input
                type="text"
                placeholder="Filter operators..."
                value={searchFilter}
                onChange={(e) => setSearchFilter(e.target.value)}
                className="max-w-md"
              />
            </div>

            {/* Merge Controls */}
            {selectedOperators.length > 0 && (
              <div className="mb-4 p-4 bg-blue-50 border border-blue-200 rounded-lg">
                <div className="font-medium mb-2">
                  Merge {selectedOperators.length} selected operators:
                </div>
                <div className="text-sm text-gray-600 mb-2">
                  {selectedOperators.join(', ')}
                </div>
                <div className="flex gap-2 items-end">
                  <div className="flex-1">
                    <Label htmlFor="new-operator-name">New Operator Name</Label>
                    <Input
                      id="new-operator-name"
                      type="text"
                      placeholder="Enter standardized name..."
                      value={newOperatorName}
                      onChange={(e) => setNewOperatorName(e.target.value)}
                    />
                  </div>
                  <Button onClick={mergeOperators} disabled={loading}>
                    <Merge className="size-4 mr-2" />
                    Merge Selected
                  </Button>
                  <Button 
                    onClick={() => {
                      setSelectedOperators([]);
                      setNewOperatorName('');
                    }} 
                    variant="outline"
                  >
                    Cancel
                  </Button>
                </div>
              </div>
            )}

            {/* Operators List */}
            <div className="space-y-2 max-h-[600px] overflow-y-auto">
              {loadingOperators ? (
                <div className="text-center py-8 text-gray-500">
                  <Loader2 className="size-6 animate-spin mx-auto mb-2" />
                  Loading operators...
                </div>
              ) : filteredOperators.length === 0 ? (
                <div className="text-center py-8 text-gray-500">
                  No operators found
                </div>
              ) : (
                filteredOperators.map((op) => (
                  <div
                    key={op.operator}
                    className={`p-3 border rounded-lg flex items-center justify-between cursor-pointer transition-colors ${
                      selectedOperators.includes(op.operator)
                        ? 'bg-blue-50 border-blue-300'
                        : 'hover:bg-gray-50'
                    }`}
                    onClick={() => toggleOperatorSelection(op.operator)}
                  >
                    <div className="flex items-center gap-3">
                      <input
                        type="checkbox"
                        checked={selectedOperators.includes(op.operator)}
                        onChange={() => {}}
                        className="size-4"
                      />
                      <div>
                        <div className="font-medium">{op.operator || '(null)'}</div>
                        <div className="text-sm text-gray-500">{op.count} villages</div>
                      </div>
                    </div>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={(e) => {
                        e.stopPropagation();
                        const newName = prompt('Enter new operator name:', op.operator);
                        if (newName && newName !== op.operator) {
                          renameOperator(op.operator, newName);
                        }
                      }}
                    >
                      Rename
                    </Button>
                  </div>
                ))
              )}
            </div>
          </Card>
        </div>
      )}

      {/* Quick Add Village Tab */}
      {activeTab === 'add' && (
        <Card className="p-6">
          <h2 className="text-xl font-semibold mb-4">Add New Village</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="village-name">Village Name *</Label>
              <Input
                id="village-name"
                type="text"
                value={newVillage.name}
                onChange={(e) => setNewVillage({ ...newVillage, name: e.target.value })}
                placeholder="e.g., ECH Crescent Lodge"
              />
            </div>

            <div>
              <Label htmlFor="operator">Operator</Label>
              <Input
                id="operator"
                type="text"
                value={newVillage.operator}
                onChange={(e) => setNewVillage({ ...newVillage, operator: e.target.value })}
                placeholder="e.g., ECH"
              />
            </div>

            <div>
              <Label htmlFor="suburb">Suburb *</Label>
              <Input
                id="suburb"
                type="text"
                value={newVillage.suburb}
                onChange={(e) => setNewVillage({ ...newVillage, suburb: e.target.value })}
                placeholder="e.g., Colonel Light Gardens"
              />
            </div>

            <div>
              <Label htmlFor="state">State *</Label>
              <select
                id="state"
                value={newVillage.state}
                onChange={(e) => setNewVillage({ ...newVillage, state: e.target.value })}
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
              <Label htmlFor="postcode">Postcode</Label>
              <Input
                id="postcode"
                type="text"
                value={newVillage.postcode}
                onChange={(e) => setNewVillage({ ...newVillage, postcode: e.target.value })}
                placeholder="e.g., 5041"
              />
            </div>

            <div>
              <Label htmlFor="facility-type">Facility Type</Label>
              <select
                id="facility-type"
                value={newVillage.facility_type}
                onChange={(e) => setNewVillage({ ...newVillage, facility_type: e.target.value })}
                className="w-full px-3 py-2 border rounded-md"
              >
                <option value="retirement_village">Retirement Village</option>
                <option value="aged_care">Aged Care</option>
                <option value="both">Both</option>
                <option value="unclassified">Unclassified</option>
              </select>
            </div>

            <div className="md:col-span-2">
              <Label htmlFor="website">Website</Label>
              <div className="flex gap-2">
                <Input
                  id="website"
                  type="url"
                  value={newVillage.website}
                  onChange={(e) => setNewVillage({ ...newVillage, website: e.target.value })}
                  placeholder="https://example.com"
                  className="flex-1"
                />
                <Button 
                  onClick={scrapeFromUrl} 
                  disabled={scraping || !newVillage.website} 
                  variant="outline"
                  type="button"
                >
                  {scraping ? (
                    <Loader2 className="size-4 animate-spin" />
                  ) : (
                    <Search className="size-4" />
                  )}
                  <span className="ml-2 hidden sm:inline">Scrape</span>
                </Button>
              </div>
              <p className="text-xs text-gray-500 mt-1">
                💡 Paste URL and click Scrape to auto-fill phone, operator, and facility type
              </p>
            </div>
          </div>

          <div className="mt-6">
            <Button onClick={addVillage} disabled={loading} className="w-full md:w-auto">
              {loading ? (
                <>
                  <Loader2 className="size-4 mr-2 animate-spin" />
                  Adding...
                </>
              ) : (
                <>
                  <Plus className="size-4 mr-2" />
                  Add Village
                </>
              )}
            </Button>
          </div>
        </Card>
      )}

      {/* Quick Village Inspector Tab */}
      {activeTab === 'inspector' && (
        <QuickVillageInspector />
      )}

      {/* CSV Import Tool Tab */}
      {activeTab === 'import' && (
        <CSVImportTool />
      )}

      {/* ECH Map Scraper Tab */}
      {activeTab === 'ech' && (
        <ECHMapScraper />
      )}

      {/* COFC Scraper Tab */}
      {activeTab === 'cofc' && (
        <COFCScraper />
      )}

      {/* Operator Verification Tab */}
      {activeTab === 'verify' && (
        <OperatorVerificationTool />
      )}

      {/* Fake Detection Tab */}
      {activeTab === 'fakes' && (
        <FakeDetectionTool />
      )}

      {/* Adventist Scraper Tab */}
      {activeTab === 'adventist' && (
        <AdventistScraper />
      )}

      {/* Manual Village Classifier Tab */}
      {activeTab === 'classifier' && (
        <ManualVillageClassifier />
      )}

      {/* Village Editor Tab */}
      {activeTab === 'editor' && (
        <VillageEditor />
      )}

      {/* Operator Scraper Tab */}
      {activeTab === 'scraper' && (
        <OperatorScraper />
      )}

      {/* VIC URL Checker Tab */}
      {activeTab === 'vic-url' && (
        <VicUrlChecker />
      )}

      {/* Bulk URL Fixer CSV Tab */}
      {activeTab === 'bulk-url' && (
        <BulkURLFixerCSV />
      )}

      {/* Batch Scraping Dashboard Tab */}
      {activeTab === 'batch-scraping' && (
        <BatchScrapingDashboard />
      )}

      {/* CSV Duplicate Filter Tab */}
      {activeTab === 'csv-duplicate' && (
        <CsvDuplicateFilter />
      )}
    </div>
  );
}