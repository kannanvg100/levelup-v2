import { Card, CardBody, Link, Spacer } from '@nextui-org/react'
import React from 'react'
import NextLink from 'next/link'
import NextImage from 'next/image'

export default function CourseItem({ course }) {
	return (
		<Link as={NextLink} href={`/courses/${course?.slug}/${course?._id}`}>
			<Card radius="none" shadow="none" className="bg-default-100 w-[270px]">
				<CardBody className="p-0">
					<NextImage
						as={NextImage}
						radius="none"
						className="h-[125px] rounded-none object-cover object-center border border-default-100"
						src={course?.thumbnail}
						width={270}
						height={125}
						alt={course?.title}
					/>
					<NextImage
						as={NextImage}
						radius="none"
						className="absolute right-4 top-[102px] h-[45px] w-[45px] rounded-full object-cover object-center shadow-xl border-2 border-default-100"
						src={course?.teacher?.profileImage}
						width={45}
						height={45}
						alt={course?.title}
					/>
					<Spacer y={4} />
					<div className="p-2">
						<h4 className="w-[200px] text-ellipsis-custom text-sm font-medium">{course?.title}</h4>
						<Spacer y={2} />
						<div className="h-[50px] overflow-hidden pb-4">
							<span className="text-tiny text-default-500 ellipsis-container">{course?.description}</span>
						</div>
					</div>
				</CardBody>
			</Card>
		</Link>
	)
}
