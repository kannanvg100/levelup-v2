'use client'

import { createChatMessage, getMessages } from '@/api/chats'
import {
	Avatar,
	Button,
	Card,
	CardBody,
	CardFooter,
	CardHeader,
	Dropdown,
	DropdownItem,
	DropdownMenu,
	DropdownTrigger,
	Image,
	Input,
	Skeleton,
	Spinner,
} from '@nextui-org/react'
import {
	ArrowLeft,
	BookText,
	Clapperboard,
	FileAudio2,
	Image as ImageLucid,
	Paperclip,
	Send,
	Video,
	X,
} from 'lucide-react'
import React, { useEffect, useLayoutEffect, useRef, useState } from 'react'
import toast from 'react-hot-toast'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { useSelector } from 'react-redux'
import { useSocket } from '@/providers/SocketProvider'
import VideoCallModal from './VideoCallModal'
import { getAccessToken } from '@/api/videos'

export default function ChatWindow({ role, chat, setChat, mutateMarkAsRead }) {
	const user = useSelector((state) => state[role][role])
	const expandChat = () => {}
	const [message, setMessage] = useState('')
	const [count, setCount] = useState(10)
	const queryClient = useQueryClient()
	const iconClasses = 'text-xl text-default-500 pointer-events-none flex-shrink-0 rounded-none'
	const socket = useSocket()
	const inputRef = useRef(null)
	const fileInputRef = useRef(null)
	const chatRef = useRef(null)
	const [attachmentType, setAttachmentType] = useState('text')
	const [isOpen, setIsOpen] = useState(false)
	const [token, setToken] = useState(null)

	const openFilePicker = (type) => {
		setAttachmentType(type)
		fileInputRef.current.accept = `${type}/*`
		fileInputRef.current.click()
	}

	useEffect(() => {
		inputRef.current.focus()
		return () => {
			socket?.emit('LEAVE_CHAT', { chatId: chat?._id })
		}
	}, [])

	const getLiveMessages = () => {
		if (!chat) return
		if (!socket) return
		socket.emit('JOIN_CHAT', { chatId: chat?._id })
		socket.on('GET_MESSAGE', () => {
			queryClient.invalidateQueries(['messages', { chatId: chat?._id }])
			queryClient.invalidateQueries(['chats', user?._id])
		})
	}

	useEffect(() => {
		getLiveMessages()
	}, [socket])

	const {
		data: messages,
		isPending,
		isError,
		isRefetching,
	} = useQuery({
		queryKey: ['messages', { chatId: chat?._id, page: 1, limit: count }],
		queryFn: () => getMessages({ chatId: chat?._id, page: 1, limit: count }),
		keepPreviousData: true,
		enabled: true,
		staleTime: Infinity,
	})

	useLayoutEffect(() => {
		if (chatRef.current) {
			chatRef.current.scrollTop = chatRef.current.scrollHeight
		}
	}, [messages, message])

	const { isPending: isLoadingSendMessage, mutate: mutateSendMessage } = useMutation({
		mutationFn: createChatMessage,
		onSuccess: () => {
			setMessage('')
			// chatRef.current.scrollIntoView({ behavior: 'smooth' });
			setAttachmentType('text')
			queryClient.invalidateQueries(['messages', { chatId: chat?._id }])
		},
		onError: (error) => {
			toast.error(
				error?.response?.data?.message || error?.response?.data?.errors?.toast || 'Something went wrong'
			)
		},
	})

	const handleSendMessage = () => {
		mutateMarkAsRead({ role, chatId: chat?._id })
		if (!message || !message.trim()) return
		mutateSendMessage({ role, chatId: chat?._id, content: message })
		chatRef.current.scrollIntoView({ behavior: 'smooth' })
		// if (!socket) return toast.error('Socket not connected')
		// socket.emit('SEND_MESSAGE', { chatId: chat?._id, content: message })
	}

	const handleFileChange = () => {
		if (fileInputRef.current.files[0]) {
			mutateSendMessage({
				role,
				chatId: chat?._id,
				content: '',
				attachmentType,
				attachment: fileInputRef.current.files[0],
			})
		} else {
			toast.error('File not found')
		}
	}

	const { isPending: isLoadingGetAccessToken, mutate: mutateGetAccessToken } = useMutation({
		mutationFn: getAccessToken,
		onSuccess: (data) => {
			setToken(data?.token)
			setIsOpen(true)
		},
		onError: (error) => {
			toast.error(error?.response?.data?.message || 'Something went wrong')
		},
	})

	const handleOpenVideoCall = async () => {
		mutateGetAccessToken({
			role,
			roomId: chat._id,
			senderId: chat.sender[0].user._id,
		})
	}

	return (
		<>
			<Card className="w-96 h-[400px]" radius="none" shadow="md">
				<CardHeader className="h-14 flex justify-between gap-3" onClick={expandChat}>
					<div className="flex items-center gap-3 md:px-3 cursor-pointer">
						<ArrowLeft
							className="md:hidden hover:text-default-800 text-default-500 cursor-pointer"
							onClick={() => setChat(null)}
						/>
						<Avatar isBordered color="success" size="sm" src={chat.sender[0]?.user?.profileImage} />
						<p className="text-md font-medium">{chat?.sender[0]?.user?.name}</p>
					</div>
					<div className="flex gap-6">
						{role === 'user' && (
							<>
								{isLoadingGetAccessToken ? (
									<Spinner size="sm" className="text-default-500" />
								) : (
									<Video
										className="hover:text-default-800 text-default-500 cursor-pointer"
										onClick={handleOpenVideoCall}
									/>
								)}
							</>
						)}
						<X
							className="invisible md:visible hover:text-default-800 text-default-500 cursor-pointer"
							onClick={() => setChat(null)}
						/>
					</div>
				</CardHeader>
				<CardBody className="relative py-0 ps-0">
					{isPending && <Spinner className="absolute inset-0" />}
					{isError && <p className="text-center">Error</p>}
					<div className="flex gap-2 px-3 h-[288px] flex-col-reverse overflow-y-scroll" ref={chatRef}>
						{isRefetching && !isLoadingSendMessage && (
							<div className="self-end">
								<Skeleton className="w-[80px] h-10 bg-default-50" />
							</div>
						)}
						{isLoadingSendMessage && attachmentType !== 'text' && (
							<div className="self-end text-tiny w-[220px] object-cover p-1">
								<Skeleton className="w-[220px] h-32 bg-default-50" />1
							</div>
						)}

						{messages?.map((message, index) => (
							<div
								key={message._id}
								className={
									message.sender === user._id
										? 'self-end bg-default-100 max-w-[90%] min-w-[80px]'
										: 'self-start bg-default-100 max-w-[90%] min-w-[80px]'
								}>
								{message?.attachmentType === 'text' && (
									<span className="block text-sm text-left px-2 py-1">{message.content}</span>
								)}

								{message?.attachmentType === 'image' && (
									<div className="self-end bg-default-100 w-[220px] object-cover p-1">
										<Image
											className="rounded-none"
											width={220}
											height={220}
											src={message.attachment}
											alt="attachment"
										/>
									</div>
								)}

								{message?.attachmentType === 'video' && (
									<div className="self-end bg-default-100 w-[220px] object-cover p-1">
										<video width={220} height={220} controls>
											<source src={message.attachment} type="video/mp4" />
										</video>
									</div>
								)}

								{message?.attachmentType === 'audio' && (
									<div className="self-end bg-default-100 object-cover">
										<audio controls className="w-[220px]">
											<source src={message.attachment} type="audio/mpeg" />
											Your browser does not support the audio element.
										</audio>
									</div>
								)}

								{message?.attachmentType === 'document' && (
									<div className="self-end bg-default-100 object-cover p-2">
										<div className="flex gap-1 items-center">
											<BookText size={16} />
											<div>
												<span className="block text-sm text-left px-2 py-1">
													{message.content}
												</span>
												<a
													href={message.attachment}
													target="_blank"
													className="text-tiny text-left px-2 py-1 text-blue-500 underline">
													Download
												</a>
											</div>
										</div>
									</div>
								)}

								<span className="block text-[10px] text-default-500 text-right pe-2 py-1">
									{new Date(message.createdAt).toLocaleTimeString('en-IN', {
										hour: 'numeric',
										minute: 'numeric',
									})}
								</span>
								{/* <div
    								className="h-5 w-5 bg-default-100 translate-x-[-50%] translate-y-[-50%]"
    								style={{ clipPath: 'polygon(0% 0%, 100% 0%, 0% 100%)' }}>
                                </div> */}
							</div>
						))}
						{!isPending && (
							<div className="flex items-center gap-2 justify-center w-full border mt-1">
								{isRefetching && <Spinner size="sm" />}
								<span
									className="text-center cursor-pointer hover:text-default-800 text-default-500 py-4 select-none"
									onClick={() => {
										setCount((prev) => prev + 10)
									}}>
									Load more
								</span>
							</div>
						)}
					</div>
				</CardBody>
				<CardFooter>
					<div className="flex justify-between gap-3 h-10 w-full py-0">
						<Dropdown radius="none" className="min-w-[160px]">
							<DropdownTrigger>
								<Button isIconOnly className="h-10 bg-default-100" radius="none">
									<Paperclip className="text-default-500" />
								</Button>
							</DropdownTrigger>
							<DropdownMenu
								variant="flat"
								aria-label="Dropdown for attachments"
								itemClasses={{
									base: 'rounded-none',
								}}>
								<DropdownItem
									key="pics"
									startContent={<ImageLucid size={14} className={iconClasses} />}
									onClick={() => openFilePicker('image')}>
									Pictures
								</DropdownItem>
								<DropdownItem
									key="videos"
									startContent={<Clapperboard size={14} className={iconClasses} />}
									onClick={() => openFilePicker('video')}>
									Videos
								</DropdownItem>
								<DropdownItem
									key="docs"
									startContent={<BookText size={14} className={iconClasses} />}
									onClick={() => openFilePicker('document')}>
									Documents
								</DropdownItem>
								<DropdownItem
									key="audios"
									startContent={<FileAudio2 size={14} className={iconClasses} />}
									onClick={() => openFilePicker('audio')}>
									Audio
								</DropdownItem>
							</DropdownMenu>
						</Dropdown>

						<Input
							label=""
							variant="flat"
							classNames={{
								inputWrapper: 'text-default-500 h-full',
							}}
							onChange={(e) => setMessage(e.target.value)}
							onKeyUp={(e) => {
								if (e.key === 'Enter') handleSendMessage()
							}}
							ref={inputRef}
							value={message}
							size="md"
							radius="none"
							className="flex-grow h-10"
						/>
						<Button
							isLoading={isLoadingSendMessage}
							isDisabled={isPending || isLoadingSendMessage || !message || !message.trim()}
							isIconOnly
							className="h-10"
							color="primary"
							variant="flat"
							radius="none"
							onClick={handleSendMessage}>
							<Send />
						</Button>
					</div>
					<input type="file" className="hidden" ref={fileInputRef} onChange={handleFileChange} />
				</CardFooter>
			</Card>
			{isOpen && (
				<VideoCallModal
					isOpen={isOpen}
					onClose={setIsOpen}
					token={token}
					roomId={chat._id}
					senderId={chat.sender[0].user._id}
				/>
			)}
		</>
	)
}
