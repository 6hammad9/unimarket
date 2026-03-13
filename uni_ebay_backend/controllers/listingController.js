import Listing from '../models/Listing.js'
import User from '../models/User.js'
import { v2 as cloudinary } from 'cloudinary'

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
})

// Get all listings
export const getListings = async (req, res) => {
  try {
    const { category, search, university, city } = req.query

    let filter = { sold: false }
    if (category) filter.category = category
    if (search) filter.title = { $regex: search, $options: 'i' }
    if (university) filter.university = university

    // Filter by city — find all universities in that city first
    if (city) {
      const { default: University } = await import('../models/University.js')
      const unis = await University.find({ city: { $regex: city, $options: 'i' } })
      filter.university = { $in: unis.map(u => u._id) }
    }

    const listings = await Listing.find(filter)
      .populate('seller', 'name email phone')
      .populate('university', 'name city')
      .sort({ createdAt: -1 })

    res.json(listings)
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message })
  }
}

// Get single listing
export const getListing = async (req, res) => {
  try {
    const listing = await Listing.findById(req.params.id)
      .populate('seller', 'name email phone')
      .populate('university', 'name city')

    if (!listing) return res.status(404).json({ message: 'Listing not found' })
    res.json(listing)
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message })
  }
}

// Get my listings
export const getMyListings = async (req, res) => {
  try {
    const listings = await Listing.find({ seller: req.user.id })
      .populate('university', 'name city')
      .sort({ createdAt: -1 })
    res.json(listings)
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message })
  }
}

// Create listing — university auto attached from seller profile
export const createListing = async (req, res) => {
  try {
    const { title, description, price, category, images } = req.body

    const seller = await User.findById(req.user.id)

    const listing = await Listing.create({
      title, description, price, category, images,
      seller: req.user.id,
      university: seller.university || null
    })

    res.status(201).json(listing)
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message })
  }
}

// Mark as sold
export const markSold = async (req, res) => {
  try {
    const listing = await Listing.findById(req.params.id)
    if (!listing) return res.status(404).json({ message: 'Listing not found' })
    if (listing.seller.toString() !== req.user.id) {
      return res.status(401).json({ message: 'Not your listing' })
    }
    listing.sold = true
    await listing.save()
    res.json({ message: 'Marked as sold' })
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message })
  }
}

// Delete listing
export const deleteListing = async (req, res) => {
  try {
    const listing = await Listing.findById(req.params.id)
    if (!listing) return res.status(404).json({ message: 'Listing not found' })
    if (listing.seller.toString() !== req.user.id) {
      return res.status(401).json({ message: 'Not your listing' })
    }

    if (listing.images && listing.images.length > 0) {
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
    res.status(500).json({ message: 'Server error', error: err.message })
  }
}