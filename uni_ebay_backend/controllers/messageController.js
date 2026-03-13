import Message from '../models/Message.js'

// User sends a message
export const sendMessage = async (req, res) => {
  try {
    const { subject, message } = req.body

    if (!subject || !message) {
      return res.status(400).json({ message: 'Subject and message are required' })
    }

    const newMessage = await Message.create({
      user: req.user.id,
      subject,
      message
    })

    res.status(201).json({ message: 'Message sent successfully' })
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message })
  }
}

// User gets their own messages
export const getMyMessages = async (req, res) => {
  try {
    const messages = await Message.find({ user: req.user.id })
      .sort({ createdAt: -1 })
    res.json(messages)
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message })
  }
}

// Admin gets all messages
export const getAllMessages = async (req, res) => {
  try {
    const messages = await Message.find()
      .populate('user', 'name email university')
      .sort({ createdAt: -1 })
    res.json(messages)
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message })
  }
}

// Admin marks as read
export const markRead = async (req, res) => {
  try {
    const msg = await Message.findByIdAndUpdate(
      req.params.id,
      { isRead: true },
      { returnDocument: 'after' }
    )
    if (!msg) return res.status(404).json({ message: 'Message not found' })
    res.json(msg)
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message })
  }
}

// Admin marks as resolved
export const markResolved = async (req, res) => {
  try {
    const msg = await Message.findByIdAndUpdate(
      req.params.id,
      { isResolved: true, isRead: true },
      { returnDocument: 'after' }
    )
    if (!msg) return res.status(404).json({ message: 'Message not found' })
    res.json(msg)
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message })
  }
}

// Admin deletes message
export const deleteMessage = async (req, res) => {
  try {
    await Message.findByIdAndDelete(req.params.id)
    res.json({ message: 'Message deleted' })
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message })
  }
}