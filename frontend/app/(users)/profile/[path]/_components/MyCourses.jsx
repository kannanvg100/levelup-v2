import { getEnrolledCourses, getCertificate } from '@/apis/courses'
import {
	Button,
	Card,
	CardBody,
	CardFooter,
	Divider,
	Dropdown,
	DropdownItem,
	DropdownMenu,
	DropdownTrigger,
	Link,
	Progress,
	Spacer,
	Tooltip,
	useDisclosure,
} from '@nextui-org/react'
import { useInfiniteQuery, useQueryClient } from '@tanstack/react-query'
import { MoreVertical, Star } from 'lucide-react'
import React, { useEffect, useState } from 'react'
import toast from 'react-hot-toast'
import useInfiniteScroll from '@/hooks/useInfiniteScroll'
import WriteReviewModal from './WriteReviewModal'
import NextLink from 'next/link'
import CourseItemDummy from './CourseItemSkeleton'
import Image from 'next/image'
import CertificateModal from './CertificateModal'

export default function Courses() {
	const limit = 4
	const [currentCourse, setCurrentCourse] = useState({})
	const queryClient = useQueryClient()

	const { data, fetchNextPage, hasNextPage, isFetchingNextPage, isPending, refetch } = useInfiniteQuery({
		queryKey: ['courses'],
		queryFn: ({ pageParam = 1 }) => getEnrolledCourses({ page: pageParam, count: limit }),
		initialPageParam: 1,
		getNextPageParam: (lastPage, allPages, lastPageParam, allPageParams) => {
			const totalPages = Math.ceil(lastPage?.total / limit)
			const nextPage = lastPageParam + 1
			return nextPage <= totalPages ? nextPage : undefined
		},
		staleTime: Infinity,
	})

	const handleGetCertificate = (item) => {
		setCurrentCourse(item)
		onOpenCertificateModal()
	}

	const loaderRef = useInfiniteScroll({ hasNextPage, fetchNextPage, isFetchingNextPage })
	const { isOpen: isOpenReviewModal, onOpen: onOpenReviewModal, onClose: onCloseReviewModal } = useDisclosure()
	const {
		isOpen: isOpenCertificateModal,
		onOpen: onOpenCertificateModal,
		onClose: onCloseCertificateModal,
	} = useDisclosure()

	const CourseItem = ({ index, item }) => {
		const course = item
		let allSegments = course?.course?.chapters?.reduce((acc, chapter) => [...acc, ...chapter.segments], [])
		allSegments = allSegments?.map((item) => item._id)

		let completedSegments = course?.progress?.chapters?.reduce((acc, chapter) => [...acc, ...chapter.segments], [])
		completedSegments = completedSegments?.map((item) => item.segment)

		const commonSegments = allSegments?.filter((item) => completedSegments?.includes(item))
		let percentage = (commonSegments?.length / allSegments?.length) * 100

		percentage = Math.round(percentage > 100 ? 100 : percentage)

		return (
			<Card key={index} className="max-w-[280px]" shadow="sm">
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
									{item?.review?.rating ? (
										<Tooltip
											placement="left"
											radius="none"
											shadow="md"
											content={
												<div className="p-2 text-default-700">
													<p className="text-tiny text-default-500 font-semibold">
														{item?.review?.subject}
													</p>
													<p className="text-tiny text-default-500 mt-2 max-w-[200px] max-h-[300px] overflow-hidden">
														{item?.review?.comment}
													</p>
													<p
														className="underline cursor-pointer text-tiny mt-2"
														onClick={() => {
															setCurrentCourse(item)
															onOpenReviewModal()
														}}>
														Edit your review
													</p>
												</div>
											}>
											<div className="flex items-center border-1 px-1 cursor-pointer">
												<p className="text-left text-small text-ellipsis-95">
													{item?.review?.rating}
												</p>
												<Spacer x={0.5} />
												<Star size={14} fill="#EAB308" color="#EAB308" />
											</div>
										</Tooltip>
									) : (
										<p
											className="text-tiny underline cursor-pointer"
											onClick={() => {
												setCurrentCourse(item)
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
													onClick={() => handleGetCertificate(item?.course)}
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

	return (
		<>
			<div className="mt-4 ms-2 flex flex-wrap md:justify-between gap-y-4 gap-x-2 justify-center">
				{data?.pages?.map((page) =>
					page?.courses?.map((item, index) => <CourseItem key={item?.course?._id} item={item} />)
				)}
				{(isFetchingNextPage || isPending) && [...Array(limit)].map((_, i) => <CourseItemDummy key={i} />)}
				{[...Array(limit)].map((_, i) => (
					<div key={i} className="w-[280px]"></div>
				))}
			</div>
			<div className="w-1 h-1" ref={loaderRef}></div>
			<Spacer y={4} />
			{data?.pages[0]?.total > 0 && !hasNextPage && (
				<div className="relative flex justify-center">
					<Divider className="h-[1px] bg-default-200 max-w-[500px]" />
					<span className="bg-background px-4 text-center italic text-sm whitespace-nowrap text-default-200 absolute left-[50%] top-[50%] translate-x-[-50%] translate-y-[-50%]">
						You've reached the end!
					</span>
				</div>
			)}
			{data?.pages[0]?.total === 0 && !isPending && (
				<p className="mt-10 text-center text-default-500">No Courses</p>
			)}
			<WriteReviewModal
				isOpen={isOpenReviewModal}
				onClose={onCloseReviewModal}
				course={currentCourse}
				refetch={refetch}
			/>
			{isOpenCertificateModal && (
				<CertificateModal
					isOpen={isOpenCertificateModal}
					onClose={onCloseCertificateModal}
					courseId={currentCourse._id}
				/>
			)}
		</>
	)
}
