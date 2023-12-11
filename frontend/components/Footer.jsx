'use client'
import { Link } from '@nextui-org/react'
import Image from 'next/image'
import NextLink from 'next/link'
export default function Footer() {
	return (
		<div className="container mx-auto py-6 max-w-screen-xl px-[1.5rem]">
			<Image src="/logo.svg" width={100} height={100} alt="logo" />
			<div className="flex mt-6 gap-6">
				<div className="flex flex-col gap-2">
					<Link as={NextLink} href="/teacher" size="sm">
						<p className="text-default-700 hover:underline">Teach on Levelup</p>
					</Link>
					<Link as={NextLink} href="/admin" size="sm">
						<p className="text-default-700 hover:underline">Administrator</p>
					</Link>
				</div>
			</div>
		</div>
	)
}
