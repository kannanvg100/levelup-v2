import { NextResponse } from 'next/server'

export function middleware(request) {

	const pathname = request.nextUrl.pathname

	// Admin routes protection middleware
	const verifyAdmin = request.cookies.get('jwt_admin')
	if (pathname.startsWith('/admin/login')) {
		if (verifyAdmin) {
			return NextResponse.redirect(new URL('/admin', request.url))
		}
	} else if (pathname.startsWith('/admin')) {
		if (!verifyAdmin) {
			return NextResponse.redirect(new URL('/admin/login', request.url))
		}
	}

	// Teacher routes protection middleware
	const verifyTeacher = request.cookies.get('jwt_teacher')
	if (
		pathname.startsWith('/teacher/login') ||
		pathname.startsWith('/teacher/signup') ||
		pathname.startsWith('/teacher/reset')
	) {
		if (verifyTeacher) {
			return NextResponse.redirect(new URL('/teacher', request.url))
		}
	} else if (pathname.startsWith('/teacher')) {
		if (!verifyTeacher) {
			return NextResponse.redirect(new URL('/teacher/login', request.url))
		}
	}

	let verify = request.cookies.get('jwt_user')
	if (pathname.startsWith('/login') || pathname.startsWith('/signup') || pathname.startsWith('/reset')) {
		if (verify) {
			return NextResponse.redirect(new URL('/', request.url))
		}
	}
}
