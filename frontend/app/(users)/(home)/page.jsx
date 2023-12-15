'use client'
import React, { useEffect } from 'react'
import CourseListingItem from '@/components/CourseListingItem'
import { Button, Image, Skeleton, Spacer } from '@nextui-org/react'
import { useQuery } from '@tanstack/react-query'
import { getCoursesByTag, getEnrolledCourses } from '@/api/courses'
import { useState } from 'react'
import NextLink from 'next/link'
import { useTheme } from 'next-themes'
import CourseItem from '@/components/CourseItem'
import CourseItem2 from '@/components/CourseItem2'
import { useSelector } from 'react-redux'

export default function Page() {
	const { user } = useSelector((state) => state.user)
	const { theme } = useTheme()
	const latestCourses = useQuery({
		queryKey: ['courses', 'latest'],
		queryFn: () => getCoursesByTag({tag: 'latest'}),
		keepPreviousData: true,
	})
    const popularCourses = useQuery({
		queryKey: ['courses', 'popular'],
		queryFn: () => getCoursesByTag({tag: 'popular'}),
		keepPreviousData: true,
	})
	const myCourses = useQuery({
		queryKey: ['my-courses'],
		queryFn: () => getEnrolledCourses({ page: 1, limit: 5 }),
		keepPreviousData: true,
		staleTime: 1000 * 60 * 60,
		enabled: !!user,
	})

	return (
		<div className="md:ps-[1.5rem] pb-[1.5rem]">
			<div
				className="hidden md:flex min-h-[350px] flex-col items-start gap-5 justify-center -me-[1.5rem]"
				style={{
					backgroundImage:
						theme === 'dark'
							? 'linear-gradient(to right, black 50%, transparent 100%), url(/hero_2.jpg)'
							: 'linear-gradient(to right, white 50%, transparent 100%), url(/hero_2.jpg)',
					backgroundPosition: 'right',
					backgroundSize: 'contain',
					backgroundRepeat: 'no-repeat',
				}}>
				<p className="text-[3vw] max-w-[650px] font-semibold">
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

			<div
				className="md:hidden block justify-center shadow-lg">
				<Image src="/hero_2.jpg" w={0} h={0} className="w-screen" />
				<div className='px-2 py-4 flex flex-col items-start gap-3 justify-center'>
				    <p className="text-lg max-w-[650px] font-semibold">
    					Learn Beyond Limits: Your Knowledge Journey Starts Here
    				</p>
    				<p className="text-sm max-w-xl">
    					Step into a World of Endless Possibilities – Your Passport to Success is Here! Embrace Your Learning
    					Adventure with us
    				</p>
    				<Button
    					size="md"
    					href="/courses"
    					as={NextLink}
    					variant="solid"
    					color="primary"
    					className="text-white px-4 font-bold hover:underline">
    					Explore Courses
    				</Button>
				</div>
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
			<p className="text-[1.2rem] font-semibold text-default-700">Popular courses</p>
			<Spacer y={2} />
			<div className="flex items-start gap-4 overflow-hidden">
				{popularCourses?.data?.courses &&
					popularCourses?.data?.courses.map((course) => <CourseItem key={course._id} course={course} />)}
				{popularCourses?.isPending &&
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
			{user && (
				<>
					{myCourses?.data && (
						<p className="text-[1.2rem] font-semibold text-default-700">Continue Learning</p>
					)}
					<Spacer y={2} />
					<div className="flex overflow-hidden items-start gap-4">
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
				</>
			)}
		</div>
	)
}
