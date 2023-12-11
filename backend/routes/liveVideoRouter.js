const express = require('express')
const router = express.Router()
const liveVideoController = require('../controllers/liveVideoController')
const { protect, protectTeacher, checkUser } = require('../middlewares/auth')

//=====================USER PROTECTED ROUTES=====================//
router.post('/get-live-video-token', protect, liveVideoController.getLiveVideoToken)
router.post('/teacher/get-live-video-token', protectTeacher, liveVideoController.getLiveVideoToken)
router.post('/get-live-video-token-join', protectTeacher, liveVideoController.getLiveVideoTokenJoin)

module.exports = router
