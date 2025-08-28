import { NextResponse } from 'next/server';
import { createBooking, seeBookings, cancelBooking } from '../../../lib/backend/routes';

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
      return NextResponse.json(bodyData, { status: 200 });
    } else {
      const bodyData = JSON.parse(result.body);
      const statusCode = parseInt(result.statusCode);
      
      // Handle specific error cases with meaningful messages
      let errorMessage = 'Booking creation failed';
      
      if (statusCode === 400 && bodyData.code === 'BFORMAT') {
        errorMessage = 'Invalid booking details. Please check your date and time selection.';
      } else if (statusCode === 401) {
        errorMessage = 'Please log in to create a booking.';
      } else if (statusCode === 502) {
        errorMessage = 'Service temporarily unavailable. Please try again later.';
      } else if (bodyData.msg) {
        errorMessage = bodyData.msg;
      }
      
      // Log the error for debugging
      console.error('Booking creation failed:', {
        statusCode,
        bodyData,
        errorMessage,
        originalBody: body
      });
      
      return NextResponse.json({
        code: bodyData.code || 'ERROR',
        msg: errorMessage,
        originalError: bodyData
      }, { status: statusCode });
    }
  } catch (error) {
    console.error('Create booking error:', error);
    return NextResponse.json(
      { 
        code: 'ERROR', 
        msg: 'Unable to create booking. Please check your internet connection and try again.' 
      },
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
