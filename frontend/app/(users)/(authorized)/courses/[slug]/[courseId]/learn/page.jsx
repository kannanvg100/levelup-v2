'use client'
import { getFullCourse, getEnrollment } from '@/api/courses'
import { setProgress } from '@/api/segments'
import VideoPlayer from '@/components/VideoPlayer'
import { Accordion, AccordionItem, BreadcrumbItem, Breadcrumbs, Button, Spacer, Tab, Tabs } from '@nextui-org/react'
import { CheckCircle, Home, Link, PlaySquare } from 'lucide-react'
import React, { useEffect, useRef, useState } from 'react'
import toast from 'react-hot-toast'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import Comments from './Comments'
import { useSelector } from 'react-redux'
import Confetti from 'react-confetti'
import NextLink from 'next/link'

export default function Page({ params: { courseId } }) {
	const { user } = useSelector((state) => state.user)
	const [course, setCourse] = useState('')
	const [currentChapter, setCurrentChapter] = useState(null)
	const [currentSegment, setCurrentSegment] = useState(null)
	const [currentAccordian, setCurrentAccordian] = useState(null)
	const [enrollment, setEnrollment] = useState(null)
	const queryClient = useQueryClient()
	const windowSize = useRef([window.innerWidth, window.innerHeight])
	const [showConfetti, setShowConfetti] = useState(false)

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
			setCurrentAccordian(nextChapter?._id)
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

	return (
		<div>
			{!data && !isPending && (
				<div className="flex items-center justify-center h-screen">
					<div className="flex flex-col items-center justify-center gap-5">
						<Home size={24} />
						<h1 className="text-lg font-semibold">You are not enrolled in this course</h1>
						<Button
							as={NextLink}
							size="large"
							color="primary"
							variant="flat"
							iconRight={<Link size={16} />}
							href={`/courses//${courseId}`}>
							Enroll now
						</Button>
					</div>
				</div>
			)}
			{course && enrollment && (
				<>
					<Spacer y={4} />
					<div className="flex justify-between items-baseline">
						<Breadcrumbs>
							<BreadcrumbItem>{course?.title}</BreadcrumbItem>
							<BreadcrumbItem>{currentChapter?.title}</BreadcrumbItem>
							<BreadcrumbItem>{currentSegment?.title}</BreadcrumbItem>
						</Breadcrumbs>
						<Button
							isLoading={isLoadingMarkProgress}
							radius="none"
							size="md"
							color="primary"
							variant="flat"
							onClick={() => handleMarkProgress(currentSegment?._id)}>
							Mark as completed
						</Button>
					</div>
					<Spacer y={2} />
					<div className="flex items-start gap-5">
						<div className="min-w-[300px] min-h-[400px] bg-default-100">
							<Accordion
								showDivider={true}
								selectedKeys={[currentAccordian]}
								onSelectionChange={(key) => setCurrentAccordian(key?.currentKey)}>
								{course?.chapters?.map((chapter, index) => (
									<AccordionItem
										key={index}
										title={
											<p className="text-sm font-medium">
												Chapter {index + 1}: {chapter.title}
											</p>
										}>
										<div className="flex flex-col gap-2 ms-2">
											{chapter?.segments?.map((seg, index) => (
												<div
													key={index}
													className="flex items-center gap-2 cursor-pointer hover:underline"
													onClick={() => {
														setCurrentChapter(chapter)
														setCurrentSegment(seg)
													}}>
													{seg?._id === currentSegment?._id ? (
														<>
															<p className="text-sm">{index + 1}.</p>
															<p className="text-sm">{seg?.title}</p>
															<PlaySquare size={14} />
															{checkProgressStatus(chapter?._id, seg?._id) && (
																<CheckCircle size={14} color="#0f0" />
															)}
														</>
													) : (
														<>
															<p className="text-sm">{index + 1}.</p>
															<p className="text-sm">{seg?.title}</p>
															<PlaySquare size={14} />
															{checkProgressStatus(chapter?._id, seg?._id) && (
																<CheckCircle size={14} color="#0f0" />
															)}
														</>
													)}
												</div>
											))}
										</div>
									</AccordionItem>
								))}
							</Accordion>
						</div>
						<div className="flex-grow">
							<div className="flex justify-center bg-black dark:bg-default-50">
								<VideoPlayer segment={currentSegment} onEnded={handleMarkProgress} userId={user?._id} />
							</div>
							<Spacer y={4} />
							<div>
								<Tabs aria-label="Options" variant="underlined">
									<Tab key="description" title="Description">
										{currentSegment?.description}
									</Tab>
									<Tab key="comments" title="Comments">
										<Comments segmentId={currentSegment?._id} />
									</Tab>
									<Tab key="attachments" title="Attachments">
										No attachments
									</Tab>
								</Tabs>
							</div>
						</div>
					</div>
				</>
			)}
			{showConfetti && (
				<Confetti
					width={windowSize?.current[0] || 2000}
					height={windowSize?.current[1] || 2000}
					numberOfPieces={300}
					recycle={showConfetti || false}
				/>
			)}
		</div>
	)
}
