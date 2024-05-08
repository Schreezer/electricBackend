// Importing necessary modules and files
const express = require('express');
const router = express.Router();
const user = require('../models/User.js');
const constants = require('../models/Constants.js');
const { createUser, deleteUser, updateUser, addBillData,deleteBill, getUsers, getUser, updateBillData, addComment, fetchComments, getBillsByType} = require('../controllers/userController.js');
const { consumerAuth, adminAuth } = require('../middleware/auth.js');
const { getConstants, getConstantByKey, createConstant, updateConstant } = require('../controllers/constantsController.js');

// Routes for handling user operations
router.get('/Users', adminAuth, getUsers); // Get all users
router.post('/create', adminAuth, createUser); // Create a new user
router.delete('/:id', adminAuth, deleteUser); // Delete a user by ID
router.post('/updateUser', adminAuth, updateUser); // Update a user by ID
router.post('/updateBill', adminAuth, updateBillData);
router.post('/addbill', adminAuth, addBillData); // Add bill data for a user
router.post('/', consumerAuth, getUser); // Get user by ID
router.post('/getConstants', adminAuth, getConstants); // Get all constants
router.post('/getConstantByKey', adminAuth, getConstantByKey);
router.post('/createConstant', adminAuth, createConstant);
router.post('/updateConstant', adminAuth, updateConstant);
router.post('/addComment', consumerAuth, addComment); // Add comment to a user's bill
router.post('fetchComments', consumerAuth, fetchComments); // Fetch comments for a user's bill
router.post('/getBillsByType', adminAuth, getBillsByType); // Get bills by type
router.post('/deleteBill', adminAuth, deleteBill); // Delete a bill by ID
router.post('/deleteUser', adminAuth, deleteUser); // Delete a comment by ID

module.exports = router;