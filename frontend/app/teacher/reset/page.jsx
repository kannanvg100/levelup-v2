'use client'
import ResetPassword from '@/components/ResetPassword'
import { useSearchParams } from 'next/navigation'
import React from 'react'

export default function Page() {
	const searchParams = useSearchParams()
	const email = searchParams.get('email') || ''
	const role = searchParams.get('role') || ''
	return <ResetPassword email={email} role={role} />
}
