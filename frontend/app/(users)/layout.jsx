import React from 'react'
import Header from '@/components/Header'
import Footer from '@/components/Footer'
import Providers from './_components/Providers'

export default function layout({ auth, children }) {
	return (
		<Providers>
			<div className="min-h-screen flex flex-col">
				<Header />
				<div className="flex-grow w-full max-w-screen-xl mx-auto px-2">{children}</div>
				<Footer />
			</div>
		</Providers>
	)
}
