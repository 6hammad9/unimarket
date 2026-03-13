import jwt from 'jsonwebtoken'
import User from '../models/User.js'

export const protect = (req, res, next) => {
  try {
    const token = req.headers.authorization?.split(' ')[1]
    if (!token) return res.status(401).json({ message: 'No token, access denied' })
    const decoded = jwt.verify(token, process.env.JWT_SECRET)
    req.user = decoded
    next()
  } catch (err) {
    res.status(401).json({ message: 'Invalid token' })
  }
}

export const adminOnly = async (req, res, next) => {
  try {
    const user = await User.findById(req.user.id)
    if (!user.isAdmin) {
      return res.status(403).json({ message: 'Admin access required' })
    }
    next()
  } catch (err) {
    res.status(500).json({ message: 'Server error' })
  }
}

export default protect