import { NextResponse } from 'next/server';
import { parseCookies } from '../../../../lib/backend/encrypt';
import { verifyAccessToken } from '../../../../lib/backend/jwt';
import { deleteRefreshToken } from '../../../../lib/backend/db';

export async function POST(request) {
    try {
        // Get user email from access token to delete refresh token
        const cookieHeader = request.headers.get('cookie');
        const ckies = cookieHeader && parseCookies(cookieHeader);
        
        if (ckies && ckies.auth) {
            const decodedToken = verifyAccessToken(ckies.auth);
            if (decodedToken && decodedToken.email) {
                // Delete refresh token from database
                await deleteRefreshToken(decodedToken.email, 'users');
            }
        }
        
        const response = NextResponse.json({ code: 'SIGNOUT' }, { status: 200 });

        // Delete cookies
        response.cookies.delete('auth', { path: '/' });
        response.cookies.delete('refresh', { path: '/' });

        return response;
    } catch (error) {
        console.error('Signout error:', error);
        const response = NextResponse.json({ code: 'SIGNOUT' }, { status: 200 });
        
        // Still delete cookies even if database operation fails
        response.cookies.delete('auth', { path: '/' });
        response.cookies.delete('refresh', { path: '/' });
        
        return response;
    }
}
