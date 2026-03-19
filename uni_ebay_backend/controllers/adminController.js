import User from '../models/User.js'
import Listing from '../models/Listing.js'
import { v2 as cloudinary } from 'cloudinary'
import University from '../models/University.js'
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
})

// Get stats
export const getStats = async (req, res) => {
  try {
    const Message = (await import('../models/Message.js')).default

    const totalUsers = await User.countDocuments()
    const verifiedUsers = await User.countDocuments({ isVerified: true })
    const totalListings = await Listing.countDocuments()
    const activeListings = await Listing.countDocuments({ sold: false })
    const soldListings = await Listing.countDocuments({ sold: true })
    const unreadMessages = await Message.countDocuments({ isRead: false })

    res.json({ totalUsers, verifiedUsers, totalListings, activeListings, soldListings, unreadMessages })
  } catch (err) {
    res.status(500).json({ message: 'Server error' })
  }
}
export const toggleFeatured = async (req, res) => {
  try {
    const listing = await Listing.findById(req.params.id)
    if (!listing) return res.status(404).json({ message: 'Listing not found' })
    listing.isFeatured = !listing.isFeatured
    await listing.save()
    res.json({ message: `Listing ${listing.isFeatured ? 'featured' : 'unfeatured'}`, isFeatured: listing.isFeatured })
  } catch (err) {
    res.status(500).json({ message: 'Server error' })
  }
}
// Get all users
export const adminSearch = async (req, res) => {
  try {
    const { q } = req.query
    if (!q || q.trim().length < 2) {
      return res.json({ listings: [], users: [], universities: [] })
    }

    const regex = { $regex: q, $options: 'i' }

    const [listings, users, universities] = await Promise.all([
      Listing.find({ title: regex })
        .populate('seller', 'name email')
        .populate('university', 'name city')
        .limit(10)
        .sort({ createdAt: -1 }),

      User.find({ $or: [{ name: regex }, { email: regex }, { phone: regex }] })
        .select('-password -verificationToken -resetPasswordToken')
        .populate('university', 'name city')
        .limit(10),

      University.find({ $or: [{ name: regex }, { city: regex }, { country: regex }] })
        .limit(10)
    ])

    res.json({ listings, users, universities })
  } catch (err) {
    res.status(500).json({ message: 'Server error' })
  }
}
export const getUsers = async (req, res) => {
  try {
    const users = await User.find()
      .select('-password -verificationToken -resetPasswordToken')
      .populate('university', 'name city country')
      .sort({ createdAt: -1 })
    res.json(users)
  } catch (err) {
    res.status(500).json({ message: 'Server error' })
  }
}
export const deleteUnverifiedUsers = async (req, res) => {
  try {
    const result = await User.deleteMany({ isVerified: false })
    res.json({ message: `Deleted ${result.deletedCount} unverified accounts` })
  } catch (err) {
    res.status(500).json({ message: 'Server error' })
  }
}
// Delete user
export const deleteUser = async (req, res) => {
  try {
    const user = await User.findById(req.params.id)
    if (!user) return res.status(404).json({ message: 'User not found' })
    if (user.isAdmin) return res.status(400).json({ message: 'Cannot delete admin' })

    // Delete all their listings and images
    const listings = await Listing.find({ seller: req.params.id })
    for (const listing of listings) {
      if (listing.images?.length > 0) {
        const deletePromises = listing.images.map(imageUrl => {
          const parts = imageUrl.split('/')
          const filename = parts[parts.length - 1].split('.')[0]
          const folder = parts[parts.length - 2]
          return cloudinary.uploader.destroy(`${folder}/${filename}`)
        })
        await Promise.all(deletePromises)
      }
      await listing.deleteOne()
    }

    await user.deleteOne()
    res.json({ message: 'User and all their listings deleted' })
  } catch (err) {
    res.status(500).json({ message: 'Server error' })
  }
}

// Toggle admin status
export const toggleAdmin = async (req, res) => {
  try {
    const user = await User.findById(req.params.id)
    if (!user) return res.status(404).json({ message: 'User not found' })

    user.isAdmin = !user.isAdmin
    await user.save()

    res.json({ message: `User is now ${user.isAdmin ? 'admin' : 'regular user'}`, isAdmin: user.isAdmin })
  } catch (err) {
    res.status(500).json({ message: 'Server error' })
  }
}

// Get all listings (admin)
export const getAllListings = async (req, res) => {
  try {
    const listings = await Listing.find()
      .populate('seller', 'name email phone')
      .sort({ createdAt: -1 })
    res.json(listings)
  } catch (err) {
    res.status(500).json({ message: 'Server error' })
  }
}

// Edit listing (admin)
export const editListing = async (req, res) => {
  try {
    const { title, description, price, category, sold } = req.body
    const listing = await Listing.findByIdAndUpdate(
  req.params.id,
  { title, description, price, category, sold },
  { returnDocument: 'after' }
)
    if (!listing) return res.status(404).json({ message: 'Listing not found' })
    res.json(listing)
  } catch (err) {
    res.status(500).json({ message: 'Server error' })
  }
}

// Delete listing (admin)
export const adminDeleteListing = async (req, res) => {
  try {
    const listing = await Listing.findById(req.params.id)
    if (!listing) return res.status(404).json({ message: 'Listing not found' })

    if (listing.images?.length > 0) {
      const deletePromises = listing.images.map(imageUrl => {
        const parts = imageUrl.split('/')
        const filename = parts[parts.length - 1].split('.')[0]
        const folder = parts[parts.length - 2]
        return cloudinary.uploader.destroy(`${folder}/${filename}`)
      })
      await Promise.all(deletePromises)
    }

    await listing.deleteOne()
    res.json({ message: 'Listing deleted' })
  } catch (err) {
    res.status(500).json({ message: 'Server error' })
  }
}
export const editUser = async (req, res) => {
  try {
    const { name, email, phone, isVerified, university } = req.body
    const user = await User.findByIdAndUpdate(
  req.params.id,
  { name, email, phone, isVerified, university: university || null },
  { returnDocument: 'after' }
).select('-password -verificationToken -resetPasswordToken')
  .populate('university', 'name city country')

    if (!user) return res.status(404).json({ message: 'User not found' })
    res.json(user)
  } catch (err) {
    res.status(500).json({ message: 'Server error' })
  }
}
