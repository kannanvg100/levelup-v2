import { Spacer } from '@nextui-org/react'
import Hero from './_components/Hero'
import CoursesWithChip from './_components/CoursesWithChip'
import PopularCourses from './_components/PopularCourses'

export default function Page() {
	return (
		<div className="md:ps-[1.5rem] pb-[1.5rem]">
			<Spacer y={2} />
			<Hero />

			<Spacer y={6} />
			<PopularCourses />

			<Spacer y={8} />
			<CoursesWithChip />

			<Spacer y={10} />
		</div>
	)
}
