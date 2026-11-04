const mongoose = require('mongoose');

const taskSchema = new mongoose.Schema({
    title: {
        type: String,
        required: [true, 'Task title is required'],
        trim: true,
        minlength: [1, 'Title cannot be empty'],
        maxlength: [255, 'Title cannot exceed 255 characters']
    },
    description: {
        type: String,
        default: '',
        trim: true,
        maxlength: [10000, 'Description cannot exceed 10000 characters']
    },
    issueKey: {
        type: String,
        required: [true, 'Issue key is required'],
        trim: true,
        uppercase: true,
        index: true
    },
    project: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Project',
        required: [true, 'Project reference is required'],
        index: true
    },
    workspace: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Workspace',
        required: [true, 'Workspace reference is required'],
        index: true
    },
    type: {
        type: String,
        enum: {
            values: ['Task', 'Bug', 'Story', 'Epic'],
            message: '{VALUE} is not a valid issue type'
        },
        default: 'Task'
    },
    status: {
        type: String,
        enum: {
            values: ['To Do', 'In Progress', 'In Review', 'Code Review', 'Done'],
            message: '{VALUE} is not a valid status'
        },
        default: 'To Do'
    },
    priority: {
        type: String,
        enum: {
            values: ['Lowest', 'Low', 'Medium', 'High', 'Highest'],
            message: '{VALUE} is not a valid priority'
        },
        default: 'Medium'
    },
    assignee: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'user',
        default: null
    },
    reporter: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'user',
        required: [true, 'Reporter reference is required']
    },
    labels: {
        type: [String],
        default: []
    },
    dueDate: {
        type: Date,
        default: null
    },
    storyPoints: {
        type: Number,
        default: null,
        min: [0, 'Story points cannot be negative']
    },
    estimate: {
        type: String,
        default: '',
        trim: true
    },
    branch: {
        type: String,
        default: '',
        trim: true
    },
    subtasks: [{
        text: String,
        completed: { type: Boolean, default: false }
    }],
    comments: [{
        user: String,
        avatar: String,
        content: String,
        createdAt: { type: Date, default: Date.now }
    }],
    sprint: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Sprint',
        default: null,
        index: true
    },
    order: {
        type: Number,
        default: 0
    },
    backlogOrder: {
        type: Number,
        default: 0
    }
}, { timestamps: true });

// Scoped uniqueness: Issue keys must be unique within a project and workspace
taskSchema.index({ project: 1, issueKey: 1 }, { unique: true });
taskSchema.index({ workspace: 1, issueKey: 1 }, { unique: true });

// Performance compound indexes for filtering and pagination
taskSchema.index({ project: 1, sprint: 1, order: 1 });
taskSchema.index({ project: 1, sprint: 1, backlogOrder: 1 });
taskSchema.index({ project: 1, status: 1 });
taskSchema.index({ project: 1, priority: 1 });
taskSchema.index({ project: 1, assignee: 1 });
taskSchema.index({ project: 1, reporter: 1 });
taskSchema.index({ project: 1, type: 1 });
taskSchema.index({ project: 1, dueDate: 1 });
taskSchema.index({ project: 1, createdAt: -1 });
taskSchema.index({ project: 1, updatedAt: -1 });
taskSchema.index({ workspace: 1, status: 1 });
taskSchema.index({ workspace: 1, priority: 1 });
taskSchema.index({ workspace: 1, assignee: 1 });
taskSchema.index({ workspace: 1, reporter: 1 });
taskSchema.index({ workspace: 1, dueDate: 1 });
taskSchema.index({ workspace: 1, createdAt: -1 });
taskSchema.index({ workspace: 1, updatedAt: -1 });
taskSchema.index({ labels: 1 });

const taskModel = mongoose.model('Task', taskSchema);

module.exports = taskModel;
