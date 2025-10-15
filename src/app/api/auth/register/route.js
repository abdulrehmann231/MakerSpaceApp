import { NextResponse } from 'next/server';
import { postClient } from '../../../../lib/backend/routes';

export async function POST(request) {
  try {
    const body = await request.json();
    const { email, password, firstname, lastname } = body;
    const normalizedEmail = typeof email === 'string' ? email.trim().toLowerCase() : email;
    
    // Call the migrated postClient function
    const result = await postClient('users', {
      body: { 
        email: normalizedEmail, 
        newpassword: password, 
        firstname, 
        lastname, 
        createaccount: true 
      },
      headers: { cookie: request.headers.get('cookie') }
    });

    // Handle the response
    if (result.statusCode === '302') {
      // Parse the body since it's already a JSON string from the original backend
      const bodyData = JSON.parse(result.body);
      const response = NextResponse.json(bodyData, { status: 200 });
      
      // Set cookies if registration was successful
      if (result.multiValueHeaders && result.multiValueHeaders['Set-Cookie']) {
        result.multiValueHeaders['Set-Cookie'].forEach(cookie => {
          // Parse cookie properly to handle URL encoding
          const [nameValue, ...options] = cookie.split(';');
          const [name, value] = nameValue.split('=');
          
          // Decode the value if it's URL encoded
          const decodedValue = decodeURIComponent(value);
          
          response.cookies.set(name.trim(), decodedValue, {
            httpOnly: cookie.includes('HttpOnly'),
            secure: cookie.includes('Secure'),
            sameSite: 'lax'
          });
        });
      }
      
      return response;
    } else {
      // Parse the body for error responses too
      const bodyData = JSON.parse(result.body);
      return NextResponse.json(bodyData, { status: parseInt(result.statusCode) });
    }
  } catch (error) {
    console.error('Register error:', error);
    return NextResponse.json(
      { code: 'ERROR', msg: error.message },
      { status: 500 }
    );
  }
}
