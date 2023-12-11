const mongoose = require('mongoose')
const segmentSchema = new mongoose.Schema({
	title: {
		type: String,
		required: [true, 'Please Enter Lesson Title'],
		trim: true,
	},
	description: {
		type: String,
		required: [true, 'Please Enter Lesson Description'],
		trim: true,
	},
	video: [
		{
			status: {
				type: String,
				default: 'pending',
			},
			uploadId: {
				type: String,
				required: true,
			},
			assetId: {
				type: String,
				default: null,
			},
			playbackId: {
				type: String,
				default: null,
			},
			duration: {
				type: String,
				required: function () {
					this.playbackId ? true : false
				},
			},
			thumbnail: {
				type: String,
			},
		},
	],
	attachments: [
		{
			name: {
				type: String,
				required: true,
			},
			url: {
				type: String,
				required: true,
			},
		},
	],
    course: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Course',
        required: true,
    },
    chapter: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Chapter',
        required: true,
    },
	isFree: {
		type: Boolean,
		default: false,
	},
	createdAt: {
		type: Date,
		default: Date.now,
	},
})

module.exports = mongoose.model('Segment', segmentSchema)
