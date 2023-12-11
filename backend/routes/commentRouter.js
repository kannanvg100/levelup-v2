const express = require('express')
const router = express.Router()
const commentController = require('../controllers/commentController')
const { protect } = require('../middlewares/auth')

router.get('/comments/:id', protect, commentController.getComments)
router.post('/comments/:id', protect, commentController.createComment)

module.exports = router
