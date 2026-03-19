import express from 'express'
import cors from 'cors'
import dotenv from 'dotenv'
import mongoose from 'mongoose'
import authRoutes from './routes/auth.js'
import listingRoutes from './routes/listings.js'
import uploadRoutes from './routes/upload.js'
import universityRoutes from './routes/universities.js'
import adminRoutes from './routes/admin.js'
import messageRoutes from './routes/messages.js'
import userRoutes from './routes/users.js'
import User from './models/User.js'

dotenv.config()

const app = express()

app.use(cors({
  // origin: [
  //   'http://localhost:5000',
  //   'https://unimarket-xi.vercel.app'
  // ],
  // credentials: true
}))

app.use(express.json())

mongoose.connect(process.env.MONGO_URI)
  .then(() => console.log('MongoDB connected'))
  .catch((err) => console.log('DB error:', err))


  // Auto cleanup unverified accounts older than 24 hours
const cleanupUnverifiedUsers = async () => {
  try {
    const cutoff = new Date(Date.now() - 24 * 60 * 60 * 1000)
    const result = await User.deleteMany({
      isVerified: false,
      createdAt: { $lt: cutoff }
    })
    if (result.deletedCount > 0) console.log(`Cleaned up ${result.deletedCount} unverified accounts`)
  } catch (err) {
    console.error('Cleanup error:', err.message)
  }
}

cleanupUnverifiedUsers()
setInterval(cleanupUnverifiedUsers, 60 * 60 * 1000)
app.get('/', (req, res) => {
  res.json({ message: 'API is running' })
})

app.use('/api/auth', authRoutes)
app.use('/api/listings', listingRoutes)
app.use('/api/upload', uploadRoutes)
app.use('/api/universities', universityRoutes)
app.use('/api/users', userRoutes)
app.use('/api/messages', messageRoutes)
app.use('/api/admin', adminRoutes)

const PORT = process.env.PORT || 5000
app.listen(PORT, () => console.log(`Server running on port ${PORT}`))