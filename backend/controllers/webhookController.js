const stripe = require('./../config/stripe')
const Enrollment = require('./../models/Enrollment')
const Course = require('./../models/Course')

module.exports = {
	// Stripe webhook
	stripeWebhook: async (req, res, next) => {
		try {
			const signature = req.headers['stripe-signature']
			const event = stripe.webhooks.constructEvent(req.body, signature, process.env.STRIPE_WEBHOOK_SECRET)

			const session = event.data.object
            const metadata = session?.metadata

			const { courseId, studentId } = metadata

			if (event.type === 'checkout.session.completed') {
				if (!studentId || !courseId) {
					return res.status(400).json({ message: 'Invalid request' })
				}
				const course = await Course.findById(courseId).select('teacher')
				await Enrollment.create({
					student: studentId,
					course: courseId,
					teacher: course.teacher,
					payment: {
						price: metadata?.price,
						finalPrice: metadata?.offerPrice,
                        discount: metadata?.discount,
                        code: metadata?.code,
						method: 'stripe',
						paymentData: session,
					},
				})
			} else {
				console.log('stripeWebhook unhandled:', event.type)
				return res.status(200).json({ message: 'Unhandled request' })
			}

			res.status(200).json({ success: true })
		} catch (error) {
			next(error)
		}
	},
}
