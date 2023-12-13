'use client'
import React, { useEffect } from 'react'

import { getUsersOfTeacher } from '@/api/users'

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
	{ name: '', uid: 'profileImage', width: '30px' },
	{ name: 'NAME', uid: 'name', width: '100px' },
	{ name: 'EMAIL', uid: 'email', width: '100px' },
	{ name: 'COURSE', uid: 'course', width: '100px' },
	{ name: 'STATUS', uid: 'status', width: '100px' },
	{ name: 'PURCHASED DATE', uid: 'purchasedAt', width: '100px' },
	{ name: 'ACTIONS', uid: 'actions', width: '100px' },
]

const statusOptions = [
	{ name: 'active', uid: 'active' },
	{ name: 'blocked', uid: 'Blocked' },
	{ name: 'pending', uid: 'pending' },
]

import { useQuery } from '@tanstack/react-query'
import { useRouter } from 'next/navigation'
import { AlertTriangle, ChevronDownIcon, MoreVertical, Search, User } from 'lucide-react'

const INITIAL_VISIBLE_COLUMNS = ['profileImage', 'name', 'email', 'course', 'purchasedAt', 'actions']

const statusColorMap = {
	published: 'success',
	draft: 'warning',
	pending: 'danger',
}

export default function App() {
	const [page, setPage] = React.useState(1)
	const [users, setUsers] = React.useState([])
	const rowsPerPage = 4
	const [pages, setPages] = React.useState(0)

	const router = useRouter()

	const [filterValue, setFilterValue] = React.useState('')
	const { data, isPending, isError, isRefetching } = useQuery({
		queryKey: ['users', { page, count: rowsPerPage, query: filterValue }],
		queryFn: () => getUsersOfTeacher({ page, count: rowsPerPage, query: filterValue }),
		keepPreviousData: true,
	})

	useEffect(() => {
		if (data) setUsers(data.users)
	}, [data])

    
	const [selectedKeys, setSelectedKeys] = React.useState([])
	const [visibleColumns, setVisibleColumns] = React.useState(INITIAL_VISIBLE_COLUMNS)
	const [statusFilter, setStatusFilter] = React.useState('all')
	const [sortDescriptor, setSortDescriptor] = React.useState({
		column: 'title',
		direction: 'ascending',
	})

	const { isOpen, onOpen, onClose } = useDisclosure()
	const [currentCourse, setCurrentCourse] = React.useState('')
	const { isOpen: isOpenDeleteModal, onOpen: onOpenDeleteModal, onClose: onCloseDeleteModal } = useDisclosure()

	const hasSearchFilter = Boolean(filterValue)

	const headerColumns = React.useMemo(() => {
		if (visibleColumns === 'all') return columns

		return columns.filter((column) => Array.from(visibleColumns).includes(column.uid))
	}, [visibleColumns])

	const filteredItems = React.useMemo(() => {
		let filteredUsers = [...users]

		if (filterValue.trim()) {
			filteredUsers = filteredUsers.filter((course) => {
				return course.title.toLowerCase().includes(filterValue.toLowerCase())
			})
		}
		if (statusFilter !== 'all' && Array.from(statusFilter).length !== statusOptions.length) {
			filteredUsers = filteredUsers.filter((course) => Array.from(statusFilter).includes(course.status))
		}
		return filteredUsers
	}, [users, filterValue, statusFilter])

	const items = React.useMemo(() => {
		const start = (page - 1) * rowsPerPage
		const end = start + rowsPerPage

		return filteredItems.slice(start, end)
	}, [page, filteredItems, rowsPerPage])

	const sortedItems = React.useMemo(() => {
		return [...items].sort((a, b) => {
			const first = a[sortDescriptor.column]
			const second = b[sortDescriptor.column]
			const cmp = first < second ? -1 : first > second ? 1 : 0

			return sortDescriptor.direction === 'descending' ? -cmp : cmp
		})
	}, [sortDescriptor, items])

	const renderCell = React.useCallback((user, columnKey) => {
		const cellValue = user[columnKey]

		switch (columnKey) {
			case 'profileImage':
				return (
					<div className="w-[60px] h-[60px] relative flex items-center">
						<Image
							width={30}
							height={30}
							alt={user?.student?.name}
							src={user?.student?.profileImage}
							className="w-full h-full object-cover rounded-none"
						/>
					</div>
				)
			case 'name':
				return (
					<p className="text-bold capitalize whitespace-nowrap overflow-hidden text-ellipsis">
						{user?.student?.name}
					</p>
				)
			case 'email':
				return (
					<p className="text-bold  whitespace-nowrap overflow-hidden text-ellipsis">{user?.student?.email}</p>
				)
			case 'course':
				return (
					<p className="text-bold capitalize whitespace-nowrap overflow-hidden text-ellipsis">
						{user?.course?.title}
					</p>
				)
			case 'purchasedAt':
				return (
					<p className="whitespace-nowrap">
						{new Date(cellValue).toLocaleDateString('en-IN', {
							day: 'numeric',
							month: 'short',
							year: 'numeric',
						})}
					</p>
				)
			case 'actions':
				return (
					<div className="relative flex justify-end items-center gap-2">
						<Dropdown>
							<DropdownTrigger>
								<Button isIconOnly size="sm" variant="light">
									<MoreVertical size={20} className="text-default-300" />
								</Button>
							</DropdownTrigger>
							<DropdownMenu className="text-default-700">
								<DropdownItem>Chat</DropdownItem>
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
					placeholder="Search for users..."
					startContent={<Search size={16} />}
					value={filterValue}
					onClear={() => onClear()}
					onValueChange={onSearchChange}
					size="sm"
					radius="none"
				/>
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
					total={Math.ceil(data?.totalUsers / rowsPerPage || 1)}
					onChange={setPage}
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
		<div>
			<div className="flex justify-start items-baseline gap-2">
				<span className="text-xl font-semibold" classNames={{ wrapper: 'w-[10px] h-[10px]' }}>
					Students
				</span>
				{isPending || isRefetching ? (
					<Spinner size="sm"></Spinner>
				) : (
					<span className="text-tiny text-default-600">{`(${data?.totalUsers} items)`}</span>
				)}
				{isError && <AlertTriangle color="#f00" />}
			</div>

			<Spacer y={4} />

			<Table
				isCompact
				aria-label="Table of users"
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
					router.push(`/teacher/users/${key}`)
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
		</div>
	)
}
