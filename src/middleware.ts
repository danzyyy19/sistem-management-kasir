import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import { verifyToken } from '@/lib/auth'

const publicPaths = ['/login', '/']
const rolePaths = {
    ADMIN: ['/admin'],
    MANAGER: ['/manager'],
    CASHIER: ['/cashier'],
}

export async function middleware(request: NextRequest) {
    const { pathname } = request.nextUrl

    // Allow public paths
    if (publicPaths.some(path => pathname === path)) {
        return NextResponse.next()
    }

    // Get token from cookie
    const token = request.cookies.get('token')?.value

    // Redirect to login if no token
    if (!token) {
        return NextResponse.redirect(new URL('/login', request.url))
    }

    // Verify token
    const payload = await verifyToken(token)
    if (!payload) {
        const response = NextResponse.redirect(new URL('/login', request.url))
        response.cookies.delete('token')
        return response
    }

    // Check role-based access
    const userRole = payload.role as keyof typeof rolePaths
    const allowedPaths = rolePaths[userRole]

    if (allowedPaths && !allowedPaths.some(path => pathname.startsWith(path))) {
        // Redirect to their default dashboard
        const defaultPath = allowedPaths[0] + '/dashboard'
        return NextResponse.redirect(new URL(defaultPath, request.url))
    }

    return NextResponse.next()
}

export const config = {
    matcher: ['/((?!api|_next/static|_next/image|favicon.ico).*)'],
}
