'use client'
import React, { useState, useEffect } from 'react'
import axios from 'axios'
import { CircularProgress, Image, Modal, ModalBody, ModalContent, Progress, Skeleton } from '@nextui-org/react'
import toast from 'react-hot-toast'
import { Download } from 'lucide-react'

const CertificateModal = ({ isOpen, onClose, courseId }) => {
	const [loading, setLoading] = useState(true)
	const [certificateUrl, setCertificateUrl] = useState('')
	const [progress, setProgress] = useState(undefined)
	let [certUrl, setCertUrl] = useState(null)

	const fetchCertificate = async () => {
		setLoading(true)
		try {
			if (!courseId) {
				toast.error('Invalid course')
				onClose()
			}
			const response = await axios.get(`/api/certificate/${courseId}`, {
				responseType: 'blob',
				onDownloadProgress: (progressEvent) => {
					const { loaded, total } = progressEvent
					const percentCompleted = Math.round((loaded * 100) / total)
					setProgress(percentCompleted)
				},
			})
			const blob = await response.data
			const imageUrl = URL.createObjectURL(blob)
			setCertificateUrl(imageUrl)
			setCertUrl(imageUrl)
		} catch (error) {
			toast.error(error?.response?.data?.message || 'Something went wrong.')
			onClose()
		} finally {
			setLoading(false)
		}
	}

	useEffect(() => {
		fetchCertificate()
	}, [])

	const handleDownload = () => {
		if (!certUrl) return toast.error('Something went wrong.')
		const link = document.createElement('a')
		link.href = certUrl
		link.download = 'certificate.png'
		link.click()
	}

	return (
		<Modal
			backdrop="opaque"
			isOpen={isOpen}
			onClose={onClose}
			closeButton={<></>}
			size="4xl"
			radius="none"
			shadow="lg"
			placement="center"
			className="w-[880px] aspect-[1.5]">
			<ModalContent>
				{(onClose) => (
					<>
						<ModalBody className="p-0">
							{loading ? (
								<>
									<Skeleton className="absolute inset-0" />
									<div className="absolute inset-0 flex flex-col gap-2 justify-center items-center">
										<CircularProgress
											classNames={{
												svg: 'w-36 h-36 drop-shadow-2xl stroke-1',
											}}
											size="lg"
											value={progress}
										/>
										<p className="font-semibold italic">
											Please wait. It may take sometime to generate the certificate.
										</p>
									</div>
								</>
							) : (
								<>
									<div
										className="absolute inset-0"
										style={{
											backgroundImage: `url(${certificateUrl})`,
											backgroundSize: 'cover',
											backgroundRepeat: 'no-repeat',
										}}>
										<Download
											color="#FFF"
											className="cursor-pointer absolute right-8 bottom-8"
											onClick={handleDownload}
										/>
									</div>
								</>
							)}
						</ModalBody>
					</>
				)}
			</ModalContent>
		</Modal>
	)
}

export default CertificateModal
