import { Link, useLocation } from 'react-router-dom';
import { LayoutDashboard, ScanLine, LogOut } from 'lucide-react';
import { supabase } from '../supabaseClient';
import { useAuth } from '../App';

const Navbar = () => {
  const location = useLocation();
  const { user } = useAuth();
  const isARView = location.pathname.startsWith('/ar');

  if (isARView) return null;

  const handleLogout = async () => {
    await supabase.auth.signOut();
  };

  return (
    <nav className="navbar">
      <Link to="/" className="navbar-brand" style={{ textDecoration: 'none' }}>
        <ScanLine color="var(--accent)" size={26} />
        <h2>Lumina</h2>
      </Link>

      <div className="navbar-links">
        {user && (
          <>
            <Link to="/admin" className="nav-link">
              <LayoutDashboard size={18} />
              <span>Dashboard</span>
            </Link>
            <button className="btn btn-secondary btn-sm" onClick={handleLogout}>
              <LogOut size={14} />
              Logout
            </button>
          </>
        )}
      </div>
    </nav>
  );
};

export default Navbar;
