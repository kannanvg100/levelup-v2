'use client'
import React, { createContext, useContext, useState } from 'react'

const ChatContext = createContext()

export function ChatProvider({ children }) {
	const [isChatExpanded, setChatExpanded] = useState(false)
	const [chat, setChat] = useState(null)

	const expandChat = () => setChatExpanded(true)
	const toggleChat = () => setChatExpanded((prev) => !prev)

	return (
		<ChatContext.Provider value={{ isChatExpanded, expandChat, toggleChat, chat, setChat }}>
			{children}
		</ChatContext.Provider>
	)
}

export function useChat() {
	return useContext(ChatContext)
}
