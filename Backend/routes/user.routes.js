const express = require('express');
const router = express.Router();
const userModel = require('../models/user.model');
const workspaceModel = require('../models/workspace.model');
const { body, validationResult } = require('express-validator');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const crypto = require('crypto');
const authMiddleware = require('../middleware/auth.middleware');

/**
 * POST /api/auth/register
 * Secure user registration with password hashing and starter workspace
 */
router.post('/register',
    body('name').trim().isLength({ min: 2, max: 100 }).withMessage('Name must be between 2 and 100 characters'),
    body('email').trim().isEmail().withMessage('Please provide a valid email'),
    body('password').trim().isLength({ min: 8 }).withMessage('Password must be at least 8 characters'),

    async (req, res) => {
        const { name, email, password } = req.body;
        const errors = validationResult(req);

        if (!errors.isEmpty()) {
            return res.status(400).json({
                errors: errors.array(),
                message: errors.array()[0]?.msg || "Invalid data",
            });
        }

        try {
            const existingUser = await userModel.findOne({ email: email.toLowerCase() });
            if (existingUser) {
                return res.status(400).json({
                    message: "An account with this email already exists",
                });
            }

            const hashedPassword = await bcrypt.hash(password, 10);

            const user = await userModel.create({
                name: name.trim(),
                email: email.toLowerCase(),
                password: hashedPassword,
                tokenVersion: 0
            });

            // Automatically create a starter workspace for new user
            const baseSlug = name.trim().toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
            await workspaceModel.create({
                name: `${name.trim()}'s Workspace`,
                slug: `${baseSlug}-workspace-${Date.now().toString().slice(-4)}`,
                description: `Primary workspace for ${name.trim()}`,
                icon: 'Layers',
                color: 'from-indigo-500 to-purple-600',
                visibility: 'Public',
                owner: user._id,
                members: [
                    {
                        user: user._id,
                        role: 'Workspace Owner'
                    }
                ]
            });

            const token = jwt.sign(
                { userId: user._id, tokenVersion: user.tokenVersion || 0 },
                process.env.JWT_SECRET,
                { expiresIn: '1d' }
            );

            return res.status(201).json({
                message: "User registered successfully",
                token,
                user: {
                    id: user._id,
                    name: user.name,
                    email: user.email,
                }
            });
        } catch (error) {
            console.error('Registration error:', error);
            return res.status(500).json({
                message: "Server error during registration",
            });
        }
    }
);

/**
 * POST /api/auth/login
 * Secure user login with bcrypt comparison and JWT issuance
 */
router.post('/login',
    body('email').trim().isEmail().withMessage('Valid email is required'),
    body('password').isLength({ min: 6 }).withMessage('Password must be at least 6 characters'),

    async (req, res) => {
        const { email, password } = req.body;

        const errors = validationResult(req);

        if (!errors.isEmpty()) {
            return res.status(400).json({
                errors: errors.array(),
                message: errors.array()[0]?.msg || "Invalid data"
            });
        }

        try {
            const user = await userModel.findOne({
                email: email.toLowerCase()
            });

            if (!user) {
                return res.status(400).json({
                    message: "Email or password is incorrect"
                });
            }

            const isMatch = await bcrypt.compare(
                password,
                user.password
            );

            if (!isMatch) {
                return res.status(400).json({
                    message: "Email or password is incorrect"
                });
            }

            const token = jwt.sign(
                { userId: user._id, tokenVersion: user.tokenVersion || 0 },
                process.env.JWT_SECRET,
                { expiresIn: '1d' }
            );

            return res.status(200).json({
                message: "User logged in successfully",
                token,
                user: {
                    id: user._id,
                    name: user.name,
                    email: user.email,
                    avatar: user.avatar,
                    bio: user.bio,
                    github: user.github
                }
            });

        } catch (error) {
            console.error('Login error:', error);
            return res.status(500).json({
                message: "Server error during login"
            });
        }
    }
);

/**
 * GET /api/auth/profile
 * Get authenticated user profile
 */
router.get('/profile', authMiddleware, async (req, res) => {
    try {
        const user = await userModel.findById(req.userId).select('-password');

        if (!user) {
            return res.status(404).json({
                message: "User not found"
            });
        }

        return res.status(200).json({
            message: "Profile fetched successfully",
            user: {
                id: user._id,
                name: user.name,
                email: user.email,
                avatar: user.avatar,
                bio: user.bio,
                github: user.github,
                createdAt: user.createdAt,
            }
        });
    }
    catch (err) {
        console.error('Profile fetch error:', err);
        return res.status(500).json({
            message: "Server error while fetching profile"
        });
    }
});

/**
 * PUT /api/auth/profile
 * Update authenticated user profile
 */
router.put('/profile', authMiddleware,
    [
        body('name').optional().trim().isLength({ min: 2, max: 100 }).withMessage('Name must be between 2 and 100 characters'),
        body('bio').optional().trim().isLength({ max: 500 }).withMessage('Bio cannot exceed 500 characters'),
        body('github').optional().trim().isLength({ max: 100 }).withMessage('Github cannot exceed 100 characters')
    ],
    async (req, res) => {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({
                errors: errors.array(),
                message: errors.array()[0]?.msg
            });
        }

        try {
            const updates = {};
            if (req.body.name !== undefined) updates.name = req.body.name.trim();
            if (req.body.bio !== undefined) updates.bio = req.body.bio.trim();
            if (req.body.github !== undefined) updates.github = req.body.github.trim();
            if (req.body.avatar !== undefined) updates.avatar = req.body.avatar.trim();

            const updatedUser = await userModel.findByIdAndUpdate(
                req.userId,
                { $set: updates },
                { returnDocument: 'after' }
            ).select('-password');

            return res.status(200).json({
                message: "Profile updated successfully",
                user: {
                    id: updatedUser._id,
                    name: updatedUser.name,
                    email: updatedUser.email,
                    avatar: updatedUser.avatar,
                    bio: updatedUser.bio,
                    github: updatedUser.github,
                    createdAt: updatedUser.createdAt
                }
            });
        } catch (err) {
            console.error('Update profile error:', err);
            return res.status(500).json({ message: "Server error while updating profile" });
        }
    }
);

/**
 * POST /api/auth/change-password
 * Secure password change with current password validation and token version increment
 */
router.post('/change-password', authMiddleware,
    [
        body('currentPassword').notEmpty().withMessage('Current password is required'),
        body('newPassword').trim().isLength({ min: 8 }).withMessage('New password must be at least 8 characters')
    ],
    async (req, res) => {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({
                errors: errors.array(),
                message: errors.array()[0]?.msg
            });
        }

        try {
            const { currentPassword, newPassword } = req.body;
            const user = await userModel.findById(req.userId);
            if (!user) {
                return res.status(404).json({ message: "User not found" });
            }

            const isMatch = await bcrypt.compare(currentPassword, user.password);
            if (!isMatch) {
                return res.status(400).json({ message: "Current password is incorrect" });
            }

            const hashed = await bcrypt.hash(newPassword, 10);
            user.password = hashed;
            user.tokenVersion = (user.tokenVersion || 0) + 1;
            await user.save();

            const newToken = jwt.sign(
                { userId: user._id, tokenVersion: user.tokenVersion },
                process.env.JWT_SECRET,
                { expiresIn: '1d' }
            );

            return res.status(200).json({
                message: "Password changed successfully",
                token: newToken
            });
        } catch (err) {
            console.error('Change password error:', err);
            return res.status(500).json({ message: "Server error while changing password" });
        }
    }
);

/**
 * POST /api/auth/logout
 * Secure logout with token invalidation strategy
 */
router.post('/logout', authMiddleware, async (req, res) => {
    try {
        await userModel.findByIdAndUpdate(req.userId, { $inc: { tokenVersion: 1 } });
        return res.status(200).json({
            message: "Logged out successfully. All existing sessions invalidated."
        });
    } catch (err) {
        console.error('Logout error:', err);
        return res.status(500).json({ message: "Server error during logout" });
    }
});

/**
 * POST /api/auth/forgot-password
 * Password recovery request (safe against user enumeration)
 */
router.post('/forgot-password',
    body('email').trim().isEmail().withMessage('Valid email is required'),
    async (req, res) => {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ message: 'Valid email is required' });
        }

        try {
            const { email } = req.body;
            const user = await userModel.findOne({ email: email.toLowerCase() });

            // To avoid user enumeration, return generic success message
            if (!user) {
                return res.status(200).json({
                    message: "If an account with that email exists, password reset instructions have been sent."
                });
            }

            // Create secure reset token
            const resetToken = crypto.randomBytes(32).toString('hex');
            // In a production setup with configured SMTP, send email with reset link
            // For now, return generic confirmation

            return res.status(200).json({
                message: "If an account with that email exists, password reset instructions have been sent."
            });
        } catch (err) {
            console.error('Forgot password error:', err);
            return res.status(500).json({ message: "Server error processing password reset" });
        }
    }
);

module.exports = router;
