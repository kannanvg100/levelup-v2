const express = require('express')
const router = express.Router()
const reviewController = require('../controllers/reviewController')
const { protect } = require('../middlewares/auth')


//==================PUBLIC ROUTES==================//
router.get('/review/:id', reviewController.getReviews)


//==================USER PROTECTED ROUTES==================//
router.post('/review/:id', protect, reviewController.createReview)

module.exports = router
