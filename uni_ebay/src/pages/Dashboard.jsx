import { useState, useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import Navbar from '../components/Navbar'
import { useAuth } from '../context/AuthContext'
import api from '../api/axios'
import './Dashboard.css'

const CATEGORY_ICONS = {
  books: '📖', electronics: '⚡', clothing: '👔', furniture: '🪑', other: '◎'
}

export default function Dashboard() {
  const { user, token } = useAuth()
  const navigate = useNavigate()
  const [listings, setListings] = useState([])
  const [loading, setLoading] = useState(true)

  const headers = { Authorization: `Bearer ${token}` }

  useEffect(() => {
    const fetchListings = async () => {
      try {
        const res = await api.get('/listings/my', { headers })
        setListings(res.data)
      } catch (err) {
        console.error(err)
      } finally {
        setLoading(false)
      }
    }
    fetchListings()
  }, [])

  const handleMarkSold = async (id) => {
    try {
      await api.put(`/listings/${id}/sold`, {}, { headers })
      setListings(listings.map(l => l._id === id ? { ...l, sold: true } : l))
    } catch (err) {
      console.error(err)
    }
  }

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this listing?')) return
    try {
      await api.delete(`/listings/${id}`, { headers })
      setListings(listings.filter(l => l._id !== id))
    } catch (err) {
      console.error(err)
    }
  }

  const active = listings.filter(l => !l.sold).length
  const sold = listings.filter(l => l.sold).length

  return (
    <div className="dash-root">
      <Navbar />

      {/* Banner */}
      <div className="dash-banner">
        <div className="dash-banner-inner">
          <div>
            <div className="dash-greeting-eyebrow">Dashboard</div>
            <h1 className="dash-greeting">
              Welcome back, <em>{user?.name?.split(' ')[0]}</em>
            </h1>
            <div className="dash-greeting-sub">
              {user?.university ? `📍 ${user.university.name || ''}` : 'Manage your listings below'}
            </div>
          </div>
          <Link to="/create" className="dash-new-btn">
            + New listing
          </Link>
        </div>
      </div>

      {/* Stats */}
      <div className="dash-stats-wrap">
        <div className="dash-stats">
          <div className="dash-stat-card">
            <div className="dash-stat-icon active">🟢</div>
            <div>
              <div className="dash-stat-num">{active}</div>
              <div className="dash-stat-label">Active listings</div>
            </div>
          </div>
          <div className="dash-stat-card">
            <div className="dash-stat-icon sold">✅</div>
            <div>
              <div className="dash-stat-num">{sold}</div>
              <div className="dash-stat-label">Items sold</div>
            </div>
          </div>
          <div className="dash-stat-card">
            <div className="dash-stat-icon total">📦</div>
            <div>
              <div className="dash-stat-num">{listings.length}</div>
              <div className="dash-stat-label">Total listings</div>
            </div>
          </div>
        </div>
      </div>

      {/* Listings */}
      <div className="dash-body">
        <div className="dash-section-header">
          <div>
            <div className="dash-section-title">Your listings</div>
            <div className="dash-section-count">{listings.length} total · {active} active</div>
          </div>
        </div>

        {loading ? (
          <div style={{ textAlign: 'center', padding: '48px 0' }}>
            <div style={{
              width: 36, height: 36,
              border: '3px solid rgba(45,212,191,0.2)',
              borderTopColor: '#2DD4BF',
              borderRadius: '50%',
              animation: 'spin 0.8s linear infinite',
              margin: '0 auto'
            }} />
            <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
          </div>
        ) : listings.length === 0 ? (
          <div className="dash-empty">
            <div className="dash-empty-icon">🛍️</div>
            <div className="dash-empty-title">No listings yet</div>
            <div className="dash-empty-sub">Post your first item and start selling</div>
            <Link to="/create" className="dash-new-btn" style={{ display: 'inline-flex' }}>
              + Create listing
            </Link>
          </div>
        ) : (
          <div className="dash-listings">
            {listings.map(listing => (
              <div key={listing._id} className="dash-listing-card">

                {/* Image */}
                <div className="dash-listing-img">
                  {listing.images?.[0]
                    ? <img src={listing.images[0]} alt={listing.title} />
                    : CATEGORY_ICONS[listing.category] || '◎'
                  }
                </div>

                {/* Info */}
                <div className="dash-listing-info">
                  <div className="dash-listing-title-row">
                    <span className="dash-listing-title">{listing.title}</span>
                    {listing.sold && <span className="dash-sold-tag">Sold</span>}
                    {listing.isFeatured && <span className="dash-featured-tag">★ Featured</span>}
                  </div>
                  <div className="dash-listing-meta">
                    <span className="dash-listing-price">EUR {listing.price?.toLocaleString()}</span>
                    <span>·</span>
                    <span style={{ textTransform: 'capitalize' }}>{listing.category}</span>
                  </div>
                </div>

                {/* Actions */}
                <div className="dash-listing-actions">
                  <Link to={`/listings/${listing._id}`} className="dash-action-btn view">
                    View
                  </Link>
                  {!listing.sold && (
                    <button
                      onClick={() => handleMarkSold(listing._id)}
                      className="dash-action-btn sold"
                    >
                      Sold
                    </button>
                  )}
                  <button
                    onClick={() => handleDelete(listing._id)}
                    className="dash-action-btn delete"
                  >
                    Delete
                  </button>
                </div>

              </div>
            ))}
          </div>
        )}
      </div>

      <footer className="dash-footer">
        © 2026 CAMPUSEXCHANGE — MADE FOR STUDENTS, BY STUDENTS
      </footer>
    </div>
  )
}