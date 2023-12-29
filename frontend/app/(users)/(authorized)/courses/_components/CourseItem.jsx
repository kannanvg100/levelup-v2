import { Card, CardBody, Image, Link, Spacer } from '@nextui-org/react'
import React, { useEffect } from 'react'
import NextLink from 'next/link'
import FavoriteButton from '@/components/FavoriteButton'

export default function CourseItem({ course }) {
	const title = encodeURIComponent(course?.title)
	return (
		<Card radius="none" shadow="none" className="bg-default-50 w-full">
			<CardBody className="p-2 overflow-hidden">
				<Link as={NextLink} href={`/courses/${course?.slug}/${course?._id}?title=${title}`}>
					<Image
						isZoomed
						isBlurred
						radius="none"
						className="w-full aspect-video rounded-none object-cover object-center border border-default-100 select-none"
						src={course?.thumbnail}
						width={0}
						height={0}
						alt={course?.title}
					/>
				</Link>
				<Spacer y={1} />
				<div className="flex items-center justify-between ps-1">
					<div className='w-[80%]'>
					    <Link className="w-full" as={NextLink} href={`/courses/${course?.slug}/${course?._id}`}>
    						<div className="w-full text-default-700">
    							<h4 className="text-ellipsis-custom text-sm">{course?.title}</h4>
    							<span className="font-bold">
    								₹{course?.price}
    								<span className="text-default-500 font-bold text-tiny line-through ms-1">
    									₹{course?.mrp}
    								</span>
    							</span>
    						</div>
    					</Link>
					</div>
					<div className="p-2 cursor-pointer">
						<FavoriteButton isFavorite={course?.isFavorite} courseId={course?._id} />
					</div>
				</div>
			</CardBody>
		</Card>
	)
}
