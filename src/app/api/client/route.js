import { NextResponse } from 'next/server';
import { getClient, postClient } from '../../../lib/backend/routes';

export async function GET(request) {
  try {
    // Call the migrated getClient function
    const result = await getClient('users', {
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
