'use client'

import { logoutUser } from '@/api/admin'
import { logout } from '@/redux/slices/adminSlice'
import { Accordion, AccordionItem, useDisclosure } from '@nextui-org/react'
import {
	Bell,
	BookUser,
	ClipboardList,
	FileBox,
	LogOut,
	MessageSquare,
	MoonStar,
	PieChart,
	Shield,
	Sun,
	User2,
	Users2,
} from 'lucide-react'
import { useTheme } from 'next-themes'
import Image from 'next/image'
import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { useEffect, useMemo, useState } from 'react'
import toast from 'react-hot-toast'
import { QueryClient } from '@tanstack/react-query'
import { useDispatch, useSelector } from 'react-redux'
import LoginModal from './LoginModal.jsx'

export default function Sidebar() {
	const { theme, setTheme } = useTheme()
	const handleThemeChange = () => (theme === 'light' ? setTheme('dark') : setTheme('light'))

	const { admin } = useSelector((state) => state.admin)
	const { isOpen, onOpen, onClose } = useDisclosure()

	const queryClient = new QueryClient()
	const dispatch = useDispatch()
	const router = useRouter()
	const pathname = usePathname()

	useMemo(() => {
		if (!admin) onOpen()
	}, [admin])

	const isActive = (path) => {
		if (pathname === '/admin' && path === '/admin/analytics') return 'text-primary font-medium'
		return pathname.startsWith(path) ? 'text-primary font-medium' : ''
	}

	const handleLogout = async (e) => {
		try {
			const res = await queryClient.fetchQuery({
				queryFn: () => logoutUser('admin'),
				queryKey: ['logout', 'admin'],
			})
			if (res?.success) {
				dispatch(logout())
				toast.success('Logged out successfully')
			} else toast.error('Something went wrong, please try again later')
		} catch (error) {
			toast.error('Something went wrong, please try again later')
		}
	}

	return (
		<div className="flex flex-col">
			<Link href="/admin">
				<Image className="ms-2 mt-6 mb-2" src="/logo.svg" alt="logo" width={100} height={100} />
			</Link>
			<Accordion
				isCompact={true}
				showDivider={false}
				defaultSelectedKeys={'all'}
				selectionMode="multiple"
				className="whitespace-nowrap"
				itemClasses={{
					base: '',
					title: 'text-default-900 text-small font-semibold',
					trigger: 'w-fit',
					content: 'text-default-700',
				}}>
				<AccordionItem key="1" aria-label="Accordion 1" title="Home" className="pb-2">
					<Link
						href="/admin"
						className={`px-2 relative flex flex-row items-center h-10 focus:outline-none hover:bg-default-100 ${isActive(
							'/admin/analytics'
						)}`}>
						<PieChart size={16} />
						<span className="ml-2 text-sm tracking-wide truncate">Analytics</span>
					</Link>
					{/* <Link
						href="#"
						className="px-2 relative flex flex-row items-center h-10 focus:outline-none hover:bg-default-100">
						<MessageSquare size={16} />
						<span className="ml-2 text-sm tracking-wide truncate">Messages</span>
					</Link> */}
					{/* <Link
						href="/admin/notifications"
						className={`px-2 relative flex flex-row items-center h-10 focus:outline-none hover:bg-default-100 ${isActive(
							'/admin/notifications'
						)}`}>
						<Bell size={16} />
						<span className="ml-2 text-sm tracking-wide truncate">Notifications</span>
						<span className="px-2 py-0.5 ml-auto text-xs font-medium tracking-wide text-red-500 bg-red-50 rounded-full">
							1.2k
						</span>
					</Link> */}
				</AccordionItem>
				<AccordionItem key="2" aria-label="Accordion 2" title="Contents" className="pb-2">
					<Link
						href="/admin/courses"
						className={`px-2 relative flex flex-row items-center h-10 focus:outline-none hover:bg-default-100 ${isActive(
							'/admin/courses'
						)}`}>
						<ClipboardList size={16} strokeWidth={2} />
						<span className="ml-2 text-sm tracking-wide truncate">All Courses</span>
					</Link>
					<Link
						href="/admin/categories"
						className={`px-2 relative flex flex-row items-center h-10 focus:outline-none hover:bg-default-100 ${isActive(
							'/admin/categories'
						)}`}>
						<FileBox size={16} strokeWidth={2} />
						<span className="ml-2 text-sm tracking-wide truncate">Categories</span>
					</Link>
					<Link
						href="/admin/users"
						className={`px-2 relative flex flex-row items-center h-10 focus:outline-none hover:bg-default-100 ${isActive(
							'/admin/users'
						)}`}>
						<Users2 size={16} />
						<span className="ml-2 text-sm tracking-wide truncate">Users</span>
					</Link>
					<Link
						href="/admin/teachers"
						className={`px-2 relative flex flex-row items-center h-10 focus:outline-none hover:bg-default-100 ${isActive(
							'/admin/teachers'
						)}`}>
						<BookUser size={16} />
						<span className="ml-2 text-sm tracking-wide truncate">Teachers</span>
					</Link>
				</AccordionItem>
				<AccordionItem key="3" aria-label="Accordion 3" title="Settings" className="pb-2">
					<div className="px-2 relative flex flex-row items-center h-10 cursor-default">
						<Shield size={16} />
						<span className="ml-2 text-sm tracking-wide truncate">Administartor</span>
					</div>
					<a
						onClick={handleThemeChange}
						className="px-2 relative flex flex-row items-center h-10 cursor-pointer focus:outline-none hover:bg-default-100">
						<span className="inline-flex justify-center items-center">
							{theme === 'light' ? <MoonStar size={16} /> : <Sun size={16} />}
						</span>
						<span className="ml-2 text-sm tracking-wide truncate">
							{theme === 'light' ? 'Dark Mode' : 'Light Mode'}
						</span>
					</a>
					<a
						onClick={handleLogout}
						className="px-2 relative flex flex-row items-center h-10 focus:outline-none hover:bg-default-100 cursor-pointer">
						<LogOut size={16} />
						<span className="ml-2 text-sm tracking-wide truncate">Logout</span>
					</a>
				</AccordionItem>
			</Accordion>
			<LoginModal isOpen={isOpen} onClose={onClose} />
		</div>
	)
}
