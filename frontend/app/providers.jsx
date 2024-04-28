'use client'
import * as React from 'react'
import { NextUIProvider } from '@nextui-org/system'
import { useRouter } from 'next/navigation'
import { ThemeProvider as NextThemesProvider } from 'next-themes'
import ReduxProvider from '@/redux/Provider'
import { ToastProvider } from '@/providers/ToastProvider'
// import { ReactQueryDevtools } from '@tanstack/react-query-devtools'

export function Providers({ children, themeProps }) {
	const router = useRouter()
	return (
		<NextUIProvider navigate={router.push}>
			<NextThemesProvider {...themeProps}>
				<ReduxProvider>
					<main>
						{children}
						<ToastProvider />
					</main>
				</ReduxProvider>
				{/* <ReactQueryDevtools initialIsOpen={true} /> */}
			</NextThemesProvider>
		</NextUIProvider>
	)
}
