import React, { useState } from 'react'
import { BreadcrumbItem, Breadcrumbs, Button, Divider, Spacer } from '@nextui-org/react'
import { Folder, FolderIcon, GripVertical, HomeIcon } from 'lucide-react'
import SegmentTable from './SegmentTable'
import CreateChapterTitlePopover from './CreateChapterTitlePopover'
import { useMutation } from '@tanstack/react-query'
import { useDispatch, useSelector } from 'react-redux'
import { add } from '@/redux/slices/courseSlice'
import toast from 'react-hot-toast'
import ErrorBoundary from '@/components/ErrorBoundary'
import CreateSegment from './CreateSegment'
import { deleteChapter } from '@/api/chapters'

export default function Content() {
	const { course } = useSelector((state) => state.course)
	const [chapter, setChapter] = useState(course?.chapters[0] || {})
	const dispatch = useDispatch()

	const handleChapterEdit = (index, id) => {
		setChapter(course?.chapters[index])
	}

	const { isPending: isLoadingDeleteChapter, mutate: mutateDeleteChapter } = useMutation({
		mutationFn: deleteChapter,
		onSuccess: (data) => {
			dispatch(add({ ...course, chapters: course.chapters.filter((chapter) => chapter._id !== data._id) }))
			toast.success('Chapter deleted')
			setChapter(course?.chapters[0])
		},
		onError: (error) => {
			let errors = error?.response?.data?.message
			toast.error(errors || 'Something went wrong')
		},
	})

	const handleDeleteChapter = () => {
		mutateDeleteChapter(chapter._id)
		setChapter(course?.chapters[0])
	}

	return (
		<div className="flex m-2">
			<div className="w-[240px]">
				{/* <Spacer y={2} />
				<p className="text-base">Chapters</p> */}
				<Spacer y={2} />
				{course &&
					course?.chapters?.map((item, index) => (
						<div key={index}>
							<div className="flex justify-between items-center me-4">
								<div
									className="flex items-center gap-2 cursor-pointer"
									onClick={() => handleChapterEdit(index, item._id)}>
									<Folder
										size={18}
										className={`${item._id === chapter._id ? 'text-primary' : ''}`}
									/>
									<p
										className={`w-[180px] text-[14px] select-none whitespace-nowrap overflow-hidden text-ellipsis ${
											item._id === chapter._id ? 'text-primary' : ''
										}`}>
										{item.title}
									</p>
								</div>
								<div className="flex items-center gap-2">
									<GripVertical className="cursor-pointer" size={20} />
								</div>
							</div>
							<Spacer y={6} />
						</div>
					))}
				<CreateChapterTitlePopover courseId={course?._id} />
			</div>

			<div className="flex-grow">
				{/* <div className="flex justify-between items-center">
					<p>{chapter.title}</p>

					<Button isLoading={isLoadingDeleteChapter} size="small" color="error" onClick={handleDeleteChapter}>
						Delete
					</Button>
				</div> */}
				<ErrorBoundary>
					{chapter && <SegmentTable chapterId={chapter._id} />}
				</ErrorBoundary>
			</div>
		</div>
	)
}
