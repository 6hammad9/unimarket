import mongoose from 'mongoose'

const messageSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  subject: { type: String, required: true },
  message: { type: String, required: true },
  isRead: { type: Boolean, default: false },
  isResolved: { type: Boolean, default: false },
}, { timestamps: true })

export default mongoose.model('Message', messageSchema)