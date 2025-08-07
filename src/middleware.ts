import { NextRequest, NextResponse } from 'next/server';

export function middleware(request: NextRequest) {
  // Only apply to API routes that need authentication
  if (request.nextUrl.pathname.startsWith('/api/chat') || 
      request.nextUrl.pathname.startsWith('/api/chat-history')) {
    
    // For now, we'll allow all requests to these endpoints
    // In a production environment, you would verify the authentication here
    // by checking for a valid session token or JWT
    
    // Example of how you might check authentication:
    // const authHeader = request.headers.get('authorization');
    // if (!authHeader || !isValidToken(authHeader)) {
    //   return NextResponse.json(
    //     { success: false, error: 'Unauthorized' },
    //     { status: 401 }
    //   );
    // }
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    '/api/chat/:path*',
    '/api/chat-history/:path*',
  ],
}; 