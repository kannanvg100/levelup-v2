const mongoose = require('mongoose')

const errorHandler = (err, req, res, next) => {
	let statusCode = err.statusCode || 500
	let errors = {}

	// Mongoose Duplicate Key Error
	if (err.code === 11000) {
		statusCode = 400
        const key = Object.keys(err.keyValue)[0]
		errors[key] = `The ${Object.keys(err.keyValue)} you entered already exists`
	}

	// Mongoose validation error
	if (err.name === 'ValidationError') {
		statusCode = 400

		// Extract field names and error messages
		for (const key in err.errors) {
			if (err.errors.hasOwnProperty(key)) {
				errors[key] = err.errors[key].message
			}
		}
	}

	// Mongoose CastError
	if (err instanceof mongoose.CastError) {
		statusCode = 400
		errors[err.path] = `${err.path} is not valid`
	}

	//Other errors
	if (Object.keys(errors).length === 0) {
        statusCode = err.statusCode || 500
		errors[err.name] = err.message || 'Something went wrong'
	}

	console.error(err)

	res.status(statusCode).json({
		success: false,
		errors,
	})
}

module.exports = errorHandler
