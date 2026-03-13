import express from 'express'
import cors from 'cors'
import dotenv from 'dotenv'
import mongoose from 'mongoose'
import authRoutes from './routes/auth.js'
import listingRoutes from './routes/listings.js'
import uploadRoute from './routes/upload.js'
import adminRoutes from './routes/admin.js'

dotenv.config()

const app = express()
app.use(cors())
app.use(express.json())

mongoose.connect(process.env.MONGO_URI)
  .then(() => console.log('MongoDB connected'))
  .catch((err) => console.log('DB error:', err))

app.get('/', (req, res) => {
  res.json({ message: 'API is running' })
})
app.use('/api/admin', adminRoutes)
app.use('/api/auth', authRoutes)
app.use('/api/listings', listingRoutes)
app.use('/api/upload', uploadRoute)
const PORT = process.env.PORT || 5000
app.listen(PORT, () => console.log(`Server running on port ${PORT}`))