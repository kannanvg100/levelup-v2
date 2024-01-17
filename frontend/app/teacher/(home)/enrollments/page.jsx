'use client'
import React, { useEffect, useMemo, useRef, useState } from 'react'
import { endOfMonth, format, startOfMonth, subDays, subMonths } from 'date-fns'
import {
	Table,
	TableHeader,
	TableColumn,
	TableBody,
	TableRow,
	TableCell,
	Input,
	Button,
	Pagination,
	Spinner,
	Spacer,
	Image,
} from '@nextui-org/react'

const columns = [
	{ name: '', uid: 'thumbnail', width: '60px' },
	{ name: 'COURSE', uid: 'course', width: '210px' },
	{ name: 'STUDENT', uid: 'student', width: '210px' },
	{ name: 'MRP', uid: 'price', width: '50px' },
	{ name: 'FINAL PRICE', uid: 'offerPrice', width: '50px' },
	{ name: 'COUPON', uid: 'code', width: '30px' },
	{ name: 'PAYMENT MODE', uid: 'method', width: '30px' },
	{ name: 'PURCHASED AT', uid: 'purchasedAt', width: '150px' },
	{ name: '', uid: 'actions', width: '30px' },
]

import { useQuery, keepPreviousData, useQueryClient } from '@tanstack/react-query'
import { useRouter } from 'next/navigation'
import { AlertTriangle, ChevronRight, Download } from 'lucide-react'
import toast from 'react-hot-toast'
import { getAllEnrolledCourses, getEnrollmentReport } from '@/api/enrollments'

const INITIAL_VISIBLE_COLUMNS = ['course', 'student', 'price', 'offerPrice', 'code', 'method', 'purchasedAt']

const today = new Date()
const directLinks = [
	{
		title: 'Today',
		startDate: format(today, 'yyyy-MM-dd'),
		endDate: format(today, 'yyyy-MM-dd'),
	},
	{
		title: 'Yesterday',
		startDate: format(subDays(today, 1), 'yyyy-MM-dd'),
		endDate: format(today, 'yyyy-MM-dd'),
	},
	{
		title: 'Last 7 days',
		startDate: format(subDays(today, 7), 'yyyy-MM-dd'),
		endDate: format(today, 'yyyy-MM-dd'),
	},
	{
		title: 'Last 30 days',
		startDate: format(subDays(today, 30), 'yyyy-MM-dd'),
		endDate: format(today, 'yyyy-MM-dd'),
	},
	{
		title: 'This month',
		startDate: format(startOfMonth(today), 'yyyy-MM-dd'),
		endDate: format(today, 'yyyy-MM-dd'),
	},
	{
		title: 'Last month',
		startDate: format(startOfMonth(subMonths(today, 1)), 'yyyy-MM-dd'),
		endDate: format(endOfMonth(subMonths(today, 1)), 'yyyy-MM-dd'),
	},
]

export default function App() {
	const [page, setPage] = useState(1)
	const rowsPerPage = 10
	const queryClient = useQueryClient()
	const [startDate, setStartDate] = useState('2023-01-01')
	const [endDate, setEndDate] = useState(format(today, 'yyyy-MM-dd'))
	const [downloading, setDownloading] = useState(false)

	const router = useRouter()

	const [selectedKeys, setSelectedKeys] = useState([])
	const [visibleColumns, setVisibleColumns] = useState(INITIAL_VISIBLE_COLUMNS)

	const [sortDescriptor, setSortDescriptor] = useState({
		column: 'title',
		direction: 'ascending',
	})

	const [filterValue, setFilterValue] = useState('')
	const { data, isPending, isError, isRefetching, refetch } = useQuery({
		queryKey: [
			'all-teacher-enrollments',
			{
				page,
				count: rowsPerPage,
			},
		],
		queryFn: () =>
			getAllEnrolledCourses({
				page,
				count: rowsPerPage,
				from: startDate,
				to: endDate,
			}),
		placeholderData: keepPreviousData,
	})

	useEffect(() => {
		refetch()
	}, [startDate, endDate])

	const handleDownloadReport = async () => {
		try {
			setDownloading(true)
			const res = await queryClient.fetchQuery({
				queryKey: ['download-report', 'teacher'],
				queryFn: () => getEnrollmentReport({ from: startDate, to: endDate }),
			})

			const url = URL.createObjectURL(res)
			const link = document.createElement('a')
			link.href = url
			link.download = `report_${startDate}_${endDate}.xlsx`
			link.click()
		} catch (error) {
			toast.error(error?.response?.data?.message || 'No data found')
		} finally {
			setDownloading(false)
		}
	}

	const pages = useMemo(() => Math.ceil(data?.total / rowsPerPage), [data?.total, rowsPerPage])

	const parentRef = useRef(null)

	const hasSearchFilter = Boolean(filterValue)

	const headerColumns = React.useMemo(() => {
		if (visibleColumns === 'all') return columns

		return columns.filter((column) => Array.from(visibleColumns).includes(column.uid))
	}, [visibleColumns])

	const filteredItems = React.useMemo(() => {
		let filteredCourses = [...(data?.enrollments || [])]

		if (filterValue.trim()) {
			filteredCourses = filteredCourses.filter((course) => {
				return course.title.toLowerCase().includes(filterValue.toLowerCase())
			})
		}
		return filteredCourses
	}, [data?.enrollments, filterValue])

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

	const renderCell = React.useCallback((item, columnKey) => {
		const cellValue = item[columnKey]

		switch (columnKey) {
			case 'course':
				return (
					<div className="flex items-center gap-2">
						<div className="w-[50px] h-[30px]">
							<Image
								src={cellValue?.thumbnail}
								alt={cellValue?.title}
								width={50}
								height={30}
								className="w-[50px] h-[30px] object-cover border"
							/>
						</div>
						<div>
							<p className="text-bold text-small whitespace-nowrap overflow-hidden text-ellipsis">
								{cellValue?.title}
							</p>
							<p className="text-bold text-tiny whitespace-nowrap overflow-hidden text-ellipsis">
								{cellValue?.category?.title}
							</p>
						</div>
					</div>
				)
			case 'student':
				return (
					<div className="flex items-center gap-2">
						<div className="w-[30px] h-[30px] rounded-full">
							<Image
								src={cellValue?.profileImage}
								alt={cellValue?.name}
								width={30}
								height={30}
								className="rounded-full"
							/>
						</div>
						<div>
							<p className="text-bold text-small whitespace-nowrap overflow-hidden text-ellipsis">
								{cellValue?.name}
							</p>
							<p className="text-bold text-tiny whitespace-nowrap overflow-hidden text-ellipsis">
								{cellValue?.email}
							</p>
						</div>
					</div>
				)
			case 'price':
				return (
					<p className="text-bold capitalize whitespace-nowrap overflow-hidden text-ellipsis">
						₹{item?.payment?.price}
					</p>
				)
			case 'offerPrice':
				return (
					<p className="text-bold capitalize whitespace-nowrap overflow-hidden text-ellipsis">
						₹{item?.payment?.finalPrice}
					</p>
				)
			case 'method':
				return (
					<p className="text-bold capitalize whitespace-nowrap overflow-hidden text-ellipsis">
						{item?.payment?.method}
					</p>
				)
			case 'code':
				return (
					<p className="text-bold capitalize whitespace-nowrap overflow-hidden text-ellipsis">
						{item?.payment?.code || 'Nil'}
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
				return <div className="relative flex justify-end items-center gap-2"></div>
			default:
				return cellValue
		}
	}, [])

	const onNextPage = React.useCallback(() => {
		if (page < pages) setPage(page + 1)
	}, [page, pages])

	const onPreviousPage = React.useCallback(() => {
		if (page > 1) setPage(page - 1)
	}, [page])

	const onSearchChange = React.useCallback((value) => {
		if (value) {
			setFilterValue(value)
			setPage(1)
		} else {
			setFilterValue('')
		}
	}, [])

	const topContent = React.useMemo(() => {
		return (
			<>
				<div className="flex justify-between items-end h-16 gap-3 mt-2">
					<div className="flex justify-between items-baseline gap-5">
						<Input
							type="date"
							label="Start Date"
							radius="none"
							className="max-w-[300px]"
							placeholder=" "
							labelPlacement="outside"
							value={startDate}
							onChange={(e) => setStartDate(e.target.value)}
						/>
						<p className="text-default-500">to</p>
						<Input
							type="date"
							label="End Date"
							radius="none"
							className="max-w-[300px]"
							placeholder=" "
							labelPlacement="outside"
							value={endDate}
							onChange={(e) => setEndDate(e.target.value)}
						/>

						<Button
							isIconOnly
							isLoading={isPending}
							variant="flat"
							size="md"
							radius="none"
							className="text-default-700 self-end"
							onClick={() => refetch()}>
							<ChevronRight size={18} />
						</Button>
					</div>
					<div className="flex gap-3">
						<Button
							isLoading={downloading}
							isIconOnly
							onClick={handleDownloadReport}
							variant="flat"
							size="md"
							radius="none"
							className="text-default-700">
							<Download size={18} />
						</Button>
					</div>
				</div>
				<div className="flex items-baseline gap-3">
					{directLinks.map((link) => (
						<p
							className="text-tiny underline  text-blue-500 cursor-pointer"
							onClick={() => {
								setStartDate(link.startDate)
								setEndDate(link.endDate)
							}}>
							{link?.title}
						</p>
					))}
				</div>
			</>
		)
	}, [filterValue, visibleColumns, onSearchChange, data, hasSearchFilter, startDate, endDate])

	const bottomContent = React.useMemo(() => {
		return (
			<div className="py-2 px-2 flex justify-between items-center">
				<div></div>
				<Pagination
					showControls
					showShadow
					color="primary"
					variant="flat"
					radius="none"
					size="sm"
					page={page}
					total={Math.ceil(data?.total / rowsPerPage || 1)}
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
					Reports
				</span>
				{isPending || isRefetching ? (
					<Spinner size="sm"></Spinner>
				) : (
					<span className="text-tiny text-default-600">{`(${data?.total} items)`}</span>
				)}
				{isError && <AlertTriangle color="#f00" size={14} className="mt-3" />}
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
		</div>
	)
}
