// const User = require('../models/User');

// const sendOtp = async (req, res) => {
//     try{
//         const {email} = req.body;
//         if(!email){
//             return res.status(400).json({message: 'Please provide email'});
//         }
//         const user = await User.findOne({ email });
//         if (!user) {
//             return res.status(400).json({ message: 'User not found' });
//         }
//         const otp = crypto.randomBytes(3).toString('hex');
//     }