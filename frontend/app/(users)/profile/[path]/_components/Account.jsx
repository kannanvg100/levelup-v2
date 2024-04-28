'use client'
import React, { useRef, useState } from 'react'
import { Button, Input, Card, CardBody, Spacer, Image } from '@nextui-org/react'
import { useDispatch, useSelector } from 'react-redux'
import { useMutation } from '@tanstack/react-query'
import { useRouter } from 'next/navigation'
import { addUser } from '@/redux/slices/userSlice'
import { ImagePlus } from 'lucide-react'
import { updateProfile } from '@/apis/users'
import toast from 'react-hot-toast'

export default function Account() {
	const { user } = useSelector((state) => state.user)

	const [name, setName] = useState(user?.name)
	const [email, setEmail] = useState(user?.email)
	const [password, setPassword] = useState('')
	const [confirmPassword, setConfirmPassword] = useState('')
	const [profileImage, setProfileImage] = useState('')
	const [showPassword, setShowPassword] = useState(false)

	const displayImage = useRef()
	const imageInput = useRef()

	const [errors, setErrors] = useState({ email: '', password: '' })

	const { isPending, mutate } = useMutation({
		mutationFn: updateProfile,
		onSuccess: (data) => {
			dispatch(addUser(data.user))
			// queryClient.setQueryData(['user', { email, password }], data)
			toast.success('Profile updated successfully.')
			router.push('/')
		},
		onError: (error) => {
			setErrors(error?.response?.data?.errors)
		},
	})

	const router = useRouter()
	const dispatch = useDispatch()

	const handleSubmit = async () => {
		if (!name || !name.trim()) return setErrors({ ...errors, name: 'Name is required' })
		if (password !== confirmPassword) return setErrors({ ...errors, confirmPassword: 'Password does not match' })

		mutate({ name, password, confirmPassword, profileImage })
	}

	if (!user) return null

	return (
		<div className="flex h-full">
			<div className="w-[400px]">
				<Spacer y={2} />
				<div className="flex justify-center">
					<div className="group/item relative cursor-pointer inline-block">
						<Image
							width={100}
							height={100}
							ref={displayImage}
							src={user?.profileImage}
							fallbackSrc="/default_avatar.png"
							alt="logo"
							className="rounded-full w-[100px] h-[100px] cursor-pointer object-cover"
						/>
						<div
							className="group/edit absolute inset-0 flex bg-black bg-opacity-30 rounded-full justify-center items-center invisible shadow-sm group-hover/item:visible"
							onClick={() => imageInput.current.click()}>
							<ImagePlus color="#fff" size={36} />
						</div>
						<input
							type="file"
							ref={imageInput}
							name="image"
							className="hidden"
							onChange={(e) => {
								const file = e.target.files[0]
								setProfileImage(file)
								const reader = new FileReader()
								reader.onload = () => {
									displayImage.current.src = reader.result
								}
								reader.readAsDataURL(file)
							}}></input>
					</div>
				</div>

				<Spacer y={2} />

				<div className="flex flex-col justify-end gap-2">
					<Input
						label="Name"
						variant="bordered"
						classNames={{
							inputWrapper: 'text-default-500',
						}}
						value={name}
						onChange={(e) => {
							setName(e.target.value)
							setErrors({ ...errors, name: '' })
						}}
						errorMessage={errors?.name}
						size="sm"
					/>

					{showPassword && (
						<>
							<Input
								label="Password"
								type="password"
								variant="bordered"
								classNames={{
									inputWrapper: 'text-default-500',
								}}
								onChange={(e) => {
									setPassword(e.target.value)
									setErrors({ ...errors, password: '' })
								}}
								errorMessage={errors?.password}
								size="sm"
							/>

							<Input
								label="Confirm Password"
								type="password"
								variant="bordered"
								classNames={{
									inputWrapper: 'text-default-500',
								}}
								onChange={(e) => {
									setConfirmPassword(e.target.value)
									setErrors({ ...errors, confirmPassword: '' })
								}}
								errorMessage={errors?.confirmPassword}
								size="sm"
							/>
						</>
					)}

					{!showPassword && (
						<p
							className="self-start cursor-pointer text-primary underline font-medium text-sm"
							onClick={() => setShowPassword(true)}>
							Change Password
						</p>
					)}

					<Button
						className="self-end"
						isLoading={isPending}
						color="primary"
						variant="bordered"
						size="md"
						onClick={handleSubmit}>
						Update
					</Button>
				</div>
			</div>
		</div>
	)
}
