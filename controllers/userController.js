// const {User, Bill} = require('../models/User');

const User = require('../models/User');

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

        const user = new User({ email, houseNumber, userType, userName, consumerType, meterNumber});
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
        
        // Attempt to update the bill within the user document
        const updateResult = await User.updateOne(
            { _id: userId, 'data._id': billId },
            { $set: { 'data.$': { ...data, _id: billId } } } // Update the matched bill with new data, ensuring the bill ID remains unchanged
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

module.exports = {
    getUser,
    getUsers,
    addBillData,
    createUser,
    deleteUser,
    updateUser,
    updateBillData,
};
