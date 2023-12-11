import React, { useEffect } from 'react'
import { Modal, ModalContent, ModalBody, ModalFooter, Button } from '@nextui-org/react'
import { deleteCategory } from '@/api/categories'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import toast from 'react-hot-toast'

export default function DeleteCategoryModal({ isOpen, onClose, category }) {
	const queryClient = useQueryClient()
	const { isPending, mutate } = useMutation({
		mutationFn: deleteCategory,
		onSuccess: (data) => {
            toast.success( 'Category deleted')
			queryClient.invalidateQueries({ queryKey: ['categories'] })
			onClose()
		},
		onError: (error) => {
            console.log(error)
			const err = error?.response?.data?.message || 'Something went wrong'
			toast.error(err)
			onClose(false)
		}
	})

	const handleCategoryDelete = () => {
            mutate(category._id)
	}

	return (
		<Modal isDismissable={false} backdrop="opaque" radius='none' isOpen={isOpen} onClose={onClose} closeButton={<></>}>
			<ModalContent>
				<>
					<ModalBody>
						<div className="mt-4">
							<div>
								<h1 className="text-large text-foreground-600 font-bold">Delete the category</h1>
								<p className="text-sm text-default-700 mt-2">
									Are you sure you want to delete this category?
								</p>
							</div>
						</div>
					</ModalBody>
					<ModalFooter>
						<Button isDisabled={isPending} variant="light" radius='none' onPress={onClose} className="font-medium">
							Cancel
						</Button>
						<Button
							color="danger"
                            radius='none'
							onPress={() => handleCategoryDelete()}
							variant="flat"
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
