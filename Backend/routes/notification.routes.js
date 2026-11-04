const express = require('express');
const router = express.Router();
const mongoose = require('mongoose');

const notificationModel = require('../models/notification.model');
const authMiddleware = require('../middleware/auth.middleware');

const isValidObjectId = (id) => mongoose.Types.ObjectId.isValid(id);

/**
 * GET /api/notifications
 * List notifications for the authenticated user
 */
router.get('/', authMiddleware, async (req, res) => {
    try {
        const userId = req.userId;
        const query = { recipient: userId };

        if (req.query.unread === 'true') {
            query.read = false;
        }

        if (req.query.type) {
            query.type = req.query.type;
        }

        const page = Math.max(1, parseInt(req.query.page, 10) || 1);
        const limit = Math.min(100, Math.max(1, parseInt(req.query.limit, 10) || 30));
        const skip = (page - 1) * limit;

        const [notifications, total, unreadCount] = await Promise.all([
            notificationModel.find(query)
                .populate('sender', 'name email avatar')
                .populate('workspace', 'name slug')
                .sort({ createdAt: -1 })
                .skip(skip)
                .limit(limit),
            notificationModel.countDocuments(query),
            notificationModel.countDocuments({ recipient: userId, read: false })
        ]);

        return res.status(200).json({
            message: 'Notifications fetched successfully',
            count: notifications.length,
            total,
            unreadCount,
            page,
            totalPages: Math.ceil(total / limit) || 1,
            notifications
        });
    } catch (error) {
        console.error('Error fetching notifications:', error);
        return res.status(500).json({
            message: 'Internal server error while fetching notifications'
        });
    }
});

/**
 * GET /api/notifications/unread-count
 * Quick count of unread notifications
 */
router.get('/unread-count', authMiddleware, async (req, res) => {
    try {
        const userId = req.userId;
        const unreadCount = await notificationModel.countDocuments({
            recipient: userId,
            read: false
        });

        return res.status(200).json({ unreadCount });
    } catch (error) {
        console.error('Error fetching unread count:', error);
        return res.status(500).json({ message: 'Internal server error' });
    }
});

/**
 * PATCH /api/notifications/:notificationId/read
 * Mark a single notification as read
 */
router.patch('/:notificationId/read', authMiddleware, async (req, res) => {
    try {
        const userId = req.userId;
        const { notificationId } = req.params;

        if (!isValidObjectId(notificationId)) {
            return res.status(400).json({ message: 'Invalid notification ID' });
        }

        const notification = await notificationModel.findOne({
            _id: notificationId,
            recipient: userId
        });

        if (!notification) {
            return res.status(404).json({ message: 'Notification not found' });
        }

        notification.read = true;
        notification.readAt = new Date();
        await notification.save();

        return res.status(200).json({
            message: 'Notification marked as read',
            notification
        });
    } catch (error) {
        console.error('Error marking notification read:', error);
        return res.status(500).json({ message: 'Internal server error' });
    }
});

/**
 * PATCH /api/notifications/read-all
 * Mark all user notifications as read
 */
router.patch('/read-all', authMiddleware, async (req, res) => {
    try {
        const userId = req.userId;

        await notificationModel.updateMany(
            { recipient: userId, read: false },
            { $set: { read: true, readAt: new Date() } }
        );

        return res.status(200).json({
            message: 'All notifications marked as read'
        });
    } catch (error) {
        console.error('Error marking all notifications read:', error);
        return res.status(500).json({ message: 'Internal server error' });
    }
});

/**
 * DELETE /api/notifications/:notificationId
 * Delete a notification
 */
router.delete('/:notificationId', authMiddleware, async (req, res) => {
    try {
        const userId = req.userId;
        const { notificationId } = req.params;

        if (!isValidObjectId(notificationId)) {
            return res.status(400).json({ message: 'Invalid notification ID' });
        }

        const notification = await notificationModel.findOneAndDelete({
            _id: notificationId,
            recipient: userId
        });

        if (!notification) {
            return res.status(404).json({ message: 'Notification not found' });
        }

        return res.status(200).json({
            message: 'Notification deleted successfully',
            deletedId: notification._id
        });
    } catch (error) {
        console.error('Error deleting notification:', error);
        return res.status(500).json({ message: 'Internal server error' });
    }
});

module.exports = router;

