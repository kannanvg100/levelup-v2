'use client'
import React from 'react'
import Footer from '@/components/teacher/Footer'
import Sidebar from '@/components/teacher/Sidebar'
import Chat from '@/components/Chat'
import { ScrollShadow, Spacer } from '@nextui-org/react'
import { SocketProvider } from '@/providers/SocketProvider'
import { useSelector } from 'react-redux'
import { ChatProvider } from '@/components/providers/ChatProvider'
import TeacherAccStatus from '@/components/TeacherAccStatus'

export default function layout({ children }) {
	const { teacher } = useSelector((state) => state.teacher)

	return (
		<ChatProvider>
			<SocketProvider role="teacher">
				<div className="flex">
					<div className="hidden md:block fixed left-0 top-0 w-[220px] px-4">
						<ScrollShadow hideScrollBar className="h-screen">
							<Sidebar />
						</ScrollShadow>
					</div>
					<div className="flex flex-col flex-grow md:ms-[220px] bg-default-50">
						{teacher && teacher?.status !== 'active' ? <TeacherAccStatus /> : <Spacer y={10} />}
						<div className="flex-grow px-6 min-h-screen">{children}</div>
						<Footer />
					</div>
					{teacher && <Chat role="teacher" />}
				</div>
			</SocketProvider>
		</ChatProvider>
	)
}
