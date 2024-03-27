const crypto = require('crypto');

// Generate a random 256-bit (32-byte) string
const JWT_SECRET = crypto.randomBytes(32).toString('hex');

console.log('JWT_SECRET:', JWT_SECRET);