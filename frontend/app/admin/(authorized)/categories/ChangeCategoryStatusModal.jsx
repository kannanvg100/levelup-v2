import React, { useEffect } from 'react'
import {
	Modal,
	ModalContent,
	ModalBody,
	ModalFooter,
	Button
} from '@nextui-org/react'
import { changeCategoryStatus } from '@/apis/categories'
import { useMutation, useQueryClient } from '@tanstack/react-query'

export default function ChangeCategoryStatusModal({ isOpen, onClose, category }) {
	const queryClient = useQueryClient()
	const { isPending, mutate } = useMutation({
		mutationFn: changeCategoryStatus,
		onSuccess: (data) => {
			queryClient.invalidateQueries(['categories'])
			onClose()
		},
		onError: (error) => {
			const err = error?.response?.data?.message || 'Something went wrong'
			toast.error(err)
			onClose(false)
		},
	})

	const handleChangeCategoryStatus = (status) => {
		mutate({ id: category._id, status })
	}

	return (
		<Modal isDismissable={false} backdrop="opaque" isOpen={isOpen} onClose={onClose} closeButton={<></>} radius='none'>
			<ModalContent>
				<>
					<ModalBody>
						<div className="mt-4">
							<div>
								<h1 className="text-large text-foreground-600 font-bold">
									{category.status === 'listed' ? 'Unlist ' : 'List '}the category
								</h1>
								<p className="text-sm text-default-700 mt-2">
									Are you sure you want to {category.status === 'listed' ? 'unlist ' : 'list '} this
									category?
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
							onPress={() => handleChangeCategoryStatus(category.status === 'unlisted' ? 'listed' : 'unlisted')}
							variant="flat"
                            radius='none'
							className="font-medium"
							isLoading={isPending}>
							{category.status === 'listed' ? 'Unlist ' : 'List '}
						</Button>
					</ModalFooter>
				</>
			</ModalContent>
		</Modal>
	)
}
