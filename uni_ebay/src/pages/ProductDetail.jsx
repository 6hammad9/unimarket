import { useState, useEffect } from 'react'
import { useParams, useNavigate, Link } from 'react-router-dom'
import Navbar from '../components/Navbar'
import { useAuth } from '../context/AuthContext'
import api from '../api/axios'

export default function ProductDetail() {
  const { id } = useParams()
  const { user, token } = useAuth()
  const navigate = useNavigate()

  const [listing, setListing] = useState(null)
  const [loading, setLoading] = useState(true)
  const [activeImage, setActiveImage] = useState(0)
  const [markingSOld, setMarkingSold] = useState(false)
  const [deleting, setDeleting] = useState(false)

  useEffect(() => {
    const fetchListing = async () => {
      try {
        const res = await api.get(`/listings/${id}`)
        setListing(res.data)
      } catch (err) {
        console.error(err)
      } finally {
        setLoading(false)
      }
    }
    fetchListing()
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
    if (!window.confirm('Are you sure you want to delete this listing?')) return
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
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      <div className="flex items-center justify-center py-32">
        <div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin" />
      </div>
    </div>
  )

  if (!listing) return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      <div className="text-center py-32">
        <p className="text-gray-400 text-lg mb-4">Listing not found</p>
        <Link to="/browse" className="text-blue-600 hover:underline text-sm">← Back to browse</Link>
      </div>
    </div>
  )

  const isOwner = user?.id === listing.seller?._id

  const timeAgo = (date) => {
    const seconds = Math.floor((new Date() - new Date(date)) / 1000)
    if (seconds < 60) return 'just now'
    if (seconds < 3600) return `${Math.floor(seconds / 60)}m ago`
    if (seconds < 86400) return `${Math.floor(seconds / 3600)}h ago`
    return `${Math.floor(seconds / 86400)}d ago`
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />

      <div className="max-w-5xl mx-auto px-6 py-10">

        {/* Back */}
        <Link to="/browse" className="text-sm text-blue-600 hover:underline mb-6 inline-block">
          ← Back to browse
        </Link>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-10">

          {/* Images */}
          <div>
            <div className="bg-gray-100 rounded-2xl overflow-hidden aspect-square flex items-center justify-center mb-3 relative">
              {listing.sold && (
                <div className="absolute inset-0 bg-black/40 flex items-center justify-center z-10 rounded-2xl">
                  <span className="bg-red-500 text-white text-lg font-semibold px-6 py-2 rounded-full rotate-[-15deg]">
                    SOLD
                  </span>
                </div>
              )}
              {listing.images?.[activeImage] ? (
                <img
                  src={listing.images[activeImage]}
                  alt={listing.title}
                  className="w-full h-full object-cover"
                />
              ) : (
                <span className="text-gray-300 text-sm">No image</span>
              )}
            </div>
            {listing.images?.length > 1 && (
              <div className="flex gap-2 flex-wrap">
                {listing.images.map((img, i) => (
                  <button
                    key={i}
                    onClick={() => setActiveImage(i)}
                    className={`w-16 h-16 rounded-xl overflow-hidden border-2 transition ${
                      activeImage === i ? 'border-blue-500' : 'border-transparent opacity-60 hover:opacity-100'
                    }`}
                  >
                    <img src={img} alt="" className="w-full h-full object-cover" />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Details */}
          <div className="flex flex-col gap-4">

            {/* Title + price */}
            <div>
              <div className="flex items-start justify-between gap-3 mb-2">
                <h1 className="text-2xl font-semibold text-gray-900 leading-tight">{listing.title}</h1>
                <span className="text-xs bg-gray-100 text-gray-500 px-3 py-1 rounded-full capitalize flex-shrink-0 mt-1">
                  {listing.category}
                </span>
              </div>
              <p className="text-3xl font-bold text-blue-600">Rs {listing.price.toLocaleString()}</p>
            </div>

            {/* Meta info */}
            <div className="flex items-center gap-3 text-xs text-gray-400 flex-wrap">
              {listing.university && (
                <span className="flex items-center gap-1">
                  🎓 {listing.university.name}
                </span>
              )}
              {listing.university?.city && (
                <span className="flex items-center gap-1">
                  📍 {listing.university.city}
                </span>
              )}
              <span>🕐 {timeAgo(listing.createdAt)}</span>
            </div>

            {/* Description */}
            <div className="bg-white rounded-xl border border-gray-100 p-4">
              <p className="text-xs text-gray-400 mb-2 font-medium uppercase tracking-wide">Description</p>
              <p className="text-gray-600 text-sm leading-relaxed whitespace-pre-line">{listing.description}</p>
            </div>

            {/* Seller info */}
            <div className="bg-white rounded-xl border border-gray-100 p-4">
              <p className="text-xs text-gray-400 mb-2 font-medium uppercase tracking-wide">Listed by</p>
              <p className="font-medium text-gray-900">{listing.seller?.name}</p>
              {listing.university?.city && (
                <p className="text-xs text-gray-400 mt-0.5">{listing.university.city}</p>
              )}
            </div>

            {/* Owner actions */}
            {isOwner && (
              <div className="bg-blue-50 rounded-xl border border-blue-100 p-4">
                <p className="text-xs text-blue-500 font-medium mb-3 uppercase tracking-wide">Your listing</p>
                <div className="flex gap-2">
                  {!listing.sold && (
                    <button
                      onClick={handleMarkSold}
                      disabled={markingSOld}
                      className="flex-1 bg-green-600 hover:bg-green-700 text-white text-sm font-medium py-2 rounded-lg transition disabled:opacity-50"
                    >
                      {markingSOld ? 'Updating...' : '✓ Mark as sold'}
                    </button>
                  )}
                  <button
                    onClick={handleDelete}
                    disabled={deleting}
                    className="flex-1 bg-red-50 hover:bg-red-100 text-red-500 text-sm font-medium py-2 rounded-lg transition border border-red-100 disabled:opacity-50"
                  >
                    {deleting ? 'Deleting...' : '🗑 Delete listing'}
                  </button>
                </div>
              </div>
            )}

            {/* Contact seller — not owner, not sold */}
            {!isOwner && !listing.sold && (
              <div className="bg-gray-50 rounded-xl border border-gray-100 p-4">
                {user ? (
                  <>
                    <p className="text-xs text-gray-400 mb-2 font-medium uppercase tracking-wide">Contact seller</p>
                    <p className="font-semibold text-gray-900 text-xl mb-1">
                      📞 {listing.seller?.phone}
                    </p>
                    <p className="text-xs text-gray-400">
                      WhatsApp or call directly
                    </p>
                  </>
                ) : (
                  <div className="text-center py-2">
                    <p className="text-sm text-gray-500 mb-3">
                      Login to see the seller's phone number
                    </p>
                    <Link
                      to="/login"
                      className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-lg text-sm font-medium transition inline-block"
                    >
                      Login to contact
                    </Link>
                  </div>
                )}
              </div>
            )}

            {/* Sold notice for non-owners */}
            {!isOwner && listing.sold && (
              <div className="bg-red-50 rounded-xl border border-red-100 p-4 text-center">
                <p className="text-red-500 font-medium text-sm">This item has been sold</p>
                <Link to="/browse" className="text-blue-600 hover:underline text-xs mt-1 inline-block">
                  Browse similar listings →
                </Link>
              </div>
            )}

          </div>
        </div>
      </div>

      <footer className="border-t border-gray-100 mt-20">
        <div className="max-w-6xl mx-auto px-6 py-8 text-center text-sm text-gray-400">
          © 2026 CampusExchange. Made for students, by students.
        </div>
      </footer>
    </div>
  )
}