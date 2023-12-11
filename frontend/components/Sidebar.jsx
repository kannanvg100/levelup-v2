'use client'
import { Link } from '@nextui-org/react'
import { PieChart, Shapes, Users } from 'lucide-react'
import Image from 'next/image'
import NextLink from 'next/link'
import { usePathname } from 'next/navigation'
import toast from 'react-hot-toast'

export default function Sidebar() {
	const pathname = usePathname()
	const isActive = (path) => {
		if (pathname === '/admin' && path === '/admin/analytics') return true
		return pathname.startsWith(path)
	}

	return (
		<div className="fixed top-0 left-0 w-56 pt-8 border-e-1">
			<Link href="/">
				<Image className="ps-4 cursor-pointer" src="/logo.svg" alt="logo" width={100} height={100}></Image>
			</Link>
			<ul className="mt-6 flex flex-col">
				<li>
					<Link
						className={
							isActive('/admin/analytics')
								? 'w-full h-full ps-4 py-2 pointer-events-none transition-all duration-150 active:scale-[0.98] bg-primary-50'
								: 'w-full h-full ps-4 py-2 cursor-pointer transition-all duration-150 active:scale-[0.98] text-foreground-500 hover:bg-default-100'
						}
						as={NextLink}
						href="/admin"
						size="md">
						<PieChart size={16} />
						<p className="text-medium font-medium ps-2">Analytics</p>
					</Link>
				</li>
				<li>
					<Link
						className={
							isActive('/admin/users')
								? 'w-full h-full ps-4 py-2 pointer-events-none transition-all duration-150 active:scale-[0.98] bg-primary-50'
								: 'w-full h-full ps-4 py-2 cursor-pointer transition-all duration-150 active:scale-[0.98] text-foreground-500 hover:bg-default-100'
						}
						as={NextLink}
						href="/admin/users"
						size="md">
						<Users size={16} />
						<p className="text-medium font-medium ps-2">Users</p>
					</Link>
				</li>
				<li>
					<Link
						className={
							isActive('/admin/categories')
								? 'w-full h-full ps-4 py-2 pointer-events-none transition-all duration-150 active:scale-[0.98] bg-primary-50'
								: 'w-full h-full ps-4 py-2 cursor-pointer transition-all duration-150 active:scale-[0.98] text-foreground-500 hover:bg-default-100'
						}
						as={NextLink}
						href="/admin/categories"
						size="md">
						<Shapes size={16} />
						<p className="text-medium font-medium ps-2">Categories</p>
					</Link>
				</li>
			</ul>
		</div>
	)
}
