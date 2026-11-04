const mongoose = require('mongoose');

const invitationSchema = new mongoose.Schema({
    workspace: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Workspace',
        required: [true, 'Workspace reference is required'],
        index: true
    },
    email: {
        type: String,
        required: [true, 'Invitee email is required'],
        lowercase: true,
        trim: true,
        index: true
    },
    role: {
        type: String,
        enum: ['Admin', 'Member', 'Viewer'],
        default: 'Member',
        required: true
    },
    tokenHash: {
        type: String,
        required: true,
        unique: true,
        index: true
    },
    invitedBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'user',
        required: true
    },
    status: {
        type: String,
        enum: ['Pending', 'Accepted', 'Rejected', 'Revoked', 'Expired'],
        default: 'Pending',
        index: true
    },
    expiresAt: {
        type: Date,
        required: true,
        index: true
    },
    acceptedAt: {
        type: Date,
        default: null
    }
}, { timestamps: true });

invitationSchema.index({ workspace: 1, email: 1, status: 1 });

const invitationModel = mongoose.model('Invitation', invitationSchema);

module.exports = invitationModel;

