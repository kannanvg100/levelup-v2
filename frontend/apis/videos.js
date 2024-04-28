import axios from 'axios'

module.exports = {
	getAccessToken: async ({ role, roomId, senderId }) => {
        const route = role === 'teacher' ? '/api/teacher/get-live-video-token' : '/api/get-live-video-token'
		return axios
			.post(route, { roomId, senderId }, { withCredentials: true })
			.then((res) => res.data)
			.catch((err) => {
				throw err
			})
	},
	getAccessTokenJoin: async ({ roomId }) => {
		return axios
			.post(`/api/get-live-video-token-join`, { roomId }, { withCredentials: true })
			.then((res) => res.data)
			.catch((err) => {
				throw err
			})
	},
}
