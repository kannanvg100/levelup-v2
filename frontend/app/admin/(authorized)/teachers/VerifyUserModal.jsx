import React, { useEffect } from 'react'
import { Modal, ModalContent, ModalBody, ModalFooter, Button, Image, Spacer } from '@nextui-org/react'
import { changeUserStatus } from '@/apis/users'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { ExternalLink } from 'lucide-react'

export default function VerifyUserModal({ isOpen, onClose, user }) {
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

	const handleChangeUserStatus = (status) => {
		mutate({ id: user._id, status })
	}

	return (
		<Modal backdrop="opaque" isOpen={isOpen} onClose={onClose} radius="none">
			<ModalContent>
				<>
					<ModalBody>
						<div className="mt-4">
							<div>
								<h1 className="text-large text-foreground-600 font-bold">Verify the Teacher</h1>
								<p className="text-sm text-default-700 mt-2">
									Review the teacher&apos;s profile and verify the teacher
								</p>
							</div>
							<div className="mt-4">
								<h1 className="text-medium text-foreground-600 font-bold">
									{user?.name || 'No name provided'}
								</h1>
								<p className="text-sm text-default-700">{user?.email}</p>
								<Spacer y={4} />
								{user?.docs && user?.docs?.url ? (
									<>
										{['jpg', 'jpeg', 'png', 'webp', 'JPG', 'JPEG', 'PNG', 'WEBP'].includes(
											user?.docs?.name.split('.').pop()
										) ? (
											<>
												<Image src={user?.docs?.url} alt="profile" width={300} />
												<Spacer y={2} />
												<Button
													color="primary"
													variant="ghost"
													className="font-medium"
													endContent={<ExternalLink size={16} />}>
													<a href={user?.docs?.url} target="_blank">
														View Document in new tab2
													</a>
												</Button>
											</>
										) : (
											<Button
												color="primary"
												variant="ghost"
												className="font-medium"
												endContent={<ExternalLink size={16} />}>
												<a href={user?.docs?.url} target="_blank">
													View Document in new tab1
												</a>
											</Button>
										)}
									</>
								) : (
									<p className="text-sm text-default-500">No document provided</p>
								)}
							</div>
						</div>
					</ModalBody>
					<ModalFooter>
						<Button
							isDisabled={isPending}
							color="danger"
							onPress={() => handleChangeUserStatus('rejected')}
							variant="flat"
							className="font-medium">
							Reject
						</Button>
						<Button
							color="success"
							onPress={() => handleChangeUserStatus('active')}
							variant="flat"
							className="font-medium"
							isLoading={isPending}>
							Approve
						</Button>
					</ModalFooter>
				</>
			</ModalContent>
		</Modal>
	)
}
