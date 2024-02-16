import React, { useEffect, useState } from 'react'
import CourseReviewItem from './CourseReviewItem'
import { getReviews } from '@/api/reviews'
import { useQuery } from '@tanstack/react-query'
import { Spinner } from '@nextui-org/react'

export default function Reviews({ courseId }) {
	const [reviews, setReviews] = useState([])
	const [page, setPage] = useState(1)
	const [count, setCount] = useState(10)
	const { data, isPending, isError } = useQuery({
		queryKey: ['reviews', {courseId, page, count}],
		queryFn: () => getReviews({ courseId, page, count }),
		keepPreviousData: true,
	})

	useEffect(() => {
		if (data?.reviews) {
			setReviews(data?.reviews)
		}
	}, [data])

	return (
		<>
			{isPending ? (
				<div className="flex justify-center items-center">
					<Spinner />
				</div>
			) : (
				<>
					{reviews.map((review) => (
						<CourseReviewItem key={review._id} review={review} />
					))}
					{reviews.length === 0 && <p className="text-left italic text-tiny text-default-500">No reviews yet</p>}
				</>
			)}
		</>
	)
}
