import { NextResponse } from 'next/server';
import { createBooking, seeBookings, cancelBooking } from '../../../lib/backend/routes';
import { sendBookingConfirmationEmail } from '../../../lib/api';

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const from = searchParams.get('from');
    const to = searchParams.get('to');
    const see = searchParams.get('see');

    // Call the migrated seeBookings function
    const result = await seeBookings('users', 'bookings', 'settings', {
      queryStringParameters: { from, to, see },
      headers: { cookie: request.headers.get('cookie') }
    });

    // Handle the response
    if (result.statusCode === '200') {
      const bodyData = JSON.parse(result.body);
      return NextResponse.json(bodyData, { status: 200 });
    } else {
      const bodyData = JSON.parse(result.body);
      return NextResponse.json(bodyData, { status: parseInt(result.statusCode) });
    }
  } catch (error) {
    console.error('Get bookings error:', error);
    return NextResponse.json(
      { code: 'ERROR', msg: error.message },
      { status: 500 }
    );
  }
}

export async function POST(request) {
  try {
    const body = await request.json();
    const { date, start, end, npeople, description } = body;

    // Call the migrated createBooking function
    const result = await createBooking('users', 'bookings', {
      body: { date, start, end, npeople, description },
      headers: { cookie: request.headers.get('cookie') }
    });

    // Handle the response
    if (result.statusCode === '200') {
      const bodyData = JSON.parse(result.body);
      
      // Send booking confirmation email
      try {
        // Get user email from cookies
        const cookies = request.headers.get('cookie');
        const userCookie = cookies?.split(';').find(c => c.trim().startsWith('user='));
        const userEmail = userCookie ? decodeURIComponent(userCookie.split('=')[1]) : null;
        
        if (userEmail) {
          // Send email using utility function (this will be called from client-side)
          // We'll trigger it by setting a flag in the response
          console.log('Booking created successfully, email should be sent from client-side');
        }
      } catch (emailError) {
        console.error('Email sending error:', emailError);
        // Don't fail the booking if email fails
      }
      
      return NextResponse.json(bodyData, { status: 200 });
    } else {
      const bodyData = JSON.parse(result.body);
      return NextResponse.json(bodyData, { status: parseInt(result.statusCode) });
    }
  } catch (error) {
    console.error('Create booking error:', error);
    return NextResponse.json(
      { code: 'ERROR', msg: error.message },
      { status: 500 }
    );
  }
}

export async function DELETE(request) {
  try {
    const body = await request.json();
    const { id } = body;

    // Call the migrated cancelBooking function
    const result = await cancelBooking('users', 'bookings', {
      body: { id },
      headers: { cookie: request.headers.get('cookie') }
    });

    // Handle the response
    if (result.statusCode === '200') {
      const bodyData = JSON.parse(result.body);
      return NextResponse.json(bodyData, { status: 200 });
    } else {
      const bodyData = JSON.parse(result.body);
      return NextResponse.json(bodyData, { status: parseInt(result.statusCode) });
    }
  } catch (error) {
    console.error('Cancel booking error:', error);
    return NextResponse.json(
      { code: 'ERROR', msg: error.message },
      { status: 500 }
    );
  }
}
