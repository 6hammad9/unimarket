import { useState, useEffect } from 'react'
import { useAuth } from '../context/AuthContext'
import api from '../api/axios'

const CATEGORIES = ['books', 'electronics', 'clothing', 'furniture', 'other']

export default function Admin() {
  const { token } = useAuth()
  const [tab, setTab] = useState('stats')
  const [stats, setStats] = useState(null)
  const [users, setUsers] = useState([])
  const [listings, setListings] = useState([])
  const [universities, setUniversities] = useState([])
  const [allUnisForDropdown, setAllUnisForDropdown] = useState([])
  const [editingListing, setEditingListing] = useState(null)
  const [editingUser, setEditingUser] = useState(null)
  const [editingUni, setEditingUni] = useState(null)
  const [newUni, setNewUni] = useState({ name: '', city: '', country: '' })
  const [loading, setLoading] = useState(false)
const [messages, setMessages] = useState([])
  const headers = { Authorization: `Bearer ${token}` }

  // Always fetch universities for the user edit dropdown
  useEffect(() => {
    const fetchAllUnis = async () => {
      try {
        const res = await api.get('/universities')
        setAllUnisForDropdown(res.data)
      } catch (err) {
        console.error(err)
      }
    }
    fetchAllUnis()
  }, [])

  useEffect(() => {
    if (tab === 'stats') fetchStats()
    if (tab === 'users') fetchUsers()
    if (tab === 'listings') fetchListings()
    if (tab === 'universities') fetchUniversities()
        if (tab === 'messages') fetchMessages()
  }, [tab])

  const fetchStats = async () => {
    try {
      const res = await api.get('/admin/stats', { headers })
      setStats(res.data)
    } catch (err) {
      console.error(err)
    }
  }
const fetchMessages = async () => {
  setLoading(true)
  try {
    const res = await api.get('/messages', { headers })
    setMessages(res.data)
  } catch (err) {
    console.error(err)
  } finally {
    setLoading(false)
  }
}

const handleMarkRead = async (id) => {
  try {
    const res = await api.put(`/messages/${id}/read`, {}, { headers })
    setMessages(messages.map(m => m._id === id ? res.data : m))
  } catch (err) {
    console.error(err)
  }
}

const handleMarkResolved = async (id) => {
  try {
    const res = await api.put(`/messages/${id}/resolve`, {}, { headers })
    setMessages(messages.map(m => m._id === id ? res.data : m))
  } catch (err) {
    console.error(err)
  }
}

const handleDeleteMessage = async (id) => {
  if (!window.confirm('Delete this message?')) return
  try {
    await api.delete(`/messages/${id}`, { headers })
    setMessages(messages.filter(m => m._id !== id))
  } catch (err) {
    console.error(err)
  }
}
  const fetchUsers = async () => {
    setLoading(true)
    try {
      const res = await api.get('/admin/users', { headers })
      setUsers(res.data)
    } catch (err) {
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  const fetchListings = async () => {
    setLoading(true)
    try {
      const res = await api.get('/admin/listings', { headers })
      setListings(res.data)
    } catch (err) {
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  const fetchUniversities = async () => {
    setLoading(true)
    try {
      const res = await api.get('/admin/universities', { headers })
      setUniversities(res.data)
    } catch (err) {
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  const handleDeleteUser = async (id) => {
    if (!window.confirm('Delete this user and all their listings?')) return
    try {
      await api.delete(`/admin/users/${id}`, { headers })
      setUsers(users.filter(u => u._id !== id))
    } catch (err) {
      console.error(err)
    }
  }

  const handleToggleAdmin = async (id) => {
    try {
      const res = await api.put(`/admin/users/${id}/toggle-admin`, {}, { headers })
      setUsers(users.map(u => u._id === id ? { ...u, isAdmin: res.data.isAdmin } : u))
    } catch (err) {
      console.error(err)
    }
  }

  const handleEditUserSave = async () => {
    try {
      const payload = {
        ...editingUser,
        university: editingUser.university?._id || editingUser.university || null
      }
      const res = await api.put(`/admin/users/${editingUser._id}`, payload, { headers })
      setUsers(users.map(u => u._id === editingUser._id ? res.data : u))
      setEditingUser(null)
    } catch (err) {
      console.error(err)
    }
  }

  const handleDeleteListing = async (id) => {
    if (!window.confirm('Delete this listing?')) return
    try {
      await api.delete(`/admin/listings/${id}`, { headers })
      setListings(listings.filter(l => l._id !== id))
    } catch (err) {
      console.error(err)
    }
  }

  const handleEditListingSave = async () => {
    try {
      await api.put(`/admin/listings/${editingListing._id}`, editingListing, { headers })
      setListings(listings.map(l => l._id === editingListing._id ? editingListing : l))
      setEditingListing(null)
    } catch (err) {
      console.error(err)
    }
  }

  const handleCreateUni = async () => {
    if (!newUni.name || !newUni.city || !newUni.country) return
    try {
      const res = await api.post('/universities', newUni, { headers })
      setUniversities([...universities, res.data])
      setAllUnisForDropdown([...allUnisForDropdown, res.data])
      setNewUni({ name: '', city: '', country: '' })
    } catch (err) {
      alert(err.response?.data?.message || 'Error creating university')
    }
  }

  const handleDeleteUni = async (id) => {
    if (!window.confirm('Delete this university?')) return
    try {
      await api.delete(`/universities/${id}`, { headers })
      setUniversities(universities.filter(u => u._id !== id))
      setAllUnisForDropdown(allUnisForDropdown.filter(u => u._id !== id))
    } catch (err) {
      console.error(err)
    }
  }

  const handleToggleUniActive = async (uni) => {
    try {
      const res = await api.put(`/universities/${uni._id}`, { ...uni, isActive: !uni.isActive }, { headers })
      setUniversities(universities.map(u => u._id === uni._id ? res.data : u))
    } catch (err) {
      console.error(err)
    }
  }

  const handleEditUniSave = async () => {
    try {
      const res = await api.put(`/universities/${editingUni._id}`, editingUni, { headers })
      setUniversities(universities.map(u => u._id === editingUni._id ? res.data : u))
      setAllUnisForDropdown(allUnisForDropdown.map(u => u._id === editingUni._id ? res.data : u))
      setEditingUni(null)
    } catch (err) {
      console.error(err)
    }
  }

  return (
    <div className="min-h-screen bg-gray-50">

      {/* Header */}
      <div className="bg-white border-b border-gray-100 px-6 py-4">
        <div className="max-w-6xl mx-auto flex items-center justify-between">
          <h1 className="text-xl font-semibold text-gray-900">Admin Panel</h1>
          <a href="/" className="text-sm text-blue-600 hover:underline">← Back to site</a>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-6 py-8">

        {/* Tabs */}
        <div className="flex gap-2 mb-8 flex-wrap">
         {['stats', 'listings', 'users', 'universities', 'messages'].map((t) => (
  <button
    key={t}
    onClick={() => setTab(t)}
    className={`px-5 py-2 rounded-lg text-sm font-medium transition capitalize flex items-center gap-2 ${
      tab === t
        ? 'bg-blue-600 text-white'
        : 'bg-white border border-gray-200 text-gray-600 hover:border-blue-400'
    }`}
  >
    {t}
    {t === 'messages' && stats?.unreadMessages > 0 && (
      <span className="bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
        {stats.unreadMessages}
      </span>
    )}
  </button>
))}
        </div>

        {/* Stats */}
        {tab === 'stats' && stats && (
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
            {[
              { label: 'Total users', value: stats.totalUsers },
              { label: 'Verified users', value: stats.verifiedUsers },
              { label: 'Total listings', value: stats.totalListings },
              { label: 'Active listings', value: stats.activeListings },
              { label: 'Sold listings', value: stats.soldListings },
            ].map((s) => (
              <div key={s.label} className="bg-white rounded-2xl border border-gray-100 p-5">
                <p className="text-xs text-gray-400 mb-1">{s.label}</p>
                <p className="text-3xl font-semibold text-gray-900">{s.value}</p>
              </div>
            ))}
          </div>
        )}

        {/* Listings */}
        {tab === 'listings' && (
          <div>
            {loading ? (
              <p className="text-gray-400 text-center py-10">Loading...</p>
            ) : listings.length === 0 ? (
              <p className="text-gray-400 text-center py-10">No listings found.</p>
            ) : (
              <div className="flex flex-col gap-3">
                {listings.map((listing) => (
                  <div key={listing._id} className="bg-white rounded-2xl border border-gray-100 p-4">
                    {editingListing?._id === listing._id ? (
                      <div className="flex flex-col gap-3">
                        <div className="grid grid-cols-2 gap-3">
                          <div>
                            <label className="text-xs text-gray-400 mb-1 block">Title</label>
                            <input
                              className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm"
                              value={editingListing.title}
                              onChange={e => setEditingListing({ ...editingListing, title: e.target.value })}
                            />
                          </div>
                          <div>
                            <label className="text-xs text-gray-400 mb-1 block">Price (Rs)</label>
                            <input
                              type="number"
                              className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm"
                              value={editingListing.price}
                              onChange={e => setEditingListing({ ...editingListing, price: e.target.value })}
                            />
                          </div>
                        </div>
                        <div>
                          <label className="text-xs text-gray-400 mb-1 block">Description</label>
                          <textarea
                            className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm resize-none"
                            rows={2}
                            value={editingListing.description}
                            onChange={e => setEditingListing({ ...editingListing, description: e.target.value })}
                          />
                        </div>
                        <div className="flex gap-3 items-center">
                          <div>
                            <label className="text-xs text-gray-400 mb-1 block">Category</label>
                            <select
                              className="border border-gray-200 rounded-lg px-3 py-2 text-sm bg-white"
                              value={editingListing.category}
                              onChange={e => setEditingListing({ ...editingListing, category: e.target.value })}
                            >
                              {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
                            </select>
                          </div>
                          <div className="flex items-end pb-2">
                            <label className="flex items-center gap-2 text-sm text-gray-600">
                              <input
                                type="checkbox"
                                checked={editingListing.sold}
                                onChange={e => setEditingListing({ ...editingListing, sold: e.target.checked })}
                              />
                              Mark as sold
                            </label>
                          </div>
                        </div>
                        <div className="flex gap-2">
                          <button onClick={handleEditListingSave} className="bg-blue-600 text-white px-4 py-1.5 rounded-lg text-sm">Save</button>
                          <button onClick={() => setEditingListing(null)} className="bg-gray-100 text-gray-600 px-4 py-1.5 rounded-lg text-sm">Cancel</button>
                        </div>
                      </div>
                    ) : (
                      <div className="flex items-center gap-4">
                        <div className="w-14 h-14 bg-gray-100 rounded-xl overflow-hidden flex-shrink-0 flex items-center justify-center">
                          {listing.images?.[0] ? (
                            <img src={listing.images[0]} alt="" className="w-full h-full object-cover" />
                          ) : (
                            <span className="text-gray-300 text-xs">No img</span>
                          )}
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-0.5">
                            <p className="font-medium text-gray-900 truncate">{listing.title}</p>
                            {listing.sold && (
                              <span className="text-xs bg-red-100 text-red-500 px-2 py-0.5 rounded-full flex-shrink-0">Sold</span>
                            )}
                          </div>
                          <p className="text-sm text-blue-600 font-medium">Rs {listing.price}</p>
                          <p className="text-xs text-gray-400 capitalize">
                            {listing.category} · {listing.seller?.name} · {listing.seller?.email}
                            {listing.university && ` · ${listing.university.name}`}
                          </p>
                        </div>
                        <div className="flex gap-2 flex-shrink-0">
                          <button onClick={() => setEditingListing(listing)} className="text-xs bg-gray-100 hover:bg-gray-200 text-gray-600 px-3 py-1.5 rounded-lg transition">Edit</button>
                          <button onClick={() => handleDeleteListing(listing._id)} className="text-xs bg-red-50 hover:bg-red-100 text-red-500 px-3 py-1.5 rounded-lg transition">Delete</button>
                        </div>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Users */}
        {tab === 'users' && (
          <div>
            {loading ? (
              <p className="text-gray-400 text-center py-10">Loading...</p>
            ) : users.length === 0 ? (
              <p className="text-gray-400 text-center py-10">No users found.</p>
            ) : (
              <div className="flex flex-col gap-3">
                {users.map((user) => (
                  <div key={user._id} className="bg-white rounded-2xl border border-gray-100 p-4">
                    {editingUser?._id === user._id ? (
                      <div className="flex flex-col gap-3">
                        <div className="grid grid-cols-2 gap-3">
                          <div>
                            <label className="text-xs text-gray-400 mb-1 block">Name</label>
                            <input
                              className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm"
                              value={editingUser.name}
                              onChange={e => setEditingUser({ ...editingUser, name: e.target.value })}
                            />
                          </div>
                          <div>
                            <label className="text-xs text-gray-400 mb-1 block">Phone</label>
                            <input
                              className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm"
                              value={editingUser.phone}
                              onChange={e => setEditingUser({ ...editingUser, phone: e.target.value })}
                            />
                          </div>
                          <div>
                            <label className="text-xs text-gray-400 mb-1 block">Email</label>
                            <input
                              className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm"
                              value={editingUser.email}
                              onChange={e => setEditingUser({ ...editingUser, email: e.target.value })}
                            />
                          </div>
                          <div className="flex items-end pb-2">
                            <label className="flex items-center gap-2 text-sm text-gray-600">
                              <input
                                type="checkbox"
                                checked={editingUser.isVerified}
                                onChange={e => setEditingUser({ ...editingUser, isVerified: e.target.checked })}
                              />
                              Verified
                            </label>
                          </div>
                          <div className="col-span-2">
                            <label className="text-xs text-gray-400 mb-1 block">University</label>
                            <select
                              className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm bg-white"
                              value={editingUser.university?._id || editingUser.university || ''}
                              onChange={e => setEditingUser({ ...editingUser, university: e.target.value })}
                            >
                              <option value="">No university</option>
                              {allUnisForDropdown.map(u => (
                                <option key={u._id} value={u._id}>
                                  {u.name} — {u.city}, {u.country}
                                </option>
                              ))}
                            </select>
                          </div>
                        </div>
                        <div className="flex gap-2">
                          <button onClick={handleEditUserSave} className="bg-blue-600 text-white px-4 py-1.5 rounded-lg text-sm">Save</button>
                          <button onClick={() => setEditingUser(null)} className="bg-gray-100 text-gray-600 px-4 py-1.5 rounded-lg text-sm">Cancel</button>
                        </div>
                      </div>
                    ) : (
                      <div className="flex items-center gap-4">
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-0.5">
                            <p className="font-medium text-gray-900">{user.name}</p>
                            {user.isAdmin && (
                              <span className="text-xs bg-blue-100 text-blue-600 px-2 py-0.5 rounded-full">Admin</span>
                            )}
                            {!user.isVerified && (
                              <span className="text-xs bg-yellow-100 text-yellow-600 px-2 py-0.5 rounded-full">Unverified</span>
                            )}
                          </div>
                          <p className="text-sm text-gray-500">{user.email}</p>
                          <p className="text-xs text-gray-400">{user.phone}</p>
                          {user.university && (
                            <p className="text-xs text-blue-400 mt-0.5">
                              🎓 {user.university.name} · {user.university.city}
                            </p>
                          )}
                        </div>
                        <div className="flex gap-2 flex-shrink-0">
                          <button onClick={() => setEditingUser(user)} className="text-xs bg-gray-100 hover:bg-gray-200 text-gray-600 px-3 py-1.5 rounded-lg transition">Edit</button>
                          <button onClick={() => handleToggleAdmin(user._id)} className="text-xs bg-blue-50 hover:bg-blue-100 text-blue-600 px-3 py-1.5 rounded-lg transition">
                            {user.isAdmin ? 'Remove admin' : 'Make admin'}
                          </button>
                          <button onClick={() => handleDeleteUser(user._id)} className="text-xs bg-red-50 hover:bg-red-100 text-red-500 px-3 py-1.5 rounded-lg transition">Delete</button>
                        </div>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Universities */}
        {tab === 'universities' && (
          <div>
            <div className="bg-white rounded-2xl border border-gray-100 p-5 mb-6">
              <p className="text-sm font-medium text-gray-700 mb-3">Add new university</p>
              <div className="grid grid-cols-3 gap-3 mb-3">
                <input
                  placeholder="University name"
                  value={newUni.name}
                  onChange={e => setNewUni({ ...newUni, name: e.target.value })}
                  className="border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
                <input
                  placeholder="City"
                  value={newUni.city}
                  onChange={e => setNewUni({ ...newUni, city: e.target.value })}
                  className="border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
                <input
                  placeholder="Country"
                  value={newUni.country}
                  onChange={e => setNewUni({ ...newUni, country: e.target.value })}
                  className="border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <button
                onClick={handleCreateUni}
                className="bg-blue-600 text-white px-5 py-2 rounded-lg text-sm hover:bg-blue-700 transition"
              >
                Add university
              </button>
            </div>

            {loading ? (
              <p className="text-gray-400 text-center py-10">Loading...</p>
            ) : universities.length === 0 ? (
              <p className="text-gray-400 text-center py-10">No universities yet. Add one above.</p>
            ) : (
              <div className="flex flex-col gap-3">
                {universities.map(uni => (
                  <div key={uni._id} className="bg-white rounded-2xl border border-gray-100 p-4">
                    {editingUni?._id === uni._id ? (
                      <div className="flex flex-col gap-3">
                        <div className="grid grid-cols-3 gap-3">
                          <div>
                            <label className="text-xs text-gray-400 mb-1 block">Name</label>
                            <input
                              className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm"
                              value={editingUni.name}
                              onChange={e => setEditingUni({ ...editingUni, name: e.target.value })}
                            />
                          </div>
                          <div>
                            <label className="text-xs text-gray-400 mb-1 block">City</label>
                            <input
                              className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm"
                              value={editingUni.city}
                              onChange={e => setEditingUni({ ...editingUni, city: e.target.value })}
                            />
                          </div>
                          <div>
                            <label className="text-xs text-gray-400 mb-1 block">Country</label>
                            <input
                              className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm"
                              value={editingUni.country}
                              onChange={e => setEditingUni({ ...editingUni, country: e.target.value })}
                            />
                          </div>
                        </div>
                        <div className="flex gap-2">
                          <button onClick={handleEditUniSave} className="bg-blue-600 text-white px-4 py-1.5 rounded-lg text-sm">Save</button>
                          <button onClick={() => setEditingUni(null)} className="bg-gray-100 text-gray-600 px-4 py-1.5 rounded-lg text-sm">Cancel</button>
                        </div>
                      </div>
                    ) : (
                      <div className="flex items-center gap-4">
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-0.5">
                            <p className="font-medium text-gray-900">{uni.name}</p>
                            <span className={`text-xs px-2 py-0.5 rounded-full ${uni.isActive ? 'bg-green-100 text-green-600' : 'bg-gray-100 text-gray-400'}`}>
                              {uni.isActive ? 'Active' : 'Inactive'}
                            </span>
                          </div>
                          <p className="text-sm text-gray-500">{uni.city}, {uni.country}</p>
                        </div>
                        <div className="flex gap-2 flex-shrink-0">
                          <button onClick={() => setEditingUni(uni)} className="text-xs bg-gray-100 hover:bg-gray-200 text-gray-600 px-3 py-1.5 rounded-lg transition">Edit</button>
                          <button onClick={() => handleToggleUniActive(uni)} className="text-xs bg-yellow-50 hover:bg-yellow-100 text-yellow-600 px-3 py-1.5 rounded-lg transition">
                            {uni.isActive ? 'Deactivate' : 'Activate'}
                          </button>
                          <button onClick={() => handleDeleteUni(uni._id)} className="text-xs bg-red-50 hover:bg-red-100 text-red-500 px-3 py-1.5 rounded-lg transition">Delete</button>
                        </div>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
{tab === 'messages' && (
  <div>
    {loading ? (
      <p className="text-gray-400 text-center py-10">Loading...</p>
    ) : messages.length === 0 ? (
      <p className="text-gray-400 text-center py-10">No messages yet.</p>
    ) : (
      <div className="flex flex-col gap-3">
        {messages.map(msg => (
          <div
            key={msg._id}
            className={`bg-white rounded-2xl border p-4 ${
              !msg.isRead ? 'border-blue-200 bg-blue-50/30' : 'border-gray-100'
            }`}
          >
            <div className="flex items-start justify-between gap-4">
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1 flex-wrap">
                  <p className="font-medium text-gray-900">{msg.subject}</p>
                  {!msg.isRead && (
                    <span className="text-xs bg-blue-100 text-blue-600 px-2 py-0.5 rounded-full">New</span>
                  )}
                  {msg.isResolved && (
                    <span className="text-xs bg-green-100 text-green-600 px-2 py-0.5 rounded-full">Resolved</span>
                  )}
                </div>
                <p className="text-sm text-gray-600 mb-2 leading-relaxed">{msg.message}</p>
                <p className="text-xs text-gray-400">
                  From <span className="font-medium">{msg.user?.name}</span> · {msg.user?.email} · {new Date(msg.createdAt).toLocaleDateString()}
                </p>
              </div>
              <div className="flex gap-2 flex-shrink-0">
                {!msg.isRead && (
                  <button
                    onClick={() => handleMarkRead(msg._id)}
                    className="text-xs bg-blue-50 hover:bg-blue-100 text-blue-600 px-3 py-1.5 rounded-lg transition"
                  >
                    Mark read
                  </button>
                )}
                {!msg.isResolved && (
                  <button
                    onClick={() => handleMarkResolved(msg._id)}
                    className="text-xs bg-green-50 hover:bg-green-100 text-green-600 px-3 py-1.5 rounded-lg transition"
                  >
                    Resolve
                  </button>
                )}
                <button
                  onClick={() => handleDeleteMessage(msg._id)}
                  className="text-xs bg-red-50 hover:bg-red-100 text-red-500 px-3 py-1.5 rounded-lg transition"
                >
                  Delete
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
    )}
  </div>
)}
      </div>
    </div>
  )
}