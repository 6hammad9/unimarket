import { useState, useEffect } from 'react'
import { Link, useSearchParams } from 'react-router-dom'
import Navbar from '../components/Navbar'
import api from '../api/axios'

const CATEGORIES = ['All', 'Books', 'Electronics', 'Clothing', 'Furniture', 'Other']

export default function Browse() {
  const [listings, setListings] = useState([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [searchParams, setSearchParams] = useSearchParams()
  const activeCategory = searchParams.get('category') || 'all'

  useEffect(() => {
    const fetchListings = async () => {
      setLoading(true)
      try {
        const params = {}
        if (activeCategory !== 'all') params.category = activeCategory
        if (search) params.search = search
        const res = await api.get('/listings', { params })
        setListings(res.data)
      } catch (err) {
        console.error(err)
      } finally {
        setLoading(false)
      }
    }
    fetchListings()
  }, [activeCategory, search])

  const handleCategory = (cat) => {
    setSearchParams(cat === 'All' ? {} : { category: cat.toLowerCase() })
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />

      <div className="max-w-6xl mx-auto px-6 py-10">

        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-semibold text-gray-900 mb-2">Browse listings</h1>
          <p className="text-gray-500">Find second-hand items from students at your university</p>
        </div>

        {/* Search */}
        <div className="mb-6">
          <input
            type="text"
            placeholder="Search listings..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full max-w-md border border-gray-200 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        {/* Category filters */}
        <div className="flex flex-wrap gap-2 mb-8">
          {CATEGORIES.map((cat) => (
            <button
              key={cat}
              onClick={() => handleCategory(cat)}
              className={`px-4 py-2 rounded-full text-sm font-medium transition border ${
                activeCategory === cat.toLowerCase() || (cat === 'All' && activeCategory === 'all')
                  ? 'bg-blue-600 text-white border-blue-600'
                  : 'bg-white text-gray-600 border-gray-200 hover:border-blue-400'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>

        {/* Results */}
        {loading ? (
          <div className="text-center text-gray-400 py-20">Loading...</div>
        ) : listings.length === 0 ? (
          <div className="text-center text-gray-400 py-20">
            No listings found. Try a different search or category.
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {listings.map((listing) => (
              <Link
                key={listing._id}
                to={`/listings/${listing._id}`}
                className="bg-white rounded-2xl border border-gray-100 overflow-hidden hover:shadow-md transition"
              >
                <div className="bg-gray-100 h-44 flex items-center justify-center">
                  {listing.images?.[0] ? (
                    <img
                      src={listing.images[0]}
                      alt={listing.title}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <span className="text-gray-400 text-sm">No image</span>
                  )}
                </div>
                <div className="p-4">
                  <h3 className="font-medium text-gray-900 mb-1 truncate">{listing.title}</h3>
                  <p className="text-blue-600 font-semibold text-sm mb-2">Rs {listing.price}</p>
                  <span className="text-xs bg-gray-100 text-gray-500 px-2 py-1 rounded-full capitalize">
                    {listing.category}
                  </span>
                </div>
              </Link>
            ))}
          </div>
        )}

      </div>
    </div>
  )
}