const mongoose = require('mongoose');
const { validationResult } = require('express-validator');

/**
 * Normalizes role names (e.g. legacy 'Workspace Owner' -> 'Owner')
 */
const normalizeRole = (role) => {
    if (!role) return null;
    const r = role.toString().trim();
    if (r === 'Workspace Owner' || r === 'Owner') return 'Owner';
    if (r === 'Admin') return 'Admin';
    if (r === 'Viewer') return 'Viewer';
    return 'Member';
};

/**
 * Get a user's role in a workspace ('Owner' | 'Admin' | 'Member' | 'Viewer' | null)
 */
const getWorkspaceRole = (workspace, userId) => {
    if (!workspace || !userId) return null;
    const uId = userId.toString();

    // Check direct workspace owner
    const ownerId = workspace.owner?._id ? workspace.owner._id.toString() : workspace.owner?.toString();
    if (ownerId === uId) {
        return 'Owner';
    }

    // Check members array
    if (workspace.members && Array.isArray(workspace.members)) {
        const found = workspace.members.find((m) => {
            const mId = m.user?._id ? m.user._id.toString() : m.user?.toString();
            return mId === uId;
        });
        if (found) {
            return normalizeRole(found.role);
        }
    }

    return null;
};

/**
 * Check if a user is any member or owner of a workspace (including Viewer)
 */
const isWorkspaceMember = (workspace, userId) => {
    return getWorkspaceRole(workspace, userId) !== null;
};

/**
 * Check if user is Workspace Owner
 */
const isWorkspaceOwner = (workspace, userId) => {
    return getWorkspaceRole(workspace, userId) === 'Owner';
};

/**
 * Check if user is Workspace Admin or Owner
 */
const isWorkspaceAdminOrOwner = (workspace, userId) => {
    const role = getWorkspaceRole(workspace, userId);
    return role === 'Owner' || role === 'Admin';
};

/**
 * Check if user has write permissions (Owner, Admin, or Member; Viewers are read-only)
 */
const isWorkspaceWriter = (workspace, userId) => {
    const role = getWorkspaceRole(workspace, userId);
    return role === 'Owner' || role === 'Admin' || role === 'Member';
};

/**
 * Count the number of owners in a workspace
 */
const getWorkspaceOwnerCount = (workspace) => {
    if (!workspace) return 0;
    const directOwnerId = workspace.owner?._id ? workspace.owner._id.toString() : workspace.owner?.toString();
    const ownerSet = new Set();
    if (directOwnerId) ownerSet.add(directOwnerId);

    if (workspace.members && Array.isArray(workspace.members)) {
        workspace.members.forEach((m) => {
            const role = normalizeRole(m.role);
            if (role === 'Owner') {
                const mId = m.user?._id ? m.user._id.toString() : m.user?.toString();
                if (mId) ownerSet.add(mId);
            }
        });
    }

    return ownerSet.size;
};

/**
 * Express middleware to check express-validator validation results
 */
const handleValidationErrors = (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({
            message: errors.array()[0]?.msg || 'Validation failed',
            errors: errors.array()
        });
    }
    next();
};

module.exports = {
    normalizeRole,
    getWorkspaceRole,
    isWorkspaceMember,
    isWorkspaceOwner,
    isWorkspaceAdminOrOwner,
    isWorkspaceWriter,
    getWorkspaceOwnerCount,
    handleValidationErrors
};
