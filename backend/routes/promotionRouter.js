const express = require('express')
const promotionController = require('../controllers/promotionController')
const { protectTeacher } = require('../middlewares/auth')

const router = express.Router()

router.get('/teacher/coupons', protectTeacher, promotionController.getCoupons)
router.get('/teacher/course-coupons', promotionController.getCourseCoupons)
router.post('/teacher/coupons', protectTeacher, promotionController.createCoupon)
router.patch('/teacher/coupons', protectTeacher, promotionController.deleteCoupon)

module.exports = router
