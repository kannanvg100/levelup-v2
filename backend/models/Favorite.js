const mongoose = require('mongoose')
const favoriteSchema = new mongoose.Schema({
    user: {
        type: mongoose.Schema.Types.ObjectId,
		ref: 'User',
		required: true,
	},
    course: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Course',
        required: true,
    },
	createdAt: {
		type: Date,
		default: Date.now,
	},
})

module.exports = mongoose.model('Favorite', favoriteSchema)
