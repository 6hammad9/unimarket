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
  const [message, setMessage] = useState('')
  const [sending, setSending] = useState(false)
  const [sent, setSent] = useState(false)
  const [error, setError] = useState('')
  const [activeImage, setActiveImage] = useState(0)

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

  const handleContact = async (e) => {
    e.preventDefault()
    if (!user) return navigate('/login')
    setSending(true)
    setError('')
    try {
      await api.post(
        `/listings/${id}/message`,
        { message },
        { headers: { Authorization: `Bearer ${token}` } }
      )
      setSent(true)
      setMessage('')
    } catch (err) {
      setError(err.response?.data?.message || 'Could not send message')
    } finally {
      setSending(false)
    }
  }

  const handleMarkSold = async () => {
    try {
      await api.put(
        `/listings/${id}/sold`,
        {},
        { headers: { Authorization: `Bearer ${token}` } }
      )
      setListing({ ...listing, sold: true })
    } catch (err) {
      console.error(err)
    }
  }

  const handleDelete = async () => {
    if (!window.confirm('Are you sure you want to delete this listing?')) return
    try {
      await api.delete(
        `/listings/${id}`,
        { headers: { Authorization: `Bearer ${token}` } }
      )
      navigate('/dashboard')
    } catch (err) {
      console.error(err)
    }
  }

  if (loading) return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      <div className="text-center text-gray-400 py-20">Loading...</div>
    </div>
  )

  if (!listing) return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      <div className="text-center text-gray-400 py-20">Listing not found.</div>
    </div>
  )

  const isOwner = user?.id === listing.seller?._id

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
            <div className="bg-gray-100 rounded-2xl overflow-hidden h-80 flex items-center justify-center mb-3">
              {listing.images?.[activeImage] ? (
                <img
                  src={listing.images[activeImage]}
                  alt={listing.title}
                  className="w-full h-full object-cover"
                />
              ) : (
                <span className="text-gray-400">No image</span>
              )}
            </div>
            {listing.images?.length > 1 && (
              <div className="flex gap-2">
                {listing.images.map((img, i) => (
                  <button
                    key={i}
                    onClick={() => setActiveImage(i)}
                    className={`w-16 h-16 rounded-lg overflow-hidden border-2 transition ${
                      activeImage === i ? 'border-blue-500' : 'border-transparent'
                    }`}
                  >
                    <img src={img} alt="" className="w-full h-full object-cover" />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Details */}
          <div>
            {listing.sold && (
              <span className="inline-block bg-red-100 text-red-600 text-xs font-medium px-3 py-1 rounded-full mb-3">
                Sold
              </span>
            )}

            <h1 className="text-2xl font-semibold text-gray-900 mb-2">{listing.title}</h1>
            <p className="text-3xl font-bold text-blue-600 mb-4">Rs {listing.price}</p>

            <span className="text-xs bg-gray-100 text-gray-500 px-3 py-1 rounded-full capitalize">
              {listing.category}
            </span>

            <p className="text-gray-600 text-sm leading-relaxed mt-4 mb-6">
              {listing.description}
            </p>

            {/* Seller info */}
            <div className="bg-gray-50 rounded-xl p-4 mb-6">
              <p className="text-xs text-gray-400 mb-1">Listed by</p>
              <p className="font-medium text-gray-900">{listing.seller?.name}</p>
              <p className="text-sm text-gray-500">{listing.seller?.email}</p>
            </div>

            {/* Owner actions */}
            {/* Contact seller */}
{!isOwner && !listing.sold && (
  <div className="bg-gray-50 rounded-xl p-4">
    {user ? (
      <>
        <p className="text-xs text-gray-400 mb-1">Contact seller</p>
        <p className="font-medium text-gray-900 text-lg">
          📞 {listing.seller?.phone}
        </p>
        <p className="text-xs text-gray-400 mt-1">
          Contact via WhatsApp or call directly
        </p>
      </>
    ) : (
      <div className="text-center">
        <p className="text-sm text-gray-500 mb-3">
          Login to see seller's phone number
        </p>
        <Link
          to="/login"
          className="bg-blue-600 hover:bg-blue-700 text-white px-5 py-2 rounded-lg text-sm font-medium transition"
        >
          Login to contact
        </Link>
      </div>
    )}
  </div>
)}
          </div>
        </div>
      </div>

      {/* Footer */}
      <footer className="border-t border-gray-100 mt-20">
        <div className="max-w-6xl mx-auto px-6 py-8 text-center text-sm text-gray-400">
          © 2026 CampusExchange. Made for students, by students.
        </div>
      </footer>
    </div>
  )
}