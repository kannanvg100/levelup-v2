const Comment = require('../models/Comment')
const Notification = require('../models/Notification')

module.exports = {
	// Get all comments
	getComments: async (req, res, next) => {
		try {
			const segmentId = req.params.id
			const page = req.query.page || 1
			const limit = req.query.limit || 10
			const totalComments = await Comment.countDocuments({ segment: segmentId })
			const comments = await Comment.find({ segment: segmentId })
				.sort({ createdAt: -1 })
				.limit(limit * 1)
				.skip((page - 1) * limit)
				.populate('user', 'name profileImage')
			res.status(200).json({ success: true, comments, totalComments })
		} catch (error) {
			next(error)
		}
	},

	// Create new comment
	createComment: async (req, res, next) => {
		try {
			const segmentId = req.params.id
			const userId = req.user._id
			if (!segmentId) return res.status(400).json({ success: false, message: 'Segment ID is required' })

			const comment = req.body.comment
			if (!comment) return res.status(400).json({ success: false, errors: { comment: 'Pls add comment' } })
			const doc = await Comment.create({
				user: userId,
				segment: segmentId,
				comment,
			})
			res.status(201).json({ success: true })
			// await Notification.create({
			// 	type: 'new_comment',
			// 	sender: req.user._id,
			// 	receiver: course.teacher,
			// 	resource: [segmentId, doc._id],
			// })
		} catch (error) {
			next(error)
		}
	},
}
