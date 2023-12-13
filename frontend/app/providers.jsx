'use client'
import * as React from 'react'
import { NextUIProvider } from '@nextui-org/system'
import { useRouter } from 'next/navigation'
import { ThemeProvider as NextThemesProvider } from 'next-themes'
import { MutationCache, QueryCache, QueryClient, QueryClientProvider } from '@tanstack/react-query'
import ReduxProvider from '@/redux/Provider'
import { ToastProvider } from '@/providers/ToastProvider'
import { SocketProvider } from '@/providers/SocketProvider'
import { ReactQueryDevtools } from '@tanstack/react-query-devtools'
import toast from 'react-hot-toast'

export function Providers({ children, themeProps }) {
	const router = useRouter()
	const queryClient = new QueryClient({
		queryCache: new QueryCache({
			onError: (error) => {
				if (error?.response?.status === 401) {
					if (error?.response?.data?.role === 'uesr') router.push('/login')
					if (error?.response?.data?.role === 'teacher') router.push('/teacher/login')
				}else if(error?.response?.status === 500){
                    toast.error(
                        error?.response?.data?.message || 'Something went wrong'
                    )
                }
			},
		}),
		mutationCache: new MutationCache({
			onError: (error) => {
				if (error?.response?.status === 401) {
					if (error?.response?.data?.role === 'user') router.push('/login')
					if (error?.response?.data?.role === 'teacher') router.push('/teacher/login')
				}
			},
		}),
	})
	return (
		<NextUIProvider navigate={router.push}>
			<NextThemesProvider {...themeProps}>
				<QueryClientProvider client={queryClient}>
					<ReduxProvider>
						{/* <SocketProvider> */}
						<main>
							{children}
							<ToastProvider />
						</main>
						{/* </SocketProvider> */}
					</ReduxProvider>
					<ReactQueryDevtools initialIsOpen={true} />
				</QueryClientProvider>
			</NextThemesProvider>
		</NextUIProvider>
	)
}
