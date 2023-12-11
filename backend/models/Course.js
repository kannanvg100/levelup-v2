const mongoose = require('mongoose')
const slugify = require('slugify')
const courseSchema = new mongoose.Schema({
	title: {
		type: String,
		required: [
			function () {
				return this.status === 'published'
			},
			'Please Enter Course Title',
		],
		trim: true,
	},
	description: {
		type: String,
		required: [
			function () {
				return this.status === 'published'
			},
			'Please Enter Course Description',
		],
		trim: true,
	},
	price: {
		type: Number,
		required: [
			function () {
				return this.status === 'published'
			},
			'Please Enter Course Price',
		],
		trim: true,
	},
	mrp: {
		type: Number,
		required: [
			function () {
				return this.status === 'published'
			},
			'Please Enter Course MRP',
		],
		trim: true,
	},
	duration: {
		type: String,
		trim: true,
	},
	thumbnail: {
		type: String,
		required: [
			function () {
				return this.status === 'published'
			},
			'Please Upload Course Thumbnail',
		],
		trim: true,
	},
	category: {
		type: mongoose.Schema.Types.ObjectId,
		ref: 'Category',
		required: [
			function () {
				return this.status === 'published'
			},
			'Please Select Course Category',
		],
	},
	level: {
		type: String,
		enum: ['Beginner', 'Intermediate', 'Advanced'],
		required: [
			function () {
				return this.status === 'published'
			},
			'Please Select Course Level',
		],
	},
	teacher: {
		type: mongoose.Schema.Types.ObjectId,
		ref: 'User',
		required: [
			function () {
				return this.status === 'published'
			},
			'teacher is required',
		],
	},
	chapters: [
		{
			type: mongoose.Schema.Types.ObjectId,
			ref: 'Chapter',
			required: [
				function () {
					return this.status === 'published'
				},
				'Please Add Chapters',
			],
		},
	],
	rating: {
		avg: {
			type: Number,
			default: 0,
		},
		count: {
			type: Number,
			default: 0,
		},
	},
	status: {
		type: String,
		enum: ['draft', 'published'],
		default: 'draft',
	},
	slug: {
		type: String,
	},
	createdAt: {
		type: Date,
		default: Date.now,
	},
})

module.exports = mongoose.model('Course', courseSchema)

courseSchema.post('save', async function (doc, next) {
	try {
		if (!doc.slug) {
			const baseSlug = slugify(doc.title, { lower: true })
			const uniqueSlug = `${baseSlug}`
			doc.slug = uniqueSlug
			await doc.save()
			next()
		} else next()
	} catch (err) {
		next(err)
	}
})

courseSchema.pre('save', async function (next) {
	console.log('pre save')
	try {
		if (this.mrp < this.price) throw new Error('MRP cannot be less than price')
		next()
	} catch (err) {
		next(err)
	}
})
