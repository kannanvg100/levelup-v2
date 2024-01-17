import axios from 'axios'

export function getFilters() {
	return axios
		.get(`/api/filters`)
		.then((res) => res.data)
		.catch((err) => {
			throw err
		})
}

export function getCourses({ page, count, search, sort, filter }) {
	let filterString = Object.entries(filter)
		.map(([key, value]) => `${key}=${value.join(',')}`)
		.join('&')
	filterString = encodeURIComponent(filterString)

	return axios
		.get(`/api/courses?search=${search}&page=${page}&count=${count}&sort=${sort}&filter=${filterString}`)
		.then((res) => {
			return res.data
		})
		.catch((err) => {
			throw err
		})
}

export function getCoursesByTag({ tag }) {
	return axios
		.get(`/api/courses/${tag}`)
		.then((res) => res.data)
		.catch((err) => {
			throw err
		})
}

export function getCoursesByTeacher({ page, count, query, status, sort }) {
	if (status) status = encodeURIComponent(status.join(','))
	return axios
		.get(`/api/teacher/courses?query=${query}&status=${status}&sort=${sort}&page=${page}&count=${count}`)
		.then((res) => res.data)
		.catch((err) => {
			throw err
		})
}

export function getCoursesByAdmin({ page, count, query, status, sort }) {
	if (status) status = encodeURIComponent(status.join(','))
	return axios
		.get(`/api/admin/courses?query=${query}&status=${status}&sort=${sort}&page=${page}&count=${count}`)
		.then((res) => res.data)
		.catch((err) => {
			throw err
		})
}

export function getCourse(id) {
	if (!id) return
	return axios
		.get(`/api/course/${id}`)
		.then((res) => res.data)
		.catch((err) => {
			throw err
		})
}

export function getFullCourse(id) {
	if (!id) return
	return axios
		.get(`/api/full-course/${id}`)
		.then((res) => res.data)
		.catch((err) => {
			throw err
		})
}

export function getCourseTeacher(id) {
	if (!id) return
	return axios
		.get(`/api/teacher/course/${id}`)
		.then((res) => res.data)
		.catch((err) => {
			throw err
		})
}

export async function createCourse({ course, selectedTab }) {
	const formData = new FormData()
	for (const key in course) {
		formData.append(key, course[key])
	}
	formData.append('selectedTab', selectedTab)
	return axios
		.post('/api/create-course', formData)
		.then((res) => res.data)
		.catch((err) => {
			throw err
		})
}

export async function saveDraft({ course, selectedTab }) {
	const formData = new FormData()
	for (const key in course) {
		formData.append(key, course[key])
	}
	formData.append('selectedTab', selectedTab)
	return axios
		.post('/api/save-draft', formData)
		.then((res) => res.data)
		.catch((err) => {
			throw err
		})
}

export function uploadThumbnail({ file, courseId }) {
	const formData = new FormData()
	formData.append('thumbnail', file)
	return axios
		.post(`/api/course/${courseId}/thumbnail`, formData)
		.then((res) => res.data)
		.catch((err) => {
			throw err
		})
}

export function getMuxUploadUrl() {
	return axios
		.get('/api/get-upload-url')
		.then((res) => res.data)
		.catch((err) => {
			throw err
		})
}

export function createStripeSession({ courseId, code }) {
	return axios
		.post('/api/create-checkout-session', { courseId, code })
		.then((res) => res.data)
		.catch((err) => {
			throw err
		})
}

export function updateCourse({ courseId, title, description, category, level, thumbnail, price, mrp, chapters }) {
	const formData = new FormData()
	if (title) formData.append('title', title)
	if (description) formData.append('description', description)
	if (category) formData.append('category', category)
	if (level) formData.append('level', level)
	if (thumbnail) formData.append('thumbnail', thumbnail)
	if (price) formData.append('price', price)
	if (mrp) formData.append('mrp', mrp)

	if (chapters) formData.append('chapters', chapters)

	return axios
		.patch(`/api/update-course/${courseId}`, formData)
		.then((res) => res.data)
		.catch((err) => {
			throw err
		})
}

export function deleteCourse(courseId) {
	return axios
		.delete(`/api/delete-course/${courseId}`)
		.then((res) => res.data)
		.catch((err) => {
			throw err
		})
}

export function deleteCourseAdmin(courseId) {
	return axios
		.delete(`/api/admin/delete-course/${courseId}`)
		.then((res) => res.data)
		.catch((err) => {
			throw err
		})
}

export function getEnrolledCourses({ page, count }) {
	return axios
		.get(`/api/my-courses?page=${page}&count=${count}`)
		.then((res) => res.data)
		.catch((err) => {
			throw err
		})
}

export function getEnrollment(courseId) {
	return axios
		.get(`/api/enrollment/${courseId}`)
		.then((res) => res.data)
		.catch((err) => {
			throw err
		})
}

export function getSearchResults({ source, query }) {
	return axios
		.get(`/api/instant-search?query=${query}`, { cancelToken: source.token })
		.then((res) => res.data.courses)
		.catch((err) => {
			throw err
		})
}

export function updateCourseStatus({ courseId, status }) {
	return axios
		.patch(`/api/update-course-status/${courseId}`, { status })
		.then((res) => res.data)
		.catch((err) => {
			throw err
		})
}

export function getCertificate({ courseId }) {
	return axios
		.get(`/api/certificate/${courseId}`)
		.then((res) => res.data)
		.catch((err) => {
			throw err
		})
}
