'use client'
import Login from '@/components/Login'
import { useRouter, useSearchParams } from 'next/navigation'
import React from 'react'

export default function Page() {
	const router = useRouter()
	const searchParams = useSearchParams()

	const handleClose = () => {
		const ret = searchParams.get('ret') || '/'
		router.replace(ret)
	}

	return (
		<div className="min-h-screen flex flex-col">
			<div className="flex-grow flex items-center justify-center">
				<Login role="user" onClose={handleClose} />
			</div>
		</div>
	)
}
