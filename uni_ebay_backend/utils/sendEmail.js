import dotenv from 'dotenv'
dotenv.config()
import nodemailer from 'nodemailer'

const transporter = nodemailer.createTransport({
  host: 'smtp-relay.brevo.com',
  port: 587,
  secure: false,
  auth: {
    user: process.env.BREVO_USER,
    pass: process.env.BREVO_PASS,
  }
})

transporter.verify((error) => {
  if (error) console.log('Email error:', error)
  else console.log('Email server ready')
})

export const sendVerificationEmail = async (email, token) => {
  const url = `${process.env.CLIENT_URL}/verify/${token}`
  await transporter.sendMail({
    from: '"CampusExchange" <hammadnaseer2230@gmail.com>',
    to: email,
    subject: 'Verify your CampusExchange account',
    html: `
      <div style="font-family: sans-serif; max-width: 480px; margin: 0 auto;">
        <h2 style="color: #0D3D3A;">Welcome to CampusExchange!</h2>
        <p>Click the button below to verify your email address.</p>
        <a href="${url}" style="display: inline-block; background: #2DD4BF; color: #0D3D3A; padding: 12px 24px; border-radius: 8px; text-decoration: none; font-weight: 500; margin: 16px 0;">
          Verify Email
        </a>
        <p style="color: #9ca3af; font-size: 13px;">This link expires in 24 hours.</p>
      </div>
    `
  })
}

export const sendResetEmail = async (email, token) => {
  const url = `${process.env.CLIENT_URL}/reset-password/${token}`
  await transporter.sendMail({
    from: '"CampusExchange" <hammadnaseer2230@gmail.com>',
    to: email,
    subject: 'Reset your CampusExchange password',
    html: `
      <div style="font-family: sans-serif; max-width: 480px; margin: 0 auto;">
        <h2 style="color: #0D3D3A;">Reset your password</h2>
        <p>Click the button below to reset your password.</p>
        <a href="${url}" style="display: inline-block; background: #2DD4BF; color: #0D3D3A; padding: 12px 24px; border-radius: 8px; text-decoration: none; font-weight: 500; margin: 16px 0;">
          Reset Password
        </a>
        <p style="color: #9ca3af; font-size: 13px;">This link expires in 1 hour. If you didn't request this, ignore this email.</p>
      </div>
    `
  })
}
