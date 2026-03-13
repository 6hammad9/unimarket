import express from 'express'
import protect, { adminOnly } from '../middleware/auth.js'
import {
  sendMessage,
  getMyMessages,
  getAllMessages,
  markRead,
  markResolved,
  deleteMessage
} from '../controllers/messageController.js'

const router = express.Router()

// User routes
router.post('/', protect, sendMessage)
router.get('/my', protect, getMyMessages)

// Admin routes
router.get('/', protect, adminOnly, getAllMessages)
router.put('/:id/read', protect, adminOnly, markRead)
router.put('/:id/resolve', protect, adminOnly, markResolved)
router.delete('/:id', protect, adminOnly, deleteMessage)

export default router