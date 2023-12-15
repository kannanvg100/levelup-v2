'use client'
import { useSocket } from '@/providers/SocketProvider'
import React, { useEffect, useState } from 'react'
import VideoCallModal from './VideoCallModal'
import toast from 'react-hot-toast'
import { Button, Card, CardBody, Image } from '@nextui-org/react'
import { useMutation } from '@tanstack/react-query'
import { getAccessTokenJoin } from '@/api/videos'

export default function VideoCallIncoming() {
	const socket = useSocket()
	const [incomingCall, setIncomingCall] = useState(false)
	const [roomId, setRoomId] = useState('')
	const [accessToken, setAccessToken] = useState(null)
	const [isOpenVideoModal, setIsOpenVideoModal] = useState(false)
	const [caller, setCaller] = useState(null)

	useEffect(() => {
		if (!socket) return
		socket?.on('INCOMING_VIDEO_CALL', (data) => {
			setRoomId(data.roomId)
			setCaller(data.caller)
			setIncomingCall(true)
		})
		socket?.on('VIDEO_CALL_CANCELLED', (_roomId) => {
			if (roomId == _roomId) setIncomingCall(false)
		})
	}, [socket, roomId])

	const { isPending: isLoadingGetAccessToken, mutate: mutateGetAccessToken } = useMutation({
		mutationFn: getAccessTokenJoin,
		onSuccess: (data) => {
			setAccessToken(data.token)
			setIncomingCall(false)
			setIsOpenVideoModal(true)
		},
		onError: (error) => {
			toast.error(error?.response?.data?.message || 'Something went wrong')
		},
	})

	const handleAccept = () => {
		mutateGetAccessToken({ roomId })
	}

	const handleReject = () => {
		socket.emit('REJECT_VIDEO_CALL', { roomId })
		setIncomingCall(false)
	}

	return (
		<>
			<VideoCallModal token={accessToken} isOpen={isOpenVideoModal} onClose={setIsOpenVideoModal} />
			{incomingCall && (
				<Card radius="none" className="h-24 w-80 p-2 shadow-md">
					<CardBody className="p-0">
						<div className="flex justify-start gap-2 ">
							<Image
								src={caller?.profileImage}
								width={50}
								height={50}
								alt={caller?.name}
								className="rounded-full"
							/>
							<div>
								<p className="font-semibold">{caller?.name}</p>
								<p className="text-tiny text-default-600">Incoming video call</p>
								<div className="flex gap-3 mt-2">
									<Button
										varient="flat"
										size="sm"
										radius="none"
										color="danger"
										onClick={handleReject}
										className="font-medium">
										Reject
									</Button>
									<Button
										isLoading={isLoadingGetAccessToken}
										varient="flat"
										size="sm"
										radius="none"
										color="success"
										onClick={handleAccept}
										className="font-medium">
										Accept
									</Button>
								</div>
							</div>
						</div>
					</CardBody>
				</Card>
			)}
		</>
	)
}
