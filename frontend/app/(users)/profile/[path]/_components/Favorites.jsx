import { deleteFavorite, getFavorites } from '@/apis/favorites'
import { Button, Card, CardBody, Divider, Spacer, Spinner } from '@nextui-org/react'
import { QueryClient, useInfiniteQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { X } from 'lucide-react'
import React, { useEffect, useState } from 'react'
import toast from 'react-hot-toast'
import FavItemDummy from './FavItemSkeleton'
import useInfiniteScroll from '@/hooks/useInfiniteScroll'
import Image from 'next/image'

export default function Favorites() {
	const limit = 4
	const [currutCourse, setCurrutCourse] = useState(null)
	const { data, fetchNextPage, hasNextPage, isFetchingNextPage, isPending } = useInfiniteQuery({
		queryKey: ['favorites'],
		queryFn: ({ pageParam = 1 }) => getFavorites({ pageParam, limit }),
		initialPageParam: 1,
		getNextPageParam: (lastPage, allPages, lastPageParam, allPageParams) => {
			const totalPages = Math.ceil(lastPage?.total / limit)
			const nextPage = lastPageParam + 1
			return nextPage <= totalPages ? nextPage : undefined
		},
        staleTime: Infinity
	})

	const queryClient = useQueryClient()
	const removeFromFavorite = useMutation({
		mutationFn: deleteFavorite,
		onSuccess: (data) => {
			queryClient.invalidateQueries({ queryKey: ['favorites'] })
		},
		onError: (error) => {
			toast.error(error?.response?.data?.message || 'Something went wrong!')
		},
	})

	const loaderRef = useInfiniteScroll({ hasNextPage, fetchNextPage, isFetchingNextPage })

	return (
		<>
			<div className="mt-4 ms-2 flex flex-wrap md:justify-between gap-y-4 gap-x-2 justify-center">
				{data?.pages?.map((page) =>
					page?.favorites?.map((favorite) => (
						<Card
							key={favorite?._id}
							shadow="sm"
							className={favorite?.course?.status !== 'published' ? 'shadow-lg' : ''}>
							<CardBody className={favorite?.course?.status !== 'published' ? 'p-0 opacity-30' : 'p-0'}>
								<div className="relative">
									<Image
										src={favorite?.course?.thumbnail}
										alt={favorite?.course?.title}
										width={280}
										height={150}
										className="w-[280px] h-[150px] object-cover object-center border-b border-default-100"
									/>
									<div className="flex flex-col justify-center items-center">
										<div className="flex flex-col justify-center items-center py-2 gap-y-1">
											<p className="font-medium text-sm">{favorite?.course?.title}</p>
											<div className="flex justify-center items-baseline gap-1">
												<p className="text-md font-medium">₹{favorite?.course?.price}</p>
												<p className="text-tiny font-medium line-through text-default-500">
													₹{favorite?.course?.mrp}
												</p>
											</div>
										</div>
										<div className="w-full h-[1px] bg-default-100"></div>
										<Button color="primary" variant="light" fullWidth>
											<p className="text-tiny font-bold">VIEW COURSE</p>
										</Button>
									</div>
									<div
										className="absolute top-0 right-0 p-2 cursor-pointer z-10 text-default-300 hover:text-default-800"
										onClick={() => {
											setCurrutCourse(favorite?.course?._id)
											removeFromFavorite.mutate({ courseId: favorite?.course?._id })
										}}>
										{removeFromFavorite.isPending && currutCourse === favorite?.course?._id ? (
											<Spinner size="sm" />
										) : (
											<X size={20} className='drop-shadow-lg'/>
										)}
									</div>
								</div>
							</CardBody>
						</Card>
					))
				)}
				{(isFetchingNextPage || isPending) && [...Array(limit)].map((_, i) => <FavItemDummy key={i} />)}
				{[...Array(limit)].map((_, i) => (
					<div key={i} className="w-[280px]"></div>
				))}
			</div>
			<div className="w-1 h-1" ref={loaderRef}></div>
			<Spacer y={4} />
			{data?.pages[0]?.total > 0 && !hasNextPage && (
				<div className="relative flex justify-center">
					<Divider className="h-[1px] bg-default-200 max-w-[500px]" />
					<span className="bg-background px-4 text-center italic text-sm whitespace-nowrap text-default-200 absolute left-[50%] top-[50%] translate-x-[-50%] translate-y-[-50%]">
						You've reached the end!
					</span>
				</div>
			)}

			{data?.pages[0]?.total === 0 && !isPending && (
				<p className="mt-10 text-center text-default-500">No Favorites</p>
			)}
		</>
	)
}
