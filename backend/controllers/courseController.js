const Mux = require('@mux/mux-node')
const stripe = require('../config/stripe')
const Course = require('../models/Course')
const Chapter = require('../models/Chapter')
const Category = require('../models/Category')
const Segment = require('../models/Segment')
const Enrollment = require('../models/Enrollment')
const Review = require('../models/Review')
const User = require('../models/User')
const Favorite = require('../models/Favorite')
const Coupon = require('../models/Promotion')
const { uploadToS3 } = require('../helpers/awsHelpers')
const slugify = require('slugify')
const mongoose  = require('mongoose')
const { Video } = new Mux(process.env.MUX_TOKEN_ID, process.env.MUX_TOKEN_SECRET)

module.exports = {
    // Get all courses
    getAllCourses: async (req, res, next) => {
        try {
            const courses = await Course.find()
            res.status(200).json({ success: true, courses })
        } catch (error) {
            next(error)
        }
    },

    // Get all filter for courses
    getFilters: async (req, res, next) => {
        try {
            let categories = await Course.aggregate([
                { $match: { status: 'published' } },
                { $group: { _id: '$category', count: { $sum: 1 } } },
                { $sort: { count: -1 } },
                { $lookup: { from: 'categories', localField: '_id', foreignField: '_id', as: 'category' } },
                { $unwind: '$category' },
                { $project: { _id: '$category._id', title: '$category.title' } },
            ])
            categories = {
                title: 'Categories',
                key: 'category',
                values: categories.map((category) => ({ title: category.title, id: category._id })),
            }

            let levels = await Course.distinct('level')
            levels = {
                title: 'Levels',
                key: 'level',
                values: levels.map((level) => ({ title: level, id: level })),
            }

            const sortOptions = [
                { title: 'Most Popular', key: 'popular' },
                { title: 'Newest', key: 'latest' },
                { title: 'Highest Rated', key: 'highest-rated' },
                { title: 'Price: High to Low', key: 'price-desc' },
                { title: 'Price: Low to High', key: 'price-asc' },
            ]

            let priceRanges = await Course.aggregate([
                // { $match: { status: 'published' } },
                { $group: { _id: null, max: { $max: '$price' }, min: { $min: '$price' } } },
            ])

            priceRanges = {
                title: 'Price',
                key: 'price',
                min: priceRanges[0].min,
                max: priceRanges[0].max,
            }

            res.status(200).json({ success: true, sortOptions, priceRanges, filters: [categories, levels] })
        } catch (error) {
            next(error)
        }
    },

    // Get all courses
    getCourses: async (req, res, next) => {
        try {
            let { page, count, search, sort, filter } = req.query

            page = parseInt(page) || 1
            count = parseInt(count) || 10

            const sortQuery = {}
            if (sort) {
                if (sort === 'latest') sortQuery['createdAt'] = -1
                if (sort === 'price-desc') sortQuery['price'] = -1
                if (sort === 'price-asc') sortQuery['price'] = 1
                // TODO: Add more sort options
                // if(sort === 'popular') sortQuery['enrolledCount'] = -1
                // if(sort === 'highest-rated') sortQuery['rating'] = -1
            }

            let filterArray = [{ status: 'published' }]

            filter = decodeURIComponent(filter)
            if (filter) {
                filter.split('&').forEach((item) => {
                    const [key, value] = item.split('=')
                    if (key === 'level') filterArray.push({ level: { $in: value.split(',') } })
                    if (key === 'category') filterArray.push({ category: { $in: value.split(',') } })
                    if (key === 'price') {
                        const [min, max] = value.split('-')
                        filterArray.push({ price: { $gte: min, $lte: max } })
                    }
                })
            }

            search = decodeURIComponent(search)
            const escapedSearchQuery = search.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
            if (escapedSearchQuery) {
                filterArray.push({
                    $or: [
                        { $text: { $search: escapedSearchQuery } },
                        { title: { $regex: new RegExp(escapedSearchQuery, 'i') } },
                    ],
                })
            }

            const totalCourses = await Course.countDocuments({ $and: filterArray })
            const courses = await Course.find({ $and: filterArray })
                .populate('teacher', 'name profileImage')
                .sort(sortQuery)
                .limit(count)
                .skip((page - 1) * count)
                .lean()

            if (req.user) {
                const favorites = await Favorite.find({ user: req.user._id })
                courses.forEach((course) => {
                    course.isFavorite = favorites.some(
                        (favorite) => favorite.course.toString() === course._id.toString()
                    )
                })
            }
            res.status(200).json({ success: true, totalCourses, courses })
        } catch (error) {
            next(error)
        }
    },

    getCoursesByTag: async (req, res, next) => {
        try {
            const tag = req.params.tag || 'latest'
            const count = req.query.count || '6'
            let courses
            if (tag === 'latest') {
                courses = await Course.find({ status: 'published' })
                    .sort({ createdAt: -1 })
                    .limit(count)
                    .select('title thumbnail slug price mrp category level teacher')
            } else if (tag === 'popular') {
                courses = await Enrollment.aggregate([
                    { $group: { _id: '$course', count: { $sum: 1 } } },
                    { $sort: { count: -1 } },
                    { $limit: count },
                    { $lookup: { from: 'courses', localField: '_id', foreignField: '_id', as: 'course' } },
                    { $unwind: '$course' },
                    {
                        $project: {
                            _id: '$course._id',
                            title: '$course.title',
                            thumbnail: '$course.thumbnail',
                            slug: '$course.slug',
                            price: '$course.price',
                            mrp: '$course.mrp',
                            category: '$course.category',
                            level: '$course.level',
                            teacher: '$course.teacher',
                        },
                    },
                ])
            }
            res.status(200).json({ success: true, courses })
        } catch (error) {
            next(error)
        }
    },

    // Get all courses by teacher
    getCoursesByTeacher: async (req, res, next) => {
        try {
            const { page, count, query, status, sort } = req.query
            const escapedQuery = query.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')

            let filterQuery = {
                teacher: req.user._id,
                $or: [{ $text: { $search: query } }, { title: { $regex: new RegExp(escapedQuery, 'i') } }],
            }

            if (status) filterQuery['status'] = { $in: status.split(',') }

            let sortQuery = {}
            if (sort) {
                const [key, value] = sort.split('-')
                sortQuery[key] = value === 'descending' ? -1 : 1
            }

            const totalCourses = await Course.countDocuments(filterQuery)
            const courses = await Course.find(filterQuery)
                .sort(sortQuery)
                .limit(count)
                .skip((page - 1) * count)
                .populate('category', 'title')
            res.status(200).json({ success: true, totalCourses, courses })
        } catch (error) {
            next(error)
        }
    },

    // Get all courses of all teachers
    getCoursesByAdmin: async (req, res, next) => {
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

            const totalCourses = await Course.countDocuments(filterQuery)
            const courses = await Course.find(filterQuery)
                .sort(sortQuery)
                .limit(count)
                .skip((page - 1) * count)
                .populate('teacher', 'name')
                .populate('category', 'title')
            res.status(200).json({ success: true, totalCourses, courses })
        } catch (error) {
            next(error)
        }
    },

    // Get course by ID
    getCourseByID: async (req, res, next) => {
        try {
            const { id: courseId } = req.params
            if (!mongoose.isValidObjectId(courseId)) return res.status(400).json({ message: 'Invalid Course ID' })

            const course = await Course.findById(courseId)
                .select('-__v')
                .populate('teacher', 'name')
                .populate('category', 'title')
                .populate({
                    path: 'chapters',
                    populate: {
                        path: 'segments',
                    },
                })
            res.status(200).json({ success: true, course })
        } catch (error) {
            next(error)
        }
    },

    // Get full course by ID
    getFullCourseByID: async (req, res, next) => {
        try {
            const { id: courseId } = req.params

            if (!mongoose.isValidObjectId(courseId))
                return res.status(400).json({ success: false, message: 'The Course You have been looking for not found' })

            const course = await Course.findById(courseId)
                .select('-__v')
                .populate('teacher', 'name profileImage')
                .populate('category', 'title')
                .populate({
                    path: 'chapters',
                    populate: {
                        path: 'segments',
                    },
                })

            if (!course)
                return res.status(404).json({ success: false, message: 'The Course You have been looking for not found' })

            const enrolled = await Enrollment.findOne({ course: courseId, student: req.user._id })
            if (!enrolled)
                return res.status(401).json({ success: false, message: 'You are not enrolled in this course' })

            res.status(200).json({ success: true, course })
        } catch (error) {
            next(error)
        }
    },

    // Get course by ID for teacher
    getCourseByIDTeacher: async (req, res, next) => {
        try {
            const { id: courseId } = req.params
            const course = await Course.findById(courseId)
                .select('-__v')
                .populate('teacher', 'name')
                .populate('category', 'title')
                .populate({
                    path: 'chapters',
                    populate: {
                        path: 'segments',
                    },
                })
            if (course.teacher._id.toString() !== req.user.id)
                return res.status(401).json({ success: false, message: 'You are not authorized to view this course' })
            res.status(200).json({ success: true, course })
        } catch (error) {
            next(error)
        }
    },

    // Create a course
    createCourse: async (req, res, next) => {
        try {
            const { _id: courseId, title, description, category, level, price, mrp, selectedTab } = req.body

            if (selectedTab === 'title_only') {
                if (!title || !title.trim())
                    return res.status(400).json({ success: false, errors: { title: 'Title is required' } })
                if (title.trim().length < 3)
                    return res
                        .status(400)
                        .json({ success: false, errors: { title: 'Title must be atleast 3 characters long' } })
                const course = await Course.create({ teacher: req.user._id, title })
                let chapter
                try {
                    chapter = await Chapter.create({ title: 'Introduction', course: course._id })
                } catch (error) {
                    await Course.findByIdAndDelete(course._id)
                    next(error)
                }
                course.chapters.push(chapter._id)
                await course.save()
                return res.status(200).json({ success: true, course })
            }

            if (!courseId) return res.status(400).json({ success: false, message: 'Invalid request' })
            const course = await Course.findById(courseId)
            if (!course) return res.status(404).json({ success: false, message: 'Course not found' })
            if (course.teacher.toString() !== req.user.id)
                return res.status(401).json({ success: false, message: 'You are not authorized to update this course' })

            if (selectedTab === 'general') {
                if (!title || !title.trim())
                    return res.status(400).json({ success: false, errors: { title: 'Title is required' } })
                if (title.trim().length < 3)
                    return res
                        .status(400)
                        .json({ success: false, errors: { title: 'Title must be atleast 3 characters long' } })
                if (!description || !description.trim())
                    return res.status(400).json({ success: false, errors: { description: 'Description is required' } })
                if (description.trim().length < 10)
                    return res.status(400).json({
                        success: false,
                        errors: { description: 'Description must be atleast 10 characters long' },
                    })
                if (!category || !category.trim())
                    return res.status(400).json({ success: false, errors: { category: 'Category is required' } })
                if (!level || !level.trim())
                    return res.status(400).json({ success: false, errors: { level: 'Level is required' } })

                course.title = title
                course.description = description
                course.category = category
                course.level = level
                await course.save()
            } else if (selectedTab === 'pricing') {
                let errors = {}
                if (!course.title || !course.title.trim()) errors.title = 'Title is required'
                if (!course.description || !course.description.trim()) errors.description = 'Description is required'
                if (!course.category) errors.category = 'Category is required'
                if (!course.level || !course.level.trim()) errors.level = 'Level is required'
                if (!course.price) errors.price = 'Price is required'
                if (!course.mrp) errors.mrp = 'MRP is required'
                if (!course.thumbnail) errors.thumbnail = 'Thumbnail is required'
                if (course.mrp < course.price) errors.mrp = 'MRP should be greater than price'

                if (course.chapters.length === 0) errors.chapters = 'Atleast one chapter is required'
                else {
                    for (let i = 0; i < course.chapters.length; i++) {
                        const chapter = await Chapter.findById(course.chapters[i])
                        if (chapter?.segments?.length === 0) {
                            errors.chapters = 'Each chapter should have atleast one segment'
                            break
                        }
                    }
                }

                if (Object.keys(errors).length > 0) return res.status(400).json({ success: false, errors })
                if (req.user.status !== 'active')
                    return res.status(400).json({ success: false, message: 'Your account is not active yet' })
                course.status = 'published'
                await course.save()
            }
            res.status(200).json({ success: true, course })
        } catch (error) {
            next(error)
        }
    },

    // Save as draft
    saveDraft: async (req, res, next) => {
        try {
            const { _id: courseId, title, description, category, level, price, mrp, selectedTab } = req.body

            if (!courseId) return res.status(400).json({ success: false, message: 'Invalid request' })
            const course = await Course.findById(courseId)
            if (!course) return res.status(404).json({ success: false, message: 'Course not found' })
            if (course.teacher.toString() !== req.user.id)
                return res.status(401).json({ success: false, message: 'You are not authorized to update this course' })

            if (selectedTab === 'title_only') {
                if (!title || !title.trim())
                    return res.status(400).json({ success: false, errors: { title: 'Title is required' } })
                course.title = title
                await course.save()
                return res.status(200).json({ success: true, course })
            }

            if (selectedTab === 'general') {
                if (title) course.title = title
                if (description) course.description = description
                if (category) course.category = category
                if (level) course.level = level
                await course.save()
            } else if (selectedTab === 'pricing') {
                if (price) course.price = price
                if (mrp) course.mrp = mrp
                await course.save()
            }
            res.status(200).json({ success: true, course })
        } catch (error) {
            next(error)
        }
    },

    // Update a course
    updateCourse: async (req, res, next) => {
        try {
            const { title, description, category, level, thumbnail, price, mrp, chapters } = req.body
            const course = await Course.findById(req.params.id)
            if (!course) return res.status(404).json({ success: false, message: 'Course not found' })
            if (course.teacher.toString() !== req.user.id)
                return res.status(401).json({ success: false, message: 'You are not authorized to update this course' })
            if (title) course.title = title
            if (description) course.description = description
            if (category) course.category = category
            if (level) course.level = level
            if (price) course.price = price
            if (mrp) course.mrp = mrp
            if (thumbnail) {
                const imgUrl = await uploadToS3('courses', req.file)
                if (imgUrl) course.image = `https://levelup.s3.ap-south-1.amazonaws.com/courses/${imgUrl}`
            }
        } catch (error) {
            next(error)
        }
    },

    // Delete a course
    deleteCourse: async (req, res, next) => {
        try {
            const course = await Course.findOne({ _id: req.params.id, teacher: req.user._id })
            if (course) {
                const enrolledCount = await Enrollment.countDocuments({ course: req.params.id })
                if (enrolledCount > 0)
                    return res
                        .status(400)
                        .json({ success: false, message: 'You cannot delete a course which has students enrolled' })
                await Course.findByIdAndDelete(req.params.id)
                res.status(200).json({ success: true, message: 'Course deleted' })
            } else {
                res.status(404).json({ message: 'Course not found' })
            }
        } catch (error) {
            next(error)
        }
    },

    // Delete a course by admin
    deleteCourseAdmin: async (req, res, next) => {
        try {
            const course = await Course.findOne({ _id: req.params.id })
            if (course) {
                const enrolledCount = await Enrollment.countDocuments({ course: req.params.id })
                if (enrolledCount > 0)
                    return res
                        .status(400)
                        .json({ success: false, message: 'You cannot delete a course which has students enrolled' })
                await Course.findByIdAndDelete(req.params.id)
                res.status(200).json({ success: true, message: 'Course deleted' })
            } else {
                res.status(404).json({ message: 'Course not found' })
            }
        } catch (error) {
            next(error)
        }
    },


    createCheckoutSession: async (req, res, next) => {
        try {
            const { courseId, code } = req.body
            const userId = req.user.id
            if (!courseId) return res.status(400).json({ success: false, errors: { code: 'Invalid request' } })
            const course = await Course.findById(courseId)
            let offerPrice = course.price
            let coupon = null
            if (code) {
                coupon = await Coupon.findOne({ code })
                if (!coupon) return res.status(400).json({ success: false, errors: { code: 'Invalid coupon code' } })
                if (coupon.user._id.toString() !== course.teacher.toString())
                    return res
                        .status(400)
                        .json({ success: false, errors: { code: 'This coupon is not applicable for this course' } })
                if (coupon.startDate > Date.now()) {
                    return res.status(400).json({ success: false, errors: { code: 'This coupon is not active yet.' } })
                }
                if (coupon.endDate < Date.now()) {
                    return res.status(400).json({ success: false, errors: { code: 'This coupon has expired.' } })
                }
                if (coupon.minPurchase > course.price) {
                    return res.status(400).json({
                        success: false,
                        errors: { code: `Minimum purchase should be ${coupon.minPurchase}` },
                    })
                }

                offerPrice = course.price * (1 - coupon.discount / 100).toFixed(2)
            }

            if (course?.status !== 'published')
                return res.status(400).json({ success: false, message: 'Course is not published yet' })

            const enrolled = await Enrollment.findOne({ course: courseId, student: userId })
            if (enrolled) return res.status(400).json({ success: false, message: 'You already enrolled this course' })
            else {
                let stripCustomerId = req?.user?.stripCustomerId
                if (!stripCustomerId) {
                    const customer = await stripe.customers.create({
                        email: req?.user?.email,
                        name: req?.user?.name,
                    })
                    stripCustomerId = customer.id
                    await User.findByIdAndUpdate(userId, { stripeCustomerId: customer.id })
                }
                const line_items = [
                    {
                        price_data: {
                            currency: 'inr',
                            product_data: {
                                name: course.title,
                            },
                            unit_amount: parseInt(offerPrice * 100),
                        },
                        quantity: 1,
                    },
                ]

                const session = await stripe.checkout.sessions.create({
                    customer: stripCustomerId,
                    payment_method_types: ['card'],
                    line_items,
                    mode: 'payment',
                    success_url: `${process.env.CLIENT_URL}/courses/${course.slug}/${course._id}?success=1`,
                    cancel_url: `${process.env.CLIENT_URL}/courses/${course.slug}/${course._id}?canceled=1`,
                    metadata: {
                        courseId: courseId,
                        studentId: userId,
                        price: course.price,
                        coupon: code,
                        discount: coupon?.discount || 0,
                        offerPrice,
                    },
                })
                res.status(200).json({ success: true, sessionUrl: session.url })
            }
        } catch (error) {
            next(error)
        }
    },

    // Get MUX upload url for video upload
    createMuxUploadUrl: async (req, res, next) => {
        const upload = await Video.Uploads.create({
            cors_origin: '*',
            new_asset_settings: {
                playback_policy: 'public',
            },
        })

        res.status(200).json({ success: true, uploadUrl: upload.url, uploadId: upload.id })
    },

    // Get Stripe intent
    getStripeIntent: async (req, res, next) => {
        try {
            const { amount } = req.body
            const paymentIntent = await stripe.paymentIntents.create({
                amount: 100 * 100,
                currency: 'inr',
            })
            res.status(200).json({ success: true, clientSecret: paymentIntent.client_secret })
        } catch (error) {
            next(error)
        }
    },

    // Update course image
    updateCourseImage: async (req, res, next) => {
        try {
            const { id: courseId } = req.params
            if (!courseId) return res.status(400).json({ success: false, message: 'Invalid request' })
            if (req.file) {
                var imgUrl = await uploadToS3('courses', req.file)
                const course = await Course.findById(courseId)
                course.thumbnail = `https://levelup.s3.ap-south-1.amazonaws.com/courses/${imgUrl}`
                await course.save()
                res.status(200).json({ success: true, thumbnail: course.thumbnail })
            } else {
                res.status(400).json({
                    success: false,
                    errros: { thumbnail: 'Looks like the image you chose didnt work' },
                })
            }
        } catch (error) {
            next(error)
        }
    },

    // Get enrolled courses
    getEnrolledCourses: async (req, res, next) => {
        try {
            let { page, count } = req.query
            page = parseInt(page) || 1
            count = parseInt(count) || 5
            const total = await Enrollment.countDocuments({ student: req.user._id })
            const courses = await Enrollment.find({ student: req.user._id })
                .populate('teacher')
                .populate({
                    path: 'course',
                    populate: {
                        path: 'chapters',
                        populate: {
                            path: 'segments',
                        },
                    },
                })
                .sort({ purchasedAt: -1 })
                .skip((page - 1) * count)
                .limit(count)
                .lean()
            //TODO: select required fields only

            const enrolledCourses = courses.map((course) => course.course._id)
            const reviews = await Review.find({ user: req.user._id, course: { $in: enrolledCourses } })
            courses.forEach((course) => {
                course.review = reviews.find((review) => review.course.toString() === course.course._id.toString())
            })

            res.status(200).json({ success: true, total, courses })
        } catch (error) {
            next(error)
        }
    },

    // Instant search results
    instantSearch: async (req, res, next) => {
        try {
            const { query } = req.query
            const escapedQuery = query.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')

            const courses = await Course.find({
                status: 'published',
                $or: [{ $text: { $search: query } }, { title: { $regex: new RegExp(escapedQuery, 'i') } }],
            })
                .limit(5)
                .populate('category', 'title')
                .populate('teacher', 'name')
                .select('title thumbnail slug category teacher')
            res.status(200).json({ success: true, courses })
        } catch (error) {
            next(error)
        }
    },

    //set course status
    updateCourseStatus: async (req, res, next) => {
        try {
            const { id: courseId } = req.params
            const { status } = req.body
            if (!courseId) return res.status(400).json({ success: false, message: 'Invalid request' })
            const course = await Course.findById(courseId)
            if (!course) return res.status(404).json({ success: false, message: 'Course not found' })
            if (course.teacher.toString() !== req.user.id)
                return res.status(401).json({ success: false, message: 'You are not authorized to update this course' })

            if (status === 'draft') {
                course.status = 'draft'
                await course.save()
                return res.status(200).json({ success: true, course })
            }

            let errors = {}
            if (!course.title || !course.title.trim()) errors.title = 'Title is required'
            if (!course.description || !course.description.trim()) errors.description = 'Description is required'
            if (!course.category) errors.category = 'Category is required'
            if (!course.level || !course.level.trim()) errors.level = 'Level is required'
            if (!course.price) errors.price = 'Price is required'
            if (!course.mrp) errors.mrp = 'MRP is required'
            if (!course.thumbnail) errors.thumbnail = 'Thumbnail is required'
            if (course.mrp < course.price) errors.mrp = 'MRP should be greater than price'

            if (course.chapters.length === 0) errors.chapters = 'Atleast one chapter is required'
            else {
                for (let i = 0; i < course.chapters.length; i++) {
                    const chapter = await Chapter.findById(course.chapters[i])
                    if (chapter?.segments?.length === 0) {
                        errors.chapters = 'Each chapter should have atleast one segment'
                        break
                    }
                }
            }

            if (Object.keys(errors).length > 0) return res.status(400).json({ success: false, errors })
            if (req.user.status !== 'active')
                return res.status(400).json({ success: false, message: 'Your account is not active yet' })
            course.status = 'published'
            await course.save()
            res.status(200).json({ success: true, course })
        } catch (error) {
            next(error)
        }
    },
}
