'use client'
import { getFullCourse, getEnrollment } from '@/api/courses'
import { setProgress } from '@/api/segments'
import VideoPlayer from '@/components/VideoPlayer'
import {
	Accordion,
	AccordionItem,
	Avatar,
	Badge,
	BreadcrumbItem,
	Breadcrumbs,
	Button,
	Card,
	CardBody,
	CircularProgress,
	Image,
	ScrollShadow,
	Spacer,
	Tab,
	Tabs,
	User,
} from '@nextui-org/react'
import { Check, CheckCircle, CheckCircle2, Home, Link, MessageSquareShare, Play, PlaySquare } from 'lucide-react'
import React, { useEffect, useRef, useState } from 'react'
import toast from 'react-hot-toast'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import Comments from './Comments'
import { useSelector } from 'react-redux'
import Confetti from 'react-confetti'
import NextLink from 'next/link'
import { addSeconds, format, formatDistance, intervalToDuration } from 'date-fns'
import { twMerge } from 'tailwind-merge'
import { useChat } from '@/components/providers/ChatProvider'
import { createChat } from '@/api/chats'

export default function Page({ params: { courseId } }) {
	const { user } = useSelector((state) => state.user)
	const [course, setCourse] = useState('')
	const [currentChapter, setCurrentChapter] = useState(null)
	const [currentSegment, setCurrentSegment] = useState(null)
	const [currentAccordian, setCurrentAccordian] = useState(0)
	const [enrollment, setEnrollment] = useState(null)
	const queryClient = useQueryClient()
	const windowSize = useRef([window.innerWidth, window.innerHeight])
	const [showConfetti, setShowConfetti] = useState(false)
	const { expandChat, setChat } = useChat()

	const { data, isPending, isError } = useQuery({
		queryKey: ['course', courseId],
		queryFn: () => getFullCourse(courseId),
		keepPreviousData: true,
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

	return (
		<div className="w-full max-w-5xl mx-auto">
			<Spacer y={4} />
			<div className="flex flex-col sm:flex-row gap-4 items-start">
				<div className="flex-grow aspect-video">
					<VideoPlayer
						segment={currentSegment}
						onEnded={handleMarkProgress}
						userId={user?._id}
						width="full"
						height="full"
					/>
				</div>
				<Card shadow="sm" className="sm:w-[300px] min-w-[300px] self-stretch">
					<CardBody>
						<ScrollShadow className="w-full">
							<Accordion
								isCompact
								disallowEmptySelection
								showDivider={false}
								defaultExpandedKeys={'all'}
								// expandedKeys={[currentAccordian]}
								onSelectionChange={(e) => {
									console.log(JSON.stringify(e.currentKey))
									setCurrentAccordian(e.currentKey)
								}}
								// selectionMode="single"
								className="whitespace-nowrap"
								itemClasses={{
									title: 'text-default-900 text-small font-semibold',
									trigger: 'w-fit',
									content: 'text-default-700',
								}}>
								{course?.chapters?.map((chapter, index) => (
									<AccordionItem
										key={index}
										title={
											<div className="flex items-baseline gap-1">
												<p className="text-sm font-medium">
													{index + 1}. {chapter.title}
												</p>
												<p className="text-default-500 text-tiny font-normal">{`(${chapter?.segments?.length})`}</p>
											</div>
										}>
										<div className="flex flex-col gap-2 ms-1">
											{chapter?.segments?.map((seg, index) => (
												<div
													key={index}
													className="flex items-center gap-2 cursor-pointer"
													onClick={() => {
														setCurrentChapter(chapter)
														setCurrentSegment(seg)
													}}>
													<div
														className={twMerge(
															'flex items-center gap-2 w-full p-2',
															seg?._id === currentSegment?._id && 'bg-default-100'
														)}>
														<Play
															size={12}
															className={
																seg?._id === currentSegment?._id
																	? 'text-primary fill-primary'
																	: 'text-transparent'
															}
														/>
														<Avatar
															showFallback
															size="lg"
															name="N/A"
															radius="none"
															src={`https://image.mux.com/${seg?.video[0].playbackId}/thumbnail.png?width=120`}
														/>
														<div className="self-start flex flex-col gap-1">
															<p className="text-sm font-normal">{`${seg?.title}`}</p>
															<div className="flex gap-1 items-center">
																<PlaySquare size={14} />
																<p className="text-tiny">
																	{duration(seg?.video[0]?.duration)}
																</p>
																{checkProgressStatus(chapter?._id, seg?._id) && (
																	<CheckCircle size={14} color="#0f0" />
																)}
															</div>
														</div>
													</div>
												</div>
											))}
										</div>
									</AccordionItem>
								))}
							</Accordion>
						</ScrollShadow>
					</CardBody>
				</Card>
			</div>
			<Spacer y={4} />
			<div className="max-w-[708px]">
				<Breadcrumbs size="sm">
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
			{showConfetti && (
				<Confetti
					width={windowSize?.current[0] || 2000}
					height={windowSize?.current[1] || 2000}
					numberOfPieces={300}
					recycle={showConfetti || false}
				/>
			)}
			<Spacer y={16} />
		</div>
	)
}
