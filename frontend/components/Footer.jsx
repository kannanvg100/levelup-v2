'use client'
import { Link } from '@nextui-org/react'
import Image from 'next/image'
import NextLink from 'next/link'
export default function Footer() {
	return (
		<div className="container mx-auto py-6 max-w-screen-xl px-[1.5rem]">
			<div className="flex justify-center">
				<Image src="/logo.svg" alt="logo" width={100} height={100} />
			</div>
			<div className="flex flex-wrap justify-center items-center mt-6 gap-x-6 gap-y-4 mx-[200px]">
				<Link
					as={NextLink}
					href="/teacher"
					size="sm"
					className="text-default-500 text-tiny hover:underline hover:text-default-700">
					Teach on Levelup
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
            <p className="mt-6 text-small text-default-500 text-center">© 2023 LevelUP Inc.</p>
		</div>
		// <div className="container mx-auto py-6 max-w-screen-xl px-[1.5rem]">
		// 	<Image src="/logo.svg" width={100} height={100} alt="logo" />
		// 	<div className="flex mt-6 gap-6">
		// 		<div className="flex flex-col gap-2">
		// 			<Link as={NextLink} href="/teacher" size="sm">
		// 				<p className="text-default-700 hover:underline">Teach on Levelup</p>
		// 			</Link>
		// 			<Link as={NextLink} href="/admin" size="sm">
		// 				<p className="text-default-700 hover:underline">Administrator</p>
		// 			</Link>
		//             <Link as={NextLink} href="/" size="sm">
		// 				<p className="text-default-700 hover:underline">About Us</p>
		// 			</Link>
		//             <Link as={NextLink} href="/" size="sm">
		// 				<p className="text-default-700 hover:underline">Contact Us</p>
		// 			</Link>
		// 		</div>
		// 	</div>
		// </div>
	)
}
