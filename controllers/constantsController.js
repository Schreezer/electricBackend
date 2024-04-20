const Constants = require('../models/Constants');

// Get all constants
const getConstants = async (req, res) => {
    try {
        const constants = await Constants.find();
        res.json(constants);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
}

// Get a constant by key
const getConstantByKey = async (req, res) => {
    try {
        const constant = await Constants.findOne({ key: req.body.key });
        if (!constant) {
            return res.status(404).json({ message: 'Constant not found' });
        }
        res.json(constant);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
}

// Create a new constant
const createConstant = async (req, res) => {
    try {
        const constant = new Constants(req.body);
        await constant.save();
        res.status(201).json(constant);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
}

// Update a constant
const updateConstant = async (req, res) => {
    try {
        const constant = await Constants.findOneAndUpdate({ key: req.body.key }, { value: req.body.value }, { new: true });
        if (!constant) {
            return res.status(404).json({ message: 'Constant not found' });
        }
        res.status(200).json(constant);
    }
    catch (error) {
        res.status(400).json({ message: error.message });
    }
}

module.exports = {
    getConstants,
    getConstantByKey,
    createConstant,
    updateConstant
}