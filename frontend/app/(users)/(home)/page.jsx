import CourseItem from '@/components/CourseItem'
import { ScrollShadow, Spacer } from '@nextui-org/react'
import axios from 'axios'
import Hero from './_components/Hero'
import CoursesWithChip from './_components/CoursesWithChip'

async function getData() {
	try {
		const res = await axios.get(`${process.env.NEXT_PUBLIC_API_URL}/api/courses/latest`)
		return res.data
	} catch (error) {
		console.error(error)
	}
}

export default async function Page() {
	const data = await getData()

	return (
		<div className="md:ps-[1.5rem] pb-[1.5rem]">
			<Hero />

			<Spacer y={6} />
			<CoursesWithChip />

			<Spacer y={6} />
			<p className="text-[1.2rem] font-semibold text-default-700">Popular courses</p>
			<Spacer y={2} />
			<ScrollShadow
				hideScrollBar
				orientation="horizontal"
				className="flex items-start gap-4">
				{data?.courses.map((course) => (
					<CourseItem key={course._id} course={course} />
				))}
			</ScrollShadow>

			<Spacer y={6} />
		</div>
	)
}
