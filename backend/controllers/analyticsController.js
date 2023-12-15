const Category = require('../models/Category')
const Course = require('../models/Course')
const Enrollment = require('../models/Enrollment')

module.exports = {
	getAllAnalytics: async (req, res, next) => {
		try {
			const totalPublishedCourses = await Course.countDocuments({ status: 'published' })
			const totalEnrolledCourses = await Enrollment.countDocuments()
			const totalCoursesEnrolled = await Enrollment.aggregate([
				{
					$lookup: {
						from: 'courses',
						localField: 'course',
						foreignField: '_id',
						as: 'course',
					},
				},
				{
					$unwind: '$course',
				},
				{
					$group: {
						_id: null,
						totalAmountEarned: { $sum: '$course.price' },
					},
				},
				{
					$project: {
						_id: 0,
						totalAmountEarned: 1,
					},
				},
			])

			let topCourses = await Enrollment.aggregate([
				{
					$group: {
						_id: { $dateToString: { format: '%Y-%m-%d', date: '$purchasedAt' } },
						count: { $sum: 1 },
						course: { $first: '$course' },
					},
				},
				{
					$group: {
						_id: '$course',
						data: { $push: { x: '$_id', y: '$count' } },
					},
				},
				{
					$lookup: {
						from: 'courses',
						localField: '_id',
						foreignField: '_id',
						as: 'course',
					},
				},
				{
					$unwind: '$course',
				},
				{
					$project: {
						_id: 0,
						id: '$course.title',
						data: 1,
					},
				},
			])

			topCourses = topCourses.map((it, index) => {
				return {
					id: it?.id,
					data: it?.data,
					color: index,
				}
			})

			let countByCategory = await Course.aggregate([
				{
					$group: {
						_id: '$category',
						count: { $sum: 1 },
					},
				},
				{
					$lookup: {
						from: 'categories',
						localField: '_id',
						foreignField: '_id',
						as: 'category',
					},
				},
				{
					$unwind: '$category',
				},
				{
					$project: {
						id: '$category.title',
						value: '$count',
					},
				},
			])

			countByCategory = countByCategory.map((it, index) => {
				return {
					id: it.id,
					value: it.value,
					label: it.id,
					color: index,
				}
			})

			res.status(200).json({
				success: true,
				data: {
					totalPublishedCourses,
					totalEnrolledCourses,
					topCourses,
					totalAmountEarned: totalCoursesEnrolled[0].totalAmountEarned,
					countByCategory,
				},
			})
		} catch (error) {
			next(error)
		}
	},

	getAllAnalyticsTeacher: async (req, res, next) => {
		try {
			const totalPublishedCourses = await Course.countDocuments({ teacher: req.user._id, status: 'published' })
			const totalEnrolledCourses = await Enrollment.countDocuments({ teacher: req.user._id })
			const totalCoursesEnrolled = await Enrollment.aggregate([
				{
					$match: {
						teacher: req.user._id,
					},
				},
				{
					$lookup: {
						from: 'courses',
						localField: 'course',
						foreignField: '_id',
						as: 'course',
					},
				},
				{
					$unwind: '$course',
				},
				{
					$group: {
						_id: null,
						totalAmountEarned: { $sum: '$course.price' },
					},
				},
				{
					$project: {
						_id: 0,
						totalAmountEarned: 1,
					},
				},
			])

			let topCourses = await Enrollment.aggregate([
				{
					$match: {
						teacher: req.user._id,
					},
				},
				{
					$group: {
						_id: { $dateToString: { format: '%Y-%m-%d', date: '$purchasedAt' } },
						count: { $sum: 1 },
						course: { $first: '$course' },
					},
				},
				{
					$group: {
						_id: '$course',
						data: { $push: { x: '$_id', y: '$count' } },
					},
				},
				{
					$lookup: {
						from: 'courses',
						localField: '_id',
						foreignField: '_id',
						as: 'course',
					},
				},
				{
					$unwind: '$course',
				},
				{
					$project: {
						_id: 0,
						id: '$course.title',
						data: 1,
					},
				},
			])

			topCourses = topCourses.map((it, index) => {
				return {
					id: it?.id,
					data: it?.data,
					color: index,
				}
			})

			let countByCategory = await Course.aggregate([
				{
					$match: {
						teacher: req.user._id,
					},
				},
				{
					$group: {
						_id: '$category',
						count: { $sum: 1 },
					},
				},
				{
					$lookup: {
						from: 'categories',
						localField: '_id',
						foreignField: '_id',
						as: 'category',
					},
				},
				{
					$unwind: '$category',
				},
				{
					$project: {
						id: '$category.title',
						value: '$count',
					},
				},
			])

			countByCategory = countByCategory.map((it, index) => {
				return {
					id: it.id,
					value: it.value,
					label: it.id,
					color: index,
				}
			})

			res.status(200).json({
				success: true,
				data: {
					totalPublishedCourses,
					totalEnrolledCourses,
					topCourses,
					totalAmountEarned: totalCoursesEnrolled[0]?.totalAmountEarned || 0,
					countByCategory,
				},
			})
		} catch (error) {
			next(error)
		}
	},
}
