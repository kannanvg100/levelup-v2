'use client'
import { Link } from '@nextui-org/react'
import { Facebook, Github, Instagram, Linkedin, Twitter, Youtube } from 'lucide-react'
import Image from 'next/image'
import NextLink from 'next/link'
export default function Footer() {
	return (
		<div className="container mx-auto py-6 max-w-screen-xl px-[1.5rem]">
			<div className="flex justify-center">
				<Image
					src="/logo.svg"
					alt="logo"
					width={0}
					height={0}
					className="cursor-pointer min-w-[100px] h-auto"
					priority={true}
				/>
			</div>
			<ul className="flex flex-wrap justify-center items-center mt-4 gap-x-4 gap-y-2 mx-5 md:mx-[200px]">
				<li>
					<Link
						as={NextLink}
						href="/teacher"
						size="sm"
						className="text-default-500 text-tiny hover:underline hover:text-default-700 whitespace-nowrap">
						Teach on Levelup
					</Link>
				</li>
				<li>
					<Link
						as={NextLink}
						href="/admin"
						size="sm"
						className="text-default-500 text-tiny hover:underline hover:text-default-700 whitespace-nowrap">
						Administrator
					</Link>
				</li>
				<li>
					<Link
						as={NextLink}
						href="/"
						size="sm"
						className="text-default-500 text-tiny hover:underline hover:text-default-700 whitespace-nowrap">
						About us
					</Link>
				</li>
				<li>
					<Link
						as={NextLink}
						href="/"
						size="sm"
						className="text-default-500 text-tiny hover:underline hover:text-default-700 whitespace-nowrap">
						Contact us
					</Link>
				</li>
				<li>
					<Link
						as={NextLink}
						href="/"
						size="sm"
						className="text-default-500 text-tiny hover:underline hover:text-default-700 whitespace-nowrap">
						Careers
					</Link>
				</li>
				<li>
					<Link
						as={NextLink}
						href="/"
						size="sm"
						className="text-default-500 text-tiny hover:underline hover:text-default-700 whitespace-nowrap">
						Blog
					</Link>
				</li>
				<li>
					<Link
						as={NextLink}
						href="/"
						size="sm"
						className="text-default-500 text-tiny hover:underline hover:text-default-700 whitespace-nowrap">
						Help and Support
					</Link>
				</li>
				<li>
					<Link
						as={NextLink}
						href="/"
						size="sm"
						className="text-default-500 text-tiny hover:underline hover:text-default-700 whitespace-nowrap">
						Affiliate
					</Link>
				</li>
				<li>
					<Link
						as={NextLink}
						href="/"
						size="sm"
						className="text-default-500 text-tiny hover:underline hover:text-default-700 whitespace-nowrap">
						Investors
					</Link>
				</li>
				<li>
					<Link
						as={NextLink}
						href="/"
						size="sm"
						className="text-default-500 text-tiny hover:underline hover:text-default-700 whitespace-nowrap">
						Terms
					</Link>
				</li>
				<li>
					<Link
						as={NextLink}
						href="/"
						size="sm"
						className="text-default-500 text-tiny hover:underline hover:text-default-700 whitespace-nowrap">
						Privacy policy
					</Link>
				</li>
				<li>
					<Link
						as={NextLink}
						href="/"
						size="sm"
						className="text-default-500 text-tiny hover:underline hover:text-default-700 whitespace-nowrap">
						Sitemap
					</Link>
				</li>
				<li>
					<Link
						as={NextLink}
						href="/"
						size="sm"
						className="text-default-500 text-tiny hover:underline hover:text-default-700 whitespace-nowrap">
						Accessibility statement
					</Link>
				</li>
			</ul>
			<div className="flex gap-4 items-center justify-center mt-4 text-default-500">
				<Instagram size={18} className="cursor-pointer hover:text-default-700" />
				<Facebook size={18} className="cursor-pointer hover:text-default-700" />
				<Youtube size={18} className="cursor-pointer hover:text-default-700" />
				<Twitter size={18} className="cursor-pointer hover:text-default-700" />
				<Linkedin size={18} className="cursor-pointer hover:text-default-700" />
				<Github size={18} className="cursor-pointer hover:text-default-700" />
			</div>
			<p className="mt-4 text-small text-default-500 text-center">© {new Date().getFullYear()} LevelUP Inc.</p>
		</div>
	)
}
