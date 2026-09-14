import { useState, useEffect } from 'react';
import { projectId, publicAnonKey } from '../../utils/supabase/info';
import { Phone, Mail, MapPin, Home, Calendar, DollarSign, Clock, Filter, X, CheckCircle, AlertCircle } from 'lucide-react';

interface AgentLead {
  id: string;
  user_id: string | null;
  name: string;
  email: string;
  phone: string | null;
  postcode: string;
  suburb: string | null;
  state: string | null;
  home_type: string | null;
  estimated_value: number | null;
  property_address: string | null;
  bedrooms: number | null;
  bathrooms: number | null;
  timeline: string | null;
  reason_for_selling: string;
  additional_notes: string | null;
  lead_source: string;
  status: 'new' | 'contacted' | 'qualified' | 'converted' | 'lost';
  contacted_at: string | null;
  agent_assigned: string | null;
  sale_price: number | null;
  commission_amount: number | null;
  commission_paid: boolean;
  sale_completed_at: string | null;
  created_at: string;
  updated_at: string;
}

interface LeadStats {
  total: number;
  new: number;
  contacted: number;
  qualified: number;
  converted: number;
  lost: number;
  totalCommission: number;
  paidCommission: number;
  unpaidCommission: number;
}

export function AgentLeadsManager({ accessToken }: { accessToken: string }) {
  const [leads, setLeads] = useState<AgentLead[]>([]);
  const [stats, setStats] = useState<LeadStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [filterStatus, setFilterStatus] = useState<string>('');
  const [selectedLead, setSelectedLead] = useState<AgentLead | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [editData, setEditData] = useState<Partial<AgentLead>>({});

  useEffect(() => {
    fetchLeads();
    fetchStats();
  }, [filterStatus]);

  const fetchLeads = async () => {
    setLoading(true);
    try {
      const url = new URL(`https://${projectId}.supabase.co/functions/v1/make-server-3bba8be8/agent-leads/admin/all`);
      if (filterStatus) {
        url.searchParams.append('status', filterStatus);
      }

      const response = await fetch(url.toString(), {
        headers: {
          'Authorization': `Bearer ${accessToken}`,
        },
      });

      if (!response.ok) throw new Error('Failed to fetch leads');

      const data = await response.json();
      setLeads(data.leads || []);
    } catch (error) {
      console.error('Error fetching leads:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchStats = async () => {
    try {
      const response = await fetch(
        `https://${projectId}.supabase.co/functions/v1/make-server-3bba8be8/agent-leads/admin/stats`,
        {
          headers: {
            'Authorization': `Bearer ${accessToken}`,
          },
        }
      );

      if (!response.ok) throw new Error('Failed to fetch stats');

      const data = await response.json();
      setStats(data.stats);
    } catch (error) {
      console.error('Error fetching stats:', error);
    }
  };

  const updateLead = async (id: string, updates: Partial<AgentLead>) => {
    try {
      const response = await fetch(
        `https://${projectId}.supabase.co/functions/v1/make-server-3bba8be8/agent-leads/admin/${id}`,
        {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${accessToken}`,
          },
          body: JSON.stringify(updates),
        }
      );

      if (!response.ok) throw new Error('Failed to update lead');

      await fetchLeads();
      await fetchStats();
      setIsEditing(false);
      setSelectedLead(null);
    } catch (error) {
      console.error('Error updating lead:', error);
      alert('Failed to update lead');
    }
  };

  const deleteLead = async (id: string) => {
    if (!confirm('Are you sure you want to delete this lead?')) return;

    try {
      const response = await fetch(
        `https://${projectId}.supabase.co/functions/v1/make-server-3bba8be8/agent-leads/admin/${id}`,
        {
          method: 'DELETE',
          headers: {
            'Authorization': `Bearer ${accessToken}`,
          },
        }
      );

      if (!response.ok) throw new Error('Failed to delete lead');

      await fetchLeads();
      await fetchStats();
      setSelectedLead(null);
    } catch (error) {
      console.error('Error deleting lead:', error);
      alert('Failed to delete lead');
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'new': return 'bg-blue-100 text-blue-700';
      case 'contacted': return 'bg-yellow-100 text-yellow-700';
      case 'qualified': return 'bg-purple-100 text-purple-700';
      case 'converted': return 'bg-green-100 text-green-700';
      case 'lost': return 'bg-red-100 text-red-700';
      default: return 'bg-gray-100 text-gray-700';
    }
  };

  const formatCurrency = (amount: number | null) => {
    if (!amount) return 'N/A';
    return new Intl.NumberFormat('en-AU', { style: 'currency', currency: 'AUD' }).format(amount);
  };

  const formatDate = (dateString: string | null) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleDateString('en-AU', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  return (
    <div className="space-y-6">
      {/* Stats Overview */}
      {stats && (
        <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-4">
          <div className="bg-white p-4 rounded-lg border border-gray-200">
            <div className="text-sm text-gray-600">Total Leads</div>
            <div className="text-2xl mt-1">{stats.total}</div>
          </div>
          <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
            <div className="text-sm text-blue-600">New</div>
            <div className="text-2xl mt-1">{stats.new}</div>
          </div>
          <div className="bg-yellow-50 p-4 rounded-lg border border-yellow-200">
            <div className="text-sm text-yellow-600">Contacted</div>
            <div className="text-2xl mt-1">{stats.contacted}</div>
          </div>
          <div className="bg-purple-50 p-4 rounded-lg border border-purple-200">
            <div className="text-sm text-purple-600">Qualified</div>
            <div className="text-2xl mt-1">{stats.qualified}</div>
          </div>
          <div className="bg-green-50 p-4 rounded-lg border border-green-200">
            <div className="text-sm text-green-600">Converted</div>
            <div className="text-2xl mt-1">{stats.converted}</div>
          </div>
        </div>
      )}

      {/* Revenue Stats */}
      {stats && stats.totalCommission > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-gradient-to-br from-green-500 to-green-600 text-white p-6 rounded-lg shadow">
            <div className="text-sm opacity-90">Total Commission</div>
            <div className="text-3xl mt-1">{formatCurrency(stats.totalCommission)}</div>
          </div>
          <div className="bg-gradient-to-br from-blue-500 to-blue-600 text-white p-6 rounded-lg shadow">
            <div className="text-sm opacity-90">Paid Commission</div>
            <div className="text-3xl mt-1">{formatCurrency(stats.paidCommission)}</div>
          </div>
          <div className="bg-gradient-to-br from-orange-500 to-orange-600 text-white p-6 rounded-lg shadow">
            <div className="text-sm opacity-90">Unpaid Commission</div>
            <div className="text-3xl mt-1">{formatCurrency(stats.unpaidCommission)}</div>
          </div>
        </div>
      )}

      {/* Filters */}
      <div className="bg-white p-4 rounded-lg border border-gray-200">
        <div className="flex items-center gap-4">
          <Filter className="w-5 h-5 text-gray-400" />
          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
          >
            <option value="">All Statuses</option>
            <option value="new">New</option>
            <option value="contacted">Contacted</option>
            <option value="qualified">Qualified</option>
            <option value="converted">Converted</option>
            <option value="lost">Lost</option>
          </select>
          {filterStatus && (
            <button
              onClick={() => setFilterStatus('')}
              className="px-4 py-2 text-sm text-gray-600 hover:text-gray-800"
            >
              Clear Filter
            </button>
          )}
        </div>
      </div>

      {/* Leads Table */}
      <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
        {loading ? (
          <div className="p-8 text-center text-gray-500">Loading leads...</div>
        ) : leads.length === 0 ? (
          <div className="p-8 text-center text-gray-500">No leads found</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="px-6 py-3 text-left text-xs text-gray-500 uppercase tracking-wider">Contact</th>
                  <th className="px-6 py-3 text-left text-xs text-gray-500 uppercase tracking-wider">Location</th>
                  <th className="px-6 py-3 text-left text-xs text-gray-500 uppercase tracking-wider">Property</th>
                  <th className="px-6 py-3 text-left text-xs text-gray-500 uppercase tracking-wider">Timeline</th>
                  <th className="px-6 py-3 text-left text-xs text-gray-500 uppercase tracking-wider">Status</th>
                  <th className="px-6 py-3 text-left text-xs text-gray-500 uppercase tracking-wider">Created</th>
                  <th className="px-6 py-3 text-left text-xs text-gray-500 uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {leads.map((lead) => (
                  <tr key={lead.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4">
                      <div className="text-sm">
                        <div>{lead.name}</div>
                        <div className="text-gray-500 flex items-center gap-1">
                          <Mail className="w-3 h-3" />
                          {lead.email}
                        </div>
                        {lead.phone && (
                          <div className="text-gray-500 flex items-center gap-1">
                            <Phone className="w-3 h-3" />
                            {lead.phone}
                          </div>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-sm">
                        <div>{lead.suburb || lead.postcode}</div>
                        <div className="text-gray-500">{lead.state}</div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-sm">
                        <div>{lead.home_type || 'N/A'}</div>
                        <div className="text-gray-500">{formatCurrency(lead.estimated_value)}</div>
                        {(lead.bedrooms || lead.bathrooms) && (
                          <div className="text-gray-500 text-xs">
                            {lead.bedrooms}bd / {lead.bathrooms}ba
                          </div>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4 text-sm">{lead.timeline || 'N/A'}</td>
                    <td className="px-6 py-4">
                      <span className={`px-2 py-1 rounded-full text-xs ${getStatusColor(lead.status)}`}>
                        {lead.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-500">{formatDate(lead.created_at)}</td>
                    <td className="px-6 py-4">
                      <button
                        onClick={() => setSelectedLead(lead)}
                        className="text-blue-600 hover:text-blue-700 text-sm"
                      >
                        View Details
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Lead Detail Modal */}
      {selectedLead && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg max-w-3xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b border-gray-200 flex justify-between items-center sticky top-0 bg-white">
              <h3 className="text-xl">Lead Details</h3>
              <button
                onClick={() => {
                  setSelectedLead(null);
                  setIsEditing(false);
                  setEditData({});
                }}
                className="p-2 hover:bg-gray-100 rounded-lg"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-6 space-y-6">
              {!isEditing ? (
                <>
                  {/* Contact Information */}
                  <div>
                    <h4 className="text-sm text-gray-500 mb-3">Contact Information</h4>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <div className="text-sm text-gray-500">Name</div>
                        <div>{selectedLead.name}</div>
                      </div>
                      <div>
                        <div className="text-sm text-gray-500">Email</div>
                        <div>{selectedLead.email}</div>
                      </div>
                      <div>
                        <div className="text-sm text-gray-500">Phone</div>
                        <div>{selectedLead.phone || 'N/A'}</div>
                      </div>
                      <div>
                        <div className="text-sm text-gray-500">Lead Source</div>
                        <div>{selectedLead.lead_source}</div>
                      </div>
                    </div>
                  </div>

                  {/* Property Information */}
                  <div>
                    <h4 className="text-sm text-gray-500 mb-3">Property Information</h4>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <div className="text-sm text-gray-500">Location</div>
                        <div>{selectedLead.suburb || selectedLead.postcode}, {selectedLead.state}</div>
                      </div>
                      <div>
                        <div className="text-sm text-gray-500">Property Type</div>
                        <div>{selectedLead.home_type || 'N/A'}</div>
                      </div>
                      <div>
                        <div className="text-sm text-gray-500">Estimated Value</div>
                        <div>{formatCurrency(selectedLead.estimated_value)}</div>
                      </div>
                      <div>
                        <div className="text-sm text-gray-500">Bedrooms / Bathrooms</div>
                        <div>{selectedLead.bedrooms || 'N/A'} / {selectedLead.bathrooms || 'N/A'}</div>
                      </div>
                      <div>
                        <div className="text-sm text-gray-500">Timeline</div>
                        <div>{selectedLead.timeline || 'N/A'}</div>
                      </div>
                    </div>
                  </div>

                  {/* Lead Management */}
                  <div>
                    <h4 className="text-sm text-gray-500 mb-3">Lead Management</h4>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <div className="text-sm text-gray-500">Status</div>
                        <span className={`inline-block px-3 py-1 rounded-full text-sm ${getStatusColor(selectedLead.status)}`}>
                          {selectedLead.status}
                        </span>
                      </div>
                      <div>
                        <div className="text-sm text-gray-500">Agent Assigned</div>
                        <div>{selectedLead.agent_assigned || 'Not assigned'}</div>
                      </div>
                      <div>
                        <div className="text-sm text-gray-500">Contacted At</div>
                        <div>{formatDate(selectedLead.contacted_at)}</div>
                      </div>
                      <div>
                        <div className="text-sm text-gray-500">Sale Price</div>
                        <div>{formatCurrency(selectedLead.sale_price)}</div>
                      </div>
                      <div>
                        <div className="text-sm text-gray-500">Commission Amount</div>
                        <div>{formatCurrency(selectedLead.commission_amount)}</div>
                      </div>
                      <div>
                        <div className="text-sm text-gray-500">Commission Paid</div>
                        <div>{selectedLead.commission_paid ? '✅ Yes' : '❌ No'}</div>
                      </div>
                    </div>
                  </div>

                  {/* Additional Notes */}
                  {selectedLead.additional_notes && (
                    <div>
                      <h4 className="text-sm text-gray-500 mb-2">Additional Notes</h4>
                      <div className="bg-gray-50 p-4 rounded-lg">{selectedLead.additional_notes}</div>
                    </div>
                  )}

                  {/* Actions */}
                  <div className="flex gap-3 pt-4 border-t border-gray-200">
                    <button
                      onClick={() => {
                        setIsEditing(true);
                        setEditData(selectedLead);
                      }}
                      className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                    >
                      Edit Lead
                    </button>
                    <button
                      onClick={() => deleteLead(selectedLead.id)}
                      className="px-4 py-2 border border-red-300 text-red-600 rounded-lg hover:bg-red-50"
                    >
                      Delete
                    </button>
                  </div>
                </>
              ) : (
                <form onSubmit={(e) => {
                  e.preventDefault();
                  updateLead(selectedLead.id, editData);
                }} className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm mb-1">Status</label>
                      <select
                        value={editData.status || selectedLead.status}
                        onChange={(e) => setEditData({ ...editData, status: e.target.value as any })}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg"
                      >
                        <option value="new">New</option>
                        <option value="contacted">Contacted</option>
                        <option value="qualified">Qualified</option>
                        <option value="converted">Converted</option>
                        <option value="lost">Lost</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-sm mb-1">Agent Assigned</label>
                      <input
                        type="text"
                        value={editData.agent_assigned || selectedLead.agent_assigned || ''}
                        onChange={(e) => setEditData({ ...editData, agent_assigned: e.target.value })}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg"
                        placeholder="Agent name"
                      />
                    </div>

                    <div>
                      <label className="block text-sm mb-1">Sale Price</label>
                      <input
                        type="number"
                        value={editData.sale_price || selectedLead.sale_price || ''}
                        onChange={(e) => setEditData({ ...editData, sale_price: parseFloat(e.target.value) })}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg"
                        placeholder="750000"
                      />
                    </div>

                    <div>
                      <label className="block text-sm mb-1">Commission Amount</label>
                      <input
                        type="number"
                        value={editData.commission_amount || selectedLead.commission_amount || ''}
                        onChange={(e) => setEditData({ ...editData, commission_amount: parseFloat(e.target.value) })}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg"
                        placeholder="15000"
                      />
                    </div>

                    <div className="md:col-span-2">
                      <label className="flex items-center gap-2">
                        <input
                          type="checkbox"
                          checked={editData.commission_paid ?? selectedLead.commission_paid}
                          onChange={(e) => setEditData({ ...editData, commission_paid: e.target.checked })}
                          className="w-4 h-4"
                        />
                        <span className="text-sm">Commission Paid</span>
                      </label>
                    </div>
                  </div>

                  <div className="flex gap-3 pt-4 border-t border-gray-200">
                    <button
                      type="button"
                      onClick={() => {
                        setIsEditing(false);
                        setEditData({});
                      }}
                      className="flex-1 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                    >
                      Save Changes
                    </button>
                  </div>
                </form>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
