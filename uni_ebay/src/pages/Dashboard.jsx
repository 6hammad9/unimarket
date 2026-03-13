import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import Navbar from '../components/Navbar'
import { useAuth } from '../context/AuthContext'
import api from '../api/axios'

export default function Dashboard() {
  const { user, token } = useAuth()
  const [listings, setListings] = useState([])
  const [loading, setLoading] = useState(true)
  const [stats, setStats] = useState({ active: 0, sold: 0 })

  useEffect(() => {
    const fetchMyListings = async () => {
      try {
        const res = await api.get('/listings/my', {
          headers: { Authorization: `Bearer ${token}` }
        })
        setListings(res.data)
        setStats({
          active: res.data.filter(l => !l.sold).length,
          sold: res.data.filter(l => l.sold).length,
        })
      } catch (err) {
        console.error(err)
      } finally {
        setLoading(false)
      }
    }
    fetchMyListings()
  }, [token])

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this listing?')) return
    try {
      await api.delete(`/listings/${id}`, {
        headers: { Authorization: `Bearer ${token}` }
      })
      setListings(listings.filter(l => l._id !== id))
      setStats(prev => ({ ...prev, active: prev.active - 1 }))
    } catch (err) {
      console.error(err)
    }
  }

  const handleMarkSold = async (id) => {
    try {
      await api.put(`/listings/${id}/sold`, {}, {
        headers: { Authorization: `Bearer ${token}` }
      })
      setListings(listings.map(l => l._id === id ? { ...l, sold: true } : l))
      setStats(prev => ({ active: prev.active - 1, sold: prev.sold + 1 }))
    } catch (err) {
      console.error(err)
    }
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />

      <div className="max-w-5xl mx-auto px-6 py-10">

        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-semibold text-gray-900 mb-1">
            Welcome back, {user?.name?.split(' ')[0]} 👋
          </h1>
          <p className="text-gray-500 text-sm">{user?.email}</p>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mb-10">
          <div className="bg-white rounded-2xl border border-gray-100 p-5">
            <p className="text-xs text-gray-400 mb-1">Active listings</p>
            <p className="text-3xl font-semibold text-gray-900">{stats.active}</p>
          </div>
          <div className="bg-white rounded-2xl border border-gray-100 p-5">
            <p className="text-xs text-gray-400 mb-1">Items sold</p>
            <p className="text-3xl font-semibold text-gray-900">{stats.sold}</p>
          </div>
          <div className="bg-white rounded-2xl border border-gray-100 p-5">
            <p className="text-xs text-gray-400 mb-1">Total listings</p>
            <p className="text-3xl font-semibold text-gray-900">{listings.length}</p>
          </div>
        </div>

        {/* My listings */}
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-semibold text-gray-900">My listings</h2>
          <Link
            to="/create"
            className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition"
          >
            + New listing
          </Link>
        </div>

        {loading ? (
          <div className="text-center text-gray-400 py-20">Loading...</div>
        ) : listings.length === 0 ? (
          <div className="text-center py-20">
            <p className="text-gray-400 mb-4">You haven't posted anything yet.</p>
            <Link
              to="/create"
              className="bg-blue-600 hover:bg-blue-700 text-white px-5 py-2.5 rounded-lg text-sm font-medium transition"
            >
              Post your first listing
            </Link>
          </div>
        ) : (
          <div className="flex flex-col gap-4">
            {listings.map((listing) => (
              <div
                key={listing._id}
                className="bg-white rounded-2xl border border-gray-100 p-4 flex gap-4 items-center"
              >
                {/* Image */}
                <div className="w-20 h-20 bg-gray-100 rounded-xl overflow-hidden flex-shrink-0 flex items-center justify-center">
                  {listing.images?.[0] ? (
                    <img
                      src={listing.images[0]}
                      alt={listing.title}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <span className="text-gray-400 text-xs">No image</span>
                  )}
                </div>

                {/* Info */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <h3 className="font-medium text-gray-900 truncate">{listing.title}</h3>
                    {listing.sold && (
                      <span className="text-xs bg-red-100 text-red-500 px-2 py-0.5 rounded-full flex-shrink-0">
                        Sold
                      </span>
                    )}
                  </div>
                  <p className="text-blue-600 font-semibold text-sm mb-1">Rs {listing.price}</p>
                  <span className="text-xs bg-gray-100 text-gray-500 px-2 py-0.5 rounded-full capitalize">
                    {listing.category}
                  </span>
                </div>

                {/* Actions */}
                <div className="flex gap-2 flex-shrink-0">
                  <Link
                    to={`/listings/${listing._id}`}
                    className="text-xs bg-gray-100 hover:bg-gray-200 text-gray-600 px-3 py-1.5 rounded-lg transition"
                  >
                    View
                  </Link>
                  {!listing.sold && (
                    <button
                      onClick={() => handleMarkSold(listing._id)}
                      className="text-xs bg-green-50 hover:bg-green-100 text-green-600 px-3 py-1.5 rounded-lg transition"
                    >
                      Mark sold
                    </button>
                  )}
                  <button
                    onClick={() => handleDelete(listing._id)}
                    className="text-xs bg-red-50 hover:bg-red-100 text-red-500 px-3 py-1.5 rounded-lg transition"
                  >
                    Delete
                  </button>
                </div>
              </div>
            ))}
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