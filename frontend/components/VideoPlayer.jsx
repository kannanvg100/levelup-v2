'use client'
import MuxPlayer from '@mux/mux-player-react'

export default function VideoPlayer({ segment, onEnded, userId }) {
	return (
		<MuxPlayer
			className='w-full h-full'
			accentColor="#00B8A9"
			streamType="on-demand"
			playbackId={segment?.video[0].playbackId}
			metadata={{
				video_id: segment?._id,
				video_title: segment?.title,
				viewer_user_id: userId,
			}}
			onEnded={() => onEnded(segment._id)}
		/>
	)
}
