'use client'
import Login from '@/components/Login'
import { useSearchParams, useRouter } from 'next/navigation'
import React, { useEffect, useLayoutEffect } from 'react'
import { useSelector } from 'react-redux'

export default function Page() {
	const searchParams = useSearchParams()
	const ret = searchParams.get('ret')

	const router = useRouter()
	const { user } = useSelector((state) => state.user)
	useLayoutEffect(() => {
		if (user) router.push('/')
	}, [user])

	return <Login role="user" ret />
}
