import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Lock } from 'lucide-react';
import API from '../api';
import './Login.css';

const Login = () => {
  const [isRegister, setIsRegister] = useState(false);
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (isRegister && password !== confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    try {
      const endpoint = isRegister ? '/auth/register' : '/auth/login';
      const res = await API.post(endpoint, { username, password });
      localStorage.setItem('token', res.data.token);
      navigate('/');
    } catch (err) {
      const message = err.response?.data?.message || (isRegister ? 'Registration failed' : 'Invalid username or password');
      setError(message);
    }
  };

  return (
    <div className="login-container fade-in">
      <div className="glass-panel login-box">
        <div className="login-header">
          <div className="logo-circle">
            <Lock className="logo-icon" />
          </div>
          <h2>{isRegister ? 'Create Account' : 'CRM Portal'}</h2>
          <p>{isRegister ? 'Register to manage your CRM' : 'Sign in to manage your CRM'}</p>
        </div>
        
        {error && <div className="error-message">{error}</div>}

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label>Username</label>
            <div className="input-icon-wrapper">
              <input 
                type="text" 
                className="input-field with-icon" 
                placeholder="Enter username"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                required
              />
            </div>
          </div>
          <div className="form-group">
            <label>Password</label>
            <div className="input-icon-wrapper">
              <input 
                type="password" 
                className="input-field with-icon" 
                placeholder="Enter password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </div>
          </div>
          {isRegister && (
            <div className="form-group">
              <label>Confirm Password</label>
              <div className="input-icon-wrapper">
                <input 
                  type="password" 
                  className="input-field with-icon" 
                  placeholder="Confirm password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  required
                />
              </div>
            </div>
          )}
          <button type="submit" className="btn login-btn">
            {isRegister ? 'Register' : 'Sign In'}
          </button>
        </form>

        <div className="toggle-auth">
          <p>
            {isRegister ? 'Already have an account?' : "Don't have an account?"}{' '}
            <button 
              type="button" 
              className="toggle-link"
              onClick={() => {
                setIsRegister(!isRegister);
                setError('');
                setUsername('');
                setPassword('');
                setConfirmPassword('');
              }}
            >
              {isRegister ? 'Sign In' : 'Register'}
            </button>
          </p>
        </div>
      </div>
    </div>
  );
};

export default Login;
