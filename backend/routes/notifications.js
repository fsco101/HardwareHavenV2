const express = require('express');
const { Notification } = require('../models/notification');
const router = express.Router();

// Get notifications for a user
router.get('/:userId', async (req, res) => {
    try {
        const notifications = await Notification.find({ user: req.params.userId })
            .sort({ dateCreated: -1 })
            .limit(50);
        res.send(notifications);
    } catch (err) {
        res.status(500).json({ success: false, error: err.message });
    }
});

// Get unread count
router.get('/unread/:userId', async (req, res) => {
    try {
        const count = await Notification.countDocuments({ user: req.params.userId, read: false });
        res.json({ count });
    } catch (err) {
        res.status(500).json({ success: false, error: err.message });
    }
});

// Mark one as read
router.put('/read/:id', async (req, res) => {
    try {
        const notification = await Notification.findByIdAndUpdate(
            req.params.id,
            { read: true },
            { new: true }
        );
        if (!notification) return res.status(404).json({ success: false, message: 'Not found' });
        res.send(notification);
    } catch (err) {
        res.status(500).json({ success: false, error: err.message });
    }
});

// Mark all as read for a user
router.put('/read-all/:userId', async (req, res) => {
    try {
        await Notification.updateMany(
            { user: req.params.userId, read: false },
            { read: true }
        );
        res.json({ success: true });
    } catch (err) {
        res.status(500).json({ success: false, error: err.message });
    }
});

module.exports = router;
