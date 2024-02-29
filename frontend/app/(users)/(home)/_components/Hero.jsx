import React from 'react'
import { cookies } from 'next/headers'
import { Button } from '@nextui-org/react'
import NextLink from 'next/link'

export default function Hero() {
	const cookieStore = cookies()
	const theme = cookieStore.get('theme')
	return (
		<>
			<div className="relative hidden md:flex max-h-[350px] items-start justify-end -me-[0rem]">
				<div className="relative">
					<img src="/hero_2.jpg" className="h-[350px]" />
                    <div className='dark:hidden absolute inset-0 bg-gradient-to-r from-white to-transparent'></div>
                    <div className='hidden dark:block absolute inset-0 bg-gradient-to-r from-black to-transparent'></div>
				</div>
				<div className="absolute inset-0 ps-3 flex flex-col justify-center items-start gap-4">
					<p className="text-4xl max-w-[600px] font-semibold">
						Learn Beyond Limits: Your Knowledge Journey Starts Here
					</p>
					<p className="text-md max-w-xl">
						Step into a World of Endless Possibilities – Your Passport to Success is Here! Embrace Your
						Learning Adventure with us
					</p>
					<Button
						size="lg"
						href="/courses"
						as={NextLink}
						variant="solid"
						color="primary"
						className="text-white px-4 font-bold hover:underline self-start">
						Browse all Courses
					</Button>
				</div>
			</div>

			<div className="md:hidden block justify-center shadow-lg">
				<img src="/hero_2.jpg" w={0} h={0} className="w-screen" />
				<div className="p-4 flex flex-col items-start gap-4 justify-center">
					<p className="text-xl max-w-[650px] font-semibold">
						Learn Beyond Limits: Your Knowledge Journey Starts Here
					</p>
					<p className="text-sm max-w-xl">
						Step into a World of Endless Possibilities – Your Passport to Success is Here! Embrace Your
						Learning Adventure with us
					</p>
					<Button
						size="md"
						href="/courses"
						as={NextLink}
						variant="solid"
						color="primary"
						className="text-white px-4 font-bold hover:underline">
						Explore Courses
					</Button>
				</div>
			</div>
		</>
	)
}
