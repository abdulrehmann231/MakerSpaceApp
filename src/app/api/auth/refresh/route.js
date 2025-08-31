import { NextResponse } from 'next/server';
import { parseCookies } from '../../../../lib/backend/encrypt.js';
import { verifyRefreshToken, generateAccessToken } from '../../../../lib/backend/jwt.js';
import { getRefreshToken, getUser } from '../../../../lib/backend/db.js';

export async function POST(request) {
  try {
    // Get cookies from request
    const cookieHeader = request.headers.get('cookie');
    const ckies = cookieHeader && parseCookies(cookieHeader);
    
    if (!ckies || !ckies.refresh) {
      return NextResponse.json(
        { code: 'UNAUTHORIZED', msg: 'No refresh token provided' },
        { status: 401 }
      );
    }
    
    // Verify refresh token
    const decodedRefreshToken = verifyRefreshToken(ckies.refresh);
    if (!decodedRefreshToken) {
      return NextResponse.json(
        { code: 'UNAUTHORIZED', msg: 'Invalid refresh token' },
        { status: 401 }
      );
    }
    
    // Get stored refresh token from database
    const storedRefreshToken = await getRefreshToken(decodedRefreshToken.email, 'users');
    if (!storedRefreshToken || storedRefreshToken !== ckies.refresh) {
      return NextResponse.json(
        { code: 'UNAUTHORIZED', msg: 'Refresh token not found in database' },
        { status: 401 }
      );
    }
    
    // Get user from database
    const user = await getUser(decodedRefreshToken.email, 'users');
    if (!user) {
      return NextResponse.json(
        { code: 'UNAUTHORIZED', msg: 'User not found' },
        { status: 401 }
      );
    }
    
    // Generate new access token
    const newAccessToken = generateAccessToken(user);
    
    // Create response with new access token
    const response = NextResponse.json({
      code: 'REFRESHED',
      msg: 'Access token refreshed successfully'
    }, { status: 200 });
    
    // Set new access token in cookie
    response.cookies.set('auth', newAccessToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax'
    });
    
    return response;
  } catch (error) {
    console.error('Refresh token error:', error);
    return NextResponse.json(
      { code: 'ERROR', msg: error.message },
      { status: 500 }
    );
  }
}

