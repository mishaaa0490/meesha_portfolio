import { readSessionFromCookie } from './lib/session.mjs'

export async function middleware(request) {
  const pathname = new URL(request.url).pathname.replace(/\/+$/, '') || '/'
  const isAdminRoute = pathname === '/admin' || pathname.startsWith('/admin/')
  const isLoginRoute = pathname === '/login' || pathname.startsWith('/login/')

  if (!isAdminRoute && !isLoginRoute) return

  const session = await readSessionFromCookie(request.headers.get('cookie'))

  if (isAdminRoute && !session) return Response.redirect(new URL('/login', request.url), 303)
  if (isLoginRoute && session) return Response.redirect(new URL('/admin', request.url), 303)
}

export const config = {
  matcher: ['/admin', '/admin/:path*', '/login', '/login/:path*'],
}
