import React, { useEffect, useState } from 'react'
import CourseReviewItem from './CourseReviewItem'
import { getReviews } from '@/apis/reviews'
import { useQuery } from '@tanstack/react-query'
import { Spinner } from '@nextui-org/react'

export default function Reviews({ courseId }) {
	const [page, setPage] = useState(1)
	const [count, setCount] = useState(10)
	const {
		data,
		isPending,
		isError,
	} = useQuery({
		queryKey: ['reviews', { courseId, page, count }],
		queryFn: () => getReviews({ courseId, page, count }),
		keepPreviousData: true,
		enabled: !!courseId,
	})

	if (isPending) {
		return (
			<div className="flex justify-center items-center my-2">
				<Spinner />
			</div>
		)
	}

    if (isError) {
		return <p className="text-left italic text-tiny text-red-500">Error fetching reviews</p>
	}

	if (data?.reviews && data.reviews.length === 0) {
		return <p className="text-left italic text-tiny text-default-500">No reviews yet</p>
	}

	return (
		<div>
			{data && data.reviews.map((review) => (
				<CourseReviewItem key={review._id} review={review} />
			))}
		</div>
	)
}
