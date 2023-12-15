import '@livekit/components-styles'
import {
	ControlBar,
	GridLayout,
	LiveKitRoom,
	ParticipantTile,
	RoomAudioRenderer,
	useTracks,
} from '@livekit/components-react'
import { Track } from 'livekit-client'
import { Modal, ModalContent } from '@nextui-org/react'
import { useSocket } from '@/providers/SocketProvider'

export default function VideoCallModal({ isOpen, onClose, token, roomId, senderId }) {
	const socket = useSocket()
    return (
		<Modal
			size="3xl"
			isOpen={isOpen}
			onClose={onClose}
			isDismissable={false}
			hideCloseButton={true}
			backdrop="blur"
			className="">
			<ModalContent>
				<LiveKitRoom
					video={true}
					audio={true}
					token={token}
					serverUrl={process.env.NEXT_PUBLIC_LIVEKIT_URL}
					data-lk-theme="default"
					onConnected={() => {}}
					onDisconnected={() => {
						socket?.emit('LEAVE_VIDEO', { roomId, senderId })
						onClose(false)
					}}
					onLeave={() => {}}
					style={{ height: '85vh' }}>
					<MyVideoConference />
					<RoomAudioRenderer />
					<ControlBar />
				</LiveKitRoom>
			</ModalContent>
		</Modal>
	)
}

function MyVideoConference() {
	const tracks = useTracks(
		[
			{ source: Track.Source.Camera, withPlaceholder: true },
			{ source: Track.Source.ScreenShare, withPlaceholder: false },
		],
		{ onlySubscribed: false }
	)
	return (
		<GridLayout tracks={tracks} style={{ height: 'calc(85vh - var(--lk-control-bar-height))' }}>
			<ParticipantTile />
		</GridLayout>
	)
}
