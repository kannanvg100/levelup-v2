'use client'
import { getFullCourse, getEnrollment } from '@/api/courses'
import { setProgress } from '@/api/segments'
import VideoPlayer from '@/components/VideoPlayer'
import {
	BreadcrumbItem,
	Breadcrumbs,
	Button,
	Image,
	Popover,
	PopoverContent,
	PopoverTrigger,
	Skeleton,
	Spacer,
	Tab,
	Tabs,
	User,
} from '@nextui-org/react'
import { CheckCircle, CheckCircle2, MessageSquareShare, Play, PlaySquare, Share2 } from 'lucide-react'
import React, { useEffect, useLayoutEffect, useMemo, useRef, useState } from 'react'
import toast from 'react-hot-toast'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import Comments from './_components/Comments'
import { useSelector } from 'react-redux'
import Confetti from 'react-confetti'
import { intervalToDuration } from 'date-fns'
import { twMerge } from 'tailwind-merge'
import { useChat } from '@/components/providers/ChatProvider'
import { createChat } from '@/api/chats'
import SharePanel from './_components/SharePanel'

export default function Page({ params: { slug, courseId } }) {
	const { user } = useSelector((state) => state.user)
	const [course, setCourse] = useState('')
	const [currentChapter, setCurrentChapter] = useState(null)
	const [currentSegment, setCurrentSegment] = useState(null)
	const [currentAccordian, setCurrentAccordian] = useState(0)
	const [enrollment, setEnrollment] = useState(null)
	const queryClient = useQueryClient()
	const windowSize = useRef()
	const [showConfetti, setShowConfetti] = useState(false)
	const { expandChat, setChat } = useChat()
	const contentRef = useRef()
	const videoPlayerRef = useRef()

	const pageUrl = useMemo(() => {
		return `${process.env.NEXT_PUBLIC_URL}/courses/${slug}/${courseId}`
	}, [slug, courseId])

	const { data, isPending, isError } = useQuery({
		queryKey: ['course', courseId],
		queryFn: () => getFullCourse(courseId),
		keepPreviousData: true,
		enabled: !!courseId,
	})

	useEffect(() => {
		if (data?.course) {
			setCourse(data?.course)
			setCurrentChapter(data?.course?.chapters[0])
			setCurrentSegment(data?.course?.chapters[0].segments[0])
			setCurrentAccordian(data?.course?.chapters[0]._id)
		}
	}, [data])

	const { isPending: isLoadingMarkProgress, mutate: mutateMarkProgress } = useMutation({
		mutationFn: setProgress,
		onSuccess: (data) => {
			queryClient.invalidateQueries({ queryKey: ['progress', { courseId }] })
			nextSegment()
		},
		onError: (error) => {
			const err = error?.response?.data?.message
			if (err) toast.error(error?.response?.data?.message || 'Something went wrong!')
		},
	})

	const handleMarkProgress = async (segmentId) => {
		mutateMarkProgress({ courseId: course?._id, chapterId: currentChapter?._id, segmentId })
	}

	const {
		data: enrollmentData,
		isPending: isLoadingEnrollment,
		isError: isErrorEnrollment,
	} = useQuery({
		queryKey: ['enrollment', courseId],
		queryFn: () => getEnrollment(courseId),
		keepPreviousData: true,
		enabled: !!courseId,
	})

	useEffect(() => {
		if (enrollmentData?.enrollment) {
			setEnrollment(enrollmentData?.enrollment)
		}
	}, [enrollmentData])

	const checkProgressStatus = (chapterId, segmentId) => {
		const progress = enrollment?.progress?.chapters
		if (!progress) return false
		const chapter = progress.find((prog) => prog?.chapterId === chapterId)
		if (!chapter) return false
		const segment = chapter?.segments.find((seg) => seg?.segmentId === segmentId)
		if (!segment) return false
		return true
	}

	const nextSegment = () => {
		const currentSegmentIndex = currentChapter?.segments.findIndex((seg) => seg?._id === currentSegment?._id)
		if (currentSegmentIndex === currentChapter?.segments.length - 1) {
			const currentChapterIndex = course?.chapters.findIndex((chap) => chap?._id === currentChapter?._id)
			const nextChapter = course?.chapters[currentChapterIndex + 1]
			const nextSegment = nextChapter?.segments[0]
			setCurrentChapter(nextChapter)
			setCurrentSegment(nextSegment)
		} else {
			const nextSegment = currentChapter?.segments[currentSegmentIndex + 1]
			setCurrentSegment(nextSegment)
		}

		const lastSegment = currentChapter?.segments[currentChapter?.segments.length - 1]
		const lastChapter = course?.chapters[course?.chapters.length - 1]
		const lastChapterLastSegment = lastChapter?.segments[lastChapter?.segments.length - 1]

		if (lastSegment?._id === currentSegment?._id && lastChapterLastSegment?._id === currentSegment?._id) {
			setShowConfetti(true)
			setTimeout(() => {
				setShowConfetti(false)
			}, 5000)
		}
	}

	// const duration = (s) => {
	//     if(s < 60) return `0:${s}`

	// }

	function duration(seconds) {
		const duration = intervalToDuration({ start: 0, end: seconds * 1000 })
		const zeroPad = (num) => String(num).padStart(2, '0')
		const formatted = [duration.hours, duration.minutes || '00', duration.seconds]
			.filter(Boolean)
			.map(zeroPad)
			.join(':')
		return formatted
	}

	const { isPending: isLoadingCreateChat, mutate: mutateCreateChat } = useMutation({
		mutationFn: createChat,
		onSuccess: (data) => {
			setChat(data?.chat)
			expandChat()
			queryClient.invalidateQueries({ queryKey: ['chats'] })
		},
		onError: (error) => {
			const err = error?.response?.data?.message
			if (err) toast.error(error?.response?.data?.message || 'Something went wrong!')
		},
	})

	if (isPending) {
		return (
			<div className="w-full max-w-5xl mx-auto">
				<Spacer y={4} />
				<div className="flex gap-4 flex-wrap">
					<div className="flex-1 min-w-[500px]">
						<Skeleton className="flex flex-col gap-4">
							<div className="w-full h-full"></div>
							<div>
								<Breadcrumbs size="sm" variant="solid">
									<Skeleton>
										<BreadcrumbItem>title</BreadcrumbItem>
									</Skeleton>
									<Skeleton>
										<BreadcrumbItem>title2</BreadcrumbItem>
									</Skeleton>
								</Breadcrumbs>
								<Spacer y={2} />
								<div>
									<Skeleton>
										<p className="text-lg font-medium">seg_title</p>
									</Skeleton>
								</div>
								<Spacer y={4} />
								<div className="flex justify-between items-center gap-4 bg-default-100 p-4">
									<div className="flex gap-4 items-center">
										<User
											name={course?.teacher?.name}
											description="Instructor"
											avatarProps={{
												src: course?.teacher?.profileImage,
											}}
										/>
										<Button
											className="text-white"
											isLoading={isLoadingCreateChat}
											radius="none"
											size="sm"
											color="primary"
											variant="solid"
											startContent={<MessageSquareShare size={16} />}
											onClick={() => {
												mutateCreateChat({ receiver: course?.teacher?._id })
											}}>
											Message
										</Button>
									</div>
									<div className="flex gap-3 items-center">
										<Skeleton className="w-6 h-6"></Skeleton>
										<Skeleton className="w-32 h-6"></Skeleton>
									</div>
								</div>
								<Spacer y={4} />
								<Tabs aria-label="Options" variant="underlined">
									<Tab key="comments" title="Comments">
										<Comments segmentId={currentSegment?._id} />
									</Tab>
									<Tab key="description" title="Description">
										<p className="ms-2">{currentSegment?.description}</p>
									</Tab>
								</Tabs>
							</div>
						</Skeleton>
					</div>
					<Skeleton className="w-full md:w-[300px] h-[400px] self-start"></Skeleton>
				</div>
			</div>
		)
	}

	return (
		<div className="w-full max-w-5xl mx-auto">
			<Spacer y={4} />
			<div className="flex gap-4 flex-wrap">
				<div className="flex-1 min-w-[500px]">
					<div className="flex flex-col gap-4">
						<VideoPlayer
							segment={currentSegment}
							onEnded={handleMarkProgress}
							userId={user?._id}
							width="full"
							height="full"
							ref={videoPlayerRef}
						/>
						<div>
							<Breadcrumbs size="sm" variant="solid">
								<BreadcrumbItem>{course?.title}</BreadcrumbItem>
								<BreadcrumbItem>{currentChapter?.title}</BreadcrumbItem>
							</Breadcrumbs>
							<Spacer y={2} />
							<div>
								<p className="text-lg font-medium">{currentSegment?.title}</p>
							</div>
							<Spacer y={4} />
							<div className="flex justify-between items-center gap-4 bg-default-100 p-4">
								<div className="flex gap-4 items-center">
									<User
										name={course?.teacher?.name}
										description="Instructor"
										avatarProps={{
											src: course?.teacher?.profileImage,
										}}
									/>
									<Button
										className="text-white"
										isLoading={isLoadingCreateChat}
										radius="none"
										size="sm"
										color="primary"
										variant="solid"
										startContent={<MessageSquareShare size={16} />}
										onClick={() => {
											mutateCreateChat({ receiver: course?.teacher?._id })
										}}>
										Message
									</Button>
								</div>
								<div className="flex gap-3 items-center">
									<Popover placement="bottom" showArrow={true} backdrop="opaque" shouldBlockScroll>
										<PopoverTrigger>
											<Button
												isIconOnly
												radius="none"
												size="sm"
												color="primary"
												variant="flat"
												startContent={<Share2 size={16} />}></Button>
										</PopoverTrigger>
										<PopoverContent className="w-[400px]">
											<SharePanel pageUrl={pageUrl} title={course?.title} />
										</PopoverContent>
									</Popover>

									<Button
										isLoading={isLoadingMarkProgress}
										radius="none"
										size="sm"
										color="primary"
										variant="flat"
										startContent={<CheckCircle2 size={16} />}
										onClick={() => handleMarkProgress(currentSegment?._id)}>
										Mark as completed
									</Button>
								</div>
							</div>
							<Spacer y={4} />
							<Tabs aria-label="Options" variant="underlined">
								<Tab key="comments" title="Comments">
									<Comments segmentId={currentSegment?._id} />
								</Tab>
								<Tab key="description" title="Description">
									<p className="ms-2">{currentSegment?.description}</p>
								</Tab>
								{/* <Tab key="attachments" title="Attachments">
    						No attachments
    					</Tab> */}
							</Tabs>
						</div>
					</div>
				</div>
				<div shadow="none" className="w-full md:w-[300px] min-h-[400px] p-3 border-1 dark:border-default-50 self-start bg-default-50">
					<p className="font-bold">Course contents</p>
					<Spacer y={2} />
					<div className="flex flex-col gap-2">
						{course?.chapters?.map((chapter, index) => (
							<div>
								<div className="flex items-baseline gap-1">
									<p className="text-sm font-medium">
										{index + 1}. {chapter.title}
									</p>
									<p className="text-default-500 text-tiny font-normal">{`(${chapter?.segments?.length})`}</p>
								</div>

								<div className="flex flex-col gap-2 ms-3 mt-1">
									{chapter?.segments?.map((seg, index) => (
										<div
											key={seg._id}
											className="flex items-center gap-2 cursor-pointer"
											onClick={() => {
												setCurrentChapter(chapter)
												setCurrentSegment(seg)
											}}>
											<div
												className={twMerge(
													'flex items-center gap-2 w-full',
													seg?._id === currentSegment?._id && 'bg-default-100'
												)}>
												<div className="relative">
													<Image
														width={120}
														height={67}
														className="aspect-video bg-primary-100"
														src={`https://image.mux.com/${seg?.video[0].playbackId}/thumbnail.png?width=120`}
													/>
													<Play
														size={16}
														className={
															seg?._id === currentSegment?._id
																? 'text-primary fill-primary absolute left-1 bottom-1 z-10'
																: 'text-transparent absolute left-1 bottom-1 z-10'
														}
													/>
												</div>
												<div className="self-start flex flex-col gap-1">
													<p className="text-sm font-medium">{`${seg?.title}`}</p>
													<div className="flex gap-1 items-center">
														<PlaySquare size={14} />
														<p className="text-tiny">{duration(seg?.video[0]?.duration)}</p>
														{checkProgressStatus(chapter?._id, seg?._id) && (
															<CheckCircle size={14} color="#0f0" />
														)}
													</div>
												</div>
											</div>
										</div>
									))}
								</div>
							</div>
						))}
					</div>
				</div>
			</div>

			{showConfetti && (
				<Confetti
					width={windowSize?.current[0] || 2000}
					height={windowSize?.current[1] || 2000}
					numberOfPieces={300}
					run={true}
					recycle={showConfetti || false}
				/>
			)}
		</div>
	)
}
