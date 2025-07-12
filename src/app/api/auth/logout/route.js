import { NextResponse } from 'next/server';

export async function POST(request) {
  try {
    // Create a response that clears the auth token
    const response = NextResponse.json({ 
      success: true, 
      message: 'Logged out successfully' 
    });

    // Clear any auth cookies if they exist
    response.cookies.delete('token');
    response.cookies.delete('auth-token');
    
    return response;
  } catch (error) {
    console.error('Logout error:', error);
    return NextResponse.json(
      { error: 'Logout failed' },
      { status: 500 }
    );
  }
} 