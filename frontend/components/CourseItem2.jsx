import { Avatar, Button, Card, CardBody, Image, Link, Spacer } from '@nextui-org/react'
import React, { useEffect } from 'react'
import NextLink from 'next/link'

export default function CourseItem2({ course: data }) {
	useEffect(() => {
		console.log('data', data)
	}, [data])
	return (
		<Link as={NextLink} href={`/courses/${data?.course?.slug}/${data?.course?._id}`}>
			<Card radius="none" shadow="none" className="bg-default-50 w-[450px]">
				<CardBody className="p-0">
					<div className="flex gap-2">
						<Image
							radius="none"
							className="h-[180px] rounded-none object-cover object-center border border-default-100"
							src={data?.course?.thumbnail}
							width={220}
							height={180}
							alt={data?.course?.title}
						/>
						<div className="w-[200px] flex flex-col">
							<div className="flex gap-2 items-start justify-start mt-4">
								<Avatar src={data?.teacher?.profileImage} size="md" className="inline-flex" />
								<div>
								    <h4 className="text-ellipsis-custom text-md mt-1">{data?.course?.title}</h4>
    								<p className='text-tiny text-default-500 '>{data?.teacher?.name}</p>
								</div>
							</div>
							<Spacer y={6} />
							<Button
								as={NextLink}
								href={`/courses/${data?.course?.slug}/${data?.course?._id}/learn`}
								size="md"
								color="primary"
								variant="solid"
								className="font-semibold text-white self-start">
								Continue
							</Button>
						</div>
					</div>
				</CardBody>
			</Card>
		</Link>
	)
}
