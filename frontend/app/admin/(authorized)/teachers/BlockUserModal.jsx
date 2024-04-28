import React, { useEffect } from 'react'
import {
	Modal,
	ModalContent,
	ModalBody,
	ModalFooter,
	Button
} from '@nextui-org/react'
import { changeUserStatus } from '@/apis/users'
import { useMutation, useQueryClient } from '@tanstack/react-query'

export default function BlockUserModal({ isOpen, onClose, user }) {
	const queryClient = useQueryClient()
	const { isPending, mutate } = useMutation({
		mutationFn: changeUserStatus,
		onSuccess: (data) => {
			queryClient.invalidateQueries({ queryKey: ['teachers-by-admin'] })
			onClose()
		},
		onError: (error) => {
			const err = error?.response?.data?.message || 'Something went wrong'
			toast.error(err)
			onClose(false)
		},
	})

	const handlechangeUserStatus = (status) => {
		mutate({ id: user._id, status })
	}

	return (
		<Modal isDismissable={false} backdrop="opaque" isOpen={isOpen} onClose={onClose} closeButton={<></>} radius='none'>
			<ModalContent>
				<>
					<ModalBody>
						<div className="mt-4">
							<div>
								<h1 className="text-large text-foreground-600 font-bold">
									{user.status === 'blocked' ? 'Unblock ' : 'Block '}the user
								</h1>
								<p className="text-sm text-default-700 mt-2">
									Are you sure you want to {user.status === 'blocked' ? 'unblock ' : 'block '} this
									user?
								</p>
							</div>
						</div>
					</ModalBody>
					<ModalFooter>
						<Button isDisabled={isPending} variant="light" onPress={onClose} className="font-medium">
							Cancel
						</Button>
						<Button
							color="danger"
							onPress={() => handlechangeUserStatus(user.status === 'blocked' ? 'active' : 'blocked')}
							variant="flat"
							className="font-medium"
							isLoading={isPending}>
							{user.status === 'blocked' ? 'Unblock ' : 'Block '}
						</Button>
					</ModalFooter>
				</>
			</ModalContent>
		</Modal>
	)
}
