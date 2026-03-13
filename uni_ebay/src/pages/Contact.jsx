import { useState } from 'react'
import { Link } from 'react-router-dom'
import Navbar from '../components/Navbar'
import { useAuth } from '../context/AuthContext'
import api from '../api/axios'

export default function Contact() {
  const { token } = useAuth()
  const [form, setForm] = useState({ subject: '', message: '' })
  const [loading, setLoading] = useState(false)
  const [success, setSuccess] = useState(false)
  const [error, setError] = useState('')

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    setLoading(true)
    try {
      await api.post('/messages', form, {
        headers: { Authorization: `Bearer ${token}` }
      })
      setSuccess(true)
      setForm({ subject: '', message: '' })
    } catch (err) {
      setError(err.response?.data?.message || 'Could not send message')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />

      <div className="max-w-xl mx-auto px-6 py-16">
        <h1 className="text-3xl font-semibold text-gray-900 mb-2">Contact support</h1>
        <p className="text-gray-500 text-sm mb-8">
          Have a question or request? Send us a message and we'll get back to you.
        </p>

        {success ? (
          <div className="bg-white rounded-2xl border border-gray-100 p-8 text-center">
            <div className="w-14 h-14 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <span className="text-green-600 text-2xl">✓</span>
            </div>
            <h2 className="text-lg font-medium text-gray-900 mb-2">Message sent!</h2>
            <p className="text-gray-500 text-sm mb-6">
              We've received your message and will look into it shortly.
            </p>
            <div className="flex gap-3 justify-center">
              <button
                onClick={() => setSuccess(false)}
                className="text-sm text-blue-600 hover:underline"
              >
                Send another message
              </button>
              <span className="text-gray-300">·</span>
              <Link to="/" className="text-sm text-blue-600 hover:underline">
                Back to home
              </Link>
            </div>
          </div>
        ) : (
          <div className="bg-white rounded-2xl border border-gray-100 p-6">
            {error && (
              <div className="bg-red-50 text-red-600 text-sm px-4 py-3 rounded-lg mb-4">
                {error}
              </div>
            )}

            <form onSubmit={handleSubmit} className="flex flex-col gap-4">
              <div>
                <label className="text-sm font-medium text-gray-700 mb-1 block">Subject</label>
                <input
                  type="text"
                  value={form.subject}
                  onChange={e => setForm({ ...form, subject: e.target.value })}
                  placeholder="e.g. Issue with my listing"
                  required
                  className="w-full border border-gray-200 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="text-sm font-medium text-gray-700 mb-1 block">Message</label>
                <textarea
                  value={form.message}
                  onChange={e => setForm({ ...form, message: e.target.value })}
                  placeholder="Describe your issue or request in detail..."
                  required
                  rows={6}
                  className="w-full border border-gray-200 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
                />
              </div>

              <button
                type="submit"
                disabled={loading}
                className="bg-blue-600 hover:bg-blue-700 text-white font-medium py-2.5 rounded-lg text-sm transition disabled:opacity-50"
              >
                {loading ? 'Sending...' : 'Send message'}
              </button>
            </form>
          </div>
        )}
      </div>

      <footer className="border-t border-gray-100 mt-20">
        <div className="max-w-6xl mx-auto px-6 py-8 text-center text-sm text-gray-400">
          © 2026 CampusExchange. Made for students, by students.
        </div>
      </footer>
    </div>
  )
}