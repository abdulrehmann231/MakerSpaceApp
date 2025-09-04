import { NextResponse } from 'next/server';
import { extractUser } from '../../../lib/backend/middleware';
import { getSetting, setSetting } from '../../../lib/backend/db';

export async function GET(request) {
  try {
    const user = await extractUser(request.headers, 'users');
    console.log('user:', user)
    if (!user || user.user !== 'admin') {
      return NextResponse.json({ code: 'UNAUTHORIZED', msg: 'Admin required' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const key = searchParams.get('key') || 'availability';
    const setting = await getSetting(key, 'settings');
    return NextResponse.json({ code: 'FOUND', msg: setting || {} }, { status: 200 });
  } catch (error) {
    console.error('GET settings error:', error);
    return NextResponse.json({ code: 'ERROR', msg: error.message }, { status: 500 });
  }
}

export async function PUT(request) {
  try {
    const user = await extractUser(request.headers, 'users');
    console.log('user:', user)
    if (!user || user.user !== 'admin') {
      return NextResponse.json({ code: 'UNAUTHORIZED', msg: 'Admin required' }, { status: 401 });
    }

    const body = await request.json();
    const key = body.key || 'availability';
    const value = body.value || {};

    const result = await setSetting(key, value, 'settings');
    if (!result) {
      return NextResponse.json({ code: 'ERROR', msg: 'Failed to save' }, { status: 500 });
    }
    return NextResponse.json({ code: 'UPDATE', msg: true }, { status: 200 });
  } catch (error) {
    console.error('PUT settings error:', error);
    return NextResponse.json({ code: 'ERROR', msg: error.message }, { status: 500 });
  }
}


