const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
    },
    email: {
        type: String,
        required: true,
    },
    passwordHash: {
        type: String,
        required: true,
    },
    image: {
        type: String,
        default: ''
    },
    phone: {
        type: String,
        required: true,
    },
    isAdmin: {
        type: Boolean,
        default: false,
    },
    isActive: {
        type: Boolean,
        default: true,
    },
    deactivationReason: {
        type: String,
        default: ''
    },
    deactivatedAt: {
        type: Date,
        default: null,
    },
    street: {
        type: String,
        default: ''
    },
    apartment: {
        type: String,
        default: ''
    },
    zip :{
        type: String,
        default: ''
    },
    city: {
        type: String,
        default: ''
    },
    country: {
        type: String,
        default: ''
    },
    region: {
        type: String,
        default: ''
    },
    province: {
        type: String,
        default: ''
    },
    cityMunicipality: {
        type: String,
        default: ''
    },
    barangay: {
        type: String,
        default: ''
    },
    firebaseUid: {
        type: String,
        default: ''
    },
    pushTokens: {
        type: [String],
        default: []
    },
    resetPasswordCodeHash: {
        type: String,
        default: ''
    },
    resetPasswordCodeExpires: {
        type: Date,
        default: null
    }

});

userSchema.virtual('id').get(function () {
    return this._id.toHexString();
});

userSchema.set('toJSON', {
    virtuals: true,
});

exports.User = mongoose.model('User', userSchema);


// {   "name": "",
//     "email": "",
//     "passwordHash": "password",
//     "phone": "0999992123",
//     "isAdmin": true,
//     "street": "champaca st",
//     "apartment": "champaca apartment",
//     "zip": "1630",
//     "city": "Taguig city",
//     "country": "Philippines",
// }
