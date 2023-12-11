const mongoose = require('mongoose')
const notificationSchema = new mongoose.Schema({
	type: {
		type: String,
		required: true,
		enum: ['new_teacher', 'new_comment', 'new_enrollment'],
	},
	content: {
		type: String,
		required: true,
	},
	resource: [
		{
			type: mongoose.Schema.Types.ObjectId,
			refPath: 'type',
		},
	],
	link: {
		type: String,
	},
	sender: {
		type: mongoose.Schema.Types.ObjectId,
		ref: 'User',
		required: true,
	},
	receiver: {
		type: mongoose.Schema.Types.ObjectId,
		ref: 'User',
		required: true,
	},
	createdAt: {
		type: Date,
		default: Date.now,
	},
	readAt: {
		type: Date,
		default: null,
	},
})

module.exports = mongoose.model('Notification', notificationSchema)
