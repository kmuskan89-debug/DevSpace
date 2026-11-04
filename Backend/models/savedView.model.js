const mongoose = require('mongoose');

const savedViewSchema = new mongoose.Schema({
    name: {
        type: String,
        required: [true, 'View name is required'],
        trim: true,
        minlength: [1, 'View name cannot be empty'],
        maxlength: [100, 'View name cannot exceed 100 characters']
    },
    description: {
        type: String,
        default: '',
        trim: true,
        maxlength: [500, 'Description cannot exceed 500 characters']
    },
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
    filters: {
        type: mongoose.Schema.Types.Mixed,
        default: {}
    },
    sort: {
        field: {
            type: String,
            default: 'createdAt'
        },
        order: {
            type: String,
            enum: ['asc', 'desc'],
            default: 'desc'
        }
    },
    visibility: {
        type: String,
        enum: {
            values: ['Private', 'Shared'],
            message: '{VALUE} is not a valid visibility'
        },
        default: 'Private'
    },
    createdBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'user',
        required: [true, 'Creator reference is required'],
        index: true
    }
}, { timestamps: true });

savedViewSchema.index({ workspace: 1, createdBy: 1 });
savedViewSchema.index({ workspace: 1, visibility: 1 });
savedViewSchema.index({ workspace: 1, project: 1 });
savedViewSchema.index({ workspace: 1, createdAt: -1 });

const savedViewModel = mongoose.model('SavedView', savedViewSchema);

module.exports = savedViewModel;

