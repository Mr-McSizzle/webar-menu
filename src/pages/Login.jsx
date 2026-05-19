import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../supabaseClient';
import { useAuth } from '../App';
import { ChefHat } from 'lucide-react';

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isSignUp, setIsSignUp] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const navigate = useNavigate();
  const { user } = useAuth();

  // If already logged in, redirect to admin
  if (user) {
    navigate('/admin', { replace: true });
    return null;
  }

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setMessage('');
    setLoading(true);

    try {
      if (isSignUp) {
        const { error: signUpError } = await supabase.auth.signUp({ email, password });
        if (signUpError) throw signUpError;
        setMessage('Account created! Check your email for a confirmation link, or if email confirmation is disabled, you can now log in.');
        setIsSignUp(false);
      } else {
        const { error: signInError } = await supabase.auth.signInWithPassword({ email, password });
        if (signInError) throw signInError;
        navigate('/admin');
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-wrapper animate-in">
      <div className="card login-card">
        <div className="login-header">
          <div className="login-icon">
            <ChefHat size={30} color="white" />
          </div>
          <h2>{isSignUp ? 'Create Account' : 'Restaurant Login'}</h2>
          <p style={{ marginTop: '0.5rem', fontSize: '0.9rem' }}>
            {isSignUp ? 'Sign up to manage your AR menu' : 'Manage your AR menu and 3D assets'}
          </p>
        </div>

        {error && <div className="error-msg" style={{ marginBottom: '1rem' }}>{error}</div>}
        {message && (
          <div style={{
            background: 'var(--success-bg)', color: 'var(--success)',
            padding: '0.6rem 1rem', borderRadius: 'var(--radius-sm)',
            fontSize: '0.85rem', marginBottom: '1rem',
            border: '1px solid rgba(52, 211, 153, 0.2)'
          }}>{message}</div>
        )}

        <form onSubmit={handleSubmit} className="login-form">
          <div>
            <label htmlFor="login-email">Email</label>
            <input
              id="login-email"
              type="email"
              placeholder="chef@restaurant.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>
          <div>
            <label htmlFor="login-password">Password</label>
            <input
              id="login-password"
              type="password"
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              minLength={6}
            />
          </div>
          <button type="submit" className="btn btn-primary" disabled={loading} style={{ width: '100%', marginTop: '0.5rem' }}>
            {loading ? <span className="spinner-inline" /> : (isSignUp ? 'Sign Up' : 'Sign In')}
          </button>
        </form>

        <div className="login-toggle">
          {isSignUp ? 'Already have an account? ' : "Don't have an account? "}
          <button onClick={() => { setIsSignUp(!isSignUp); setError(''); setMessage(''); }}>
            {isSignUp ? 'Sign In' : 'Sign Up'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default Login;
