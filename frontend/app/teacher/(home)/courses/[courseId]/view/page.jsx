'use client'
import { useEffect, useState } from 'react'
import {
	Spacer,
	Accordion,
	AccordionItem,
	Button,
	Image,
	Card,
	CardBody,
	CardFooter,
	useDisclosure,
} from '@nextui-org/react'
import { useQuery, QueryClient } from '@tanstack/react-query'
import { getCourseTeacher } from '@/api/courses'
import IntroVideoModal from './IntroVideoModal'

import { Calendar, Globe, PlayCircle, PlaySquare, Star } from 'lucide-react'
import Reviews from './Reviews'
import { useRouter } from 'next/navigation'
import { useSelector } from 'react-redux'

export default function App({ params: { courseId } }) {
	const { user } = useSelector((state) => state.user)
	const [course, setCourse] = useState('')
	const [enrollment, setEnrollment] = useState('')
	const router = useRouter()
	const { isOpenIntroVideo, onOpenIntroVideo, onCloseIntroVideo } = useDisclosure()

	const { data } = useQuery({
		queryKey: ['course', courseId],
		queryFn: () => getCourseTeacher(courseId),
		keepPreviousData: true,
	})

	useEffect(() => {
		if (data?.course) {
			setCourse(data?.course)
		}
	}, [data])

	const handleEnroll = () => {
		router.push(`/teacher/courses/${courseId}/preview`)
	}

	return (
		<>
			{course && (
				<>
					<Spacer y={2} />
					<div className="flex justify-start items-start gap-4 flex-wrap">
						<Card shadow="sm" className="min-w-[350px]" radius="none">
							<CardBody className="overflow-visible p-0 opacity-90 hover:opacity-100">
								<div className="relative">
									<Image
										width={350}
										height={200}
										alt={course?.title}
										className="w-full h-[200px] object-cover rounded-none"
										src={course?.thumbnail}
									/>
									<div className="absolute inset-0 flex justify-center items-center z-10">
										<div className="bg-default-50 rounded-full shadow-lg hover:text-primary">
											<PlayCircle
												size={64}
												className="cursor-pointer"
												onClick={onOpenIntroVideo}
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
										Preview
									</Button>
									<Spacer y={2} />
									<p className="text-tiny text-default-500 text-center">Full Lifetime Access</p>
									<Spacer y={2} />
								</div>
							</CardFooter>
						</Card>
						<div className="flex-grow max-w-[700px]">
							<p className="text-4xl font-semibold -mt-2">{course?.title}</p>
							<Spacer y={6} />
							<p className="text-base">{course?.description}</p>
							<Spacer y={2} />
							<div className="flex gap-2 items-center">
								<p className="text-sm font-medium">Created by {course?.teacher?.name}</p>
							</div>
							<Spacer y={2} />
							<div></div>

							{course?.rating?.count > 0 && (
								<div className="flex justify-start items-center gap-2 mb-2">
									<div className="inline-flex items-center border-2 px-1 cursor-pointer">
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
				</>
			)}
			<IntroVideoModal isOpen={isOpenIntroVideo} onClose={onCloseIntroVideo} />
		</>
	)
}
