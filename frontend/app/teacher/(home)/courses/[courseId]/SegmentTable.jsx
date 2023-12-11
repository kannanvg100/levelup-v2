import React, { useState } from 'react'
import {
	Table,
	TableHeader,
	TableColumn,
	TableBody,
	TableRow,
	TableCell,
	Chip,
	Tooltip,
	Spacer,
	Avatar,
} from '@nextui-org/react'
import { EditIcon, FilePlus, Trash } from 'lucide-react'
import { deleteSegment } from '@/api/segments'
import { useMutation } from '@tanstack/react-query'
import { useDispatch, useSelector } from 'react-redux'
import { add } from '@/redux/slices/courseSlice'
import toast from 'react-hot-toast'
import CreateSegment from './CreateSegment'
import DeleteSegmentModal from './DeleteSegmentModal'
import EditSegmentModal from './EditSegmentModal'

const columns = [
	{ name: '', uid: 'thumbnail', width: 80 },
	{ name: 'TITLE', uid: 'title', width: 200 },
	{ name: 'DESCRIPTION', uid: 'description', width: 200 },
	{ name: 'STATUS', uid: 'video', width: 80 },
	{ name: 'ATTACHMENTS', uid: 'attachments', width: 60 },
	{ name: 'ACTIONS', uid: 'actions', width: 60 },
]

const statusColorMap = {
	ready: 'success',
	pending: 'danger',
	failed: 'warning',
}

export default function SegmentTable({ chapterId }) {
	const { course } = useSelector((state) => state.course)
	const chapter = course.chapters.find((chapter) => chapter._id === chapterId)
	const dispatch = useDispatch()
	const [openCreateSegment, setOpenCreateSegment] = useState(false)
	const [openEditSegment, setOpenEditSegment] = useState(false)
	const [segment, setSegment] = useState(null)
	const [openSegmentDeleteModal, setOpenSegmentDeleteModal] = useState(false)
	const { isPending: isPending, mutate: mutateDeleteSegment } = useMutation({
		mutationFn: deleteSegment,

		onSuccess: (data) => {
			const updatedChapter = {
				...chapter,
				segments: [...chapter.segments.filter((segment) => segment._id !== data._id)],
			}

			const updatedCourse = {
				...course,
				chapters: [...course.chapters.filter((chapter) => chapter._id !== updatedChapter._id), updatedChapter],
			}
			dispatch(add(updatedCourse))
			toast.success('Segment deleted successfully')
		},
		onError: (error) => {
			let errors = error?.response?.data?.message
			toast.error(errors || 'Something went wrong')
		},
	})

	const handleEditSegment = (segment) => {
		setSegment(segment)
		setOpenEditSegment(true)
	}

	const handleDeleteSegment = (segment) => {
		setSegment(segment)
		setOpenSegmentDeleteModal(true)
	}

	const renderCell = (segment, columnKey) => {
		const cellValue = segment[columnKey]
		switch (columnKey) {
			case 'thumbnail':
				return (
					<Avatar
						showFallback
						name="N/A"
						radius="none"
						src={`https://image.mux.com/${segment.video[0].playbackId}/thumbnail.png?width=100`}
					/>
				)
			case 'title':
			case 'description':
				return (
					<p className="text-bold capitalize w-[150px] whitespace-nowrap overflow-hidden text-ellipsis">
						{cellValue}
					</p>
				)
			case 'video':
				return (
					<Chip variant="dot" size="sm" color={statusColorMap[cellValue[0].status]}>
						{cellValue[0].status}
					</Chip>
				)
			case 'attachments':
				return <p className="text-bold capitalize text-center">0</p>
			case 'actions':
				return (
					<div className="relative flex items-center gap-3">
						<Tooltip className="text-foreground-600" content="Edit segment">
							<span
								className="text-lg text-default-400 cursor-pointer active:opacity-50"
								onClick={() => handleEditSegment(segment)}>
								<EditIcon size={18} />
							</span>
						</Tooltip>
						<Tooltip color="danger" content="Delete Segment">
							<span className="text-lg text-danger cursor-pointer active:opacity-50">
								<div onClick={() => handleDeleteSegment(segment)}>
									<Trash size={18} color="#f00" />
								</div>
							</span>
						</Tooltip>
					</div>
				)
			default:
				return cellValue
		}
	}

	return (
		<>
			<Table
				aria-label="chapter details"
				className="border"
				radius="none"
				shadow="sm"
				classNames={{
					thead: '[&>tr]:first:shadow-none',
					th: 'first:rounded-l-none last:rounded-r-none first:shadow-none',
				}}>
				<TableHeader columns={columns}>
					{(column) => (
						<TableColumn
							key={column.uid}
							align={column.uid === 'actions' ? 'center' : 'start'}
							width={column.width}>
							{column.name}
						</TableColumn>
					)}
				</TableHeader>
				<TableBody
					items={chapter.segments}
					emptyContent={
						<div
							className="flex justify-center items-center gap-2 cursor-pointer"
							onClick={() => setOpenCreateSegment(true)}>
							<FilePlus size={18} />
							<p className="text-sm font-normal underline">Add a segment</p>
						</div>
					}>
					{(item) => (
						<TableRow key={item?._id}>
							{(columnKey) => <TableCell>{renderCell(item, columnKey)}</TableCell>}
						</TableRow>
					)}
				</TableBody>
			</Table>
			<Spacer y={4} />
			{chapter.segments.length > 0 && (
				<div
					className="flex justify-center items-center gap-2 opacity-50 cursor-pointer"
					onClick={() => setOpenCreateSegment(true)}>
					<FilePlus size={18} />
					<p className="text-sm font-normal underline">Add a segment</p>
				</div>
			)}
			<DeleteSegmentModal
				isOpen={openSegmentDeleteModal}
				onClose={() => setOpenSegmentDeleteModal(false)}
				chapter={chapter}
				segment={segment}
			/>
			<CreateSegment isOpen={openCreateSegment} onClose={() => setOpenCreateSegment(false)} chapter={chapter} />
			<EditSegmentModal
				isOpen={openEditSegment}
				onClose={() => setOpenEditSegment(false)}
				chapter={chapter}
				segment={segment}
			/>
		</>
	)
}
