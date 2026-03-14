const mongoose = require('mongoose');

const promotionSchema = mongoose.Schema({
    product: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Product',
        required: true,
    },
    originalPrice: {
        type: Number,
        required: true,
    },
    discountedPrice: {
        type: Number,
        required: true,
    },
    startTime: {
        type: Date,
        required: true,
    },
    endTime: {
        type: Date,
        required: true,
    },
    isActive: {
        type: Boolean,
        default: true,
    },
    targetUsers: {
        type: String,
        enum: ['all', 'top_buyers', 'big_spenders', 'specific'],
        default: 'all',
    },
    specificUsers: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
    }],
    createdBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
    },
    dateCreated: {
        type: Date,
        default: Date.now,
    },
});

promotionSchema.virtual('id').get(function () {
    return this._id.toHexString();
});

promotionSchema.set('toJSON', {
    virtuals: true,
});

exports.Promotion = mongoose.model('Promotion', promotionSchema);
