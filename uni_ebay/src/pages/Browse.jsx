import { useState, useEffect } from 'react'
import { Link, useSearchParams } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import Navbar from '../components/Navbar'
import api from '../api/axios'

const CATEGORIES = ['all', 'books', 'electronics', 'clothing', 'furniture', 'other']

export default function Browse() {
  const { user } = useAuth()
  const [searchParams, setSearchParams] = useSearchParams()
  const [listings, setListings] = useState([])
  const [universities, setUniversities] = useState([])
  const [loading, setLoading] = useState(true)

  const category = searchParams.get('category') || 'all'
  const search = searchParams.get('search') || ''
  const selectedUni = searchParams.get('university') || ''
  const selectedCity = searchParams.get('city') || ''

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
    const fetchListings = async () => {
      setLoading(true)
      try {
        const params = {}
        if (category !== 'all') params.category = category
        if (search) params.search = search
        if (selectedUni) {
          params.university = selectedUni
        } else if (!selectedCity && user?.university) {
          // Default to user's university only if no other filter is active
          params.university = user?.university?._id || user?.university
        }
        if (selectedCity) params.city = selectedCity

        const res = await api.get('/listings', { params })
        setListings(res.data)
      } catch (err) {
        console.error(err)
      } finally {
        setLoading(false)
      }
    }
    fetchListings()
  }, [category, search, selectedUni, selectedCity])

  const updateParam = (key, value) => {
    const next = new URLSearchParams(searchParams)
    if (value) next.set(key, value)
    else next.delete(key)
    if (key === 'university') next.delete('city')
    if (key === 'city') next.delete('university')
    setSearchParams(next)
  }

  const cities = [...new Set(universities.map(u => u.city))].sort()

  const userUniId = user?.university?._id || user?.university || ''

  const displayUniName = selectedUni
    ? universities.find(u => u._id === selectedUni)?.name
    : !selectedCity && userUniId
    ? universities.find(u => u._id === userUniId)?.name
    : null

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />

      <div className="max-w-6xl mx-auto px-6 py-10">
        <h1 className="text-3xl font-semibold text-gray-900 mb-2">Browse listings</h1>
        <p className="text-gray-500 text-sm mb-8">
          {displayUniName
            ? `Showing listings from ${displayUniName}`
            : selectedCity
            ? `Showing listings from ${selectedCity}`
            : 'Showing all listings'
          }
        </p>

        {/* Search */}
        <input
          type="text"
          placeholder="Search listings..."
          value={search}
          onChange={e => updateParam('search', e.target.value)}
          className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm mb-4 focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
        />

        {/* University / City filters */}
        <div className="flex flex-wrap gap-3 mb-4">

          {/* All universities */}
          <button
            onClick={() => {
              const next = new URLSearchParams(searchParams)
              next.delete('university')
              next.delete('city')
              setSearchParams(next)
            }}
            className={`px-4 py-2 rounded-lg text-sm transition border ${
              !selectedUni && !selectedCity
                ? 'bg-blue-600 text-white border-blue-600'
                : 'bg-white text-gray-600 border-gray-200 hover:border-blue-400'
            }`}
          >
            All universities
          </button>

          {/* My university */}
          {userUniId && (
            <button
              onClick={() => updateParam('university', userUniId)}
              className={`px-4 py-2 rounded-lg text-sm transition border ${
                selectedUni === userUniId
                  ? 'bg-blue-600 text-white border-blue-600'
                  : 'bg-white text-gray-600 border-gray-200 hover:border-blue-400'
              }`}
            >
              My university
            </button>
          )}

          {/* City dropdown */}
          <select
            value={selectedCity}
            onChange={e => updateParam('city', e.target.value)}
            className="px-4 py-2 rounded-lg text-sm border border-gray-200 bg-white text-gray-600 focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="">Filter by city</option>
            {cities.map(city => (
              <option key={city} value={city}>{city}</option>
            ))}
          </select>

          {/* University dropdown */}
          <select
            value={selectedUni}
            onChange={e => updateParam('university', e.target.value)}
            className="px-4 py-2 rounded-lg text-sm border border-gray-200 bg-white text-gray-600 focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="">Filter by university</option>
            {universities.map(uni => (
              <option key={uni._id} value={uni._id}>{uni.name}</option>
            ))}
          </select>
        </div>

        {/* Category pills */}
        <div className="flex gap-2 flex-wrap mb-8">
          {CATEGORIES.map(cat => (
            <button
              key={cat}
              onClick={() => updateParam('category', cat === 'all' ? '' : cat)}
              className={`px-4 py-2 rounded-lg text-sm capitalize transition border ${
                category === cat || (cat === 'all' && !category)
                  ? 'bg-gray-900 text-white border-gray-900'
                  : 'bg-white text-gray-600 border-gray-200 hover:border-gray-400'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>

        {/* Listings grid */}
        {loading ? (
          <div className="flex items-center justify-center py-32">
            <div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin" />
          </div>
        ) : listings.length === 0 ? (
          <div className="text-center py-20">
            <p className="text-gray-400 mb-2">No listings found</p>
            <button
              onClick={() => setSearchParams({})}
              className="text-blue-600 text-sm hover:underline"
            >
              Clear all filters
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-5">
            {listings.map(listing => (
              <Link
                key={listing._id}
                to={`/listings/${listing._id}`}
                className="bg-white rounded-2xl border border-gray-100 overflow-hidden hover:shadow-md transition group"
              >
                <div className="h-44 bg-gray-100 flex items-center justify-center overflow-hidden">
                  {listing.images?.[0] ? (
                    <img
                      src={listing.images[0]}
                      alt={listing.title}
                      className="w-full h-full object-cover group-hover:scale-105 transition duration-300"
                    />
                  ) : (
                    <span className="text-gray-300 text-sm">No image</span>
                  )}
                </div>
                <div className="p-4">
                  <p className="font-medium text-gray-900 truncate mb-1">{listing.title}</p>
                  <p className="text-blue-600 font-semibold text-sm mb-2">Rs {listing.price.toLocaleString()}</p>
                  <div className="flex items-center justify-between">
                    <span className="text-xs bg-gray-100 text-gray-500 px-2 py-1 rounded-full capitalize">
                      {listing.category}
                    </span>
                    {listing.university?.city && (
                      <span className="text-xs text-gray-400 truncate ml-2">
                        📍 {listing.university.city}
                      </span>
                    )}
                  </div>
                </div>
              </Link>
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