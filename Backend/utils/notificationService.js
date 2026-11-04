const notificationModel = require('../models/notification.model');

/**
 * Safely creates an in-app notification for a user
 */
const createNotification = async ({
    recipientId,
    senderId = null,
    workspaceId = null,
    type,
    title,
    message,
    link = ''
}) => {
    try {
        if (!recipientId || !type || !title || !message) {
            return null;
        }

        // Do not notify the actor themselves
        if (senderId && senderId.toString() === recipientId.toString()) {
            return null;
        }

        return await notificationModel.create({
            recipient: recipientId,
            sender: senderId,
            workspace: workspaceId,
            type,
            title,
            message,
            link
        });
    } catch (err) {
        console.error('Failed to create in-app notification:', err);
        return null;
    }
};

module.exports = { createNotification };

