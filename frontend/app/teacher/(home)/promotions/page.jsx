'use client'
import React, { useEffect, useMemo } from 'react'

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
} from '@nextui-org/react'

const columns = [
	{ name: '', uid: 'profileImage', width: '30px' },
	{ name: 'CODE', uid: 'code', width: '100px' },
	{ name: 'STATUS', uid: 'status', width: '100px' },
	{ name: 'DISCOUNT (%)', uid: 'discount', width: '100px' },
	{ name: 'MIN PURCHASE', uid: 'minPurchase', width: '100px' },
	{ name: 'MAX DISCOUNT', uid: 'maxDiscount', width: '100px' },
	{ name: 'START DATE', uid: 'startDate', width: '100px' },
	{ name: 'END DATE', uid: 'endDate', width: '100px' },
	{ name: '', uid: 'actions', width: '30px' },
]

const statusOptions = [
	{ name: 'active', uid: 'active' },
	{ name: 'blocked', uid: 'Blocked' },
	{ name: 'pending', uid: 'pending' },
]

import { keepPreviousData, useQuery } from '@tanstack/react-query'
import { AlertTriangle, MoreVertical, Plus, Search, Ticket, Trash } from 'lucide-react'
import CreateCoupon from './_components/CreateCoupon'
import { getCoupons } from '@/apis/promotions'
import DeleteCouponModal from './_components/DeleteCouponModal'

const INITIAL_VISIBLE_COLUMNS = [
	'profileImage',
	'code',
	'status',
	'discount',
	'minPurchase',
	'maxDiscount',
	'startDate',
	'endDate',
	'actions',
]

const statusColorMap = {
	active: 'success',
	expired: 'danger',
	pending: 'warning',
}

export default function App() {
	const [page, setPage] = React.useState(1)
	const rowsPerPage = 8
	const [coupons, setCoupons] = React.useState([])
	const [totalCoupons, setTotalCoupons] = React.useState(0)

	const [filterValue, setFilterValue] = React.useState('')
	const { data, isPending, isError, isRefetching, isFetched } = useQuery({
		queryKey: ['coupons', { page, count: rowsPerPage, query: filterValue }],
		queryFn: () => getCoupons({ page, count: rowsPerPage, query: filterValue }),
		placeholderData: keepPreviousData,
	})

	const pages = useMemo(() => Math.ceil(data?.totalCoupons / rowsPerPage), [data?.totalCoupons, rowsPerPage])

	const [selectedKeys, setSelectedKeys] = React.useState([])
	const [visibleColumns, setVisibleColumns] = React.useState(INITIAL_VISIBLE_COLUMNS)
	const [statusFilter, setStatusFilter] = React.useState('all')
	const [sortDescriptor, setSortDescriptor] = React.useState({
		column: 'title',
		direction: 'ascending',
	})

	const [currentCoupon, setCurrentCoupon] = React.useState('')
	const {
		isOpen: isOpenCreateCouponModal,
		onOpen: onOpenCreateCouponModal,
		onClose: onCloseCreateCouponModal,
	} = useDisclosure()

	const {
		isOpen: isOpenDeleteCouponModal,
		onOpen: onOpenDeleteCouponModal,
		onClose: onCloseDeleteCouponModal,
	} = useDisclosure()

	const hasSearchFilter = Boolean(filterValue)

	const headerColumns = React.useMemo(() => {
		if (visibleColumns === 'all') return columns

		return columns.filter((column) => Array.from(visibleColumns).includes(column.uid))
	}, [visibleColumns])

	const filteredItems = React.useMemo(() => {
		let filteredCoupons = [...(data?.coupons || [])]

		if (filterValue.trim()) {
			filteredCoupons = filteredCoupons.filter((it) => {
				return it.code.toLowerCase().includes(filterValue.toLowerCase())
			})
		}
		if (statusFilter !== 'all' && Array.from(statusFilter).length !== statusOptions.length) {
			filteredCoupons = filteredCoupons.filter((it) => Array.from(statusFilter).includes(it.status))
		}
		return filteredCoupons
	}, [data, data?.coupons, filterValue, statusFilter])

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

	const renderCell = React.useCallback((item, columnKey) => {
		const cellValue = item[columnKey]

		switch (columnKey) {
			case 'profileImage':
				return <Ticket size={20} className="text-default-500" />
			case 'code':
				return (
					<p className="text-tiny text-bold capitalize whitespace-nowrap overflow-hidden text-ellipsis">
						{cellValue}
					</p>
				)
			case 'status':
				const startDate = new Date(item.startDate)
				const endDate = new Date(item.endDate)
				const status = startDate > new Date() ? 'pending' : endDate < new Date() ? 'expired' : 'active'
				return (
					<Chip variant="flat" radius="none" size="sm" color={statusColorMap[status]} className="capitalize">
						{status}
					</Chip>
				)
			case 'discount':
			case 'minPurchase':
			case 'maxDiscount':
				return (
					<p className="text-tiny text-bold whitespace-nowrap overflow-hidden text-ellipsis">₹{cellValue}</p>
				)
			case 'startDate':
			case 'endDate':
				const val = new Date(cellValue).toLocaleDateString('en-IN', {
					day: 'numeric',
					month: 'short',
					year: 'numeric',
				})
				return (
					<p className="text-tiny text-bold capitalize whitespace-nowrap overflow-hidden text-ellipsis">
						{val}
					</p>
				)
			case 'actions':
				return (
					<div className="text-tiny relative flex justify-end items-center gap-2">
						<Dropdown>
							<DropdownTrigger>
								<Button isIconOnly size="sm" variant="light">
									<MoreVertical size={20} className="text-default-300" />
								</Button>
							</DropdownTrigger>
							<DropdownMenu className="text-default-700">
								<DropdownItem
									color="danger"
									variant="flat"
									onClick={() => {
										setCurrentCoupon(item._id)
										onOpenDeleteCouponModal()
									}}>
									<div className="flex items-center">
										<Trash size={16} />
										<span className="ml-2">Delete</span>
									</div>
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
					placeholder="Search for coupons..."
					startContent={<Search size={16} />}
					value={filterValue}
					onClear={() => onClear()}
					onValueChange={onSearchChange}
					size="sm"
					radius="none"
				/>
				<Button
					variant="flat"
					size="md"
					color="primary"
					onPress={onOpenCreateCouponModal}
					className="capitalize font-medium items-center"
					radius="none">
					<div className="flex justify-center items-center gap-2">
						<Plus size={16} strokeWidth={2.5} />
						<p>Create Coupon</p>
					</div>
				</Button>
			</div>
		)
	}, [filterValue, statusFilter, visibleColumns, onSearchChange, hasSearchFilter])

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
					total={Math.ceil(data?.totalCoupons / rowsPerPage || 1)}
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
					Promotions
				</span>
				{isPending || isRefetching ? (
					<Spinner size="sm"></Spinner>
				) : (
					<span className="text-tiny text-default-600">{`(${data?.totalCoupons} items)`}</span>
				)}
				{isError && <AlertTriangle color="#f00" />}
			</div>

			<Spacer y={4} />

			<Table
				isCompact
				aria-label="Table of coupons"
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
				shadow="md"
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
					emptyContent={isPending || !isFetched ? <Spinner /> : <p>No items found</p>}
					items={sortedItems}
					isLoading={true}>
					{(item) => (
						<TableRow key={item._id}>
							{(columnKey) => <TableCell>{renderCell(item, columnKey)}</TableCell>}
						</TableRow>
					)}
				</TableBody>
			</Table>
			<CreateCoupon isOpen={isOpenCreateCouponModal} onClose={onCloseCreateCouponModal} />
			<DeleteCouponModal
				isOpen={isOpenDeleteCouponModal}
				onClose={onCloseDeleteCouponModal}
				couponId={currentCoupon}
			/>
		</div>
	)
}
