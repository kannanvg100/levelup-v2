import React from 'react'
import MuxUploader, { MuxUploaderDrop, MuxUploaderFileSelect } from '@mux/mux-uploader-react'
import { Ban, Check, UploadCloud } from 'lucide-react'
import { useQueryClient } from '@tanstack/react-query'
import { getMuxUploadUrl } from '@/apis/courses'
import { Progress, Spacer, Spinner } from '@nextui-org/react'
import Image from 'next/image'

export default function MuxUpload({ setUploadId, errors, setErrors, video }) {
	const queryClient = useQueryClient()
	const [videoStatus, setVideoStatus] = React.useState('pending')
	const [progress, setProgress] = React.useState(0)
	const handleGetMuxUploadUrl = async () => {
		try {
			const data = await queryClient.fetchQuery({
				queryFn: getMuxUploadUrl,
				queryKey: ['mux-upload-url'],
			})
			if (data) {
				setUploadId(data.uploadId)
				return data.uploadUrl
			} else {
				setVideoStatus('error')
				setErrors({
					...errors,
					video: 'Something went wrong. Please try again',
				})
				return ''
			}
		} catch (err) {
			setVideoStatus('error')
			setErrors({ ...errors, video: 'Something went wrong. Please try again' })
			return ''
		}
	}

	return (
		<div className="flex flex-col items-center justify-center mt-6">
			{video?.playbackId && (
				<Image
					src={`https://image.mux.com/${video?.playbackId}/thumbnail.png?width=1000`}
					alt="video thumbnail"
					width={200}
					height={105}
					className="object-contain"
				/>
			)}
			<>
				<MuxUploader
					id="my-uploader"
					className="hidden"
					endpoint={handleGetMuxUploadUrl}
					onUploadStart={() => setVideoStatus('started')}
					onSuccess={(res) => {
						setVideoStatus('success')
					}}
					onError={(err) => setErrors({ ...errors, video: err.message })}
					onUploadError={(err) => setErrors({ ...errors, video: err.message })}
					onProgress={(progress) => setProgress(progress.detail)}
				/>
				<MuxUploaderDrop id="my-uploader" overlay overlayText="Let it go">
					<span slot="heading"></span>
					<span slot="separator"></span>

					{videoStatus === 'started' ? (
						<>
							{/* <UploadCloud size={36} /> */}
							<Spacer y={4} />
							<div className="flex w-full justify-between items-center px-1">
								<p className="text-sm text-default-700">Uploading...</p>
								<p className="text-tiny text-default-500">{Math.round(progress)}%</p>
							</div>
							<Spacer y={1} />
							<Progress aria-label="Uploading" size="sm" radius="none" value={progress} color="primary" />
						</>
					) : videoStatus === 'success' ? (
						<>
							<Check size={36} />
							<Spacer y={4} />
							<div className="flex items-center gap-3">
								<Spinner size="sm" />
								<p className="text-tiny">
									Videos can take few minutes to process. please refresh the page if the video status
									not updating
								</p>
							</div>
						</>
					) : videoStatus === 'error' ? (
						<>
							<Ban size={36} />
							<Spacer y={4} />
							<p className="text-tiny">Something went wrong. Please try again</p>
						</>
					) : (
						<>
							{/* <UploadCloud size={36} /> */}
							<MuxUploaderFileSelect muxUploader="my-uploader">
								<button className="text-default-700 bg-primary text-sm font-semibold py-2 px-4 hover:file:bg-violet-100">
									Select Video
								</button>
							</MuxUploaderFileSelect>
							<Spacer y={4} />
							<p className="text-tiny">Videos of resolution more than 720p is recommended</p>
						</>
					)}
				</MuxUploaderDrop>
			</>
		</div>
	)
}
