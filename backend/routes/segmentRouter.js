const express = require('express')
const router = express.Router()
const segmentController = require('../controllers/segmentController')
const { protect, protectTeacher, checkUser } = require('../middlewares/auth')

//=====================USER PROTECTED ROUTES=====================//
router.put('/set-progress/:courseId/:chapterId/:segmentId', protect, segmentController.markSegmentAsComplete)


//==================TEACHER PROTECTED ROUTES==================//
router.post('/create-segment/:chapterId', protectTeacher, segmentController.createSegment)
router.patch('/edit-segment/:segmentId', protectTeacher, segmentController.editSegment)
router.delete('/delete-segment/:segmentId', protectTeacher, segmentController.deleteSegment)
module.exports = router
