import React, { useEffect } from 'react'
import { Modal, ModalContent, ModalBody, ModalFooter, Button, Switch, Input, Spacer, Textarea } from '@nextui-org/react'
import { addReview } from '@/api/reviews'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import toast from 'react-hot-toast'
import { Star } from 'lucide-react'

export default function WriteReviewModal({ isOpen, onClose, course }) {
	const [rating, setRating] = React.useState(1)
	const [comment, setComment] = React.useState('')
	const [subject, setSubject] = React.useState('')
	const [errors, setErrors] = React.useState({})
	const queryClient = useQueryClient()

	const { isPending, mutate } = useMutation({
		mutationFn: addReview,
		onSuccess: (data) => {
			queryClient.invalidateQueries({ queryKey: ['my-courses'] })
			toast.success('Thank you for your review!')
			handleClose()
		},
		onError: (error) => {
			const err = error?.response?.data?.errors
			if (err) setErrors(err)
			else toast.error(error?.response?.data?.message || 'Something went wrong!')
		},
	})

	const handleSubmit = () => {
		let errors = {}
		if (!comment) errors = { ...errors, comment: 'Comment is required' }
		if (!subject) errors = { ...errors, subject: 'Subject is required' }
		if (Object.keys(errors).length > 0) return setErrors(errors)
		mutate({ courseId: course._id, rating, comment, subject })
	}

	const handleClose = () => {
		setRating(1)
		setComment('')
		setSubject('')
		setErrors({})
		onClose()
	}

	return (
		<Modal isDismissable={false} backdrop="opaque" isOpen={isOpen} onClose={onClose} closeButton={<></>} radius='none'>
			<ModalContent>
				<>
					<ModalBody>
						<div className="mt-4">
							<div>
								<h1 className="text-large text-foreground-600 font-bold">Write a review</h1>
								<p className="text-sm text-default-700 mt-2">
									Your review will help others decide if this course is right for them.
								</p>
							</div>
							<div>
								<Spacer y={4} />
								<div className="flex justify-center gap-1">
									{[1, 2, 3, 4, 5].map((item, index) => (
										<Star
											key={index}
											size={64}
                                            strokeWidth={2}
											fill={rating >= item ? '#EAB308' : '#CBD5E1'}
											className={`cursor-pointer ${rating >= item ? 'animate-bounce' : ''}`}
											onMouseEnter={() => setRating(item)}
                                            
										/>
									))}
								</div>
								<Spacer y={4} />
								<Input
									label="Subject"
									variant="flat"
									classNames={{
										inputWrapper: 'text-default-500',
									}}
									onChange={(e) => {
										setSubject(e.target.value)
										setErrors({ ...errors, subject: '' })
									}}
									value={subject}
									errorMessage={errors?.subject}
									isInvalid={errors?.subject ? true : false}
									size="sm"
                                    radius='none'
								/>
								<Spacer y={4} />
								<Textarea
									label="Comment"
									labelPlacement="outside"
									placeholder="Tell us what you liked or disliked about the course."
									value={comment}
									classNames={{
										label: 'text-[14px] font-medium text-default-700',
										description: 'text-tiny text-default-500 text-start',
										inputWrapper: 'text-default-500',
									}}
									minRows={6}
									onChange={(e) => {
										if (e.target.value.length > 300) return
										setComment(e.target.value)
										setErrors({ ...errors, comment: '' })
									}}
									errorMessage={errors?.comment}
									isInvalid={errors?.comment ? true : false}
									description={`${comment?.length || 0}/300`}
                                    radius='none'
								/>
								<Spacer y={4} />
							</div>
						</div>
					</ModalBody>
					<ModalFooter>
						<Button
							className="px-4 font-medium"
							isDisabled={isPending}
							variant="light"
                            radius='none'
							onClick={handleClose}>
							Close
						</Button>
						<Button
							className="px-4 font-medium"
							isLoading={isPending}
							color="primary"
							variant="flat"
                            radius='none'
							onClick={handleSubmit}>
							Submit
						</Button>
					</ModalFooter>
				</>
			</ModalContent>
		</Modal>
	)
}
