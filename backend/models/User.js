const mongoose = require('mongoose')
const bcrypt = require('bcrypt')
const validator = require('validator')

const userSchema = new mongoose.Schema({
	name: {
		type: String,
		minLength: [3, 'Name should have atleast 3 Chars'],
		default: 'User',
		trim: true,
	},
	method: {
		type: String,
		enum: ['local', 'google', 'facebook'],
		required: true,
		default: 'local',
		select: false,
	},
	oauthAccessToken: {
		type: String,
		required: function () {
			return this.method !== 'local'
		},
		select: false,
	},
	oauthRefreshToken: {
		type: String,
		required: function () {
			return this.method !== 'local'
		},
		select: false,
	},
	email: {
		type: String,
		required: [true, 'Please Enter Your Email address'],
		validate: [validator.isEmail, 'Please Enter a Valid Email'],
		unique: true,
		lowercase: true,
		trim: true,
	},
	password: {
		type: String,
		required: function () {
			return this.method === 'local'
		},
		minLength: [4, 'Password should have atleast 4 Chars'],
		trim: true,
		select: false,
	},
	role: {
		type: String,
		required: true,
		enum: ['user', 'teacher', 'admin'],
	},
	otp: {
		type: String,
		select: false,
	},
	status: {
		type: String,
		enum: ['pending', 'active', 'blocked', 'verification_pending', 'doc_uploaded', 'rejected'],
		default: 'pending',
	},
	profileImage: {
		type: String,
		default: 'https://levelup.s3.ap-south-1.amazonaws.com/default_avatar.png',
	},
	docs: {
		url: {
			type: String,
			default: '',
		},
		name: {
			type: String,
			default: '',
		},
	},
	stripCustomerId: {
		type: String,
		select: false,
	},
	createdAt: {
		type: Date,
		default: Date.now,
	},
})

userSchema.pre('save', async function (next) {
	if (!this.isModified('password')) {
		next()
	}
	this.password = await bcrypt.hash(this.password, 10)
})

userSchema.methods.comparePassword = async function (enteredPassword) {
	return await bcrypt.compare(enteredPassword, this.password)
}

module.exports = mongoose.model('User', userSchema, 'users')
