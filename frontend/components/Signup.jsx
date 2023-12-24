'use client'
import React, { useEffect, useRef, useState } from 'react'
import { Button, Input, Link, Card, CardBody, Divider, Spacer } from '@nextui-org/react'
import NextLink from 'next/link'
import { useDispatch } from 'react-redux'
import { useRouter } from 'next/navigation'
import toast from 'react-hot-toast'
import GoogleLogin from '@/components/GoogleLogin'
import { useGoogleLogin } from '@react-oauth/google'
import { addUser } from '@/redux/slices/userSlice'
import { addTeacher } from '@/redux/slices/teacherSlice'
import Image from 'next/image'
import { useMutation } from '@tanstack/react-query'
import { socialLoginUser, sendOtp, signupUser } from '@/api/users'
import RecaptchaVerify from '@/components/RecaptchaVerify'
import { useTheme } from 'next-themes'

export default function Signup({ role }) {
	const [email, setEmail] = useState('')
	const [password, setPassword] = useState('')
	const [confirmPassword, setConfirmPassword] = useState('')
	const [otp, setOtp] = useState('')
	const [code, setCode] = useState('')
	const [errors, setErrors] = useState({ email: '', password: '', confirmPassword: '', otp: '' })
	const [otpSent, setOtpSent] = useState(false)
	const otpRef = useRef(null)
	const COUNTER_TIME = 10
	const [countdown, setCountdown] = useState(COUNTER_TIME)
	const { theme } = useTheme()

	const router = useRouter()
	const dispatch = useDispatch()

	useEffect(() => {
		if (errors?.toast) {
			toast.error(errors?.toast)
			setErrors({ ...errors, toast: '' })
		}
	}, [errors])

	const { isPending: isLoadingSocialLogin, mutate: mutateSocialLogin } = useMutation({
		mutationFn: socialLoginUser,
		onSuccess: (data) => {
			dispatch(login(data.user))
			router.replace(role === 'teacher' ? '/teacher/profile' : '/')
		},
		onError: (error) => {
			let errors = error?.response?.data?.errors
			if (error) setErrors(errors)
			else toast.error('Something went wrong')
		},
	})

	const { isPending: isLoadingSendOtp, mutate: mutateSendOtp } = useMutation({
		mutationFn: sendOtp,
		onSuccess: (data) => {
			setCountdown(COUNTER_TIME)
			setOtpSent(true)
			toast.success('OTP sent successfully')
		},
		onError: (error) => {
			let errors = error?.response?.data?.errors
			if (error) setErrors(errors)
			else toast.error('Something went wrong')
		},
	})

	const { isPending: isLoadingSignup, mutate: mutateSignup } = useMutation({
		mutationFn: signupUser,
		onSuccess: (data) => {
			const user = data?.user
			if (user) dispatch(role === 'teacher' ? addTeacher(user) : addUser(user))
			router.replace(role === 'teacher' ? '/teacher/profile' : '/')
		},
		onError: (error) => {
			let errors = error?.response?.data?.errors
			if (error) setErrors(errors)
			else toast.error('Something went wrong')
		},
	})

	const handleSendOtp = async (e) => {
		e.preventDefault()
		if (email === '') return setErrors({ ...errors, email: 'Please enter your email' })
		else if (email.indexOf('@') === -1 || email.indexOf('.') === -1)
			return setErrors({ ...errors, email: 'Please enter a valid email' })
		if (password === '') return setErrors({ ...errors, password: 'Please enter your password' })
		if (confirmPassword === '') return setErrors({ ...errors, confirmPassword: 'Please enter your password' })
		if (password !== confirmPassword.trim())
			return setErrors({ ...errors, confirmPassword: 'Passwords do not match' })
		if (code === '') return setErrors({ ...errors, code: 'Please verify you are not a robot' })
		mutateSendOtp({ email, password, role })
	}

	const handleSignupSubmit = async (e) => {
		e.preventDefault()
		if (otp === '') return setErrors({ ...errors, otp: 'Please enter the OTP' })
		mutateSignup({ email, password, otp, role })
	}

	const loginwithGoogle = useGoogleLogin({
		onSuccess: (codeResponse) => {
			handleSocialLogin('google', codeResponse.code)
		},
		flow: 'auth-code',
	})

	const handleSocialLogin = async (type, code) => {
		mutateSocialLogin({ type, code, role })
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

	const handleReSendOtp = async (e) => {
		e.preventDefault()
		if (email === '') return setErrors({ ...errors, email: 'Please enter your email' })
		else if (email.indexOf('@') === -1 || email.indexOf('.') === -1)
			return setErrors({ ...errors, email: 'Please enter a valid email' })
		if (password === '') return setErrors({ ...errors, password: 'Please enter your password' })
		if (confirmPassword === '') return setErrors({ ...errors, confirmPassword: 'Please enter your password' })
		if (password !== confirmPassword.trim())
			return setErrors({ ...errors, confirmPassword: 'Passwords do not match' })
		if (countdown > 0) return toast.error('Please wait for the timer to run out')
		// TODO
		// if(Object.values(errors).length > 0) return toast.error('Please fix the errors')
		// setOtpSent(false)
		mutateSendOtp({ email, password, role })
		setCountdown(COUNTER_TIME)
	}

	return (
		<div className="mt-8 flex h-full justify-center items-center">
			<Card className="w-[400px] p-6" radius="none">
				<CardBody>
					<div className=" flex justify-center pb-8">
						<Image src="/logo.svg" alt="logo" width={100} height={100} />
					</div>
					{!otpSent ? (
						<>
							<Spacer y={4} />
							<GoogleLogin isLoading={isLoadingSocialLogin} loginwithGoogle={loginwithGoogle} />
							<Spacer y={10} />
							<div className="relative">
								<Divider className="h-[1px] bg-default-200" />
								<span className="bg-background dark:bg-default-50 px-4 text-center font-bold text-sm whitespace-nowrap text-default-500 absolute left-[50%] top-[50%] translate-x-[-50%] translate-y-[-50%]">
									OR SIGNUP WITH EMAIL
								</span>
							</div>
							<Spacer y={10} />
							<div className="flex flex-col gap-4">
								<Input
									label="Email"
									variant="flat"
									radius="none"
									value={email}
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
								/>
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
								<RecaptchaVerify theme={theme} setCode={setCode} errors={errors} />
								<div className="flex justify-center">
									<Button
										isLoading={isLoadingSendOtp}
										color="primary"
										variant="flat"
										radius="none"
										size="md"
										className="font-bold"
										onClick={handleSendOtp}>
										Continue
									</Button>
								</div>
								<Spacer y={1} />
								<div className="flex justify-center items-center gap-2">
									<span className="text-default-500 text-sm">Already have an account?</span>
									<Link
										href={role === 'teacher' ? '/teacher/login' : '/login'}
										as={NextLink}
										size="sm">
										<span className="text-sm underline">Login</span>
									</Link>
								</div>
							</div>
						</>
					) : (
						<div className="flex flex-col gap-4">
							<span className="text-xs">
								Please verify your email address. We&apos;ve sent a verification code to {email}.
							</span>
							<span
								className="text-blue-500 text-xs font-bold cursor-pointer underline"
								onClick={() => {
									setErrors({ email: '', password: '', confirmPassword: '', otp: '' })
									setOtpSent(false)
								}}>
								Change email address
							</span>
							<Input
								label="OTP"
								variant="flat"
								radius="none"
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
										isLoading={isLoadingSendOtp}
										isDisabled={isLoadingSendOtp || countdown > 0}
										onClick={handleReSendOtp}>
										Resend OTP
									</Button>
								)}
							</div>
							<div className="flex justify-center">
								<Button
									className="font-bold"
									isLoading={isLoadingSignup}
									color="primary"
									variant="flat"
									radius="none"
									onClick={handleSignupSubmit}
									size="md">
									Signup
								</Button>
							</div>
						</div>
					)}
				</CardBody>
			</Card>
		</div>
	)
}
