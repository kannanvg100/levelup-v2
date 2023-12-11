const mongoose = require('mongoose')
const commentSchema = new mongoose.Schema({
	user: {
		type: mongoose.Schema.ObjectId,
		ref: 'User',
		required: true,
	},
    segment: {
        type: mongoose.Schema.ObjectId,
        ref: 'Segment',
        required: true,
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

module.exports = mongoose.model('Comment', commentSchema)
