'use client'
import React from 'react'
import { Tabs, Tab, Card, CardBody } from '@nextui-org/react'
import { useRouter } from 'next/navigation'
import MyCourses from './MyCourses'

export default function App({ params: { path } }) {
	const router = useRouter()
	return (
		<div className="flex w-full flex-col">
			<Tabs
				aria-label="Options"
				size="lg"
				variant="bordered"
                color="primary"
                radius='none'
                selectedKey={path || 'photos'}
				onSelectionChange={(key) => router.push(`/profile/${key}`, undefined, { shallow: true })}>
				<Tab key="courses" title="My courses">
					<MyCourses />
				</Tab>
				<Tab key="2" title="Music">
					Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo
					consequat. Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat
					nulla pariatur.
				</Tab>
				<Tab key="3" title="Videos">
					Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id
					est laborum.
				</Tab>
			</Tabs>
		</div>
	)
}
