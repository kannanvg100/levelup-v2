import { Button, Input, Snippet } from '@nextui-org/react'
import { Copy, Link, Mail, Twitter } from 'lucide-react'
import React from 'react'
import QRCode from 'react-qr-code'
import toast from 'react-hot-toast'

export default function SharePanel({ pageUrl, title }) {
	const copyToClipboard = () => {
		navigator.clipboard.writeText(pageUrl)
		toast.success('Copied to Clipboard')
	}

	const handleOpenMailClient = () => {
		const subject = encodeURIComponent(title)
		const body = encodeURIComponent(`Checkout ${title} on LevelUp\n ${pageUrl}`)
		const mailtoLink = `mailto:?subject=${subject}&body=${body}`
		window.location.href = mailtoLink
	}

	const handleOpenTwitter = () => {
		const body = encodeURIComponent(`Checkout ${title} on LevelUp\n ${pageUrl}`)
		const twitterIntentLink = `https://twitter.com/intent/tweet?text=${body}`
        window.open(twitterIntentLink, 'Twitter', 'width=600,height=400')
	}

	return (
		<div className="p-3 flex flex-col justify-center gap-4 w-full">
			<div className="text-base font-bold">Share this course with your friends</div>
			<div className="w-[160px] h-[160px] self-center flex justify-center items-center dark:bg-white">
				<QRCode size={150} value={pageUrl} />
			</div>
            <Snippet hideSymbol={true} size="sm w-full" codeString={pageUrl}>{`${pageUrl.slice(0,35)}...`}</Snippet>
			<p className="font-medium">Reach to your friends via</p>
			<div className="flex justify-start items-center gap-3 *:text-default-500 *:cursor-pointer hover:*:text-foreground-700">
				<Twitter size={20} onClick={handleOpenTwitter} />
				<Mail size={20} onClick={handleOpenMailClient} />
			</div>
		</div>
	)
}
