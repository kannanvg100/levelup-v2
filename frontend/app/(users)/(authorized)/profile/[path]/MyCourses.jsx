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
	Tab,
	Tabs,
	Tooltip,
	useDisclosure,
} from '@nextui-org/react'
import { MoreVertical, Star } from 'lucide-react'
import React, { useEffect, useMemo, useState } from 'react'
import toast from 'react-hot-toast'
import { useQuery, useQueryClient } from '@tanstack/react-query'
import NextLink from 'next/link'
import NextImage from 'next/image'
import WriteReviewModal from './WriteReviewModal'

export default function MyCourses() {
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
		staleTime: Infinity,
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

	const CourseItem = ({ index, item }) => {
		const course = courses.find((it) => it?.course?._id === item?.course?._id)
		let allSegments = course?.course?.chapters?.reduce((acc, chapter) => [...acc, ...chapter.segments], [])
		allSegments = allSegments?.map((item) => item._id)

		let completedSegments = course?.progress?.chapters?.reduce((acc, chapter) => [...acc, ...chapter.segments], [])
		completedSegments = completedSegments?.map((item) => item.segment)

		const commonSegments = allSegments?.filter((item) => completedSegments?.includes(item))
		let percentage = (commonSegments?.length / allSegments?.length) * 100

		percentage = Math.round(percentage > 100 ? 100 : percentage)

		return (
			<Card key={index} className="max-w-[350px] mt-4" shadow="sm">
				<CardBody className="overflow-visible p-0">
					<Link as={NextLink} href={`/courses/${item?.course?.slug}/${item?.course?._id}`}>
						<Image
							// as={NextImage}
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
				<CardFooter className="p-0">
					<div className="w-full">
						{percentage > 0 && (
							<Progress
								size="sm"
								radius="none"
								isStriped
								aria-label={`${percentage}% complete}`}
								value={percentage}
								classNames={{
									track: 'h-2',
								}}
							/>
						)}
						<div className="p-2">
							<p className="text-left text-small font-semibold text-ellipsis-95">{item?.course?.title}</p>
							<Spacer y={1} />
							<p className="text-left text-tiny text-ellipsis-95 text-default-500 font-medium">
								{item?.teacher?.name}
							</p>
							<Spacer y={1} />

							<div className="flex justify-between items-center">
								<p className="text-left text-tiny text-ellipsis-95">
									{percentage === 0 ? (
										<Link
											className="text-tiny underline"
											as={NextLink}
											href={`/courses/${item?.course?.slug}/${item?.course?._id}/learn`}>
											Start learning
										</Link>
									) : percentage === 100 ? (
										'Course Completed'
									) : (
										`${percentage}% complete`
									)}
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
											<Button isIconOnly radius="full" variant="light">
												<MoreVertical size={16} />
											</Button>
										</DropdownTrigger>
										<DropdownMenu aria-label="Static Actions">
											{percentage === 100 && (
												<DropdownItem
													onClick={() => handleGetCertificate(item?.course?._id)}
													key="download">
													Download Certificate
												</DropdownItem>
											)}
											<DropdownItem key="rate">Review Course</DropdownItem>
										</DropdownMenu>
									</Dropdown>
								</div>
							</div>
						</div>
					</div>
				</CardFooter>
			</Card>
		)
	}

	const { isOpen: isOpenReviewModal, onOpen: onOpenReviewModal, onClose: onCloseReviewModal } = useDisclosure()

	return (
		<>
			<div className="flex flex-wrap gap-4">
				{courses && courses.map((item, index) => <CourseItem index={index} item={item} />)}
			</div>
			<WriteReviewModal isOpen={isOpenReviewModal} onClose={onCloseReviewModal} course={currentCourse} />
		</>
	)
}
