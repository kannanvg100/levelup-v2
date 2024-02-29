'use client'

import React from 'react'
import { GoogleOAuthProvider } from '@react-oauth/google'
import Chat from '@/components/Chat'
import { SocketProvider } from '@/providers/SocketProvider'
import { ChatProvider } from '@/components/providers/ChatProvider'
import { useSelector } from 'react-redux'

export default function Providers({ children }) {
	const { user } = useSelector((state) => state.user)
	return (
		<SocketProvider role="user">
			<GoogleOAuthProvider clientId={process.env.NEXT_PUBLIC_GOOGLE_OAUTH_CLIENT_ID}>
				<ChatProvider>
					{children}
					{user && <Chat role="user" />}
				</ChatProvider>
			</GoogleOAuthProvider>
		</SocketProvider>
	)
}
