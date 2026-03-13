import { useState, useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import Navbar from '../components/Navbar'
import api from '../api/axios'

const CATEGORIES = ['All', 'Books', 'Electronics', 'Clothing', 'Furniture', 'Other']

export default function Home() {
  const [listings, setListings] = useState([])
  const [loading, setLoading] = useState(true)
  const navigate = useNavigate()

  useEffect(() => {
    const fetchListings = async () => {
      try {
        const res = await api.get('/listings?limit=6')
        setListings(res.data)
      } catch (err) {
        console.error(err)
      } finally {
        setLoading(false)
      }
    }
    fetchListings()
  }, [])

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />

      {/* Hero */}
      <section className="bg-white border-b border-gray-100">
        <div className="max-w-6xl mx-auto px-6 py-20 text-center">
          <h1 className="text-4xl font-semibold text-gray-900 mb-4">
            Buy and Sell Used Items on Campus
          </h1>
          <p className="text-gray-500 text-lg mb-8 max-w-xl mx-auto">
            The easiest way to buy and sell second-hand items with students at your university.
          </p>
          <div className="flex gap-3 justify-center">
            <Link
              to="/browse"
              className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg text-sm font-medium transition"
            >
              Browse Listings
            </Link>
            <Link
              to="/create"
              className="bg-gray-100 hover:bg-gray-200 text-gray-700 px-6 py-3 rounded-lg text-sm font-medium transition"
            >
              Sell Something
            </Link>
          </div>
        </div>
      </section>

      {/* How it works */}
      <section className="max-w-6xl mx-auto px-6 py-16">
        <h2 className="text-2xl font-semibold text-gray-900 mb-10 text-center">
          How it works
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {[
            { step: '1', title: 'Create account', desc: 'Sign up with your university email' },
            { step: '2', title: 'Post an item', desc: 'Add photos, price and description' },
            { step: '3', title: 'Connect', desc: 'Buyers contact you directly' },
            { step: '4', title: 'Meet on campus', desc: 'Exchange safely on campus' },
          ].map((item) => (
            <div key={item.step} className="text-center">
              <div className="w-10 h-10 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center font-semibold mx-auto mb-3">
                {item.step}
              </div>
              <h3 className="font-medium text-gray-900 mb-1">{item.title}</h3>
              <p className="text-sm text-gray-500">{item.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Categories */}
      <section className="bg-white border-y border-gray-100">
        <div className="max-w-6xl mx-auto px-6 py-12">
          <h2 className="text-2xl font-semibold text-gray-900 mb-8 text-center">
            Browse by category
          </h2>
          <div className="flex flex-wrap gap-3 justify-center">
            {CATEGORIES.filter(c => c !== 'All').map((cat) => (
              <button
                key={cat}
                onClick={() => navigate(`/browse?category=${cat.toLowerCase()}`)}
                className="px-5 py-2.5 bg-gray-50 hover:bg-blue-50 hover:text-blue-600 border border-gray-200 rounded-full text-sm font-medium transition"
              >
                {cat}
              </button>
            ))}
          </div>
        </div>
      </section>

      {/* Recent listings */}
      <section className="max-w-6xl mx-auto px-6 py-16">
        <div className="flex items-center justify-between mb-8">
          <h2 className="text-2xl font-semibold text-gray-900">Recent listings</h2>
          <Link to="/browse" className="text-sm text-blue-600 hover:underline">
            View all
          </Link>
        </div>

        {loading ? (
          <div className="text-center text-gray-400 py-20">Loading...</div>
        ) : listings.length === 0 ? (
          <div className="text-center text-gray-400 py-20">
            No listings yet — be the first to post!
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
            {listings.map((listing) => (
              <Link
                key={listing._id}
                to={`/listings/${listing._id}`}
                className="bg-white rounded-2xl border border-gray-100 overflow-hidden hover:shadow-md transition"
              >
                <div className="bg-gray-100 h-48 flex items-center justify-center">
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
                  <h3 className="font-medium text-gray-900 mb-1">{listing.title}</h3>
                  <p className="text-blue-600 font-semibold text-sm mb-2">
                    Rs {listing.price}
                  </p>
                  <span className="text-xs bg-gray-100 text-gray-500 px-2 py-1 rounded-full capitalize">
                    {listing.category}
                  </span>
                </div>
              </Link>
            ))}
          </div>
        )}
      </section>

      {/* CTA */}
      <section className="bg-blue-600 text-white">
        <div className="max-w-6xl mx-auto px-6 py-16 text-center">
          <h2 className="text-3xl font-semibold mb-4">Ready to sell something?</h2>
          <p className="text-blue-100 mb-8">
            Post your first listing in under 2 minutes.
          </p>
          <Link
            to="/create"
            className="bg-white text-blue-600 hover:bg-blue-50 px-6 py-3 rounded-lg text-sm font-medium transition"
          >
            Create a listing
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-white border-t border-gray-100">
        <div className="max-w-6xl mx-auto px-6 py-8 text-center text-sm text-gray-400">
          © 2026 CampusExchange. Made for students, by students.
        </div>
      </footer>

    </div>
  )
}