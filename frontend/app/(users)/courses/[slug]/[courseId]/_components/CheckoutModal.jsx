import { createStripeSession } from '@/apis/courses'
import { getCourseCoupons } from '@/apis/promotions'
import CreditCard from '@/components/CreditCard'
import {
	Accordion,
	AccordionItem,
	Button,
	Input,
	Modal,
	ModalBody,
	ModalContent,
	ModalFooter,
	ModalHeader,
	ScrollShadow,
	Spacer,
	Spinner,
} from '@nextui-org/react'
import { useMutation, useQuery } from '@tanstack/react-query'
import { Space } from 'lucide-react'
import Image from 'next/image'
import React, { useEffect, useState } from 'react'
import toast from 'react-hot-toast'

export default function CheckoutModal({ isOpen, onClose, course }) {
	const [code, setCode] = useState('')
	const [errors, setErrors] = useState({ code: '' })
	const [accordionKey, setAccordionKey] = useState('items')
	const [finalPrice, setFinalPrice] = useState(course?.price || 0)
	const [couponSuccess, setCouponSuccess] = useState(false)

	const {
		data,
		isPending: isLoadingCoupons,
		isError: isErrorCoupons,
	} = useQuery({
		queryKey: ['coupons'],
		queryFn: () => getCourseCoupons(course?.teacher?._id),
		keepPreviousData: true,
	})

	const { isPending: isLoadingStripeSession, mutate: mutateStripeSession } = useMutation({
		mutationFn: createStripeSession,
		onSuccess: (data) => {
			// toast.loading('Redirecting to payment gateway...')
			toast((t) => (
				<div className="flex flex-col gap-4">
					<CreditCard />
					<p className="font-medium">Use this card for checkout</p>
					<div className="flex gap-2 items-center">
						<Spinner size="sm" />
						<p>Redirecting...</p>
					</div>
				</div>
			))
			setTimeout(() => (window.location.href = data.sessionUrl), 5000)
		},
		onError: (error) => {
			const err = error?.response?.data?.errors
			if (err) setErrors(err)
			else toast.error(error?.response?.data?.message || 'Something went wrong')
		},
	})

	const handleApplyCoupon = () => {
		setErrors({})
		setCode((prev) => prev.trim())
		if (!code) return setErrors({ code: 'Please enter a valid coupon code' })
		const coupon = data?.coupons?.find((coupon) => coupon?.code === code)
		if (!coupon) return setErrors({ code: 'The coupon code is invalid' })
		const price = course?.price
		if (coupon?.minPurchase > price)
			return setErrors({ code: `This coupon is only applicable to courses above ₹${coupon?.minPurchase}` })

		setAccordionKey('')
		setFinalPrice((prev) => price - (price * coupon?.discount) / 100)
		setCouponSuccess(true)
	}

	const handlePayment = () => {
		if (code) handleApplyCoupon()
		if (!errors?.code) mutateStripeSession({ courseId: course?._id, code })
	}

	useEffect(() => {
		if (errors?.code) {
			setCouponSuccess(false)
			setFinalPrice(course?.price)
		}
	}, [errors])

	useEffect(() => {
		setCouponSuccess(false)
		setFinalPrice(course?.price)
	}, [code])

	return (
		<Modal isOpen={isOpen} onClose={onClose} isDismissable>
			<ModalContent>
				{(onClose) => (
					<>
						<ModalHeader className="flex flex-col gap-1">Proceed to Checkout</ModalHeader>
						<ModalBody>
							<div className="flex justify-start items-start gap-2">
								<Image
									src={course?.thumbnail}
									width={150}
									height={90}
									className="w-[150px] h-[90px] border border-default-100 object-cover"
								/>
								<div className="flex flex-col gap-1">
									<p className="text-base font-medium">{course?.title}</p>
									<p className="mt-1 text-tiny font-normal text-default-500 ellipsis-container">
										{course?.description}
									</p>
									<p className="text-base font-medium text-default-500">₹{course?.price}</p>
								</div>
							</div>
							<div className="flex gap-2 items-end">
								<Input
									label="Apply Coupon Code"
									variant="underlined"
									color="primary"
									classNames={{
										inputWrapper: 'text-default-500',
									}}
									value={code}
									onChange={(e) => {
										setCode(e.target.value.toUpperCase())
										setErrors({})
									}}
									isInvalid={errors?.code}
									size="md"
								/>
								<Button
									color="primary"
									size="md"
									variant="ghost"
									onClick={handleApplyCoupon}
									className="font-medium">
									Apply
								</Button>
							</div>
							{errors?.code && <p className="text-tiny text-danger-500 -mt-2">{errors?.code}</p>}
							{couponSuccess && (
								<div className="flex items-center gap-2 -mt-2">
									<p className="text-tiny text-success-500">{`Coupon ${code} applied!`}</p>
									<p
										className="text-tiny underline cursor-pointer"
										onClick={() => {
											setCode('')
											setFinalPrice(course?.price)
											setCouponSuccess(false)
										}}>
										Clear
									</p>
								</div>
							)}
							<div>
								<Accordion
									isCompact={true}
									showDivider={false}
									defaultSelectedKeys={[accordionKey]}
									selectionMode="single"
									className="whitespace-nowrap"
									itemClasses={{
										base: '',
										title: 'text-default-900 text-small font-semibold',
										trigger: 'w-fit',
										content: 'text-default-700',
									}}>
									<AccordionItem key="items" aria-label="all coupons" title="View Coupons">
										<ScrollShadow className="h-[180px]">
											<div className="flex flex-col gap-3">
												{data &&
													data?.coupons.map((coupon) => {
														return (
															<div
																className="flex border-2 border-dotted gap-4 cursor-pointer hover:bg-default-100"
																onClick={() => {
																	setErrors({})
																	setCode(coupon?.code)
																	setAccordionKey('')
																	// handleApplyCoupon(coupon?.code)
																}}>
																<div className="relative border-e-2 border-dotted w-14 h-20 py-8">
																	<p className="absolute inset-0 font-medium text-base text-default-500 -rotate-90 py-6">
																		{coupon?.discount}% off
																	</p>
																</div>
																<div className="flex flex-col justify-between py-3">
																	<div className="flex justify-between items-center">
																		<p className="font-medium text-xl text-default-500">
																			{coupon?.code}
																		</p>
																	</div>
																	<p className="text-tiny text-default-500">
																		{`Get upto ₹${coupon?.maxDiscount} off on this purchase of ₹${coupon?.minPurchase}`}
																	</p>
																</div>
															</div>
														)
													})}
											</div>
										</ScrollShadow>
									</AccordionItem>
								</Accordion>
							</div>
						</ModalBody>
						<ModalFooter>
							<div className="w-full flex justify-between items-end">
								<div>
									<p className="text-default-500 font-medium text-3xl">₹{finalPrice?.toFixed(2)}</p>
								</div>
								<Button
									isLoading={isLoadingStripeSession}
									color="primary"
									onPress={handlePayment}
									className="text-white font-medium">
									Continue to Payment
								</Button>
							</div>
						</ModalFooter>
					</>
				)}
			</ModalContent>
		</Modal>
	)
}
