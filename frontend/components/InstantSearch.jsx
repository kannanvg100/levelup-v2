'use client'
import { getSearchResults } from '@/api/courses'
import { Button, Input, Spinner } from '@nextui-org/react'
import { SearchIcon } from 'lucide-react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import React, { useEffect, useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import Image from 'next/image'
import axios from 'axios'

export default function InstantSearch() {
	const [query, setQuery] = useState('')
	const [showResults, setShowResults] = useState(false)
	const router = useRouter()
	const source = axios.CancelToken.source()
	const placeholder = 'Search for courses...'
	const [placeholderText, setPlaceholderText] = useState('')

	const {
		data,
		isFetching: isPending,
		isError,
	} = useQuery({
		queryKey: ['search', query],
		queryFn: () => getSearchResults({ source, query }),
		enabled: !!query,
	})

	// Debounce search with delay and cancel request
	let timerId
	function handleSearchDebounce(query) {
		source.cancel()
		clearTimeout(timerId)
		timerId = setTimeout(() => {
			setQuery(query)
		}, 300)
	}

	const animatePlaceholder = () => {
		setPlaceholderText((prev) => placeholder.slice(0, prev.length + 1))
		if (placeholderText.length < placeholder.length) setTimeout(animatePlaceholder, 1000)
	}

	useEffect(animatePlaceholder)

	return (
		<div
			className="w-full relative flex"
			onMouseLeave={() => setShowResults(false)}
			onMouseEnter={() => setShowResults(true)}>
			<Input
				classNames={{
					base: 'max-w-full h-10',
					mainWrapper: 'h-full',
					input: 'text-small placeholder:animate-indeterminate-bar',
					inputWrapper: 'h-full font-normal text-default-500 bg-default-400/20 dark:bg-default-500/20',
				}}
				placeholder={placeholderText}
				onChange={(e) => {
					setShowResults(true)
					handleSearchDebounce(e.target.value)
				}}
				onKeyDown={(e) => {
					if (e.key === 'Enter' && query) router.push(`/courses?search=${query}`)
				}}
				size="sm"
				radius="none"
				startContent={<SearchIcon size={18} />}
				endContent={isPending && <Spinner size="sm" />}
				isClearable={false}
				type="search"
			/>
			<Button
				isIconOnly
				isDisabled={!query}
				radius="none"
				size="small"
				color="primary"
				className="w-[2.5rem]"
				onClick={() => router.push(`/courses?search=${query}`)}>
				<SearchIcon size={18} color="#fff" />
			</Button>
			<div className="absolute left-0 right-0 top-10 bg-default-50">
				{isError && (
					<div className="w-full h-full flex items-center justify-center">
						Something went wrong, please try again later
					</div>
				)}
				{showResults && data?.length > 0 && (
					<div className="w-full h-full flex flex-col items-start justify-start transition-all ease-in-out shadow-lg">
						{data.map((course) => (
							<Link key={course._id} href={`/courses/${course?.slug}/${course?._id}`} className="w-full">
								<div className="w-full flex items-start justify-start p-3 border-t border-default-200 cursor-pointer hover:bg-default-200">
									<div className="w-16 h-12 overflow-hidden">
										<Image
											width={64}
											height={48}
											src={course?.thumbnail}
											alt={course?.title}
											className="w-full h-full object-cover"
										/>
									</div>
									<div className="flex flex-col gap-1 ml-2">
										<div className="text-default-900 font-semibold">{course?.title}</div>
										<div className="text-default-500 text-tiny">
											{course?.category?.title} &bull; {course?.teacher?.name}
										</div>
									</div>
								</div>
							</Link>
						))}
						<p
							className="w-full text-center cursor-pointer underline text-small py-3 border-t border-default-200 text-default-500 whitespace-nowrap"
							onClick={() => router.push(`/courses?search=${query}`)}>
							Show all results
						</p>
					</div>
				)}
			</div>
		</div>
	)
}
