const express = require('express')
const router = express.Router()
const adminController = require('../controllers/adminController')
const { protectAdmin } = require('../middlewares/auth')
const upload = require('../config/multer')

//==================PUBLIC ROUTES==================//
/**
 * @swagger
 * /api/admin/login:
 *   post:
 *      description: Login to admin panel
 *      tags:
 *          - Admin
 *      parameters:
 *          - in: body
 *            name: body
 *            description: Login credentials
 *            schema:
 *              type: object
 *              required:
 *                 - email
 *                 - password
 *              properties:
 *                  email:
 *                      type: string
 *                  password:
 *                      type: string
 *      responses:
 *          '200':
 *              description: Login successful
 *          '500':
 *              description: Internal server error
 *          '400':
 *              description: Bad request
 */
router.post('/login', adminController.login)

router.get('/logout', adminController.logoutUser)

//==================ADMIN PROTECTED ROUTES==================//
/**
 * @swagger
 * /api/admin/users:
 *   get:
 *      description: Get all users
 *      tags:
 *          - Admin
 *      responses:
 *          '500':
 *              description: Internal server error
 *
 */
router.get('/users', protectAdmin, adminController.getUsers)
router.put('/update-user', protectAdmin, upload.single('image'), adminController.updateUser)
router.post('/add-user', protectAdmin, upload.single('image'), adminController.createUser)
router.delete('/delete-user', protectAdmin, adminController.deleteUser)

module.exports = router
