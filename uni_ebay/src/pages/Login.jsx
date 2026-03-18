import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import api from '../api/axios'
import './Auth.css'

export default function Login() {
  const { login } = useAuth()
  const navigate = useNavigate()
  const [form, setForm] = useState({ email: '', password: '' })
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    setLoading(true)
    try {
      const res = await api.post('/auth/login', form)
      login(res.data.token, res.data.user)
      navigate('/')
    } catch (err) {
      setError(err.response?.data?.message || 'Invalid credentials')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="auth-root">

      {/* Left panel */}
      <div className="auth-left">
        <Link to="/" className="auth-left-logo">
          Campus<span>Exchange</span>
        </Link>

        <div className="auth-left-content">
          <div className="auth-left-eyebrow">
            <div className="auth-left-eyebrow-line" />
            <span>Welcome back</span>
          </div>
          <h1 className="auth-left-title">
            Your campus<br /><em>marketplace</em><br />awaits.
          </h1>
          <p className="auth-left-sub">
            Log in to browse listings, contact sellers,
            and manage everything you're buying or selling.
          </p>

          <div className="auth-features">
            {[
              { icon: '🎓', text: 'University-filtered listings' },
              { icon: '📞', text: 'Direct contact with sellers' },
              { icon: '🔒', text: 'Verified student accounts only' },
            ].map(f => (
              <div key={f.text} className="auth-feature">
                <div className="auth-feature-dot">{f.icon}</div>
                <span className="auth-feature-text">{f.text}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="auth-left-footer">
          © 2026 CAMPUSEXCHANGE
        </div>
      </div>

      {/* Right panel */}
      <div className="auth-right">
        <div className="auth-form-wrap">
          <h2 className="auth-form-title">Sign in</h2>
          <p className="auth-form-sub">Enter your credentials to continue</p>

          {error && <div className="auth-error">{error}</div>}

          <form onSubmit={handleSubmit}>
            <div className="auth-field">
              <label className="auth-label">Email</label>
              <input
                className="auth-input"
                type="email"
                placeholder="you@gmail.com"
                value={form.email}
                onChange={e => setForm({ ...form, email: e.target.value })}
                required
              />
            </div>

            <div className="auth-field">
              <label className="auth-label">Password</label>
              <input
                className="auth-input"
                type="password"
                placeholder="••••••••"
                value={form.password}
                onChange={e => setForm({ ...form, password: e.target.value })}
                required
              />
            </div>

            <div className="auth-forgot">
              <Link to="/forgot-password">Forgot password?</Link>
            </div>

            <button type="submit" className="auth-submit" disabled={loading}>
              {loading ? 'Signing in...' : 'Sign in →'}
            </button>
          </form>

          <div className="auth-switch">
            Don't have an account?{' '}
            <Link to="/register">Register for free</Link>
          </div>
        </div>
      </div>

    </div>
  )
}