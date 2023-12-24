import Footer from '@/components/admin/Footer'
import Sidebar from '@/components/admin/Sidebar'
import { ScrollShadow } from '@nextui-org/react'
import React from 'react'

export const metadata = {
    title: 'Admin Panel',
}

export default function layout({ children }) {
	return (
		<div className="flex">
			<div className="fixed left-0 top-0 w-[220px] px-4">
				<ScrollShadow hideScrollBar className="h-screen">
					<Sidebar />
				</ScrollShadow>
			</div>
			<div className="flex flex-col flex-grow ms-[220px]">
				<div className="flex-grow px-6 py-10 min-h-screen">{children}</div>
				<Footer />
			</div>
		</div>
	)
}
