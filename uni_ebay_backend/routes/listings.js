import express from 'express'
import { getListings, getListing, createListing, markSold, deleteListing, getMyListings } from '../controllers/listingController.js'
import protect from '../middleware/auth.js'

const router = express.Router()

router.get('/my', protect, getMyListings)      // must be above /:id
router.get('/', getListings)
router.get('/:id', getListing)
router.post('/', protect, createListing)
router.put('/:id/sold', protect, markSold)
router.delete('/:id', protect, deleteListing)
router.post('/:id/message', protect, (req, res) => {
  res.json({ message: 'Message received' })
})

export default router