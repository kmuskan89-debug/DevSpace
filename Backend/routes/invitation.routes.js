const express = require('express');
const router = express.Router({ mergeParams: true });
const crypto = require('crypto');
const mongoose = require('mongoose');
const { body } = require('express-validator');

const invitationModel = require('../models/invitation.model');
const workspaceModel = require('../models/workspace.model');
const userModel = require('../models/user.model');
const authMiddleware = require('../middleware/auth.middleware');
const {
    getWorkspaceRole,
    isWorkspaceMember,
    isWorkspaceAdminOrOwner,
    handleValidationErrors
} = require('../middleware/workspaceAuth');
const { logActivity } = require('../utils/activityLogger');
const { createNotification } = require('../utils/notificationService');

const isValidObjectId = (id) => mongoose.Types.ObjectId.isValid(id);

/**
 * POST /api/workspaces/:workspaceId/invitations
 * Invite a user by email to the workspace
 */
router.post(
    '/',
    authMiddleware,
    [
        body('email')
            .trim()
            .isEmail()
            .withMessage('A valid email address is required')
            .normalizeEmail(),
        body('role')
            .optional()
            .isIn(['Admin', 'Member', 'Viewer'])
            .withMessage('Role must be Admin, Member, or Viewer'),
        handleValidationErrors
    ],
    async (req, res) => {
        try {
            const userId = req.userId;
            const workspaceId = req.params.workspaceId;

            const isObjectId = isValidObjectId(workspaceId);
            const wsQuery = isObjectId ? { _id: workspaceId } : { slug: workspaceId };
            const workspace = await workspaceModel.findOne(wsQuery).populate('members.user', 'email');

            if (!workspace) {
                return res.status(404).json({ message: 'Workspace not found' });
            }

            // Only workspace owner or admin can invite members
            if (!isWorkspaceAdminOrOwner(workspace, userId)) {
                return res.status(403).json({
                    message: 'Only workspace owners and administrators can invite new members'
                });
            }

            const { email, role = 'Member' } = req.body;
            const cleanEmail = email.toLowerCase().trim();

            // Check if user is already in the workspace
            const existingUser = await userModel.findOne({ email: cleanEmail });
            if (existingUser) {
                const isAlreadyMember = workspace.members.some(
                    (m) => m.user?._id?.toString() === existingUser._id.toString() ||
                           m.user?.toString() === existingUser._id.toString() ||
                           m.user?.email === cleanEmail
                );
                const isOwner = workspace.owner.toString() === existingUser._id.toString();

                if (isAlreadyMember || isOwner) {
                    return res.status(400).json({
                        message: 'A user with this email address is already a member of this workspace'
                    });
                }
            }

            // Check for existing pending invitation
            const existingInvite = await invitationModel.findOne({
                workspace: workspace._id,
                email: cleanEmail,
                status: 'Pending',
                expiresAt: { $gt: new Date() }
            });

            if (existingInvite) {
                return res.status(400).json({
                    message: 'An active invitation is already pending for this email address'
                });
            }

            // Generate secure random token
            const rawToken = crypto.randomBytes(32).toString('hex');
            const tokenHash = crypto.createHash('sha256').update(rawToken).digest('hex');

            // 7-day expiration
            const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);

            const invitation = await invitationModel.create({
                workspace: workspace._id,
                email: cleanEmail,
                role,
                tokenHash,
                invitedBy: userId,
                status: 'Pending',
                expiresAt
            });

            const populatedInvite = await invitationModel.findById(invitation._id)
                .populate('invitedBy', 'name email')
                .populate('workspace', 'name slug');

            // Log activity
            await logActivity({
                workspaceId: workspace._id,
                actorId: userId,
                action: 'MEMBER_INVITED',
                resourceType: 'Member',
                details: {
                    email: cleanEmail,
                    role,
                    invitationId: invitation._id
                }
            });

            // If invited user is registered on the platform, send an in-app notification
            if (existingUser) {
                await createNotification({
                    recipientId: existingUser._id,
                    senderId: userId,
                    workspaceId: workspace._id,
                    type: 'WORKSPACE_INVITATION',
                    title: 'Workspace Invitation',
                    message: `You were invited to join "${workspace.name}" as ${role}.`,
                    link: `/workspace/${workspace.slug || workspace._id}`
                });
            }

            // Return invitation without exposing tokenHash in the body; provide token for direct invite link
            return res.status(201).json({
                message: `Invitation generated successfully for ${cleanEmail}`,
                invitation: {
                    _id: populatedInvite._id,
                    token: rawToken,
                    email: populatedInvite.email,
                    role: populatedInvite.role,
                    status: populatedInvite.status,
                    expiresAt: populatedInvite.expiresAt,
                    invitedBy: populatedInvite.invitedBy,
                    workspace: populatedInvite.workspace,
                    createdAt: populatedInvite.createdAt
                },
                invitationToken: rawToken,
                invitationUrl: `/invite/${rawToken}`
            });
        } catch (error) {
            console.error('Error creating workspace invitation:', error);
            return res.status(500).json({
                message: 'Internal server error while creating invitation'
            });
        }
    }
);

/**
 * GET /api/workspaces/:workspaceId/invitations
 * List all invitations for a workspace
 */
router.get('/', authMiddleware, async (req, res) => {
    try {
        const userId = req.userId;
        const workspaceId = req.params.workspaceId;

        const isObjectId = isValidObjectId(workspaceId);
        const wsQuery = isObjectId ? { _id: workspaceId } : { slug: workspaceId };
        const workspace = await workspaceModel.findOne(wsQuery);

        if (!workspace) {
            return res.status(404).json({ message: 'Workspace not found' });
        }

        if (!isWorkspaceAdminOrOwner(workspace, userId)) {
            return res.status(403).json({
                message: 'Only workspace owners and administrators can view workspace invitations'
            });
        }

        const invitations = await invitationModel.find({ workspace: workspace._id })
            .select('-tokenHash')
            .populate('invitedBy', 'name email')
            .sort({ createdAt: -1 });

        return res.status(200).json({
            message: 'Invitations fetched successfully',
            count: invitations.length,
            invitations
        });
    } catch (error) {
        console.error('Error fetching invitations:', error);
        return res.status(500).json({
            message: 'Internal server error while fetching invitations'
        });
    }
});

/**
 * DELETE /api/workspaces/:workspaceId/invitations/:invitationId
 * Revoke a pending invitation
 */
router.delete('/:invitationId', authMiddleware, async (req, res) => {
    try {
        const userId = req.userId;
        const { workspaceId, invitationId } = req.params;

        const isObjectId = isValidObjectId(workspaceId);
        const wsQuery = isObjectId ? { _id: workspaceId } : { slug: workspaceId };
        const workspace = await workspaceModel.findOne(wsQuery);

        if (!workspace) {
            return res.status(404).json({ message: 'Workspace not found' });
        }

        if (!isWorkspaceAdminOrOwner(workspace, userId)) {
            return res.status(403).json({
                message: 'Only workspace owners and administrators can revoke invitations'
            });
        }

        const invitation = await invitationModel.findOne({
            _id: invitationId,
            workspace: workspace._id
        });

        if (!invitation) {
            return res.status(404).json({ message: 'Invitation not found' });
        }

        invitation.status = 'Revoked';
        await invitation.save();

        return res.status(200).json({
            message: 'Invitation revoked successfully',
            revokedId: invitation._id
        });
    } catch (error) {
        console.error('Error revoking invitation:', error);
        return res.status(500).json({
            message: 'Internal server error while revoking invitation'
        });
    }
});

module.exports = router;
