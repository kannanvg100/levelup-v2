import axios from 'axios'

export function getAllAnalytics() {
	return axios
		.get('/api/admin/get-all-analytics')
		.then((res) => res.data.data)
		.catch((err) => {
			throw err
		})
}

export function getAllAnalyticsTeacher() {
	return axios
		.get('/api/teacher/get-all-analytics')
		.then((res) => res.data.data)
		.catch((err) => {
			throw err
		})
}
