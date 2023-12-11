import axios from 'axios'

export function addReview({ courseId, rating, subject, comment }) {
	return axios
		.post(`/api/review/${courseId}`, { rating, subject, comment })
		.then((res) => res.data)
		.catch((err) => {
			throw err
		})
}

export function getReviews({ courseId, page, count }) {
	return axios
		.get(`/api/review/${courseId}?page=${page}&count=${count}`)
		.then((res) => res.data)
		.catch((err) => {
			throw err
		})
}
