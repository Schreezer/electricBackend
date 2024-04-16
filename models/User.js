const mongoose = require('mongoose');

const billData = {
    // name of consumer
    consumerName: {
        type: String,
        required: true
    },
    // house number
    houseNumber: {
        type: String,
        required: true
    },
    // meter number 
    meterNumber: {
        type: Number,
        required: true
    },
    // type
    type: {
        type: String,
        required: true
    },
    // start date
    startDate: {
        type: Date,
        required: true
    },
    // end date
    endDate: {
        type: Date,
        required: true
    },
    // number of days
    numberOfDays: {
        type: Number,
        required: true
    },
    // previous reading
    previousReading: {
        type: Number,
        required: true
    },
    // current reading
    currentReading: {
        type: Number,
        required: true
    },
    // total units consumed
    totalUnitsConsumed: {
        type: Number,
        required: true
    },

    energyCharge: {
        type: Number,
        required: true
    },
    meterRent: {
        type: Number,
        required: true
    },
    gst: {
        type: Number,
        required: true
    },
    totalAmount: {
        type: Number,
        required: true
    },
    netPayable: {
        type: Number,
        required: true
    },
    // date of issue
    dateOfIssue: {
        type: Date,
        required: true
    },
};

const userSchema = new mongoose.Schema({
    email: {
        type: String,
        required: true
    },

    houseNumber: {
        type: String,
        required: false
    },
    userType: {
        type: String,
        required: true
    },
    data: {
        type: [billData],
        required: false
    },
    otp: {
        type: String,
        required: false
    },
    otpExpiry: {
        type: Date,
        required: false
    },
    lastAddition: {
        type: Date,
        required: false
    }
});

userSchema.methods.addBillData = function(newBillData) {
    console.log('newBillData is as follows: ', newBillData)
    this.data.push(newBillData);
};
// module.exports = mongoose.model('Bill', billData);
module.exports = mongoose.model('User', userSchema);