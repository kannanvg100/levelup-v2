import React from 'react'
import CourseDetail from './_components/CourseDetail'

export default function page({ params: { slug, courseId } }) {
	return <CourseDetail slug={slug} courseId={courseId} />
}
