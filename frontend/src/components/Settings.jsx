import { useState, useEffect } from 'react';
import { User, Lock, Moon, Sun, Check } from 'lucide-react';
import API from '../api';
import './Settings.css';

const Settings = () => {
  const [username, setUsername] = useState('User');
  const [theme, setTheme] = useState(localStorage.getItem('theme') || 'dark');
  
  // Password fields
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const res = await API.get('/auth/me');
        setUsername(res.data.username);
      } catch (err) {
        console.error('Error fetching user profile:', err);
      }
    };
    fetchUser();
  }, []);

  const handleThemeChange = (newTheme) => {
    setTheme(newTheme);
    localStorage.setItem('theme', newTheme);
    if (newTheme === 'light') {
      document.documentElement.setAttribute('data-theme', 'light');
    } else {
      document.documentElement.removeAttribute('data-theme');
    }
  };

  const handlePasswordChange = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    if (newPassword !== confirmPassword) {
      setError('New passwords do not match');
      return;
    }

    if (newPassword.length < 6) {
      setError('New password must be at least 6 characters long');
      return;
    }

    setLoading(true);
    try {
      await API.put('/auth/change-password', { currentPassword, newPassword });
      setSuccess('Password updated successfully');
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to update password');
    } finally {
      setLoading(false);
    }
  };

  const initials = username
    ? username.slice(0, 2).toUpperCase()
    : 'US';

  return (
    <div className="settings-container fade-in">
      <div className="settings-header">
        <h1>Account Settings</h1>
        <p>Manage your profile, theme preference, and password settings</p>
      </div>

      <div className="settings-grid">
        {/* Profile Card */}
        <div className="settings-card glass-panel">
          <div className="card-header">
            <User className="card-icon" />
            <h2>Profile Details</h2>
          </div>
          <div className="profile-info-content">
            <div className="profile-avatar-large">{initials}</div>
            <div className="profile-details">
              <h3>{username}</h3>
              <p className="profile-role">Registered User</p>
              <p className="profile-status">Status: Active</p>
            </div>
          </div>
        </div>

        {/* Theme Settings Card */}
        <div className="settings-card glass-panel">
          <div className="card-header">
            {theme === 'light' ? <Sun className="card-icon" /> : <Moon className="card-icon" />}
            <h2>Theme Preferences</h2>
          </div>
          <p className="card-desc">Choose between a clean light background or a sleek dark workspace.</p>
          <div className="theme-options">
            <button 
              className={`theme-btn dark-btn ${theme === 'dark' ? 'active' : ''}`}
              onClick={() => handleThemeChange('dark')}
            >
              <Moon size={18} />
              <span>Dark Workspace</span>
              {theme === 'dark' && <Check size={16} className="check-badge" />}
            </button>
            <button 
              className={`theme-btn light-btn ${theme === 'light' ? 'active' : ''}`}
              onClick={() => handleThemeChange('light')}
            >
              <Sun size={18} />
              <span>Clean Light</span>
              {theme === 'light' && <Check size={16} className="check-badge" />}
            </button>
          </div>
        </div>

        {/* Security Settings Card */}
        <div className="settings-card glass-panel security-card">
          <div className="card-header">
            <Lock className="card-icon" />
            <h2>Security & Password</h2>
          </div>
          
          {error && <div className="error-message">{error}</div>}
          {success && <div className="success-message">{success}</div>}

          <form onSubmit={handlePasswordChange} className="settings-form">
            <div className="form-group">
              <label>Current Password</label>
              <input 
                type="password" 
                className="input-field" 
                placeholder="Enter current password"
                value={currentPassword}
                onChange={(e) => setCurrentPassword(e.target.value)}
                required
              />
            </div>

            <div className="form-group">
              <label>New Password</label>
              <input 
                type="password" 
                className="input-field" 
                placeholder="Enter new password"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                required
              />
            </div>

            <div className="form-group">
              <label>Confirm New Password</label>
              <input 
                type="password" 
                className="input-field" 
                placeholder="Confirm new password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                required
              />
            </div>

            <button type="submit" className="btn update-password-btn" disabled={loading}>
              {loading ? 'Updating...' : 'Update Password'}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default Settings;
