import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import Navbar from '../components/Navbar'
import { useAuth } from '../context/AuthContext'
import api from '../api/axios'

const CATEGORIES = ['books', 'electronics', 'clothing', 'furniture', 'other']

export default function CreateListing() {
  const { token } = useAuth()
  const navigate = useNavigate()

  const [form, setForm] = useState({
    title: '',
    description: '',
    price: '',
    category: 'books',
  })
  const [images, setImages] = useState([])
  const [previews, setPreviews] = useState([])
  const [uploading, setUploading] = useState(false)
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value })
  }

  const handleImageChange = (e) => {
    const files = Array.from(e.target.files)
    if (files.length > 5) {
      return setError('Maximum 5 images allowed')
    }
    setImages(files)
    setPreviews(files.map(file => URL.createObjectURL(file)))
  }

  const removeImage = (index) => {
    const newImages = images.filter((_, i) => i !== index)
    const newPreviews = previews.filter((_, i) => i !== index)
    setImages(newImages)
    setPreviews(newPreviews)
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    setLoading(true)

    try {
      let imageUrls = []

      // Upload images first if any
      if (images.length > 0) {
        setUploading(true)
        const formData = new FormData()
        images.forEach(img => formData.append('images', img))

        const uploadRes = await api.post('/upload', formData, {
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'multipart/form-data'
          }
        })
        imageUrls = uploadRes.data.urls
        setUploading(false)
      }

      // Create listing with image URLs
      await api.post(
        '/listings',
        { ...form, price: Number(form.price), images: imageUrls },
        { headers: { Authorization: `Bearer ${token}` } }
      )

      navigate('/dashboard')
    } catch (err) {
      setError(err.response?.data?.message || 'Could not create listing')
      setUploading(false)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />

      <div className="max-w-2xl mx-auto px-6 py-10">
        <h1 className="text-3xl font-semibold text-gray-900 mb-2">Create a listing</h1>
        <p className="text-gray-500 text-sm mb-8">Fill in the details to post your item for sale.</p>

        {error && (
          <div className="bg-red-50 text-red-600 text-sm px-4 py-3 rounded-lg mb-6">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="bg-white rounded-2xl border border-gray-100 p-6 flex flex-col gap-5">

          <div>
            <label className="text-sm font-medium text-gray-700 mb-1 block">Title</label>
            <input
              type="text"
              name="title"
              value={form.title}
              onChange={handleChange}
              placeholder="e.g. Calculus Textbook 3rd Edition"
              required
              className="w-full border border-gray-200 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div>
            <label className="text-sm font-medium text-gray-700 mb-1 block">Description</label>
            <textarea
              name="description"
              value={form.description}
              onChange={handleChange}
              placeholder="Describe the condition, any defects, reason for selling..."
              required
              rows={4}
              className="w-full border border-gray-200 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-sm font-medium text-gray-700 mb-1 block">Price (Rs)</label>
              <input
                type="number"
                name="price"
                value={form.price}
                onChange={handleChange}
                placeholder="500"
                required
                min="0"
                className="w-full border border-gray-200 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div>
              <label className="text-sm font-medium text-gray-700 mb-1 block">Category</label>
              <select
                name="category"
                value={form.category}
                onChange={handleChange}
                className="w-full border border-gray-200 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
              >
                {CATEGORIES.map((cat) => (
                  <option key={cat} value={cat}>
                    {cat.charAt(0).toUpperCase() + cat.slice(1)}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Image upload */}
          <div>
            <label className="text-sm font-medium text-gray-700 mb-1 block">
              Photos <span className="text-gray-400 font-normal">(up to 5)</span>
            </label>

            <label className="block cursor-pointer">
              <div className="border-2 border-dashed border-gray-200 rounded-xl p-6 text-center hover:border-blue-400 transition">
                <p className="text-gray-400 text-sm">Click to upload photos</p>
                <p className="text-gray-300 text-xs mt-1">JPG, PNG, WEBP up to 5MB each</p>
              </div>
              <input
                type="file"
                accept="image/*"
                multiple
                onChange={handleImageChange}
                className="hidden"
              />
            </label>

            {/* Previews */}
            {previews.length > 0 && (
              <div className="flex gap-3 mt-3 flex-wrap">
                {previews.map((src, i) => (
                  <div key={i} className="relative w-20 h-20">
                    <img
                      src={src}
                      alt=""
                      className="w-full h-full object-cover rounded-lg border border-gray-100"
                    />
                    <button
                      type="button"
                      onClick={() => removeImage(i)}
                      className="absolute -top-2 -right-2 w-5 h-5 bg-red-500 text-white rounded-full text-xs flex items-center justify-center"
                    >
                      ✕
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Tips */}
          <div className="bg-blue-50 rounded-xl p-4">
            <p className="text-sm font-medium text-blue-700 mb-2">Tips for a great listing</p>
            <ul className="text-xs text-blue-600 flex flex-col gap-1">
              <li>• Use clear photos taken in good lighting</li>
              <li>• Be honest about the condition of the item</li>
              <li>• Set a fair price — check similar listings first</li>
              <li>• Respond to messages quickly</li>
            </ul>
          </div>

          <button
            type="submit"
            disabled={loading || uploading}
            className="bg-blue-600 hover:bg-blue-700 text-white font-medium py-3 rounded-lg text-sm transition disabled:opacity-50"
          >
            {uploading ? 'Uploading images...' : loading ? 'Posting...' : 'Post listing'}
          </button>

        </form>
      </div>

      <footer className="border-t border-gray-100 mt-20">
        <div className="max-w-6xl mx-auto px-6 py-8 text-center text-sm text-gray-400">
          © 2026 CampusExchange. Made for students, by students.
        </div>
      </footer>
    </div>
  )
}