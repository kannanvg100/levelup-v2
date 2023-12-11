'use client'
import Login from '@/components/Login'
import { useSearchParams } from 'next/navigation'
import React from 'react'

export default function Page() {
	const searchParams = useSearchParams()
	const ret = searchParams.get('ret')
	return <Login role="teacher" ret/>
}
