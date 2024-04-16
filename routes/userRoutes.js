// Importing necessary modules and files
const express = require('express');
const router = express.Router();
const user = require('../models/User.js');
const { createUser, deleteUser, updateUser, addBillData, getUsers, getUser, updateBillData } = require('../controllers/userController.js');
const { consumerAuth, adminAuth } = require('../middleware/auth.js');

// Routes for handling user operations
router.get('/Users', adminAuth, getUsers); // Get all users
router.post('/create', adminAuth, createUser); // Create a new user
router.delete('/:id', adminAuth, deleteUser); // Delete a user by ID
router.post('/updateUser', adminAuth, updateUser); // Update a user by ID
router.post('/updateBill', adminAuth, updateBillData);
router.post('/addbill', adminAuth, addBillData); // Add bill data for a user
router.post('/', consumerAuth, getUser); // Get user by ID

module.exports = router;