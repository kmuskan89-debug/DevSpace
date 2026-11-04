const mongoose = require('mongoose');

const notificationSchema = new mongoose.Schema({
    recipient: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'user',
        required: [true, 'Recipient reference is required'],
        index: true
    },
    sender: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'user',
        default: null
    },
    workspace: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Workspace',
        default: null,
        index: true
    },
    type: {
        type: String,
        required: true,
        enum: [
            'TASK_ASSIGNED',
            'TASK_STATUS_CHANGED',
            'COMMENT_ADDED',
            'WORKSPACE_INVITATION',
            'ROLE_UPDATED',
            'GENERAL'
        ]
    },
    title: {
        type: String,
        required: true,
        trim: true
    },
    message: {
        type: String,
        required: true,
        trim: true
    },
    link: {
        type: String,
        default: ''
    },
    read: {
        type: Boolean,
        default: false,
        index: true
    },
    readAt: {
        type: Date,
        default: null
    }
}, { timestamps: true });

notificationSchema.index({ recipient: 1, read: 1, createdAt: -1 });

const notificationModel = mongoose.model('Notification', notificationSchema);

module.exports = notificationModel;

