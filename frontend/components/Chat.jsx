'use client'
import React, { useEffect, useMemo, useRef, useState } from 'react'
import { Card, CardHeader, CardBody, Avatar, Spinner, Chip, Spacer } from '@nextui-org/react'
import { useSelector } from 'react-redux'
import { ChevronUp, MessageSquareOff } from 'lucide-react'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { getChatsUser, getChatsTeacher, markChatRead } from '@/api/chats'
import ChatWindow from './ChatWindow'
import { useSocket } from '@/providers/SocketProvider'
import toast from 'react-hot-toast'
import VideoCallIncoming from './VideoCallIncoming'
import { useChat } from './providers/ChatProvider'

export default function Chat({ role }) {
	const user = useSelector((state) => state[role][role])
	const { isChatExpanded, toggleChat, chat, setChat } = useChat()

	const chatRef = useRef(null)
	const chevronRef = useRef(null)
	const queryClient = useQueryClient()
	const [isOnline, setIsOnline] = useState(false)
	const socket = useSocket()
	const unReadChats = queryClient.getQueryData(['chats', user?._id])?.reduce((acc, chat) => {
		if (chat?.unreadCount > 0) return acc + 1
		return acc
	}, 0)

	useEffect(() => {
		if (!socket || !user) return setIsOnline(false)
		socket?.on('connected', () => {
			setIsOnline(true)
		})
		socket?.on('NEW_MESSAGE', (data) => {
			queryClient.invalidateQueries(['chats', user?._id])
		})
	}, [socket, user])

	useEffect(() => {
		if (user) {
			if (isChatExpanded) {
				chatRef.current.style.bottom = '0px'
				chevronRef.current.classList.add('rotate-180')
			} else {
				chatRef.current.style.bottom = '-352px'
				chevronRef.current.classList.remove('rotate-180')
			}
		}
	}, [isChatExpanded, user])

	const {
		data: chats,
		isPending,
		isError,
	} = useQuery({
		queryKey: ['chats', user?._id],
		queryFn:
			role === 'user'
				? () => getChatsUser({ page: 1, limit: 10 })
				: () => getChatsTeacher({ page: 1, limit: 10 }),
		keepPreviousData: true,
		enabled: !!user,
	})

	const { mutate: mutateMarkAsRead } = useMutation({
		mutationFn: markChatRead,
		onSuccess: (data) => {
			queryClient.invalidateQueries(['chats', user?._id])
		},
		onError: (error) => {
			toast.error(
				error?.response?.data?.message || error?.response?.data?.errors?.toast || 'Something went wrong'
			)
		},
	})

	return (
		<>
			{user && (
				<div className="fixed -bottom-[352px] right-8 z-30 transition-all" ref={chatRef}>
					<div className="flex justify-end">
						<VideoCallIncoming />
					</div>
					{<Spacer y={2} />}
					<div className="flex gap-3">
						{chat && (
							<ChatWindow role={role} chat={chat} setChat={setChat} mutateMarkAsRead={mutateMarkAsRead} />
						)}
						<Card className="w-72 h-[400px]" radius="none" shadow="md">
							<CardHeader
								className="h-12 flex justify-between items-center gap-3 cursor-pointer hover:bg-default-50"
								onClick={toggleChat}>
								<div className="flex items-center gap-3">
									<Avatar isBordered={isOnline} color="success" size="sm" src={user?.profileImage} />
									<p className="text-md font-medium">Messages</p>
									{unReadChats > 0 && (
										<Chip size="sm" className="h-4" color="primary" variant="flat">
											<p className="text-[10px]">{unReadChats}</p>
										</Chip>
									)}
								</div>
								<ChevronUp className="hover:text-default-800 text-default-500" ref={chevronRef} />
							</CardHeader>
							<div className="h-[1px] w-full bg-default-100"></div>
							<CardBody className="relative p-0">
								{isPending && <Spinner className="absolute inset-0" size="lg" />}
								{isError && (
									<div className="absolute inset-0 text-center">
										<div className="h-full flex flex-col justify-center items-center">
											<MessageSquareOff size={36} className="text-default-700" />
											<Spacer y={3} />
											<p className="text-default-500 text-sm px-2">
												Something went wrong. Please try reloading the page.
											</p>
										</div>
									</div>
								)}
								<div className="flex flex-col">
									{chats?.map((item, index) => (
										<div
											key={index}
											className={`flex gap-2 h-16 items-center hover:bg-default-50 p-2 px-3 cursor-pointer w-full ${
												item?._id === chat?._id ? 'bg-default-100' : ''
											}`}
											onClick={() => {
												setChat(item)
												if (item?.unreadCount > 0) mutateMarkAsRead({ role, chatId: item._id })
											}}>
											<Avatar
												size="md"
												src={item?.sender[0]?.user?.profileImage}
												className="w-10 overflow-hidden"
											/>
											<div className="flex flex-col ">
												<div className="flex items-center gap-2">
													<p className="text-sm font-normal">{item?.sender[0]?.user?.name}</p>
													{item?.unreadCount > 0 && (
														<Chip size="sm" className="h-4" color="primary" variant="flat">
															<p className="text-[10px]">{item?.unreadCount}</p>
														</Chip>
													)}
												</div>
												<p className="w-48 text-tiny text-default-500 whitespace-nowrap overflow-hidden text-ellipsis">
													{item?.lastMessage?.attachmentType === 'text'
														? item?.lastMessage?.content
														: item?.lastMessage?.attachmentType === 'image'
														? '📷 image'
														: item?.lastMessage?.attachmentType === 'video'
														? '🎥 video'
														: item?.lastMessage?.attachmentType === 'audio'
														? '🎵 audio'
														: item?.lastMessage?.attachmentType === 'file'
														? '📁 file'
														: ''}
												</p>
											</div>
										</div>
									))}
								</div>
							</CardBody>
						</Card>
					</div>
				</div>
			)}
		</>
	)
}
