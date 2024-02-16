import React from 'react'
import { Modal, ModalContent, ModalHeader, ModalBody, ModalFooter, Button, useDisclosure } from '@nextui-org/react'
import VideoPlayer from '@/components/VideoPlayer'

export default function IntroVideoModal({ isOpen, onClose, segment }) {
	return (
		<Modal isOpen={isOpen} onClose={onClose} size='3xl' shadow='lg' backdrop='blur' className='bg-black'>
			<ModalContent>
				{(onClose) => (
					<>
						<ModalBody className='p-0 flex justify-center items-center overflow-hidden'>
							<VideoPlayer segment={segment} width='700px' height='600px'/>
						</ModalBody>
					</>
				)}
			</ModalContent>
		</Modal>
	)
}
