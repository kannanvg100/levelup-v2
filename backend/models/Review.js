const mongoose = require('mongoose')
const reviewSchema = new mongoose.Schema({
	user: {
		type: mongoose.Schema.ObjectId,
		ref: 'User',
		required: true,
	},
	course: {
		type: mongoose.Schema.ObjectId,
		ref: 'Course',
		required: true,
	},
	rating: {
		type: Number,
		required: [true, 'Please add rating'],
		min: 1,
		max: 5,
	},
	subject: {
		type: String,
		required: [true, 'Please add subject'],
	},
	comment: {
		type: String,
		required: [true, 'Please add comment'],
	},
	createdAt: {
		type: Date,
		default: Date.now,
	},
})

module.exports = mongoose.model('Review', reviewSchema)
