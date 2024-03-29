'use client'
import { Link } from '@nextui-org/react'
import { Facebook, Github, Instagram, Linkedin, Twitter, Youtube } from 'lucide-react'
import Image from 'next/image'
import NextLink from 'next/link'

export default function Footer() {
	return (
		<div className="flex flex-col justify-center items-center px-[1.5rem] py-24">
			{/* <div className="container mx-auto py-6 max-w-screen-xl "> */}
			<Image src="/logo.svg" alt="logo" width={100} height={100} />
			<div className="flex mt-6 gap-6">
				<div className="flex gap-4 whitespace-nowrap mx-[100px]">
					<Link
						as={NextLink}
						href="/"
						size="sm"
						className="text-default-500 text-tiny hover:underline hover:text-default-700">
						Home
					</Link>
					<Link
						as={NextLink}
						href="/teacher"
						size="sm"
						className="text-default-500 text-tiny hover:underline hover:text-default-700">
						Teach on Levelup
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
			<div className="flex gap-4 items-center justify-center mt-4 text-default-500">
				<Instagram size={18} className="cursor-pointer hover:text-default-700" />
				<Facebook size={18} className="cursor-pointer hover:text-default-700" />
				<Youtube size={18} className="cursor-pointer hover:text-default-700" />
				<Twitter size={18} className="cursor-pointer hover:text-default-700" />
				<Linkedin size={18} className="cursor-pointer hover:text-default-700" />
				<Github size={18} className="cursor-pointer hover:text-default-700" />
			</div>
			<p className="mt-4 text-small text-default-500">© {new Date().getFullYear()} LevelUP Inc.</p>
		</div>
	)
}
