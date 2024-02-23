'use client'
import { Skeleton } from '@nextui-org/react'
// import MuxPlayer from '@mux/mux-player-react'
import dynamic from 'next/dynamic'
import { useState } from 'react'
const MuxPlayer = dynamic(() => import('@mux/mux-player-react'), {
	ssr: false,
	loading: () => (
		<Skeleton>
			<div className="w-full h-full aspect-video"></div>
		</Skeleton>
	),
})

export default function VideoPlayer({ segment, onEnded, userId }) {
	const [isVisible, setVisible] = useState(true)
	return (
		<>
			{isVisible ? (
				<MuxPlayer
					className="w-full h-full aspect-video"
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
			) : (
				<Skeleton>
					<div className="w-full h-full aspect-video"></div>
				</Skeleton>
			)}
		</>
	)
}
