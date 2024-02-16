'use client'
import Login from '@/components/Login'
import Footer from '@/components/teacher/Footer'
import { useRouter } from 'next/navigation'
import React from 'react'

export default function Page() {
	const router = useRouter()

	const handleClose = () => router.replace('/teacher/courses')

	return (
		<div className="min-h-screen flex flex-col mt-6">
			<div className="flex-grow flex items-center justify-center">
				<Login role="teacher" onClose={handleClose} />
			</div>
			<Footer />
		</div>
	)
}
