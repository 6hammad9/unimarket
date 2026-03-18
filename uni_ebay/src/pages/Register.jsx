import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import api from '../api/axios'
import './Auth.css'

const checkStrength = (password) => {
  const checks = {
    length:    password.length >= 8,
    uppercase: /[A-Z]/.test(password),
    lowercase: /[a-z]/.test(password),
    number:    /\d/.test(password),
    special:   /[@$!%*?&]/.test(password),
  }
  const passed = Object.values(checks).filter(Boolean).length
  return { checks, passed }
}

const getBarClass = (index, passed) => {
  if (index > passed) return ''
  if (passed <= 2) return 'weak'
  if (passed <= 3) return 'medium'
  return 'strong'
}

export default function Register() {
  const [form, setForm] = useState({ name: '', email: '', phone: '', password: '', confirmPassword: '', university: '' })
  const [universities, setUniversities] = useState([])
  const [error, setError] = useState('')
  const [success, setSuccess] = useState(false)
  const [loading, setLoading] = useState(false)
  const [countdown, setCountdown] = useState(0)
  const { checks, passed } = checkStrength(form.password)

  useEffect(() => {
    api.get('/universities').then(r => setUniversities(r.data)).catch(console.error)
  }, [])

  useEffect(() => {
    if (countdown <= 0) return
    const t = setTimeout(() => setCountdown(c => c - 1), 1000)
    return () => clearTimeout(t)
  }, [countdown])

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    if (form.password !== form.confirmPassword) return setError('Passwords do not match')
    if (passed < 5) return setError('Please meet all password requirements')
    setLoading(true)
    try {
      await api.post('/auth/register', {
        name: form.name,
        email: form.email,
        phone: form.phone,
        password: form.password,
        university: form.university || null
      })
      setSuccess(true)
    } catch (err) {
      const msg = err.response?.data?.message || 'Something went wrong'
      const secondsLeft = err.response?.data?.secondsLeft
      if (secondsLeft) setCountdown(secondsLeft)
      setError(msg)
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
            <span>Join today</span>
          </div>
          <h1 className="auth-left-title">
            Buy & sell<br />on campus,<br /><em>effortlessly.</em>
          </h1>
          <p className="auth-left-sub">
            Create a free account and start buying or selling
            within your university community in minutes.
          </p>

          <div className="auth-features">
            {[
              { icon: '✓', text: 'Free to join — always' },
              { icon: '🎓', text: 'Listings filtered to your university' },
              { icon: '⚡', text: 'Go live in under 2 minutes' },
              { icon: '🔒', text: 'Email verified accounts only' },
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

          {success ? (
            <div className="auth-success">
              <div className="auth-success-icon">✓</div>
              <div className="auth-success-title">Check your email</div>
              <p className="auth-success-sub">
                We sent a verification link to <strong>{form.email}</strong>.
                Click the link to activate your account. Expires in 24 hours.
              </p>
              <Link to="/login" style={{ fontSize: 13, color: '#2DD4BF' }}>
                Back to login →
              </Link>
            </div>
          ) : (
            <>
              <h2 className="auth-form-title">Create account</h2>
              <p className="auth-form-sub">Join your campus marketplace</p>

              {error && (
                <div className="auth-error">
                  {error}
                  {countdown > 0 && (
                    <span className="auth-countdown">Resend available in {countdown}s</span>
                  )}
                </div>
              )}

              <form onSubmit={handleSubmit}>
                <div className="auth-field">
                  <label className="auth-label">Full name</label>
                  <input
                    className="auth-input"
                    type="text"
                    placeholder="Ahmed Khan"
                    value={form.name}
                    onChange={e => setForm({ ...form, name: e.target.value })}
                    required
                  />
                </div>

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
                  <label className="auth-label">Phone</label>
                  <input
                    className="auth-input"
                    type="tel"
                    placeholder="03001234567"
                    value={form.phone}
                    onChange={e => setForm({ ...form, phone: e.target.value })}
                    required
                  />
                </div>

                <div className="auth-field">
                  <label className="auth-label">University <span style={{ color: '#B0CECE', fontWeight: 300, textTransform: 'none', letterSpacing: 0 }}>(optional)</span></label>
                  <select
                    className="auth-select"
                    value={form.university}
                    onChange={e => setForm({ ...form, university: e.target.value })}
                  >
                    <option value="">Select your university</option>
                    {universities.map(u => (
                      <option key={u._id} value={u._id}>
                        {u.name} — {u.city}
                      </option>
                    ))}
                  </select>
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
                  {form.password.length > 0 && (
                    <>
                      <div className="auth-strength-bars">
                        {[1,2,3,4,5].map(i => (
                          <div key={i} className={`auth-strength-bar ${getBarClass(i, passed)}`} />
                        ))}
                      </div>
                      <div className="auth-requirements">
                        {[
                          { key: 'length',    label: 'At least 8 characters' },
                          { key: 'uppercase', label: 'One uppercase letter' },
                          { key: 'lowercase', label: 'One lowercase letter' },
                          { key: 'number',    label: 'One number' },
                          { key: 'special',   label: 'One special character (@$!%*?&)' },
                        ].map(({ key, label }) => (
                          <div key={key} className={`auth-req ${checks[key] ? 'met' : ''}`}>
                            <span className="auth-req-dot">{checks[key] ? '✓' : '○'}</span>
                            {label}
                          </div>
                        ))}
                      </div>
                    </>
                  )}
                </div>

                <div className="auth-field">
                  <label className="auth-label">Confirm password</label>
                  <input
                    className="auth-input"
                    type="password"
                    placeholder="••••••••"
                    value={form.confirmPassword}
                    onChange={e => setForm({ ...form, confirmPassword: e.target.value })}
                    required
                  />
                </div>

                <button
                  type="submit"
                  className="auth-submit"
                  disabled={loading || countdown > 0}
                >
                  {loading ? 'Creating account...' : countdown > 0 ? `Wait ${countdown}s` : 'Create account →'}
                </button>
              </form>

              <div className="auth-switch">
                Already have an account?{' '}
                <Link to="/login">Sign in</Link>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  )
}