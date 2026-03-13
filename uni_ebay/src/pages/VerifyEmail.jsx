import { useEffect, useState } from 'react'
import { useParams, Link } from 'react-router-dom'
import api from '../api/axios'

export default function VerifyEmail() {
  const { token } = useParams()
  const [status, setStatus] = useState('loading')

  useEffect(() => {
    const verify = async () => {
      try {
        const res = await api.get(`/auth/verify/${token}`)
        console.log('verify response:', res.data)
        setStatus('success')
      } catch (err) {
        console.log('verify error:', err.response?.data)
        setStatus('error')
      }
    }
    verify()
  }, [token])

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="bg-white p-8 rounded-2xl shadow-sm w-full max-w-md text-center">
        {status === 'loading' && (
          <p className="text-gray-500">Verifying your email...</p>
        )}
        {status === 'success' && (
          <>
            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <span className="text-green-600 text-2xl">✓</span>
            </div>
            <h1 className="text-2xl font-medium mb-2">Email verified!</h1>
            <p className="text-gray-500 text-sm mb-6">Your account is now active.</p>
            <Link
              to="/login"
              className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2.5 rounded-lg text-sm font-medium transition"
            >
              Go to login
            </Link>
          </>
        )}
        {status === 'error' && (
          <>
            <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <span className="text-red-600 text-2xl">✗</span>
            </div>
            <h1 className="text-2xl font-medium mb-2">Invalid link</h1>
            <p className="text-gray-500 text-sm mb-6">
              This verification link is invalid or has already been used.
            </p>
            <Link to="/register" className="text-blue-600 hover:underline text-sm">
              Register again
            </Link>
          </>
        )}
      </div>
    </div>
  )
}