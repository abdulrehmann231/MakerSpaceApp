import { NextResponse } from 'next/server';

export async function POST() {
    const response = NextResponse.json({ code: 'SIGNOUT' }, { status: 200 });

    // Delete cookies (must match options used when setting them!)
    response.cookies.delete('auth', { path: '/' });
    response.cookies.delete('user', { path: '/' });

    console.log('Signout called - cookies cleared');
    return response;
  
}
