import mongoose from 'mongoose'

const listingSchema = new mongoose.Schema({
  title: { type: String, required: true },
  description: { type: String, required: true },
  price: { type: Number, required: true },
  category: {
    type: String,
    enum: ['books', 'electronics', 'clothing', 'furniture', 'other'],
    required: true
  },
  images: [{ type: String }],
  seller: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  university: { type: mongoose.Schema.Types.ObjectId, ref: 'University' },
  sold: { type: Boolean, default: false },
}, { timestamps: true })

export default mongoose.model('Listing', listingSchema)