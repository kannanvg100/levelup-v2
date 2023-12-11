const { AccessToken } = require('livekit-server-sdk')
const User = require('../models/User')

const apiKey = process.env.LIVEKIT_API_KEY
const apiSecret = process.env.LIVEKIT_API_SECRET
const wsUrl = process.env.NEXT_PUBLIC_LIVEKIT_URL

module.exports = {

    // create livekit token
	getLiveVideoToken: async (req, res, next) => {
		try {
			const { roomId, senderId } = req.body
			if (!roomId) return res.status(400).json({ message: 'Room name is missing' })

			if (!apiKey || !apiSecret || !wsUrl)
				return res.status(400).json({ message: 'Livekit credentials are missing' })

			const token = new AccessToken(apiKey, apiSecret, {
				identity: req.user._id.toString(),
				name: req.user.name || 'User',
				ttl: 3600,
			})

			token.addGrant({
				roomJoin: true,
				room: roomId,
			})

			res.status(200).json({ success: true, token: token.toJwt() })
			const user = { _id: req.user._id, name: req.user.name, profileImage: req.user.profileImage }
			req.app.get('io').in(senderId).emit('INCOMING_VIDEO_CALL', { caller: user, roomId })
		} catch (error) {
			next(error)
		}
	},

    // create livekit token for join
	getLiveVideoTokenJoin: async (req, res, next) => {
		try {
			const { roomId } = req.body
			if (!roomId ) return res.status(400).json({ message: 'Room name is missing' })

			if (!apiKey || !apiSecret || !wsUrl)
				return res.status(400).json({ message: 'Livekit credentials are missing' })

			const token = new AccessToken(apiKey, apiSecret, {
				identity: req.user._id.toString(),
				name: req.user.name || 'User',
				ttl: 3600,
			})

			token.addGrant({
				roomJoin: true,
				room: roomId,
			})

			res.status(200).json({ success: true, token: token.toJwt() })
		} catch (error) {
			next(error)
		}
	},
}
