import { Card, CardBody, Image, Link, Spacer } from '@nextui-org/react'
import React from 'react'
import NextLink from 'next/link'

export default function CourseItem({ course }) {
	return (
		<Link as={NextLink} href={`/courses/${course?.slug}/${course?._id}`}>
			<Card radius="none" shadow="none" className='bg-default-50 w-[240px]'>
				<CardBody className='p-2'>
					<Image
						isZoomed
                        isBlurred
						radius="none"
						className="h-[125px] rounded-none object-cover object-center border border-default-100"
						src={course?.thumbnail}
						width={250}
						height={125}
                        alt={course?.title}
					/>
					<Spacer y={3} />
					<h4 className="w-[200px] text-ellipsis-custom text-sm">{course?.title}</h4>
					<span className="font-bold">
						₹{course?.price}
						<span className="text-default-500 font-bold text-tiny line-through ms-1">₹{course?.mrp}</span>
					</span>
				</CardBody>
			</Card>
		</Link>
	)
}
