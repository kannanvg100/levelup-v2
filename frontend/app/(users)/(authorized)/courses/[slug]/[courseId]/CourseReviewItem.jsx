import { Image, Spacer } from '@nextui-org/react'
import { Star } from 'lucide-react'
import React from 'react'

export default function CourseReviewItem({ index, review }) {
	return (
		<div key={index} className="flex justify-start items-start gap-3">
			<Image
				width={50}
				height={50}
				src={review?.user?.profileImage || 'https://levelup.s3.ap-south-1.amazonaws.com/default_avatar.png'}
				alt={review?.user?.name}
				className="rounded-full"
			/>
			<div className="w-[400px]">
				<Spacer y={1} />
				<div className="flex justify-between items-center">
					<p className="text-sm font-semibold">{review?.user?.name}</p>
					<p className="text-sm text-default-500">
						{new Date(review.createdAt).toLocaleDateString('en-IN', {
							day: 'numeric',
							month: 'short',
							year: 'numeric',
						})}
					</p>
				</div>
				<Spacer y={1} />
				<div className="flex">
					{[1, 2, 3, 4, 5].map((item, index) => (
						<Star
							key={index}
							size={16}
							className={`cursor-pointer ${review.rating >= item ? 'text-yellow-500' : 'text-default-300'}`}
						/>
					))}
				</div>
				<Spacer y={1} />
				<p className="text-md">{review.subject}</p>
				<Spacer y={1} />
				<p className="text-tiny">{review.comment}</p>
			</div>
		</div>
	)
}
