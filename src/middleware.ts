import { NextRequest, NextResponse } from 'next/server';
import { jwtVerify } from 'jose';


export const config = {
  matcher: ['/api/notes/:path*', '/api/tenants/:path*'],
};


const secret = new TextEncoder().encode(process.env.JWT_SECRET!);

export async function middleware(req: NextRequest) {
 
  const authHeader = req.headers.get('authorization');
  const token = authHeader?.split(' ')[1];

  if (!token) {
    return NextResponse.json({ message: 'Authorization token missing' }, { status: 401 });
  }

  try {
    
    const { payload } = await jwtVerify(token, secret);

    
    const requestHeaders = new Headers(req.headers);
    requestHeaders.set('x-user-payload', JSON.stringify(payload));

    
    return NextResponse.next({
      request: {
        headers: requestHeaders,
      },
    });

  } catch (error) {
    
    return NextResponse.json({ message: 'Invalid or expired token' }, { status: 401 });
  }
}


