'use client'

import React from 'react'
import { GoogleOAuthProvider } from '@react-oauth/google'
import Chat from '@/components/Chat'
import { SocketProvider } from '@/providers/SocketProvider'
import { ChatProvider } from '@/components/providers/ChatProvider'
import { useSelector } from 'react-redux'
import { MutationCache, QueryCache, QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { useRouter } from 'next/navigation'
import { toast } from 'react-hot-toast'
import { ReactQueryDevtools } from '@tanstack/react-query-devtools'

const queryClient = new QueryClient({
	queryCache: new QueryCache({
		onError: (error) => {
			if (error?.response?.status === 401) {
				router.push('/login')
			} else if (error?.response?.status === 500) {
				toast.error(error?.response?.data?.message || error?.response?.message || 'Something went wrong')
			}
		},
	}),
	mutationCache: new MutationCache({
		onError: (error) => {
			if (error?.response?.status === 401) router.push('/login')
		},
	}),
})

export default function Providers({ children }) {
	const { user } = useSelector((state) => state.user)
	return (
		<QueryClientProvider client={queryClient}>
			<SocketProvider role="user">
				<GoogleOAuthProvider clientId={process.env.NEXT_PUBLIC_GOOGLE_OAUTH_CLIENT_ID}>
					<ChatProvider>
						{children}
						{user && <Chat role="user" />}
					</ChatProvider>
				</GoogleOAuthProvider>
			</SocketProvider>
			<ReactQueryDevtools initialIsOpen={true} />
		</QueryClientProvider>
	)
}
