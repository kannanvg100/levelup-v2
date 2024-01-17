import React from 'react'

export const metadata = {
	title: {
		template: 'Courses',
		default: 'Courses',
	},
	description: 'Learn Beyond Limits',
}

export default function layout({ children }) {
	return <div>{children}</div>
}
