import React from 'react'
import Signup from '@/components/Signup'
import Footer from '@/components/teacher/Footer'

export default function Page() {
	return (
		<div className="min-h-screen flex flex-col">
			<Signup role="teacher" />
			<div className="flex-grow flex items-center justify-center"></div>
			<Footer />
		</div>
	)
}
