const mongoose = require('mongoose');

const projectSchema = new mongoose.Schema({
    name: {
        type: String,
        required: [true, 'Project name is required'],
        trim: true,
        minlength: [2, 'Project name must be at least 2 characters'],
        maxlength: [100, 'Project name cannot exceed 100 characters']
    },
    key: {
        type: String,
        required: [true, 'Project key is required'],
        trim: true,
        uppercase: true,
        minlength: [2, 'Project key must be at least 2 characters'],
        maxlength: [10, 'Project key cannot exceed 10 characters'],
        match: [/^[A-Z][A-Z0-9_]{1,9}$/, 'Project key must start with an uppercase letter and contain only uppercase alphanumeric characters']
    },
    description: {
        type: String,
        default: '',
        trim: true,
        maxlength: [2000, 'Description cannot exceed 2000 characters']
    },
    workspace: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Workspace',
        required: [true, 'Workspace reference is required'],
        index: true
    },
    lead: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'user',
        required: [true, 'Project lead reference is required']
    },
    status: {
        type: String,
        enum: {
            values: ['Active', 'Planning', 'On Hold', 'Completed', 'Archived'],
            message: '{VALUE} is not a valid project status'
        },
        default: 'Active'
    },
    priority: {
        type: String,
        enum: {
            values: ['Low', 'Medium', 'High', 'Urgent'],
            message: '{VALUE} is not a valid priority'
        },
        default: 'Medium'
    },
    techStack: {
        type: [String],
        default: []
    },
    githubRepo: {
        type: String,
        default: '',
        trim: true
    },
    taskCounter: {
        type: Number,
        default: 0
    }
}, { timestamps: true });

// Scoped uniqueness: Project key must be unique within a workspace
projectSchema.index({ workspace: 1, key: 1 }, { unique: true });
projectSchema.index({ workspace: 1, name: 1 });
projectSchema.index({ workspace: 1, updatedAt: -1 });

const projectModel = mongoose.model('Project', projectSchema);

module.exports = projectModel;
