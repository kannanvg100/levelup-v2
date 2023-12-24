const express = require('express')
const router = express.Router()
const userController = require('../controllers/userController')
const { protect, protectTeacher, protectAdmin, checkTeacher } = require('../middlewares/auth')
const upload = require('../config/multer')


//=====================PUBLIC ROUTES=====================//
router.post('/login', userController.login)
router.post('/social-login', userController.socialLogin)
router.post('/send-otp', userController.sendOtp)
router.post('/signup', userController.signup)
router.get('/logout', userController.logoutUser)
router.patch('/reset-otp', userController.resetSendOtp)
router.patch('/check-otp', userController.checkOtp)
router.post('/reset', userController.resetPassword)
router.get('/get-user', checkTeacher, userController.getUser)

//=====================USER PROTECTED ROUTES=====================//
router.patch('/profile', protect, upload.single('image'), userController.updateUserProfile)

//=====================TEACHER PROTECTED ROUTES=====================//
router.patch('/teacher/profile', protectTeacher, upload.single('image'), userController.updateUserProfile)
router.post('/teacher/profile-doc', protectTeacher, upload.single('doc'), userController.updateUserProfileDoc)
router.get('/teacher/all-users', protectTeacher, userController.getUsersOfTeacher) //teacher

//=====================ADMIN PROTECTED ROUTES=====================//
router.get('/admin/users', protectAdmin, userController.getAllUsers) //admin
router.get('/admin/teachers', protectAdmin, userController.getAllTeachers) //admin
router.patch('/change-status', protectAdmin, userController.changeUserStatus) //admin

module.exports = router
