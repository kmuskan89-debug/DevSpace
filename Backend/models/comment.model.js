const mongoose = require('mongoose');

const commentSchema = new mongoose.Schema({
    task: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Task',
        required: [true, 'Task reference is required'],
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
    author: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'user',
        required: [true, 'Author reference is required']
    },
    content: {
        type: String,
        required: [true, 'Comment content is required'],
        trim: true,
        minlength: [1, 'Comment cannot be empty'],
        maxlength: [5000, 'Comment cannot exceed 5000 characters']
    },
    edited: {
        type: Boolean,
        default: false
    },
    editedAt: {
        type: Date,
        default: null
    }
}, { timestamps: true });

commentSchema.index({ task: 1, createdAt: 1 });
commentSchema.index({ workspace: 1, createdAt: -1 });

const commentModel = mongoose.model('Comment', commentSchema);

module.exports = commentModel;

