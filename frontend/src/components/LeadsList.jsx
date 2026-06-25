import { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { ChevronLeft, ChevronRight, RefreshCw, Plus, X, Trash2 } from 'lucide-react';
import API from '../api';
import './LeadsList.css';

const LeadsList = () => {
  const [leads, setLeads] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const [filter, setFilter] = useState('All');
  const [page, setPage] = useState(1);
  const [pagination, setPagination] = useState({
    total: 0,
    page: 1,
    limit: 25,
    pages: 1
  });

  // New Lead Modal States
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [newLead, setNewLead] = useState({
    name: '',
    email: '',
    source: 'Manual Input',
    status: 'New',
    notes: ''
  });
  const [formLoading, setFormLoading] = useState(false);
  const [error, setError] = useState('');

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setNewLead(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleFormSubmit = async (e) => {
    e.preventDefault();
    if (!newLead.name || !newLead.email) {
      setError('Name and Email are required.');
      return;
    }
    setFormLoading(true);
    setError('');
    try {
      await API.post('/leads', newLead);
      setIsModalOpen(false);
      setNewLead({
        name: '',
        email: '',
        source: 'Manual Input',
        status: 'New',
        notes: ''
      });
      fetchLeads(1);
    } catch (err) {
      console.error(err);
      setError(err.response?.data?.message || 'Failed to add lead. Please try again.');
    } finally {
      setFormLoading(false);
    }
  };

  const fetchLeads = useCallback(async (requestedPage = page) => {
    setLoading(true);
    try {
      const res = await API.get('/leads', {
        params: {
          page: requestedPage,
          limit: pagination.limit,
          search: debouncedSearch || undefined,
          status: filter === 'All' ? undefined : filter
        }
      });
      const nextLeads = Array.isArray(res.data) ? res.data : res.data.data;
      setLeads(nextLeads || []);
      if (res.data.pagination) {
        setPagination(res.data.pagination);
        setPage(res.data.pagination.page);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, [debouncedSearch, filter, page, pagination.limit]);

  useEffect(() => {
    const timeoutId = window.setTimeout(() => {
      setDebouncedSearch(searchTerm.trim());
      setPage(1);
    }, 300);

    return () => window.clearTimeout(timeoutId);
  }, [searchTerm]);

  useEffect(() => {
    fetchLeads(page);
  }, [fetchLeads, page]);

  const handleDeleteLead = async (id, e) => {
    e.preventDefault();
    e.stopPropagation();
    if (window.confirm('Are you sure you want to delete this lead?')) {
      try {
        await API.delete(`/leads/${id}`);
        fetchLeads(page);
      } catch (err) {
        console.error('Failed to delete lead:', err);
        alert('Failed to delete lead. Please try again.');
      }
    }
  };

  const handleFilterChange = (e) => {
    setFilter(e.target.value);
    setPage(1);
  };

  const goToPage = (nextPage) => {
    if (nextPage < 1 || nextPage > pagination.pages || nextPage === page) return;
    setPage(nextPage);
  };

  return (
    <div className="leads-container glass-panel">
      <div className="leads-header">
        <div>
          <h2>Lead Management</h2>
          <p className="text-secondary">View and manage incoming contacts</p>
        </div>
        <div className="header-actions">
          <button className="btn" onClick={() => setIsModalOpen(true)}>
            <Plus size={18} />
            Add Lead
          </button>
          <button className="btn btn-secondary" onClick={fetchLeads}>
            <RefreshCw size={18} className={loading ? 'spinning' : ''} />
            Refresh
          </button>
        </div>
      </div>

      <div className="leads-controls">
        <div className="search-box">
          <input 
            type="text" 
            placeholder="Search leads..." 
            className="input-field with-icon"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        
        <div className="filter-box">
          <select 
            className="input-field"
            value={filter}
            onChange={handleFilterChange}
          >
            <option value="All">All Statuses</option>
            <option value="New">New</option>
            <option value="Contacted">Contacted</option>
            <option value="Converted">Converted</option>
          </select>
        </div>
      </div>

      <div className="table-responsive">
        <table className="leads-table">
          <thead>
            <tr>
              <th>Name</th>
              <th>Email</th>
              <th>Source</th>
              <th>Status</th>
              <th>Date</th>
              <th>Action</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr>
                <td colSpan="6" className="text-center py-4">Loading leads...</td>
              </tr>
            ) : leads.length === 0 ? (
              <tr>
                <td colSpan="6" className="text-center py-4">No leads found.</td>
              </tr>
            ) : (
              leads.map(lead => (
                <tr key={lead._id}>
                  <td className="font-medium">{lead.name}</td>
                  <td className="text-secondary">{lead.email}</td>
                  <td>{lead.source}</td>
                  <td>
                    <span className={`status-badge status-${lead.status.toLowerCase()}`}>
                      {lead.status}
                    </span>
                  </td>
                  <td className="text-secondary">
                    {new Date(lead.createdAt).toLocaleDateString()}
                  </td>
                  <td className="actions-cell">
                    <Link to={`/leads/${lead._id}`} className="view-btn">
                      View Details <ChevronRight size={16} />
                    </Link>
                    <button 
                      type="button"
                      className="delete-icon-btn" 
                      onClick={(e) => handleDeleteLead(lead._id, e)}
                      title="Delete Lead"
                    >
                      <Trash2 size={16} />
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      <div className="pagination-bar">
        <span className="text-secondary">
          Showing {leads.length} of {pagination.total} leads
        </span>
        <div className="pagination-actions">
          <button
            type="button"
            className="pager-btn"
            onClick={() => goToPage(page - 1)}
            disabled={page <= 1 || loading}
            aria-label="Previous page"
          >
            <ChevronLeft size={18} />
          </button>
          <span className="page-count">
            Page {pagination.page} of {pagination.pages}
          </span>
          <button
            type="button"
            className="pager-btn"
            onClick={() => goToPage(page + 1)}
            disabled={page >= pagination.pages || loading}
            aria-label="Next page"
          >
            <ChevronRight size={18} />
          </button>
        </div>
      </div>

      {/* Add Custom Lead Modal */}
      {isModalOpen && (
        <div className="modal-overlay" onClick={() => setIsModalOpen(false)}>
          <div className="modal-content glass-panel fade-in" onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <h3>Add Custom Lead</h3>
              <button className="close-btn" onClick={() => setIsModalOpen(false)}>
                <X size={20} />
              </button>
            </div>
            
            <form onSubmit={handleFormSubmit}>
              {error && <div className="error-message">{error}</div>}
              
              <div className="form-group">
                <label htmlFor="name">Full Name *</label>
                <input 
                  type="text" 
                  id="name"
                  name="name"
                  className="input-field" 
                  placeholder="e.g. John Doe"
                  value={newLead.name}
                  onChange={handleInputChange}
                  required
                />
              </div>

              <div className="form-group">
                <label htmlFor="email">Email Address *</label>
                <input 
                  type="email" 
                  id="email"
                  name="email"
                  className="input-field" 
                  placeholder="e.g. john@example.com"
                  value={newLead.email}
                  onChange={handleInputChange}
                  required
                />
              </div>

              <div className="form-row">
                <div className="form-group half-width">
                  <label htmlFor="source">Source</label>
                  <input 
                    type="text" 
                    id="source"
                    name="source"
                    className="input-field" 
                    placeholder="e.g. Referral"
                    value={newLead.source}
                    onChange={handleInputChange}
                  />
                </div>

                <div className="form-group half-width">
                  <label htmlFor="status">Status</label>
                  <select 
                    id="status"
                    name="status"
                    className="input-field"
                    value={newLead.status}
                    onChange={handleInputChange}
                  >
                    <option value="New">New</option>
                    <option value="Contacted">Contacted</option>
                    <option value="Converted">Converted</option>
                  </select>
                </div>
              </div>

              <div className="form-group">
                <label htmlFor="notes">Initial Note (Optional)</label>
                <textarea 
                  id="notes"
                  name="notes"
                  className="input-field textarea-field" 
                  placeholder="Enter any initial details or notes..."
                  value={newLead.notes}
                  onChange={handleInputChange}
                  rows="3"
                />
              </div>

              <div className="modal-actions">
                <button type="button" className="btn btn-secondary" onClick={() => setIsModalOpen(false)}>
                  Cancel
                </button>
                <button type="submit" className="btn" disabled={formLoading}>
                  {formLoading ? 'Saving...' : 'Save Lead'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default LeadsList;
