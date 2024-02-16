'use client'
import React, { useEffect, useState } from 'react'
import { Modal, ModalContent } from '@nextui-org/react'
import Login from '@/components/Login'
import { useRouter } from 'next/navigation'

export default function App() {
	const [isOpen, setOpen] = useState(true)
	const router = useRouter()
	const handleClose = () => {
		router.back()
	}
	return (
		<Modal
			isOpen={isOpen}
			onClose={handleClose}
			hideCloseButton={true}
			backdrop="blur"
			placement="center"
			shouldBlockScroll={false}
			className="w-[400px]">
			<ModalContent>
				<Login role="user" onClose={handleClose} />
			</ModalContent>
		</Modal>
	)
}
