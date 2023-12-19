const Coupon = require('../models/Promotion')
const mongoose = require('mongoose')

module.exports = {
	// get all coupons by role
	getCoupons: async (req, res, next) => {
		try {
			const { page, count, query, status, sort } = req.query
			const escapedQuery = query.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')

			let filterQuery = {
				user: req.user._id,
				$or: [{ $text: { $search: query } }, { code: { $regex: new RegExp(escapedQuery, 'i') } }],
			}

			if (status) {
				if (status === 'active') {
					filterQuery.startDate = { $lte: Date.now() }
					filterQuery.endDate = { $gte: Date.now() }
				} else if (status === 'inactive') {
					filterQuery.$or = [{ startDate: { $gt: Date.now() } }, { endDate: { $lt: Date.now() } }]
				}
			}

			let sortQuery = {}
			if (sort) {
				const [key, value] = sort.split('-')
				sortQuery[key] = value === 'descending' ? -1 : 1
			}

			const totalCoupons = await Coupon.countDocuments(filterQuery)

			const coupons = await Coupon.find(filterQuery)
				.sort(sortQuery)
				.limit(count)
				.skip((page - 1) * count)

			res.status(200).json({ success: true, totalCoupons, coupons })
		} catch (error) {
			next(error)
		}
	},

	getCourseCoupons: async (req, res, next) => {
		try {
			const { teacher } = req.query
			const coupons = await Coupon.find({
				user: new mongoose.Types.ObjectId(teacher),
				startDate: { $lte: Date.now() },
				endDate: { $gte: Date.now() },
			})
			res.status(200).json({ success: true, coupons })
		} catch (error) {
			next(error)
		}
	},

	// Add coupon to database
	createCoupon: async (req, res, next) => {
		try {
			const { code, discount, minPurchase, maxDiscount, startDate, endDate } = req.body
			if (startDate > Date.now()) {
				return res
					.status(400)
					.json({ success: false, errors: { startDate: 'Start date must be before today' } })
			}
			if (endDate < Date.now()) {
				return res.status(400).json({ success: false, errors: { endDate: 'End date must be after today' } })
			}
			if (startDate > endDate) {
				return res
					.status(400)
					.json({ success: false, errors: { endDate: 'End date must be after start date' } })
			}
			const endDateWithTime = `${endDate}T23:59:59.999Z`
			const coupon = await Coupon.findOne({
				discount,
				minPurchase,
				maxDiscount,
				startDate,
				endDate: endDateWithTime,
			})
			if (coupon) {
				return res.status(400).json({
					success: false,
					errors: { code: `A coupon with same details already exists (${coupon.code})` },
				})
			}
			await Coupon.create({
				user: req.user._id,
				code,
				discount,
				minPurchase,
				maxDiscount,
				startDate,
				endDate: endDateWithTime,
			})
			return res.status(200).json({ success: true })
		} catch (error) {
			next(error)
		}
	},

	// Delete coupon from database
	deleteCoupon: async (req, res, next) => {
		try {
			const { couponId } = req.body
			if (!couponId) {
				return res.status(400).json({ success: false, message: 'Invalid request' })
			}
			const coupon = await Coupon.findOneAndDelete({ _id: couponId, user: req.user._id })
			if (!coupon) {
				return res.status(400).json({ success: false, message: 'Coupon not found' })
			}
			res.status(200).json({ success: true })
		} catch (error) {
			next(error)
		}
	},
}
