import { NextResponse } from 'next/server'
import { getPasswordResetToken } from '@/lib/backend/db'

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url)
    const token = searchParams.get('token')
    
    if (!token) {
      return NextResponse.json(
        { valid: false, message: 'Token is required' },
        { status: 400 }
      )
    }

    // Verify the token
    const tokenData = await getPasswordResetToken(token)
    
    if (!tokenData) {
      return NextResponse.json({
        valid: false,
        message: 'Invalid or expired reset token'
      })
    }

    return NextResponse.json({
      valid: true,
      message: 'Token is valid',
      email: tokenData.email
    })

  } catch (error) {
    console.error('Verify reset token error:', error)
    return NextResponse.json(
      { valid: false, message: 'Internal server error' },
      { status: 500 }
    )
  }
}
