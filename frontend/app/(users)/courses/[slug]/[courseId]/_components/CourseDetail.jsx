'use client'
import { useEffect, useState } from 'react'
import {
	Breadcrumbs,
	BreadcrumbItem,
	Spacer,
	Accordion,
	AccordionItem,
	Button,
	Image,
	Card,
	CardBody,
	CardFooter,
	Tooltip,
	useDisclosure,
	Skeleton,
} from '@nextui-org/react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { getCourse, getEnrollment } from '@/api/courses'
import toast from 'react-hot-toast'
import IntroVideoModal from './IntroVideoModal'

import { Calendar, Globe, Home, MessageCircle, PlayCircle, PlaySquare, Star } from 'lucide-react'
import Reviews from './Reviews'
import { useRouter } from 'next/navigation'
import { createChat } from '@/api/chats'
import Link from 'next/link'
import { useSelector } from 'react-redux'
import { useChat } from '@/components/providers/ChatProvider'
import CheckoutModal from './CheckoutModal'

export default function CourseDetail({ slug, courseId }) {
	const { user } = useSelector((state) => state.user)
	const [course, setCourse] = useState('')
	const [enrollment, setEnrollment] = useState('')
	const router = useRouter()
	const queryClient = useQueryClient()
	const { expandChat, setChat } = useChat()
	const { isOpen: isOpenIntroVideo, onOpen: onOpenIntroVideo, onClose: onCloseIntroVideo } = useDisclosure()
	const { isOpen: isOpenCheckout, onOpen: onOpenCheckout, onClose: onCloseCheckout } = useDisclosure()
	const [introSegment, setIntroSegment] = useState('')

	const { data, isPending, isError } = useQuery({
		queryKey: ['course', courseId],
		queryFn: () => getCourse(courseId),
		keepPreviousData: true,
	})

	useEffect(() => {
		if (data?.course) setCourse(data?.course)
	}, [data])

	const {
		data: enrollmentData,
		isPending: isLoadingEnrollment,
		isError: isErrorEnrollment,
	} = useQuery({
		queryKey: ['enrollment', courseId],
		queryFn: () => getEnrollment(courseId),
		keepPreviousData: true,
		enabled: !!user,
	})

	useEffect(() => {
		if (enrollmentData?.enrollment) {
			setEnrollment(enrollmentData?.enrollment)
		}
	}, [enrollmentData])

	const handleEnroll = () => {
		if (!enrollment) onOpenCheckout()
		else router.push(`/courses/${slug}/${courseId}/learn`)
	}

	const { isPending: isLoadingCreateChat, mutate: mutateCreateChat } = useMutation({
		mutationFn: createChat,
		onSuccess: async (data) => {
			setChat(data?.chat)
			expandChat()
			queryClient.invalidateQueries({ queryKey: ['chats', { id: user?._id }] })
		},
		onError: (error) => {
			const err = error?.response?.data?.message
			if (err) toast.error(error?.response?.data?.message || 'Something went wrong!')
		},
	})

	if (isPending || !course)
		return (
			<div className="max-w-5xl mx-auto mt-2 h-screen">
				<div className="flex justify-center sm:justify-start items-start gap-8 flex-wrap">
					<div>
						<div className="flex gap-4">
							<Skeleton className="h-5 w-5"></Skeleton>
							<Skeleton className="h-5 w-[120px]"></Skeleton>
						</div>
						<Spacer y={2} />
						<Skeleton>
							<div className="h-[200px] w-[350px]"></div>
						</Skeleton>
						<Spacer y={4} />
						<div className="ml-3 flex gap-2 items-end">
							<Skeleton className="w-[70px]">
								<div className="h-[30px]"></div>
							</Skeleton>
							<Skeleton className="w-[120px]">
								<div className="h-[22px]"></div>
							</Skeleton>
						</div>
						<Spacer y={2} />
						<div className="mx-3">
							<Skeleton className="">
								<div className="h-[48px]"></div>
							</Skeleton>
						</div>
					</div>
					<div className="flex-grow max-w-[600px] mt-8">
						<Skeleton className="w-[300px]">
							<div className="h-8"></div>
						</Skeleton>
						<Spacer y={2} />
						<Skeleton className="w-[500px]">
							<div className="h-[70px]"></div>
						</Skeleton>
					</div>
				</div>
			</div>
		)

	return (
		<>
			<div className="max-w-5xl mx-auto mt-2">
				<div className="flex justify-center lg:justify-start items-start flex-wrap lg:flex-nowrap">
					<div className="lg:sticky lg:top-16 self-start w-[600px] lg:w-[350px]">
						<Breadcrumbs>
							<BreadcrumbItem className="cursor-default">
								<Home size={12} />
							</BreadcrumbItem>
							<BreadcrumbItem>
								<Link href={`/courses?filter=category%3D${course?.category?._id}`}>
									{course?.category?.title}
								</Link>
							</BreadcrumbItem>
						</Breadcrumbs>
						<Spacer y={2} />
						<Card shadow="none" className="min-w-[350px]" radius="none">
							<CardBody className="overflow-visible p-0 opacity-90 hover:opacity-100">
								<div className="relative w-full">
									<Image
										alt={course?.title}
										className="w-[600px] max-h-[300px] object-cover rounded-none border dark:border-default-50"
										src={course?.thumbnail}
									/>

									<div className="absolute inset-0 flex justify-center items-center z-10 border dark:border-default-50">
										<div className="bg-default-50 rounded-full shadow-lg hover:text-primary opacity-95">
											<PlayCircle
												size={64}
												className="cursor-pointer"
												onClick={() => {
													const introChapter = course?.chapters?.find(
														(ch) => ch.title === 'Introduction'
													)
													const segment = introChapter?.segments[0]
													if (segment) {
														setIntroSegment(segment)
														onOpenIntroVideo()
													} else toast.error('No intro video found!')
												}}
											/>
										</div>
									</div>
								</div>
							</CardBody>
							<CardFooter className="justify-start">
								<div className="w-full">
									{enrollment ? (
										<p className="text-tiny italic">
											purchased on{' '}
											{new Date(enrollment.purchasedAt).toLocaleDateString('en-IN', {
												day: 'numeric',
												month: 'short',
												year: 'numeric',
											})}
										</p>
									) : (
										<div className="flex justify-start items-baseline gap-2">
											<p className="text-2xl font-bold">₹{course?.price}</p>
											<p className="text-default-500 line-through">₹{course?.mrp}</p>
											<p className="text-default-500 text-sm">
												{Math.ceil((course.price * 100) / course.mrp)}% off
											</p>
										</div>
									)}
									<Spacer y={3} />

									<Button
										fullWidth={true}
										color="primary"
										variant="flat"
										size="lg"
										radius="none"
										onClick={handleEnroll}
										className="font-bold">
										{enrollment
											? enrollment?.progress > 0
												? 'Continue Learning'
												: 'Start Learning'
											: 'Enroll Now'}
									</Button>

									<Spacer y={2} />
									<p className="text-tiny text-default-500 text-center">Full Lifetime Access</p>

									<Spacer y={2} />
								</div>
							</CardFooter>
						</Card>
					</div>
					<div className="flex-grow max-w-[600px] lg:max-w-max lg:pl-8 sm:mt-8">
						<p className="text-3xl font-semibold -mt-2">{course?.title}</p>

						<Spacer y={2} />
						<p className="text-sm text-default-700">{course?.description}</p>

						<Spacer y={4} />
						<div className="flex gap-2 items-center">
							<p className="text-sm text-default-500">Created by</p>
							<p className="text-sm font-medium text-default-700">{course?.teacher?.name}</p>

							<Tooltip content="Message the Author" placement="right">
								<MessageCircle
									size={16}
									strokeWidth={2.5}
									className="text-primary cursor-pointer"
									onClick={() => {
										mutateCreateChat({ receiver: course?.teacher?._id })
									}}
								/>
							</Tooltip>
						</div>

						<Spacer y={2} />
						<div></div>

						{course?.rating?.count > 0 && (
							<div className="flex justify-start items-center gap-2 mb-2">
								<div className="inline-flex items-center border-1 dark:border-default-100 px-1 cursor-pointer">
									<p className="text-left text-small text-ellipsis-95">
										{course?.rating?.avg.toFixed(1) || 'Not rated yet'}
									</p>
									<Spacer x={0.5} />
									<Star size={14} fill="#EAB308" color="#EAB308" />
								</div>
								<p className="text-sm font-normal">{course?.rating?.count} Reviews</p>
							</div>
						)}
						<div className="flex gap-4">
							<div className="flex gap-1 items-center">
								<Calendar size={14} />
								<p className="text-sm">Last updated 11/2023</p>
							</div>

							<div className="flex gap-1 items-center">
								<Globe size={14} />
								<p className="text-sm">English</p>
							</div>
						</div>

						<Spacer y={6} />
						<p className="font-bold text-lg">Course Content</p>

						<Spacer y={1} />

						<div className="bg-default-500">
							<Accordion variant="light" className="bg-default-50" showDivider={false}>
								{course?.chapters?.map((chapter, index) => (
									<AccordionItem
										key={chapter._id}
										title={
											<div className="flex justify-between items-center gap-1 px-2">
												<p className="text-sm font-medium">
													{index + 1}. {chapter.title}
												</p>
												<p className="text-tiny font-normal text-default-500">
													{chapter?.segments?.length} Chapters
												</p>
											</div>
										}>
										<div className="flex flex-col gap-2 ms-2">
											{chapter?.segments?.map((seg, index) => (
												<div
													key={seg._id}
													className="flex items-center gap-2 cursor-pointer hover:underline">
													<p className="text-sm">{index + 1}.</p>
													<p className="text-sm">{seg.title}</p>
													<PlaySquare size={14} />
												</div>
											))}
										</div>
									</AccordionItem>
								))}
							</Accordion>
						</div>

						<Spacer y={6} />
						<p className="font-bold text-lg">Review & Ratings</p>

						<Spacer y={1} />
						<Reviews courseId={course._id} />
					</div>
				</div>
			</div>
			<IntroVideoModal isOpen={isOpenIntroVideo} onClose={onCloseIntroVideo} segment={introSegment} />
			{isOpenCheckout && <CheckoutModal isOpen={isOpenCheckout} onClose={onCloseCheckout} course={course} />}
		</>
	)
}
