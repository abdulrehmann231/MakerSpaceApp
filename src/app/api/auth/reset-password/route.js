import { NextResponse } from 'next/server'
import { getPasswordResetToken, markTokenAsUsed, changePassword } from '@/lib/backend/db'
import { hashPassword } from '@/lib/backend/encrypt'

export async function POST(request) {
  try {
    const { token, password } = await request.json()
    
    if (!token || !password) {
      return NextResponse.json(
        { success: false, message: 'Token and password are required' },
        { status: 400 }
      )
    }

    if (password.length < 4) {
      return NextResponse.json(
        { success: false, message: 'Password must be at least 4 characters long' },
        { status: 400 }
      )
    }

    // Verify the token
    const tokenData = await getPasswordResetToken(token)
    if (!tokenData) {
      return NextResponse.json(
        { success: false, message: 'Invalid or expired reset token' },
        { status: 400 }
      )
    }

    // Use the existing hashPassword function to encrypt the new password
    const pHash = hashPassword(tokenData.email, password)

    // Update the user's password using the existing changePassword function
    const updateResult = await changePassword(tokenData.email, password, 'users', pHash)
    if (!updateResult || updateResult.modifiedCount === 0) {
      return NextResponse.json(
        { success: false, message: 'Failed to update password' },
        { status: 500 }
      )
    }

    // Mark the token as used
    await markTokenAsUsed(token)

    return NextResponse.json({
      success: true,
      message: 'Password has been reset successfully'
    })

  } catch (error) {
    console.error('Reset password error:', error)
    return NextResponse.json(
      { success: false, message: 'Internal server error' },
      { status: 500 }
    )
  }
}
