const apiURL = 'https://api.makerspacedelft.nl/prod';

export async function POST(request) {
  try {
    const { email, password, firstname, lastname } = await request.json();

    // Validate input
    if (!email || !password || !firstname || !lastname) {
      return Response.json(
        { error: 'All fields are required' },
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
      body: JSON.stringify({ 
        email, 
        newpassword: password, 
        firstname, 
        lastname, 
        createaccount: true 
      })
    });

    const data = await response.json();

    if (data.code === "REG") {
      return Response.json(
        { success: true, message: 'Registration successful' },
        { status: 200 }
      );
    } else {
      return Response.json(
        { error: data.msg || 'Registration failed' },
        { status: 400 }
      );
    }
  } catch (error) {
    console.error('Registration error:', error);
    return Response.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
