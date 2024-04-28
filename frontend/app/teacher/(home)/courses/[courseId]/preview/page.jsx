'use client'
import { getCourseTeacher } from '@/apis/courses'
import VideoPlayer from '@/components/VideoPlayer'
import { Accordion, AccordionItem, BreadcrumbItem, Breadcrumbs, Spacer, Tab, Tabs } from '@nextui-org/react'
import { PlaySquare } from 'lucide-react'
import React, { useEffect, useRef, useState } from 'react'
import { useQuery, useQueryClient } from '@tanstack/react-query'
import Comments from './Comments'
import { useSelector } from 'react-redux'

export default function Page({ params: { courseId } }) {
	const [course, setCourse] = useState('')
	const [currentChapter, setCurrentChapter] = useState(null)
	const [currentSegment, setCurrentSegment] = useState(null)
	const [currentAccordian, setCurrentAccordian] = useState(null)

	const { data, isPending, isError } = useQuery({
		queryKey: ['course', courseId],
		queryFn: () => getCourseTeacher(courseId),
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

	return (
		<div>
			{course && (
				<>
					<Spacer y={4} />
					<div className="flex justify-between items-baseline">
						<Breadcrumbs>
							<BreadcrumbItem>{course?.title}</BreadcrumbItem>
							<BreadcrumbItem>{currentChapter?.title}</BreadcrumbItem>
							<BreadcrumbItem>{currentSegment?.title}</BreadcrumbItem>
						</Breadcrumbs>
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
										key={chapter._id}
										title={
											<p className="text-sm font-medium">
												Chapter {index + 1}: {chapter.title}
											</p>
										}>
										<div className="flex flex-col gap-2 ms-2">
											{chapter?.segments?.map((seg, index) => (
												<div
													key={seg._id}
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
														</>
													) : (
														<>
															<p className="text-sm">{index + 1}.</p>
															<p className="text-sm">{seg?.title}</p>
															<PlaySquare size={14} />
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
								<VideoPlayer segment={currentSegment}/>
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
									{/* <Tab key="attachments" title="Attachments">
										No attachments
									</Tab> */}
								</Tabs>
							</div>
						</div>
					</div>
				</>
			)}
		</div>
	)
}
