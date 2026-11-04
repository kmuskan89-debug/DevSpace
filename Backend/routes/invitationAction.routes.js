const express = require('express');
const router = express.Router();
const crypto = require('crypto');

const invitationModel = require('../models/invitation.model');
const workspaceModel = require('../models/workspace.model');
const userModel = require('../models/user.model');
const authMiddleware = require('../middleware/auth.middleware');
const { logActivity } = require('../utils/activityLogger');
const { createNotification } = require('../utils/notificationService');

/**
 * GET /api/invitations/verify/:token
 * Verify invitation token status and return workspace info without accepting
 */
router.get('/verify/:token', async (req, res) => {
    try {
        const { token } = req.params;
        if (!token) {
            return res.status(400).json({ message: 'Invitation token is required' });
        }

        const tokenHash = crypto.createHash('sha256').update(token).digest('hex');
        const invitation = await invitationModel.findOne({ tokenHash })
            .populate('workspace', 'name slug icon color description')
            .populate('invitedBy', 'name email');

        if (!invitation) {
            return res.status(404).json({ message: 'Invalid or nonexistent invitation token' });
        }

        if (invitation.status !== 'Pending') {
            return res.status(400).json({
                message: `This invitation has already been ${invitation.status.toLowerCase()}`,
                status: invitation.status
            });
        }

        if (new Date() > new Date(invitation.expiresAt)) {
            invitation.status = 'Expired';
            await invitation.save();
            return res.status(400).json({
                message: 'This invitation has expired',
                status: 'Expired'
            });
        }

        return res.status(200).json({
            message: 'Invitation is valid',
            invitation: {
                _id: invitation._id,
                email: invitation.email,
                role: invitation.role,
                workspace: invitation.workspace,
                invitedBy: invitation.invitedBy,
                expiresAt: invitation.expiresAt
            }
        });
    } catch (error) {
        console.error('Error verifying invitation token:', error);
        return res.status(500).json({ message: 'Internal server error while verifying invitation' });
    }
});

/**
 * POST /api/invitations/accept/:token
 * Accept a workspace invitation
 */
router.post('/accept/:token', authMiddleware, async (req, res) => {
    try {
        const userId = req.userId;
        const { token } = req.params;

        const tokenHash = crypto.createHash('sha256').update(token).digest('hex');
        const invitation = await invitationModel.findOne({ tokenHash });

        if (!invitation) {
            return res.status(404).json({ message: 'Invalid or nonexistent invitation' });
        }

        if (invitation.status !== 'Pending') {
            return res.status(400).json({
                message: `This invitation is no longer active (Status: ${invitation.status})`
            });
        }

        if (new Date() > new Date(invitation.expiresAt)) {
            invitation.status = 'Expired';
            await invitation.save();
            return res.status(400).json({ message: 'This invitation has expired' });
        }

        const user = await userModel.findById(userId);
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        const workspace = await workspaceModel.findById(invitation.workspace);
        if (!workspace) {
            return res.status(404).json({ message: 'Associated workspace no longer exists' });
        }

        // Check if user is already a member
        const existingMember = workspace.members.find(
            (m) => m.user?.toString() === userId.toString()
        );
        const isOwner = workspace.owner.toString() === userId.toString();

        if (existingMember || isOwner) {
            invitation.status = 'Accepted';
            invitation.acceptedAt = new Date();
            await invitation.save();
            return res.status(200).json({
                message: 'You are already a member of this workspace',
                workspace
            });
        }

        // Add user to workspace with invited role
        workspace.members.push({
            user: userId,
            role: invitation.role,
            joinedAt: new Date()
        });
        await workspace.save();

        // Mark invitation as accepted
        invitation.status = 'Accepted';
        invitation.acceptedAt = new Date();
        await invitation.save();

        // Log activity
        await logActivity({
            workspaceId: workspace._id,
            actorId: userId,
            action: 'MEMBER_JOINED',
            resourceType: 'Member',
            details: {
                user: user.name,
                email: user.email,
                role: invitation.role
            }
        });

        // Notify inviter
        await createNotification({
            recipientId: invitation.invitedBy,
            senderId: userId,
            workspaceId: workspace._id,
            type: 'ROLE_UPDATED',
            title: 'Invitation Accepted',
            message: `${user.name} accepted your invitation to join ${workspace.name} as ${invitation.role}.`,
            link: `/workspace/${workspace.slug || workspace._id}/members`
        });

        const updatedWorkspace = await workspaceModel.findById(workspace._id)
            .populate('owner', 'name email')
            .populate('members.user', 'name email');

        return res.status(200).json({
            message: `Successfully joined ${workspace.name}!`,
            role: invitation.role,
            workspace: updatedWorkspace
        });
    } catch (error) {
        console.error('Error accepting invitation:', error);
        return res.status(500).json({ message: 'Internal server error while accepting invitation' });
    }
});

/**
 * POST /api/invitations/reject/:token
 * Reject a workspace invitation
 */
router.post('/reject/:token', authMiddleware, async (req, res) => {
    try {
        const { token } = req.params;
        const tokenHash = crypto.createHash('sha256').update(token).digest('hex');
        const invitation = await invitationModel.findOne({ tokenHash });

        if (!invitation) {
            return res.status(404).json({ message: 'Invalid or nonexistent invitation' });
        }

        if (invitation.status !== 'Pending') {
            return res.status(400).json({ message: `Invitation is already ${invitation.status.toLowerCase()}` });
        }

        invitation.status = 'Rejected';
        await invitation.save();

        return res.status(200).json({
            message: 'Invitation rejected successfully'
        });
    } catch (error) {
        console.error('Error rejecting invitation:', error);
        return res.status(500).json({ message: 'Internal server error while rejecting invitation' });
    }
});

/**
 * GET /api/invitations/my-invitations
 * Get pending invitations for the logged-in user
 */
router.get('/my-invitations', authMiddleware, async (req, res) => {
    try {
        const user = await userModel.findById(req.userId);
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        const invitations = await invitationModel.find({
            email: user.email.toLowerCase(),
            status: 'Pending',
            expiresAt: { $gt: new Date() }
        })
        .select('-tokenHash')
        .populate('workspace', 'name slug icon color description')
        .populate('invitedBy', 'name email')
        .sort({ createdAt: -1 });

        return res.status(200).json({
            message: 'My invitations fetched successfully',
            count: invitations.length,
            invitations
        });
    } catch (error) {
        console.error('Error fetching user invitations:', error);
        return res.status(500).json({ message: 'Internal server error while fetching user invitations' });
    }
});

module.exports = router;
