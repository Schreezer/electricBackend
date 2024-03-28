const User = require('../models/User');

const createUser = async (req, res) => {
    try {
        // const user = await User.create(req.body);
        const { email, houseNumber, userType } = req.body;
        const user = new User({ email, houseNumber, userType });
        await user.save();
        res.status(201).json(user);
    } catch (error) {
        res.status(400).json({ message: res.json(error.message) });
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
    updateUser
};
