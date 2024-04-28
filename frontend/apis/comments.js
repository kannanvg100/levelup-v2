import axios from 'axios'

export function createComment({ comment, segmentId }) {
	return axios
		.post(`/api/comments/${segmentId}`, { comment })
		.then((res) => res.data)
		.catch((err) => {
			throw err
		})
}

export function getComments({segmentId, page, count}) {
    return axios
        .get(`/api/comments/${segmentId}?page=${page}&limit=${count}`)
        .then((res) => res.data)
        .catch((err) => {
            throw err
        })
}