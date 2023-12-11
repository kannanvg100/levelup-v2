'use client'
import { Link } from '@nextui-org/react'
import Image from 'next/image'
import NextLink from 'next/link'
export default function Footer() {
	return (
		<div className="container mx-auto py-6 max-w-screen-xl px-[1.5rem]">
			<Image src="/logo.svg" alt="logo" width={100} height={100} />
			<div className="flex mt-6 gap-6">
				<div className="flex flex-col gap-2">
					<Link as={NextLink} href="/" size="sm">
						<p className="text-default-700 hover:underline">Home</p>
					</Link>
					<Link as={NextLink} href="/teacher" size="sm">
						<p className="text-default-700 hover:underline">Teach on Levelup</p>
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
			</div>
		</div>
	)
}
