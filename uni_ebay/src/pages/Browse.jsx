import { useState, useEffect } from 'react'
import { Link, useSearchParams } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import Navbar from '../components/Navbar'
import api from '../api/axios'
import './Browse.css'

const CATEGORIES = ['all', 'books', 'electronics', 'clothing', 'furniture', 'other']

const CATEGORY_ICONS = {
  all: '◈',
  books: '📖',
  electronics: '⚡',
  clothing: '👔',
  furniture: '🪑',
  other: '◎',
}

export default function Browse() {
  const { user } = useAuth()
  const [searchParams, setSearchParams] = useSearchParams()
  const [listings, setListings] = useState([])
  const [universities, setUniversities] = useState([])
  const [loading, setLoading] = useState(true)
  
  // New state for mobile filter dropdown
  const [isMobileFilterOpen, setIsMobileFilterOpen] = useState(false)

  const category = searchParams.get('category') || 'all'
  const search = searchParams.get('search') || ''
  const selectedUni = searchParams.get('university') || ''
  const isAllSelected = selectedUni === 'all'
  const selectedCity = searchParams.get('city') || ''

  useEffect(() => {
    api.get('/universities').then(r => setUniversities(r.data)).catch(console.error)
  }, [])

  useEffect(() => {
    const fetchListings = async () => {
      setLoading(true)
      try {
        const params = {}
        if (category !== 'all') params.category = category
        if (search) params.search = search

        // University filter logic
        if (isAllSelected) {
          // User explicitly clicked "All universities" — show everything
        } else if (selectedUni) {
          // User picked a specific university
          params.university = selectedUni
        } else if (!selectedCity && user?.university) {
          // Logged in, no filter set — default to their university
          params.university = user?.university?._id || user?.university
        }

        if (selectedCity) params.city = selectedCity

        const res = await api.get('/listings', { params })
        setListings(res.data)
      } catch (err) {
        console.error(err)
      } finally {
        setLoading(false)
      }
    }
    fetchListings()
  }, [category, search, selectedUni, selectedCity, user])

  const updateParam = (key, value) => {
    const next = new URLSearchParams(searchParams)
    if (value) next.set(key, value)
    else next.delete(key)
    if (key === 'university') next.delete('city')
    if (key === 'city') next.delete('university')
    setSearchParams(next)
    
    // Auto-close mobile filters when a selection is made
    setIsMobileFilterOpen(false) 
  }

  const clearAll = () => {
    const next = new URLSearchParams(searchParams)
    next.set('university', 'all')
    next.delete('city')
    setSearchParams(next)
    
    // Auto-close mobile filters
    setIsMobileFilterOpen(false)
  }

  const cities = [...new Set(universities.map(u => u.city))].sort()
  const userUniId = user?.university?._id || user?.university || ''

  const displayUniName = selectedUni && !isAllSelected
    ? universities.find(u => u._id === selectedUni)?.name
    : !isAllSelected && !selectedCity && userUniId
    ? universities.find(u => u._id === userUniId)?.name
    : null

  const featuredListings = listings.filter(l => l.isFeatured)
  const regularListings = listings.filter(l => !l.isFeatured)

  const hasFilters = (selectedUni && !isAllSelected) || selectedCity || search || (category !== 'all')

  return (
    <div className="browse-root">
      <Navbar />

      {/* ── Hero ── */}
      <div className="browse-hero">
        <div className="browse-hero-inner">
          <p className="browse-eyebrow">Marketplace</p>
          <h1 className="browse-title">Browse Listings</h1>
          <p className="browse-subtitle">
            {displayUniName
              ? `Filtered — ${displayUniName}`
              : selectedCity
              ? `Filtered — ${selectedCity}`
              : `${listings.length} listing${listings.length !== 1 ? 's' : ''} available`}
          </p>
        </div>

        <div className="browse-search-wrap">
          <div className="search-input-wrapper">
            <span className="search-icon">⌕</span>
            <input
              className="search-input"
              type="text"
              placeholder="Search for books, electronics, furniture..."
              value={search}
              onChange={e => updateParam('search', e.target.value)}
            />
          </div>
        </div>
      </div>

      {/* ── Body ── */}
      <div className="browse-body">

        {/* Mobile Filter Toggle Button */}
        <button 
          className="mobile-filter-btn" 
          onClick={() => setIsMobileFilterOpen(!isMobileFilterOpen)}
        >
          {isMobileFilterOpen ? 'Close Filters ▴' : 'Filters & Categories ▾'}
        </button>

        {/* Sidebar */}
        <aside className={`sidebar ${isMobileFilterOpen ? 'open' : ''}`}>

          {/* Location */}
          <div className="sidebar-section">
            <div className="sidebar-label">Location</div>

            <button
              className={`sidebar-btn ${isAllSelected || (!selectedUni && !selectedCity && !userUniId) ? 'active' : ''}`}
              onClick={clearAll}
            >
              <span className="btn-icon">🌐</span> All universities
            </button>

            {userUniId && (
              <button
                className={`sidebar-btn ${!isAllSelected && selectedUni === userUniId ? 'active' : ''}`}
                onClick={() => updateParam('university', userUniId)}
              >
                <span className="btn-icon">🎓</span> My university
              </button>
            )}

            {cities.length > 0 && (
              <>
                <div className="divider-label">
                  <div className="divider-line" /><span>City</span><div className="divider-line" />
                </div>
                <select
                  className="sidebar-select"
                  value={selectedCity}
                  onChange={e => updateParam('city', e.target.value)}
                >
                  <option value="">All cities</option>
                  {cities.map(c => <option key={c} value={c}>{c}</option>)}
                </select>
              </>
            )}

            {universities.length > 0 && (
              <>
                <div className="divider-label">
                  <div className="divider-line" /><span>University</span><div className="divider-line" />
                </div>
                <select
                  className="sidebar-select"
                  value={isAllSelected ? '' : selectedUni}
                  onChange={e => updateParam('university', e.target.value)}
                >
                  <option value="">All universities</option>
                  {universities.map(u => (
                    <option key={u._id} value={u._id}>{u.name}</option>
                  ))}
                </select>
              </>
            )}
          </div>

          {/* Category */}
          <div className="sidebar-section">
            <div className="sidebar-label">Category</div>
            {CATEGORIES.map(cat => (
              <button
                key={cat}
                className={`sidebar-btn ${
                  (cat === 'all' && !searchParams.get('category')) || category === cat ? 'active' : ''
                }`}
                onClick={() => updateParam('category', cat === 'all' ? '' : cat)}
              >
                <span className="btn-icon">{CATEGORY_ICONS[cat]}</span>
                <span style={{ textTransform: 'capitalize' }}>{cat}</span>
              </button>
            ))}
          </div>

        </aside>

        {/* Main */}
        <main>
          <div className="results-header">
            <div>
              <div className="results-count">
                {loading ? 'Loading...' : `${listings.length} result${listings.length !== 1 ? 's' : ''}`}
              </div>
              <div className="results-meta">
                {isAllSelected
                  ? 'All universities'
                  : displayUniName
                  ? `From ${displayUniName}`
                  : selectedCity
                  ? `In ${selectedCity}`
                  : 'All locations'}
                {category !== 'all' && ` · ${category}`}
                {search && ` · "${search}"`}
              </div>
            </div>
            {hasFilters && (
              <button className="clear-btn" onClick={() => setSearchParams({})}>
                Clear all filters
              </button>
            )}
          </div>

          {loading ? (
            <div className="loading-state">
              <div className="loading-bar"><div className="loading-bar-inner" /></div>
              <span className="loading-text">Loading listings</span>
            </div>
          ) : listings.length === 0 ? (
            <div className="empty-state">
              <div className="empty-icon">◎</div>
              <div className="empty-title">No listings found</div>
              <div className="empty-text">Try adjusting your filters or search terms</div>
              <button className="clear-btn" onClick={() => setSearchParams({})}>Clear all filters</button>
            </div>
          ) : (
            <>
              {/* Featured */}
              {featuredListings.length > 0 && (
                <div className="featured-section">
                  <div className="featured-header">
                    <span className="featured-badge">★ Featured</span>
                    <div className="featured-line" />
                  </div>
                  <div className="featured-grid">
                    {featuredListings.map(listing => (
                      <Link key={listing._id} to={`/listings/${listing._id}`} className="featured-card">
                        <span className="featured-pin">Featured</span>
                        {listing.images?.[0] ? (
                          <img src={listing.images[0]} alt={listing.title} className="featured-img" />
                        ) : (
                          <div className="featured-img-placeholder">
                            {CATEGORY_ICONS[listing.category] || '◎'}
                          </div>
                        )}
                        <div className="featured-body">
                          <div className="featured-category">{listing.category}</div>
                          <div className="featured-title">{listing.title}</div>
                          <div className="featured-footer">
                            <span className="featured-price">EUR {listing.price.toLocaleString()}</span>
                            <span className="featured-location">{listing.university?.city || ''}</span>
                          </div>
                        </div>
                      </Link>
                    ))}
                  </div>
                </div>
              )}

              {/* Regular listings */}
              {regularListings.length > 0 && (
                <>
                  {featuredListings.length > 0 && (
                    <div className="section-title">All listings</div>
                  )}
                  <div className="listings-grid">
                    {regularListings.map(listing => (
                      <Link key={listing._id} to={`/listings/${listing._id}`} className="listing-card">
                        {listing.images?.[0] ? (
                          <img src={listing.images[0]} alt={listing.title} className="listing-img" />
                        ) : (
                          <div className="listing-img-placeholder">
                            {CATEGORY_ICONS[listing.category] || '◎'}
                          </div>
                        )}
                        <div className="listing-body">
                          <div className="listing-category-tag">{listing.category}</div>
                          <div className="listing-title">{listing.title}</div>
                          <div className="listing-footer">
                            <span className="listing-price">EUR {listing.price.toLocaleString()}</span>
                            <span className="listing-location">{listing.university?.city || ''}</span>
                          </div>
                        </div>
                      </Link>
                    ))}
                  </div>
                </>
              )}
            </>
          )}
        </main>

      </div>

      <footer className="browse-footer">
        © 2026 CAMPUSEXCHANGE — MADE FOR STUDENTS, BY STUDENTS
      </footer>
    </div>
  )
}