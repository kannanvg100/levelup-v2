import './globals.css'
import { Providers } from './providers'

export const metadata = {
    metadataBase: new URL('http://localhost:3000'),
	title: {
		absolute: 'LevelUp - Home',
		template: '%s - LevelUp',
		default: 'LevelUp',
	},
	description: 'Learn Beyond Limits: Your Knowledge Journey Starts Here',
	openGraph: {
        title: 'LevelUp',
        description: 'Learn Beyond Limits: Your Knowledge Journey Starts Here',
		images: 'https://raw.githubusercontent.com/kannanvg100/levelup-v2/8072199747dad6d095fe96c3d58975a285a7241d/frontend/levelup_image.png',
	},
}

export default function RootLayout({ children }) {
	return (
		<html lang="en" suppressHydrationWarning>
			<head>
				<link rel="icon" href="/favicon.png" sizes="any" />
			</head>
			<body className="min-h-screen bg-background text-default-700">
				<Providers themeProps={{ attribute: 'class', defaultTheme: 'light' }}>
					<main>{children}</main>
				</Providers>
			</body>
		</html>
	)
}
