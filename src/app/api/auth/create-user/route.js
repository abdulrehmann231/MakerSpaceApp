import { NextResponse } from 'next/server'
import crypto from 'crypto'
import { extractUser } from '@/lib/backend/middleware'
import { getUser, register, createPasswordResetToken, cleanupExpiredTokens } from '@/lib/backend/db'
import { Resend } from 'resend'

// Theme color mapping (aligned with forgot-password)
const themeColors = {
  'color-theme-blue': '#2CAAE6',
  'color-theme-green': '#3CB371',
  'color-theme-red': '#E53E3E',
  'color-theme-orange': '#ED8936',
  'color-theme-purple': '#9F7AEA',
  'color-theme-yellow': '#ECC94B',
  'color-theme-pink': '#ED64A6'
}

// Initialize Resend client
const resend = new Resend(process.env.RESEND_API_KEY)

// Themed invite/reset email template
const buildInviteEmail = (firstName, resetLink, themeColorKey = 'color-theme-blue', isDarkMode = false) => {
  const safeName = firstName || 'there'
  const primary = themeColors[themeColorKey] || themeColors['color-theme-blue']
  const bg = isDarkMode ? '#111827' : '#f6f8fb'
  const cardBg = isDarkMode ? '#1f2937' : '#ffffff'
  const textColor = isDarkMode ? '#e5e7eb' : '#111827'
  const muted = isDarkMode ? '#9ca3af' : '#6b7280'
  return {
    subject: 'Set up your Makerspace account',
    html: `
      <div style="background:${bg};padding:24px;font-family:Arial,sans-serif;color:${textColor}">
        <div style="max-width:560px;margin:0 auto;background:${cardBg};border-radius:10px;overflow:hidden;border:1px solid ${isDarkMode ? '#374151' : '#e5e7eb'}">
          <div style="background:${primary};padding:16px 20px;color:#fff">
            <h2 style="margin:0;font-size:18px">Makerspace Delft</h2>
          </div>
          <div style="padding:24px">
            <p style="margin:0 0 12px 0">Hi ${safeName},</p>
            <p style="margin:0 0 16px 0;color:${muted}">An administrator created an account for you. Use the secure link below to set your password.</p>
            <p style="margin:0 0 16px 0">
              <a href="${resetLink}" style="display:inline-block;background:${primary};color:#fff;padding:10px 16px;text-decoration:none;border-radius:6px">Set password</a>
            </p>
            <p style="margin:0 0 8px 0;color:${muted}">If the button doesn't work, copy and paste this URL:</p>
            <p style="margin:0 0 16px 0;color:${muted};word-break:break-all">${resetLink}</p>
            <p style="margin:0;color:${muted}">This link expires in 48 hours.</p>
          </div>
        </div>
      </div>
    `
  }
}

export async function POST(request) {
  try {
    const adminUser = await extractUser(request.headers, 'users')
    if (!adminUser || adminUser.user !== 'admin') {
      return NextResponse.json({ code: 'UNAUTHORIZED', msg: 'Admin required' }, { status: 401 })
    }

    const { email, firstname = '', lastname = '', themeColor, isDarkMode } = await request.json()

    if (!email) {
      return NextResponse.json({ code: 'BAD_REQUEST', msg: 'Email is required' }, { status: 400 })
    }

    // If user already exists, we can still re-send invite link optionally
    let user = await getUser(email, 'users')
    if (!user) {
      // Create user with no password yet; register() strips password fields
      const newUserObj = {
        email,
        firstname,
        lastname,
        user: 'user',
        invited: true,
        createdBy: adminUser.email || adminUser.key,
        createdAt: new Date()
      }
      const res = await register(newUserObj, 'users', {})
      if (!res || !res.insertedId) {
        return NextResponse.json({ code: 'ERROR', msg: 'Failed to create user' }, { status: 500 })
      }
      user = await getUser(email, 'users')
    }

    // Create password reset token (48 hours for invites)
    const token = crypto.randomBytes(32).toString('hex')
    const expiresAt = new Date(Date.now() + 48 * 60 * 60 * 1000)
    const tokenResult = await createPasswordResetToken(email, token, expiresAt)
    if (!tokenResult) {
      return NextResponse.json({ code: 'ERROR', msg: 'Failed to create reset token' }, { status: 500 })
    }

    // Build base URL
    const host = request.headers.get('host')
    const protocol = request.headers.get('x-forwarded-proto') || 'http'
    const baseUrl = `${protocol}://${host}`
    const resetLink = `${baseUrl}/reset-password?token=${token}`

    // Send email via Resend
    if (!process.env.RESEND_API_KEY) {
      return NextResponse.json({ code: 'ERROR', msg: 'Email service not configured' }, { status: 500 })
    }

    const { subject, html } = buildInviteEmail(user.firstname || 'User', resetLink, themeColor, isDarkMode)
    await resend.emails.send({
      from: process.env.EMAIL_FROM || 'delivered@resend.dev',
      to: email,
      subject,
      html
    })

    await cleanupExpiredTokens()

    return NextResponse.json({ code: 'INVITED', msg: true }, { status: 200 })
  } catch (error) {
    console.error('Create user (admin) error:', error)
    return NextResponse.json({ code: 'ERROR', msg: 'Internal server error' }, { status: 500 })
  }
}


