import { NextResponse } from 'next/server';
import { migrateToJWT, verifyDatabaseSchema } from '../../../lib/backend/migration';

export async function POST(request) {
  try {
    const body = await request.json();
    const { action } = body;

    if (action === 'migrate') {
      const result = await migrateToJWT();
      return NextResponse.json(result);
    } else if (action === 'verify') {
      const result = await verifyDatabaseSchema();
      return NextResponse.json(result);
    } else {
      return NextResponse.json(
        { success: false, error: 'Invalid action. Use "migrate" or "verify"' },
        { status: 400 }
      );
    }
  } catch (error) {
    console.error('Migration API error:', error);
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}

// Only allow GET for verification
export async function GET(request) {
  try {
    const result = await verifyDatabaseSchema();
    return NextResponse.json(result);
  } catch (error) {
    console.error('Migration verification error:', error);
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}

