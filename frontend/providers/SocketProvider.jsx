'use client'
import React, { createContext, useContext, useEffect, useState } from 'react'
import { useSelector } from 'react-redux'
import io from 'socket.io-client'

const SocketContext = createContext()

export const useSocket = () => {
	return useContext(SocketContext)
}

export const SocketProvider = ({ role, children }) => {
	const [socket, setSocket] = useState()
	const user = useSelector((state) => {
		if (role === 'user') return state?.user?.user
		if (role === 'teacher') return state?.teacher?.teacher
	})

	useEffect(() => {
		if (!user) return
		const newSocket = io(process.env.NEXT_PUBLIC_API_URL, {
			withCredentials: true,
			auth: {
				token: user?.accessToken || 'error',
			},
			reconnection: true,
			reconnectionDelay: 500,
			reconnectionAttempts: Infinity,
			transports: ['websocket'],
		})
		setSocket(newSocket)

		return () => newSocket.disconnect()
	}, [user])

	return <SocketContext.Provider value={socket}>{children}</SocketContext.Provider>
}
