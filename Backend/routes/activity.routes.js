const express = require('express');
const router = express.Router({ mergeParams: true });
const mongoose = require('mongoose');

const activityModel = require('../models/activity.model');
const workspaceModel = require('../models/workspace.model');
const projectModel = require('../models/project.model');
const authMiddleware = require('../middleware/auth.middleware');
const { isWorkspaceMember } = require('../middleware/workspaceAuth');

const isValidObjectId = (id) => mongoose.Types.ObjectId.isValid(id);

/**
 * GET /api/workspaces/:workspaceId/activity
 * Get activity history stream for a workspace
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

        if (!isWorkspaceMember(workspace, userId)) {
            return res.status(403).json({
                message: 'You are not authorized to view activity in this workspace'
            });
        }

        const query = { workspace: workspace._id };

        if (req.query.project && isValidObjectId(req.query.project)) {
            query.project = req.query.project;
        }

        if (req.query.resourceType) {
            query.resourceType = req.query.resourceType;
        }

        if (req.query.action) {
            query.action = req.query.action;
        }

        const page = Math.max(1, parseInt(req.query.page, 10) || 1);
        const limit = Math.min(100, Math.max(1, parseInt(req.query.limit, 10) || 30));
        const skip = (page - 1) * limit;

        const [activities, total] = await Promise.all([
            activityModel.find(query)
                .populate('actor', 'name email avatar')
                .populate('project', 'name key')
                .populate('task', 'title issueKey')
                .sort({ createdAt: -1 })
                .skip(skip)
                .limit(limit),
            activityModel.countDocuments(query)
        ]);

        return res.status(200).json({
            message: 'Activities fetched successfully',
            count: activities.length,
            total,
            page,
            totalPages: Math.ceil(total / limit) || 1,
            activities
        });
    } catch (error) {
        console.error('Error fetching workspace activity:', error);
        return res.status(500).json({
            message: 'Internal server error while fetching activities'
        });
    }
});

module.exports = router;

