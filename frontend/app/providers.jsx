'use client'
import * as React from 'react'
import { NextUIProvider } from '@nextui-org/system'
import { useRouter } from 'next/navigation'
import { ThemeProvider as NextThemesProvider } from 'next-themes'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import ReduxProvider from '@/redux/Provider'
import { ToastProvider } from '@/providers/ToastProvider'
import { SocketProvider } from '@/providers/SocketProvider'

export function Providers({ children, themeProps }) {
	const [queryClient] = React.useState(() => new QueryClient())
	const router = useRouter()
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
				</QueryClientProvider>
			</NextThemesProvider>
		</NextUIProvider>
	)
}
