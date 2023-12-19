'use client'
import { getCourses, getFilters } from '@/api/courses'
import CourseItem from './CourseItem'
import { Chip, ScrollShadow, Skeleton, Spacer } from '@nextui-org/react'
import { useQuery } from '@tanstack/react-query'
import React, { useEffect, useRef, useState } from 'react'
import { useHorizontalScroll } from '@/hooks/useHorizontalScroll'
import { ArrowRight } from 'lucide-react'
import Link from 'next/link'

export default function CoursesWithChip() {
	const { data: filterData, isPending: isLoadingfilterOptions } = useQuery({
		queryKey: ['filterOptions'],
		queryFn: () => getFilters(),
	})
	const [filter, setFilter] = useState('')
	const filterString = { category: [filter] }
	const { data, isPending } = useQuery({
		queryKey: ['courses', { filter }],
		queryFn: () => getCourses({ page: 1, count: 6, sort: '', search: '', filter: filterString }),
		enabled: !!filter,
	})

	useEffect(() => {
		if (filterData?.filters) setFilter(filterData.filters[0].values[0].id)
	}, [filterData])

	const scrollRef = useHorizontalScroll()
	const scrollFilterRef = useHorizontalScroll()

	return (
		<div>
			<p className="text-[1.5rem] font-semibold text-default-700">Latest courses</p>
			<Spacer y={2} />
			<ScrollShadow
				hideScrollBar
				orientation="horizontal"
				className="flex items-center gap-2"
				ref={scrollFilterRef}>
				{filterData?.filters &&
					filterData.filters[0].values.map((cat) => (
						<Chip
							key={cat.id}
							radius="sm"
							className="cursor-pointer text-tiny select-none"
							variant="flat"
							color={`${filter === cat.id ? 'primary' : 'default'}`}
							onClick={() => setFilter(cat.id)}>
							{cat.title}
						</Chip>
					))}
				{isLoadingfilterOptions &&
					[...Array(4)].map((_, i) => (
						<div key={i} className="bg-default-50">
							<Skeleton className="h-7 w-32" />
						</div>
					))}
			</ScrollShadow>
			<Spacer y={2} />
			<ScrollShadow hideScrollBar orientation="horizontal" className="flex items-center gap-4" ref={scrollRef}>
				{data && data?.courses.map((course) => <CourseItem key={course._id} course={course} />)}
				{isPending ? (
					[...Array(4)].map((_, i) => (
						<div key={i} className="bg-default-50 w-[240px] shadow-sm">
							<div className="">
								<Skeleton className="h-[125px] w-full" />
								<Spacer y={5} />
								<div className="p-2">
									<Skeleton className="w-[150px] h-4" />
									<Spacer y={3} />
									<Skeleton className="w-[200px] h-3" />
									<Spacer y={1} />
									<Skeleton className="w-[120px] h-3" />
									<Spacer y={4} />
								</div>
							</div>
						</div>
					))
				) : (
					<Link
						href={`/courses?filter=category%3D${filter}`}
						className="flex justify-center items-center gap-1 cursor-pointer text-default-500 ms-4 me-8 hover:text-primary">
						<p className='text-tiny whitespace-nowrap font-medium'>VIEW ALL</p>
						<ArrowRight size={16} />
					</Link>
				)}
			</ScrollShadow>
		</div>
	)
}
