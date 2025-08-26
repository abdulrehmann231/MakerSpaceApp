import { NextResponse } from 'next/server'
import { sendBookingConfirmationEmail, sendWelcomeEmail } from '@/lib/email'

export async function POST(request) {
  try {
    const body = await request.json()
    const { type, userEmail, bookingDetails, firstName } = body

    if (!userEmail) {
      return NextResponse.json(
        { error: 'User email is required' },
        { status: 400 }
      )
    }

    let result

    switch (type) {
      case 'booking-confirmation':
        if (!bookingDetails) {
          return NextResponse.json(
            { error: 'Booking details are required' },
            { status: 400 }
          )
        }
        result = await sendBookingConfirmationEmail(userEmail, bookingDetails)
        break

      case 'welcome':
        if (!firstName) {
          return NextResponse.json(
            { error: 'First name is required' },
            { status: 400 }
          )
        }
        result = await sendWelcomeEmail(userEmail, firstName)
        break

      default:
        return NextResponse.json(
          { error: 'Invalid email type' },
          { status: 400 }
        )
    }

    if (result.success) {
      return NextResponse.json(
        { message: 'Email sent successfully', data: result.data },
        { status: 200 }
      )
    } else {
      console.error('Email sending failed:', result.error)
      return NextResponse.json(
        { error: 'Failed to send email', details: result.error },
        { status: 500 }
      )
    }

  } catch (error) {
    console.error('Email API error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
