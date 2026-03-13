import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import api from '../api/axios'

const checkStrength = (password) => {
  const checks = {
    length: password.length >= 8,
    uppercase: /[A-Z]/.test(password),
    lowercase: /[a-z]/.test(password),
    number: /\d/.test(password),
    special: /[@$!%*?&]/.test(password),
  }
  const passed = Object.values(checks).filter(Boolean).length
  return { checks, passed }
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
    const fetchUniversities = async () => {
      try {
        const res = await api.get('/universities')
        setUniversities(res.data)
      } catch (err) {
        console.error(err)
      }
    }
    fetchUniversities()
  }, [])

  useEffect(() => {
    if (countdown <= 0) return
    const timer = setTimeout(() => setCountdown(countdown - 1), 1000)
    return () => clearTimeout(timer)
  }, [countdown])

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value })
  }

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

  if (success) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="bg-white p-8 rounded-2xl shadow-sm w-full max-w-md text-center">
          <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <span className="text-green-600 text-2xl">✓</span>
          </div>
          <h1 className="text-2xl font-medium mb-2">Check your email</h1>
          <p className="text-gray-500 text-sm mb-6">
            We sent a verification link to <strong>{form.email}</strong>. Click the link to activate your account.
          </p>
          <Link to="/login" className="text-blue-600 hover:underline text-sm">Back to login</Link>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="bg-white p-8 rounded-2xl shadow-sm w-full max-w-md">
        <h1 className="text-2xl font-medium mb-1">Create an account</h1>
        <p className="text-gray-500 text-sm mb-6">Sign up to buy and sell on campus</p>

        {error && (
          <div className="bg-red-50 text-red-600 text-sm px-4 py-3 rounded-lg mb-4">
            {error}
            {countdown > 0 && <span className="block mt-1 font-medium">Resend available in {countdown}s</span>}
          </div>
        )}

        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <div>
            <label className="text-sm font-medium text-gray-700 mb-1 block">Full name</label>
            <input
              type="text" name="name" value={form.name} onChange={handleChange}
              placeholder="Ahmed Khan" required
              className="w-full border border-gray-200 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div>
            <label className="text-sm font-medium text-gray-700 mb-1 block">Email</label>
            <input
              type="email" name="email" value={form.email} onChange={handleChange}
              placeholder="you@gmail.com" required
              className="w-full border border-gray-200 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div>
            <label className="text-sm font-medium text-gray-700 mb-1 block">Phone number</label>
            <input
              type="tel" name="phone" value={form.phone} onChange={handleChange}
              placeholder="03001234567" required
              className="w-full border border-gray-200 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div>
            <label className="text-sm font-medium text-gray-700 mb-1 block">
              University <span className="text-gray-400 font-normal">(optional)</span>
            </label>
            <select
              name="university" value={form.university} onChange={handleChange}
              className="w-full border border-gray-200 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
            >
              <option value="">Select your university</option>
              {universities.map(uni => (
                <option key={uni._id} value={uni._id}>
                  {uni.name} — {uni.city}, {uni.country}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="text-sm font-medium text-gray-700 mb-1 block">Password</label>
            <input
              type="password" name="password" value={form.password} onChange={handleChange}
              placeholder="••••••••" required
              className="w-full border border-gray-200 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            {form.password.length > 0 && (
              <>
                <div className="mt-2 flex gap-1">
                  {[1,2,3,4,5].map(i => (
                    <div key={i} className={`h-1 flex-1 rounded-full transition-all ${
                      passed >= i ? passed <= 2 ? 'bg-red-400' : passed <= 3 ? 'bg-yellow-400' : 'bg-green-400' : 'bg-gray-200'
                    }`} />
                  ))}
                </div>
                <ul className="mt-2 flex flex-col gap-1">
                  {[
                    { key: 'length', label: 'At least 8 characters' },
                    { key: 'uppercase', label: 'One uppercase letter' },
                    { key: 'lowercase', label: 'One lowercase letter' },
                    { key: 'number', label: 'One number' },
                    { key: 'special', label: 'One special character (@$!%*?&)' },
                  ].map(({ key, label }) => (
                    <li key={key} className={`text-xs flex items-center gap-1.5 ${checks[key] ? 'text-green-600' : 'text-gray-400'}`}>
                      <span>{checks[key] ? '✓' : '○'}</span> {label}
                    </li>
                  ))}
                </ul>
              </>
            )}
          </div>

          <div>
            <label className="text-sm font-medium text-gray-700 mb-1 block">Confirm password</label>
            <input
              type="password" name="confirmPassword" value={form.confirmPassword} onChange={handleChange}
              placeholder="••••••••" required
              className="w-full border border-gray-200 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <button
            type="submit" disabled={loading || countdown > 0}
            className="bg-blue-600 hover:bg-blue-700 text-white font-medium py-2.5 rounded-lg text-sm transition disabled:opacity-50"
          >
            {loading ? 'Creating account...' : countdown > 0 ? `Wait ${countdown}s` : 'Create account'}
          </button>
        </form>

        <p className="text-sm text-center text-gray-500 mt-6">
          Already have an account?{' '}
          <Link to="/login" className="text-blue-600 hover:underline">Sign in</Link>
        </p>
      </div>
    </div>
  )
}