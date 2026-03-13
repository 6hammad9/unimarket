import express from 'express'
import protect, { adminOnly } from '../middleware/auth.js'
import { getStats, getUsers, deleteUser, toggleAdmin, editUser, getAllListings, editListing, adminDeleteListing } from '../controllers/adminController.js'



const router = express.Router()

router.use(protect, adminOnly) // all admin routes are protected

router.get('/stats', getStats)
router.get('/users', getUsers)
router.delete('/users/:id', deleteUser)
router.put('/users/:id/toggle-admin', toggleAdmin)
router.get('/listings', getAllListings)
router.put('/listings/:id', editListing)
router.put('/users/:id', editUser)
router.delete('/listings/:id', adminDeleteListing)

export default router