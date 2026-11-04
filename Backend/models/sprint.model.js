const mongoose = require('mongoose');

const sprintSchema = new mongoose.Schema({
    name: {
        type: String,
        required: [true, 'Sprint name is required'],
        trim: true,
        minlength: [1, 'Sprint name cannot be empty'],
        maxlength: [100, 'Sprint name cannot exceed 100 characters']
    },
    goal: {
        type: String,
        default: '',
        trim: true,
        maxlength: [2000, 'Sprint goal cannot exceed 2000 characters']
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
    status: {
        type: String,
        enum: {
            values: ['Planned', 'Active', 'Completed'],
            message: '{VALUE} is not a valid sprint status'
        },
        default: 'Planned',
        index: true
    },
    startDate: {
        type: Date,
        default: null
    },
    endDate: {
        type: Date,
        default: null
    },
    startedAt: {
        type: Date,
        default: null
    },
    completedAt: {
        type: Date,
        default: null
    },
    order: {
        type: Number,
        default: 0
    },
    sprintNumber: {
        type: Number,
        default: 1
    },
    initialCommitment: {
        issueCount: {
            type: Number,
            default: 0
        },
        storyPoints: {
            type: Number,
            default: 0
        }
    },
    createdBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'user',
        required: [true, 'Sprint creator is required']
    }
}, { timestamps: true });

// Compound indexes
sprintSchema.index({ project: 1, status: 1 });
sprintSchema.index({ project: 1, order: 1 });
sprintSchema.index({ workspace: 1, project: 1 });

const sprintModel = mongoose.model('Sprint', sprintSchema);

module.exports = sprintModel;
