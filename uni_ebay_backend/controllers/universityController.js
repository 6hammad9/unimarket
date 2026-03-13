import University from '../models/University.js'

// Get all active universities — for register dropdown
export const getUniversities = async (req, res) => {
  try {
    const universities = await University.find({ isActive: true })
      .sort({ country: 1, city: 1, name: 1 })
    res.json(universities)
  } catch (err) {
    res.status(500).json({ message: 'Server error' })
  }
}

// Get all universities — for admin
export const getAllUniversities = async (req, res) => {
  try {
    const universities = await University.find()
      .sort({ country: 1, city: 1, name: 1 })
    res.json(universities)
  } catch (err) {
    res.status(500).json({ message: 'Server error' })
  }
}

// Create university — admin only
export const createUniversity = async (req, res) => {
  try {
    const { name, city, country } = req.body
    const exists = await University.findOne({ name })
    if (exists) return res.status(400).json({ message: 'University already exists' })

    const university = await University.create({ name, city, country })
    res.status(201).json(university)
  } catch (err) {
    res.status(500).json({ message: 'Server error' })
  }
}

// Update university — admin only
export const updateUniversity = async (req, res) => {
  try {
    const { name, city, country, isActive } = req.body
    const university = await University.findByIdAndUpdate(
  req.params.id,
  { name, city, country, isActive },
  { returnDocument: 'after' }
)
    if (!university) return res.status(404).json({ message: 'University not found' })
    res.json(university)
  } catch (err) {
    res.status(500).json({ message: 'Server error' })
  }
}

// Delete university — admin only
export const deleteUniversity = async (req, res) => {
  try {
    const university = await University.findByIdAndDelete(req.params.id)
    if (!university) return res.status(404).json({ message: 'University not found' })
    res.json({ message: 'University deleted' })
  } catch (err) {
    res.status(500).json({ message: 'Server error' })
  }
}