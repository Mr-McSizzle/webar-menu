import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../supabaseClient';
import { ChefHat } from 'lucide-react';

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    // try {
    //   const { data, error } = await supabase.auth.signInWithPassword({ email, password });
    //   if (error) throw error;
    //   navigate('/admin');
    // } catch (error) {
    //   console.error(error);
    // }
    
    // For now, just navigate to admin
    navigate('/admin');
  };

  return (
    <div className="container flex items-center justify-center animate-fade-in" style={{ minHeight: 'calc(100vh - 80px)' }}>
      <div className="glass-card" style={{ maxWidth: '400px', width: '100%', padding: '2.5rem' }}>
        <div className="flex flex-col items-center" style={{ marginBottom: '2rem' }}>
          <div style={{ 
            background: 'linear-gradient(135deg, var(--accent-color), var(--accent-hover))',
            padding: '1rem',
            borderRadius: '50%',
            marginBottom: '1rem'
          }}>
            <ChefHat size={32} color="white" />
          </div>
          <h2>Restaurant Login</h2>
          <p style={{ color: 'var(--text-secondary)', marginTop: '0.5rem', textAlign: 'center' }}>
            Manage your AR menu and 3D assets
          </p>
        </div>

        <form onSubmit={handleLogin} className="flex flex-col gap-4">
          <div>
            <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.9rem', color: 'var(--text-secondary)' }}>Email</label>
            <input 
              type="email" 
              placeholder="chef@restaurant.com" 
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>
          <div>
            <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.9rem', color: 'var(--text-secondary)' }}>Password</label>
            <input 
              type="password" 
              placeholder="••••••••" 
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>
          <button type="submit" style={{ marginTop: '1rem', padding: '0.8rem' }}>
            Sign In
          </button>
        </form>
      </div>
    </div>
  );
};

export default Login;
