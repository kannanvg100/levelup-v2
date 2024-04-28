'use client'
import React, { useEffect, useMemo, useRef } from 'react'

import { getCoursesByTeacher, updateCourseStatus } from '@/apis/courses'

import {
	Table,
	TableHeader,
	TableColumn,
	TableBody,
	TableRow,
	TableCell,
	Input,
	Button,
	DropdownTrigger,
	Dropdown,
	DropdownMenu,
	DropdownItem,
	Chip,
	Pagination,
	useDisclosure,
	Spinner,
	Spacer,
	Image,
} from '@nextui-org/react'

const columns = [
	{ name: '', uid: 'thumbnail', width: '60px' },
	{ name: 'TITLE', uid: 'title', width: '210px', sortable: true },
	{ name: 'CATEGORY', uid: 'category', width: '200px' },
	{ name: 'PRICE', uid: 'price', width: '50px', sortable: true },
	{ name: 'STATUS', uid: 'status', width: '100px', sortable: true },
	{ name: 'CHAPTERS', uid: 'chapters', width: '100px' },
	{ name: 'STUDENTS', uid: 'students', width: '100px' },
	{ name: 'CREATED AT', uid: 'createdAt', width: '150px' },
	{ name: '', uid: 'actions', width: '30px' },
]

const statusOptions = [
	{ name: 'Published', uid: 'published' },
	{ name: 'Draft', uid: 'draft' },
]

import { useQuery, keepPreviousData, useMutation, useQueryClient } from '@tanstack/react-query'
import CreateCourseTitle from './CreateCourseTitle'
import { useRouter } from 'next/navigation'
import DeleteCourseModal from './DeleteCourseModal'
import { AlertTriangle, ChevronDownIcon, MoreVertical, Plus, PlusSquare, Search } from 'lucide-react'
import toast from 'react-hot-toast'

const INITIAL_VISIBLE_COLUMNS = [
	'thumbnail',
	'title',
	'category',
	'price',
	'chapters',
	'createdAt',
	'status',
	'actions',
]

const statusColorMap = {
	published: 'success',
	draft: 'warning',
	pending: 'danger',
}

export default function App() {
	const [page, setPage] = React.useState(1)
	const rowsPerPage = 6
	const queryClient = useQueryClient()

	const router = useRouter()

	const [selectedKeys, setSelectedKeys] = React.useState([])
	const [visibleColumns, setVisibleColumns] = React.useState(INITIAL_VISIBLE_COLUMNS)
	const [statusFilter, setStatusFilter] = React.useState(['published', 'draft'])

	const [sortDescriptor, setSortDescriptor] = React.useState({
		column: 'title',
		direction: 'ascending',
	})

	const [filterValue, setFilterValue] = React.useState('')
	const { data, isPending, isError, isRefetching } = useQuery({
		queryKey: [
			'courses-by-teacher',
			{
				page,
				count: rowsPerPage,
				query: filterValue,
				status: [...statusFilter],
				sort: sortDescriptor,
			},
		],
		queryFn: () =>
			getCoursesByTeacher({
				page,
				count: rowsPerPage,
				query: filterValue,
				status: [...statusFilter],
				sort: `${sortDescriptor['column']}-${sortDescriptor['direction']}`,
			}),
		placeholderData: keepPreviousData,
	})

	const pages = useMemo(() => Math.ceil(data?.totalCourses / rowsPerPage), [data?.totalCourses, rowsPerPage])

	const { isPending: isPendingUpdateCourseStatus, mutateAsync: mutateUpdateCourseStatus } = useMutation({
		mutationFn: updateCourseStatus,
		onSuccess: (data) => {
			queryClient.invalidateQueries(['courses-by-teacher'])
		},
	})
	const parentRef = useRef(null)
	const { isOpen, onOpen, onClose } = useDisclosure()
	const [currentCourse, setCurrentCourse] = React.useState('')
	const { isOpen: isOpenDeleteModal, onOpen: onOpenDeleteModal, onClose: onCloseDeleteModal } = useDisclosure()

	const hasSearchFilter = Boolean(filterValue)

	const headerColumns = React.useMemo(() => {
		if (visibleColumns === 'all') return columns

		return columns.filter((column) => Array.from(visibleColumns).includes(column.uid))
	}, [visibleColumns])

	const filteredItems = React.useMemo(() => {
		let filteredCourses = [...(data?.courses || [])]

		if (filterValue.trim()) {
			filteredCourses = filteredCourses.filter((course) => {
				return course.title.toLowerCase().includes(filterValue.toLowerCase())
			})
		}
		if (statusFilter !== 'all' && Array.from(statusFilter).length !== statusOptions.length) {
			filteredCourses = filteredCourses.filter((course) => Array.from(statusFilter).includes(course.status))
		}
		return filteredCourses
	}, [data?.courses, filterValue, statusFilter])

	const items = React.useMemo(() => {
		const start = (page - 1) * rowsPerPage
		const end = start + rowsPerPage

		return filteredItems.slice(start, end)
	}, [page, filteredItems, rowsPerPage])

	const sortedItems = React.useMemo(() => {
		return [...filteredItems].sort((a, b) => {
			const first = a[sortDescriptor.column]
			const second = b[sortDescriptor.column]
			const cmp = first < second ? -1 : first > second ? 1 : 0

			return sortDescriptor.direction === 'descending' ? -cmp : cmp
		})
	}, [sortDescriptor, items])

	const renderCell = React.useCallback((course, columnKey) => {
		const cellValue = course[columnKey]

		switch (columnKey) {
			case 'thumbnail':
				return (
					<div className="w-[60px] h-[60px] relative flex items-center">
						<Image
							width={60}
							height={60}
							alt={course?.title}
							src={course?.thumbnail}
							className="w-full h-full object-cover rounded-none border border-default-200"
							classNames={{ wrapper: 'rounded-none' }}
						/>
					</div>
				)
			case 'title':
				return (
					<p className="text-bold capitalize whitespace-nowrap overflow-hidden text-ellipsis">{cellValue}</p>
				)
			case 'price':
				return (
					<p className="text-bold capitalize whitespace-nowrap overflow-hidden text-ellipsis">₹{cellValue}</p>
				)
			case 'category':
				return (
					<p className="text-bold capitalize w-[180px] whitespace-nowrap overflow-hidden text-ellipsis">
						{cellValue?.title}
					</p>
				)
			case 'createdAt':
				return (
					<p className="whitespace-nowrap">
						{new Date(cellValue).toLocaleDateString('en-IN', {
							day: 'numeric',
							month: 'short',
							year: 'numeric',
						})}
					</p>
				)
			case 'chapters':
				return <p className="text-bold text-center">{cellValue?.length}</p>
			case 'status':
				return (
					<Chip
						variant="flat"
						radius="none"
						size="sm"
						color={statusColorMap[course.status]}
						className="capitalize">
						{cellValue}
					</Chip>
				)
			case 'actions':
				return (
					<div className="relative flex justify-end items-center gap-2">
						<Dropdown>
							<DropdownTrigger>
								<Button isIconOnly size="sm" variant="light">
									<MoreVertical size={20} className="text-default-500" />
								</Button>
							</DropdownTrigger>
							<DropdownMenu className="text-foreground-500">
								<DropdownItem onClick={() => router.push(`/teacher/courses/${course?._id}/view`)}>
									View
								</DropdownItem>
								<DropdownItem onClick={() => router.push(`/teacher/courses/${course?._id}`)}>
									Edit
								</DropdownItem>
								<DropdownItem
									onClick={() => {
										const updatePromise = mutateUpdateCourseStatus({
											courseId: course?._id,
											status: course?.status === 'published' ? 'draft' : 'published',
										})
										toast.promise(updatePromise, {
											loading: 'Updating course status...',
											success: 'Course status updated!',
											error: (data) => data.response.data.message || 'Something went wrong!',
										})
									}}>
									{course?.status === 'published' ? 'Move to Draft' : 'Publish'}
								</DropdownItem>
								<DropdownItem
									className="text-red-700"
									onClick={() => {
										setCurrentCourse(course?._id)
										onOpenDeleteModal()
									}}>
									Delete
								</DropdownItem>
							</DropdownMenu>
						</Dropdown>
					</div>
				)
			default:
				return cellValue
		}
	}, [])

	const onNextPage = React.useCallback(() => {
		if (page < pages) {
			setPage(page + 1)
		}
	}, [page, pages])

	const onPreviousPage = React.useCallback(() => {
		if (page > 1) {
			setPage(page - 1)
		}
	}, [page])

	const onSearchChange = React.useCallback((value) => {
		if (value) {
			setFilterValue(value)
			setPage(1)
		} else {
			setFilterValue('')
		}
	}, [])

	const onClear = React.useCallback(() => {
		setFilterValue('')
		setPage(1)
	}, [])

	const topContent = React.useMemo(() => {
		return (
			<div className="flex justify-between h-10 gap-3">
				<Input
					isClearable
					className="w-full text-default-500 max-w-[400px]"
					classNames={{ inputWrapper: 'h-full' }}
					placeholder="Search for courses..."
					startContent={<Search size={16} />}
					value={filterValue}
					onClear={() => onClear()}
					onValueChange={onSearchChange}
					size="sm"
					radius="none"
				/>
				<div className="flex gap-3">
					<Dropdown radius="none" className="min-w-[150px]">
						<DropdownTrigger className="hidden sm:flex">
							<Button
								radius="none"
								className="min-w-[150px]"
								endContent={<ChevronDownIcon size={20} className="text-small text-default-500" />}
								variant="flat">
								Status
							</Button>
						</DropdownTrigger>
						<DropdownMenu
							disallowEmptySelection
							aria-label="Table Columns"
							closeOnSelect={false}
							selectedKeys={statusFilter}
							selectionMode="multiple"
							itemClasses={{
								base: 'rounded-none',
							}}
							onSelectionChange={setStatusFilter}>
							{statusOptions.map((status) => (
								<DropdownItem key={status.uid} className="capitalize">
									{status.name}
								</DropdownItem>
							))}
						</DropdownMenu>
					</Dropdown>
					<Button
						variant="flat"
						size="md"
						color="primary"
						onPress={onOpen}
						className="capitalize font-medium items-center"
						radius="none">
						<div className="flex justify-center items-center gap-2">
							<Plus size={16} strokeWidth={2.5} />
							<p>Create Course</p>
						</div>
					</Button>
				</div>
			</div>
		)
	}, [filterValue, statusFilter, visibleColumns, onSearchChange, data, hasSearchFilter])

	const bottomContent = React.useMemo(() => {
		return (
			<div className="py-2 px-2 flex justify-between items-center">
				<div></div>
				<Pagination
					isCompact
					showControls
					showShadow
					color="primary"
					variant="flat"
					radius="none"
					size="sm"
					page={page}
					total={Math.ceil(data?.totalCourses / rowsPerPage || 1)}
					onChange={(val) => {
						setPage(val)
						window.scrollTo({
							top: 0,
							behavior: 'smooth',
						})
					}}
				/>
				<div className="hidden sm:flex w-[30%] justify-end gap-2">
					<Button isDisabled={page === 1} size="sm" variant="flat" onPress={onPreviousPage} radius="none">
						Previous
					</Button>
					<Button isDisabled={page === pages} size="sm" variant="flat" onPress={onNextPage} radius="none">
						Next
					</Button>
				</div>
			</div>
		)
	}, [selectedKeys, items.length, page, pages, hasSearchFilter])

	return (
		<div ref={parentRef}>
			<div className="flex justify-start items-baseline gap-2">
				<span className="text-xl font-semibold" classNames={{ wrapper: 'w-[10px] h-[10px]' }}>
					Courses
				</span>
				{isPending || isRefetching ? (
					<Spinner size="sm"></Spinner>
				) : (
					<span className="text-tiny text-default-600">{`(${data?.totalCourses} items)`}</span>
				)}
				{isError && <AlertTriangle color="#f00" />}
			</div>

			<Spacer y={4} />

			<Table
				aria-label="Table of courses"
				isHeaderSticky
				bottomContent={bottomContent}
				bottomContentPlacement="outside"
				selectedKeys={selectedKeys}
				sortDescriptor={sortDescriptor}
				topContent={topContent}
				topContentPlacement="outside"
				onSelectionChange={setSelectedKeys}
				onSortChange={setSortDescriptor}
				selectionMode="single"
				radius="none"
				shadow="sm"
				onRowAction={(key) => {
					router.push(`/teacher/courses/${key}`)
				}}
				classNames={{
					thead: '[&>tr]:first:shadow-none',
					th: 'first:rounded-l-none last:rounded-r-none first:shadow-none',
				}}>
				<TableHeader columns={headerColumns}>
					{(column) => (
						<TableColumn
							key={column.uid}
							align={column.uid === 'actions' ? 'center' : 'start'}
							width={column.width}
							allowsSorting={column.sortable}
							className="border-radius-0">
							{column.name}
						</TableColumn>
					)}
				</TableHeader>
				<TableBody
					className="border-1"
					emptyContent={isPending ? <Spinner /> : <p>No items found</p>}
					items={sortedItems}
					isLoading={true}>
					{(item) => (
						<TableRow key={item._id}>
							{(columnKey) => <TableCell>{renderCell(item, columnKey)}</TableCell>}
						</TableRow>
					)}
				</TableBody>
			</Table>
			<CreateCourseTitle isOpen={isOpen} onClose={onClose} />
			<DeleteCourseModal isOpen={isOpenDeleteModal} onClose={onCloseDeleteModal} courseId={currentCourse} />
		</div>
	)
}
