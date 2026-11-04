const express = require('express');
const router = express.Router();
const mongoose = require('mongoose');
const { body, param, query } = require('express-validator');

const savedViewModel = require('../models/savedView.model');
const workspaceModel = require('../models/workspace.model');
const projectModel = require('../models/project.model');
const authMiddleware = require('../middleware/auth.middleware');
const {
    isWorkspaceMember,
    isWorkspaceWriter,
    isWorkspaceAdminOrOwner,
    handleValidationErrors
} = require('../middleware/workspaceAuth');

const isValidObjectId = (id) => mongoose.Types.ObjectId.isValid(id);

/**
 * GET /api/views
 * List saved views accessible to the user in a workspace
 * (User's private views + shared views in the workspace)
 */
router.get(
    '/',
    authMiddleware,
    async (req, res) => {
        try {
            const userId = req.userId;
            const { workspaceId, projectId } = req.query;

            if (!workspaceId) {
                return res.status(400).json({
                    message: 'Workspace ID is required to list saved views'
                });
            }

            if (!isValidObjectId(workspaceId)) {
                return res.status(400).json({
                    message: 'Invalid workspace ID format'
                });
            }

            const workspace = await workspaceModel.findById(workspaceId);
            if (!workspace || !isWorkspaceMember(workspace, userId)) {
                return res.status(403).json({
                    message: 'You are not authorized to access views for this workspace'
                });
            }

            const queryFilters = {
                workspace: workspace._id,
                $or: [
                    { createdBy: userId },
                    { visibility: 'Shared' }
                ]
            };

            if (projectId && isValidObjectId(projectId)) {
                queryFilters.$and = [
                    {
                        $or: [
                            { project: projectId },
                            { project: null }
                        ]
                    }
                ];
            }

            const views = await savedViewModel.find(queryFilters)
                .populate('createdBy', 'name email avatar')
                .populate('project', 'name key')
                .sort({ createdAt: -1 });

            return res.status(200).json({
                message: 'Saved views retrieved successfully',
                views
            });
        } catch (error) {
            console.error('Error fetching saved views:', error);
            return res.status(500).json({
                message: 'Internal server error while fetching saved views'
            });
        }
    }
);

/**
 * POST /api/views
 * Create a new saved view
 */
router.post(
    '/',
    authMiddleware,
    [
        body('name')
            .trim()
            .isLength({ min: 1, max: 100 })
            .withMessage('View name is required and cannot exceed 100 characters'),
        body('workspaceId')
            .custom((v) => isValidObjectId(v))
            .withMessage('A valid workspaceId is required'),
        body('visibility')
            .optional()
            .isIn(['Private', 'Shared'])
            .withMessage('Visibility must be either Private or Shared'),
        handleValidationErrors
    ],
    async (req, res) => {
        try {
            const userId = req.userId;
            const {
                name,
                description,
                workspaceId,
                projectId,
                filters,
                sort,
                visibility = 'Private'
            } = req.body;

            const workspace = await workspaceModel.findById(workspaceId);
            if (!workspace || !isWorkspaceMember(workspace, userId)) {
                return res.status(403).json({
                    message: 'You are not authorized to create views in this workspace'
                });
            }

            // Viewers cannot create Shared views; only private views
            if (visibility === 'Shared' && !isWorkspaceWriter(workspace, userId)) {
                return res.status(403).json({
                    message: 'Viewers cannot create shared views. Only members, admins, or owners can share views.'
                });
            }

            let validProject = null;
            if (projectId && isValidObjectId(projectId)) {
                const project = await projectModel.findOne({ _id: projectId, workspace: workspace._id });
                if (project) {
                    validProject = project._id;
                }
            }

            const newView = await savedViewModel.create({
                name: name.trim(),
                description: description?.trim() || '',
                workspace: workspace._id,
                project: validProject,
                filters: filters || {},
                sort: {
                    field: sort?.field || 'createdAt',
                    order: (sort?.order === 'asc' ? 'asc' : 'desc')
                },
                visibility,
                createdBy: userId
            });

            const populatedView = await savedViewModel.findById(newView._id)
                .populate('createdBy', 'name email avatar')
                .populate('project', 'name key');

            return res.status(201).json({
                message: 'Saved view created successfully',
                view: populatedView
            });
        } catch (error) {
            console.error('Error creating saved view:', error);
            return res.status(500).json({
                message: 'Internal server error while creating saved view'
            });
        }
    }
);

/**
 * GET /api/views/:viewId
 * Retrieve a specific saved view
 */
router.get(
    '/:viewId',
    authMiddleware,
    async (req, res) => {
        try {
            const { viewId } = req.params;
            const userId = req.userId;

            if (!isValidObjectId(viewId)) {
                return res.status(400).json({ message: 'Invalid view ID format' });
            }

            const view = await savedViewModel.findById(viewId)
                .populate('createdBy', 'name email avatar')
                .populate('project', 'name key');

            if (!view) {
                return res.status(404).json({ message: 'Saved view not found' });
            }

            const workspace = await workspaceModel.findById(view.workspace);
            if (!workspace || !isWorkspaceMember(workspace, userId)) {
                return res.status(403).json({ message: 'You lack permission to view this resource' });
            }

            if (view.visibility === 'Private' && view.createdBy._id.toString() !== userId.toString()) {
                return res.status(403).json({ message: 'This saved view is private' });
            }

            return res.status(200).json({
                message: 'Saved view retrieved successfully',
                view
            });
        } catch (error) {
            console.error('Error retrieving saved view:', error);
            return res.status(500).json({ message: 'Internal server error' });
        }
    }
);

/**
 * PUT/PATCH /api/views/:viewId
 * Update an existing saved view
 */
router.patch(
    '/:viewId',
    authMiddleware,
    [
        body('name')
            .optional()
            .trim()
            .isLength({ min: 1, max: 100 })
            .withMessage('View name cannot exceed 100 characters'),
        body('visibility')
            .optional()
            .isIn(['Private', 'Shared'])
            .withMessage('Visibility must be either Private or Shared'),
        handleValidationErrors
    ],
    async (req, res) => {
        try {
            const { viewId } = req.params;
            const userId = req.userId;

            if (!isValidObjectId(viewId)) {
                return res.status(400).json({ message: 'Invalid view ID format' });
            }

            const view = await savedViewModel.findById(viewId);
            if (!view) {
                return res.status(404).json({ message: 'Saved view not found' });
            }

            const workspace = await workspaceModel.findById(view.workspace);
            if (!workspace || !isWorkspaceMember(workspace, userId)) {
                return res.status(403).json({ message: 'Access denied' });
            }

            // Only creator or workspace Admin/Owner can update
            const isCreator = view.createdBy.toString() === userId.toString();
            const isAdmin = isWorkspaceAdminOrOwner(workspace, userId);

            if (!isCreator && !isAdmin) {
                return res.status(403).json({
                    message: 'Only the creator or workspace administrator can update this saved view'
                });
            }

            const { name, description, filters, sort, visibility, projectId } = req.body;

            if (name !== undefined) view.name = name.trim();
            if (description !== undefined) view.description = description.trim();
            if (filters !== undefined) view.filters = filters;
            if (sort !== undefined) {
                view.sort = {
                    field: sort.field || view.sort?.field || 'createdAt',
                    order: sort.order === 'asc' ? 'asc' : 'desc'
                };
            }

            if (visibility !== undefined) {
                if (visibility === 'Shared' && !isWorkspaceWriter(workspace, userId)) {
                    return res.status(403).json({
                        message: 'Viewers cannot make views shared'
                    });
                }
                view.visibility = visibility;
            }

            if (projectId !== undefined) {
                if (projectId === null || projectId === '') {
                    view.project = null;
                } else if (isValidObjectId(projectId)) {
                    view.project = projectId;
                }
            }

            await view.save();

            const populated = await savedViewModel.findById(view._id)
                .populate('createdBy', 'name email avatar')
                .populate('project', 'name key');

            return res.status(200).json({
                message: 'Saved view updated successfully',
                view: populated
            });
        } catch (error) {
            console.error('Error updating saved view:', error);
            return res.status(500).json({ message: 'Internal server error' });
        }
    }
);

// Support both PUT and PATCH
router.put('/:viewId', (req, res, next) => router.handle(req, res, next));

/**
 * DELETE /api/views/:viewId
 * Delete a saved view
 */
router.delete(
    '/:viewId',
    authMiddleware,
    async (req, res) => {
        try {
            const { viewId } = req.params;
            const userId = req.userId;

            if (!isValidObjectId(viewId)) {
                return res.status(400).json({ message: 'Invalid view ID format' });
            }

            const view = await savedViewModel.findById(viewId);
            if (!view) {
                return res.status(404).json({ message: 'Saved view not found' });
            }

            const workspace = await workspaceModel.findById(view.workspace);
            if (!workspace || !isWorkspaceMember(workspace, userId)) {
                return res.status(403).json({ message: 'Access denied' });
            }

            // Only creator or workspace Admin/Owner can delete
            const isCreator = view.createdBy.toString() === userId.toString();
            const isAdmin = isWorkspaceAdminOrOwner(workspace, userId);

            if (!isCreator && !isAdmin) {
                return res.status(403).json({
                    message: 'Only the creator or workspace administrator can delete this saved view'
                });
            }

            await savedViewModel.findByIdAndDelete(view._id);

            return res.status(200).json({
                message: 'Saved view deleted successfully'
            });
        } catch (error) {
            console.error('Error deleting saved view:', error);
            return res.status(500).json({ message: 'Internal server error' });
        }
    }
);

/**
 * POST /api/views/:viewId/duplicate
 * Duplicate a saved view for the current user
 */
router.post(
    '/:viewId/duplicate',
    authMiddleware,
    async (req, res) => {
        try {
            const { viewId } = req.params;
            const userId = req.userId;

            if (!isValidObjectId(viewId)) {
                return res.status(400).json({ message: 'Invalid view ID format' });
            }

            const view = await savedViewModel.findById(viewId);
            if (!view) {
                return res.status(404).json({ message: 'Saved view not found' });
            }

            const workspace = await workspaceModel.findById(view.workspace);
            if (!workspace || !isWorkspaceMember(workspace, userId)) {
                return res.status(403).json({ message: 'Access denied' });
            }

            if (view.visibility === 'Private' && view.createdBy.toString() !== userId.toString()) {
                return res.status(403).json({ message: 'Cannot duplicate another user\'s private view' });
            }

            const duplicateName = req.body.name?.trim() || `${view.name} (Copy)`;

            const duplicateView = await savedViewModel.create({
                name: duplicateName,
                description: view.description,
                workspace: view.workspace,
                project: view.project,
                filters: view.filters,
                sort: view.sort,
                visibility: 'Private',
                createdBy: userId
            });

            const populated = await savedViewModel.findById(duplicateView._id)
                .populate('createdBy', 'name email avatar')
                .populate('project', 'name key');

            return res.status(201).json({
                message: 'Saved view duplicated successfully',
                view: populated
            });
        } catch (error) {
            console.error('Error duplicating saved view:', error);
            return res.status(500).json({ message: 'Internal server error' });
        }
    }
);

module.exports = router;

