'use client'
import Footer from '@/components/Footer'
import Header from '@/components/Header'
import React from 'react'
import { GoogleOAuthProvider } from '@react-oauth/google'
import { Divider } from '@nextui-org/react'
import Chat from '@/components/Chat'
import { SocketProvider } from '@/providers/SocketProvider'

export default function layout({ children }) {
	return (
		<SocketProvider role="user">
			<GoogleOAuthProvider clientId={process.env.NEXT_PUBLIC_GOOGLE_OAUTH_CLIENT_ID}>
				<div className="min-h-screen flex flex-col">
					<Header />
					<div className="flex-grow w-full max-w-screen-xl mx-auto px-[1.5rem] pb-[2rem]">{children}</div>
					<Divider orientation="horizontal" />
					<Footer />
				</div>
				<Chat role="user" />
			</GoogleOAuthProvider>
		</SocketProvider>
	)
}
