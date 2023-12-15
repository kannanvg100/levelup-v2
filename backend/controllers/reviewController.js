const Review = require('../models/Review')
const Course = require('../models/Course')

module.exports = {
	// Get all reviews
	getReviews: async (req, res, next) => {
		try {
			const { id: courseId } = req.params
			const { page, limit } = req.query
			const course = await Course.countDocuments({ _id: courseId })
			if (!course) return res.status(404).json({ message: 'Course not found' })
			const reviews = await Review.find({ course: courseId })
				.limit(limit * 1)
				.skip((page - 1) * limit)
				.populate('user', 'name')
			res.status(200).json({ success: true, reviews })
		} catch (error) {
			next(error)
		}
	},

	// Create new review
	createReview: async (req, res, next) => {
		try {
			const { id: courseId } = req.params
			const { subject, rating, comment } = req.body
			const course = await Course.findById(courseId)
			if (!course) return res.status(404).json({ message: 'Course not found' })

			let review = await Review.findOne({ course: courseId, user: req.user._id })
			if (review) {
				review.subject = subject
				review.rating = rating
				review.comment = comment
				await review.save()
			} else {
				review = await Review.create({ subject, comment, rating, course: courseId, user: req.user._id })
			}

			const newCount = course.rating?.count + 1
			const newRating = (course.rating.avg + review.rating) / newCount
			course.rating = { avg: newRating, count: newCount }
			await course.save()
			res.status(201).json({ success: true, review })
		} catch (error) {
			next(error)
		}
	},
}
