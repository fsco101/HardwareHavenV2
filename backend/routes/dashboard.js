const express = require('express');
const { Order } = require('../models/order');
const { User } = require('../models/user');
const { getPHTime } = require('../helpers/phTime');
const { adminOnly } = require('../helpers/jwt');
const router = express.Router();

// GET /dashboard?range=today|weekly|monthly|yearly|custom&startDate=ISO&endDate=ISO
router.get('/', adminOnly, async (req, res) => {
    try {
        const range = req.query.range || 'monthly';
        const now = getPHTime();
        let startDate;
        let endDate = new Date(now);

        if (range === 'today') {
            startDate = new Date(now);
            startDate.setHours(0, 0, 0, 0);
        } else if (range === 'weekly') {
            startDate = new Date(now);
            startDate.setDate(startDate.getDate() - 6);
            startDate.setHours(0, 0, 0, 0);
        } else if (range === 'monthly') {
            startDate = new Date(now);
            startDate.setDate(startDate.getDate() - 29);
            startDate.setHours(0, 0, 0, 0);
        } else if (range === 'custom') {
            const parsedStart = new Date(req.query.startDate);
            const parsedEnd = new Date(req.query.endDate);

            if (Number.isNaN(parsedStart.getTime()) || Number.isNaN(parsedEnd.getTime())) {
                return res.status(400).json({ success: false, message: 'Invalid custom range datetime.' });
            }

            startDate = parsedStart;
            endDate = parsedEnd;
        } else {
            startDate = new Date(now);
            startDate.setFullYear(startDate.getFullYear() - 1);
            startDate.setHours(0, 0, 0, 0);
        }

        if (startDate > endDate) {
            return res.status(400).json({ success: false, message: 'startDate must be before endDate.' });
        }

        // All orders in range
        const orders = await Order.find({ dateOrdered: { $gte: startDate, $lte: endDate } })
            .populate({
                path: 'orderItems',
                populate: {
                    path: 'product',
                    select: 'name image category price',
                    populate: { path: 'category', select: 'name' },
                }
            });

        const periodMs = endDate.getTime() - startDate.getTime();
        const previousStart = new Date(startDate.getTime() - periodMs - 1);
        const previousEnd = new Date(startDate.getTime() - 1);

        const previousOrders = await Order.find({
            dateOrdered: { $gte: previousStart, $lte: previousEnd },
            status: 'Delivered',
        }).select('totalPrice');

        // Sales & Revenue (Delivered only)
        const delivered = orders.filter(o => o.status === 'Delivered');
        const totalRevenue = delivered.reduce((sum, o) => sum + (o.totalPrice || 0), 0);
        const totalSales = delivered.length;
        const previousRevenue = previousOrders.reduce((sum, o) => sum + (o.totalPrice || 0), 0);
        const growthPercent = previousRevenue > 0
            ? ((totalRevenue - previousRevenue) / previousRevenue) * 100
            : (totalRevenue > 0 ? 100 : 0);

        // Active users = unique users that placed an order in selected range
        const activeUsers = new Set(
            orders
                .map((o) => (o.user ? o.user.toString() : null))
                .filter(Boolean)
        ).size;

        // Returns (Cancelled)
        const cancelled = orders.filter(o => o.status === 'Cancelled');
        const totalCancelled = cancelled.length;
        const cancelledValue = cancelled.reduce((sum, o) => sum + (o.totalPrice || 0), 0);

        // Pending & Processing
        const pending = orders.filter(o => o.status === 'Pending').length;
        const processing = orders.filter(o => o.status === 'Processing').length;

        // Most purchased products (from delivered orders)
        const productMap = {};
        const categoryMap = {};
        for (const order of delivered) {
            for (const item of order.orderItems) {
                const prod = item.product;
                if (!prod) continue;
                const pid = prod._id.toString();
                if (!productMap[pid]) {
                    productMap[pid] = {
                        productId: pid,
                        name: prod.name,
                        image: prod.image,
                        totalQty: 0,
                        totalRevenue: 0,
                    };
                }
                productMap[pid].totalQty += item.quantity || 1;
                productMap[pid].totalRevenue += (prod.price || 0) * (item.quantity || 1);

                const categoryLabel = prod.category?.name || 'Uncategorized';
                if (!categoryMap[categoryLabel]) {
                    categoryMap[categoryLabel] = { label: categoryLabel, value: 0 };
                }
                categoryMap[categoryLabel].value += item.quantity || 1;
            }
        }
        const topProducts = Object.values(productMap)
            .sort((a, b) => b.totalQty - a.totalQty)
            .slice(0, 10);
        const categoryComparison = Object.values(categoryMap)
            .sort((a, b) => b.value - a.value)
            .slice(0, 8);

        // Build per-day metrics for custom range filtering and richer frontend insight generation.
        const dailyMetrics = buildDailyMetrics(orders, startDate, endDate);

        // Revenue over time (grouped by day/week/month)
        const revenueOverTime = buildTimeSeries(delivered, range, startDate, endDate);

        // Sales over time
        const salesOverTime = buildSalesTimeSeries(delivered, range, startDate, endDate);

        // Order status distribution (pie chart)
        const statusDistribution = [
            { label: 'Delivered', value: totalSales, color: '#2ecc71' },
            { label: 'Cancelled', value: totalCancelled, color: '#e74c3c' },
            { label: 'Pending', value: pending, color: '#f39c12' },
            { label: 'Processing', value: processing, color: '#00b4d8' },
        ];

        // User count
        const userCount = await User.countDocuments();

        res.json({
            totalRevenue,
            previousRevenue,
            growthPercent,
            totalSales,
            totalCancelled,
            cancelledValue,
            pending,
            processing,
            activeUsers,
            dailyMetrics,
            topProducts,
            categoryComparison,
            revenueOverTime,
            salesOverTime,
            statusDistribution,
            userCount,
            range,
            period: {
                startDate,
                endDate,
            },
        });
    } catch (err) {
        res.status(500).json({ success: false, error: err.message });
    }
});

function buildTimeSeries(orders, range, startDate, endDate) {
    const map = {};
    for (const o of orders) {
        const key = getTimeKey(o.dateOrdered, range, startDate, endDate);
        map[key] = (map[key] || 0) + (o.totalPrice || 0);
    }
    const keys = generateKeys(range, startDate, endDate);
    return keys.map(k => ({ label: k, value: map[k] || 0 }));
}

function buildSalesTimeSeries(orders, range, startDate, endDate) {
    const map = {};
    for (const o of orders) {
        const key = getTimeKey(o.dateOrdered, range, startDate, endDate);
        map[key] = (map[key] || 0) + 1;
    }
    const keys = generateKeys(range, startDate, endDate);
    return keys.map(k => ({ label: k, value: map[k] || 0 }));
}

function getTimeKey(date, range, startDate, endDate) {
    const d = new Date(date);
    const periodDays = Math.ceil((new Date(endDate) - new Date(startDate)) / (24 * 60 * 60 * 1000));

    if (range === 'today' || range === 'weekly' || range === 'monthly' || (range === 'custom' && periodDays <= 92)) {
        return `${d.getMonth() + 1}/${d.getDate()}`;
    }

    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    return months[d.getMonth()];
}

function generateKeys(range, startDate, endDate) {
    const keys = [];
    const current = new Date(startDate);
    const periodDays = Math.ceil((new Date(endDate) - new Date(startDate)) / (24 * 60 * 60 * 1000));

    if (range === 'today' || range === 'weekly' || range === 'monthly' || (range === 'custom' && periodDays <= 92)) {
        while (current <= endDate) {
            keys.push(`${current.getMonth() + 1}/${current.getDate()}`);
            current.setDate(current.getDate() + 1);
        }
    } else {
        const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
        while (current <= endDate) {
            const key = months[current.getMonth()];
            if (!keys.includes(key)) keys.push(key);
            current.setMonth(current.getMonth() + 1);
        }
    }
    return keys;
}

function buildDailyMetrics(orders, startDate, endDate) {
    const dayMap = {};
    const current = new Date(startDate);

    while (current <= endDate) {
        const key = current.toISOString().slice(0, 10);
        dayMap[key] = {
            date: key,
            revenue: 0,
            activeUsersSet: new Set(),
        };
        current.setDate(current.getDate() + 1);
    }

    for (const order of orders) {
        const key = new Date(order.dateOrdered).toISOString().slice(0, 10);
        if (!dayMap[key]) continue;

        if (order.status === 'Delivered') {
            dayMap[key].revenue += Number(order.totalPrice || 0);
        }

        if (order.user) {
            dayMap[key].activeUsersSet.add(order.user.toString());
        }
    }

    return Object.values(dayMap).map((day) => ({
        date: day.date,
        revenue: day.revenue,
        activeUsers: day.activeUsersSet.size,
    }));
}

module.exports = router;
