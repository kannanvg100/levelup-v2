'use client'
import React, { useEffect } from 'react'

import { getAllTeachers } from '@/api/users'

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
	Tooltip,
} from '@nextui-org/react'

const columns = [
	{ name: '', uid: 'profileImage', width: '55px' },
	{ name: 'NAME', uid: 'name', width: '210px' },
	{ name: 'ROLE', uid: 'role', width: '100px' },
	{ name: 'EMAIL', uid: 'email', width: '200px' },
	{ name: 'STATUS', uid: 'status', width: '100px' },
	{ name: 'ACTIONS', uid: 'actions', width: '100px' },
]

const statusOptions = [
	{ name: 'Active', uid: 'active' },
	{ name: 'Blocked', uid: 'blocked' },
	{ name: 'Pending', uid: 'pending' },
	{ name: 'Verification Pending', uid: 'verification_pending' },
	{ name: 'Document Uploaded', uid: 'doc_uploaded' },
	{ name: 'Rejected', uid: 'rejected' },
]

import { useQuery, keepPreviousData } from '@tanstack/react-query'
import { useRouter } from 'next/navigation'
import BlockUserModal from './BlockUserModal'
import { AlertTriangle, ChevronDownIcon, MoreVertical, Plus, PlusSquare, Search } from 'lucide-react'
import NextImage from 'next/image'
import VerifyUserModal from './VerifyUserModal'

const INITIAL_VISIBLE_COLUMNS = ['profileImage', 'name', 'email', 'status', 'actions']

const statusColorMap = {
	active: 'success',
	pending: 'warning',
	blocked: 'danger',
	verification_pending: 'warning',
	doc_uploaded: 'warning',
	rejected: 'danger',
}

export default function App() {
	const [page, setPage] = React.useState(1)
	const [users, setUsers] = React.useState([])
	const rowsPerPage = 6
	const [pages, setPages] = React.useState(0)

	const router = useRouter()

	const [selectedKeys, setSelectedKeys] = React.useState([])
	const [visibleColumns, setVisibleColumns] = React.useState(INITIAL_VISIBLE_COLUMNS)
	const [statusFilter, setStatusFilter] = React.useState([
		'active',
		'blocked',
		'pending',
		'verification_pending',
		'doc_uploaded',
		'rejected',
	])

	const [sortDescriptor, setSortDescriptor] = React.useState({
		column: 'title',
		direction: 'ascending',
	})

	const [filterValue, setFilterValue] = React.useState('')
	const { data, isPending, isError, isRefetching } = useQuery({
		queryKey: [
			'teachers-by-admin',
			{
				page,
				count: rowsPerPage,
				query: filterValue,
				status: [...statusFilter],
				sort: sortDescriptor,
			},
		],
		queryFn: () =>
			getAllTeachers({
				page,
				count: rowsPerPage,
				query: filterValue,
				status: [...statusFilter],
				sort: `${sortDescriptor['column']}-${sortDescriptor['direction']}`,
			}),
		placeholderData: keepPreviousData,
		onSuccess: (data) => {
			setPages(Math.ceil(data?.totalUsers / rowsPerPage))
			setUsers(data?.users)
		},
	})

	const [currentUser, setCurrentUser] = React.useState({})
	const {
		isOpen: isOpenBlockUserModal,
		onOpen: onOpenBlockUserModal,
		onClose: onCloseBlockUserModal,
	} = useDisclosure()

    const {
        isOpen: isOpenVerifyUserModal,
        onOpen: onOpenVerifyUserModal,
        onClose: onCloseVerifyUserModal,
    } = useDisclosure()

	const hasSearchFilter = Boolean(filterValue)

	const headerColumns = React.useMemo(() => {
		if (visibleColumns === 'all') return columns

		return columns.filter((column) => Array.from(visibleColumns).includes(column.uid))
	}, [visibleColumns])

	const filteredItems = React.useMemo(() => {
		let filteredUsers = [...(data?.users || [])]

		if (filterValue.trim()) {
			filteredUsers = filteredUsers.filter((User) => {
				return User.title.toLowerCase().includes(filterValue.toLowerCase())
			})
		}
		if (statusFilter !== 'all' && Array.from(statusFilter).length !== statusOptions.length) {
			filteredUsers = filteredUsers.filter((User) => Array.from(statusFilter).includes(User.status))
		}
		return filteredUsers
	}, [data?.users, filterValue, statusFilter])

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

	const renderCell = React.useCallback((user, columnKey) => {
		const cellValue = user[columnKey]

		switch (columnKey) {
			case 'profileImage':
				return (
					<div className="w-[40px] h-[40px] relative flex items-center">
						<Image
							width={40}
							height={40}
							alt={user?.name}
							src={cellValue}
							className="w-full h-full object-cover rounded-none border border-default-200"
							classNames={{ wrapper: 'rounded-none' }}
						/>
					</div>
				)
			case 'name':
				return (
					<p className="text-bold capitalize whitespace-nowrap overflow-hidden text-ellipsis">{cellValue}</p>
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
			case 'status':
				return (
					<Chip variant="flat" radius="none" size="sm" color={statusColorMap[user.status]}>
						<p className="max-w-[80px] text-bold capitalize whitespace-nowrap overflow-hidden text-ellipsis">
							{statusOptions.find((status) => status.uid === user.status)?.name}
						</p>
					</Chip>
				)
			case 'actions':
				return (
					<div className="relative flex justify-end items-center gap-2">
						<Dropdown radius="none">
							<DropdownTrigger>
								<Button isIconOnly size="sm" variant="light" radius="none">
									<MoreVertical size={20} className="text-default-300" />
								</Button>
							</DropdownTrigger>
							<DropdownMenu
								className="text-foreground-500"
								itemClasses={{
									base: 'rounded-none',
								}}>
								{(() => {
									switch (user?.status) {
										case 'blocked':
											return (
												<DropdownItem
													onClick={() => {
														setCurrentUser(user)
														onOpenBlockUserModal()
													}}>
													Unblock
												</DropdownItem>
											)
										case 'active':
											return (
												<DropdownItem
													onClick={() => {
														setCurrentUser(user)
														onOpenBlockUserModal()
													}}>
													Block
												</DropdownItem>
											)
										case 'doc_uploaded':
											return (
												<DropdownItem
													onClick={() => {
														setCurrentUser(user)
														onOpenVerifyUserModal()
													}}>
													Verify
												</DropdownItem>
											)
										default:
											return null
									}
								})()}
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
					Teachers
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
			<BlockUserModal isOpen={isOpenBlockUserModal} onClose={onCloseBlockUserModal} user={currentUser} />
            <VerifyUserModal isOpen={isOpenVerifyUserModal} onClose={onCloseVerifyUserModal} user={currentUser} />
        </div>
	)
}
