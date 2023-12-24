'use client'
import { useQuery } from '@tanstack/react-query'
import React, { useEffect } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { getUserInfo } from '../api/users'
import Link from 'next/link'
import { addTeacher } from '@/redux/slices/teacherSlice'

export default function TeacherAccStatus() {
	const { teacher } = useSelector((state) => state.teacher)
	const dispatch = useDispatch()

	const res = useQuery({
		queryKey: ['teacher', teacher?._id],
		queryFn: () => getUserInfo(),
	})

	useEffect(() => {
		if (res?.data?.user) dispatch(addTeacher(res.data.user))
	}, [res])

	if (!teacher || teacher.status === 'active') return null
	return (
		<div>
			{teacher.status == 'verification_pending' && (
				<div className="border-1 border-warning-100 bg-warning-50 m-4 p-4 text-warning-600 text-tiny">
					<div className="flex">
						<p>Please upload your documents for verification from &nbsp;</p>
						<Link className="underline" href="/teacher/profile">
							Profile.
						</Link>
					</div>
				</div>
			)}
			{teacher.status == 'doc_uploaded' && (
				<div className="border-1 border-warning-100 bg-warning-50 m-4 p-4 text-warning-600 text-tiny">
					<p>
						Your account is under verification. Please wait for the admin to verify your account. You can
						still uplaod your content as draft.
					</p>
				</div>
			)}
			{teacher.status == 'rejected' && (
				<div className="border-1 border-danger-100 bg-danger-50 m-4 p-4 text-danger-600 text-tiny">
					<p>Your account is rejected. Please contact support for further assistance.</p>
				</div>
			)}
		</div>
	)
}
