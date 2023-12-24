import React, { useEffect } from 'react'
import { Modal, ModalContent, ModalBody, ModalFooter, Button, Switch, Input, Spacer } from '@nextui-org/react'
import { createCategory } from '@/api/categories'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import toast from 'react-hot-toast'

export default function AddCategoryModal({ isOpen, onClose }) {
	const [title, setTitle] = React.useState('')
	const [description, setDescription] = React.useState('')
	const [isListed, setIsListed] = React.useState(false)
	const [errors, setErrors] = React.useState({})
	const queryClient = useQueryClient()

	const { isPending, mutate } = useMutation({
		mutationFn: createCategory,
		onSuccess: (data) => {
			queryClient.invalidateQueries({ queryKey: ['categories'] })
			toast.success('Category created')
			setTitle('')
			setDescription('')
			setIsListed(false)
			setErrors({})
			onClose()
		},
		onError: (error) => {
			const err = error?.response?.data?.errors
			if (err) setErrors(err)
			else toast.error(error?.response?.data?.message || 'Something went wrong')
		},
	})

	const handleSubmit = () => {
		if (title === '') return setErrors({ ...errors, title: 'Please enter a title' })
		if (description === '') return setErrors({ ...errors, description: 'Please enter a description' })
		mutate({ title, description, status: isListed ? 'listed' : 'unlisted' })
	}

	return (
		<Modal isDismissable={false} backdrop="opaque" radius='none' isOpen={isOpen} onClose={onClose} closeButton={<></>}>
			<ModalContent>
				<>
					<ModalBody>
						<div className="mt-4">
							<div>
								<h1 className="text-large text-foreground-600 font-bold">Create a new category</h1>
								<p className="text-sm text-default-700 mt-2">
									What would you like to name your category?
								</p>
							</div>
							<div>
								<Spacer y={4} />
								<Input
									label="Title"
									variant="flat"
                                    radius='none'
									classNames={{
										inputWrapper: 'text-default-500',
									}}
									onChange={(e) => {
										setTitle(e.target.value)
										setErrors({ ...errors, title: '' })
									}}
									value={title}
									errorMessage={errors?.title}
									isInvalid={errors?.title ? true : false}
									size="sm"
								/>
								<Spacer y={4} />
								<Input
									label="Description"
									variant="flat"
                                    radius='none'
									classNames={{
										inputWrapper: 'text-default-500',
									}}
									onChange={(e) => {
										setDescription(e.target.value)
										setErrors({ ...errors, description: '' })
									}}
									value={description}
									errorMessage={errors?.description}
									isInvalid={errors?.description ? true : false}
									size="sm"
								/>
								<Spacer y={4} />
								<Switch isListed size="sm" onChange={setIsListed}>
									Make the catgory listed
								</Switch>
								<Spacer y={4} />
							</div>
						</div>
					</ModalBody>
					<ModalFooter>
						<Button
							className="px-4 font-bold"
							isDisabled={isPending}
                            radius='none'
							variant="light"
							onClick={onClose}>
							Close
						</Button>
						<Button
							className="px-4 font-bold"
							isLoading={isPending}
							color="primary"
                            radius='none'
							variant="flat"
							onClick={handleSubmit}>
							Create
						</Button>
					</ModalFooter>
				</>
			</ModalContent>
		</Modal>
	)
}
