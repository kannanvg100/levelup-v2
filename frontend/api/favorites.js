import axios from 'axios'
export function getFavorites({ pageParam, limit }) {
	return axios
		.get(`/api/favorites?page=${pageParam}&limit=${limit}`)
		.then((res) => res.data)
		.catch((err) => {
			throw err
		})
}
export function createFavorite({ courseId }) {
	return axios
		.post(`/api/favorites/${courseId}`)
		.then((res) => res.data)
		.catch((err) => {
			throw err
		})
}
export function deleteFavorite({ courseId }) {
	return axios
		.delete(`/api/favorites/${courseId}`)
		.then((res) => res.data)
		.catch((err) => {
			throw err
		})
}
