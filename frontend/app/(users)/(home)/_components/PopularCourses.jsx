import CourseItem from '@/components/CourseItem'
import { ScrollShadow, Spacer } from '@nextui-org/react'
import axios from 'axios'
import React from 'react'

async function getData() {
	try {
		const res = await axios.get(`${process.env.NEXT_PUBLIC_API_URL}/api/courses/latest`)
		return res.data
	} catch (error) {
		console.error(error)
	}
}

export default async function PopularCourses() {
	const data = await getData()
	if (data === undefined) return null
	return (
		<>
			<p className="text-[1.5rem] font-semibold text-default-700">Popular courses</p>
			<Spacer y={2} />
			<ScrollShadow hideScrollBar orientation="horizontal" className="flex items-start gap-4">
				{data?.courses.map((course) => (
					<CourseItem key={course._id} course={course} />
				))}
			</ScrollShadow>
		</>
	)
}
