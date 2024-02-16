const Course = require('../models/Course')
const Enrollment = require('../models/Enrollment')
const Notification = require('../models/Notification')
const { generateCertificate } = require('../utils/generateCertificate')
const excel = require('exceljs')

module.exports = {
	// Get enrolled course
	getEnrollment: async (req, res, next) => {
		try {
			const { id: courseId } = req.params
			const course = await Course.countDocuments({ _id: courseId })
			if (!course) return res.status(404).json({ message: 'Course not found' })
			const enrollment = await Enrollment.findOne({ student: req.user._id, course: courseId })
			if (!enrollment)
				return res.status(404).json({ success: true, message: 'You have not enrolled this course' })
			res.status(200).json({ success: true, enrollment })
		} catch (error) {
			next(error)
		}
	},

	// Get course completed certificate
	getCertificate: async (req, res, next) => {
		try {
			const { id: courseId } = req.params
			const course = await Course.findById(courseId)
			if (!course) return res.status(404).json({ message: 'Course not found' })
			const enrollment = await Enrollment.findOne({ student: req.user._id, course: courseId })
			if (!enrollment)
				return res.status(404).json({ success: true, message: 'You have not enrolled this course' })

			const today = new Date()
			const dd = String(today.getDate()).padStart(2, '0')
			const mm = String(today.getMonth() + 1).padStart(2, '0')
			const yyyy = today.getFullYear()
			const date = dd + '-' + mm + '-' + yyyy
            
			const image = await generateCertificate({ name: req.user.name, course: course.title, date })
			res.status(200).json({ success: true, image })
		} catch (error) {
			next(error)
		}
	},

	// Get all enrolled courses
	getAllEnrollments: async (req, res, next) => {
		try {
			const { page } = req.query || 1
			const { count } = req.query || 8

			let { from, to } = req.query

			const query = { teacher: req.user._id }

			if (from && to) {
				from += 'T00:00:00.000Z'
				to += 'T23:59:59.999Z'
				query.purchasedAt = { $gte: from, $lte: to }
			}

			const enrollments = await Enrollment.find(query)
				.populate('course', 'title price thumbnail')
				.populate('student', 'name email profileImage')
				.populate('teacher', 'name email profileImage')
				.sort({ purchasedAt: -1 })
				.skip((page - 1) * count)
				.limit(count)
			const total = await Enrollment.countDocuments(query)
			res.status(200).json({ success: true, enrollments, total })
		} catch (error) {
			next(error)
		}
	},

	// Dowload enrollment report
	getEnrollmentReport: async (req, res, next) => {
		try {
			let { from, to } = req.query
			if (!from || !to) return res.status(400).json({ message: 'Please provide from and to date' })
			from += 'T00:00:00.000Z'
			to += 'T23:59:59.999Z'
			const enrollments = await Enrollment.find({ purchasedAt: { $gte: from, $lte: to } })
				.populate('student', 'email name')
				.populate('course', 'title')

			if (!enrollments.length) return res.status(404).json({ message: 'No enrollments found' })

			const netTotalAmount = enrollments.reduce((acc, it) => acc + it.payment.price, 0)
			const netFinalAmount = enrollments.reduce((acc, it) => acc + it.payment.finalPrice, 0)
			const netDiscount = enrollments.reduce((acc, it) => acc + (it.payment.finalPrice - it.payment.price), 0)

			const workbook = new excel.Workbook()
			const worksheet = workbook.addWorksheet('Report')

			worksheet.columns = [
				{ header: 'SL. No', key: 's_no', width: 10 },
				{ header: 'Purchase Date', key: 'purchasedAt', width: 20 },
				{ header: 'Course', key: 'course_name', width: 20 },
				{ header: 'User ID', key: 'email', width: 30 },
				{ header: 'Price', key: 'price', width: 15 },
				{ header: 'Discount', key: 'discount', width: 15 },
				{ header: 'Final Price', key: 'finalPrice', width: 15 },
				{ header: 'Payment Mode', key: 'method', width: 15 },
				{ header: '', key: '', width: 20 },
				{ header: '', key: '', width: 15 },
			]

			worksheet.duplicateRow(1, 8, true)
			worksheet.getRow(1).values = ['Sales Report']
			worksheet.getRow(1).font = { bold: true, size: 16 }
			worksheet.getRow(1).alignment = { horizontal: 'center' }
			worksheet.mergeCells('A1:H1')

			worksheet.getRow(2).values = []
			worksheet.getRow(3).values = ['', 'From', from.split('T')[0]]
			worksheet.getRow(3).font = { bold: false }
			worksheet.getRow(3).alignment = { horizontal: 'right' }
			worksheet.getRow(4).values = ['', 'To', to.split('T')[0]]
			worksheet.getRow(5).values = ['', 'Total Orders', enrollments.length]
			worksheet.getRow(6).values = ['', 'Net Final Price', netFinalAmount]

			worksheet.getRow(7).values = []
			worksheet.getRow(8).values = []

			let count = 1
			enrollments.forEach((order) => {
				order.s_no = count
				order.course_name = order.course.title
				order.email = order.student.email
				order.price = order.payment.price
				order.discount = order.payment.finalPrice - order.payment.price
				order.finalPrice = order.payment.finalPrice
				order.method = order.payment.method

				worksheet.addRow(order)
				count += 1
			})

			worksheet.getRow(9).eachCell((cell) => {
				cell.font = { bold: true }
			})

			worksheet.addRow([])
			worksheet.addRow([])

			worksheet.addRow(['', '', '', '', '', '', '', '', 'Net Total Price', netTotalAmount, ''])
			worksheet.addRow(['', '', '', '', '', '', '', '', 'Net Discount Price', netDiscount, ''])
			worksheet.addRow(['', '', '', '', '', '', '', '', 'Net Final Price', netFinalAmount, ''])
			worksheet.lastRow.eachCell((cell) => {
				cell.font = { bold: true }
			})

			const xlBuffer = await workbook.xlsx.writeBuffer()

			res.setHeader('Content-Disposition', 'attachment; filename=report.xls')
			res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet')
			res.send(xlBuffer)
		} catch (error) {
			next(error)
		}
	},
}
