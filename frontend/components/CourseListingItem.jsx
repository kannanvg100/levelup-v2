import React from 'react'
import { Card, CardHeader, CardBody, CardFooter, Image, Link } from '@nextui-org/react'
import NextLink from 'next/link'
import NextImage from 'next/image'

export default function CourseListingItem({ course }) {
	return (
		<Link as={NextLink} href={`courses/${course?._id}`}>
			<Card className="max-w-[350px]" radius="none" shadow="md">
				<CardHeader className="justify-between">
					<Image
						isBlurred
						src={course?.thumbnail}
						width={250}
						height={100}
						style={{ objectFit: 'cover' }}
						className="rounded-none"
						alt={course?.title}
					/>
				</CardHeader>
				<CardBody className="px-3 py-0">
					<p className="text-medium font-bold text-default-700">{course?.title}</p>
					<span className="pt-1">{course?.teacher?.name}</span>
				</CardBody>
				<CardFooter className="gap-3">
					<div className="flex items-end gap-2">
						<p className="font-semibold text-default-700 text-medium">₹{course?.price}</p>
						<p className="text-default-400 text-small line-through font-medium">₹{course?.mrp}</p>
					</div>
				</CardFooter>
			</Card>
		</Link>
	)
}
