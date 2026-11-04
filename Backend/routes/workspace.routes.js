const express = require('express');
const router = express.Router();
const mongoose = require('mongoose');

const workspaceModel = require('../models/workspace.model');
const projectModel = require('../models/project.model');
const taskModel = require('../models/task.model');
const commentModel = require('../models/comment.model');
const activityModel = require('../models/activity.model');
const invitationModel = require('../models/invitation.model');
const userModel = require('../models/user.model');
const authMiddleware = require('../middleware/auth.middleware');
const projectRouter = require('./project.routes');
const invitationRouter = require('./invitation.routes');
const activityRouter = require('./activity.routes');
const analyticsRouter = require('./analytics.routes');
const {
    normalizeRole,
    getWorkspaceRole,
    isWorkspaceMember,
    isWorkspaceOwner,
    isWorkspaceAdminOrOwner,
    getWorkspaceOwnerCount
} = require('../middleware/workspaceAuth');
const { logActivity } = require('../utils/activityLogger');
const { createNotification } = require('../utils/notificationService');

const isValidObjectId = (id) => mongoose.Types.ObjectId.isValid(id);

// GET /api/workspaces - Fetch all workspaces user owns or is a member of
router.get('/', authMiddleware, async (req, res) => {
    try {
        const userId = req.userId;
        const workspaces = await workspaceModel.find({
            $or: [
                { owner: userId },
                { 'members.user': userId }
            ]
        })
        .populate('owner', 'name email')
        .sort({ updatedAt: -1 });

        return res.status(200).json({
            message: "Workspaces fetched successfully",
            workspaces
        });
    } catch (error) {
        console.error('Error fetching workspaces:', error);
        return res.status(500).json({
            message: "Internal server error while fetching workspaces"
        });
    }
});

// POST /api/workspaces - Create a new workspace
router.post('/', authMiddleware, async (req, res) => {
    try {
        const owner = req.userId;
        const { name, description, icon, color, visibility } = req.body;

        if (!name || !name.trim()) {
            return res.status(400).json({
                message: "Workspace name is required"
            });
        }

        const cleanName = name.trim();
        const baseSlug = cleanName.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
        const slug = baseSlug || `ws-${Date.now().toString().slice(-6)}`;

        const workspace = await workspaceModel.create({
            name: cleanName,
            slug,
            description: description?.trim() || '',
            icon: icon || 'Layers',
            color: color || 'from-indigo-500 to-purple-600',
            visibility: visibility || 'Public',
            owner: owner,
            members: [
                {
                    user: owner,
                    role: 'Owner'
                }
            ]
        });

        const populatedWorkspace = await workspaceModel.findById(workspace._id)
            .populate('owner', 'name email');

        // Log activity
        await logActivity({
            workspaceId: workspace._id,
            actorId: owner,
            action: 'WORKSPACE_UPDATED',
            resourceType: 'Workspace',
            details: { name: cleanName, action: 'Created workspace' }
        });

        return res.status(201).json({
            message: "Workspace created successfully",
            workspace: populatedWorkspace
        });
    } catch (error) {
        console.error('Error creating workspace:', error);
        return res.status(500).json({
            message: "Internal server error while creating workspace"
        });
    }
});

// Mount nested routes
router.use('/:workspaceId/projects', projectRouter);
router.use('/:workspaceId/invitations', invitationRouter);
router.use('/:workspaceId/activity', activityRouter);

// GET /api/workspaces/:workspaceId - Fetch workspace details
router.get('/:workspaceId', authMiddleware, async (req, res) => {
    try {
        const { workspaceId } = req.params;
        const userId = req.userId;

        const isObjectId = isValidObjectId(workspaceId);
        const query = isObjectId ? { _id: workspaceId } : { slug: workspaceId };

        const workspace = await workspaceModel.findOne(query)
            .populate('owner', 'name email')
            .populate('members.user', 'name email');

        if (!workspace) {
            return res.status(404).json({ message: "Workspace not found" });
        }

        if (!isWorkspaceMember(workspace, userId)) {
            return res.status(403).json({
                message: "You are not authorized to access this workspace"
            });
        }

        const userRole = getWorkspaceRole(workspace, userId);

        return res.status(200).json({
            message: "Workspace fetched successfully",
            workspace,
            userRole
        });
    } catch (error) {
        console.error('Error fetching workspace:', error);
        return res.status(500).json({
            message: "Internal server error while fetching workspace"
        });
    }
});

// GET /api/workspaces/:workspaceId/members - Fetch all workspace members
router.get('/:workspaceId/members', authMiddleware, async (req, res) => {
    try {
        const { workspaceId } = req.params;
        const userId = req.userId;

        const isObjectId = isValidObjectId(workspaceId);
        const query = isObjectId ? { _id: workspaceId } : { slug: workspaceId };

        const workspace = await workspaceModel.findOne(query)
            .populate('owner', 'name email')
            .populate('members.user', 'name email');

        if (!workspace) {
            return res.status(404).json({ message: "Workspace not found" });
        }

        if (!isWorkspaceMember(workspace, userId)) {
            return res.status(403).json({
                message: "You are not authorized to access this workspace"
            });
        }

        // Build normalized members list
        const memberList = [];
        const seenUserIds = new Set();

        if (workspace.members && Array.isArray(workspace.members)) {
            workspace.members.forEach((m) => {
                if (m.user) {
                    const uId = m.user._id ? m.user._id.toString() : m.user.toString();
                    seenUserIds.add(uId);
                    memberList.push({
                        id: uId,
                        _id: uId,
                        user: m.user,
                        name: m.user.name || 'Member',
                        email: m.user.email || '',
                        role: normalizeRole(m.role),
                        joinedAt: m.joinedAt || workspace.createdAt,
                        status: 'Active'
                    });
                }
            });
        }

        // Ensure direct owner is included
        const ownerId = workspace.owner?._id ? workspace.owner._id.toString() : workspace.owner?.toString();
        if (ownerId && !seenUserIds.has(ownerId)) {
            memberList.unshift({
                id: ownerId,
                _id: ownerId,
                user: workspace.owner,
                name: workspace.owner?.name || 'Owner',
                email: workspace.owner?.email || '',
                role: 'Owner',
                joinedAt: workspace.createdAt,
                status: 'Active'
            });
        }

        return res.status(200).json({
            message: "Workspace members fetched successfully",
            count: memberList.length,
            members: memberList
        });
    } catch (error) {
        console.error('Error fetching workspace members:', error);
        return res.status(500).json({
            message: "Internal server error while fetching members"
        });
    }
});

// PATCH /api/workspaces/:workspaceId/members/:memberId/role - Update member role
router.patch('/:workspaceId/members/:memberId/role', authMiddleware, async (req, res) => {
    try {
        const { workspaceId, memberId } = req.params;
        const { role } = req.body;
        const actorId = req.userId;

        const validRoles = ['Owner', 'Admin', 'Member', 'Viewer'];
        const targetRole = normalizeRole(role);
        if (!validRoles.includes(targetRole)) {
            return res.status(400).json({
                message: `Invalid role. Allowed values: ${validRoles.join(', ')}`
            });
        }

        const isObjectId = isValidObjectId(workspaceId);
        const query = isObjectId ? { _id: workspaceId } : { slug: workspaceId };
        const workspace = await workspaceModel.findOne(query).populate('members.user', 'name email');

        if (!workspace) {
            return res.status(404).json({ message: "Workspace not found" });
        }

        const actorRole = getWorkspaceRole(workspace, actorId);
        if (actorRole !== 'Owner' && actorRole !== 'Admin') {
            return res.status(403).json({
                message: "Only workspace owners and administrators can change member roles"
            });
        }

        // Find the member to update
        const memberIndex = workspace.members.findIndex(
            (m) => m.user?._id?.toString() === memberId || m.user?.toString() === memberId
        );

        if (memberIndex === -1) {
            return res.status(404).json({ message: "Member not found in this workspace" });
        }

        const currentMemberRole = normalizeRole(workspace.members[memberIndex].role);

        // Admin cannot promote anyone to Owner or alter an Owner's role
        if (actorRole === 'Admin') {
            if (targetRole === 'Owner') {
                return res.status(403).json({
                    message: "Only workspace owners can grant the Owner role"
                });
            }
            if (currentMemberRole === 'Owner') {
                return res.status(403).json({
                    message: "Administrators cannot modify the role of an Owner"
                });
            }
        }

        // Check if trying to demote the last remaining Owner
        if (currentMemberRole === 'Owner' && targetRole !== 'Owner') {
            const ownerCount = getWorkspaceOwnerCount(workspace);
            if (ownerCount <= 1) {
                return res.status(400).json({
                    message: "Cannot demote the last workspace owner. Transfer ownership or promote another owner first."
                });
            }
        }

        workspace.members[memberIndex].role = targetRole;
        await workspace.save();

        const updatedUser = workspace.members[memberIndex].user;

        // Log activity
        await logActivity({
            workspaceId: workspace._id,
            actorId,
            action: 'MEMBER_ROLE_UPDATED',
            resourceType: 'Member',
            details: {
                memberId,
                memberName: updatedUser?.name || 'Member',
                oldRole: currentMemberRole,
                newRole: targetRole
            }
        });

        // Notify member
        await createNotification({
            recipientId: memberId,
            senderId: actorId,
            workspaceId: workspace._id,
            type: 'ROLE_UPDATED',
            title: 'Role Updated',
            message: `Your role in "${workspace.name}" was updated to ${targetRole}.`,
            link: `/workspace/${workspace.slug || workspace._id}`
        });

        return res.status(200).json({
            message: `Member role updated to ${targetRole} successfully`,
            member: {
                id: memberId,
                role: targetRole,
                user: updatedUser
            }
        });
    } catch (error) {
        console.error('Error updating member role:', error);
        return res.status(500).json({
            message: "Internal server error while updating member role"
        });
    }
});

// DELETE /api/workspaces/:workspaceId/members/:memberId - Remove member from workspace
router.delete('/:workspaceId/members/:memberId', authMiddleware, async (req, res) => {
    try {
        const { workspaceId, memberId } = req.params;
        const actorId = req.userId;

        const isObjectId = isValidObjectId(workspaceId);
        const query = isObjectId ? { _id: workspaceId } : { slug: workspaceId };
        const workspace = await workspaceModel.findOne(query).populate('members.user', 'name email');

        if (!workspace) {
            return res.status(404).json({ message: "Workspace not found" });
        }

        const isSelfLeaving = actorId.toString() === memberId.toString();
        const actorRole = getWorkspaceRole(workspace, actorId);

        if (!isSelfLeaving && actorRole !== 'Owner' && actorRole !== 'Admin') {
            return res.status(403).json({
                message: "Only workspace owners and administrators can remove members"
            });
        }

        const memberIndex = workspace.members.findIndex(
            (m) => m.user?._id?.toString() === memberId || m.user?.toString() === memberId
        );

        if (memberIndex === -1) {
            return res.status(404).json({ message: "Member not found in this workspace" });
        }

        const memberToRemoveRole = normalizeRole(workspace.members[memberIndex].role);

        // Admin cannot remove an Owner
        if (!isSelfLeaving && actorRole === 'Admin' && memberToRemoveRole === 'Owner') {
            return res.status(403).json({
                message: "Administrators cannot remove workspace owners"
            });
        }

        // Prevent removing the last Owner
        if (memberToRemoveRole === 'Owner') {
            const ownerCount = getWorkspaceOwnerCount(workspace);
            if (ownerCount <= 1) {
                return res.status(400).json({
                    message: "Cannot remove the last workspace owner. Transfer ownership first or delete the workspace."
                });
            }
        }

        const removedMember = workspace.members[memberIndex];
        workspace.members.splice(memberIndex, 1);
        await workspace.save();

        // Log activity
        await logActivity({
            workspaceId: workspace._id,
            actorId,
            action: 'MEMBER_REMOVED',
            resourceType: 'Member',
            details: {
                memberId,
                memberName: removedMember.user?.name || 'Member',
                role: memberToRemoveRole,
                selfLeft: isSelfLeaving
            }
        });

        // Notify member if removed by another user
        if (!isSelfLeaving) {
            await createNotification({
                recipientId: memberId,
                senderId: actorId,
                workspaceId: workspace._id,
                type: 'ROLE_UPDATED',
                title: 'Removed from Workspace',
                message: `You were removed from workspace "${workspace.name}".`,
                link: '/dashboard'
            });
        }

        return res.status(200).json({
            message: isSelfLeaving ? "You have left the workspace successfully" : "Member removed successfully",
            removedMemberId: memberId
        });
    } catch (error) {
        console.error('Error removing workspace member:', error);
        return res.status(500).json({
            message: "Internal server error while removing member"
        });
    }
});

// PUT /api/workspaces/:workspaceId - Update workspace settings
router.put('/:workspaceId', authMiddleware, async (req, res) => {
    try {
        const { workspaceId } = req.params;
        const userId = req.userId;
        const { name, description, icon, color, visibility } = req.body;

        const isObjectId = isValidObjectId(workspaceId);
        const query = isObjectId ? { _id: workspaceId } : { slug: workspaceId };

        const workspace = await workspaceModel.findOne(query);

        if (!workspace) {
            return res.status(404).json({ message: "Workspace not found" });
        }

        // Only owner or admin can update workspace details
        if (!isWorkspaceAdminOrOwner(workspace, userId)) {
            return res.status(403).json({
                message: "Only workspace owners and administrators can update workspace settings"
            });
        }

        if (name && name.trim()) workspace.name = name.trim();
        if (description !== undefined) workspace.description = description.trim();
        if (icon) workspace.icon = icon;
        if (color) workspace.color = color;
        if (visibility) workspace.visibility = visibility;

        await workspace.save();

        // Log activity
        await logActivity({
            workspaceId: workspace._id,
            actorId: userId,
            action: 'WORKSPACE_UPDATED',
            resourceType: 'Workspace',
            details: { name: workspace.name }
        });

        const updatedWorkspace = await workspaceModel.findById(workspace._id)
            .populate('owner', 'name email');

        return res.status(200).json({
            message: "Workspace updated successfully",
            workspace: updatedWorkspace
        });
    } catch (error) {
        console.error('Error updating workspace:', error);
        return res.status(500).json({
            message: "Internal server error while updating workspace"
        });
    }
});

// DELETE /api/workspaces/:workspaceId - Delete workspace
router.delete('/:workspaceId', authMiddleware, async (req, res) => {
    try {
        const { workspaceId } = req.params;
        const userId = req.userId;

        const isObjectId = isValidObjectId(workspaceId);
        const query = isObjectId ? { _id: workspaceId } : { slug: workspaceId };

        const workspace = await workspaceModel.findOne(query);

        if (!workspace) {
            return res.status(404).json({ message: "Workspace not found" });
        }

        // Only direct Owner can delete workspace
        if (!isWorkspaceOwner(workspace, userId)) {
            return res.status(403).json({
                message: "Only the workspace owner can delete this workspace"
            });
        }

        // Cascade cleanup of tasks, projects, comments, invitations, activity
        await taskModel.deleteMany({ workspace: workspace._id });
        await projectModel.deleteMany({ workspace: workspace._id });
        await commentModel.deleteMany({ workspace: workspace._id });
        await invitationModel.deleteMany({ workspace: workspace._id });
        await activityModel.deleteMany({ workspace: workspace._id });
        await workspaceModel.findByIdAndDelete(workspace._id);

        return res.status(200).json({
            message: "Workspace deleted successfully",
            deletedId: workspace._id
        });
    } catch (error) {
        console.error('Error deleting workspace:', error);
        return res.status(500).json({
            message: "Internal server error while deleting workspace"
        });
    }
});

// Analytics & Team Workload & Export
router.get('/:workspaceId/analytics', (req, res, next) => {
    const qs = req.url.includes('?') ? req.url.slice(req.url.indexOf('?')) : '';
    req.url = `/workspaces/${req.params.workspaceId}${qs}`;
    analyticsRouter(req, res, next);
});

router.get('/:workspaceId/team-workload', (req, res, next) => {
    const qs = req.url.includes('?') ? req.url.slice(req.url.indexOf('?')) : '';
    req.url = `/workspaces/${req.params.workspaceId}/team${qs}`;
    analyticsRouter(req, res, next);
});

router.get('/:workspaceId/export', (req, res, next) => {
    const qs = req.url.includes('?') ? req.url.slice(req.url.indexOf('?')) : '';
    req.url = `/workspaces/${req.params.workspaceId}/export${qs}`;
    analyticsRouter(req, res, next);
});

module.exports = router;
