const mongoose = require('mongoose')

const promotionSchema = new mongoose.Schema({
	user: {
		type: mongoose.Schema.Types.ObjectId,
		ref: 'User',
		required: [true, 'Coupon must belong to a user'],
	},
	code: {
		type: String,
		required: [true, 'Please Enter the coupon code'],
		unique: true,
		uppercase: true,
	},
	description: {
		type: String,
	},
	discount: {
		type: Number,
		required: [true, 'Please Enter the coupon discount'],
		min: 0,
		max: 100,
	},
	minPurchase: {
		type: Number,
		required: [true, 'Please Enter the coupon min amount'],
		min: 0,
	},
	maxDiscount: {
		type: Number,
		required: [true, 'Please Enter the coupon max discount'],
		min: 1,
	},
	startDate: {
		type: Date,
		required: [true, 'Please Enter the coupon start date'],
	},
	endDate: {
		type: Date,
		required: [true, 'Please Enter the coupon end date'],
	},
	createdAt: {
		type: Date,
		immutable: true,
		default: Date.now,
	},
})

module.exports = mongoose.model('Promotion', promotionSchema, 'promotions')
