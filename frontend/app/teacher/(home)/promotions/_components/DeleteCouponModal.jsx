import React from 'react'
import {
	Modal,
	ModalContent,
	ModalHeader,
	ModalBody,
	ModalFooter,
	Button,
	useDisclosure,
	Input,
	Spacer,
} from '@nextui-org/react'
import { useState } from 'react'
import { deleteCoupon } from '@/api/promotions'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import toast from 'react-hot-toast'

export default function DeleteCouponModal({ isOpen, onClose, couponId }) {
	const queryClient = useQueryClient()
	const { isPending, mutate } = useMutation({
		mutationFn: deleteCoupon,
		onSuccess: (data) => {
			queryClient.invalidateQueries({ queryKey: ['coupons'] })
			toast.success('Coupon deleted successfully')
			onClose(false)
		},
		onError: (error) => {
			const err = error?.response?.data?.message || 'Something went wrong'
			toast.error(err)
			onClose(false)
		},
	})

	const handleCouponDelete = () => {
		mutate({ couponId })
        
	}

	return (
		<Modal isDismissable={false} backdrop="opaque" isOpen={isOpen} onClose={onClose} closeButton={<></>}>
			<ModalContent>
				<>
					<ModalBody>
						<div className="mt-4">
							<div>
								<h1 className="text-large text-foreground-600 font-bold">Delete the coupon</h1>
								<p className="text-sm text-default-700 mt-2">
									Are you sure you want to delete this coupon?
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
							onPress={handleCouponDelete}
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
