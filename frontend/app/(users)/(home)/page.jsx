'use client'
import React, { useEffect } from 'react'
import CourseListingItem from '@/components/CourseListingItem'
import { Button, Skeleton, Spacer } from '@nextui-org/react'
import { useQuery } from '@tanstack/react-query'
import { getCoursesLatest, getEnrolledCourses } from '@/api/courses'
import { useState } from 'react'
import NextLink from 'next/link'
import { useTheme } from 'next-themes'
import CourseItem from '@/components/CourseItem'
import CourseItem2 from '@/components/CourseItem2'

export default function Page() {
	const { theme } = useTheme()
	const latestCourses = useQuery({
		queryKey: ['courses', 'latest'],
		queryFn: () => getCoursesLatest(),
		keepPreviousData: true,
	})
	const myCourses = useQuery({
		queryKey: ['my-courses'],
		queryFn: () => getEnrolledCourses({ page: 1, limit: 5 }),
		keepPreviousData: true,
		staleTime: 1000 * 60 * 60,
	})

	useEffect(() => {
		console.log('myCourses', myCourses.data)
	}, [myCourses])

	return (
		<div className="ps-[1.5rem] pb-[1.5rem]">
			<div
				className="min-h-[350px] flex flex-col items-start gap-5 justify-center"
				style={{
					backgroundImage:
						theme === 'dark'
							? 'linear-gradient(to right, black 50%, transparent 100%), url(/hero_2.jpg)'
							: 'linear-gradient(to right, white 50%, transparent 100%), url(/hero_2.jpg)',
					backgroundPosition: 'right',
					backgroundSize: 'contain',
					backgroundRepeat: 'no-repeat',
				}}>
				<p className="text-4xl max-w-[650px] font-semibold">
					Learn Beyond Limits: Your Knowledge Journey Starts Here
				</p>
				<p className="text-md max-w-xl">
					Step into a World of Endless Possibilities – Your Passport to Success is Here! Embrace Your Learning
					Adventure with us
				</p>
				<Button
					size="lg"
					href="/courses"
					as={NextLink}
					variant="solid"
					color="primary"
					className="text-white px-4 font-bold hover:underline">
					Explore Courses
				</Button>
			</div>

			<Spacer y={2} />
			<p className="text-[1.2rem] font-semibold text-default-700">Latest courses</p>
			<Spacer y={2} />
			<div className="flex items-start gap-4 overflow-hidden">
				{latestCourses?.data?.courses &&
					latestCourses?.data?.courses.map((course) => <CourseItem key={course._id} course={course} />)}
				{latestCourses?.isPending &&
					[...Array(5)].map((_, i) => (
						<div key={i} className="bg-default-50 w-[240px]">
							<div className="p-2">
								<Skeleton className="h-[125px] w-full" />
								<Spacer y={3} />
								<Skeleton className="w-[200px] h-4" />
								<Spacer y={1} />
								<Skeleton className="w-[100px] h-6" />
							</div>
						</div>
					))}
			</div>

			<Spacer y={6} />

			{myCourses?.data && <p className="text-[1.2rem] font-semibold text-default-700">Continue Learning</p>}
			<Spacer y={2} />
			<div className="flex overflow-hidden items-start gap-2">
				{myCourses?.data?.courses &&
					myCourses?.data?.courses.map((course) => <CourseItem2 key={course._id} course={course} />)}
				{myCourses?.isPending &&
					[...Array(2)].map((_, i) => (
						<div key={i} className="bg-default-50 w-[450px]">
							<div className="flex p-2">
								<Skeleton className="h-[180px] w-[220px]" />
								<div className="m-2">
									<Skeleton className="w-[200px] h-4" />
									<Spacer y={2} />
									<Skeleton className="h-8 w-8 rounded-full" />
								</div>
							</div>
						</div>
					))}
			</div>
		</div>
	)
}
