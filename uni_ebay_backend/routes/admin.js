import express from 'express'
import protect, { adminOnly } from '../middleware/auth.js'
import { getAllUniversities } from '../controllers/universityController.js'
import { getStats, getUsers, deleteUser, toggleAdmin, editUser, getAllListings, editListing, adminDeleteListing } from '../controllers/adminController.js'
import { toggleFeatured } from '../controllers/adminController.js'
import { adminSearch } from '../controllers/adminController.js'



const router = express.Router()

router.use(protect, adminOnly) // all admin routes are protected

router.get('/stats', getStats)
router.get('/users', getUsers)
router.delete('/users/:id', deleteUser)
router.get('/universities', getAllUniversities)
router.put('/listings/:id/feature', toggleFeatured)
router.put('/users/:id/toggle-admin', toggleAdmin)
router.get('/listings', getAllListings)
router.put('/listings/:id', editListing)
router.get('/search', adminSearch)
router.put('/users/:id', editUser)
router.delete('/listings/:id', adminDeleteListing)

export default router