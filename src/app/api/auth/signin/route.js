import { NextResponse } from 'next/server';
import { postClient } from '../../../../lib/backend/routes';

export async function POST(request) {
  try {
    const body = await request.json();
    const { email, password } = body;
    
    // Call the migrated postClient function
    const result = await postClient('users', {
      body: { email, password, createaccount: false },
      headers: { cookie: request.headers.get('cookie') }
    });

    // Handle the response
    if (result.statusCode === '200') {
      const response = NextResponse.json(result.body, { status: 200 });
      
      // Set cookies if authentication was successful
      if (result.multiValueHeaders && result.multiValueHeaders['Set-Cookie']) {
        result.multiValueHeaders['Set-Cookie'].forEach(cookie => {
          response.cookies.set(cookie.split('=')[0], cookie.split('=')[1].split(';')[0], {
            httpOnly: cookie.includes('HttpOnly'),
            secure: cookie.includes('Secure'),
            sameSite: 'lax'
          });
        });
      }
      
      return response;
    } else {
      return NextResponse.json(result.body, { status: parseInt(result.statusCode) });
    }
  } catch (error) {
    console.error('Signin error:', error);
    return NextResponse.json(
      { code: 'ERROR', msg: error.message },
      { status: 500 }
    );
  }
}
