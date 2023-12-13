const express = require('express')
const router = express.Router()
const favoriteController = require('../controllers/favoriteController.js')
const { protect } = require('../middlewares/auth.js')

//==================USER PROTECTED ROUTES==================//
router.get('/favorites', protect, favoriteController.getFavorites)
router.post('/favorites/:id', protect, favoriteController.createFavorite)
router.delete('/favorites/:id', protect, favoriteController.deleteFavorite)

module.exports = router
