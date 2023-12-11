const express = require('express')
const router = express.Router()
const analyticsController = require('../controllers/analyticsController.js')
const { protectTeacher, protectAdmin } = require('../middlewares/auth')

//==================TEACHER PROTECTED ROUTES==================//
router.get('/teacher/get-all-analytics', protectTeacher, analyticsController.getAllAnalyticsTeacher)

//==================ADMIN PROTECTED ROUTES==================//
router.get('/admin/get-all-analytics', protectAdmin, analyticsController.getAllAnalytics)

module.exports = router
