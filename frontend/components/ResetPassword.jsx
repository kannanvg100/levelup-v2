'use client'
import React, { useEffect, useRef, useState } from 'react'
import { Button, Input, Link, Card, CardBody, Spacer } from '@nextui-org/react'
import NextLink from 'next/link'
import { useDispatch } from 'react-redux'
import { QueryClient, useMutation } from '@tanstack/react-query'
import { resetSendOtp, checkOtp, resetPassword } from '@/api/users'
import { useRouter, useSearchParams } from 'next/navigation'
import { toast } from 'react-hot-toast'
import Image from 'next/image'

export default function ResetPassword({ email: _email, role }) {
	const router = useRouter()
	const searchParams = useSearchParams()

	const [email, setEmail] = useState(_email || '')
	const [password, setPassword] = useState('')
	const [confirmPassword, setConfirmPassword] = useState('')
	const [otp, setOtp] = useState('')
	const [errors, setErrors] = useState({ email: '', password: '' })
    const [state, setState] = useState('email')

	const otpRef = useRef()
	const COUNTER_TIME = 10
	const [countdown, setCountdown] = useState(COUNTER_TIME)

	const { isPending, mutate } = useMutation({
		mutationFn: resetSendOtp,
		onSuccess: () => {
			setCountdown(COUNTER_TIME)
			// otpRef.current.focus()
			toast.success('OTP sent successfully')
			setState('otp')
		},
		onError: (error) => {
			const err = error?.response?.data?.errors
			if (err) setErrors(error.response.data.errors)
			else toast.error(error?.response?.data?.message || 'Something went wrong, please try again later')
		},
	})

	const { isPending: isLoadingCheckOtp, mutate: mutateCheckOtp } = useMutation({
		mutationFn: checkOtp,
		onSuccess: () => {
			setState('password')
		},
		onError: (error) => {
			const err = error?.response?.data?.errors
			if (err) setErrors(error.response.data.errors)
			else toast.error(error?.response?.data?.message || 'Something went wrong, please try again later')
		},
	})

	const { isPending: isLoadingPassword, mutate: mutatePassword } = useMutation({
		mutationFn: resetPassword,
		onSuccess: () => {
			toast.success('Password reset successfully')
			router.push(role === 'teacher' ? '/teacher/login' : '/login')
		},
		onError: (error) => {
			const err = error?.response?.data?.errors
			if (err) setErrors(error.response.data.errors)
			else toast.error(error?.response?.data?.message || 'Something went wrong, please try again later')
		},
	})

	const handleSubmit = async (e) => {
		e.preventDefault()
		if (!email || !email.trim()) return setErrors({ ...errors, email: 'Email is required' })
		mutate({ email })
	}

	const handleReSendOtp = async (e) => {
		e.preventDefault()
		setErrors({ ...errors, otp: '' })
		setOtp('')
		if (email === '') return setErrors({ ...errors, email: 'Please enter your email' })
		else if (email.indexOf('@') === -1 || email.indexOf('.') === -1)
			return setErrors({ ...errors, email: 'Please enter a valid email' })
		if (countdown > 0) return toast.error('Please wait for the timer to run out')
		mutate({ email })
		setCountdown(COUNTER_TIME)
	}

	const handleCheckOtp = async (e) => {
		e.preventDefault()
		if (!otp || !otp.trim()) return setErrors({ ...errors, otp: 'OTP is required' })
		mutateCheckOtp({ email, otp })
	}

	const handleResetPassword = async (e) => {
		e.preventDefault()
		if (!password || !password.trim()) return setErrors({ ...errors, password: 'Password is required' })
		else if (password.length < 4)
			return setErrors({ ...errors, password: 'Password must be at least 4 characters' })
		else if (password !== confirmPassword)
			return setErrors({ ...errors, confirmPassword: 'Password does not match' })
		mutatePassword({ email, otp, password })
	}

	useEffect(() => {
		let timer
		if (countdown > 0) {
			timer = setInterval(() => {
				setCountdown((prevCountdown) => prevCountdown - 1)
			}, 1000)
		}

		return () => clearInterval(timer)
	}, [countdown])

	return (
		<div className="mt-8 flex h-full justify-center items-center">
			<Card className="w-[400px] p-6" radius="none">
				<CardBody>
					<div className="flex justify-center">
						<Image src="/logo.svg" alt="logo" width={100} height={100} />
					</div>
					<Spacer y={10} />
					<h1 className="font-medium text-default-600">Forgot Password</h1>
					<Spacer y={2} />
					{state === 'email' ? (
						<div className="flex flex-col gap-4">
							<Input
								label="Email"
								type="email"
								variant="flat"
								radius="none"
								validate={email}
								classNames={{
									inputWrapper: 'text-default-500',
								}}
								onChange={(e) => {
									setEmail(e.target.value.trim())
									setErrors({ ...errors, email: '' })
								}}
								errorMessage={errors?.email}
								isInvalid={errors?.email ? true : false}
								size="md"
								description="We’ll send a verification code to this email if it matches an existing account."
							/>

							<div className="flex flex-col justify-center items-center gap-4">
								<Button
									className="px-4 font-bold"
									isLoading={isPending}
									color="primary"
									variant="flat"
									radius="none"
									size="md"
									onClick={handleSubmit}>
									Next
								</Button>
								<Link
									href={role === 'teacher' ? '/teacher' : '/'}
									as={NextLink}
									color="foreground"
									size="sm"
									className="ml-2 underline">
									Back to Home
								</Link>
							</div>
							<Spacer y={2} />
							<div className="flex justify-center items-center gap-2">
								<span className="text-default-500 text-sm">Don&apos;t have an account?</span>
								<Link href={role === 'teacher' ? '/teacher/signup' : '/signup'} as={NextLink} size="sm">
									Signup
								</Link>
							</div>
						</div>
					) : state === 'otp' ? (
						<div className="flex flex-col gap-4">
							<span className="text-xs">
								Please verify your email address. We&apos;ve sent a verification code to {email}.
							</span>
							<span
								className="text-blue-500 text-xs font-bold cursor-pointer underline"
								onClick={() => {
									setErrors({ email: '', password: '', confirmPassword: '', otp: '' })
									setState('email')
								}}>
								Change email address
							</span>
							<Input
								label="OTP"
								variant="flat"
								radius="none"
								value={otp}
								classNames={{
									inputWrapper: 'text-default-500',
								}}
								onChange={(e) => {
									setOtp(e.target.value.trim())
									setErrors({ ...errors, otp: '' })
								}}
								errorMessage={errors?.otp}
								isInvalid={errors?.otp ? true : false}
								size="sm"
								ref={otpRef}
							/>
							<div>
								{countdown > 0 ? (
									<p className="text-default-700 text-tiny">{`Resend OTP in ${countdown} seconds`}</p>
								) : (
									<Button
										variant="light"
										size="sm"
										color="primary"
										className="font-bold"
										radius="none"
										isLoading={isPending}
										isDisabled={isPending || countdown > 0}
										onClick={handleReSendOtp}>
										Resend OTP
									</Button>
								)}
							</div>
							<div className="flex justify-center">
								<Button
									className="font-bold"
									isLoading={isLoadingCheckOtp}
									color="primary"
									variant="flat"
									radius="none"
									onClick={handleCheckOtp}
									size="md">
									Continue
								</Button>
							</div>
						</div>
					) : state === 'password' ? (
						<div className="flex flex-col gap-4">
							<Input
								label="Password"
								type="password"
								variant="flat"
								radius="none"
								classNames={{
									inputWrapper: 'text-default-500',
								}}
								onChange={(e) => {
									setPassword(e.target.value.trim())
									setErrors({ ...errors, password: '' })
								}}
								errorMessage={errors?.password}
								isInvalid={errors?.password ? true : false}
								size="md"
							/>
							<Input
								label="Confirm password"
								type="password"
								variant="flat"
								radius="none"
								classNames={{
									inputWrapper: 'text-default-500',
								}}
								onChange={(e) => {
									setConfirmPassword(e.target.value.trim())
									setErrors({ ...errors, confirmPassword: '' })
								}}
								errorMessage={errors?.confirmPassword}
								isInvalid={errors?.confirmPassword ? true : false}
								size="md"
							/>
							<div className="flex justify-center">
								<Button
									className="font-bold"
									isLoading={isLoadingPassword}
									isDisabled={isLoadingPassword}
									color="primary"
									variant="flat"
									radius="none"
									onClick={handleResetPassword}
									size="md">
									Reset Password
								</Button>
							</div>
						</div>
					) : null}
				</CardBody>
			</Card>
		</div>
	)
}
