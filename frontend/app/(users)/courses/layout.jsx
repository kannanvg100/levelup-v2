import React from 'react'

export const metadata = {
	title: {
		template: '%s - LevelUp',
		default: 'Courses',
	},
}

export default function layout({ children }) {
	return <div>{children}</div>
}
