import axios from 'axios'

export function getAllEnrolledCourses({ page, count, from, to }) {
	return axios
		.get(`/api/enrollments?page=${page}&count=${count}&from=${from}&to=${to}`)
		.then((res) => res.data)
		.catch((err) => {
			throw err
		})
}

export function getEnrollmentReport({ from, to }) {
	const route = from && to ? `/api/report?from=${from}&to=${to}` : '/api/enrollments/report'
	return axios
		.get(route, { responseType: 'blob' })
		.then((res) => res.data)
		.catch((err) => {
			throw err
		})
}
