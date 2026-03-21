const mongoose = require('mongoose');
const { toOrderNumber } = require('../helpers/orderNumber');

const orderSchema = mongoose.Schema({
    orderItems: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'OrderItem',
        required: true
    }],
    shippingAddress1: {
        type: String,
        required: true,
    },
    shippingAddress2: {
        type: String,
    },
    city: {
        type: String,
        default: '',
    },
    zip: {
        type: String,
        default: '',
    },
    country: {
        type: String,
        default: 'Philippines',
    },
    phone: {
        type: String,
        required: true,
    },
    region: {
        type: String,
        default: '',
    },
    province: {
        type: String,
        default: '',
    },
    cityMunicipality: {
        type: String,
        default: '',
    },
    barangay: {
        type: String,
        default: '',
    },
    status: {
        type: String,
        required: true,
        default: 'Pending',
    },
    totalPrice: {
        type: Number,
        default: 0,
    },
    paymentMethod: {
        type: String,
        enum: ['COD', 'Online'],
        default: 'COD',
    },
    paymentStatus: {
        type: String,
        enum: ['Pending', 'Paid', 'Failed'],
        default: 'Pending',
    },
    paymentId: {
        type: String,
        default: '',
    },
    cancellationReason: {
        type: String,
        default: '',
    },
    cancelledAt: {
        type: Date,
    },
    shippedAt: {
        type: Date,
    },
    deliveredAt: {
        type: Date,
    },
    deliveredConfirmedByUser: {
        type: Boolean,
        default: false,
    },
    statusLocked: {
        type: Boolean,
        default: false,
    },
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
    },
    dateOrdered: {
        type: Date,
        default: Date.now,
    },
})

orderSchema.virtual('id').get(function () {
    return this._id.toHexString();
});

orderSchema.virtual('orderNumber').get(function () {
    return toOrderNumber(this);
});

orderSchema.set('toJSON', {
    virtuals: true,
});

exports.Order = mongoose.model('Order', orderSchema);



/**
Order Example:

{
    "orderItems" : [
        {
            "quantity": 3,
            "product" : "5fcfc406ae79b0a6a90d2585"
        },
        {
            "quantity": 2,
            "product" : "5fd293c7d3abe7295b1403c4"
        }
    ],
    "shippingAddress1" : "Flowers Street , 45",
    "shippingAddress2" : "1-B",
    "city": "Prague",
    "zip": "00000",
    "country": "Czech Republic",
    "phone": "+420702241333",
    "user": "5fd51bc7e39ba856244a3b44"
}

 */