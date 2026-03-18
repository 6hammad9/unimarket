import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import Navbar from '../components/Navbar'
import { useAuth } from '../context/AuthContext'
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

export default function Profile() {
  const { user, token, updateUser } = useAuth()
  const [universities, setUniversities] = useState([])
  const [profile, setProfile] = useState({ name: '', phone: '', university: '' })
  const [passwords, setPasswords] = useState({ currentPassword: '', newPassword: '', confirmPassword: '' })
  const [profileMsg, setProfileMsg] = useState({ type: '', text: '' })
  const [passwordMsg, setPasswordMsg] = useState({ type: '', text: '' })
  const [profileLoading, setProfileLoading] = useState(false)
  const [passwordLoading, setPasswordLoading] = useState(false)
  const [tab, setTab] = useState('profile')

  const headers = { Authorization: `Bearer ${token}` }
  const { checks, passed } = checkStrength(passwords.newPassword)

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [profileRes, uniRes] = await Promise.all([
          api.get('/users/profile', { headers }),
          api.get('/universities')
        ])
        const u = profileRes.data
        setProfile({
          name: u.name || '',
          phone: u.phone || '',
          university: u.university?._id || u.university || ''
        })
        setUniversities(uniRes.data)
      } catch (err) {
        console.error(err)
      }
    }
    fetchData()
  }, [])

  const handleProfileSave = async (e) => {
    e.preventDefault()
    setProfileMsg({ type: '', text: '' })
    setProfileLoading(true)
    try {
      const res = await api.put('/users/profile', profile, { headers })
      setProfileMsg({ type: 'success', text: 'Profile updated successfully' })
      // Update auth context so navbar reflects new name
      updateUser({
        ...user,
        name: res.data.user.name,
        phone: res.data.user.phone,
        university: res.data.user.university
      })
    } catch (err) {
      setProfileMsg({ type: 'error', text: err.response?.data?.message || 'Could not update profile' })
    } finally {
      setProfileLoading(false)
    }
  }

  const handlePasswordSave = async (e) => {
    e.preventDefault()
    setPasswordMsg({ type: '', text: '' })
    if (passwords.newPassword !== passwords.confirmPassword) {
      return setPasswordMsg({ type: 'error', text: 'Passwords do not match' })
    }
    if (passed < 5) {
      return setPasswordMsg({ type: 'error', text: 'Please meet all password requirements' })
    }
    setPasswordLoading(true)
    try {
      await api.put('/users/change-password', {
        currentPassword: passwords.currentPassword,
        newPassword: passwords.newPassword
      }, { headers })
      setPasswordMsg({ type: 'success', text: 'Password changed successfully' })
      setPasswords({ currentPassword: '', newPassword: '', confirmPassword: '' })
    } catch (err) {
      setPasswordMsg({ type: 'error', text: err.response?.data?.message || 'Could not change password' })
    } finally {
      setPasswordLoading(false)
    }
  }

  return (
    <div style={{ fontFamily: "'DM Sans', sans-serif", background: '#F4FAFA', minHeight: '100vh' }}>
      <style>{`@import url('https://fonts.googleapis.com/css2?family=Playfair+Display:ital,wght@0,500;1,400&family=DM+Sans:opsz,wght@9..40,300;9..40,400;9..40,500&display=swap');`}</style>
      <Navbar />

      {/* Banner */}
      <div style={{ background: '#0D3D3A', padding: '36px 0 32px', position: 'relative', overflow: 'hidden' }}>
        <div style={{
          position: 'absolute', inset: 0,
          background: 'repeating-linear-gradient(90deg,transparent,transparent 80px,rgba(255,255,255,0.015) 80px,rgba(255,255,255,0.015) 81px),repeating-linear-gradient(0deg,transparent,transparent 80px,rgba(255,255,255,0.015) 80px,rgba(255,255,255,0.015) 81px)'
        }} />
        <div style={{ maxWidth: 760, margin: '0 auto', padding: '0 32px', position: 'relative', zIndex: 1, display: 'flex', alignItems: 'center', gap: 20 }}>
          <div style={{
            width: 56, height: 56, borderRadius: '50%',
            background: 'linear-gradient(135deg, #2DD4BF, #0D9488)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontFamily: "'Playfair Display', serif", fontSize: 24, fontWeight: 500, color: 'white',
            boxShadow: '0 4px 16px rgba(45,212,191,0.35)', flexShrink: 0
          }}>
            {user?.name?.[0]?.toUpperCase()}
          </div>
          <div>
            <div style={{ fontSize: 10, fontWeight: 500, letterSpacing: '0.16em', textTransform: 'uppercase', color: '#2DD4BF', marginBottom: 4 }}>
              Profile Settings
            </div>
            <div style={{ fontFamily: "'Playfair Display', serif", fontSize: 22, fontWeight: 500, color: 'white' }}>
              {user?.name}
            </div>
            <div style={{ fontSize: 12, color: 'rgba(255,255,255,0.4)', marginTop: 2 }}>{user?.email}</div>
          </div>
        </div>
      </div>

      <div style={{ maxWidth: 760, margin: '0 auto', padding: '32px 32px 80px' }}>

        {/* Tabs */}
        <div style={{ display: 'flex', gap: 4, marginBottom: 28, background: 'white', padding: 4, borderRadius: 12, border: '1px solid #D4EEEB', width: 'fit-content' }}>
          {['profile', 'password'].map(t => (
            <button
              key={t}
              onClick={() => setTab(t)}
              style={{
                padding: '8px 20px', borderRadius: 8, border: 'none', cursor: 'pointer',
                fontFamily: "'DM Sans', sans-serif", fontSize: 13, fontWeight: 500,
                textTransform: 'capitalize', transition: 'all 0.15s',
                background: tab === t ? '#0D3D3A' : 'transparent',
                color: tab === t ? 'white' : '#6B8F8D'
              }}
            >
              {t === 'profile' ? '👤 Profile' : '🔒 Password'}
            </button>
          ))}
        </div>

        {/* Profile Tab */}
        {tab === 'profile' && (
          <div style={{
            background: 'white', borderRadius: 20, padding: '28px 28px',
            border: '1px solid rgba(45,212,191,0.12)',
            boxShadow: '0 2px 8px rgba(13,61,58,0.04), 0 8px 28px rgba(13,61,58,0.06)'
          }}>
            <h2 style={{ fontFamily: "'Playfair Display', serif", fontSize: 20, fontWeight: 500, color: '#0D3D3A', margin: '0 0 20px' }}>
              Personal information
            </h2>

            {profileMsg.text && (
              <div style={{
                padding: '12px 14px', borderRadius: 10, marginBottom: 20, fontSize: 13,
                background: profileMsg.type === 'success' ? '#EDF7F6' : '#FEF2F2',
                border: `1px solid ${profileMsg.type === 'success' ? 'rgba(45,212,191,0.3)' : 'rgba(239,68,68,0.2)'}`,
                color: profileMsg.type === 'success' ? '#0D9488' : '#EF4444'
              }}>
                {profileMsg.text}
              </div>
            )}

            <form onSubmit={handleProfileSave} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
              <div className="auth-field">
                <label className="auth-label">Full name</label>
                <input
                  className="auth-input"
                  type="text"
                  value={profile.name}
                  onChange={e => setProfile({ ...profile, name: e.target.value })}
                  required
                />
              </div>

              <div className="auth-field">
                <label className="auth-label">Email</label>
                <input
                  className="auth-input"
                  type="email"
                  value={user?.email}
                  disabled
                  style={{ opacity: 0.5, cursor: 'not-allowed' }}
                />
                <p style={{ fontSize: 11, color: '#9BBAB8', marginTop: 4 }}>Email cannot be changed</p>
              </div>

              <div className="auth-field">
                <label className="auth-label">Phone number</label>
                <input
                  className="auth-input"
                  type="tel"
                  value={profile.phone}
                  onChange={e => setProfile({ ...profile, phone: e.target.value })}
                  required
                />
              </div>

              <div className="auth-field">
                <label className="auth-label">University</label>
                <select
                  className="auth-select"
                  value={profile.university}
                  onChange={e => setProfile({ ...profile, university: e.target.value })}
                >
                  <option value="">No university selected</option>
                  {universities.map(u => (
                    <option key={u._id} value={u._id}>
                      {u.name} — {u.city}
                    </option>
                  ))}
                </select>
              </div>

              <button
                type="submit"
                disabled={profileLoading}
                style={{
                  padding: '12px', background: '#0D3D3A', color: 'white',
                  fontFamily: "'DM Sans', sans-serif", fontSize: 14, fontWeight: 500,
                  border: 'none', borderRadius: 10, cursor: profileLoading ? 'not-allowed' : 'pointer',
                  opacity: profileLoading ? 0.5 : 1, transition: 'all 0.2s', marginTop: 4
                }}
              >
                {profileLoading ? 'Saving...' : 'Save changes →'}
              </button>
            </form>
          </div>
        )}

        {/* Password Tab */}
        {tab === 'password' && (
          <div style={{
            background: 'white', borderRadius: 20, padding: '28px 28px',
            border: '1px solid rgba(45,212,191,0.12)',
            boxShadow: '0 2px 8px rgba(13,61,58,0.04), 0 8px 28px rgba(13,61,58,0.06)'
          }}>
            <h2 style={{ fontFamily: "'Playfair Display', serif", fontSize: 20, fontWeight: 500, color: '#0D3D3A', margin: '0 0 20px' }}>
              Change password
            </h2>

            {passwordMsg.text && (
              <div style={{
                padding: '12px 14px', borderRadius: 10, marginBottom: 20, fontSize: 13,
                background: passwordMsg.type === 'success' ? '#EDF7F6' : '#FEF2F2',
                border: `1px solid ${passwordMsg.type === 'success' ? 'rgba(45,212,191,0.3)' : 'rgba(239,68,68,0.2)'}`,
                color: passwordMsg.type === 'success' ? '#0D9488' : '#EF4444'
              }}>
                {passwordMsg.text}
              </div>
            )}

            <form onSubmit={handlePasswordSave} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
              <div className="auth-field">
                <label className="auth-label">Current password</label>
                <input
                  className="auth-input"
                  type="password"
                  placeholder="••••••••"
                  value={passwords.currentPassword}
                  onChange={e => setPasswords({ ...passwords, currentPassword: e.target.value })}
                  required
                />
              </div>

              <div className="auth-field">
                <label className="auth-label">New password</label>
                <input
                  className="auth-input"
                  type="password"
                  placeholder="••••••••"
                  value={passwords.newPassword}
                  onChange={e => setPasswords({ ...passwords, newPassword: e.target.value })}
                  required
                />
                {passwords.newPassword.length > 0 && (
                  <>
                    <div className="auth-strength-bars">
                      {[1,2,3,4,5].map(i => (
                        <div key={i} className={`auth-strength-bar ${
                          i > passed ? '' : passed <= 2 ? 'weak' : passed <= 3 ? 'medium' : 'strong'
                        }`} />
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
                <label className="auth-label">Confirm new password</label>
                <input
                  className="auth-input"
                  type="password"
                  placeholder="••••••••"
                  value={passwords.confirmPassword}
                  onChange={e => setPasswords({ ...passwords, confirmPassword: e.target.value })}
                  required
                />
              </div>

              <button
                type="submit"
                disabled={passwordLoading}
                style={{
                  padding: '12px', background: '#0D3D3A', color: 'white',
                  fontFamily: "'DM Sans', sans-serif", fontSize: 14, fontWeight: 500,
                  border: 'none', borderRadius: 10, cursor: passwordLoading ? 'not-allowed' : 'pointer',
                  opacity: passwordLoading ? 0.5 : 1, transition: 'all 0.2s', marginTop: 4
                }}
              >
                {passwordLoading ? 'Changing...' : 'Change password →'}
              </button>
            </form>
          </div>
        )}

        {/* Quick links */}
        <div style={{ marginTop: 20, display: 'flex', gap: 12 }}>
          <Link to="/dashboard" style={{ fontSize: 12, color: '#9BBAB8', textDecoration: 'none', display: 'flex', alignItems: 'center', gap: 4 }}>
            ← Back to dashboard
          </Link>
          <span style={{ color: '#D4EEEB' }}>·</span>
          <Link to="/contact" style={{ fontSize: 12, color: '#9BBAB8', textDecoration: 'none' }}>
            Need help? Contact support
          </Link>
        </div>

      </div>

      <footer style={{ borderTop: '1px solid #D4EEEB', padding: '28px 32px', textAlign: 'center', fontSize: 11, color: '#9BBAB8', letterSpacing: '0.06em', background: '#EDF7F6' }}>
        © 2026 CAMPUSEXCHANGE — MADE FOR STUDENTS, BY STUDENTS
      </footer>
    </div>
  )
}