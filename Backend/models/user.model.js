const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
    name: {
        type: String,
        required: [true, 'Name is required'],
        trim: true,
        minlength: [2, 'Name must be at least 2 characters'],
        maxlength: [100, 'Name cannot exceed 100 characters']
    },
    email: {
        type: String,
        required: [true, 'Email is required'],
        trim: true,
        unique: true,
        lowercase: true,
        match: [/^[^\s@]+@[^\s@]+\.[^\s@]+$/, 'Invalid email address format']
    },
    password: {
        type: String,
        required: [true, 'Password is required']
    },
    avatar: {
        type: String,
        default: ''
    },
    bio: {
        type: String,
        default: '',
        maxlength: [500, 'Bio cannot exceed 500 characters']
    },
    github: {
        type: String,
        default: '',
        trim: true
    },
    tokenVersion: {
        type: Number,
        default: 0
    }
}, {
    timestamps: true,
    toJSON: {
        transform: function (doc, ret) {
            delete ret.password;
            delete ret.__v;
            return ret;
        }
    },
    toObject: {
        transform: function (doc, ret) {
            delete ret.password;
            delete ret.__v;
            return ret;
        }
    }
});

const userModel = mongoose.model('user', userSchema);

module.exports = userModel;
