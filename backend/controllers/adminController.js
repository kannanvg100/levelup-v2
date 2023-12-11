const Admin = require('../models/Admin')
const generateToken = require('../utils/generateToken')

module.exports = {
	// login admin
	login: async (req, res, next) => {
		try {
			const { email, password } = req.body

			const user = await Admin.findOne({ email })
			if (!user)
				return res.status(404).json({
					success: false,
					errors: {
						email: 'User not found',
					},
				})

			const isPasswordValid = await user.comparePassword(password)
			if (!isPasswordValid)
				return res.status(401).json({ success: false, errors: { password: 'Invalid password' } })

			const token = generateToken(res, user._id, 'admin')
			res.cookie(`jwt_admin`, token, {
				maxAge: 30 * 24 * 60 * 60 * 1000,
				httpOnly: true,
				secure: 'false',
			})

			res.status(200).json({
				success: true,
				user: {
					name: user?.name || 'Admin',
					_id: user._id,
					email: user.email,
					profileImage: user?.profileImage,
					role: 'admin',
					accessToken: token,
				},
			})
		} catch (error) {
			next(error)
		}
	},

	// logout admin
	logoutUser: (req, res, next) => {
		try {
			res.cookie('jwt_admin', '', {
				httpOnly: true,
				expires: new Date(0),
			})
			res.status(200).json({ success: true, message: 'Logged out successfully' })
		} catch (error) {
			next(error)
		}
	},

	// get all users
	getUsers: async (req, res, next) => {
		const search = req.query.search || ''
		try {
			const users = await User.find({ name: { $regex: search, $options: 'i' }, isAdmin: false })
			res.status(200).json(users)
		} catch (error) {
			next(error)
		}
	},

	// update user
	updateUser: async (req, res, next) => {
		try {
			const user = await User.findById(req.body._id)

			const checkEmail = await User.findOne({ email: req.body.email })
			if (checkEmail && checkEmail._id.toString() !== req.user._id.toString()) {
				return res.status(400).json({ message: 'Email already registered with another account' })
			}

			if (user) {
				user.name = req.body.name || user.name
				user.email = req.body.email || user.email

				if (req.body.password) {
					user.password = req.body.password
				}

				if (req.file) {
					user.profileImage = req.file.filename
				}

				const updatedUser = await user.save()

				res.status(200).json({
					_id: updatedUser._id,
					name: updatedUser.name,
					email: updatedUser.email,
					profileImage: user.profileImage,
				})
			} else {
				res.status(404).json({ message: 'User not found' })
			}
		} catch (error) {
			console.log('📄 > file: adminController.js:83 > updateUser: > error:', error)
			next(error)
		}
	},

	// create a new user
	createUser: async (req, res, next) => {
		try {
			const { name, email, password } = req.body
			let user = await User.findOne({ email })
			if (user) return res.status(400).json({ message: 'Email already registered' })
			user = await User.create({
				name,
				email,
				password,
				profileImage: req?.file?.filename,
			})
			res.status(201).json({ message: 'User created successfully' })
		} catch (error) {
			next(error)
		}
	},

	// delete a user
	deleteUser: async (req, res, next) => {
		try {
			await User.findByIdAndDelete(req.body._id)
			res.status(200).json({ message: 'User deleted successfully' })
		} catch (error) {
			next(error)
		}
	},
}
