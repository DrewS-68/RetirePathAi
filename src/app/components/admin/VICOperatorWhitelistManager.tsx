import React, { useState, useEffect } from 'react';
import { Card } from '../ui/card';
import { Button } from '../ui/button';
import { Loader2, Trash2, Plus, Search, CheckCircle, AlertCircle } from 'lucide-react';
import { projectId, publicAnonKey } from '../../utils/supabase/info';

export function VICOperatorWhitelistManager() {
  const [loading, setLoading] = useState(false);
  const [operators, setOperators] = useState<string[]>([]);
  const [filteredOperators, setFilteredOperators] = useState<string[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [newOperator, setNewOperator] = useState('');
  const [addingOperator, setAddingOperator] = useState(false);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  useEffect(() => {
    loadWhitelist();
  }, []);

  useEffect(() => {
    if (searchQuery.trim() === '') {
      setFilteredOperators(operators);
    } else {
      const query = searchQuery.toLowerCase();
      setFilteredOperators(
        operators.filter(op => op.toLowerCase().includes(query))
      );
    }
  }, [searchQuery, operators]);

  const loadWhitelist = async () => {
    setLoading(true);
    setError(null);

    try {
      const response = await fetch(
        `https://${projectId}.supabase.co/functions/v1/make-server-3bba8be8/vic-operator-whitelist`,
        {
          method: 'GET',
          headers: {
            'Authorization': `Bearer ${publicAnonKey}`
          }
        }
      );

      if (!response.ok) {
        throw new Error('Failed to load whitelist');
      }

      const data = await response.json();
      const sortedOperators = (data.operators || []).sort();
      setOperators(sortedOperators);
      setFilteredOperators(sortedOperators);
      
      console.log(`✅ Loaded ${sortedOperators.length} operators from whitelist`);
    } catch (err) {
      console.error('Error loading whitelist:', err);
      setError(err instanceof Error ? err.message : 'Failed to load whitelist');
    } finally {
      setLoading(false);
    }
  };

  const addOperator = async () => {
    const trimmed = newOperator.trim();
    if (!trimmed) return;

    // Check for duplicates (case-insensitive)
    if (operators.some(op => op.toLowerCase() === trimmed.toLowerCase())) {
      setError(`"${trimmed}" already exists in the whitelist`);
      return;
    }

    setAddingOperator(true);
    setError(null);
    setSuccessMessage(null);

    try {
      const updatedOperators = [...operators, trimmed].sort();

      const response = await fetch(
        `https://${projectId}.supabase.co/functions/v1/make-server-3bba8be8/vic-operator-whitelist`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${publicAnonKey}`
          },
          body: JSON.stringify({ operators: updatedOperators })
        }
      );

      if (!response.ok) {
        throw new Error('Failed to add operator');
      }

      setOperators(updatedOperators);
      setFilteredOperators(updatedOperators);
      setNewOperator('');
      setSuccessMessage(`✅ Added "${trimmed}" to whitelist`);
      
      setTimeout(() => setSuccessMessage(null), 3000);
      
      console.log(`✅ Added operator: ${trimmed}`);
    } catch (err) {
      console.error('Error adding operator:', err);
      setError(err instanceof Error ? err.message : 'Failed to add operator');
    } finally {
      setAddingOperator(false);
    }
  };

  const deleteOperator = async (operatorToDelete: string) => {
    if (!confirm(`Are you sure you want to remove "${operatorToDelete}" from the whitelist?`)) {
      return;
    }

    setError(null);
    setSuccessMessage(null);

    try {
      const updatedOperators = operators.filter(op => op !== operatorToDelete);

      const response = await fetch(
        `https://${projectId}.supabase.co/functions/v1/make-server-3bba8be8/vic-operator-whitelist`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${publicAnonKey}`
          },
          body: JSON.stringify({ operators: updatedOperators })
        }
      );

      if (!response.ok) {
        throw new Error('Failed to delete operator');
      }

      setOperators(updatedOperators);
      setFilteredOperators(updatedOperators.filter(op => 
        op.toLowerCase().includes(searchQuery.toLowerCase())
      ));
      setSuccessMessage(`🗑️ Removed "${operatorToDelete}" from whitelist`);
      
      setTimeout(() => setSuccessMessage(null), 3000);
      
      console.log(`🗑️ Deleted operator: ${operatorToDelete}`);
    } catch (err) {
      console.error('Error deleting operator:', err);
      setError(err instanceof Error ? err.message : 'Failed to delete operator');
    }
  };

  const clearWhitelist = async () => {
    if (!confirm('⚠️ Are you sure you want to DELETE ALL operators from the whitelist? This cannot be undone!')) {
      return;
    }

    setError(null);
    setSuccessMessage(null);

    try {
      const response = await fetch(
        `https://${projectId}.supabase.co/functions/v1/make-server-3bba8be8/vic-operator-whitelist`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${publicAnonKey}`
          },
          body: JSON.stringify({ operators: [] })
        }
      );

      if (!response.ok) {
        throw new Error('Failed to clear whitelist');
      }

      setOperators([]);
      setFilteredOperators([]);
      setSuccessMessage('🗑️ Whitelist cleared');
      
      setTimeout(() => setSuccessMessage(null), 3000);
      
      console.log('🗑️ Whitelist cleared');
    } catch (err) {
      console.error('Error clearing whitelist:', err);
      setError(err instanceof Error ? err.message : 'Failed to clear whitelist');
    }
  };

  if (loading) {
    return (
      <Card className="p-6 bg-gradient-to-r from-indigo-50 to-purple-50 border-2 border-indigo-400">
        <div className="flex items-center justify-center py-12">
          <Loader2 className="size-8 animate-spin text-indigo-600" />
          <span className="ml-3 text-lg text-indigo-700">Loading whitelist...</span>
        </div>
      </Card>
    );
  }

  return (
    <Card className="p-6 bg-gradient-to-r from-indigo-50 to-purple-50 border-2 border-indigo-400">
      <div className="flex items-start justify-between mb-6">
        <div>
          <h2 className="text-2xl font-bold text-indigo-900">
            📋 VIC Operators Whitelist Manager
          </h2>
          <p className="text-sm text-indigo-700">
            {operators.length} operators in whitelist
          </p>
        </div>
        <div className="flex gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={loadWhitelist}
          >
            <Loader2 className="size-4 mr-2" />
            Refresh
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={clearWhitelist}
            className="text-red-600 hover:text-red-700 hover:bg-red-50"
          >
            <Trash2 className="size-4 mr-2" />
            Clear All
          </Button>
        </div>
      </div>

      {/* Success Message */}
      {successMessage && (
        <div className="mb-4 bg-green-50 border border-green-200 rounded-lg p-4 flex items-start gap-3">
          <CheckCircle className="size-5 text-green-600 flex-shrink-0 mt-0.5" />
          <div className="text-sm text-green-800">{successMessage}</div>
        </div>
      )}

      {/* Error Message */}
      {error && (
        <div className="mb-4 bg-red-50 border border-red-200 rounded-lg p-4 flex items-start gap-3">
          <AlertCircle className="size-5 text-red-600 flex-shrink-0 mt-0.5" />
          <div className="text-sm text-red-800">{error}</div>
        </div>
      )}

      {/* Add Operator */}
      <div className="mb-6 bg-white border border-indigo-200 rounded-lg p-4">
        <h3 className="font-semibold text-indigo-900 mb-3">➕ Add New Operator</h3>
        <div className="flex gap-2">
          <input
            type="text"
            value={newOperator}
            onChange={(e) => setNewOperator(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && addOperator()}
            placeholder="Enter operator name..."
            className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
            disabled={addingOperator}
          />
          <Button
            onClick={addOperator}
            disabled={addingOperator || !newOperator.trim()}
            className="bg-indigo-600 hover:bg-indigo-700"
          >
            {addingOperator ? (
              <Loader2 className="size-4 animate-spin" />
            ) : (
              <>
                <Plus className="size-4 mr-2" />
                Add
              </>
            )}
          </Button>
        </div>
      </div>

      {/* Search */}
      <div className="mb-4">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-5 text-gray-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search operators..."
            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
          />
        </div>
      </div>

      {/* Operators List */}
      {operators.length === 0 ? (
        <div className="text-center py-12 bg-white border border-indigo-200 rounded-lg">
          <div className="text-gray-500 mb-2">No operators in whitelist</div>
          <div className="text-sm text-gray-400">Upload a CSV using the Whitelist Importer</div>
        </div>
      ) : (
        <div className="bg-white border border-indigo-200 rounded-lg p-4 max-h-[500px] overflow-y-auto">
          <div className="space-y-2">
            {filteredOperators.map((operator, idx) => (
              <div
                key={idx}
                className="flex items-center justify-between p-3 bg-indigo-50 rounded border border-indigo-200 hover:bg-indigo-100 transition-colors"
              >
                <div className="flex items-center gap-3">
                  <span className="text-sm font-medium text-gray-500 w-8">{idx + 1}</span>
                  <span className="text-gray-900">{operator}</span>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => deleteOperator(operator)}
                  className="text-red-600 hover:text-red-700 hover:bg-red-50"
                >
                  <Trash2 className="size-4" />
                </Button>
              </div>
            ))}
          </div>
        </div>
      )}

      {searchQuery && filteredOperators.length === 0 && (
        <div className="text-center py-8 text-gray-500">
          No operators found matching "{searchQuery}"
        </div>
      )}
    </Card>
  );
}
