import express from 'express'
import { upload, uploadToCloudinary } from '../utils/cloudinary.js'
import protect from '../middleware/auth.js'

const router = express.Router()

router.post('/', protect, upload.array('images', 5), async (req, res) => {
  try {
    const uploadPromises = req.files.map(file => 
      uploadToCloudinary(file.buffer, file.mimetype)
    )
    const urls = await Promise.all(uploadPromises)
    res.json({ urls })
  } catch (err) {
    res.status(500).json({ message: 'Upload failed', error: err.message })
  }
})

export default router