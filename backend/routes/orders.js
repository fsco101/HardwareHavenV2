const { Order } = require('../models/order');
const { Product } = require('../models/product');
const { Promotion } = require('../models/promotion');
const { User } = require('../models/user');
const { Notification } = require('../models/notification');
const express = require('express');
const { OrderItem } = require('../models/order-item');
const jwt = require('jsonwebtoken');
const { sendEmail, orderStatusUpdateEmail, orderCancelledAdminEmail, orderCancelledUserEmail, orderPlacedEmail, orderDeliveredConfirmationAdminEmail } = require('../helpers/emailService');
const { generateReceiptPDF } = require('../helpers/pdfReceipt');
const { sendExpoPushNotifications } = require('../helpers/pushNotifications');
const router = express.Router();

// Helper to get the io instance attached in app.js
function getIO(req) {
    return req.app.get('io');
}

// Helper to create and emit a notification
async function createNotification(req, { userId, title, message, type, orderId }) {
    const notification = new Notification({ user: userId, title, message, type, orderId });
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
                orderId: orderId ? String(orderId) : undefined,
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

function getAuthFromRequest(req) {
    if (req.auth) return req.auth;

    const header = req.headers?.authorization || '';
    const [scheme, token] = header.split(' ');
    if (scheme !== 'Bearer' || !token) return null;

    try {
        return jwt.verify(token, process.env.SECRET);
    } catch {
        return null;
    }
}

router.get(`/`, async (req, res) => {
    const orderList = await Order.find()
        .populate('user', 'name email')
        .sort({ 'dateOrdered': -1 });

    if (!orderList) {
        return res.status(500).json({ success: false })
    }

    res.status(200).json(orderList)
})

router.get(`/:id`, async (req, res) => {
    const order = await Order.findById(req.params.id)
        .populate('user', 'name email')
        .populate({
            path: 'orderItems',
            populate: {
                path: 'product',
                populate: 'category'
            }
        });

    if (!order) {
        return res.status(500).json({ success: false })
    }
    res.send(order);
})

// Create order with stock validation and reduction
router.post('/', async (req, res) => {
    try {
        const now = new Date();
        const requestedItems = Array.isArray(req.body.orderItems) ? req.body.orderItems : [];
        const requestedProductIds = requestedItems.map((item) => item.product);

        const products = await Product.find({ _id: { $in: requestedProductIds } }).select('name price countInStock');
        const productMap = new Map(products.map((p) => [p._id.toString(), p]));

        const activePromotions = await Promotion.find({
            product: { $in: requestedProductIds },
            isActive: true,
            startTime: { $lte: now },
            endTime: { $gt: now },
        }).select('product discountedPrice endTime');

        const promotionMap = new Map();
        for (const promo of activePromotions) {
            const productId = promo.product?.toString();
            if (!productId) continue;

            const existing = promotionMap.get(productId);
            if (!existing || Number(promo.discountedPrice) < Number(existing.discountedPrice)) {
                promotionMap.set(productId, promo);
            }
        }

        const resolveEffectivePrice = (product, promo) => {
            const basePrice = Number(product?.price || 0);
            if (!promo) return basePrice;

            const discounted = Number(promo.discountedPrice);
            if (!Number.isFinite(discounted)) return basePrice;
            return Math.max(0, discounted);
        };

        // Validate stock for all items
        for (const item of requestedItems) {
            const product = productMap.get(String(item.product));
            if (!product) {
                return res.status(400).json({ success: false, message: `Product not found: ${item.product}` });
            }
            const qty = item.quantity || 1;
            if (product.countInStock < qty) {
                return res.status(400).json({
                    success: false,
                    message: `Insufficient stock for "${product.name}". Available: ${product.countInStock}, Requested: ${qty}`
                });
            }
        }

        // Create order items and reduce stock
        const orderItemsIds = await Promise.all(requestedItems.map(async (orderItem) => {
            let newOrderItem = new OrderItem({
                quantity: orderItem.quantity || 1,
                product: orderItem.product
            });
            newOrderItem = await newOrderItem.save();

            // Reduce stock
            await Product.findByIdAndUpdate(orderItem.product, {
                $inc: { countInStock: -(orderItem.quantity || 1) }
            });

            return newOrderItem.id;
        }));

        // Calculate total price
        const totalPrices = requestedItems.map((item) => {
            const product = productMap.get(String(item.product));
            const promo = promotionMap.get(String(item.product));
            const unitPrice = resolveEffectivePrice(product, promo);
            return unitPrice * (item.quantity || 1);
        });
        const totalPrice = totalPrices.reduce((a, b) => a + b, 0);

        let order = new Order({
            orderItems: orderItemsIds,
            shippingAddress1: req.body.shippingAddress1,
            shippingAddress2: req.body.shippingAddress2,
            city: req.body.city,
            zip: req.body.zip,
            country: req.body.country,
            phone: req.body.phone,
            region: req.body.region || '',
            province: req.body.province || '',
            cityMunicipality: req.body.cityMunicipality || '',
            barangay: req.body.barangay || '',
            status: 'Pending',
            totalPrice: totalPrice,
            paymentMethod: req.body.paymentMethod || 'COD',
            paymentStatus: req.body.paymentMethod === 'Online' ? 'Pending' : 'Pending',
            user: req.body.user,
        });
        order = await order.save();

        if (!order)
            return res.status(400).send('The order cannot be created!');

        // Send notification to user
        await createNotification(req, {
            userId: req.body.user,
            title: 'Order Placed!',
            message: `Your order #${order._id} has been placed successfully. Total: P${totalPrice.toFixed(2)}`,
            type: 'order_placed',
            orderId: order._id,
        });

        // Send email confirmation
        const user = await User.findById(req.body.user);
        if (user) {
            sendEmail(orderPlacedEmail(order, user)).catch(err => console.error('Order email error:', err));
        }

        // If online payment, create PayMongo checkout session
        if (req.body.paymentMethod === 'Online') {
            try {
                const paymongoKey = process.env.PAYMONGO_SECRET_KEY;
                if (paymongoKey) {
                    const lineItems = requestedItems.map((item) => {
                        const product = productMap.get(String(item.product));
                        const promo = promotionMap.get(String(item.product));
                        const unitPrice = resolveEffectivePrice(product, promo);
                        return {
                            currency: 'PHP',
                            amount: Math.round(unitPrice * 100), // centavos
                            description: product?.name || 'Product',
                            name: product?.name || 'Product',
                            quantity: item.quantity || 1,
                        };
                    });

                    const apiBase = process.env.API_BASE_URL || `http://localhost:${process.env.PORT || 4000}`;
                    const response = await fetch('https://api.paymongo.com/v1/checkout_sessions', {
                        method: 'POST',
                        headers: {
                            'Content-Type': 'application/json',
                            'Authorization': `Basic ${Buffer.from(paymongoKey + ':').toString('base64')}`,
                        },
                        body: JSON.stringify({
                            data: {
                                attributes: {
                                    send_email_receipt: false,
                                    show_description: true,
                                    show_line_items: true,
                                    description: `HardwareHaven Order #${order._id}`,
                                    line_items: lineItems,
                                    payment_method_types: ['gcash', 'grab_pay'],
                                    success_url: `${apiBase}/api/v1/orders/payment-success?orderId=${order._id}`,
                                    cancel_url: `${apiBase}/api/v1/orders/payment-cancel?orderId=${order._id}`,
                                },
                            },
                        }),
                    });

                    const paymongoData = await response.json();
                    if (paymongoData.data) {
                        order.paymentId = paymongoData.data.id;
                        await order.save();
                        return res.status(200).json({
                            ...order.toJSON(),
                            checkoutUrl: paymongoData.data.attributes.checkout_url,
                        });
                    }
                }
            } catch (payErr) {
                console.error('PayMongo error:', payErr.message);
            }
        }

        return res.status(200).json(order);
    } catch (error) {
        console.error('Create order error:', error);
        return res.status(500).json({ success: false, message: error.message });
    }
});

// Payment success redirect
router.get('/payment-success', async (req, res) => {
    const { orderId } = req.query;
    if (orderId) {
        await Order.findByIdAndUpdate(orderId, { paymentStatus: 'Paid' });
    }
    res.send(`
        <html><body style="background:#1a1a2e;color:#e8e8e8;font-family:Arial;display:flex;justify-content:center;align-items:center;height:100vh;margin:0;">
            <div style="text-align:center;">
                <h1 style="color:#2ecc71;">Payment Successful!</h1>
                <p>You can now return to the HardwareHaven app.</p>
            </div>
        </body></html>
    `);
});

// Payment cancel redirect
router.get('/payment-cancel', async (req, res) => {
    const { orderId } = req.query;
    if (orderId) {
        await Order.findByIdAndUpdate(orderId, { paymentStatus: 'Failed' });
    }
    res.send(`
        <html><body style="background:#1a1a2e;color:#e8e8e8;font-family:Arial;display:flex;justify-content:center;align-items:center;height:100vh;margin:0;">
            <div style="text-align:center;">
                <h1 style="color:#e74c3c;">Payment Cancelled</h1>
                <p>You can return to the HardwareHaven app and try again.</p>
            </div>
        </body></html>
    `);
});

// Verify payment status
router.get('/verify-payment/:id', async (req, res) => {
    try {
        const order = await Order.findById(req.params.id);
        if (!order) return res.status(404).json({ success: false, message: 'Order not found' });

        // If we have a PayMongo session ID, check its status
        if (order.paymentId && process.env.PAYMONGO_SECRET_KEY) {
            try {
                const response = await fetch(`https://api.paymongo.com/v1/checkout_sessions/${order.paymentId}`, {
                    headers: {
                        'Authorization': `Basic ${Buffer.from(process.env.PAYMONGO_SECRET_KEY + ':').toString('base64')}`,
                    },
                });
                const data = await response.json();
                if (data.data && data.data.attributes.payment_intent) {
                    const paymentStatus = data.data.attributes.payment_intent.attributes.status;
                    if (paymentStatus === 'succeeded') {
                        order.paymentStatus = 'Paid';
                        await order.save();
                    }
                }
                // Also check payments array
                if (data.data && data.data.attributes.payments && data.data.attributes.payments.length > 0) {
                    order.paymentStatus = 'Paid';
                    await order.save();
                }
            } catch (err) {
                console.error('PayMongo verify error:', err.message);
            }
        }

        res.json({ paymentStatus: order.paymentStatus, status: order.status });
    } catch (err) {
        res.status(500).json({ success: false, error: err.message });
    }
});

// Admin update order status
router.put('/:id', async (req, res) => {
    try {
        const auth = getAuthFromRequest(req);
        if (!auth?.isAdmin) {
            return res.status(403).json({ success: false, message: 'Admin access required' });
        }

        const validStatuses = ['Pending', 'Processing', 'Shipped'];
        if (req.body.status && !validStatuses.includes(req.body.status)) {
            return res.status(400).json({ success: false, message: 'Invalid status. Must be: Pending, Processing, or Shipped' });
        }

        const existingOrder = await Order.findById(req.params.id);
        if (!existingOrder) {
            return res.status(404).json({ success: false, message: 'Order not found' });
        }

        if (existingOrder.status === 'Delivered' || existingOrder.statusLocked) {
            return res.status(400).json({ success: false, message: 'This order is locked after delivery confirmation and can no longer be changed.' });
        }

        const updatePayload = { status: req.body.status };
        if (req.body.status === 'Shipped' && !existingOrder.shippedAt) {
            updatePayload.shippedAt = new Date();
        }

        const order = await Order.findByIdAndUpdate(
            req.params.id,
            updatePayload,
            { new: true }
        ).populate({
            path: 'orderItems',
            populate: { path: 'product', populate: 'category' }
        });

        if (!order)
            return res.status(400).send('The order cannot be updated!');

        // Get user for notification
        const user = await User.findById(order.user);

        // Send notification
        if (user) {
            await createNotification(req, {
                userId: user._id,
                title: 'Order Status Updated',
                message: req.body.status === 'Shipped'
                    ? `Your order #${order._id} has been shipped. Please confirm delivery once you receive it.`
                    : `Your order #${order._id} is now: ${req.body.status}`,
                type: 'order_status_update',
                orderId: order._id,
            });

            // Send email with PDF receipt
            const emailData = orderStatusUpdateEmail(order, user, req.body.status);
            try {
                const pdfBuffer = await generateReceiptPDF(order, user);
                emailData.attachments = [{
                    filename: `receipt-${order._id}.pdf`,
                    content: pdfBuffer,
                    contentType: 'application/pdf',
                }];
            } catch (pdfErr) {
                console.error('PDF generation error:', pdfErr.message);
            }
            sendEmail(emailData).catch(err => console.error('Status email error:', err));
        }

        res.send(order);
    } catch (error) {
        console.error('Update order error:', error);
        res.status(500).json({ success: false, message: error.message });
    }
});

// Buyer confirms delivered after admin marks as Shipped
router.put('/confirm-delivery/:id', async (req, res) => {
    try {
        const auth = getAuthFromRequest(req);
        if (!auth?.userId) {
            return res.status(401).json({ success: false, message: 'Unauthorized' });
        }

        const order = await Order.findById(req.params.id).populate('user', 'name email');
        if (!order) {
            return res.status(404).json({ success: false, message: 'Order not found' });
        }

        if (String(order.user?._id || order.user) !== String(auth.userId)) {
            return res.status(403).json({ success: false, message: 'You can only confirm your own order.' });
        }

        if (order.statusLocked || order.status === 'Delivered') {
            return res.status(400).json({ success: false, message: 'Order is already marked as delivered and locked.' });
        }

        if (order.status !== 'Shipped') {
            return res.status(400).json({ success: false, message: 'Order can only be confirmed after it is marked as Shipped by admin.' });
        }

        order.status = 'Delivered';
        order.deliveredConfirmedByUser = true;
        order.deliveredAt = new Date();
        order.statusLocked = true;
        await order.save();

        const admins = await User.find({ isAdmin: true }, '_id name email');
        for (const admin of admins) {
            await createNotification(req, {
                userId: admin._id,
                title: 'Order Delivered Confirmed',
                message: `Buyer confirmed delivery for order #${order._id}. This order is now locked.`,
                type: 'order_delivered_confirmed',
                orderId: order._id,
            });
        }

        const buyer = order.user;
        for (const admin of admins) {
            sendEmail(orderDeliveredConfirmationAdminEmail(order, buyer, admin)).catch(err =>
                console.error('Delivered confirmation admin email error:', err)
            );
        }

        return res.json({ success: true, order, message: 'Order marked as delivered and locked.' });
    } catch (error) {
        console.error('Confirm delivery error:', error);
        return res.status(500).json({ success: false, message: error.message });
    }
});

// User cancel order
router.put('/cancel/:id', async (req, res) => {
    try {
        const order = await Order.findById(req.params.id).populate({
            path: 'orderItems',
            populate: { path: 'product' }
        });

        if (!order) {
            return res.status(404).json({ success: false, message: 'Order not found' });
        }

        // Only allow cancellation if Pending or Processing
        if (!['Pending', 'Processing'].includes(order.status)) {
            return res.status(400).json({
                success: false,
                message: 'Cannot cancel this order. Only Pending or Processing orders can be cancelled.'
            });
        }

        const reason = req.body.reason || 'No reason provided';

        // Restore stock for each item
        for (const item of order.orderItems) {
            await Product.findByIdAndUpdate(item.product._id || item.product, {
                $inc: { countInStock: item.quantity }
            });
        }

        order.status = 'Cancelled';
        order.cancellationReason = reason;
        order.cancelledAt = new Date();
        await order.save();

        const user = await User.findById(order.user);

        if (user) {
            // Notify user
            await createNotification(req, {
                userId: user._id,
                title: 'Order Cancelled',
                message: `Your order #${order._id} has been cancelled. Reason: ${reason}`,
                type: 'order_cancelled',
                orderId: order._id,
            });

            // Email user
            sendEmail(orderCancelledUserEmail(order, user, reason)).catch(err => console.error('Cancel user email error:', err));

            // Email admin
            sendEmail(orderCancelledAdminEmail(order, user, reason)).catch(err => console.error('Cancel admin email error:', err));

            // Notify all admin users via WebSocket
            const admins = await User.find({ isAdmin: true });
            for (const admin of admins) {
                await createNotification(req, {
                    userId: admin._id,
                    title: 'Order Cancelled by Customer',
                    message: `Order #${order._id} cancelled by ${user.name}. Reason: ${reason}`,
                    type: 'order_cancelled',
                    orderId: order._id,
                });
            }
        }

        res.json({ success: true, order });
    } catch (error) {
        console.error('Cancel order error:', error);
        res.status(500).json({ success: false, message: error.message });
    }
});

// Check stock availability
router.post('/check-stock', async (req, res) => {
    try {
        const issues = [];
        for (const item of req.body.items) {
            const product = await Product.findById(item.product || item._id || item.id);
            if (!product) {
                issues.push({ product: item.product || item._id, message: 'Product not found' });
            } else if (product.countInStock < (item.quantity || 1)) {
                issues.push({
                    product: product._id,
                    name: product.name,
                    available: product.countInStock,
                    requested: item.quantity || 1,
                    message: `Only ${product.countInStock} available`
                });
            }
        }
        res.json({ success: issues.length === 0, issues });
    } catch (err) {
        res.status(500).json({ success: false, error: err.message });
    }
});

router.delete('/:id', (req, res) => {
    Order.findByIdAndDelete(req.params.id).then(async order => {
        if (order) {
            await order.orderItems.map(async orderItem => {
                await OrderItem.findByIdAndDelete(orderItem)
            })
            return res.status(200).json({ success: true, message: 'the order is deleted!' })
        } else {
            return res.status(404).json({ success: false, message: "order not found!" })
        }
    }).catch(err => {
        return res.status(500).json({ success: false, error: err })
    })
})

router.get('/get/totalsales', async (req, res) => {
    const totalSales = await Order.aggregate([
        { $group: { _id: null, totalsales: { $sum: '$totalPrice' } } }
    ])

    if (!totalSales) {
        return res.status(400).send('The order sales cannot be generated')
    }

    res.send({ totalsales: totalSales.pop().totalsales })
})

router.get(`/get/count`, async (req, res) => {
    try {
        const orderCount = await Order.countDocuments();
        res.send({ orderCount: orderCount });
    } catch (err) {
        res.status(500).json({ success: false });
    }
})

router.get(`/my-orders/:id`, async (req, res) => {
    const userOrderList = await Order.find({ user: req.params.id }).populate({
        path: 'orderItems', populate: {
            path: 'product', populate: 'category'
        }
    }).sort({ 'dateOrdered': -1 });

    if (!userOrderList) {
        res.status(500).json({ success: false })
    }
    res.send(userOrderList);
})

module.exports = router;