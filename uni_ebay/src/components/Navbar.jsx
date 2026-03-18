import { Link, useNavigate, useLocation } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'

export default function Navbar() {
  const { user, logout } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()

  const handleLogout = () => {
    logout()
    navigate('/login')
  }

  const isActive = (path) => location.pathname === path

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:wght@500&family=DM+Sans:opsz,wght@9..40,300;9..40,400;9..40,500&display=swap');

        .navbar {
          background: #0D3D3A;
          border-bottom: 1px solid rgba(45,212,191,0.15);
          position: sticky;
          top: 0;
          z-index: 100;
          box-shadow: 0 2px 20px rgba(13,61,58,0.25);
        }

        .navbar-inner {
          max-width: 1200px;
          margin: 0 auto;
          padding: 0 40px;
          height: 60px;
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 32px;
        }

        .navbar-logo {
          font-family: 'Playfair Display', serif;
          font-size: 18px;
          font-weight: 500;
          color: white;
          text-decoration: none;
          letter-spacing: 0.01em;
          flex-shrink: 0;
          transition: opacity 0.15s;
        }

        .navbar-logo span { color: #2DD4BF; }
        .navbar-logo:hover { opacity: 0.85; }

        .navbar-links {
          display: flex;
          align-items: center;
          gap: 4px;
          flex: 1;
        }

        .navbar-link {
          font-family: 'DM Sans', sans-serif;
          font-size: 13px;
          font-weight: 400;
          color: rgba(255,255,255,0.6);
          text-decoration: none;
          padding: 6px 12px;
          border-radius: 8px;
          transition: all 0.15s;
          letter-spacing: 0.01em;
        }

        .navbar-link:hover {
          color: white;
          background: rgba(255,255,255,0.07);
        }

        .navbar-link.active {
          color: #2DD4BF;
          background: rgba(45,212,191,0.1);
        }

        .navbar-link.admin-link {
          color: #2DD4BF;
          font-weight: 500;
        }

        .navbar-link.admin-link:hover {
          background: rgba(45,212,191,0.15);
        }

        .navbar-actions {
          display: flex;
          align-items: center;
          gap: 8px;
          flex-shrink: 0;
        }

        .navbar-btn-ghost {
          font-family: 'DM Sans', sans-serif;
          font-size: 13px;
          font-weight: 400;
          color: rgba(255,255,255,0.6);
          text-decoration: none;
          padding: 7px 14px;
          border-radius: 8px;
          border: none;
          background: none;
          cursor: pointer;
          transition: all 0.15s;
        }

        .navbar-btn-ghost:hover {
          color: white;
          background: rgba(255,255,255,0.07);
        }

        .navbar-btn-primary {
          font-family: 'DM Sans', sans-serif;
          font-size: 13px;
          font-weight: 500;
          color: #0D3D3A;
          text-decoration: none;
          padding: 7px 16px;
          border-radius: 8px;
          background: #2DD4BF;
          border: none;
          cursor: pointer;
          transition: all 0.2s;
          letter-spacing: 0.01em;
        }

        .navbar-btn-primary:hover {
          background: #5EEAD4;
          transform: translateY(-1px);
          box-shadow: 0 4px 12px rgba(45,212,191,0.3);
        }

        .navbar-divider {
          width: 1px;
          height: 20px;
          background: rgba(255,255,255,0.1);
          margin: 0 4px;
        }

        .navbar-user-dot {
          width: 28px;
          height: 28px;
          border-radius: 50%;
          background: linear-gradient(135deg, #2DD4BF, #0D9488);
          display: flex;
          align-items: center;
          justify-content: center;
          font-family: 'DM Sans', sans-serif;
          font-size: 12px;
          font-weight: 500;
          color: white;
          flex-shrink: 0;
        }

        @media (max-width: 768px) {
          .navbar-inner { padding: 0 20px; gap: 16px; }
          .navbar-links { gap: 0; }
          .navbar-link { padding: 6px 8px; font-size: 12px; }
          .navbar-btn-ghost { padding: 7px 10px; font-size: 12px; }
          .navbar-btn-primary { padding: 7px 12px; font-size: 12px; }
        }
      `}</style>

      <nav className="navbar">
        <div className="navbar-inner">

          {/* Logo */}
          <Link to="/" className="navbar-logo">
            Campus<span>Exchange</span>
          </Link>

          {/* Nav links */}
          <div className="navbar-links">
            <Link to="/browse" className={`navbar-link ${isActive('/browse') ? 'active' : ''}`}>
              Browse
            </Link>
            {user && (
              <>
                <Link to="/create" className={`navbar-link ${isActive('/create') ? 'active' : ''}`}>
                  Sell
                </Link>
                <Link to="/dashboard" className={`navbar-link ${isActive('/dashboard') ? 'active' : ''}`}>
                  Dashboard
                </Link>
                <Link to="/contact" className={`navbar-link ${isActive('/contact') ? 'active' : ''}`}>
                  Support
                </Link>
                {user.isAdmin && (
                  <Link to="/admin" className={`navbar-link admin-link ${isActive('/admin') ? 'active' : ''}`}>
                    ⚙ Admin
                  </Link>
                )}
              </>
            )}
          </div>

          {/* Actions */}
          <div className="navbar-actions">
            {user ? (
              <>
                 <Link to="/profile" className="navbar-user-dot" style={{ textDecoration: 'none' }}>
  {user.name?.[0]?.toUpperCase() || '?'}
</Link>
                <div className="navbar-divider" />
                <button onClick={handleLogout} className="navbar-btn-ghost">
                  Logout
                </button>
              </>
            ) : (
              <>
                <Link to="/login" className="navbar-btn-ghost">Login</Link>
                <Link to="/register" className="navbar-btn-primary">Register</Link>
               
              </>
            )}
          </div>

        </div>
      </nav>
    </>
  )
}