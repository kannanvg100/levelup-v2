const express = require('express')
const router = express.Router()
const courseController = require('../controllers/courseController')
const { protect, protectTeacher, checkUser, protectAdmin } = require('../middlewares/auth')
const upload = require('../config/multer')

//==================PUBLIC ROUTES==================//
router.get('/filters', courseController.getFilters)
router.get('/courses', checkUser, courseController.getCourses)
router.get('/courses/:tag', courseController.getCoursesByTag)
router.get('/course/:id', checkUser, courseController.getCourseByID)
router.get('/full-course/:id', protect, courseController.getFullCourseByID)
router.get('/instant-search', courseController.instantSearch)

//==================USER PROTECTED ROUTES==================//
router.get('/get-stripe-intent', courseController.getStripeIntent)
router.post('/create-checkout-session', protect, courseController.createCheckoutSession)
router.get('/my-courses', protect, courseController.getEnrolledCourses)

//==================TEACHER PROTECTED ROUTES==================//
router.get('/teacher/course/:id', protectTeacher, courseController.getCourseByIDTeacher)
router.get('/teacher/courses', protectTeacher, courseController.getCoursesByTeacher)
router.get('/all-courses-by-teacher', protectTeacher, courseController.getCoursesByTeacher)
router.delete('/delete-course/:id', protectTeacher, courseController.deleteCourse)
router.patch('/update-course-status/:id', protectTeacher, courseController.updateCourseStatus)
router.post('/create-course', protectTeacher, upload.single('thumbnail'), courseController.createCourse)
router.post('/save-draft', protectTeacher, upload.single('thumbnail'), courseController.saveDraft)
router.get('/get-upload-url', protectTeacher, courseController.createMuxUploadUrl)
router.post('/course/:id/thumbnail', protectTeacher, upload.single('thumbnail'), courseController.updateCourseImage)
router.patch('/update-course/:id', protectTeacher, upload.single('thumbnail'), courseController.updateCourse)

//==================ADMIN PROTECTED ROUTES==================//
router.get('/admin/courses', protectAdmin, courseController.getCoursesByAdmin)
router.delete('/admin/delete-course/:id', protectAdmin, courseController.deleteCourseAdmin)

module.exports = router
