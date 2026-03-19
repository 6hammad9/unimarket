import bcrypt from 'bcryptjs'
import jwt from 'jsonwebtoken'
import crypto from 'crypto'
import User from '../models/User.js'
import { sendVerificationEmail, sendResetEmail } from '../utils/sendEmail.js'

export const register = async (req, res) => {
  try {
    const { name, email, password, phone, university } = req.body

    // Password strength check
    const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[^A-Za-z\d]).{8,}$/
    if (!passwordRegex.test(password)) {
      return res.status(400).json({
        message: 'Password must be at least 8 characters and include uppercase, lowercase, number and special character (@$!%*?&)'
      })
    }

    const existingUser = await User.findOne({ email })

    // If user exists but is not verified
    // If user exists but is not verified
if (existingUser && !existingUser.isVerified) {
  // Check cooldown — 2 minutes
  const cooldown = 2 * 60 * 1000
  const timeSinceLastEmail = Date.now() - new Date(existingUser.updatedAt).getTime()

  if (timeSinceLastEmail < cooldown) {
    const secondsLeft = Math.ceil((cooldown - timeSinceLastEmail) / 1000)
    return res.status(429).json({
      message: `Please wait ${secondsLeft} seconds before requesting a new verification email.`,
      secondsLeft
    })
  }

  // Update password, token and expiry
  const hashed = await bcrypt.hash(password, 10)
  const verificationToken = crypto.randomBytes(32).toString('hex')
  const verificationTokenExpiry = new Date(Date.now() + 24 * 60 * 60 * 1000)

  existingUser.password = hashed
  existingUser.name = name
  existingUser.phone = phone
  existingUser.verificationToken = verificationToken
  existingUser.verificationTokenExpiry = verificationTokenExpiry
  await existingUser.save()

  await sendVerificationEmail(email, verificationToken)

  return res.json({ message: 'Verification email resent! Please check your inbox.' })
}

    // If user exists and is verified
    if (existingUser && existingUser.isVerified) {
      return res.status(400).json({ message: 'Email already registered. Please login.' })
    }

    const hashed = await bcrypt.hash(password, 10)
    const verificationToken = crypto.randomBytes(32).toString('hex')
    const verificationTokenExpiry = new Date(Date.now() + 24 * 60 * 60 * 1000)

    await User.create({
  name,
  email,
  password: hashed,
  phone,
  university: university || null,
  verificationToken,
  verificationTokenExpiry
})
    await sendVerificationEmail(email, verificationToken)

    res.json({ message: 'Registration successful! Please check your email to verify your account.' })

  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message })
  }
}

export const verifyEmail = async (req, res) => {
  try {
    const { token } = req.params

    const user = await User.findOne({
      verificationToken: token,
      verificationTokenExpiry: { $gt: Date.now() }
    })

    if (!user) return res.status(400).json({ message: 'Invalid or expired token' })

    user.isVerified = true
    user.verificationToken = undefined
    user.verificationTokenExpiry = undefined
    await user.save()

    res.json({ message: 'Email verified successfully! You can now log in.' })

  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message })
  }
}

export const login = async (req, res) => {
  try {
    const { email, password } = req.body

    const user = await User.findOne({ email })
    if (!user) return res.status(400).json({ message: 'Invalid credentials' })

    if (!user.isVerified) {
      return res.status(400).json({ message: 'Please verify your email before logging in' })
    }

    const match = await bcrypt.compare(password, user.password)
    if (!match) return res.status(400).json({ message: 'Invalid credentials' })

    const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, { expiresIn: '7d' })
res.json({
  token,
  user: {
    id: user._id,
    name: user.name,
    email: user.email,
    phone: user.phone,
    isAdmin: user.isAdmin,
    university: user.university
  }
})

  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message })
  }
}

export const forgotPassword = async (req, res) => {
  try {
    const { email } = req.body

    const user = await User.findOne({ email })
    if (!user) return res.status(400).json({ message: 'No account found with that email' })

    const resetToken = crypto.randomBytes(32).toString('hex')
    const resetPasswordExpiry = new Date(Date.now() + 60 * 60 * 1000) // 1 hour

    user.resetPasswordToken = resetToken
    user.resetPasswordExpiry = resetPasswordExpiry
    await user.save()

    await sendResetEmail(email, resetToken)

    res.json({ message: 'Password reset link sent to your email.' })

  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message })
  }
}

export const resetPassword = async (req, res) => {
  try {
    const { token } = req.params
    const { password } = req.body

    const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/
    if (!passwordRegex.test(password)) {
      return res.status(400).json({
        message: 'Password must be at least 8 characters and include uppercase, lowercase, number and special character'
      })
    }

    const user = await User.findOne({
      resetPasswordToken: token,
      resetPasswordExpiry: { $gt: Date.now() }
    })

    if (!user) return res.status(400).json({ message: 'Invalid or expired reset link' })

    user.password = await bcrypt.hash(password, 10)
    user.resetPasswordToken = undefined
    user.resetPasswordExpiry = undefined
    await user.save()

    res.json({ message: 'Password reset successfully! You can now log in.' })

  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message })
  }
}