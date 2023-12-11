'use client'

import { useTheme } from 'next-themes'
import { Toaster } from 'react-hot-toast'

export const ToastProvider = () => {
    const { theme } = useTheme()
	return (
		<Toaster
			position="bottom-center"
			containerClassName="text-sm"
			toastOptions={{
					style: {
						borderRadius: '0',
				        backgroundColor: theme === 'dark' ? '#333' : '#fff',
                        color: theme === 'dark' ? '#fff' : '#333',
					},
			}}
		/>
	)
}
