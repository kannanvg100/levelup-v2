'use client'
import React, { useEffect, useRef, useState } from 'react'
import {
	Button,
	Checkbox,
	Input,
	Spacer,
	Accordion,
	AccordionItem,
	Spinner,
} from '@nextui-org/react'
import { useDispatch, useSelector } from 'react-redux'
import { useMutation } from '@tanstack/react-query'
import { useRouter } from 'next/navigation'
import { addTeacher } from '@/redux/slices/teacherSlice'
import { toast } from 'react-hot-toast'
import Image from 'next/image'
import { ImagePlus } from 'lucide-react'
import { updateProfileTeacher, updateProfileDoc } from '@/api/users'

export default function Login() {
	const { teacher: user } = useSelector((state) => state.teacher)
	const [name, setName] = useState()
	const [password, setPassword] = useState('')
	const [confirmPassword, setConfirmPassword] = useState('')
	const [profileImage, setProfileImage] = useState('')
	const [doc, setDoc] = useState('')
	const [updateType, setUpdateType] = useState('')
	const [isChecked, setIsChecked] = useState(false)

	useEffect(() => {
		setName(user?.name)
	}, [user])

	const displayImage = useRef()
	const imageInput = useRef()

	const [errors, setErrors] = useState({ email: '', password: '' })

	const { isPending, mutate } = useMutation({
		mutationFn: updateProfileTeacher,
		onSuccess: (data) => {
			dispatch(addTeacher(data.user))
			setUpdateType('')
			toast.success('Profile updated successfully')
		},
		onError: (error) => {
			setErrors(error?.response?.data?.errors)
			if (error?.response?.data?.message) toast.error(error?.response?.data?.message)
			setUpdateType('')
		},
	})

	const { isPending:isLoadingDoc, mutate: mutateDoc } = useMutation({
		mutationFn: updateProfileDoc,
		onSuccess: (data) => {
			setUpdateType('')
			toast.success('Document submitted successfully')
		},
		onError: (error) => {
			setErrors(error?.response?.data?.errors)
			if (error?.response?.data?.message) toast.error(error?.response?.data?.message)
			setUpdateType('')
		},
	})

	const router = useRouter()
	const dispatch = useDispatch()

	const handleUpdateName = async () => {
		if (!name || !name.trim()) return setErrors({ ...errors, name: 'Name is required' })
		setUpdateType('name')
		mutate({ name })
	}

	const handleUpdatePassword = async () => {
		if (!password || !password.trim()) return setErrors({ ...errors, password: 'Password is required' })
		if (!confirmPassword || !confirmPassword.trim())
			return setErrors({ ...errors, confirmPassword: 'Pls confirm your password' })
		if (password.trim() !== confirmPassword.trim())
			return setErrors({ ...errors, confirmPassword: 'Password does not match' })

		setUpdateType('password')
		mutate({ password, confirmPassword })
	}

	const docRef = useRef()
	const handleDocSelect = () => {
		docRef.current.click()
	}

	const handleUpdateDoc = async () => {
		if (!isChecked) return toast.error('Please accept the declaration')
		if (!doc) return toast.error('Please select a document')
		setUpdateType('doc')
		mutateDoc({ doc })
	}

	return (
		<div className="max-w-[420px] mx-auto mt-6">
			<div className="flex justify-center">
				<div className="group/item relative cursor-pointer inline-block">
					<Image
						width={100}
						height={100}
						ref={displayImage}
						src={user?.profileImage ? user?.profileImage : '/default_avatar.png'}
						alt="logo"
						className="rounded-full w-[100px] h-[100px] cursor-pointer object-cover"
					/>
					<div
						className="group/edit absolute inset-0 flex bg-black bg-opacity-30 rounded-full justify-center items-center invisible shadow-sm group-hover/item:visible"
						onClick={() => imageInput.current.click()}>
						{!isPending && updateType !== 'img' && <ImagePlus color="#fff" size={36} />}
					</div>
					<div
						className="absolute inset-0 flex bg-black bg-opacity-30 rounded-full justify-center items-center shadow-sm"
						onClick={() => imageInput.current.click()}>
						{isPending && updateType === 'img' && <Spinner size="lg" />}
					</div>
					<input
						type="file"
						ref={imageInput}
						name="image"
						className="hidden"
						onChange={(e) => {
							const file = e.target.files[0]
							if (file.size > 3000000) return toast.error('File size should be less than 3MB')
							setProfileImage(file)
							const reader = new FileReader()
							reader.onload = () => {
								displayImage.current.src = reader.result
							}
							reader.readAsDataURL(file)
							setUpdateType('img')
							mutate({ profileImage: file })
						}}></input>
				</div>
			</div>

			<Spacer y={6} />

			<Accordion isCompact={true} showDivider={false} defaultSelectedKeys={['1', '3']} selectionMode="single">
				<AccordionItem key="1" aria-label="Personal" title="Personal">
					<div className="flex flex-col items-center gap-4">
						<Input
							label="Name"
							variant="flat"
							radius="none"
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
						<Button
							className="px-4 font-bold"
							radius="none"
							isLoading={updateType === 'name' && isPending}
							color="primary"
							variant="bordered"
							onClick={handleUpdateName}>
							Update
						</Button>
					</div>
				</AccordionItem>
				<AccordionItem key="2" aria-label="Security" title="Security">
					<div className="flex flex-col items-center gap-4">
						<Input
							label="Password"
							type="password"
							variant="flat"
							radius="none"
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
							variant="flat"
							radius="none"
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

						<Button
							className="px-4 font-bold"
							radius="none"
							isLoading={updateType === 'password' && isPending}
							color="primary"
							variant="bordered"
							onClick={handleUpdatePassword}>
							Update
						</Button>
					</div>
				</AccordionItem>
				<AccordionItem key="3" aria-label="Documents" title="Documents">
					<div className="flex flex-col items-center gap-4">
						<div
							className="bg-default-100 h-12 flex items-center cursor-pointer text-default-500 px-4 w-full"
							onClick={handleDocSelect}>
							<p className="text-sm">{doc ? doc?.name : 'No document selected'}</p>
						</div>
						<p className="text-tiny -mt-1 self-start">
							Upload your qualification documents for verification purpose.
						</p>
						<input
							type="file"
							name="file"
							ref={docRef}
							className="hidden"
							onChange={() => {
								if (docRef.current.files[0].size > 10000000) {
									return toast.error('File size should be less than 10MB')
								}
								setDoc(docRef.current.files[0])
							}}
						/>
						<Checkbox
							radius="none"
							className="self-start text-tiny"
							onChange={(e) => setIsChecked(e.target.checked)}>
							<p className="text-tiny max-w-[350px]">
								I hereby declare that the information given above is true to the best of my knowledge
								and belief.
							</p>
						</Checkbox>
						<Button
							className="px-4 font-bold"
							radius="none"
							isLoading={updateType === 'doc' && isLoadingDoc}
							color="primary"
							variant="bordered"
							onClick={handleUpdateDoc}>
							Update
						</Button>
					</div>
				</AccordionItem>
			</Accordion>
		</div>
	)
}
