const mongoose = require('mongoose');

const workspaceSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
        trim: true,
    },
    slug: {
        type: String,
        trim: true,
    },
    description: {
        type: String,
        default: '',
    },
    icon: {
        type: String,
        default: 'Layers',
    },
    color: {
        type: String,
        default: 'from-indigo-500 to-purple-600',
    },
    visibility: {
        type: String,
        enum: ['Public', 'Private', 'Internal'],
        default: 'Public',
    },
    owner: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'user',
        required: true,
    },
    members: [{
        user: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'user',
            required: true
        },
        role: {
            type: String,
            enum: ['Owner', 'Workspace Owner', 'Admin', 'Member', 'Viewer'],
            default: 'Member',
        },
        joinedAt: {
            type: Date,
            default: Date.now,
        }
    }],
}, { timestamps: true });

// Performance index for workspace lookup by slug and member lookup
workspaceSchema.index({ slug: 1 });
workspaceSchema.index({ owner: 1 });
workspaceSchema.index({ 'members.user': 1 });

const workspaceModel = mongoose.model('Workspace', workspaceSchema);

module.exports = workspaceModel;
