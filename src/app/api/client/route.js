import { NextResponse } from 'next/server';
import { getClient, postClient } from '../../../lib/backend/routes';
import { extractUser } from '../../../lib/backend/middleware';

export async function GET(request) {
  try {
    // Extract user from JWT token
    const user = await extractUser(request.headers, 'users');
    
    if (!user) {
      return NextResponse.json(
        { code: 'UNAUTHORIZED', msg: 'Authentication required' },
        { status: 401 }
      );
    }

    // Return user data without sensitive information
    return NextResponse.json({
      code: 'FOUND',
      msg: {
        ...user,
        hash: null,
        salt: null,
        token: null
      }
    }, { status: 200 });
  } catch (error) {
    console.error('Get client error:', error);
    return NextResponse.json(
      { code: 'ERROR', msg: error.message },
      { status: 500 }
    );
  }
}

export async function POST(request) {
  try {
    const body = await request.json();
    const { email, userdata, update } = body;

    // Extract user from JWT token
    const user = await extractUser(request.headers, 'users');
    
    if (!user) {
      return NextResponse.json(
        { code: 'UNAUTHORIZED', msg: 'Authentication required' },
        { status: 401 }
      );
    }

    // Verify user is updating their own data
    if (user.key !== email) {
      return NextResponse.json(
        { code: 'WRONGUSER', msg: 'Incorrect Username' },
        { status: 403 }
      );
    }

    // Call the migrated postClient function for user data updates
    const result = await postClient('users', {
      body: { email, userdata, update: true },
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
    console.error('Update client error:', error);
    return NextResponse.json(
      { code: 'ERROR', msg: error.message },
      { status: 500 }
    );
  }
}
