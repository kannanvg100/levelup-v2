import axios from 'axios'
const BASE_URL = '/api'

module.exports = {
	loginUser: async ({ email, password, role }) => {
		return axios
			.post(`${BASE_URL}/login`, { email, password, role }, { withCredentials: true })
			.then((res) => res.data)
	},
	socialLoginUser: async ({ type, code, role }) => {
		return axios
			.post(`${BASE_URL}/social-login`, { type, code, role }, { withCredentials: true })
			.then((res) => res.data)
			.catch((err) => {
				throw err
			})
	},
	logoutUser: async (role) => {
		return axios
			.get(`${BASE_URL}/logout?role=${role}`, { withCredentials: true })
			.then((res) => res.data)
			.catch((err) => {
				throw err
			})
	},
	sendOtp: async (data) => {
		return axios
			.post(`${BASE_URL}/send-otp`, data, { withCredentials: true })
			.then((res) => res.data)
			.catch((err) => {
				throw err
			})
	},
	signupUser: async (data) => {
		return axios
			.post(`${BASE_URL}/signup`, data, { withCredentials: true })
			.then((res) => res.data)
			.catch((err) => {
				throw err
			})
	},
	resetSendOtp: async ({ email }) => {
		return axios
			.patch(`${BASE_URL}/reset-otp`, { email }, { withCredentials: true })
			.then((res) => res.data)
			.catch((err) => {
				throw err
			})
	},
	checkOtp: async ({ email, otp }) => {
		return axios
			.patch(`${BASE_URL}/check-otp`, { email, otp }, { withCredentials: true })
			.then((res) => res.data)
			.catch((err) => {
				throw err
			})
	},
	resetPassword: async ({ email, otp, password }) => {
		return axios
			.post(`${BASE_URL}/reset`, { email, otp, password }, { withCredentials: true })
			.then((res) => res.data)
			.catch((err) => {
				throw err
			})
	},
	getTeachers: async ({ page, count }) => {
		return axios
			.get(`${BASE_URL}/all-teachers?page=${page}&count=${count}`, { withCredentials: true })
			.then((res) => res.data)
			.catch((err) => {
				throw err
			})
	},

	changeUserStatus: async ({ id, status }) => {
		return axios
			.patch(`${BASE_URL}/change-status?id=${id}&status=${status}`, { withCredentials: true })
			.then((res) => res.data)
			.catch((err) => {
				throw err
			})
	},

	getAllUsers: async ({ page, count, query, status, sort }) => {
		if (status) status = encodeURIComponent(status.join(','))
		return axios
			.get(`/api/admin/users?query=${query}&status=${status}&sort=${sort}&page=${page}&count=${count}`)
			.then((res) => res.data)
			.catch((err) => {
				throw err
			})
	},

    getAllTeachers: async ({ page, count, query, status, sort }) => {
		if (status) status = encodeURIComponent(status.join(','))
		return axios
			.get(`/api/admin/teachers?query=${query}&status=${status}&sort=${sort}&page=${page}&count=${count}`)
			.then((res) => res.data)
			.catch((err) => {
				throw err
			})
	},

	updateProfile: async ({ name, profileImage, password }) => {
		const formData = new FormData()
		if (name) formData.append('name', name)
		if (password) formData.append('password', password)
		if (profileImage) formData.append('image', profileImage)

		return axios
			.patch(`${BASE_URL}/profile`, formData, { withCredentials: true })
			.then((res) => res.data)
			.catch((err) => {
				throw err
			})
	},

	updateProfileTeacher: async ({ name, profileImage, password }) => {
		const formData = new FormData()
		if (name) formData.append('name', name)
		if (password) formData.append('password', password)
		if (profileImage) formData.append('image', profileImage)

		return axios
			.patch(`${BASE_URL}/teacher/profile`, formData, { withCredentials: true })
			.then((res) => res.data)
			.catch((err) => {
				throw err
			})
	},

	updateProfileDoc: async ({ doc }) => {
		const formData = new FormData()
		if (doc) formData.append('doc', doc)

		return axios
			.post(`${BASE_URL}/teacher/profile-doc`, formData, { withCredentials: true })
			.then((res) => res.data)
			.catch((err) => {
				throw err
			})
	},

	getUsersOfTeacher: async ({ page, count, query }) => {
		return axios
			.get(`${BASE_URL}/teacher/all-users?page=${page}&count=${count}&query=${query}`, { withCredentials: true })
			.then((res) => res.data)
			.catch((err) => {
				throw err
			})
	},
}
