import { useState, useEffect } from 'react'
import { useParams, useNavigate, Link } from 'react-router-dom'
import Navbar from '../components/Navbar'
import { useAuth } from '../context/AuthContext'
import api from '../api/axios'
import './ProductDetail.css'

const CATEGORY_ICONS = {
  books: '📖', electronics: '⚡', clothing: '👔', furniture: '🪑', other: '◎'
}

const timeAgo = (date) => {
  const s = Math.floor((new Date() - new Date(date)) / 1000)
  if (s < 60) return 'just now'
  if (s < 3600) return `${Math.floor(s / 60)}m ago`
  if (s < 86400) return `${Math.floor(s / 3600)}h ago`
  return `${Math.floor(s / 86400)}d ago`
}

export default function ProductDetail() {
  const { id } = useParams()
  const { user, token } = useAuth()
  const navigate = useNavigate()

  const [listing, setListing] = useState(null)
  const [loading, setLoading] = useState(true)
  const [activeImage, setActiveImage] = useState(0)
  const [markingSold, setMarkingSold] = useState(false)
  const [deleting, setDeleting] = useState(false)

  useEffect(() => {
    const fetch = async () => {
      try {
        const res = await api.get(`/listings/${id}`)
        setListing(res.data)
      } catch (err) {
        console.error(err)
      } finally {
        setLoading(false)
      }
    }
    fetch()
  }, [id])

  const handleMarkSold = async () => {
    setMarkingSold(true)
    try {
      await api.put(`/listings/${id}/sold`, {}, { headers: { Authorization: `Bearer ${token}` } })
      setListing({ ...listing, sold: true })
    } catch (err) {
      console.error(err)
    } finally {
      setMarkingSold(false)
    }
  }

  const handleDelete = async () => {
    if (!window.confirm('Delete this listing?')) return
    setDeleting(true)
    try {
      await api.delete(`/listings/${id}`, { headers: { Authorization: `Bearer ${token}` } })
      navigate('/dashboard')
    } catch (err) {
      console.error(err)
      setDeleting(false)
    }
  }

  if (loading) return (
    <div className="pd-root">
      <Navbar />
      <div className="pd-loading">
        <div className="pd-spinner" />
        <span style={{ fontSize: 12, color: '#9BBAB8', letterSpacing: '0.1em', textTransform: 'uppercase' }}>
          Loading
        </span>
      </div>
    </div>
  )

  if (!listing) return (
    <div className="pd-root">
      <Navbar />
      <div className="pd-not-found">
        <p style={{ fontFamily: "'Playfair Display', serif", fontSize: 22, color: '#0D3D3A' }}>
          Listing not found
        </p>
        <Link to="/browse" className="pd-back">← Back to browse</Link>
      </div>
    </div>
  )

  const isOwner = user?.id === listing.seller?._id

  return (
    <div className="pd-root">
      <Navbar />

      {/* Breadcrumb */}
      <div className="pd-breadcrumb">
        <Link to="/browse" className="pd-back">← Back to browse</Link>
      </div>

      <div className="pd-inner">

        {/* ── Gallery ── */}
        <div className="pd-gallery">
          <div className="pd-main-img">
            {listing.sold && (
              <div className="pd-sold-overlay">
                <span className="pd-sold-badge">Sold</span>
              </div>
            )}
            {listing.images?.[activeImage] ? (
              <img src={listing.images[activeImage]} alt={listing.title} />
            ) : (
              <div className="pd-main-img-placeholder">
                {CATEGORY_ICONS[listing.category] || '◎'}
              </div>
            )}
          </div>

          {listing.images?.length > 1 && (
            <div className="pd-thumbnails">
              {listing.images.map((img, i) => (
                <button
                  key={i}
                  className={`pd-thumb ${activeImage === i ? 'active' : ''}`}
                  onClick={() => setActiveImage(i)}
                >
                  <img src={img} alt="" />
                </button>
              ))}
            </div>
          )}
        </div>

        {/* ── Details ── */}
        <div className="pd-details">

          {/* Category + time */}
          <div className="pd-meta-row">
            <span className="pd-category">{listing.category}</span>
            <span className="pd-time">{timeAgo(listing.createdAt)}</span>
          </div>

          {/* Title */}
          <h1 className="pd-title">{listing.title}</h1>

          {/* Price */}
          <div className="pd-price">
            EUR {listing.price.toLocaleString()}
            <span>€</span>
          </div>

          {/* Location tags */}
          {(listing.university?.name || listing.university?.city) && (
            <div className="pd-location-row">
              {listing.university?.name && (
                <span className="pd-location-tag">🎓 {listing.university.name}</span>
              )}
              {listing.university?.city && (
                <span className="pd-location-tag">📍 {listing.university.city}</span>
              )}
            </div>
          )}

          {/* Description */}
          <div className="pd-card">
            <div className="pd-card-label">Description</div>
            <p className="pd-desc">{listing.description}</p>
          </div>

          {/* Seller */}
          <div className="pd-card">
            <div className="pd-card-label">Listed by</div>
            <div className="pd-seller-row">
              <div className="pd-seller-avatar">
                {listing.seller?.name?.[0]?.toUpperCase() || '?'}
              </div>
              <div>
                <div className="pd-seller-name">{listing.seller?.name}</div>
                {listing.university?.city && (
                  <div className="pd-seller-uni">📍 {listing.university.city}</div>
                )}
              </div>
            </div>
          </div>

          {/* Owner actions */}
          {isOwner && (
            <div className="pd-owner-card">
              <div className="pd-owner-label">Your listing</div>
              <div className="pd-owner-actions">
                {!listing.sold && (
                  <button
                    onClick={handleMarkSold}
                    disabled={markingSold}
                    className="pd-btn-sold"
                  >
                    {markingSold ? 'Updating...' : '✓ Mark as sold'}
                  </button>
                )}
                <button
                  onClick={handleDelete}
                  disabled={deleting}
                  className="pd-btn-delete"
                >
                  {deleting ? 'Deleting...' : '🗑 Delete'}
                </button>
              </div>
            </div>
          )}

          {/* Contact seller — not owner, not sold */}
          {!isOwner && !listing.sold && (
            <div className="pd-card">
              {user ? (
                <>
                  <div className="pd-card-label">Contact seller</div>
                  <div className="pd-phone">📞 {listing.seller?.phone}</div>
                  <div className="pd-phone-hint">WhatsApp or call directly</div>
                </>
              ) : (
                <div className="pd-login-prompt">
                  <p>Login to see the seller's phone number</p>
                  <Link to="/login" className="pd-btn-cta">
                    Login to contact →
                  </Link>
                </div>
              )}
            </div>
          )}

          {/* Sold notice for buyers */}
          {!isOwner && listing.sold && (
            <div className="pd-sold-notice">
              <p>This item has been sold</p>
              <Link to="/browse">Browse similar listings →</Link>
            </div>
          )}

        </div>
      </div>

      <footer className="pd-footer">
        © 2026 CAMPUSEXCHANGE — MADE FOR STUDENTS, BY STUDENTS
      </footer>
    </div>
  )
}