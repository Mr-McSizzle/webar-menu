import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { LayoutDashboard, ScanLine, LogOut } from 'lucide-react';
// import { supabase } from '../supabaseClient';

const Navbar = () => {
  const location = useLocation();
  const isARView = location.pathname.startsWith('/ar');

  // Don't show navbar in AR view
  if (isARView) return null;

  return (
    <nav style={{ 
      display: 'flex', 
      justifyContent: 'space-between', 
      alignItems: 'center',
      padding: '1rem 2rem',
      borderBottom: '1px solid var(--border-color)',
      backgroundColor: 'rgba(24, 27, 33, 0.8)',
      backdropFilter: 'blur(10px)',
      position: 'sticky',
      top: 0,
      zIndex: 100
    }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
        <ScanLine color="var(--accent-color)" size={28} />
        <h2 style={{ margin: 0, color: 'white', fontWeight: 700, letterSpacing: '-0.5px' }}>Lumina</h2>
      </div>

      <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
        <Link to="/admin" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--text-secondary)' }}>
          <LayoutDashboard size={18} />
          <span>Dashboard</span>
        </Link>
        {/* <button onClick={() => signOut(auth)} style={{ padding: '0.4rem 0.8rem', fontSize: '0.9rem', backgroundColor: 'transparent', border: '1px solid var(--border-color)' }}>
          Logout
        </button> */}
      </div>
    </nav>
  );
};

export default Navbar;
