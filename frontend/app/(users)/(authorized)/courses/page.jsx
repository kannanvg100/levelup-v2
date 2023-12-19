'use client'

import { getCourses, getFilters } from '@/api/courses'
import {
	Accordion,
	AccordionItem,
	Button,
	Checkbox,
	CheckboxGroup,
	Dropdown,
	DropdownItem,
	DropdownMenu,
	DropdownTrigger,
	Pagination,
	Skeleton,
	Slider,
	Spacer,
} from '@nextui-org/react'
import { ChevronDown, Frown } from 'lucide-react'
import { useCallback, useEffect, useMemo, useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import CourseItem from './CourseItem'
import { useRouter, useSearchParams } from 'next/navigation'

export default function Sidebar() {
	const [page, setPage] = useState(1)
	const [count, setCount] = useState(8)
	const [search, setSearch] = useState('')
	const [filter, setFilter] = useState({})
	const [sort, setSort] = useState('popular')
	const router = useRouter()
	const searchParams = useSearchParams()
	const [totalPages, setTotalPages] = useState(1)
	const [priceRange, setPriceRange] = useState([0, 9999])
    
	const { data, isPending, isError } = useQuery({
		queryKey: ['courses', { page, count, search, filter, sort }],
		queryFn: () => getCourses({ page, count, search, filter, sort }),
	})

	useEffect(() => {
		if (data) setTotalPages(Math.ceil(data?.totalCourses / count))
	}, [data])

	useEffect(() => {
		let query = ''
		if (search) query += `search=${search}&`
		if (sort) query += `sort=${sort}&`
		if (Object.keys(filter).length > 0) {
			let filterString = Object.entries(filter)
				.filter(([key, value]) => value.length > 0)
				.map(([key, value]) => `${key}=${value.join(',')}`)
				.join('&')
			filterString = encodeURIComponent(filterString)
			query += `filter=${filterString}&`
		}
		query += `page=${page}&count=${count}`
		router.push(`/courses?${query}`, undefined, { shallow: true })
	}, [page, count, search, filter, sort])

	useEffect(() => {
		setSearch(searchParams.get('search') || '')
		setPage(Number(searchParams.get('page')) || 1)
		setCount(Number(searchParams.get('count')) || 8)
		let filter = decodeURIComponent(searchParams.get('filter') || '')
		if (filter) {
			filter = filter.split('&').reduce((acc, curr) => {
				const [key, value] = curr.split('=')
				acc[key] = value.split(',')
				return acc
			}, {}) 
		}
		setFilter(filter)
	}, [])

	const {
		data: filterData,
		isPending: isLoadingfilterOptions,
		isError: isErrorfilterOptions,
	} = useQuery({
		queryKey: ['filterOptions'],
		queryFn: () => getFilters(),
	})

	const onNextPage = useCallback(() => {
		if (page < totalPages) setPage(page + 1)
	}, [page, totalPages])

	const onPreviousPage = useCallback(() => {
		if (page > 1) setPage(page - 1)
	}, [page])

	const pagination = useMemo(() => {
		return (
			<div className="py-2 px-2 flex justify-between items-center">
				<div></div>
				<Pagination
					isCompact={false}
					showControls
					showShadow
					color="primary"
					variant="flat"
					radius="none"
					size="sm"
					page={page}
					total={totalPages}
					onChange={setPage}
				/>
				<div className="hidden sm:flex w-[30%] justify-end gap-2">
					<Button isDisabled={page === 1} size="sm" variant="flat" onPress={onPreviousPage} radius="none">
						Previous
					</Button>
					<Button
						isDisabled={page === totalPages}
						size="sm"
						variant="flat"
						onPress={onNextPage}
						radius="none">
						Next
					</Button>
				</div>
			</div>
		)
	}, [page, totalPages])

	return (
		<div>
			<div className="flex gap-2 justify-between items-center">
				<div className="flex gap-2 items-center">
					<p className="text-lg font-medium text-default-600">Browse Courses</p>
				</div>
				<div>
					<Dropdown radius="none">
						<DropdownTrigger>
							<Button
								isDisabled={!filterData?.sortOptions}
								fullWidth
								radius="none"
								variant="light"
								endContent={<ChevronDown />}>
								{(filterData?.sortOptions &&
									(filterData?.sortOptions.find((it) => it.key === sort)?.title ||
										filterData?.sortOptions[0].title)) ||
									'Sort by'}
							</Button>
						</DropdownTrigger>
						<DropdownMenu
							className="text-default-500"
							aria-label="course category selection"
							variant="flat"
							disallowEmptySelection
							selectionMode="single"
							itemClasses={{
								base: 'rounded-none',
							}}
							onSelectionChange={(key) => setSort(filterData?.sortOptions[key.currentKey]?.key)}>
							{filterData?.sortOptions &&
								filterData?.sortOptions?.map((it, index) => {
									return <DropdownItem key={index}>{it.title}</DropdownItem>
								})}
						</DropdownMenu>
					</Dropdown>
				</div>
			</div>
			<Spacer y={4} />
			<div className="flex gap-3 items-start justify-start border-t-1 border-default-100">
				<div className="min-w-[200px] border-e-1 border-default-100">
					{isLoadingfilterOptions ? (
						<div className="ps-2">
							{Array(3)
								.fill(0)
								.map((_, i) => {
									return (
										<>
											<Spacer y={3} />
											<Skeleton className="w-[100px] h-4" />
											<Spacer y={3} />
											<div className="flex gap-2 mb-3">
												<Skeleton className="w-[16px] h-4" />
												<Skeleton className="w-[40px] h-4" />
											</div>
											<div className="flex gap-2 mb-3">
												<Skeleton className="w-[16px] h-4" />
												<Skeleton className="w-[60px] h-4" />
											</div>
											<div className="flex gap-2 mb-3">
												<Skeleton className="w-[16px] h-4" />
												<Skeleton className="w-[100px] h-4" />
											</div>
											<Spacer y={3} />
										</>
									)
								})}
						</div>
					) : (
						<Accordion
							isCompact={true}
							showDivider={false}
							defaultSelectedKeys={'all'}
							selectionMode="multiple"
							className="whitespace-nowrap"
							itemClasses={{
								base: '',
								title: 'text-default-900 text-small font-semibold',
								trigger: 'w-fit',
								content: 'text-default-700',
							}}>
							{filterData?.filters &&
								filterData?.filters.map((filterItem) => {
									return (
										<AccordionItem
											key={filterItem?.key}
											aria-label={filterItem?.key}
											title={filterItem?.title}
											className="pb-2">
											<CheckboxGroup
												label=""
												value={filter[filterItem?.key] || []}
												size="sm"
												radius="none"
												onChange={(sel) => {
													if (sel.length === 0) {
														const newFilter = { ...filter }
														delete newFilter[filterItem?.key]
														setFilter(newFilter)
													} else setFilter({ ...filter, [filterItem?.key]: sel })
												}}>
												{filterItem?.values?.map((it) => {
													return (
														<Checkbox key={it?.id} value={it?.id}>
															<p className="w-[150px] whitespace-nowrap text-ellipsis overflow-hidden">
																{it?.title}
															</p>
														</Checkbox>
													)
												})}
											</CheckboxGroup>
										</AccordionItem>
									)
								})}
							{filterData?.priceRanges && (
								<AccordionItem key="price" aria-label="price" title="Price" className="pb-2">
									<div className="flex flex-col items-center justify-start max-w-[160px]">
										<div className="flex gap-2 items-center justify-between w-full ps-2">
											<p className="text-tiny font-medium text-default-500">₹{priceRange[0]}</p>
											<p className="text-tiny font-medium text-default-500">₹{priceRange[1]}</p>
										</div>
										<Slider
											className="max-w-[160px] ps-1 mt-1"
											size="sm"
											formatOptions={{ style: 'currency', currency: 'USD' }}
											step={1}
											minValue={filterData?.priceRanges.min || 0}
											maxValue={filterData?.priceRanges.max || 1000}
											value={priceRange}
											onChange={(val) => {
												setPriceRange(val)
											}}
											onChangeEnd={(val) => {
												const newFilter = { ...filter }
												newFilter['price'] = [`${val[0]}-${val[1]}`]
												setFilter(newFilter)
											}}
										/>
									</div>
								</AccordionItem>
							)}
						</Accordion>
					)}
				</div>
				<div className="flex-grow mt-3">
					<div className="flex gap-x-1 gap-y-6 justify-between items-start flex-wrap">
						{data?.courses?.map((course) => (
							<CourseItem key={course._id} course={course} />
						))}

						{isPending
							? [...Array(count)].map((_, i) => (
									<div key={i} className="bg-default-50 w-[240px]">
										<div className="p-2">
											<Skeleton className="h-[125px] w-full" />
											<Spacer y={1} />
											<Skeleton className="w-[200px] h-4" />
											<Spacer y={1} />
											<Skeleton className="w-[100px] h-6" />
										</div>
									</div>
							  ))
							: data?.courses?.length === 0 && (
									<div className="w-full min-h-[300px] flex flex-col items-center justify-center gap-4 text-default-500">
										<Frown size={64} />
										<p className="text-default-500 text-lg font-semibold">No courses found</p>
										<Button
											variant="light"
											color="primary"
											className="font-semibold"
											onClick={() => {
												setFilter({})
											}}>
											Clear filters
										</Button>
									</div>
							  )}

						{/* dummy divs to fill the flex container */}
						{[...Array(count)].map((_, i) => (
							<div key={i} className="w-[240px]"></div>
						))}
					</div>
					{(data?.courses.length > 0 || isPending) && pagination}
				</div>
			</div>
		</div>
	)
}
