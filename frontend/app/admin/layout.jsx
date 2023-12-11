import Footer from '@/components/admin/Footer'
import Sidebar from '@/components/admin/Sidebar'
import { ScrollShadow } from '@nextui-org/react'
import React from 'react'

export default function layout({ children }) {
	return (
		// <div className="min-h-screen">
		// 	<div className="container max-w-7xl mx-auto px-4 grid grid-cols-[220px,1fr]">
		// 		<Sidebar />
		// 		<div className="ps-6 pt-10">
		// 			{children}
		// 		</div>
		// 	</div>
		// 	<Footer />
		// </div>
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
