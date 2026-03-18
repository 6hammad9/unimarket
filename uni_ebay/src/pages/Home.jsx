import { useState, useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import Navbar from '../components/Navbar'
import { useAuth } from '../context/AuthContext'
import api from '../api/axios'
import './Home.css'

const CATEGORY_ICONS = {
  books: '📖',
  electronics: '⚡',
  clothing: '👔',
  furniture: '🪑',
  other: '◎',
}

const CATEGORIES = ['books', 'electronics', 'clothing', 'furniture', 'other']

export default function Home() {
  const { user } = useAuth()
  const navigate = useNavigate()
  const [listings, setListings] = useState([])
  const [stats, setStats] = useState({ total: 0, universities: 0 })
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchData = async () => {
      try {
        const res = await api.get('/listings')
        setListings(res.data)
        // Count unique universities
        const unis = new Set(res.data.map(l => l.university?._id).filter(Boolean))
        setStats({ total: res.data.length, universities: unis.size })
      } catch (err) {
        console.error(err)
      } finally {
        setLoading(false)
      }
    }
    fetchData()
  }, [])

  const featuredListings = listings.filter(l => l.isFeatured).slice(0, 3)
  const recentListings = listings.filter(l => !l.isFeatured).slice(0, 8)

  return (
    <div className="home-root">
      <Navbar />

      {/* ── Hero ── */}
      <section className="home-hero">
        <div className="home-hero-inner">
          <div className="home-hero-content">
            <div className="home-hero-eyebrow">
              <div className="home-hero-eyebrow-line" />
              <span>Student Marketplace</span>
            </div>

            <h1 className="home-hero-title">
              Buy & sell<br />
              <em>on campus,</em><br />
              effortlessly.
            </h1>

            <p className="home-hero-subtitle">
              A trusted marketplace built exclusively for university students.
              List your items, find great deals, connect with fellow students.
            </p>

            <div className="home-hero-actions">
              <Link to="/browse" className="btn-primary">
                Browse listings →
              </Link>
              {user ? (
                <Link to="/create" className="btn-outline">
                  Post an item
                </Link>
              ) : (
                <Link to="/register" className="btn-outline">
                  Join for free
                </Link>
              )}
            </div>
          </div>
        </div>

        {/* Stats — bottom right */}
        <div className="home-hero-stats">
          <div className="hero-stat">
            <div className="hero-stat-num">{stats.total}+</div>
            <div className="hero-stat-label">Active listings</div>
          </div>
          <div className="hero-stat">
            <div className="hero-stat-num">{stats.universities}+</div>
            <div className="hero-stat-label">Universities</div>
          </div>
        </div>

        {/* Category quick links */}
        <div className="home-hero-bottom">
          {CATEGORIES.map((cat) => (
            <Link
              key={cat}
              to={`/browse?category=${cat}`}
              className="hero-category-pill"
            >
              {CATEGORY_ICONS[cat]} {cat}
            </Link>
          ))}
        </div>
      </section>

      {/* ── How it works ── */}
      <section className="how-it-works">
        <div className="home-section">
          <div className="section-eyebrow">
            <div className="section-eyebrow-line" />
            <span>How it works</span>
          </div>
          <h2 className="section-title">Simple by design</h2>

          <div className="how-grid">
            {[
              { num: '1', title: 'Create an account', desc: 'Sign up with your email and verify in one click. Your university is set once — no repeating yourself.' },
              { num: '2', title: 'Post your listing', desc: 'Upload photos, set a price, pick a category. Your listing goes live instantly for students nearby.' },
              { num: '3', title: 'Get discovered', desc: 'Students at your university see your listing first. Reach exactly the right audience automatically.' },
              { num: '4', title: 'Connect & close', desc: 'Buyers see your phone number and reach out directly on WhatsApp. No middlemen, no delays.' },
            ].map(step => (
              <div key={step.num} className="how-item">
                <div className="how-num">{step.num}</div>
                <div className="how-title">{step.title}</div>
                <div className="how-desc">{step.desc}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Featured listings ── */}
      {featuredListings.length > 0 && (
        <section style={{ background: '#F8F7F4' }}>
          <div className="home-section">
            <div className="featured-row-header">
              <div>
                <div className="section-eyebrow">
                  <div className="section-eyebrow-line" />
                  <span>Featured</span>
                </div>
                <h2 className="section-title">Hand-picked <em>listings</em></h2>
              </div>
              <Link to="/browse" className="view-all-link">View all →</Link>
            </div>

            <div className="featured-row">
              {featuredListings.map(listing => (
                <Link key={listing._id} to={`/listings/${listing._id}`} className="home-listing-card featured-card-home">
                  {listing.images?.[0] ? (
                    <img src={listing.images[0]} alt={listing.title} className="home-card-img" />
                  ) : (
                    <div className="home-card-placeholder">
                      {CATEGORY_ICONS[listing.category] || '◎'}
                    </div>
                  )}
                  <div className="home-card-body">
                    <div className="home-card-top">
                      <span className="home-card-cat">{listing.category}</span>
                      <span className="home-card-featured-tag">★ Featured</span>
                    </div>
                    <div className="home-card-title">{listing.title}</div>
                    <div className="home-card-footer">
                      <span className="home-card-price">EUR {listing.price.toLocaleString()}</span>
                      <span className="home-card-meta">{listing.university?.city || ''}</span>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* ── Recent listings ── */}
      <section style={{ background: 'white', borderTop: '1px solid #E8E4DC' }}>
        <div className="home-section">
          <div className="featured-row-header">
            <div>
              <div className="section-eyebrow">
                <div className="section-eyebrow-line" />
                <span>Latest</span>
              </div>
              <h2 className="section-title">Recently <em>listed</em></h2>
            </div>
            <Link to="/browse" className="view-all-link">Browse all →</Link>
          </div>

          {loading ? (
            <div style={{ padding: '40px 0', textAlign: 'center' }}>
              <div style={{ width: 160, height: 2, background: '#E8E4DC', borderRadius: 2, overflow: 'hidden', margin: '0 auto' }}>
                <div style={{
                  height: '100%',
                  background: 'linear-gradient(to right, #0D3D3A, #2DD4BF)',
                  animation: 'loadingSlide 1.4s ease-in-out infinite',
                  borderRadius: 2
                }} />
              </div>
              <style>{`@keyframes loadingSlide { 0%{width:0%;margin-left:0%} 50%{width:55%;margin-left:22%} 100%{width:0%;margin-left:100%} }`}</style>
            </div>
          ) : recentListings.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '60px 0' }}>
              <p style={{ fontFamily: "'Playfair Display', serif", fontSize: 20, color: '#0D3D3A', marginBottom: 8 }}>No listings yet</p>
              <p style={{ fontSize: 13, color: '#AAA', marginBottom: 20 }}>Be the first to post something</p>
              <Link to="/create" className="btn-primary" style={{ display: 'inline-flex' }}>Post a listing →</Link>
            </div>
          ) : (
            <div className="recent-grid">
              {recentListings.map(listing => (
                <Link key={listing._id} to={`/listings/${listing._id}`} className="home-listing-card">
                  {listing.images?.[0] ? (
                    <img src={listing.images[0]} alt={listing.title} className="home-card-img" style={{ height: 160 }} />
                  ) : (
                    <div className="home-card-placeholder" style={{ height: 160 }}>
                      {CATEGORY_ICONS[listing.category] || '◎'}
                    </div>
                  )}
                  <div className="home-card-body">
                    <div className="home-card-top">
                      <span className="home-card-cat">{listing.category}</span>
                    </div>
                    <div className="home-card-title" style={{ fontSize: 13 }}>{listing.title}</div>
                    <div className="home-card-footer">
                      <span className="home-card-price" style={{ fontSize: 13 }}>EUR {listing.price.toLocaleString()}</span>
                      <span className="home-card-meta">{listing.university?.city || ''}</span>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* ── CTA ── */}
      {!user && (
        <section className="home-cta">
          <div className="home-cta-inner">
            <div className="home-cta-text">
              <div className="section-eyebrow">
                <div className="section-eyebrow-line" />
                <span style={{ color: '#2DD4BF' }}>Get started</span>
              </div>
              <h2 className="home-cta-title">
                Ready to buy<br />or <em>sell something?</em>
              </h2>
              <p className="home-cta-sub">
                Join thousands of students already using CampusExchange to buy, sell and connect on campus.
              </p>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 12, flexShrink: 0 }}>
              <Link to="/register" className="btn-primary">
                Create free account →
              </Link>
              <Link to="/browse" className="btn-outline" style={{ textAlign: 'center', justifyContent: 'center' }}>
                Browse first
              </Link>
            </div>
          </div>
        </section>
      )}

      {/* ── Footer ── */}
      <footer className="home-footer">
        <div className="home-footer-inner">
          <div className="home-footer-logo">
            Campus<span>Exchange</span>
          </div>
          <div className="home-footer-copy">
            © 2026 CampusExchange — Made for students, by students
          </div>
          <div className="home-footer-links">
            <Link to="/browse" className="home-footer-link">Browse</Link>
            <Link to="/create" className="home-footer-link">Sell</Link>
            <Link to="/contact" className="home-footer-link">Support</Link>
          </div>
        </div>
      </footer>
    </div>
  )
}