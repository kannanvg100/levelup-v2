import axios from 'axios'
export function getCoupons({ page, count, query, status, sort }) {
	if (status) status = encodeURIComponent(status.join(','))
	return axios
		.get(`/api/teacher/coupons?query=${query}&status=${status}&sort=${sort}&page=${page}&count=${count}`)
		.then((res) => res.data)
		.catch((err) => {
			throw err
		})
}

export function getCourseCoupons( teacher ) {
	return axios
		.get(`/api/teacher/course-coupons?teacher=${teacher}`)
		.then((res) => res.data)
		.catch((err) => {
			throw err
		})
}

export function createCoupon(data) {
	return axios
		.post(`/api/teacher/coupons`, data)
		.then((res) => res.data)
		.catch((err) => {
			throw err
		})
}

export function deleteCoupon(data) {
	return axios
		.patch(`/api/teacher/coupons`, data)
		.then((res) => res.data)
		.catch((err) => {
			throw err
		})
}
