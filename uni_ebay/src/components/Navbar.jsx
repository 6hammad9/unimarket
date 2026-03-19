import { useState } from 'react'
import { Link, useNavigate, useLocation } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'

export default function Navbar() {
  const { user, logout } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()
  const [menuOpen, setMenuOpen] = useState(false)

  const handleLogout = () => {
    logout()
    navigate('/login')
    setMenuOpen(false)
  }

  const isActive = (path) => location.pathname === path
  const close = () => setMenuOpen(false)

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:wght@500&family=DM+Sans:opsz,wght@9..40,300;9..40,400;9..40,500&display=swap');

        .navbar {
          background: #0D3D3A;
          border-bottom: 1px solid rgba(45,212,191,0.15);
          position: sticky;
          top: 0;
          z-index: 200;
          box-shadow: 0 2px 20px rgba(13,61,58,0.25);
        }

        .navbar-inner {
          max-width: 1200px;
          margin: 0 auto;
          padding: 0 24px;
          height: 56px;
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 16px;
        }

        .navbar-logo {
          font-family: 'Playfair Display', serif;
          font-size: 17px;
          font-weight: 500;
          color: white;
          text-decoration: none;
          flex-shrink: 0;
          transition: opacity 0.15s;
        }

        .navbar-logo span { color: #2DD4BF; }
        .navbar-logo:hover { opacity: 0.85; }

        /* Desktop links */
        .navbar-links {
          display: flex;
          align-items: center;
          gap: 2px;
          flex: 1;
        }

        .navbar-link {
          font-family: 'DM Sans', sans-serif;
          font-size: 13px;
          font-weight: 400;
          color: rgba(255,255,255,0.6);
          text-decoration: none;
          padding: 6px 11px;
          border-radius: 8px;
          transition: all 0.15s;
          white-space: nowrap;
        }

        .navbar-link:hover { color: white; background: rgba(255,255,255,0.07); }
        .navbar-link.active { color: #2DD4BF; background: rgba(45,212,191,0.1); }
        .navbar-link.admin-link { color: #2DD4BF; font-weight: 500; }
        .navbar-link.admin-link:hover { background: rgba(45,212,191,0.15); }

        .navbar-actions {
          display: flex;
          align-items: center;
          gap: 8px;
          flex-shrink: 0;
        }

        .navbar-btn-ghost {
          font-family: 'DM Sans', sans-serif;
          font-size: 13px;
          color: rgba(255,255,255,0.6);
          text-decoration: none;
          padding: 7px 12px;
          border-radius: 8px;
          border: none;
          background: none;
          cursor: pointer;
          transition: all 0.15s;
          white-space: nowrap;
        }

        .navbar-btn-ghost:hover { color: white; background: rgba(255,255,255,0.07); }

        .navbar-btn-primary {
          font-family: 'DM Sans', sans-serif;
          font-size: 13px;
          font-weight: 500;
          color: #0D3D3A;
          text-decoration: none;
          padding: 7px 14px;
          border-radius: 8px;
          background: #2DD4BF;
          border: none;
          cursor: pointer;
          transition: all 0.2s;
          white-space: nowrap;
        }

        .navbar-btn-primary:hover {
          background: #5EEAD4;
          box-shadow: 0 4px 12px rgba(45,212,191,0.3);
        }

        .navbar-divider {
          width: 1px;
          height: 20px;
          background: rgba(255,255,255,0.1);
          margin: 0 2px;
        }

        .navbar-user-dot {
          width: 30px;
          height: 30px;
          border-radius: 50%;
          background: linear-gradient(135deg, #2DD4BF, #0D9488);
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 13px;
          font-weight: 500;
          color: white;
          flex-shrink: 0;
          text-decoration: none;
          cursor: pointer;
          transition: box-shadow 0.2s;
        }

        .navbar-user-dot:hover {
          box-shadow: 0 0 0 3px rgba(45,212,191,0.3);
        }

        /* Hamburger */
        .navbar-hamburger {
          display: none;
          flex-direction: column;
          gap: 5px;
          background: none;
          border: none;
          cursor: pointer;
          padding: 6px;
          border-radius: 8px;
          transition: background 0.15s;
        }

        .navbar-hamburger:hover { background: rgba(255,255,255,0.07); }

        .navbar-hamburger span {
          display: block;
          width: 22px;
          height: 2px;
          background: rgba(255,255,255,0.8);
          border-radius: 2px;
          transition: all 0.25s;
          transform-origin: center;
        }

        .navbar-hamburger.open span:nth-child(1) { transform: translateY(7px) rotate(45deg); }
        .navbar-hamburger.open span:nth-child(2) { opacity: 0; transform: scaleX(0); }
        .navbar-hamburger.open span:nth-child(3) { transform: translateY(-7px) rotate(-45deg); }

        /* Mobile drawer */
        .navbar-drawer {
          display: none;
          position: fixed;
          top: 56px;
          left: 0;
          right: 0;
          bottom: 0;
          background: #0D3D3A;
          z-index: 199;
          overflow-y: auto;
          padding: 16px 0 40px;
          border-top: 1px solid rgba(255,255,255,0.06);
          animation: slideDown 0.2s ease;
        }

        @keyframes slideDown {
          from { opacity: 0; transform: translateY(-8px); }
          to   { opacity: 1; transform: translateY(0); }
        }

        .navbar-drawer.open { display: block; }

        .drawer-link {
          display: flex;
          align-items: center;
          gap: 12px;
          padding: 14px 24px;
          font-family: 'DM Sans', sans-serif;
          font-size: 15px;
          font-weight: 400;
          color: rgba(255,255,255,0.7);
          text-decoration: none;
          transition: all 0.15s;
          border-left: 3px solid transparent;
        }

        .drawer-link:hover {
          background: rgba(255,255,255,0.05);
          color: white;
        }

        .drawer-link.active {
          color: #2DD4BF;
          border-left-color: #2DD4BF;
          background: rgba(45,212,191,0.06);
        }

        .drawer-divider {
          height: 1px;
          background: rgba(255,255,255,0.06);
          margin: 12px 24px;
        }

        .drawer-user-row {
          display: flex;
          align-items: center;
          gap: 12px;
          padding: 16px 24px;
          margin-bottom: 4px;
        }

        .drawer-user-info { flex: 1; min-width: 0; }

        .drawer-user-name {
          font-size: 14px;
          font-weight: 500;
          color: white;
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
        }

        .drawer-user-email {
          font-size: 11px;
          color: rgba(255,255,255,0.35);
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
          margin-top: 2px;
        }

        .drawer-logout {
          display: flex;
          align-items: center;
          gap: 12px;
          padding: 14px 24px;
          font-family: 'DM Sans', sans-serif;
          font-size: 15px;
          color: #EF4444;
          background: none;
          border: none;
          cursor: pointer;
          width: 100%;
          text-align: left;
          transition: background 0.15s;
        }

        .drawer-logout:hover { background: rgba(239,68,68,0.08); }

        /* Responsive */
        @media (max-width: 768px) {
          .navbar-links { display: none; }
          .navbar-actions { display: none; }
          .navbar-hamburger { display: flex; }
        }

        @media (min-width: 769px) {
          .navbar-drawer { display: none !important; }
        }
      `}</style>

      <nav className="navbar">
        <div className="navbar-inner">

          {/* Logo */}
          <Link to="/" className="navbar-logo" onClick={close}>
            Campus<span>Exchange</span>
          </Link>

          {/* Desktop links */}
          <div className="navbar-links">
            <Link to="/browse" className={`navbar-link ${isActive('/browse') ? 'active' : ''}`}>Browse</Link>
            {user && (
              <>
                <Link to="/create" className={`navbar-link ${isActive('/create') ? 'active' : ''}`}>Sell</Link>
                <Link to="/dashboard" className={`navbar-link ${isActive('/dashboard') ? 'active' : ''}`}>Dashboard</Link>
                <Link to="/contact" className={`navbar-link ${isActive('/contact') ? 'active' : ''}`}>Support</Link>
                {user.isAdmin && (
                  <Link to="/admin" className={`navbar-link admin-link ${isActive('/admin') ? 'active' : ''}`}>⚙ Admin</Link>
                )}
              </>
            )}
          </div>

          {/* Desktop actions */}
          <div className="navbar-actions">
            {user ? (
              <>
                <Link to="/profile" className="navbar-user-dot">
                  {user.name?.[0]?.toUpperCase() || '?'}
                </Link>
                <div className="navbar-divider" />
                <button onClick={handleLogout} className="navbar-btn-ghost">Logout</button>
              </>
            ) : (
              <>
                <Link to="/login" className="navbar-btn-ghost">Login</Link>
                <Link to="/register" className="navbar-btn-primary">Register</Link>
              </>
            )}
          </div>

          {/* Hamburger */}
          <button
            className={`navbar-hamburger ${menuOpen ? 'open' : ''}`}
            onClick={() => setMenuOpen(!menuOpen)}
            aria-label="Menu"
          >
            <span /><span /><span />
          </button>

        </div>
      </nav>

      {/* Mobile drawer */}
      <div className={`navbar-drawer ${menuOpen ? 'open' : ''}`}>

        {user && (
          <>
            <div className="drawer-user-row">
              <div className="navbar-user-dot" style={{ width: 38, height: 38, fontSize: 16 }}>
                {user.name?.[0]?.toUpperCase() || '?'}
              </div>
              <div className="drawer-user-info">
                <div className="drawer-user-name">{user.name}</div>
                <div className="drawer-user-email">{user.email}</div>
              </div>
            </div>
            <div className="drawer-divider" />
          </>
        )}

        <Link to="/browse" className={`drawer-link ${isActive('/browse') ? 'active' : ''}`} onClick={close}>
          🔍 Browse
        </Link>

        {user ? (
          <>
            <Link to="/create" className={`drawer-link ${isActive('/create') ? 'active' : ''}`} onClick={close}>
              ➕ Sell an item
            </Link>
            <Link to="/dashboard" className={`drawer-link ${isActive('/dashboard') ? 'active' : ''}`} onClick={close}>
              📊 Dashboard
            </Link>
            <Link to="/profile" className={`drawer-link ${isActive('/profile') ? 'active' : ''}`} onClick={close}>
              👤 Profile settings
            </Link>
            <Link to="/contact" className={`drawer-link ${isActive('/contact') ? 'active' : ''}`} onClick={close}>
              💬 Support
            </Link>
            {user.isAdmin && (
              <Link to="/admin" className={`drawer-link ${isActive('/admin') ? 'active' : ''}`} onClick={close}>
                ⚙ Admin panel
              </Link>
            )}
            <div className="drawer-divider" />
            <button onClick={handleLogout} className="drawer-logout">
              🚪 Logout
            </button>
          </>
        ) : (
          <>
            <div className="drawer-divider" />
            <Link to="/login" className="drawer-link" onClick={close}>🔑 Login</Link>
            <Link to="/register" className={`drawer-link`} onClick={close} style={{ color: '#2DD4BF' }}>
              ✨ Register for free
            </Link>
          </>
        )}
      </div>

      {/* Overlay to close drawer */}
      {menuOpen && (
        <div
          onClick={close}
          style={{
            position: 'fixed', inset: 0, zIndex: 198,
            background: 'rgba(0,0,0,0.4)',
            top: 56
          }}
        />
      )}
    </>
  )
}