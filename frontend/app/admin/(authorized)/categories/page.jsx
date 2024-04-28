'use client'
import React, { useMemo } from 'react'

import { getAllCategories } from '@/apis/categories'

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
	{ name: '', uid: 'thumbnail', width: '1px' },
	{ name: 'TITLE', uid: 'title', width: '210px', sortable: true },
	{ name: 'DESCRIPTION', uid: 'description', width: '200px' },
	{ name: 'STATUS', uid: 'status', width: '100px', sortable: true },
	{ name: 'COURSES', uid: 'courses', width: '100px', sortable: true },
	{ name: 'ACTIONS', uid: 'actions', width: '100px' },
]

const statusOptions = [
	{ name: 'Listed', uid: 'listed' },
	{ name: 'Unlisted', uid: 'unlisted' },
]

import { useQuery, keepPreviousData } from '@tanstack/react-query'
import AddCategoryModal from './AddCategoryModal'
import EditCategoryModal from './EditCategoryModal'
import ChangeCategoryStatusModal from './ChangeCategoryStatusModal'
import DeleteCategoryModal from './DeleteCategoryModal'
import { AlertTriangle, ChevronDownIcon, MoreVertical, Plus, Search } from 'lucide-react'

const INITIAL_VISIBLE_COLUMNS = ['thumbnail', 'title', 'description', 'courses', 'status', 'actions']

const statusColorMap = {
	listed: 'success',
	unlisted: 'warning',
}

export default function App() {
	const [page, setPage] = React.useState(1)
	const rowsPerPage = 6

	const [selectedKeys, setSelectedKeys] = React.useState([])
	const [visibleColumns, setVisibleColumns] = React.useState(INITIAL_VISIBLE_COLUMNS)
	const [statusFilter, setStatusFilter] = React.useState(['listed', 'unlisted'])

	const [sortDescriptor, setSortDescriptor] = React.useState({
		column: 'title',
		direction: 'ascending',
	})

	const [filterValue, setFilterValue] = React.useState('')
	const { data, isPending, isError, isRefetching } = useQuery({
		queryKey: [
			'categories',
			{
				page,
				count: rowsPerPage,
				query: filterValue,
				status: [...statusFilter],
				sort: sortDescriptor,
			},
		],
		queryFn: () =>
			getAllCategories({
				page,
				count: rowsPerPage,
				query: filterValue,
				status: [...statusFilter],
				sort: `${sortDescriptor['column']}-${sortDescriptor['direction']}`,
			}),
		placeholderData: keepPreviousData,
	})

	const pages = useMemo(() => Math.ceil(data?.totalCategories / rowsPerPage) || 1, [data, rowsPerPage])
	const [currentCategory, setCurrentCategory] = React.useState('')

	const {
		isOpen: isOpenBlockCategoryModal,
		onOpen: onOpenBlockCategoryModal,
		onClose: onCloseBlockCategoryModal,
	} = useDisclosure()

	const {
		isOpen: isOpenDeleteCategoryModal,
		onOpen: onOpenDeleteCategoryModal,
		onClose: onCloseDeleteCategoryModal,
	} = useDisclosure()

	const {
		isOpen: isOpenAddCategoryModal,
		onOpen: onOpenAddCategoryModal,
		onClose: onCloseAddCategoryModal,
	} = useDisclosure()

	const {
		isOpen: isOpenEditCategoryModal,
		onOpen: onOpenEditCategoryModal,
		onClose: onCloseEditCategoryModal,
	} = useDisclosure()

	const hasSearchFilter = Boolean(filterValue)

	const headerColumns = React.useMemo(() => {
		if (visibleColumns === 'all') return columns

		return columns.filter((column) => Array.from(visibleColumns).includes(column.uid))
	}, [visibleColumns])

	const filteredItems = React.useMemo(() => {
		let filteredCategories = [...(data?.categories || [])]

		if (filterValue.trim()) {
			filteredCategories = filteredCategories.filter((category) => {
				return category.title.toLowerCase().includes(filterValue.toLowerCase())
			})
		}
		if (statusFilter !== 'all' && Array.from(statusFilter).length !== statusOptions.length) {
			filteredCategories = filteredCategories.filter((category) =>
				Array.from(statusFilter).includes(category.status)
			)
		}
		return filteredCategories
	}, [data?.categories, filterValue, statusFilter])

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

	const renderCell = React.useCallback((category, columnKey) => {
		const cellValue = category[columnKey]

		switch (columnKey) {
			// case 'thumbnail':
			// 	return (
			// 		<div className="w-[60px] h-[60px] relative flex items-center">
			// 			<Image
			// 				width={60}
			// 				height={60}
			// 				// alt={category?.title}
			// 				src={category?.thumbnail}
			// 				className="w-full h-full object-cover rounded-none border border-default-200"
			// 				classNames={{ wrapper: 'rounded-none' }}
			// 			/>
			// 		</div>
			// 	)
			case 'title':
				return (
					<p className="text-bold capitalize whitespace-nowrap overflow-hidden text-ellipsis">{cellValue}</p>
				)
			case 'description':
				return (
					<p className="text-bold capitalize w-[200px] whitespace-nowrap overflow-hidden text-ellipsis">
						{cellValue}
					</p>
				)
			case 'courses':
				return (
					<p className="text-bold capitalize w-[100px] whitespace-nowrap overflow-hidden text-ellipsis">
						{cellValue || 0}
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
			case 'status':
				return (
					<Chip
						variant="flat"
						radius="none"
						size="sm"
						color={statusColorMap[category.status]}
						className="capitalize">
						{cellValue}
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
								<DropdownItem
									key="edit"
									onClick={() => {
										setCurrentCategory(category)
										onOpenEditCategoryModal()
									}}>
									Edit
								</DropdownItem>
								<DropdownItem
									key="block"
									onClick={() => {
										setCurrentCategory(category)
										onOpenBlockCategoryModal()
									}}>
									{category.status === 'listed' ? 'Unlist' : 'List'}
								</DropdownItem>
								<DropdownItem
									key="delete"
									onClick={() => {
										setCurrentCategory(category)
										onOpenDeleteCategoryModal()
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
					placeholder="Search for categories..."
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
						onPress={onOpenAddCategoryModal}
						className="capitalize font-medium items-center"
						radius="none">
						<div className="flex justify-center items-center gap-2">
							<Plus size={16} strokeWidth={2.5} />
							<p>Create Category</p>
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
					total={Math.ceil(data?.totalCategories / rowsPerPage || 1)}
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
					Categories
				</span>
				{isPending || isRefetching ? (
					<Spinner size="sm"></Spinner>
				) : (
					<span className="text-tiny text-default-600">{`(${data?.totalCategories} items)`}</span>
				)}
				{isError && <AlertTriangle color="#f00" />}
			</div>

			<Spacer y={4} />

			<Table
				aria-label="Table of categories"
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
			<ChangeCategoryStatusModal
				isOpen={isOpenBlockCategoryModal}
				onClose={onCloseBlockCategoryModal}
				category={currentCategory}
			/>
			<DeleteCategoryModal
				isOpen={isOpenDeleteCategoryModal}
				onClose={onCloseDeleteCategoryModal}
				category={currentCategory}
			/>
			<AddCategoryModal isOpen={isOpenAddCategoryModal} onClose={onCloseAddCategoryModal} />
			<EditCategoryModal
				isOpen={isOpenEditCategoryModal}
				onClose={onCloseEditCategoryModal}
				category={currentCategory}
			/>
		</div>
	)
}
