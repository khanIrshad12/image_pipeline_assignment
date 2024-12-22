import mongoose from 'mongoose'

const imageSchema = new mongoose.Schema({
  originalImage: {
    path: String,
    filename: String,
    uploadedAt: { type: Date, default: Date.now }
  },
  mask: {
    path: String,
    filename: String,
    uploadedAt: { type: Date, default: Date.now }
  },
  status: {
    type: String,
    enum: ['pending', 'processed'],
    default: 'pending'
  },
  createdAt: { type: Date, default: Date.now }
})

export default mongoose.models.Image || mongoose.model('Image', imageSchema)