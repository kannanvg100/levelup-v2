import Login from '@/components/Login'
import Footer from '@/components/teacher/Footer'
import React from 'react'

export default function Page() {
	return (
		<div className="min-h-screen flex flex-col">
			<div className="flex-grow flex items-center justify-center">
				<Login role="teacher" />
			</div>
			<Footer />
		</div>
	)
}
