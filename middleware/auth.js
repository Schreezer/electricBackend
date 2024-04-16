const jwt = require('jsonwebtoken');
const User = require('../models/User');

const getUserTypeById = async (userId) => {
    try {
        const user = await User.findById(userId);
        if (!user) {
            return null;
        }
        return user.userType;
    } catch (error) {
        console.error(error);
        return null;
    }
};

// Authentication Middleware
const consumerAuth = (req, res, next) => {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.replace(/^Bearer /, '');

    if (!token) {
        return res.status(401).json({ message: 'No token provided' });
    }

    jwt.verify(token, process.env.JWT_SECRET, (err, decoded) => {
        if (err) {
            return res.status(403).json({ message: 'Failed to authenticate token' });
        }
        // Attach the decoded user data to the request object
        req.user = decoded;
        next();
    });
};

const adminAuth = (req, res, next) => {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.replace(/^Bearer /, '');

    if (!token) {
        return res.status(401).json({ message: 'No token provided' });
    }

    jwt.verify(token, process.env.JWT_SECRET, (err, decoded) => {
        if (err) {
            return res.status(403).json({ message: 'Failed to authenticate token' });
        }

        getUserTypeById(decoded.userId).then((userType) => {
            if (userType && userType.toLowerCase() !== 'admin') {
                return res.status(403).json({ message: 'Unauthorized' });
            } else {
                req.user = decoded;
                next();
            }
        }).catch((error) => {
            console.error(error);
            return res.status(500).json({ message: 'Server error' });
        });
    });
};

module.exports = { consumerAuth, adminAuth };