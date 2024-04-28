import { createComment, getComments } from '@/apis/comments'
import { Button, Image, Spacer, Textarea } from '@nextui-org/react'
import React, { useEffect, useState } from 'react'
import toast from 'react-hot-toast'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'

export default function Comments({ segmentId }) {
	const [comments, setComments] = useState([])
	const [page, setPage] = useState(1)
	const [count, setCount] = useState(10)
	const [comment, setComment] = useState('')
	const [totalComments, setTotalComments] = useState(0)
	const [errors, setErrors] = useState({})

	const queryClient = useQueryClient()

	const { data, isPending, isError } = useQuery({
		queryKey: ['comments', { segmentId, page, count }],
		queryFn: () => getComments({ segmentId, page, count }),
		keepPreviousData: true,
	})

	useEffect(() => {
		if (data?.comments) {
			setComments(data?.comments)
			setTotalComments(data?.totalComments)
		}
	}, [data])

	const { isPending: isLoadingSendComment, mutate: mutateSendComment } = useMutation({
		mutationFn: createComment,
		onSuccess: (data) => {
			setComment('')
			queryClient.invalidateQueries({ queryKey: ['comments'] })
		},
		onError: (error) => {
			const err = error?.response?.data?.errors
			if (err) setErrors(err)
			else toast.error(error?.response?.data?.message || 'Something went wrong!')
		},
	})

	const handleSendComment = () => {
		if (!comment) return setErrors({ comment: 'Comment is required' })
		mutateSendComment({ segmentId, comment })
	}

	return (
		<div className="w-[500px]">
			<div className="flex justify-start items-end gap-2">
				<Textarea
					label="Your comment"
					className="max-w-md"
					errorMessage={errors.comment}
					isLoading={isLoadingSendComment}
					onChange={(e) => setComment(e.target.value)}
					value={comment}
					isInvalid={errors.comment ? true : false}
				/>
				<Button isLoading={isLoadingSendComment} color="primary" variant="flat" onClick={handleSendComment}>
					Comment
				</Button>
			</div>
			<Spacer y={6} />

			{comments.length > 0 ? (
				comments.map((comment, index) => (
					<div key={comment.index} className="flex flex-col gap-2">
						<div className="flex justify-start items-start gap-2">
							<Image
								src={comment.user.profileImage}
								alt="avatar"
								width={40}
								height={40}
								className="rounded-full w-[40px]"
							/>
							<div className="w-full">
								<p className="text-small font-medium">{comment.user.name}</p>

								<p className="text-small">{comment.comment}</p>
								<p className="text-tiny text-default-500 text-right">
									{new Date(comment.createdAt).toLocaleDateString('en-IN', {
										day: 'numeric',
										month: 'short',
										year: 'numeric',
									})}
								</p>
							</div>
						</div>
						<Spacer y={2} />
					</div>
				))
			) : (
				<p className="text-small">No comments yet</p>
			)}
			{comments.length > 0 && (
				<Button
					isLoading={isPending}
					disabled={isPending}
					color="primary"
					variant="light"
					onClick={() => {
						if (comments.length >= totalComments) return toast('No more comments to load')
						setCount((prev) => prev + 10)
					}}>
					Load more
				</Button>
			)}
		</div>
	)
}
