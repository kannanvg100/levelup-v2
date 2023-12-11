'use client'
import React, { useEffect, useState } from 'react'
import {
	Navbar,
	NavbarBrand,
	NavbarContent,
	NavbarItem,
	Link,
	Button,
	DropdownItem,
	DropdownTrigger,
	Dropdown,
	DropdownMenu,
	Avatar,
	Input,
} from '@nextui-org/react'
import { ChevronDown, Lock, Activity, Flash, Server, TagUser, Scale, SearchIcon } from './Icons.jsx'
import NextLink from 'next/link'
import Image from 'next/image.js'
import { useDispatch, useSelector } from 'react-redux'
import { useRouter, usePathname } from 'next/navigation'
import { logoutUser } from '@/api/users.js'
import { removeUser } from '@/redux/slices/userSlice.js'
import { QueryClient, useQuery } from '@tanstack/react-query'
import toast from 'react-hot-toast'
import { useTheme } from 'next-themes'
import InstantSearch from './InstantSearch.jsx'
import { getPublishedCategories } from '@/api/categories.js'

export default function Header() {
	const icons = {
		chevron: <ChevronDown fill="currentColor" size={16} />,
		scale: <Scale className="text-warning" fill="currentColor" size={30} />,
		lock: <Lock className="text-success" fill="currentColor" size={30} />,
		activity: <Activity className="text-secondary" fill="currentColor" size={30} />,
		flash: <Flash className="text-primary" fill="currentColor" size={30} />,
		server: <Server className="text-success" fill="currentColor" size={30} />,
		// user: <TagUser className="text-danger" fill="currentColor" size={30} />,
	}

	const { user } = useSelector((state) => state.user)

	const dispatch = useDispatch()
	const router = useRouter()
	const { theme, setTheme } = useTheme()
	const onChange = () => (theme === 'light' ? setTheme('dark') : setTheme('light'))
	const queryClient = new QueryClient()
	const [query, setQuery] = useState('')
	const pathname = usePathname()

	const handleLogout = async (e) => {
		try {
			const res = await queryClient.fetchQuery({
				queryFn: () => logoutUser('user'),
                queryKey: ['logout', 'user'],
			})
			if (res?.success) {
				dispatch(removeUser())
				toast.success('Logged out successfully')
			} else toast.error('Something went wrong, please try again later')
		} catch (error) {
			toast.error('Something went wrong, please try again later')
		}
	}

	const handleHomeButton = () => {
		router.push('/')
	}

	const {
		data: categories,
		isPending,
		isError,
	} = useQuery({
		queryKey: ['categories'],
		queryFn: () => getPublishedCategories(),
		keepPreviousData: true,
	})

	return (
		<Navbar maxWidth="xl">
			<NavbarContent justify="center">
				<NextLink href="/">
					<Image src="/logo.svg" alt="logo" width={100} height={100} className="cursor-pointer" />
				</NextLink>
				<Dropdown radius='none'>
					<NavbarItem>
						<DropdownTrigger>
							<Button
								disableRipple
								className="p-0 bg-transparent data-[hover=true]:bg-transparent font-medium text-default-700"
								endContent={icons.chevron}
								radius="none"
								variant="light">
								Categories
							</Button>
						</DropdownTrigger>
					</NavbarItem>
					<DropdownMenu
						aria-label="ACME features"
						className="w-[340px] text-default-500"
						itemClasses={{
							base: 'gap-4',
						}}>
						{categories &&
							categories?.map((category) => (
								<DropdownItem key="autoscaling" description={category?.description}>
									<span className="text-default-700 font-normal">{category?.title}</span>
								</DropdownItem>
							))}
					</DropdownMenu>
				</Dropdown>
			</NavbarContent>
			<NavbarContent as="div" className="hidden md:flex items-center flex-grow max-w-[500px]" justify="start">
				<InstantSearch />
			</NavbarContent>

			{user && user?.role === 'user' && (
				<NavbarContent justify="center">
					<NavbarItem className="hidden sm:flex gap-4" isActive>
						<Link as={NextLink} href="/my-courses" aria-current="page" size="sm">
							My Courses
						</Link>
					</NavbarItem>
					<NavbarItem>
						<Dropdown placement="bottom-end" radius='none'>
							<DropdownTrigger>
								<Avatar
									as="button"
									className="transition-transform"
									name={user.email.slice(0, 1).toUpperCase()}
									size="md"
									src={user.profileImage}
								/>
							</DropdownTrigger>
							<DropdownMenu aria-label="Profile Actions" variant="flat" className="text-default-500">
								<DropdownItem key="profile" className="h-14 gap-2">
									<p className="font-semibold text-sm">Signed in as</p>
									<p className="font-semibold">{user.email}</p>
								</DropdownItem>
								<DropdownItem key="courses">
									<Link as={NextLink} href="/my-courses" aria-current="page" size="sm">
										<p className="text-default-500">My Courses</p>
									</Link>
								</DropdownItem>
								<DropdownItem key="settings">
									<NextLink href="/settings">
										<p className="text-default-500">Settings</p>
									</NextLink>
								</DropdownItem>
								<DropdownItem key="dark_mode" onClick={onChange}>
									{theme === 'light' ? 'Dark mode' : 'Light Mode'}
								</DropdownItem>
								<DropdownItem key="logout" color="danger" onClick={handleLogout}>
									Log Out
								</DropdownItem>
							</DropdownMenu>
						</Dropdown>
					</NavbarItem>
				</NavbarContent>
			)}

			{!user && user?.role !== 'user' && (
				<NavbarContent as="div" className="items-center" justify="center">
					<NavbarItem className="flex">
						<Link
							as={NextLink}
							href={{
								pathname: '/login',
								query: { ret: pathname || '/' },
							}}
							color="primary"
							variant="flat"
							className="font-bold"
							radius="none"
							size="sm">
							Login
						</Link>
					</NavbarItem>

					<NavbarItem className="hidden lg:flex">
						<Button
							as={NextLink}
							href="/signup"
							color="primary"
							variant="flat"
							className="font-bold"
							radius="none"
							size="sm">
							Sign Up
						</Button>
					</NavbarItem>
				</NavbarContent>
			)}
		</Navbar>
	)
}
