import axios from 'axios'
import React from 'react'

export default function layout({ children }) {
	return <div>{children}</div>
}

export async function generateMetadata({ params }) {
	const courseId = params.courseId

	let course
	try {
		const res = await axios.get(`${process.env.NEXT_PUBLIC_API_URL}/api/course/${courseId}`)
		course = res.data.course
	} catch (error) {
		console.error(error)
	}

	return {
		title: {
			template: course?.title || params.slug,
			default: course?.title || params.slug,
		},
		description: course?.description || '',
		openGraph: {
			images: course?.thumbnail || '',
		},
	}
}
