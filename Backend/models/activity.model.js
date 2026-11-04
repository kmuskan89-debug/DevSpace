const mongoose = require('mongoose');

const activitySchema = new mongoose.Schema({
    workspace: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Workspace',
        required: [true, 'Workspace reference is required'],
        index: true
    },
    project: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Project',
        default: null,
        index: true
    },
    task: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Task',
        default: null,
        index: true
    },
    sprint: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Sprint',
        default: null,
        index: true
    },
    actor: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'user',
        required: [true, 'Actor reference is required']
    },
    action: {
        type: String,
        required: true,
        enum: [
            'PROJECT_CREATED',
            'PROJECT_UPDATED',
            'PROJECT_DELETED',
            'TASK_CREATED',
            'TASK_UPDATED',
            'TASK_DELETED',
            'TASK_STATUS_CHANGED',
            'TASK_ASSIGNED',
            'COMMENT_ADDED',
            'COMMENT_DELETED',
            'MEMBER_INVITED',
            'MEMBER_JOINED',
            'MEMBER_ROLE_UPDATED',
            'MEMBER_REMOVED',
            'WORKSPACE_UPDATED',
            'SPRINT_CREATED',
            'SPRINT_UPDATED',
            'SPRINT_DELETED',
            'SPRINT_STARTED',
            'SPRINT_COMPLETED',
            'SPRINT_ISSUES_ADDED',
            'SPRINT_ISSUE_REMOVED'
        ]
    },
    resourceType: {
        type: String,
        required: true,
        enum: ['Workspace', 'Project', 'Task', 'Comment', 'Member', 'Sprint']
    },
    details: {
        type: mongoose.Schema.Types.Mixed,
        default: {}
    }
}, { timestamps: true });

activitySchema.index({ workspace: 1, createdAt: -1 });
activitySchema.index({ project: 1, createdAt: -1 });
activitySchema.index({ task: 1, createdAt: -1 });

const activityModel = mongoose.model('Activity', activitySchema);

module.exports = activityModel;

