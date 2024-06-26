'use client'
import React from 'react'
import {
	Navbar,
	Link,
	Button,
	DropdownItem,
	DropdownTrigger,
	Dropdown,
	DropdownMenu,
	Avatar,
	Popover,
	PopoverTrigger,
	PopoverContent,
} from '@nextui-org/react'

import NextLink from 'next/link'
import Image from 'next/image.js'
import { useDispatch, useSelector } from 'react-redux'
import { usePathname, useRouter } from 'next/navigation'
import { logoutUser } from '@/apis/users.js'
import { removeUser } from '@/redux/slices/userSlice.js'
import { QueryClient, useQuery, useQueryClient } from '@tanstack/react-query'
import toast from 'react-hot-toast'
import { useTheme } from 'next-themes'
import InstantSearch from './InstantSearch.jsx'
import { getPublishedCategories } from '@/apis/categories.js'
import {
	Bookmark,
	ChevronRight,
	ChevronDown,
	ClipboardList,
	LogOut,
	MoonStar,
	Sun,
	User,
	SearchIcon,
} from 'lucide-react'

export default function Header() {
	const { user } = useSelector((state) => state.user)
	const router = useRouter()
	const dispatch = useDispatch()
	const { theme, setTheme } = useTheme()
	const handleThemeChange = () => (theme === 'light' ? setTheme('dark') : setTheme('light'))
	const queryClient = useQueryClient()
	const pathname = usePathname()

	const handleLogout = async () => {
		try {
			const res = await queryClient.fetchQuery({
				queryFn: () => logoutUser('user'),
				queryKey: ['logout', 'user'],
			})
			if (res?.success) {
				dispatch(removeUser())
				toast.success('Logged out successfully')
				router.replace('/')
				queryClient.resetQueries()
			} else toast.error('Something went wrong, please try again later')
		} catch (error) {
			toast.error('Something went wrong, please try again later')
		}
	}

	const { data: categories } = useQuery({
		queryKey: ['categories'],
		queryFn: () => getPublishedCategories(),
		keepPreviousData: true,
        staleTime: Infinity
	})

	return (
		<Navbar maxWidth="xl" className="h-[4rem]">
			<div className="flex flex-col gap-3 w-full">
				<div className="flex justify-between items-center w-full gap-3">
					<div className="flex items-center gap-5">
						<NextLink href="/">
							<Image
								src="/logo.svg"
								alt="logo"
								width={0}
								height={0}
								className="cursor-pointer min-w-[100px] h-auto select-none"
								priority={true}
							/>
						</NextLink>
						<div className="hidden md:block">
							<Dropdown radius="none">
								<DropdownTrigger>
									<Button
										disableRipple
										className="p-0 bg-transparent data-[hover=true]:bg-transparent font-medium text-default-700"
										endContent={<ChevronDown size={16} />}
										radius="none"
										variant="light">
										Categories
									</Button>
								</DropdownTrigger>

								<DropdownMenu
									aria-label="ACME features"
									className=" text-default-500"
									itemClasses={{
										base: 'gap-4',
									}}>
									{categories &&
										categories?.map((category) => (
											<DropdownItem key="autoscaling">
												<Link
													as={NextLink}
													href={`/courses?filter=category%3D${category?._id}`}
													key={category?._id}>
													<div className="group min-w-[200px] flex justify-between items-center ps-2">
														<span className="text-default-500 text-small group-hover:text-default-700">
															{category?.title}
														</span>
														<ChevronRight
															size={16}
															className="text-default-300 group-hover:text-default-500"
														/>
													</div>
												</Link>
											</DropdownItem>
										))}
								</DropdownMenu>
							</Dropdown>
						</div>
					</div>

					<div className="hidden md:block flex-grow max-w-[500px]">
						<InstantSearch />
					</div>

					<div className="flex justify-center items-center gap-4">
						<div className="block md:hidden">
							<Popover
								placement="bottom-start"
								backdrop="blur"
								shouldCloseOnInteractOutside={true}
								shouldBlockScroll={true}>
								<PopoverTrigger>
									<SearchIcon size={20} />
								</PopoverTrigger>
								<PopoverContent>
									<div className="w-[85vw] flex justify-center">
										<InstantSearch />
									</div>
								</PopoverContent>
							</Popover>
						</div>

						<div
							onClick={handleThemeChange}
							className="hidden md:flex px-2 relative flex-row items-center h-10 cursor-pointer focus:outline-none">
							<span className="inline-flex justify-center items-center">
								{theme === 'dark' ? <Sun size={20} /> : <MoonStar size={20} />}
							</span>
						</div>

						{user && user?.role === 'user' && (
							<>
								<Link
									as={NextLink}
									href="/profile/courses"
									aria-current="my courses"
									size="sm"
									className="hidden lg:block text-default-700 font-medium hover:text-primary select-none whitespace-nowrap">
									My Courses
								</Link>

								<Link
									as={NextLink}
									href="/profile/favorites"
									aria-current="favorites"
									size="sm"
									className="hidden md:block text-default-700 hover:text-primary">
									<Bookmark size={20} />
								</Link>

								<Dropdown placement="bottom-end" radius="none">
									<DropdownTrigger>
										<Avatar
											as="button"
											className="transition-transform select-none"
											name={user.email.slice(0, 1).toUpperCase()}
											size="sm"
											src={user.profileImage}
										/>
									</DropdownTrigger>
									<DropdownMenu
										aria-label="Profile Actions"
										variant="flat"
										className="text-default-500">
										<DropdownItem key="profile" className="h-14 gap-2">
											<p className="font-semibold">{user.name || 'User'}</p>
											<p className="text-default-500 italic">{user.email}</p>
										</DropdownItem>
										<DropdownItem key="courses">
											<NextLink href="/profile/courses" aria-current="page" size="sm">
												<div className="flex items-center gap-2 py-1 font-medium">
													<ClipboardList size={16} />
													<p>My Courses</p>
												</div>
											</NextLink>
										</DropdownItem>
										<DropdownItem key="account">
											<NextLink href="/profile/account">
												<div className="flex items-center gap-2 py-1 font-medium">
													<User size={16} />
													<p>Account</p>
												</div>
											</NextLink>
										</DropdownItem>
										<DropdownItem key="favorites" className="md:hidden">
											<NextLink href="/profile/favorites">
												<div className="flex items-center gap-2 py-1 font-medium">
													<Bookmark size={16} />
													<p>Favorites</p>
												</div>
											</NextLink>
										</DropdownItem>
										<DropdownItem key="favorites" className="md:hidden">
											<div
												onClick={handleThemeChange}
												className="cursor-pointer focus:outline-none">
												{theme === 'dark' ? (
													<div className="flex items-center gap-2 py-1 font-medium">
														<Sun size={16} />
														<p>Light mode</p>
													</div>
												) : (
													<div className="flex items-center gap-2 py-1 font-medium">
														<MoonStar size={16} />
														<p>Dark mode</p>
													</div>
												)}

												{/* <span className="inline-flex justify-center items-center">
													{theme === 'dark' ? <MoonStar size={20} /> : <Sun size={20} />}
												</span> */}
											</div>
										</DropdownItem>
										<DropdownItem key="logout" color="danger" onClick={handleLogout}>
											<div className="flex items-center gap-2 py-1 font-medium whitespace-nowrap">
												<LogOut size={16} />
												<p>Log Out</p>
											</div>
										</DropdownItem>
									</DropdownMenu>
								</Dropdown>
							</>
						)}

						{!user && user?.role !== 'user' && (
							<div className="flex justify-center items-center gap-3">
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

								<div className="hidden md:block">
									<Button
										as={NextLink}
										href="/signup"
										color="primary"
										variant="flat"
										className="font-bold whitespace-nowrap"
										radius="none"
										size="sm">
										Sign Up
									</Button>
								</div>
							</div>
						)}
					</div>
				</div>
				{/* <div className="block md:hidden w-full"><InstantSearch /></div> */}
			</div>
		</Navbar>
	)
}
