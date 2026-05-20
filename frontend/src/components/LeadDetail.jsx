import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Save, Clock, Briefcase, Mail, Trash2 } from 'lucide-react';
import API from '../api';
import './LeadDetail.css';

const LeadDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [lead, setLead] = useState(null);
  const [loading, setLoading] = useState(true);
  const [status, setStatus] = useState('');
  const [newNote, setNewNote] = useState('');
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    const fetchLead = async () => {
      try {
        const res = await API.get(`/leads/${id}`);
        setLead(res.data);
        setStatus(res.data.status);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchLead();
  }, [id]);

  const handleDelete = async () => {
    if (window.confirm('Are you sure you want to delete this lead?')) {
      try {
        await API.delete(`/leads/${id}`);
        navigate('/leads');
      } catch (err) {
        console.error('Failed to delete lead:', err);
        alert('Failed to delete lead. Please try again.');
      }
    }
  };

  const handleUpdate = async () => {
    setSaving(true);
    try {
      const payload = { status };
      if (newNote.trim()) {
        payload.note = newNote.trim();
      }
      const res = await API.put(`/leads/${id}`, payload);
      setLead(res.data);
      setNewNote('');
    } catch (err) {
      console.error(err);
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <div className="p-8">Loading details...</div>;
  if (!lead) return <div className="p-8">Lead not found.</div>;

  return (
    <div className="lead-detail-container fade-in">
      <button className="back-btn" onClick={() => navigate('/leads')}>
        <ArrowLeft size={20} /> Back to Leads
      </button>

      <div className="detail-grid">
        {/* Profile Card */}
        <div className="glass-panel profile-card">
          <div className="profile-header">
            <div className="profile-avatar">
              {lead.name.charAt(0)}
            </div>
            <div>
              <h3>{lead.name}</h3>
              <p className="text-secondary"><Mail size={14} className="inline-icon"/> {lead.email}</p>
            </div>
          </div>
          
          <div className="profile-stats">
            <div className="stat-item">
              <span className="stat-label"><Briefcase size={14} className="inline-icon"/> Source</span>
              <span className="stat-value">{lead.source}</span>
            </div>
            <div className="stat-item">
              <span className="stat-label"><Clock size={14} className="inline-icon"/> Created</span>
              <span className="stat-value">{new Date(lead.createdAt).toLocaleDateString()}</span>
            </div>
          </div>

          <div className="status-updater">
            <label>Update Status</label>
            <select 
              className="input-field"
              value={status}
              onChange={(e) => setStatus(e.target.value)}
            >
              <option value="New">New</option>
              <option value="Contacted">Contacted</option>
              <option value="Converted">Converted</option>
            </select>
          </div>

          <div className="profile-actions">
            <button 
              type="button"
              className="btn btn-danger" 
              onClick={handleDelete}
            >
              <Trash2 size={18} /> Delete Lead
            </button>
          </div>
        </div>

        {/* Notes & Activity */}
        <div className="glass-panel activity-card">
          <h3>Follow-up Notes</h3>
          
          <div className="notes-list">
            {lead.notes && lead.notes.length > 0 ? (
              lead.notes.map((note, idx) => (
                <div key={idx} className="note-item">
                  <div className="note-text">{note.text}</div>
                  <div className="note-date">
                    {new Date(note.createdAt).toLocaleString()}
                  </div>
                </div>
              ))
            ) : (
              <p className="text-secondary">No notes added yet.</p>
            )}
          </div>

          <div className="add-note-section">
            <textarea 
              className="input-field" 
              placeholder="Add a new follow-up note..."
              rows="3"
              value={newNote}
              onChange={(e) => setNewNote(e.target.value)}
            ></textarea>
            
            <button 
              className="btn btn-save mt-4" 
              onClick={handleUpdate}
              disabled={saving}
            >
              <Save size={18} /> {saving ? 'Saving...' : 'Save Changes'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LeadDetail;
