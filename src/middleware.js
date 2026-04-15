import { NextResponse } from 'next/server';

const protectedRoutes = ['/dashboard', '/admin', '/superadmin', '/employee'];

export function middleware(req) {
  const path = req.nextUrl.pathname;

  // Skip middleware if route is not protected
  if (!protectedRoutes.some((p) => path.startsWith(p))) {
    return NextResponse.next();
  }

  const token = req.cookies.get('token')?.value;
  const role = req.cookies.get('role')?.value;

  if (!token) {
    return NextResponse.redirect(new URL('/signin', req.url));
  }

  if (path.startsWith('/admin') && role !== 'Admin') {
    return NextResponse.redirect(new URL('/', req.url));
  }
  if (path.startsWith('/superadmin') && role !== 'SuperAdmin') {
    return NextResponse.redirect(new URL('/', req.url));
  }
  if (path.startsWith('/employee') && role !== 'Employee') {
    return NextResponse.redirect(new URL('/', req.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/dashboard/:path*', '/admin/:path*', '/superadmin/:path*', '/employee/:path*'],
};
