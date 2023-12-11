const express = require('express')
const router = express.Router()
const reviewController = require('../controllers/reviewController')
const { protect } = require('../middlewares/auth')

//==================USER PROTECTED ROUTES==================//
router.get('/review/:id', protect, reviewController.getReviews)
router.post('/review/:id', protect, reviewController.createReview)

module.exports = router
