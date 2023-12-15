'use client'
import Footer from '@/components/Footer'
import Header from '@/components/Header'
import React from 'react'
import { GoogleOAuthProvider } from '@react-oauth/google'
import Chat from '@/components/Chat'
import { SocketProvider } from '@/providers/SocketProvider'
import { ChatProvider } from '@/components/providers/ChatProvider'
import { useSelector } from 'react-redux'

export default function layout({ children }) {
	const { user } = useSelector((state) => state.user)
	return (
		<SocketProvider role="user">
			<GoogleOAuthProvider clientId={process.env.NEXT_PUBLIC_GOOGLE_OAUTH_CLIENT_ID}>
				<ChatProvider>
					<div className="min-h-screen flex flex-col">
						<Header />
						<div className="flex-grow w-full max-w-screen-xl mx-auto px-[1.5rem] pb-[2rem]">{children}</div>
						<Footer />
					</div>
					{user && <Chat role="user" />}
				</ChatProvider>
			</GoogleOAuthProvider>
		</SocketProvider>
	)
}
