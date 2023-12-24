const mongoose = require('mongoose')
const enrollmentsSchema = new mongoose.Schema({
	course: {
		type: mongoose.Schema.Types.ObjectId,
		ref: 'Course',
		required: true,
	},
	student: {
		type: mongoose.Schema.Types.ObjectId,
		ref: 'User',
		required: true,
	},
	teacher: {
		type: mongoose.Schema.Types.ObjectId,
		ref: 'User',
		required: true,
	},
	progress: {
		chapters: [
			{
				chapter: {
					type: mongoose.Schema.Types.ObjectId,
					ref: 'Chapter',
					required: true,
				},
				segments: [
					{
						segment: {
							type: mongoose.Schema.Types.ObjectId,
							ref: 'Segment',
							required: true,
						},
						progress: {
							type: Number,
							default: 0,
							min: 0,
							max: 100,
						},
						completedAt: {
							type: Date,
							default: Date.now,
						},
					},
				],
			},
		],
	},
	payment: {
		price: {
			type: Number,
			required: true,
			min: 0,
		},
		discount: {
			type: Number,
			default: 0,
			min: 0,
		},
		finalPrice: {
			type: Number,
			required: true,
			min: 0,
		},
        coupon: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Coupon',
        },
		method: {
			type: String,
			enum: ['paypal', 'stripe'],
			required: true,
		},
		paymentData: {
			type: Object,
			required: true,
		},
	},
	purchasedAt: {
		type: Date,
		default: Date.now,
	},
})

module.exports = mongoose.model('Enrollment', enrollmentsSchema)
