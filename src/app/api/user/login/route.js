import { NextResponse } from 'next/server';

export async function GET(request) {
  try {
    // Get query parameters from the request
    const { searchParams } = new URL(request.url);
    const username = searchParams.get('username');
    const password = searchParams.get('password');

    // Validate required parameters
    if (!username || !password) {
      return NextResponse.json(
        { 
          error: 'Missing required parameters', 
          message: 'Username and password are required' 
        },
        { status: 400 }
      );
    }

    // Here you would typically validate credentials against your database
    // For now, we'll simulate a successful authentication
    // In a real application, you would:
    // 1. Check credentials against your database
    // 2. Generate a JWT token or session token
    // 3. Return the token

    // Simulate authentication (replace with actual auth logic)
    if (username === 'admin' && password === 'password') {
      // Generate a mock JWT token (in production, use a proper JWT library)
      const token = generateMockToken(username);
      
      return NextResponse.json({
        success: true,
        token: token,
        user: {
          username: username,
          role: 'admin'
        },
        message: 'Login successful'
      });
    } else {
      return NextResponse.json(
        { 
          error: 'Invalid credentials',
          message: 'Username or password is incorrect' 
        },
        { status: 401 }
      );
    }

  } catch (error) {
    console.error('Login error:', error);
    return NextResponse.json(
      { 
        error: 'Internal server error',
        message: 'An error occurred during login' 
      },
      { status: 500 }
    );
  }
}

// Helper function to generate a mock token
function generateMockToken(username) {
  const header = {
    alg: 'HS256',
    typ: 'JWT'
  };
  
  const payload = {
    sub: username,
    iat: Math.floor(Date.now() / 1000),
    exp: Math.floor(Date.now() / 1000) + (60 * 60 * 24), // 24 hours
    role: 'admin'
  };

  // In production, use a proper JWT library like 'jsonwebtoken'
  const encodedHeader = btoa(JSON.stringify(header));
  const encodedPayload = btoa(JSON.stringify(payload));
  
  // This is a mock signature - in production, use proper JWT signing
  const signature = btoa('mock-signature-for-demo');
  
  return `${encodedHeader}.${encodedPayload}.${signature}`;
}
