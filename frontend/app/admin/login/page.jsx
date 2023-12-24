import LoginModal from '@/components/admin/LoginModal'
import React from 'react'

export const metadata = {
	title: 'Admin Login',
}

export default function page() {
	return (
		<div>
			<LoginModal />
		</div>
	)
}
