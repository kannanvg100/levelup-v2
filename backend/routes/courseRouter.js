const express = require('express')
const router = express.Router()
const courseController = require('../controllers/courseController')
const { protect, protectTeacher, checkUser, protectAdmin } = require('../middlewares/auth')
const upload = require('../config/multer')


//==================PUBLIC ROUTES==================//
router.get('/filters', courseController.getFilters)
router.get('/courses', checkUser, courseController.getCourses) // public
router.get('/courses-category', courseController.getCoursesLatest) 
router.get('/course/:id', checkUser, courseController.getCourseByID) // public
router.get('/instant-search', courseController.instantSearch) // public


//==================USER PROTECTED ROUTES==================//
router.get('/get-stripe-intent', courseController.getStripeIntent) // user
router.post('/create-checkout-session', protect, courseController.createCheckoutSession) // user
router.get('/my-courses', protect, courseController.getEnrolledCourses) // user


//==================TEACHER PROTECTED ROUTES==================//
router.get('/teacher/courses', protectTeacher, courseController.getCoursesByTeacher) // teacher
router.get('/all-courses-by-teacher', protectTeacher, courseController.getCoursesByTeacher) // teacher
router.delete('/delete-course/:id', protectTeacher, courseController.deleteCourse) // teacher
router.patch('/update-course-status/:id', protectTeacher, courseController.updateCourseStatus) // teacher
router.post('/create-course', protectTeacher, upload.single('thumbnail'), courseController.createCourse) // teacher
router.post('/save-draft', protectTeacher, upload.single('thumbnail'), courseController.saveDraft) // teacher
router.get('/get-upload-url', protectTeacher, courseController.createMuxUploadUrl) // teacher
router.post('/course/:id/thumbnail', protectTeacher, upload.single('thumbnail'), courseController.updateCourseImage) // teacher
router.patch('/update-course/:id', protectTeacher, upload.single('thumbnail'), courseController.updateCourse) // teacher


//==================ADMIN PROTECTED ROUTES==================//
router.get('/admin/courses', protectAdmin, courseController.getCoursesByAdmin) // admin
router.delete('/admin/delete-course/:id', protectAdmin, courseController.deleteCourseAdmin) // admin

module.exports = router
