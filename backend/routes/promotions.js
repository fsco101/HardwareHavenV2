const express = require('express');
const { Promotion } = require('../models/promotion');
const { Product } = require('../models/product');
const { User } = require('../models/user');
const { Order } = require('../models/order');
const { Notification } = require('../models/notification');
const { getPHTime } = require('../helpers/phTime');
const { adminOnly } = require('../helpers/jwt');
const { sendExpoPushNotifications } = require('../helpers/pushNotifications');
const router = express.Router();

function getIO(req) {
    return req.app.get('io');
}

async function createNotification(req, { userId, title, message, type, productId }) {
    const notification = new Notification({ user: userId, title, message, type, productId });
    await notification.save();

    const io = getIO(req);
    if (io) {
        io.to(userId.toString()).emit('notification', notification);
    }

    const user = await User.findById(userId).select('pushTokens');
    const tokens = user?.pushTokens || [];
    if (tokens.length > 0) {
        const pushResult = await sendExpoPushNotifications(tokens, {
            title,
            body: message,
            data: {
                type,
                productId: productId ? String(productId) : undefined,
            },
        });

        if (pushResult.staleTokens.length > 0) {
            await User.findByIdAndUpdate(userId, {
                $pull: { pushTokens: { $in: pushResult.staleTokens } },
            });
        }
    }

    return notification;
}

// Get all active promotions (public)
router.get('/', async (req, res) => {
    try {
        const now = getPHTime();
        const promotions = await Promotion.find({ isActive: true, endTime: { $gt: now } })
            .populate('product', 'name image price category')
            .sort({ dateCreated: -1 });
        res.json(promotions);
    } catch (err) {
        res.status(500).json({ success: false, error: err.message });
    }
});

// Get all promotions (admin - includes expired)
router.get('/admin/all', adminOnly, async (req, res) => {
    try {
        const promotions = await Promotion.find()
            .populate('product', 'name image price category')
            .populate('createdBy', 'name')
            .sort({ dateCreated: -1 });
        res.json(promotions);
    } catch (err) {
        res.status(500).json({ success: false, error: err.message });
    }
});

// Get active promotion for a specific product
router.get('/product/:productId', async (req, res) => {
    try {
        const now = getPHTime();
        const promotion = await Promotion.findOne({
            product: req.params.productId,
            isActive: true,
            endTime: { $gt: now },
        });
        res.json(promotion);
    } catch (err) {
        res.status(500).json({ success: false, error: err.message });
    }
});

// Create promotion (admin)
router.post('/', adminOnly, async (req, res) => {
    try {
        const { productId, discountedPrice, durationMinutes, targetUsers, specificUsers, createdBy } = req.body;

        if (!productId || discountedPrice == null || !durationMinutes) {
            return res.status(400).json({ success: false, message: 'productId, discountedPrice, and durationMinutes are required' });
        }

        if (durationMinutes < 5 || durationMinutes > 1440) {
            return res.status(400).json({ success: false, message: 'Duration must be between 5 minutes and 24 hours (1440 minutes)' });
        }

        const product = await Product.findById(productId);
        if (!product) {
            return res.status(404).json({ success: false, message: 'Product not found' });
        }

        if (discountedPrice >= product.price) {
            return res.status(400).json({ success: false, message: 'Discounted price must be less than the original price' });
        }

        // Deactivate any existing active promotion for this product
        await Promotion.updateMany(
            { product: productId, isActive: true },
            { isActive: false }
        );

        const now = getPHTime();
        const endTime = new Date(now.getTime() + durationMinutes * 60 * 1000);

        const promotion = new Promotion({
            product: productId,
            originalPrice: product.price,
            discountedPrice,
            startTime: now,
            endTime,
            targetUsers: targetUsers || 'all',
            specificUsers: specificUsers || [],
            createdBy,
        });

        await promotion.save();

        // Determine target users for notifications
        let targetUserIds = [];
        if (targetUsers === 'all') {
            const users = await User.find({ isAdmin: false }, '_id');
            targetUserIds = users.map(u => u._id);
        } else if (targetUsers === 'top_buyers') {
            // Users with the most delivered orders
            const topBuyers = await Order.aggregate([
                { $match: { status: 'Delivered' } },
                { $group: { _id: '$user', orderCount: { $sum: 1 } } },
                { $sort: { orderCount: -1 } },
                { $limit: 50 },
            ]);
            targetUserIds = topBuyers.map(b => b._id);
        } else if (targetUsers === 'big_spenders') {
            // Users with highest total spending
            const bigSpenders = await Order.aggregate([
                { $match: { status: 'Delivered' } },
                { $group: { _id: '$user', totalSpent: { $sum: '$totalPrice' } } },
                { $sort: { totalSpent: -1 } },
                { $limit: 50 },
            ]);
            targetUserIds = bigSpenders.map(b => b._id);
        } else if (targetUsers === 'specific' && specificUsers?.length) {
            targetUserIds = specificUsers;
        }

        // Send notifications
        const discount = Math.round((1 - discountedPrice / product.price) * 100);
        for (const uid of targetUserIds) {
            await createNotification(req, {
                userId: uid,
                title: `🔥 ${discount}% OFF - ${product.name}`,
                message: `${product.name} is now ₱${discountedPrice} (was ₱${product.price})! Hurry, offer ends in ${durationMinutes >= 60 ? Math.round(durationMinutes / 60) + 'h' : durationMinutes + 'min'}!`,
                type: 'promotion',
                productId: product._id,
            });
        }

        const populated = await Promotion.findById(promotion._id)
            .populate('product', 'name image price category');

        res.status(201).json(populated);
    } catch (err) {
        res.status(500).json({ success: false, error: err.message });
    }
});

// Deactivate promotion (admin)
router.put('/deactivate/:id', adminOnly, async (req, res) => {
    try {
        const promotion = await Promotion.findByIdAndUpdate(
            req.params.id,
            { isActive: false },
            { new: true }
        );
        if (!promotion) return res.status(404).json({ success: false, message: 'Promotion not found' });
        res.json(promotion);
    } catch (err) {
        res.status(500).json({ success: false, error: err.message });
    }
});

// Delete promotion (admin)
router.delete('/:id', adminOnly, async (req, res) => {
    try {
        const promotion = await Promotion.findByIdAndDelete(req.params.id);
        if (!promotion) return res.status(404).json({ success: false, message: 'Promotion not found' });
        res.json({ success: true });
    } catch (err) {
        res.status(500).json({ success: false, error: err.message });
    }
});

module.exports = router;
