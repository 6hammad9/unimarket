import express from 'express'
import protect, { adminOnly } from '../middleware/auth.js'
import {
  getUniversities,
  getAllUniversities,
  createUniversity,
  updateUniversity,
  deleteUniversity
} from '../controllers/universityController.js'

const router = express.Router()

// Public — for register dropdown
router.get('/', getUniversities)

// Admin only
router.get('/all', protect, adminOnly, getAllUniversities)
router.post('/', protect, adminOnly, createUniversity)
router.put('/:id', protect, adminOnly, updateUniversity)
router.delete('/:id', protect, adminOnly, deleteUniversity)

export default router