const jwt = require('jsonwebtoken')
const { Server, Socket } = require('socket.io')
const User = require('../models/User.js')

const ChatEventEnum = Object.freeze({
	CONNECTED_EVENT: 'connected',
	DISCONNECT_EVENT: 'disconnect',
	JOIN_CHAT_EVENT: 'joinChat',
	LEAVE_CHAT_EVENT: 'leaveChat',
	MESSAGE_RECEIVED_EVENT: 'messageReceived',
	NEW_CHAT_EVENT: 'newChat',
	SOCKET_ERROR_EVENT: 'socketError',
	STOP_TYPING_EVENT: 'stopTyping',
	TYPING_EVENT: 'typing',
})

const mountJoinChatEvent = (socket) => {
	socket.on(ChatEventEnum.JOIN_CHAT_EVENT, (chatId) => {
		console.log(`User joined the chat 🤝. chatId: `, chatId)
		socket.join(chatId)
	})
}

const initializeSocketIO = (io) => {
	console.log('socket.io initialized')
	return io.on('connection', async (socket) => {
		try {
			const token = socket.handshake.auth?.token

			if (!token) {
				// throw new ApiError(401, 'Un-authorized handshake. Token is missing')
				console.log('Un-authorized handshake. Token is missing')
				return
			}

			const decodedToken = jwt.verify(token, process.env.JWT_SECRET) // decode the token

			if (!decodedToken?.userId || !decodedToken?.role) {
				console.log('Un-authorized handshake. Token is invalid')
				// throw new ApiError(401, 'Un-authorized handshake. Token is invalid')
			}

			const user = await User.findById(decodedToken?.userId)
			if (!user) {
				// throw new ApiError(401, 'Un-authorized handshake. Token is invalid')
				console.log('Un-authorized handshake. Token is invalid')
			}
			socket.user = user._id // mount te user object to the socket

			const roomId = user._id.toString()
			socket.join(roomId)
			socket.emit(ChatEventEnum.CONNECTED_EVENT) // emit the connected event so that client is aware
			console.log('User connected Id: ', user._id.toString())

			mountJoinChatEvent(socket)
			// mountParticipantTypingEvent(socket)
			// mountParticipantStoppedTypingEvent(socket)

			socket.on(ChatEventEnum.DISCONNECT_EVENT, () => {
				console.log('user has disconnected 🚫. userId: ' + socket.user?._id)
				if (socket.user?._id) {
					socket.leave(socket.user._id)
				}
			})

			socket.on('JOIN_CHAT', ({ chatId }) => {
				socket.join(chatId)
				console.log(user._id.toString(), ' joined room: ', chatId)
			})

			socket.on('LEAVE_CHAT', ({ chatId }) => {
				socket.leave(chatId)
				console.log(user._id.toString(), ' left room: ', chatId)
			})

			socket.on('SEND_MESSAGE', ({ chatId, content }) => {
				console.log('message received: ', chatId, content)

				socket.to(chatId).emit('GET_MESSAGE', content)
			})

			socket.on('LEAVE_VIDEO', ({ roomId, senderId }) => {
				socket.to(senderId).emit('VIDEO_CALL_CANCELLED', roomId)
			})
		} catch (error) {
			socket.emit(
				ChatEventEnum.SOCKET_ERROR_EVENT,
				error?.message || 'Something went wrong while connecting to the socket.'
			)
		}
	})
}

const emitSocketEvent = (req, roomId, event, payload) => {
	req.app.get('io').in(roomId).emit(event, payload)
}

module.exports = { initializeSocketIO, emitSocketEvent }
