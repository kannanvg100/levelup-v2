'use client'
import React, { useState } from 'react'
import { Modal, ModalContent, ModalHeader, ModalBody, ModalFooter, Button, Input, code } from '@nextui-org/react'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { createCoupon } from '@/apis/promotions'
import toast from 'react-hot-toast'

export default function CreateCoupon({ isOpen, onClose }) {
	const [code, setCode] = useState('')
	const [discount, setDiscount] = useState('')
	const [maxDiscount, setMaxDiscount] = useState('')
	const [minPurchase, setMinPurchase] = useState('')
	const [startDate, setStartDate] = useState(null)
	const [endDate, setEndDate] = useState(null)
	const queryClient = useQueryClient()

	const [errors, setErrors] = useState({})
	const newCoupon = useMutation({
		mutationKey: ['createCoupon'],
		mutationFn: createCoupon,
		onSuccess: () => {
			queryClient.invalidateQueries('coupons')
			toast.success('Coupon created successfully')
			onClose()
		},
		onError: (error) => {
			const err = error?.response?.data?.errors
			if (err) setErrors(err)
			else toast.error(error?.response?.data?.message || 'Something went wrong')
		},
	})

	const handleSubmit = () => {
		setErrors({})
		let err = {}
		if (!code || !code.trim()) err = { ...err, code: 'Coupon code is required' }
		if (!discount || !discount.trim()) err = { ...err, discount: 'Discount is required' }
		if (discount < 0 || discount > 100) err = { ...err, discount: 'Discount should be between 0 and 100' }
		if (!maxDiscount || !maxDiscount.trim()) err = { ...err, maxDiscount: 'Maximum discount is required' }
		if (!minPurchase || !minPurchase.trim()) err = { ...err, minPurchase: 'Minimum purchase is required' }
		if (!startDate) err = { ...err, startDate: 'Start date is required' }
		else if (new Date(startDate) < new Date().getDate) {
			const start = new Date(`${startDate}T00:00:00`)
			err = { ...err, startDate: 'Start date should be greater than today' }
		}
		if (!endDate) err = { ...err, endDate: 'End date is required' }
		else if (startDate > endDate) err = { ...err, endDate: 'End date should be greater than start date' }
		else if (new Date(endDate) < new Date()) err = { ...err, endDate: 'End date should be greater than today' }
		if (Object.keys(err).length) return setErrors(err)
		newCoupon.mutate({ code, discount, maxDiscount, minPurchase, startDate, endDate })
	}

	return (
		<Modal isOpen={isOpen} onClose={onClose}>
			<ModalContent>
				{(onClose) => (
					<>
						<ModalHeader className="flex flex-col gap-1">Create a coupon</ModalHeader>
						<ModalBody>
							<div className="flex flex-col gap-4">
								<Input
									label="Coupon Code"
									radius="none"
									placeholder=" "
									labelPlacement="outside"
									value={code}
									onChange={(e) => {
										setErrors({ ...errors, code: '' })
										setCode(e.target.value.toUpperCase())
									}}
									errorMessage={errors.code}
								/>
								<Input
									label="Discount (%)"
									type="number"
									radius="none"
									placeholder=" "
									labelPlacement="outside"
									value={discount}
									onChange={(e) => {
										setErrors({ ...errors, discount: '' })
										setDiscount(e.target.value)
									}}
									errorMessage={errors.discount}
								/>
								<Input
									isClearable
									type="number"
									label="Maximum Discount"
									radius="none"
									placeholder=""
									labelPlacement="outside"
									startContent={
										<div className="pointer-events-none flex items-center">
											<span className="text-default-400 text-small">₹</span>
										</div>
									}
									value={maxDiscount}
									onChange={(e) => {
										setErrors({ ...errors, maxDiscount: '' })
										setMaxDiscount(e.target.value)
									}}
									errorMessage={errors.maxDiscount}
								/>
								<Input
									isClearable
									type="number"
									label="Minimum Purchase Amount"
									radius="none"
									placeholder=""
									labelPlacement="outside"
									startContent={
										<div className="pointer-events-none flex items-center">
											<span className="text-default-400 text-small">₹</span>
										</div>
									}
									value={minPurchase}
									onChange={(e) => {
										setErrors({ ...errors, minPurchase: '' })
										setMinPurchase(e.target.value)
									}}
									errorMessage={errors.minPurchase}
								/>
								<div className="flex gap-2 [&>*]:flex-grow">
									<Input
										type="date"
										label="Start Date"
										radius="none"
										placeholder=" "
										labelPlacement="outside"
										value={startDate}
										onChange={(e) => {
											setErrors({ ...errors, startDate: '' })
											setStartDate(e.target.value)
										}}
										errorMessage={errors.startDate}
									/>
									<Input
										type="date"
										label="End Date"
										radius="none"
										placeholder=" "
										labelPlacement="outside"
										value={endDate}
										onChange={(e) => {
											setErrors({ ...errors, endDate: '' })
											setEndDate(e.target.value)
										}}
										errorMessage={errors.endDate}
									/>
								</div>
							</div>
						</ModalBody>
						<ModalFooter>
							<Button variant="light" onPress={onClose}>
								Close
							</Button>
							<Button isLoading={newCoupon?.isPending} color="primary" onPress={handleSubmit}>
								Create
							</Button>
						</ModalFooter>
					</>
				)}
			</ModalContent>
		</Modal>
	)
}
