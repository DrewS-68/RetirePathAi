import { useState, useEffect } from 'react';
import { getSupabaseClient } from '../utils/supabase/client';
import { Button } from './ui/button';
import { AlertCircle, CheckCircle, Trash2 } from 'lucide-react';

export function DeleteAllVictorianVillages() {
  const [deleting, setDeleting] = useState(false);
  const [result, setResult] = useState<any>(null);
  const [vicCount, setVicCount] = useState<number | null>(null);
  const [checking, setChecking] = useState(false);
  const [sampleVillages, setSampleVillages] = useState<any[]>([]);
  const [userRole, setUserRole] = useState<string | null>(null);

  // Check user role on mount
  useEffect(() => {
    checkUserRole();
  }, []);

  const checkUserRole = async () => {
    try {
      const supabase = getSupabaseClient();
      const { data: { session } } = await supabase.auth.getSession();
      
      if (!session) {
        setUserRole('not logged in');
        return;
      }
      
      // Check role via backend
      const response = await fetch(
        `https://luwfbkxjbogfapgkznve.supabase.co/functions/v1/make-server-3bba8be8/user/profile`,
        {
          headers: {
            'Authorization': `Bearer ${session.access_token}`
          }
        }
      );
      
      if (response.ok) {
        const data = await response.json();
        console.log('User profile:', data.profile);
        
        // Fetch role separately
        const roleResponse = await fetch(
          `https://luwfbkxjbogfapgkznve.supabase.co/functions/v1/make-server-3bba8be8/admin/check-role`,
          {
            headers: {
              'Authorization': `Bearer ${session.access_token}`
            }
          }
        );
        
        if (roleResponse.ok) {
          const roleData = await roleResponse.json();
          setUserRole(roleData.role || 'member');
        } else {
          setUserRole('member');
        }
      }
    } catch (err) {
      console.error('Error checking user role:', err);
      setUserRole('unknown');
    }
  };

  const checkVicCount = async () => {
    setChecking(true);
    try {
      const supabase = getSupabaseClient();
      
      // Get count
      const { count, error } = await supabase
        .from('retirement_villages')
        .select('*', { count: 'exact', head: true })
        .eq('state', 'VIC');
      
      if (error) throw error;
      
      setVicCount(count || 0);
      console.log(`Found ${count} Victorian villages`);
      
      // Also get sample villages to see actual data
      const { data: samples, error: samplesError } = await supabase
        .from('retirement_villages')
        .select('id, name, operator, state, suburb')
        .eq('state', 'VIC')
        .limit(10);
      
      if (samplesError) {
        console.error('Error fetching samples:', samplesError);
      } else {
        setSampleVillages(samples || []);
        console.log('Sample VIC villages:', samples);
      }
      
    } catch (err: any) {
      console.error(err);
      alert(`Error: ${err.message}`);
    } finally {
      setChecking(false);
    }
  };

  const deleteAllVic = async () => {
    const confirmed = confirm(
      `⚠️ NUCLEAR OPTION: DELETE ALL VICTORIAN VILLAGES\n\n` +
      `This will PERMANENTLY delete ${vicCount || 'all'} Victorian villages from the database.\n\n` +
      `✅ Use this to clean up duplicates from double import\n` +
      `✅ After deletion, reimport VIC using the VICDataImporter\n\n` +
      `This action CANNOT be undone!\n\n` +
      `Type 'DELETE' in the next prompt to confirm.`
    );
    
    if (!confirmed) return;
    
    const confirmation = prompt(`Type DELETE to confirm deletion of all Victorian villages:`);
    
    if (confirmation !== 'DELETE') {
      alert('Deletion cancelled - confirmation text did not match');
      return;
    }
    
    setDeleting(true);
    setResult(null);
    
    try {
      console.log('Deleting all Victorian villages via backend...');
      
      const supabase = getSupabaseClient();
      const { data: { session } } = await supabase.auth.getSession();
      
      if (!session) {
        throw new Error('Not authenticated');
      }
      
      // Call backend endpoint with admin auth
      const response = await fetch(
        `https://luwfbkxjbogfapgkznve.supabase.co/functions/v1/make-server-3bba8be8/admin/delete-vic-villages`,
        {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${session.access_token}`,
            'Content-Type': 'application/json'
          }
        }
      );
      
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Delete failed');
      }
      
      const data = await response.json();
      
      console.log(`✅ Backend deleted ${data.deletedCount} Victorian villages (was ${data.beforeCount})`);
      
      setResult({
        success: true,
        deleted: data.deletedCount
      });
      
      // Refresh count
      await checkVicCount();
      
      // Trigger refresh
      window.dispatchEvent(new Event('villageDataUpdated'));
      
    } catch (err: any) {
      console.error(err);
      setResult({ success: false, error: err.message });
    } finally {
      setDeleting(false);
    }
  };

  return (
    <div className="max-w-6xl mx-auto p-6 bg-white rounded-lg shadow-lg border-2 border-red-300">
      <h2 className="text-2xl font-bold mb-4 flex items-center gap-2">
        <Trash2 className="size-6 text-red-600" />
        Delete All Victorian Villages (Nuclear Option)
      </h2>
      
      <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded">
        <p className="text-sm text-red-900 mb-2">
          <strong>⚠️ WARNING:</strong> This will permanently delete ALL Victorian villages from the database.
        </p>
        <p className="text-sm text-red-700 mb-2">
          Use this to clean up after a double import, then reimport VIC using the VICDataImporter.
        </p>
        <p className="text-sm text-red-700">
          <strong>This action cannot be undone!</strong>
        </p>
      </div>
      
      {/* 🔍 REAL-TIME DIAGNOSTIC */}
      <div className="mb-4 p-4 bg-blue-50 border-2 border-blue-400 rounded-lg">
        <h3 className="font-bold text-blue-900 mb-2">🔍 Current VIC Village Count</h3>
        <p className="text-sm text-blue-800 mb-3">
          This shows the ACTUAL count in the database RIGHT NOW
        </p>
        <Button 
          onClick={checkVicCount} 
          disabled={checking}
          variant="outline"
          className="mr-3"
        >
          {checking ? 'Checking...' : '🔄 Refresh Count'}
        </Button>
        {vicCount !== null && (
          <span className="text-2xl font-bold">
            {vicCount === 0 ? (
              <span className="text-green-600">✅ 0 VIC villages (database is clean!)</span>
            ) : (
              <span className="text-red-600">⚠️ {vicCount} VIC villages still in database</span>
            )}
          </span>
        )}
      </div>
      
      {/* 🔑 ADMIN PROMOTION (if delete fails with 403 Forbidden) */}
      <div className="mb-4 p-4 bg-yellow-50 border-2 border-yellow-400 rounded-lg">
        <h3 className="font-bold text-yellow-900 mb-2">🔑 Admin Access Required</h3>
        <p className="text-sm text-yellow-800 mb-3">
          If the delete fails with "Forbidden", click below to promote yourself to admin:
        </p>
        <Button 
          onClick={async () => {
            try {
              const supabase = getSupabaseClient();
              const { data: { session } } = await supabase.auth.getSession();
              
              if (!session) {
                alert('Not logged in');
                return;
              }
              
              const response = await fetch(
                'https://luwfbkxjbogfapgkznve.supabase.co/functions/v1/make-server-3bba8be8/admin/promote-self',
                {
                  method: 'POST',
                  headers: {
                    'Authorization': `Bearer ${session.access_token}`
                  }
                }
              );
              
              const result = await response.json();
              console.log('Promotion result:', result);
              
              if (result.success) {
                alert(`✅ You are now an admin! (${result.email})`);
                setUserRole('admin');
              } else {
                alert(`Error: ${result.error}`);
              }
            } catch (err: any) {
              console.error(err);
              alert(`Error: ${err.message}`);
            }
          }}
          variant="outline"
          className="mr-3 border-yellow-600"
        >
          🔑 Promote Me to Admin
        </Button>
        {userRole && (
          <span className="text-sm">
            Current role: <strong>{userRole}</strong>
          </span>
        )}
      </div>
      
      <div className="space-y-4">
        {/* Step 1: Check count */}
        <div className="p-4 bg-gray-50 border rounded">
          <div className="flex items-center justify-between">
            <div>
              <p className="font-semibold mb-1">Step 1: Check Victorian village count</p>
              <p className="text-sm text-gray-600">See how many VIC villages are in the database</p>
            </div>
            <Button 
              onClick={checkVicCount} 
              disabled={checking}
              variant="outline"
            >
              {checking ? 'Checking...' : 'Check Count'}
            </Button>
          </div>
          
          {vicCount !== null && (
            <div className="mt-3 p-3 bg-white border rounded">
              <p className="text-lg">
                <strong>{vicCount}</strong> Victorian villages found
              </p>
            </div>
          )}
        </div>
        
        {/* Step 2: Delete */}
        {vicCount !== null && vicCount > 0 && (
          <div className="p-4 bg-red-50 border border-red-200 rounded">
            <div className="flex items-center justify-between">
              <div>
                <p className="font-semibold mb-1 text-red-900">Step 2: Delete all VIC villages</p>
                <p className="text-sm text-red-700">This will delete {vicCount} villages permanently</p>
              </div>
              <Button 
                onClick={deleteAllVic} 
                disabled={deleting}
                variant="destructive"
              >
                {deleting ? 'Deleting...' : `Delete ${vicCount} VIC Villages`}
              </Button>
            </div>
          </div>
        )}
        
        {/* Step 3: Reimport */}
        {result && result.success && (
          <div className="p-4 bg-green-50 border border-green-200 rounded">
            <div className="flex items-center gap-2 mb-2">
              <CheckCircle className="size-5 text-green-600" />
              <strong className="text-green-900">
                ✅ Deleted {result.deleted} Victorian villages!
              </strong>
            </div>
            
            <p className="text-sm text-green-700 mt-3 mb-2">
              <strong>Next step:</strong> Reimport Victorian data
            </p>
            <ol className="text-sm text-green-700 space-y-1 ml-4 list-decimal">
              <li>Go to Admin section</li>
              <li>Find "Import Victorian Villages (VICDataImporter)"</li>
              <li>Click "Import Victorian Villages"</li>
              <li>This will import clean data with the new parser!</li>
            </ol>
          </div>
        )}
        
        {result && !result.success && (
          <div className="p-4 bg-red-50 border border-red-200 rounded text-red-700">
            <div className="flex items-center gap-2">
              <AlertCircle className="size-5" />
              <strong>Error:</strong>
            </div>
            <p className="mt-1">{result.error}</p>
          </div>
        )}
      </div>
    </div>
  );
}