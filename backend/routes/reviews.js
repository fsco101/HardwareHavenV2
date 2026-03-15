const express = require('express');
const { Review } = require('../models/review');
const { Product } = require('../models/product');
const { Order } = require('../models/order');
const { OrderItem } = require('../models/order-item');
const mongoose = require('mongoose');
const ProfanityFilter = require('../helpers/profanityFilter');
const { adminOnly } = require('../helpers/jwt');
const router = express.Router();

const filter = new ProfanityFilter();

// Helper: recalculate product rating & numReviews
async function updateProductRating(productId) {
    const reviews = await Review.find({ product: productId });
    const numReviews = reviews.length;
    const rating = numReviews > 0
        ? reviews.reduce((sum, r) => sum + r.rating, 0) / numReviews
        : 0;
    await Product.findByIdAndUpdate(productId, {
        rating: Math.round(rating * 10) / 10,
        numReviews,
    });
}

// Helper: check if user has a delivered order containing the product
async function hasVerifiedPurchase(userId, productId) {
    const orders = await Order.find({
        user: userId,
        status: 'Delivered',
    }).populate('orderItems');

    for (const order of orders) {
        for (const item of order.orderItems) {
            if (item.product && item.product.toString() === productId.toString()) {
                return true;
            }
        }
    }
    return false;
}

// GET reviews for a product
router.get('/product/:productId', async (req, res) => {
    try {
        const reviews = await Review.find({ product: req.params.productId })
            .populate('user', 'name image')
            .sort({ dateCreated: -1 });
        res.send(reviews);
    } catch (err) {
        res.status(500).json({ success: false, error: err.message });
    }
});

// GET admin review management list
router.get('/admin/manage', adminOnly, async (req, res) => {
    try {
        const search = String(req.query.search || '').trim();
        const rating = Number(req.query.rating || 0);
        const categoryId = String(req.query.category || '').trim();
        const productId = String(req.query.product || '').trim();

        const query = {};

        if (rating >= 1 && rating <= 5) {
            query.rating = rating;
        }

        let requestedProductId = null;
        if (productId && mongoose.isValidObjectId(productId)) {
            requestedProductId = productId;
        }

        const products = await Product.find(categoryId && mongoose.isValidObjectId(categoryId)
            ? { category: categoryId }
            : {})
            .select('_id name category')
            .populate('category', 'name');

        const allowedProductIds = products.map((p) => p._id.toString());

        if (categoryId && mongoose.isValidObjectId(categoryId)) {
            if (requestedProductId) {
                query.product = allowedProductIds.includes(String(requestedProductId))
                    ? requestedProductId
                    : { $in: [] };
            } else {
                query.product = { $in: allowedProductIds };
            }
        } else if (requestedProductId) {
            query.product = requestedProductId;
        }

        const reviews = await Review.find(query)
            .populate('user', 'name email image')
            .populate({
                path: 'product',
                select: 'name category image',
                populate: { path: 'category', select: 'name' },
            })
            .sort({ dateCreated: -1 });

        const filtered = search
            ? reviews.filter((review) => {
                const userName = String(review?.user?.name || '').toLowerCase();
                const userEmail = String(review?.user?.email || '').toLowerCase();
                const productName = String(review?.product?.name || '').toLowerCase();
                const comment = String(review?.comment || '').toLowerCase();
                const term = search.toLowerCase();

                return (
                    userName.includes(term) ||
                    userEmail.includes(term) ||
                    productName.includes(term) ||
                    comment.includes(term)
                );
            })
            : reviews;

        return res.json(filtered);
    } catch (err) {
        return res.status(500).json({ success: false, error: err.message });
    }
});

// POST create a review (verified purchase required)
router.post('/', async (req, res) => {
    try {
        const { user, product, rating, comment } = req.body;

        if (!user || !product || !rating) {
            return res.status(400).send('User, product, and rating are required');
        }

        if (!mongoose.isValidObjectId(user) || !mongoose.isValidObjectId(product)) {
            return res.status(400).send('Invalid user or product ID');
        }

        // Check verified purchase
        const verified = await hasVerifiedPurchase(user, product);
        if (!verified) {
            return res.status(403).json({
                success: false,
                message: 'You can only review products you have purchased and received.',
            });
        }

        // Check if user already reviewed this product
        const existing = await Review.findOne({ user, product });
        if (existing) {
            return res.status(400).json({
                success: false,
                message: 'You have already reviewed this product. You can update your existing review.',
            });
        }

        // Filter bad words from comment
        const cleanComment = comment ? filter.clean(comment) : '';

        let review = new Review({
            user,
            product,
            rating: Math.min(5, Math.max(1, Number(rating))),
            comment: cleanComment,
        });

        review = await review.save();
        await updateProductRating(product);

        // Populate user for response
        review = await Review.findById(review._id).populate('user', 'name image');

        res.status(201).send(review);
    } catch (err) {
        res.status(500).json({ success: false, error: err.message });
    }
});

// PUT update own review
router.put('/:id', async (req, res) => {
    try {
        const review = await Review.findById(req.params.id);
        if (!review) {
            return res.status(404).send('Review not found');
        }

        // Only the review owner can update
        if (req.body.user && review.user.toString() !== req.body.user) {
            return res.status(403).json({
                success: false,
                message: 'You can only update your own reviews.',
            });
        }

        // Filter bad words
        const cleanComment = req.body.comment ? filter.clean(req.body.comment) : review.comment;

        const updatedReview = await Review.findByIdAndUpdate(
            req.params.id,
            {
                rating: req.body.rating ? Math.min(5, Math.max(1, Number(req.body.rating))) : review.rating,
                comment: cleanComment,
            },
            { new: true }
        ).populate('user', 'name image');

        await updateProductRating(review.product);

        res.send(updatedReview);
    } catch (err) {
        res.status(500).json({ success: false, error: err.message });
    }
});

// DELETE review
router.delete('/:id', async (req, res) => {
    try {
        const review = await Review.findById(req.params.id);
        if (!review) {
            return res.status(404).send('Review not found');
        }

        const productId = review.product;
        await Review.findByIdAndDelete(req.params.id);
        await updateProductRating(productId);

        res.status(200).json({ success: true, message: 'Review deleted' });
    } catch (err) {
        res.status(500).json({ success: false, error: err.message });
    }
});

module.exports = router;
