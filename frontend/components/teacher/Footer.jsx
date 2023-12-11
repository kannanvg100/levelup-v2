'use client'
import { Link } from '@nextui-org/react'
import Image from 'next/image'
import NextLink from 'next/link'

export default function Footer() {
	return (
		<div className="flex flex-col justify-center items-center px-[1.5rem] py-16">
			{/* <div className="container mx-auto py-6 max-w-screen-xl "> */}
			<Image src="/logo.svg" alt="logo" width={100} height={100} />
			<div className="flex mt-6 gap-6">
				<div className="flex gap-4">
					<Link
						as={NextLink}
						href="/"
						size="sm"
						className="text-default-500 text-tiny hover:underline hover:text-default-700">
						Home
					</Link>
					<Link
						as={NextLink}
						href="/admin"
						size="sm"
						className="text-default-500 text-tiny hover:underline hover:text-default-700">
						Administrator
					</Link>
					<Link
						as={NextLink}
						href="/"
						size="sm"
						className="text-default-500 text-tiny hover:underline hover:text-default-700">
						About us
					</Link>
					<Link
						as={NextLink}
						href="/"
						size="sm"
						className="text-default-500 text-tiny hover:underline hover:text-default-700">
						Contact us
					</Link>
					<Link
						as={NextLink}
						href="/"
						size="sm"
						className="text-default-500 text-tiny hover:underline hover:text-default-700">
						Careers
					</Link>
					<Link
						as={NextLink}
						href="/"
						size="sm"
						className="text-default-500 text-tiny hover:underline hover:text-default-700">
						Blog
					</Link>
					<Link
						as={NextLink}
						href="/"
						size="sm"
						className="text-default-500 text-tiny hover:underline hover:text-default-700">
						Help and Support
					</Link>
					<Link
						as={NextLink}
						href="/"
						size="sm"
						className="text-default-500 text-tiny hover:underline hover:text-default-700">
						Affiliate
					</Link>
					<Link
						as={NextLink}
						href="/"
						size="sm"
						className="text-default-500 text-tiny hover:underline hover:text-default-700">
						Investors
					</Link>
					<Link
						as={NextLink}
						href="/"
						size="sm"
						className="text-default-500 text-tiny hover:underline hover:text-default-700">
						Terms
					</Link>
					<Link
						as={NextLink}
						href="/"
						size="sm"
						className="text-default-500 text-tiny hover:underline hover:text-default-700">
						Privacy policy
					</Link>
					<Link
						as={NextLink}
						href="/"
						size="sm"
						className="text-default-500 text-tiny hover:underline hover:text-default-700">
						Sitemap
					</Link>
					<Link
						as={NextLink}
						href="/"
						size="sm"
						className="text-default-500 text-tiny hover:underline hover:text-default-700">
						Accessibility statement
					</Link>
				</div>
				{/* </div> */}
			</div>
			<p className="mt-6 text-small text-default-500">© 2023 LevelUP Inc.</p>
		</div>
	)
}
