const express = require('express');
const router = express.Router();
const user = require('../models/User.js');
const { createUser, deleteUser, updateUser, addBillData, getUsers, getUser } = require('../controllers/userController.js');
const { consumerAuth, adminAuth } = require('../middleware/auth.js');

router.get('/Users',adminAuth ,getUsers);
router.post('/create', adminAuth,createUser);
router.delete('/:id',adminAuth ,deleteUser);
router.patch('/:id',adminAuth ,updateUser);
router.post('/:id/bill',adminAuth ,addBillData);
router.post('/',consumerAuth, getUser); 

module.exports = router;