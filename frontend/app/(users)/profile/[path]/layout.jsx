import React from 'react'

export default function layout({ children }) {
	return <>{children}</>
}

export async function generateMetadata({ params }) {
	const title = params.path.charAt(0).toUpperCase() + params.path.slice(1) || 'Profile'

	return {
		title,
        description: 'User profile and account',
		openGraph: {
			images: 'https://raw.githubusercontent.com/kannanvg100/levelup-v2/8072199747dad6d095fe96c3d58975a285a7241d/frontend/levelup_image.png',
		},
	}
}
