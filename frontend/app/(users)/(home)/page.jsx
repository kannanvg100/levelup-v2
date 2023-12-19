import CourseItem from '@/components/CourseItem'
import { ScrollShadow, Spacer } from '@nextui-org/react'
import axios from 'axios'
import Hero from './_components/Hero'
import CoursesWithChip from './_components/CoursesWithChip'
import PopularCourses from './_components/PopularCourses'

export default function Page() {
	

	return (
		<div className="md:ps-[1.5rem] pb-[1.5rem]">
			<Hero />

			<Spacer y={6} />
			<CoursesWithChip />

			<Spacer y={6} />
			
			
            <PopularCourses />

			<Spacer y={6} />
		</div>
	)
}
