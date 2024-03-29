'use client'
import React, { useEffect, useState } from 'react'
import { Button, Input, Link, Card, CardBody, Divider, Spacer } from '@nextui-org/react'
import NextLink from 'next/link'
import { useDispatch } from 'react-redux'
import { QueryClient, useMutation } from '@tanstack/react-query'
import { loginUser, socialLoginUser } from '@/api/users'
import { useRouter } from 'next/navigation'
import { useGoogleLogin } from '@react-oauth/google'
import { addTeacher } from '@/redux/slices/teacherSlice'
import { addUser } from '@/redux/slices/userSlice'
import GoogleLogin from '@/components/GoogleLogin'
import { toast } from 'react-hot-toast'
import Image from 'next/image'

export default function Login({ role, onClose }) {
	const [email, setEmail] = useState('test@levelup-live.online')
	const [password, setPassword] = useState('1111')
	const [errors, setErrors] = useState({ email: '', password: '' })
	const queryClient = new QueryClient()
	const { isPending: isLoadingLogin, mutate: mutateLoginUser } = useMutation({
		mutationFn: loginUser,
		onSuccess: (data) => {
			dispatch(role === 'teacher' ? addTeacher(data.user) : addUser(data.user))
			queryClient.setQueryData(['role', { email, password }], data)
			onClose()
		},
		onError: (error) => {
			const errors = error?.response?.data?.errors
			if (errors) setErrors(errors)
			else toast.error('Something went wrong, Please try again later')
		},
	})
	const { isPending: isLoadingSocialLogin, mutate: mutateSocialLogin } = useMutation({
		mutationFn: socialLoginUser,
		onSuccess: (data) => {
			dispatch(role === 'teacher' ? addTeacher(data.user) : addUser(data.user))
			onClose()
		},
		onError: (error) => {
			const errorMessage = error?.response?.data?.errors
			setErrors(errorMessage)
		},
	})

	const router = useRouter()
	const dispatch = useDispatch()

	useEffect(() => {
		if (errors?.toast) {
			toast.error(errors?.toast)
			setErrors({ ...errors, toast: '' })
		}
	}, [errors])

	const handleSubmit = async (e) => {
		e.preventDefault()
		let newErrors = {}
		if (email === '') newErrors.email = 'Please enter your email'
		else if (email.indexOf('@') === -1 || email.indexOf('.') === -1) newErrors.email = 'Please enter a valid email'
		if (password === '') newErrors.password = 'Please enter your password'

		if (Object.keys(newErrors).length === 0) mutateLoginUser({ email, password, role })
		else setErrors(newErrors)
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

	return (
		<div className="flex h-full justify-center items-center">
			<Card className="w-[400px] p-6" radius="none">
				<CardBody>
					<div className="flex justify-center pb-8">
						<Image src="/logo.svg" alt="logo" width={100} height={100} />
					</div>

					<Spacer y={4} />
					<GoogleLogin isLoading={isLoadingSocialLogin} loginwithGoogle={loginwithGoogle} />

					<Spacer y={10} />
					<div className="relative">
						<Divider className="h-[1px] bg-default-200" />
						<span className="bg-background dark:bg-default-50 px-4 text-center font-bold text-sm whitespace-nowrap text-default-500 absolute left-[50%] top-[50%] translate-x-[-50%] translate-y-[-50%]">
							OR LOGIN WITH EMAIL
						</span>
					</div>

					<Spacer y={10} />
					<div className="flex flex-col gap-4">
						<Input
							label="Email"
							type="email"
							variant="flat"
							radius="none"
                            value={email}
							classNames={{
								inputWrapper: 'text-default-500',
								input: 'bg-red-100',
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
                            value={password}
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
						<div className="flex py-2 px-1 justify-between">
							{/* <Checkbox
								size="md"
								radius="none"
								classNames={{
									label: 'text-small',
								}}>
								Remember me
							</Checkbox> */}
							<div></div>
							<Link
								as={NextLink}
								href={{
									pathname: role === 'teacher' ? '/teacher/reset' : 'reset',
									query: { email, role },
								}}
								size="sm">
								Forgot password?
							</Link>
						</div>

						<div className="flex justify-center">
							<Button
								className="px-4 font-bold"
								isLoading={isLoadingLogin}
								color="primary"
								variant="flat"
								radius="none"
								size="md"
								onClick={handleSubmit}>
								Sign in
							</Button>
						</div>
						<Spacer y={2} />
						<div className="flex justify-center items-center gap-2">
							<span className="text-default-500 text-sm">Don&apos;t have an account?</span>
							<Link href={role === 'user' ? '/signup' : '/teacher/signup'} as={NextLink} size="sm">
								Signup
							</Link>
						</div>
					</div>
				</CardBody>
			</Card>
		</div>
	)
}
