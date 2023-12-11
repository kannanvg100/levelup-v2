'use client'
import { getEnrolledCourses, getCertificate } from '@/api/courses'
import {
	Button,
	Card,
	CardBody,
	CardFooter,
	Dropdown,
	DropdownItem,
	DropdownMenu,
	DropdownTrigger,
	Image,
	Link,
	Progress,
	Spacer,
	Tooltip,
	useDisclosure,
} from '@nextui-org/react'
import { MoreVertical, Star } from 'lucide-react'
import React, { useEffect, useState } from 'react'
import toast from 'react-hot-toast'
import { useQuery, useQueryClient } from '@tanstack/react-query'
import WriteReviewModal from './WriteReviewModal'
import NextLink from 'next/link'

export default function Page() {
	const [courses, setCourses] = useState([])
	const [reviews, setReviews] = useState([])
	const [page, setPage] = useState(1)
	const [count, setCount] = useState(10)
	const [currentCourse, setCurrentCourse] = useState({})
	const queryClient = useQueryClient()

	const { data, isPending, isError } = useQuery({
		queryKey: ['my-courses'],
		queryFn: () => getEnrolledCourses({ page, count }),
		keepPreviousData: true,
	})

	const handleGetCertificate = async (courseId) => {
		try {
			const certificate = await queryClient.fetchQuery({
				queryFn: () => getCertificate({ courseId }),
				queryKey: ['certificate', courseId],
			})
			const buffer = Buffer.from(certificate?.image, 'base64')
			const blob = new Blob([buffer], { type: 'image/png' })
			const link = document.createElement('a')
			link.href = window.URL.createObjectURL(blob)
			link.download = 'certificate.png'
			link.click()
		} catch (error) {
			toast.error(error?.response?.data?.message || 'Something went wrong!')
		}
	}

	useEffect(() => {
		if (data) {
			let courses = data?.courses
			courses.forEach((item) => {
				item.rating = data?.reviews.find((review) => review.course === item.course._id)
			})
			setCourses(courses)
		}
	}, [data])

	const progressPercentage = (courseId) => {
		const course = courses.find((item) => item.course._id === courseId)
		let allSegments = course?.course?.chapters?.reduce((acc, chapter) => [...acc, ...chapter.segments], [])
		allSegments = allSegments?.map((item) => item._id)

		let completedSegments = course?.progress?.chapters?.reduce((acc, chapter) => [...acc, ...chapter.segments], [])
		completedSegments = completedSegments?.map((item) => item.segment)

		const commonSegments = allSegments?.filter((item) => completedSegments?.includes(item))
		const percentage = (commonSegments?.length / allSegments?.length) * 100

		return Math.round(percentage > 100 ? 100 : percentage)
	}

	const { isOpen: isOpenReviewModal, onOpen: onOpenReviewModal, onClose: onCloseReviewModal } = useDisclosure()

	return (
		<div>
			<p className="text-[1.2rem] font-semibold text-default-700">My Courses</p>
			<spacer y={2} />
			<div className="flex gap-8 mt-4">
				{courses &&
					courses.map((item, index) => (
						<Card key={index} className="max-w-[350px]" shadow="md" radius="none">
							<CardBody className="overflow-visible p-0">
								<Link as={NextLink} href={`/courses/${item?.course?.slug}/${item?.course?._id}`}>
									<Image
										shadow="sm"
										radius="none"
										width={300}
										height={160}
										alt={item?.course?.title}
										className="object-cover w-[300px] h-[160px]"
										src={item?.course?.thumbnail}
									/>
								</Link>
							</CardBody>
							<CardFooter>
								<div className="w-full">
									<p className="text-left text-small font-semibold text-ellipsis-95">
										{item?.course?.title}
									</p>
									<Spacer y={1} />
									<p className="text-left text-tiny text-ellipsis-95">{item?.teacher?.name}</p>
									<Spacer y={1} />
									<Progress
										size="sm"
										aria-label="Loading..."
										value={progressPercentage(item?.course?._id)}
									/>
									<Spacer y={1} />
									<div className="flex justify-between items-center">
										<p className="text-left text-tiny text-ellipsis-95">
											{progressPercentage(item?.course?._id) === 0
												? 'Start learning'
												: progressPercentage(item?.course?._id) === 100
												? 'Course Completed'
												: `${progressPercentage(item?.course?._id)}% complete`}
										</p>
										<div className="flex gap-2 items-center">
											{item?.rating ? (
												<Tooltip
													placement="left"
													radius="none"
													shadow="md"
													content={
														<div className="p-2 text-default-700">
															<p className="text-tiny text-default-500 font-semibold">
																{item?.rating?.subject}
															</p>
															<p className="text-tiny text-default-500 mt-2 max-w-[200px] max-h-[300px] overflow-hidden">
																{item?.rating?.comment}
															</p>
															<p
																className="underline cursor-pointer text-tiny mt-2"
																onClick={() => {
																	setCurrentCourse(item?.course)
																	onOpenReviewModal()
																}}>
																Edit your review
															</p>
														</div>
													}>
													<div className="flex items-center border-1 px-1 cursor-pointer">
														<p className="text-left text-small text-ellipsis-95">
															{item?.rating?.rating}
														</p>
														<Spacer x={0.5} />
														<Star size={14} fill="#EAB308" color="#EAB308" />
													</div>
												</Tooltip>
											) : (
												<p
													className="text-tiny underline cursor-pointer"
													onClick={() => {
														setCurrentCourse(item?.course)
														onOpenReviewModal()
													}}>
													Write a review
												</p>
											)}
											<Dropdown>
												<DropdownTrigger>
													<Button isIconOnly variant="light">
														<MoreVertical size={16} />
													</Button>
												</DropdownTrigger>
												<DropdownMenu aria-label="Static Actions">
													{progressPercentage(item?.course?._id) === 100 && <DropdownItem
														onClick={() => handleGetCertificate(item?.course?._id)}
														key="download">
														Download Certificate
													</DropdownItem>}
													<DropdownItem key="rate">Review Course</DropdownItem>
												</DropdownMenu>
											</Dropdown>
										</div>
									</div>
								</div>
							</CardFooter>
						</Card>
					))}
			</div>
			<WriteReviewModal isOpen={isOpenReviewModal} onClose={onCloseReviewModal} course={currentCourse} />
		</div>
	)
}
