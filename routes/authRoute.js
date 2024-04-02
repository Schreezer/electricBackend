const express = require('express');
const router = express.Router();
const crypto = require('crypto');
const nodemailer = require('nodemailer');
const User = require('../models/User');
const jwt = require('jsonwebtoken');
require('dotenv').config();

// Nodemailer configuration
const transporter = nodemailer.createTransport({
    service: 'gmail', // or your email service provider
    host: 'smtp.gmail.com',
    port: 587,
    auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
    },
});

// User Registration
router.post('/register', async (req, res) => {
    try {
        const { email, userType } = req.body;

        // Validate user input
        if (!email || !userType) {
            return res.status(400).json({ message: 'Please provide email and userType' });
        }

        // Check if user already exists
        const existingUser = await User.findOne({ email });
        
        if (existingUser) {
            return res.status(400).json({ message: 'User already exists' });
        }

        // Generate OTP
        const otp = crypto.randomBytes(3).toString('hex');

        // Set OTP expiry (e.g., 10 minutes)
        const otpExpiry = new Date(Date.now() + 10 * 60 * 1000);

        // Create a new user
        const newUser = new User({ email, userType, otp, otpExpiry });
        await newUser.save();

        // Send OTP to user's email
        const mailOptions = {
            from: process.env.EMAIL_USER,
            to: email,
            subject: 'One-Time Password for User Registration',
            text: `Your one-time password (OTP) is: ${otp}. This OTP will expire in 10 minutes.`,
        };

        transporter.sendMail(mailOptions, (error, info) => {
            if (error) {
                console.error(error);
                return res.status(500).json({ message: 'Failed to send OTP' });
            }
            console.log('OTP sent:', info.response);
            res.status(200).json({ message: 'OTP sent to your email' });
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error' });
    }
});

// User OTP Verification (new route)
router.post('/verify-otp', async (req, res) => {
    try {
        const { email, otp } = req.body;

        // Validate user input
        if (!email || !otp) {
            return res.status(400).json({ message: 'Please provide email and OTP' });
        }

        // Find the user by email and OTP
        const user = await User.findOne({ email });
        if (user.otp !== otp || user.otpExpiry < new Date()) {
            return res.status(400).json({ message: 'otp provided: ' + otp + ' otp in db: ' + user.otp + 'Invalid OTP or OTP expired' });
        }
        if (!user) {
            return res.status(400).json({ message: 'Invalid OTP or OTP expired' });
        }

        // Clear the OTP and otpExpiry fields
        user.otp = undefined;
        user.otpExpiry = undefined;
        await user.save();

        // Generate a JSON Web Token
        const token = jwt.sign({ userId: user._id }, process.env.JWT_SECRET, { expiresIn: '1y' });

        res.status(200).json({ token , userType: user.userType, userId: user._id, data: user.data, email: user.email });
    } catch (error) {
        console.error(error);
        res.status(500).json({message: res.json(error.message) });
    }
});

router.post('/request-otp', async (req, res) => {
    try {
        const { email } = req.body;

        // Validate user input
        if (!email) {
            return res.status(400).json({ message: 'Please provide email' });
        }

        // Check if user exists
        const user = await User.findOne({ email });
        if (!user) {
            return res.status(400).json({ message: 'User not found' });
        }

        // Generate OTP
        const otp = crypto.randomBytes(3).toString('hex');

        // Set OTP expiry (e.g., 10 minutes)
        const otpExpiry = new Date(Date.now() + 10 * 60 * 1000);

        // Update user's OTP and OTP expiry
        user.otp = otp;
        user.otpExpiry = otpExpiry;
        await user.save();

        // Send OTP to user's email
        const mailOptions = {
            from: process.env.EMAIL_USER,
            to: email,
            subject: 'One-Time Password for User Login',
            text: `Your one-time password (OTP) is: ${otp}. This OTP will expire in 10 minutes.`,
        };

        try {transporter.sendMail(mailOptions, (error, info) => {
            if (error) {
                console.error(error);
                return res.status(500).json({ message: 'Failed to send OTP' });
            }
            console.log('OTP sent:', info.response);
            res.status(200).json({ message: 'OTP sent to your email', otpExpiry });
        });
    }catch{
        res.status(500).json({ message: 'Failed to send OTP' });
    }
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error' });
    }
});


module.exports = router;