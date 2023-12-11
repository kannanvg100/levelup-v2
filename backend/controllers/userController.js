const { OAuth2Client } = require('google-auth-library')
const User = require('../models/User')
const Enrollment = require('../models/Enrollment')
const generateToken = require('../utils/generateToken')
const nodemailer = require('nodemailer')
const { uploadToS3 } = require('../helpers/awsHelpers')
const Notification = require('../models/Notification')

const clientId = process.env.GOOGLE_OAUTH_CLIENT_ID
const clientSecret = process.env.GOOGLE_OAUTH_CLIENT_SECRET
const refreshToken = process.env.GOOGLE_OAUTH_REFRESH_TOKEN

const generateOTP = () => {
	return Math.floor(100000 + Math.random() * 900000).toString()
}

module.exports = {
	// user login
	login: async (req, res, next) => {
		try {
			const { email, password, role } = req.body

			if (!email || !password)
				return res.status(400).json({ success: false, errors: { toast: 'Please fill all fields' } })

			const user = await User.findOne({ email }).select('name email method role status password profileImage')
			if (!user)
				return res.status(404).json({
					success: false,
					errors: { email: 'You are not registered with us. Pls create an account.' },
				})

			if (user.method != 'local')
				return res.status(404).json({ success: false, errors: { toast: 'Please login with google' } })

			if (user.role != role)
				return res
					.status(404)
					.json({ success: false, errors: { email: `This Email is not registered for ${role}` } })

			const isPasswordValid = await user.comparePassword(password)
			if (!isPasswordValid)
				return res.status(401).json({
					success: false,
					errors: { password: 'The password you entered is incorrect. Please try again' },
				})

			if (user.status === 'blocked')
				return res.status(401).json({
					success: false,
					errors: { toast: 'Your account has been blocked. Please contact support' },
				})

			if (user.status === 'pending')
				return res.status(401).json({
					success: false,
					errors: { toast: 'Your account is not verified. Please verify your account' },
				})

			const token = generateToken(res, user._id, role)

			res.cookie(`jwt_${role}`, token, {
				maxAge: 30 * 24 * 60 * 60 * 1000,
				httpOnly: true,
				secure: 'false',
			})

			res.status(200).json({
				success: true,
				user: {
					name: user.name,
					_id: user._id,
					email: user.email,
					profileImage: user.profileImage,
					role: user.role,
					accessToken: token,
				},
			})
		} catch (error) {
			next(error)
		}
	},

	// user signup
	socialLogin: async (req, res, next) => {
		try {
			const { type, code, role } = req.body

			const oauth2Client = new OAuth2Client({
				clientId,
				clientSecret,
				redirectUri: 'postmessage',
			})

			const { tokens } = await oauth2Client.getToken(code)
			oauth2Client.setCredentials(tokens)

			const url = 'https://people.googleapis.com/v1/people/me?personFields=emailAddresses,names,photos'
			const userInfo = await oauth2Client.request({ url })

			const email = userInfo.data.emailAddresses[0].value
			const name = userInfo.data.names[0].displayName
			const profileImage = userInfo.data.photos[0].url
			const oauthAccessToken = tokens.access_token
			const oauthRefreshToken = tokens.refresh_token

			const user = await User.findOne({ email })
			if (!user) {
				const newUser = await User.create({
					name,
					method: 'google',
					oauthAccessToken,
					oauthRefreshToken,
					email,
					profileImage,
					role,
					status: 'active',
				})
				generateToken(res, newUser._id, role)
				res.status(201).json({
					success: true,
					user: {
						_id: newUser._id,
						name: newUser.name,
						email: newUser.email,
						profileImage: newUser.profileImage,
						role: newUser.role,
					},
				})
			} else {
				if (user.status === 'blocked')
					return res.status(401).json({
						success: false,
						errors: { toast: 'Your account has been blocked. Please contact support' },
					})
				if (user.role !== role)
					return res
						.status(401)
						.json({ success: false, errors: { toast: `This Email is not registered for ${role}` } })
				user.oauthAccessToken = oauthAccessToken
				user.oauthRefreshToken = oauthRefreshToken
				await user.save()
				const token = generateToken(res, user._id, role)

				res.cookie(`jwt_${role}`, token, {
					maxAge: 30 * 24 * 60 * 60 * 1000,
					httpOnly: true,
					secure: 'false',
				})

				res.status(200).json({
					success: true,
					user: {
						name: user.name,
						_id: user._id,
						email: user.email,
						profileImage: user.profileImage,
						role: user.role,
						accessToken: token,
					},
				})
			}
		} catch (error) {
			next(error)
		}
	},

	// user send OTP
	sendOtp: async (req, res, next) => {
		try {
			const { email, password, role } = req.body

			if (!email || !password) return res.status(400).json({ success: false, message: 'Please fill all fields' })

			const userExists = await User.findOne({ email })
			if (userExists) {
				if (userExists.status === 'active') {
					if (userExists.method === 'google')
						return res.status(400).json({
							success: false,
							errors: {
								toast: 'Please login with google',
							},
						})
					if (userExists.role !== role)
						return res.status(400).json({
							success: false,
							errors: {
								email: 'This email address is already associated with a different account type. Please provide an alternative email address.',
							},
						})
					if (userExists.role === role)
						return res.status(400).json({
							success: false,
							errors: {
								email: 'This email address is already on our records. Please consider logging in or resetting your password.',
							},
						})
				}
				if (userExists.status === 'blocked') {
					return res.status(400).json({
						success: false,
						errors: {
							toast: 'Account blocked',
						},
					})
				}
				if (userExists.status === 'pending') {
					await User.findByIdAndDelete(userExists._id)
				}
			}

			let transporter = nodemailer.createTransport({
				service: 'gmail',
				auth: {
					type: 'OAuth2',
					user: 'kannanvg007@gmail.com',
					pass: 'wsuwnaosmmitgfgq',
					clientId,
					clientSecret,
					refreshToken,
				},
			})
			const otp = generateOTP()
			console.log('OTP: ', otp)
			let mailOptions = {
				from: 'kannanvg007@gmail.com',
				to: email,
				subject: `LevelUp verification code: ${otp}`,
				text: `Your OTP code is: ${otp}`,
			}

			const status = 'pending'
			await User.create({ email, password, role, otp, status })

			// transporter.sendMail(mailOptions, function (err, data) {
			// 	if (err) {
			// 		res.status(400).json({
			// 			success: false,
			// 			errors: { toast: 'Something went wrong, please try again' },
			// 		})
			// 	} else {
			// 		console.log('Email sent successfully')
			// 		res.status(201).json({
			// 			success: true,
			// 		})
			// 	}
			// })
			res.status(201).json({ success: true })
		} catch (error) {
			next(error)
		}
	},

	// user signup
	signup: async (req, res, next) => {
		try {
			const { email, password, role, otp } = req.body

			if (!email || !password)
				return res.status(400).json({
					success: false,
					errors: {
						toast: 'Something went wrong, please signup again',
					},
				})

			const user = await User.findOne({ email }).select('name email profileImage role otp')
			if (!user)
				return res.status(400).json({
					success: false,
					errors: {
						toast: 'Something went wrong, please signup again',
					},
				})

			if (user.otp !== otp)
				return res.status(400).json({
					success: false,
					errors: {
						otp: 'Please check the OTP you have entered',
					},
				})

			user.status = role === 'teacher' ? 'verification-pending' : 'active'
			await user.save()

			const token = generateToken(res, user._id, role)

			res.cookie(`jwt_${role}`, token, {
				maxAge: 30 * 24 * 60 * 60 * 1000,
				httpOnly: true,
				secure: 'false',
			})

			res.status(200).json({
				success: true,
				user: {
					name: user.name,
					_id: user._id,
					email: user.email,
					profileImage: user.profileImage,
					role: user.role,
					accessToken: token,
				},
			})
		} catch (error) {
			next(error)
		}
	},

	// user logout
	logoutUser: (req, res, next) => {
		const { role } = req.query
		try {
			res.cookie(`jwt_${role}`, '', {
				httpOnly: true,
				expires: new Date(0),
			})
			res.status(200).json({ success: true, message: 'Logged out successfully' })
		} catch (error) {
			next(error)
		}
	},

	// update user profile
	updateUserProfile: async (req, res, next) => {
		try {
			const user = await User.findById(req.user._id)
			if (user) {
				if (req.body.name && req.body.name != 'undefined') user.name = req.body.name
				if (req.body.password && req.body.password != 'undefined') user.password = req.body.password

				if (req.file) {
					const imgUrl = await uploadToS3('users', req.file)
					//TODO delete prev img from s3
					if (imgUrl) user.profileImage = `https://levelup.s3.ap-south-1.amazonaws.com/users/${imgUrl}`
				}

				const updatedUser = await user.save()

				res.status(200).json({
					success: true,
					user: {
						_id: updatedUser._id,
						name: updatedUser.name,
						email: updatedUser.email,
						profileImage: user.profileImage,
						role: updatedUser.role,
					},
				})
			} else {
				res.status(404).json({ message: 'User not found' })
			}
		} catch (error) {
			next(error)
		}
	},

	// update user profile document
	updateUserProfileDoc: async (req, res, next) => {
		try {
			const user = await User.findById(req.user._id)
			if (user) {
				if (req.file) {
					var docUrl = await uploadToS3('docs', req.file)
					if (!docUrl)
						return res
							.status(400)
							.json({ success: false, message: 'Something went wrong, please try again' })
				}
				user.docs = {
					url: `https://levelup.s3.ap-south-1.amazonaws.com/docs/${docUrl}`,
					name: req.file.originalname,
				}

				if (user.status === 'verification_pending') user.status = 'doc_uploaded'
				const updatedUser = await user.save()

				// const notification = await Notification.create({
				// 	user: req.user._id,
				// 	type: 'doc_uploaded',
				// 	receiver: 'admin',
				// })

				res.status(200).json({
					success: true,
					message: 'Document uploaded successfully',
				})
			} else {
				res.status(404).json({ message: 'User not found' })
			}
		} catch (error) {
			next(error)
		}
	},

	// get all users by role
	getAllUsers: async (req, res, next) => {
		try {
			const { page, count, query, status, sort } = req.query
			const escapedQuery = query.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')

			let filterQuery = {
               role: 'user',
				$or: [{ $text: { $search: query } }, { name: { $regex: new RegExp(escapedQuery, 'i') } }],
			}

			if (status) filterQuery['status'] = { $in: status.split(',') }

			let sortQuery = {}
			if (sort) {
				const [key, value] = sort.split('-')
				sortQuery[key] = value === 'descending' ? -1 : 1
			}

			const totalUsers = await User.countDocuments(filterQuery)

			const users = await User.find(filterQuery)
				.sort(sortQuery)
				.limit(count)
				.skip((page - 1) * count)
			res.status(200).json({ success: true, totalUsers, users })
		} catch (error) {
			next(error)
		}
	},

	// get teachers
	getAllTeachers: async (req, res, next) => {
		try {
			const { page, count, query, status, sort } = req.query
			const escapedQuery = query.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')

			let filterQuery = {
               role: 'teacher',
				$or: [{ $text: { $search: query } }, { name: { $regex: new RegExp(escapedQuery, 'i') } }],
			}

			if (status) filterQuery['status'] = { $in: status.split(',') }

			let sortQuery = {}
			if (sort) {
				const [key, value] = sort.split('-')
				sortQuery[key] = value === 'descending' ? -1 : 1
			}

			const totalUsers = await User.countDocuments(filterQuery)

			const users = await User.find(filterQuery)
				.sort(sortQuery)
				.limit(count)
				.skip((page - 1) * count)
			res.status(200).json({ success: true, totalUsers, users })
		} catch (error) {
			next(error)
		}
	},

	// change user status
	changeUserStatus: async (req, res, next) => {
		try {
			const { id, status } = req.query
			if (!id || !status) return res.status(400).json({ success: false, message: 'Please provide id and status' })

			const user = await User.findById(id)
			if (!user) return res.status(404).json({ success: false, message: 'User not found' })

			user.status = status
			await user.save()
			res.status(200).json({ success: true })
		} catch (error) {
			next(error)
		}
	},

	// get user of teacher
	getUsersOfTeacher: async (req, res, next) => {
		try {
			const { page, count } = req.query
			const totalUsers = await Enrollment.countDocuments({ teacher: req.user._id })
			const users = await Enrollment.find({ teacher: req.user._id })
				.select('-password')
				.limit(count)
				.skip((page - 1) * count)
				.populate('student', 'name email profileImage')
				.populate('course', 'title')
			res.status(200).json({ success: true, totalUsers, users })
		} catch (error) {
			next(error)
		}
	},

	// send otp for reset password
	resetSendOtp: async (req, res, next) => {
		try {
			const { email } = req.body
			if (!email)
				return res.status(400).json({ success: false, errors: { email: 'Please provide your email address' } })

			const user = await User.findOne({ email }).select('email method role status')
			if (!user)
				return res.status(404).json({
					success: false,
					email: 'This email address is not registered with us. please signup for an account',
				})

			if (user.method != 'local')
				return res.status(404).json({ success: false, message: 'Please login with google' })

			if (user.status === 'blocked')
				return res.status(401).json({
					success: false,
					message: 'Your account has been blocked. Please contact support',
				})

			if (user.status === 'pending')
				return res.status(401).json({
					success: false,
					message: 'Your account is not verified. Please signup again',
				})

			let transporter = nodemailer.createTransport({
				service: 'gmail',
				auth: {
					type: 'OAuth2',
					user: 'kannanvg007@gmail.com',
					pass: 'wsuwnaosmmitgfgq',
					clientId,
					clientSecret,
					refreshToken,
				},
			})
			const otp = generateOTP()
			console.log('OTP: ', otp)
			let mailOptions = {
				from: 'kannanvg007@gmail.com',
				to: email,
				subject: `LevelUp verification code: ${otp}`,
				text: `Your OTP code is: ${otp}`,
			}

			user.otp = otp
			await user.save()

			// transporter.sendMail(mailOptions, function (err, data) {
			// 	if (err) {
			// 		res.status(400).json({
			// 			success: false,
			// 			errors: { toast: 'Something went wrong, please try again' },
			// 		})
			// 	} else {
			// 		console.log('Email sent successfully')
			// 		res.status(201).json({
			// 			success: true,
			// 		})
			// 	}
			// })
			res.status(201).json({ success: true })
		} catch (error) {
			next(error)
		}
	},

	// check otp for reset password
	checkOtp: async (req, res, next) => {
		try {
			const { email, otp } = req.body
			if (!email || !otp)
				return res.status(400).json({ success: false, errors: { toast: 'Please provide email and otp' } })

			const user = await User.findOne({ email }).select('email method role status otp')
			if (!user) return res.status(404).json({ success: false, errors: { toast: 'User not found' } })

			if (user.otp !== otp)
				return res
					.status(400)
					.json({ success: false, errors: { otp: 'Please check the OTP you have entered' } })

			res.status(200).json({ success: true })
		} catch (error) {
			next(error)
		}
	},

	// reset password
	resetPassword: async (req, res, next) => {
		try {
			const { email, password, otp } = req.body
			if (!email || !email.trim() || !otp)
				return res.status(400).json({
					success: false,
					errors: { toast: 'Something went Werong, try resetting your password again' },
				})

			if (!password || !password.trim())
				return res.status(400).json({ success: false, errors: { toast: 'Please provide password' } })

			const user = await User.findOne({ email }).select('email method role status otp')
			if (!user) return res.status(404).json({ success: false, errors: { toast: 'User not found' } })

			if (user.otp !== otp)
				return res
					.status(400)
					.json({ success: false, errors: { toast: 'Please check the OTP you have entered' } })

			user.otp = ''
			user.password = password
			await user.save()

			res.status(200).json({ success: true })
		} catch (error) {
			next(error)
		}
	},
}
