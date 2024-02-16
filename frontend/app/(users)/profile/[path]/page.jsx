'use client'
import { Tabs, Tab } from '@nextui-org/react'
import { useRouter } from 'next/navigation'
import MyCourses from './_components/MyCourses'
import Favorites from './_components/Favorites'
import Account from './_components/Account'

export default function App({ params: { path } }) {
	const router = useRouter()
	return (
		<div className="flex w-full flex-col">
			<Tabs
				aria-label="profile-page"
				size="md"
				variant="underlined"
				color="primary"
				defaultSelectedKey={path || 'courses'}
				onSelectionChange={(key) => {
					if (path !== key) router.push(`/profile/${key}`, undefined, { shallow: true })
				}}>
				<Tab key="account" title="Account">
					<Account />
				</Tab>
				<Tab key="courses" title="My courses">
					<MyCourses />
				</Tab>
				<Tab key="favorites" title="Favorites">
					<Favorites />
				</Tab>
			</Tabs>
		</div>
	)
}
