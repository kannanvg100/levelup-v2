'use client'
import { getFullCourse, getEnrollment } from '@/api/courses'
import { setProgress } from '@/api/segments'
import VideoPlayer from '@/components/VideoPlayer'
import {
	BreadcrumbItem,
	Breadcrumbs,
	Button,
	Divider,
	Image,
	Popover,
	PopoverContent,
	PopoverTrigger,
	Progress,
	ScrollShadow,
	Skeleton,
	Spacer,
	Tab,
	Tabs,
	User,
	Link,
} from '@nextui-org/react'
import { CheckSquare, Frown, MessageSquareShare, Play, PlaySquare, Share2 } from 'lucide-react'
import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import toast from 'react-hot-toast'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import Comments from './_components/Comments'
import { useSelector } from 'react-redux'
import Confetti from 'react-confetti'
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
	const [allSegments, setAllSegments] = useState([])
	const [completedSegments, setCompletedSegments] = useState([])
	const queryClient = useQueryClient()
	const [showConfetti, setShowConfetti] = useState(false)
	const [playConfetti, setPlayConfetti] = useState(false)
	const { expandChat, setChat } = useChat()
	const videoPlayerRef = useRef()

	const pageUrl = useMemo(() => {
		return `${process.env.NEXT_PUBLIC_URL}/courses/${slug}/${courseId}`
	}, [slug, courseId])

	const { data, isPending, isError, error } = useQuery({
		queryKey: ['course', courseId],
		queryFn: () => getFullCourse(courseId),
		keepPreviousData: true,
		enabled: !!courseId,
		staleTime: Infinity,
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
		onError: (error) => {
			const err = error?.response?.data?.message
			if (err) toast.error(error?.response?.data?.message || 'Something went wrong!')
		},
	})

	const handleMarkProgress = async (segmentId) => {
		if (!completedSegments.includes(segmentId)) {
			setCompletedSegments([...completedSegments, segmentId])
			mutateMarkProgress({ courseId: course?._id, chapterId: currentChapter?._id, segmentId })
		}
		nextSegment()
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
		staleTime: Infinity,
	})

	useEffect(() => {
		const _allSegments = []
		const _completedSegments = []
		if (enrollmentData?.enrollment && data?.course) {
			data.course.chapters.forEach((chapter) => {
				const chapterProgress = enrollmentData.enrollment.progress.chapters.find(
					(it) => chapter._id === it.chapter
				)
				chapter.segments.forEach((segment) => {
					if (chapterProgress) {
						const item = chapterProgress.segments.find((it) => segment._id === it.segment)
						if (item) _completedSegments.push(item.segment)
					}
					_allSegments.push(segment._id)
				})
			})
		}
		setAllSegments(_allSegments)
		setCompletedSegments(_completedSegments)
	}, [data, enrollmentData])

	const progress = useMemo(
		() => Math.ceil((completedSegments.length * 100) / allSegments.length),
		[completedSegments, allSegments]
	)

	const nextSegment = () => {
		const currentSegmentIndex = currentChapter?.segments.findIndex((seg) => seg?._id === currentSegment?._id)
		if (currentSegmentIndex === currentChapter?.segments.length - 1) {
			const currentChapterIndex = course?.chapters.findIndex((chap) => chap?._id === currentChapter?._id)
			const nextChapter = course?.chapters[currentChapterIndex + 1]
			if (nextChapter) {
				const nextSegment = nextChapter?.segments[0]
				if (nextSegment) {
					setCurrentChapter(nextChapter)
					setCurrentSegment(nextSegment)
				}
			}
		} else {
			const nextSegment = currentChapter?.segments[currentSegmentIndex + 1]
			if (nextSegment) setCurrentSegment(nextSegment)
		}

		const lastSegment = currentChapter?.segments[currentChapter?.segments.length - 1]
		const lastChapter = course?.chapters[course?.chapters.length - 1]
		const lastChapterLastSegment = lastChapter?.segments[lastChapter?.segments.length - 1]

		if (lastSegment?._id === currentSegment?._id && lastChapterLastSegment?._id === currentSegment?._id) {
			setShowConfetti(true)
			setPlayConfetti(true)
			setTimeout(() => {
				setPlayConfetti(false)
				setTimeout(() => setShowConfetti(false), 5000)
			}, 6000)
		}
	}

	function secondsToTime(seconds) {
		if (isNaN(seconds)) return '00:00'
		const hours = Math.floor(seconds / 3600)
		const minutes = Math.floor((seconds % 3600) / 60)
		const remainingSeconds = Math.floor(seconds % 60)

		const formattedHours = String(hours).padStart(2, '0')
		const formattedMinutes = String(minutes).padStart(2, '0')
		const formattedSeconds = String(remainingSeconds).padStart(2, '0')

		let time = ''
		if (formattedHours > 0) time = `${formattedHours}:`

		return `${time}${formattedMinutes}:${formattedSeconds}`
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

	const checkSegmentStatus = useCallback((segmentId) => completedSegments.includes(segmentId), [completedSegments])

	if (isPending || isLoadingEnrollment) {
		return (
			<div className="w-full max-w-5xl mx-auto">
				<Spacer y={4} />
				<div className="flex gap-4 flex-wrap">
					<div className="flex-1">
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

	if (isError) {
		return (
			<div className="grid-cols-subgrid col-span-4 flex flex-col items-center justify-center gap-4 text-default-500 sm:mt-24">
				<Frown size={64} />
				<p className="text-default-500">{error?.response?.data?.message || 'Something went wrong'}</p>
				{error?.response?.status === 401 ? (
					<Link
						href={`/courses/${slug}/${courseId}`}
						variant="light"
						color="primary"
						className="font-semibold text-primary">
						View the Course
					</Link>
				) : (
					<Link href="/courses" variant="light" color="primary" className="font-semibold text-primary">
						View all Courses
					</Link>
				)}
			</div>
		)
	}

	return (
		<div className="w-full max-w-5xl mx-auto">
			<Spacer y={4} />
			<div className="flex gap-4 flex-wrap">
				<div className="flex-1">
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
							<div className="flex justify-between items-center gap-4 bg-default-100 p-4 flex-wrap">
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
                                        isIconOnly={true}
										radius="none"
										size="sm"
										color="primary"
										variant="flat"
										startContent={<CheckSquare size={16} />}
                                        className='md:hidden'
										onClick={() => handleMarkProgress(currentSegment?._id)}>
									</Button>

                                    <Button
										isLoading={isLoadingMarkProgress}
										radius="none"
										size="sm"
										color="primary"
										variant="flat"
										startContent={<CheckSquare size={16} />}
                                        className='hidden md:flex'
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
							</Tabs>
						</div>
					</div>
				</div>
				<div
					shadow="none"
					className="w-full md:w-[300px] border-1 dark:border-default-50 self-start bg-default-50">
					<div className="p-2 flex justify-between items-center gap-1">
						<div>
							<p className="text-md font-bold">Course contents</p>
							<p className="text-xs">{progress}% Complete</p>
						</div>
					</div>
					<Progress size="sm" value={progress} />
					<Divider />
					<Spacer y={2} />
					<ScrollShadow hideScrollBar className="flex flex-col gap-2 min-h-[400px] max-h-[75vh] px-2">
						{course?.chapters?.map((chapter, index) => (
							<div>
								<div className="flex items-baseline gap-1">
									<p className="text-sm font-medium">
										{index + 1}. {chapter.title}
									</p>
									<p className="text-default-500 text-tiny font-normal">{`(${chapter?.segments?.length})`}</p>
								</div>

								<div className="flex flex-col gap-3 ms-3 mt-1">
									{chapter?.segments?.map((seg) => (
										<div
											key={seg._id}
											className="flex items-center gap-2 cursor-pointer"
											onClick={() => {
												setCurrentChapter(chapter)
												setCurrentSegment(seg)
											}}>
											<div
												className={twMerge(
													'flex items-center gap-2 w-full p-1',
													seg?._id === currentSegment?._id && 'bg-default-200'
												)}>
												<div className="relative">
													<Image
														width={100}
														height={67}
														className="min-w-[100px] aspect-video bg-primary-100"
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
												<div className="self-start flex flex-col gap-1 pt-1">
													<p className="text-sm font-normal ellipsis-container">{`${seg?.title}`}</p>
													<div className="flex gap-2 items-center">
														{checkSegmentStatus(seg?._id) ? (
															<CheckSquare size={12} className="text-primary" />
														) : (
															<PlaySquare size={14} />
														)}
														<p className="text-tiny">
															{secondsToTime(seg?.video[0]?.duration)}
														</p>
													</div>
												</div>
											</div>
										</div>
									))}
								</div>
							</div>
						))}
					</ScrollShadow>
				</div>
			</div>
			{showConfetti && progress >= 100 && (
				<Confetti numberOfPieces={300} initialVelocityY={20} recycle={playConfetti} />
			)}
		</div>
	)
}
