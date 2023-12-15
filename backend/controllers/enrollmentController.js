const Course = require('../models/Course')
const Enrollment = require('../models/Enrollment')
const Notification = require('../models/Notification')
const { generateCertificate } = require('../utils/generateCertificate')

module.exports = {
	// Get enrolled course
	getEnrollment: async (req, res, next) => {
		try {
			const { id: courseId } = req.params
			const course = await Course.countDocuments({ _id: courseId })
			if (!course) return res.status(404).json({ message: 'Course not found' })
			const enrollment = await Enrollment.findOne({ student: req.user._id, course: courseId })
			if (!enrollment)
				return res.status(404).json({ success: true, message: 'You have not enrolled this course' })
			res.status(200).json({ success: true, enrollment })
			// await Notification.create({
			// 	type: 'new_enrollment',
			// 	sender: req.user._id,
			// 	receiver: course.teacher,
			// 	resource: [courseId, enrollment._id],
			// })
		} catch (error) {
			next(error)
		}
	},

	// Get course completed certificate
	getCertificate: async (req, res, next) => {
		try {
            const { id: courseId } = req.params
            const course = await Course.findById(courseId)
            if (!course) return res.status(404).json({ message: 'Course not found' })
            const enrollment = await Enrollment.findOne({ student: req.user._id, course: courseId })
            if (!enrollment) return res.status(404).json({ success: true, message: 'You have not enrolled this course' })
			const image = await generateCertificate({name: req.user.name, course: course.title, date: '2021-10-20'})
            res.status(200).json({ success: true, image })
		} catch (error) {
			next(error)
		}
	},
}
