const express = require('express');
const { Notification } = require('../models/notification');
const { adminOnly } = require('../helpers/jwt');
const { getFirebaseAdminApp, getFirebaseMessaging } = require('../helpers/firebaseAdmin');
const jwt = require('jsonwebtoken');
const router = express.Router();

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

// Firebase push diagnostics (admin)
router.get('/diagnostics/push', adminOnly, async (req, res) => {
    try {
        const hasProjectId = Boolean(process.env.FIREBASE_PROJECT_ID);
        const hasClientEmail = Boolean(process.env.FIREBASE_CLIENT_EMAIL);
        const hasPrivateKey = Boolean(process.env.FIREBASE_PRIVATE_KEY);

        const app = getFirebaseAdminApp();
        const messaging = getFirebaseMessaging();

        return res.json({
            success: true,
            firebaseAdminConfigured: hasProjectId && hasClientEmail && hasPrivateKey,
            firebaseAdminInitialized: Boolean(app),
            messagingReady: Boolean(messaging),
            checks: {
                FIREBASE_PROJECT_ID: hasProjectId,
                FIREBASE_CLIENT_EMAIL: hasClientEmail,
                FIREBASE_PRIVATE_KEY: hasPrivateKey,
            },
        });
    } catch (error) {
        return res.status(500).json({
            success: false,
            firebaseAdminConfigured: false,
            firebaseAdminInitialized: false,
            messagingReady: false,
            error: error.message,
        });
    }
});

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

// Delete selected read notifications for current user
router.delete('/bulk', async (req, res) => {
    try {
        const auth = getAuthFromRequest(req);
        if (!auth?.userId) {
            return res.status(401).json({ success: false, message: 'Unauthorized' });
        }

        const ids = Array.isArray(req.body?.ids) ? req.body.ids : [];
        const normalizedIds = ids
            .map((id) => String(id || '').trim())
            .filter(Boolean);

        if (!normalizedIds.length) {
            return res.status(400).json({ success: false, message: 'No notifications selected' });
        }

        const result = await Notification.deleteMany({
            _id: { $in: normalizedIds },
            user: auth.userId,
            read: true,
        });

        return res.json({ success: true, deletedCount: result.deletedCount || 0 });
    } catch (err) {
        return res.status(500).json({ success: false, error: err.message });
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
