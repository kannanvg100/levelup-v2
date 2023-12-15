'use client'
import React from 'react'
import Footer from '@/components/teacher/Footer'
import Sidebar from '@/components/teacher/Sidebar'
import VideoCallIncoming from '@/components/VideoCallIncoming'
import Chat from '@/components/Chat'
import { ScrollShadow } from '@nextui-org/react'
import { SocketProvider } from '@/providers/SocketProvider'
import { useSelector } from 'react-redux'

export default function layout({ children }) {
	const { user } = useSelector((state) => state.teacher)
	return (
		<SocketProvider role="teacher">
			<div className="flex">
				<div className="hidden md:block fixed left-0 top-0 w-[220px] px-4">
					<ScrollShadow hideScrollBar className="h-screen">
						<Sidebar />
					</ScrollShadow>
				</div>
				<div className="flex flex-col flex-grow md:ms-[220px]">
					<div className="flex-grow px-6 py-10 min-h-screen">{children}</div>
					<Footer />
				</div>
				{user && <Chat role="teacher" />}
			</div>
		</SocketProvider>
	)
}

{
	/* <div className="bg-yellow-100 text-default-600 p-3 mb-3 flex items-center">
    <p className='font-medium text-sm'>Verification pending</p>
</div> */
}
