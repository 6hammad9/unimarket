import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'

export default function Navbar() {
  const { user, logout } = useAuth()
  const navigate = useNavigate()

  const handleLogout = () => {
    logout()
    navigate('/login')
  }

  return (
    <nav className="bg-white border-b border-gray-100 px-6 py-4">
      <div className="max-w-6xl mx-auto flex items-center justify-between">

        <Link to="/" className="text-xl font-semibold text-blue-600">
          CampusExchange
        </Link>

        <div className="flex items-center gap-6">
          <Link to="/browse" className="text-sm text-gray-600 hover:text-blue-600 transition">
            Browse
          </Link>

          {user ? (
            <>
              <Link to="/create" className="text-sm text-gray-600 hover:text-blue-600 transition">
                Sell
              </Link>
              <Link to="/dashboard" className="text-sm text-gray-600 hover:text-blue-600 transition">
                Dashboard
              </Link>
              {user.isAdmin && (
                <Link to="/admin" className="text-sm text-purple-600 font-medium hover:text-purple-700 transition">
                  Admin
                </Link>
              )}
              <button
                onClick={handleLogout}
                className="text-sm bg-gray-100 hover:bg-gray-200 text-gray-700 px-4 py-2 rounded-lg transition"
              >
                Logout
              </button>
            </>
          ) : (
            <>
              <Link to="/login" className="text-sm text-gray-600 hover:text-blue-600 transition">
                Login
              </Link>
              <Link
                to="/register"
                className="text-sm bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg transition"
              >
                Register
              </Link>
            </>
          )}
        </div>

      </div>
    </nav>
  )
}