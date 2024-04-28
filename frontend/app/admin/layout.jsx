'use client'
import React from 'react'
import { MutationCache, QueryCache, QueryClient, QueryClientProvider } from '@tanstack/react-query'
import toast from 'react-hot-toast'

const queryClient = new QueryClient({
	queryCache: new QueryCache({
		onError: (error) => {
			if (error?.response?.status === 401) {
				router.push('/teacher/login')
			} else if (error?.response?.status === 500) {
                toast.error(error?.response?.data?.message || error?.response?.message || 'Something went wrong')
			}
		},
	}),
	mutationCache: new MutationCache({
		onError: (error) => {
			if (error?.response?.status === 401) {
				router.push('/teacher/login')
			}
		},
	}),
})

export default function layout({ children }) {
	return <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
}
