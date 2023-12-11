import React, { useEffect, useState } from 'react'
import { Modal, ModalContent, ModalBody, ModalFooter, Button } from '@nextui-org/react'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import toast from 'react-hot-toast'
import { deleteSegment } from '@/api/segments'
import { useDispatch, useSelector } from 'react-redux'
import { add } from '@/redux/slices/courseSlice'

export default function DeleteSegmentModal({ isOpen, onClose, segment, chapter }) {

	const dispatch = useDispatch()
	const { course } = useSelector((state) => state.course)

	const queryClient = useQueryClient()
	const { isPending, mutate } = useMutation({
		mutationFn: deleteSegment,
		onSuccess: (data) => {
			try {
				const updatedChapter = {
                    ...chapter,
					segments: [...chapter.segments.filter((seg) => seg._id !== segment._id)],
				}
                console.log("📄 > file: DeleteSegmentModal.jsx:20 > DeleteSegmentModal > updatedChapter:", updatedChapter)
				const updatedCourse = {
                    ...course,
					chapters: [
                        ...course.chapters.filter((chapter) => chapter._id !== updatedChapter._id),
						updatedChapter,
					],
				}
                console.log("📄 > file: DeleteSegmentModal.jsx:25 > DeleteSegmentModal > updatedCourse:", updatedCourse)
				dispatch(add(updatedCourse))
			} catch (error) {
				console.log(error)
			}
			toast.success('Segment deleted successfully')
			onClose(false)
		},
		onError: (error) => {
			const err = error?.response?.data?.message || 'Something went wrong'
			toast.error(err)
			onClose(false)
		},
	})

	const handleSegmentDelete = () => {
		mutate({ segmentId: segment?._id })
	}

	return (
		<Modal
			isDismissable={false}
			backdrop="opaque"
			radius="none"
			isOpen={isOpen}
			onClose={onClose}
			closeButton={<></>}>
			<ModalContent>
				<>
					<ModalBody>
						<div className="mt-4">
							<div>
								<h1 className="text-large text-foreground-600 font-bold">Delete the segment</h1>
								<p className="text-sm text-default-700 mt-2">
									Are you sure you want to delete this segment?
								</p>
							</div>
						</div>
					</ModalBody>
					<ModalFooter>
						<Button
							isDisabled={isPending}
							variant="light"
							radius="none"
							onPress={onClose}
							className="font-medium">
							Cancel
						</Button>
						<Button
							color="danger"
							onPress={handleSegmentDelete}
							variant="flat"
							radius="none"
							className="font-medium"
							isLoading={isPending}>
							Delete
						</Button>
					</ModalFooter>
				</>
			</ModalContent>
		</Modal>
	)
}
