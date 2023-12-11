const Category = require('../models/Category')
const Course = require('../models/Course')

module.exports = {
	// Get all categories
	getAllCategories2: async (req, res, next) => {
		try {
			const { page, count, query } = req.query
			const escapedQuery = query?.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')

			const totalCategories = await Category.countDocuments({
				$or: [{ $text: { $search: query } }, { title: { $regex: new RegExp(escapedQuery, 'i') } }],
			})
			const categories = await Category.find({
				$or: [{ $text: { $search: query } }, { title: { $regex: new RegExp(escapedQuery, 'i') } }],
			})
				.limit(count)
				.skip((page - 1) * count)
			res.status(200).json({ success: true, totalCategories, categories })
		} catch (error) {
			next(error)
		}
	},

	// Get all categories
	getAllCategories: async (req, res, next) => {
		try {
			const { page, count, query, status, sort } = req.query
			const escapedQuery = query.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')

			let filterQuery = {
				$or: [{ $text: { $search: query } }, { title: { $regex: new RegExp(escapedQuery, 'i') } }],
			}

			if (status) filterQuery['status'] = { $in: status.split(',') }

			let sortQuery = {}
			if (sort) {
				const [key, value] = sort.split('-')
				sortQuery[key] = value === 'descending' ? -1 : 1
			}

			const totalCategories = await Category.countDocuments(filterQuery)
			const categories = await Category.find(filterQuery)
				.sort(sortQuery)
				.limit(count)
				.skip((page - 1) * count)
                .lean()
			const courseCounts = await Course.aggregate([
				{
					$group: {
						_id: '$category',
						count: { $sum: 1 },
					},
				},
                {
                    $match: {
                        _id: { $ne: null }
                    }

                }
			])
			categories.forEach((category) => {
				const courseCount = courseCounts.find((c) => c._id.toString() === category._id.toString())
				category.courses = courseCount ? courseCount.count : 0
			})
			res.status(200).json({ success: true, totalCategories, categories })
		} catch (error) {
			next(error)
		}
	},

	// Get all categories for teacher
	getPublishedCategories: async (req, res, next) => {
		try {
			const categories = await Category.find({ status: 'listed' })
			res.status(200).json({ success: true, categories })
		} catch (error) {
			next(error)
		}
	},

	// Get category by id
	getCategoryById: async (req, res, next) => {
		try {
			const category = await Category.findById(req.params.id)
			res.status(200).json({ success: true, category })
		} catch (error) {
			next(error)
		}
	},

	// Create new category
	createCategory: async (req, res, next) => {
		try {
			const { title, description, status } = req.body
			if (!title && !title.trim())
				return res.status(400).json({ success: false, errors: { title: 'Title is required' } })
			if (!description && !description.trim())
				return res.status(400).json({ success: false, errors: { description: 'Description is required' } })

			let category = await Category.findOne({ title: { $regex: new RegExp(title.trim(), 'i') } })
			if (category) return res.status(400).json({ success: false, errors: { title: 'Category already exists' } })

			category = await Category.create({ title, description, status })
			res.status(200).json({ success: true, category })
		} catch (error) {
			next(error)
		}
	},

	// Update category
	updateCategory: async (req, res, next) => {
		try {
			const { title, description, status } = req.body
			const category = await Category.findByIdAndUpdate(
				req.params.id,
				{ title, description, status },
				{ new: true }
			)
			res.status(200).json({ success: true, category })
		} catch (error) {
			next(error)
		}
	},

	// Delete category
	deleteCategory: async (req, res, next) => {
		try {
			const category = await Category.findById(req.params.id)
			if (!category) return res.status(404).json({ success: false, message: 'Category not found' })
			const courses = await Course.countDocuments({ category: category._id })
			if (courses > 0)
				return res.status(400).json({ success: false, message: 'Cannot delete category with courses' })
			await Category.findByIdAndDelete(req.params.id)
			res.status(200).json({ success: true })
		} catch (error) {
			next(error)
		}
	},

	// Change category status
	changeCategoryStatus: async (req, res, next) => {
		try {
			const { id, status } = req.query
			const category = await Category.findById(id)
			if (!category) res.status(404).json({ success: false, message: 'Category not found' })
			category.status = status
			await category.save()
			res.status(200).json({ success: true, category })
		} catch (error) {
			next(error)
		}
	},
}
