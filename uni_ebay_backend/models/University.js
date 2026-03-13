import mongoose from 'mongoose'

const universitySchema = new mongoose.Schema({
  name: { type: String, required: true, unique: true },
  city: { type: String, required: true },
  country: { type: String, required: true },
  isActive: { type: Boolean, default: true },
}, { timestamps: true })

export default mongoose.model('University', universitySchema)