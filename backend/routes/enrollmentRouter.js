const express = require('express')
const router = express.Router()
const enrollmentController = require('../controllers/enrollmentController.js')
const { protect, protectTeacher } = require('../middlewares/auth.js')

//==================USER PROTECTED ROUTES==================//
router.get('/enrollment/:id', protect, enrollmentController.getEnrollment)
router.get('/certificate/:id', protect, enrollmentController.getCertificate)
router.get('/enrollments', protectTeacher, enrollmentController.getAllEnrollments)
router.get('/report', protectTeacher, enrollmentController.getEnrollmentReport)

module.exports = router
