import axios from 'axios'

export function createSegment({ title, description, uploadId, chapterId }) {
	return axios
		.post(`/api/create-segment/${chapterId}`, { title, description, uploadId })
		.then((res) => res.data.segment)
		.catch((err) => {
			throw err
		})
}

export function editSegment({ title, description, uploadId, chapterId, segmentId }) {
	return axios
		.patch(`/api/edit-segment/${segmentId}`, { title, description, uploadId, chapterId })
		.then((res) => res.data.segment)
		.catch((err) => {
			throw err
		})
}

export function deleteSegment({ segmentId }) {
	return axios
		.delete(`/api/delete-segment/${segmentId}`)
		.then((res) => res.data.segment)
		.catch((err) => {
			throw err
		})
}

export function setProgress({ courseId, chapterId, segmentId }) {
	return axios
		.put(`/api/set-progress/${courseId}/${chapterId}/${segmentId}`)
		.then((res) => res.data.segment)
		.catch((err) => {
			throw err
		})
}
