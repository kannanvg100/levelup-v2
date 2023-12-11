const express = require('express')
const router = express.Router()
const categoryController = require('../controllers/categoryController')
const { protectTeacher, protectAdmin } = require('../middlewares/auth')

//==================PUBLIC ROUTES==================//
router.get('/published-categories', categoryController.getPublishedCategories)
router.get('/category/:id', categoryController.getCategoryById)

//==================ADMIN PROTECTED ROUTES==================//
router.get('/admin/categories',protectAdmin, categoryController.getAllCategories)
router.post('/category', protectAdmin, categoryController.createCategory)
router.patch('/category/:id', protectAdmin, categoryController.updateCategory)
router.delete('/category/:id', protectAdmin, categoryController.deleteCategory)
router.patch('/change-category-status', protectAdmin, categoryController.changeCategoryStatus)

module.exports = router
