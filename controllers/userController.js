// const {User, Bill} = require('../models/User');

const User = require('../models/User');
require('dotenv').config();
const nodemailer = require('nodemailer');
const billSocketIdMap = require('../socketMap.js');
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
const createUser = async (req, res) => {
    try {
        const { email, houseNumber, userType, userName, consumerType, meterNumber } = req.body;

        // Check if email or house number already exist
        const existingUser = await User.findOne({ $or: [{ email }, { houseNumber }] });
        if (existingUser) {
            let message = '';
            if (existingUser.email === email) {
                message += 'Email already exists. ';
            }
            if (existingUser.houseNumber === houseNumber) {
                message += 'House number already exists.';
            }
            return res.status(400).json({ message });
        }

        const user = new User({ email, houseNumber, userType, userName, consumerType, meterNumber });
        await user.save();
        res.status(201).json(user);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
}

const deleteUser = async (req, res) => {
    try {
        const user = await User.findByIdAndDelete(req.body.id);
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }
        res.json({ message: 'User deleted successfully' });
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
}

// update User
const updateUser = async (req, res) => {
    try {
        const id = req.body.id; // Access id from URL
        const user = await User.findByIdAndUpdate(id, req.body);
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }
        const updatedUser = await User.findById(id);
        res.status(200).json({ message: 'User updated successfully as :', updatedUser });
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
}

const addBillData = async (req, res) => {
    try {
        const user = await User.findById(req.body.id);
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }
        user.addBillData(req.body.data);
        await user.save();
        // console.log('the user\'s mail id is:')
        // console.log(user.email);
        let mailOptions = {
            from: process.env.EMAIL_USER,
            to: user.email,
            subject: "Bill Added",
            text: "New Bill Added to your account."

        }
        transporter.sendMail(mailOptions, (error, info) => {
            if (error) {
                console.error(error);
                return res.status(500).json({ message: 'Failed to send mail' });
            }
            console.log('Mail sent:', info.response);
            res.status(200).json({ message: 'Mail sent to the Resident' });
        });
        res.status(201).json(user);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
}


// const updateBillData = async (req, res) => {
//     try {
//         const user = await User.findById(req.body.userId);
//         if (!user) {
//             return res.status(404).json({ message: 'User not found' });
//         }
//         let bill = await User.findOne({ 'data._id': req.body.billId });
//         if (!bill) {
//             return res.status(404).json({ message: 'Bill not found' });
//         }

//         // Update bill with data from req.body.data
//         bill = req.body.data;
//         await bill.save();

//         res.status(200).json({ message: 'Bill updated successfully', bill });
//     } catch (error) {
//         res.status(400).json({ message: error.message });
//     }
// }


const updateBillData = async (req, res) => {
    try {
        console.log("updating user bill");
        const { userId, billId, data } = req.body;
        // Verify if the user exists
        const user = await User.findById(userId);
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        // Find the bill within the user's data
        // Find the bill within the user's data
        const bill = user.data.id(billId);
        if (!bill) {
            return res.status(404).json({ message: 'Bill not found' });
        }
        else {
            console.log("Bill found");
            console.log(bill.dateOfIssue);
        }


        // Attempt to update the bill within the user document
        const updateResult = await User.updateOne(
            { _id: userId, 'data._id': billId },
            { $set: { 'data.$': { ...data, _id: billId, comments: bill.comments } } } // Update the matched bill with new data, ensuring the bill ID remains unchanged and comments array remains unchanged
        );
        // Check if the bill was found and updated
        if (updateResult.modifiedCount === 0) {
            return res.status(404).json({ message: 'Bill not found or update failed' });
        }

        // Successfully updated
        res.status(200).json({ message: 'Bill updated successfully', bill: data });
    } catch (error) {
        console.error('Error updating bill:', error);
        res.status(500).json({ message: error.message });
    }
};


const deleteBill = async (req, res) => {
    try {
        console.log("deleting user bill")
        const {userId, billId} = req.body;
        const user = await User.findById(userId);
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        } 
        const bill = user.data.id(billId);
        if (!bill) {
            return res.status(404).json({ message: 'Bill not found' });
        }
        bill.deleteOne();

        await user.save();
        res.status(200).json({ message: 'Bill deleted successfully' });
        console.log()
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
}

const getUsers = async (req, res) => {
    try {
        const users = await User.find({}, { data: 0 }); // Exclude 'data' field
        res.json(users);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
}
const getUser = async (req, res) => {
    console.log(req.body.id)
    try {
        const user = await User.findById(req.body.id);
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }
        res.json(user);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
}

const addComment = async (req, res) => {
    try {
        console.log("Adding comment to user bill");
        const { userId, billId, comment, writer } = req.body;
        // Verify if the user exists
        const user = await User.findById(userId);
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }
        else {
            console.log("User found");
        }

        // Find the bill within the user's data
        const bill = user.data.id(billId);
        if (!bill) {
            return res.status(404).json({ message: 'Bill not found' });
        }
        else {
            console.log("Bill found");
            console.log(bill.dateOfIssue);
        }

        // Add the new comment to the bill's comments array
        bill.comments.push({
            text: comment,
            writer: writer,
            date: Date.now()
        });

        // Save the user document
        await user.save();

        // const socketIds = billSocketIdMap[billId];
        // if (socketIds) {
        //     socketIds.forEach(socketId => {
        //         io.to(socketId).emit('commentAdded', { text: comment, writer: writer });
        //     });
        // }

        // Successfully added comment
        res.status(200).json({ message: 'Comment added successfully', comment: { text: comment, writer: writer } });
    } catch (error) {
        console.error('Error adding comment:', error);
        res.status(500).json({ message: error.message });
    }
};

const fetchComments = async (req, res) => {
    try {
        const { userId, billId } = req.body;
        // Verify if the user exists
        const user = await User.findById(userId);
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }
        const bill = user.data.id(billId);
        if (!bill) {
            return res.status(404).json({ message: 'Bill not found' });
        }
        res.status(200).json({ comments: bill.comments });
    }
    catch (error) {
        console.error('Error fetching comments:', error);
        res.status(500).json({ message: error.message });
    }
};

// a function that has the req parameters of type, starting month, and year, so that it returns the total amounts, user names and house numbers of the users' bills who have the same type of consumerType and the same starting month and year of the corresponding bill
const getBillsByType = async (req, res) => {
    try {
        const months = [
            'January',
            'February',
            'March',
            'April',
            'May',
            'June',
            'July',
            'August',
            'September',
            'October',
            'November',
            'December'
        ];

        const { type, month, year } = req.body;

        const monthIndex = months.indexOf(month);
        if (monthIndex === -1) {
            // handle error: invalid month
            console.error(`Invalid month: ${month}`);
            // return error response to client
            res.status(400).send({ error: 'Invalid month' });
            return;
        }

        // now you can use monthIndex, which is a zero-based index (0-11)
        console.log(`Month index: ${monthIndex}`);

        const users = await User.find({ consumerType: type });
        console.log(users);
        console.log(type, month, year);
        let dataArray = [];
        const bills = users.map(user => {
            return user.data.filter(bill => {
                const billMonth = new Date(bill.startDate).getMonth();
                const billYear = new Date(bill.startDate).getFullYear();
                console.log(billMonth, billYear);
                if (billMonth.toString() === monthIndex.toString() && billYear.toString() === year.toString()) {
                    dataArray.push({ totalAmount: bill.totalAmount, userName: user.userName, houseNumber: user.houseNumber, startDate: bill.startDate, endDate: bill.endDate });
                }
                return billMonth.toString() === monthIndex.toString() && billYear.toString() === year.toString();
            });
        });
        console.log(dataArray);
        res.status(200).json({ dataArray });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// const getBillsByType = async (req, res) => {
//     try {
//       const { type, month, year } = req.body;

//       // Convert month to a zero-based index (January = 0, February = 1, etc.)
//       const monthIndex = new Date(year, month - 1).getMonth();

//       const users = await User.find({ consumerType: type });

//       console.log(type, month, year);

//       const bills = users.reduce((acc, user) => {
//         const userBills = user.data.filter(bill => {
//           const billDate = new Date(bill.startDate);
//           const billMonth = billDate.getMonth().toString();
//           const billYear = billDate.getFullYear();

//           return billMonth === monthIndex && billYear === year;
//         });

//         return [...acc, ...userBills];
//       }, []);

//       res.status(200).json({ bills });
//     } catch (error) {
//       res.status(500).json({ message: error.message });
//     }
//   };
module.exports = {
    getUser,
    getUsers,
    addBillData,
    createUser,
    deleteUser,
    deleteBill,
    updateUser,
    updateBillData,
    addComment,
    fetchComments,
    getBillsByType,
};