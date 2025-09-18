import { NextResponse } from 'next/server'
import { getUser } from '@/lib/backend/db'
import { createPasswordResetToken, cleanupExpiredTokens } from '@/lib/backend/db'
import { getCookie } from '@/lib/api'
import crypto from 'crypto'
import { Resend } from 'resend'

// Initialize Resend client
const resend = new Resend(process.env.RESEND_API_KEY)

// Theme color mapping
const themeColors = {
  'color-theme-blue': '#2CAAE6',
  'color-theme-red': '#FF4141',
  'color-theme-green': '#12c150',
  'color-theme-pink': '#ff0076',
  'color-theme-yellow': '#ffc617',
  'color-theme-orange': '#ff8900',
  'color-theme-gray': '#485563',
  'color-theme-black': '#333333'
}

// Password reset email template
const getPasswordResetTemplate = (firstName, resetLink, themeColor = 'color-theme-blue', isDarkMode = false) => {
  const primaryColor = themeColors[themeColor] || themeColors['color-theme-blue']
  const backgroundColor = isDarkMode ? '#1a1a1a' : '#f9f9f9'
  const textColor = isDarkMode ? '#ffffff' : '#333333'
  const cardBackground = isDarkMode ? 'rgba(255, 255, 255, 0.1)' : '#ffffff'
  const secondaryTextColor = isDarkMode ? 'rgba(255, 255, 255, 0.7)' : '#666666'
  console.log(firstName, resetLink, themeColor, isDarkMode,cardBackground,secondaryTextColor,textColor,primaryColor,backgroundColor)
  return {
    subject: 'Password Reset Request - Makerspace Delft',
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; background-color: ${backgroundColor};">
        <div style="background: linear-gradient(135deg, ${primaryColor} 0%, ${primaryColor}dd 100%); padding: 30px; text-align: center;">
          <h1 style="color: white; margin: 0;">Makerspace Delft</h1>
          <p style="color: white; margin: 10px 0 0 0;">Password Reset Request</p>
        </div>
        
        <div style="padding: 30px; background-color: ${backgroundColor};">
          <h2 style="color: ${textColor}; margin-top: 0;">Reset Your Password</h2>
          <p style="color: ${textColor};">Hello ${firstName || 'User'},</p>
          <p style="color: ${textColor};">You have requested to reset your password for your Makerspace Delft account.</p>
          
          <div style="background: ${cardBackground}; padding: 20px; border-radius: 8px; margin: 20px 0; border: 1px solid ${isDarkMode ? 'rgba(255, 255, 255, 0.2)' : '#eee'};">
            <p style="color: ${textColor}; margin: 0;">Click the button below to reset your password:</p>
            <div style="text-align: center; margin: 20px 0;">
              <a href="${resetLink}" 
                 style="background: ${primaryColor}; color: white; padding: 12px 30px; text-decoration: none; border-radius: 5px; display: inline-block;">
                Reset Password
              </a>
            </div>
            <p style="color: ${textColor}; font-size: 12px; margin: 0;">
              Or copy and paste this link into your browser:<br>
              <span style="word-break: break-all;">${resetLink}</span>
            </p>
          </div>
          
          <p style="color: ${textColor};"><strong>Important:</strong> This link will expire in 10 minutes for security reasons.</p>
          <p style="color: ${textColor};">If you didn't request this password reset, please ignore this email.</p>
          
          <div style="margin-top: 30px; padding-top: 20px; border-top: 1px solid ${isDarkMode ? 'rgba(255, 255, 255, 0.2)' : '#eee'};">
            <p style="color: ${secondaryTextColor}; font-size: 14px;">
              Best regards,<br>
              The Makerspace Delft Team<br>
              <a href="mailto:contact@makerspacedelft.nl" style="color: ${primaryColor};">contact@makerspacedelft.nl</a>
            </p>
          </div>
        </div>
      </div>
    `
  }
}

// Direct email sending function
async function sendPasswordResetEmailDirect(email, firstName, resetLink, themeColor, isDarkMode) {
  try {
    // Generate email content
    const emailContent = getPasswordResetTemplate(firstName, resetLink, themeColor, isDarkMode)

    if (!process.env.RESEND_API_KEY) {
      throw new Error('Email service not configured')
    }

    await resend.emails.send({
      from: process.env.EMAIL_FROM || 'delivered@resend.dev',
      to: email,
      subject: emailContent.subject,
      html: emailContent.html
    })

    console.log(`Password reset email sent successfully to ${email}`)
    return { success: true }

  } catch (error) {
    console.error('Email sending error:', error)
    throw error
  }
}

export async function POST(request) {
  try {
    const { email , themeColor, isDarkMode } = await request.json()
    
    console.log("themeColor", themeColor)
    console.log("isDarkMode", isDarkMode)
    if (!email) {
      return NextResponse.json(
        { success: false, message: 'Email is required' },
        { status: 400 }
      )
    }

    // Check if user exists
    const user = await getUser(email, 'users')
    if (!user) {
      return NextResponse.json(
        { success: false, message: 'No user found with this email address' },
        { status: 404 }
      )
    }

    // Generate a secure random token
    const token = crypto.randomBytes(32).toString('hex')
    
    // Set expiration time (10 minutes from now)
    const expiresAt = new Date(Date.now() + 10 * 60 * 1000)
    
    // Store the token in database
    const tokenResult = await createPasswordResetToken(email, token, expiresAt)
    if (!tokenResult) {
      return NextResponse.json(
        { success: false, message: 'Failed to create reset token' },
        { status: 500 }
      )
    }

    // Get the host URL dynamically
    const host = request.headers.get('host')
    const protocol = request.headers.get('x-forwarded-proto') || 'http'
    const baseUrl = `${protocol}://${host}`
    
    // Create reset link
    const resetLink = `${baseUrl}/reset-password?token=${token}`
    
    // Send email directly 
    try {
      await sendPasswordResetEmailDirect(email, user.firstname || 'User', resetLink, themeColor, isDarkMode)
    } catch (emailError) {
      console.error('Email sending error:', emailError)
      return NextResponse.json(
        { success: false, message: 'Failed to send reset email' },
        { status: 500 }
      )
    }

    // Clean up expired tokens
    await cleanupExpiredTokens()

    return NextResponse.json({
      success: true,
      message: 'Password reset email sent successfully'
    })

  } catch (error) {
    console.error('Forgot password error:', error)
    return NextResponse.json(
      { success: false, message: 'Internal server error' },
      { status: 500 }
    )
  }
}
