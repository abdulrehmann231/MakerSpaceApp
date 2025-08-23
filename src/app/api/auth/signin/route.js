const apiURL = 'https://api.makerspacedelft.nl/prod';

export async function POST(request) {
  try {
    const { email, password } = await request.json();

    // Validate input
    if (!email || !password) {
      return Response.json(
        { error: 'Email and password are required' },
        { status: 400 }
      );
    }

    // Make request to original API
    const response = await fetch(apiURL + '?action=client', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      credentials: 'include',
      body: JSON.stringify({ email, password })
    });

    const data = await response.json();

    if (data.code === "LOGIN") {
      // Set cookies if needed
      const responseHeaders = new Headers();
      
      // Copy any cookies from the original response
      const setCookieHeader = response.headers.get('set-cookie');
      if (setCookieHeader) {
        responseHeaders.set('set-cookie', setCookieHeader);
      }

      return Response.json(
        { success: true, message: 'Login successful' },
        { 
          status: 200,
          headers: responseHeaders
        }
      );
    } else {
      return Response.json(
        { error: data.msg || 'Sign in failed' },
        { status: 401 }
      );
    }
  } catch (error) {
    console.error('Signin error:', error);
    return Response.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
