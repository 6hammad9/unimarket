import { Routes, Route } from 'react-router-dom'
import Login from './pages/Login'
import Register from './pages/Register'
import Home from './pages/Home'
import Browse from './pages/Browse'
import ProductDetail from './pages/ProductDetail'
import CreateListing from './pages/CreateListing'
import Dashboard from './pages/Dashboard'
import VerifyEmail from './pages/VerifyEmail'
import ForgotPassword from './pages/ForgotPassword'
import ResetPassword from './pages/ResetPassword'
import ProtectedRoute from './components/ProtectedRoute'
import AdminRoute from './components/AdminRoute'
import Admin from './pages/Admin'
import Contact from './pages/Contact'
import Profile from './pages/Profile'




export default function App() {
  return (
    <Routes>
      <Route path="/" element={<Home />} />
      <Route path="/browse" element={<Browse />} />
      <Route path="/listings/:id" element={<ProductDetail />} />
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />
      <Route path="/verify/:token" element={<VerifyEmail />} />
      <Route path="/profile" element={
  <ProtectedRoute><Profile /></ProtectedRoute>
} />
      <Route path="/contact" element={
  <ProtectedRoute><Contact /></ProtectedRoute>
} />

      <Route path="/forgot-password" element={<ForgotPassword />} />
      <Route path="/reset-password/:token" element={<ResetPassword />} />
      <Route path="/admin" element={
  <AdminRoute><Admin /></AdminRoute>
} />
      <Route path="/create" element={
        <ProtectedRoute><CreateListing /></ProtectedRoute>
      } />
      <Route path="/dashboard" element={
        <ProtectedRoute><Dashboard /></ProtectedRoute>
      } />
    </Routes>
  )
}