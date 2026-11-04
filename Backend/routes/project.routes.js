const express = require('express');
const router = express.Router({ mergeParams: true });
const mongoose = require('mongoose');
const { body, query, param } = require('express-validator');

const projectModel = require('../models/project.model');
const taskModel = require('../models/task.model');
const sprintModel = require('../models/sprint.model');
const commentModel = require('../models/comment.model');
const workspaceModel = require('../models/workspace.model');
const authMiddleware = require('../middleware/auth.middleware');
const analyticsRouter = require('./analytics.routes');
const {
    getWorkspaceRole,
    isWorkspaceMember,
    isWorkspaceWriter,
    isWorkspaceAdminOrOwner,
    handleValidationErrors
} = require('../middleware/workspaceAuth');
const { logActivity } = require('../utils/activityLogger');

// Helper to validate ObjectId
const isValidObjectId = (id) => mongoose.Types.ObjectId.isValid(id);

/**
 * POST /api/projects or POST /api/workspaces/:workspaceId/projects
 * Create a new project within an authorized workspace
 */
router.post(
    '/',
    authMiddleware,
    [
        body('name')
            .trim()
            .isLength({ min: 2, max: 100 })
            .withMessage('Project name must be between 2 and 100 characters'),
        body('key')
            .trim()
            .toUpperCase()
            .isLength({ min: 2, max: 10 })
            .withMessage('Project key must be between 2 and 10 characters')
            .matches(/^[A-Z][A-Z0-9_]{1,9}$/)
            .withMessage('Project key must start with an uppercase letter and contain only uppercase alphanumeric characters'),
        body('description')
            .optional()
            .trim()
            .isLength({ max: 2000 })
            .withMessage('Description cannot exceed 2000 characters'),
        body('status')
            .optional()
            .isIn(['Active', 'Planning', 'On Hold', 'Completed', 'Archived'])
            .withMessage('Invalid project status'),
        body('lead')
            .optional()
            .custom((val) => {
                if (val && !isValidObjectId(val)) {
                    throw new Error('Invalid project lead user ID');
                }
                return true;
            }),
        handleValidationErrors
    ],
    async (req, res) => {
        try {
            const userId = req.userId;
            const workspaceId = req.params.workspaceId || req.body.workspace;

            if (!workspaceId) {
                return res.status(400).json({
                    message: 'Workspace ID is required'
                });
            }

            const isObjectId = isValidObjectId(workspaceId);
            const wsQuery = isObjectId ? { _id: workspaceId } : { slug: workspaceId };
            const workspace = await workspaceModel.findOne(wsQuery);
            if (!workspace) {
                return res.status(404).json({
                    message: 'Workspace not found'
                });
            }

            // Authorization check: User must be a member or owner of the workspace
            if (!isWorkspaceMember(workspace, userId)) {
                return res.status(403).json({
                    message: 'You are not authorized to access this workspace'
                });
            }

            // Viewers have read-only access and cannot create projects
            if (!isWorkspaceWriter(workspace, userId)) {
                return res.status(403).json({
                    message: 'Workspace Viewers have read-only access and cannot create projects'
                });
            }

            const { name, key, description, status, priority, techStack, githubRepo, lead: requestedLead } = req.body;
            const cleanKey = key.trim().toUpperCase();

            // Verify project key uniqueness in workspace
            const existingProject = await projectModel.findOne({
                workspace: workspace._id,
                key: cleanKey
            });

            if (existingProject) {
                return res.status(400).json({
                    message: `A project with key '${cleanKey}' already exists in this workspace`
                });
            }

            // Determine project lead (defaults to creator if not specified)
            const leadId = requestedLead || userId;

            // Verify lead is a member of the workspace
            if (!isWorkspaceMember(workspace, leadId)) {
                return res.status(400).json({
                    message: 'The designated project lead must be a member or owner of this workspace'
                });
            }

            let formattedTechStack = [];
            if (Array.isArray(techStack)) {
                formattedTechStack = techStack.map(t => String(t).trim()).filter(Boolean);
            } else if (typeof techStack === 'string' && techStack.trim()) {
                formattedTechStack = techStack.split(',').map(t => t.trim()).filter(Boolean);
            }

            const project = await projectModel.create({
                name: name.trim(),
                key: cleanKey,
                description: description?.trim() || '',
                workspace: workspace._id,
                lead: leadId,
                status: status || 'Active',
                priority: priority || 'Medium',
                techStack: formattedTechStack,
                githubRepo: githubRepo?.trim() || `devspace/${cleanKey.toLowerCase()}`,
                taskCounter: 0
            });

            const populatedProject = await projectModel.findById(project._id)
                .populate('lead', 'name email')
                .populate('workspace', 'name slug');

            // Log activity
            await logActivity({
                workspaceId: workspace._id,
                projectId: project._id,
                actorId: userId,
                action: 'PROJECT_CREATED',
                resourceType: 'Project',
                details: { name: project.name, key: project.key }
            });

            return res.status(201).json({
                message: 'Project created successfully',
                project: populatedProject
            });
        } catch (error) {
            console.error('Error creating project:', error);
            if (error.code === 11000) {
                return res.status(400).json({
                    message: 'A project with this key already exists in the workspace'
                });
            }
            return res.status(500).json({
                message: 'Internal server error while creating project'
            });
        }
    }
);

/**
 * GET /api/projects or GET /api/workspaces/:workspaceId/projects
 * List projects within an authorized workspace (or user's authorized workspaces)
 */
router.get(
    '/',
    authMiddleware,
    async (req, res) => {
        try {
            const userId = req.userId;
            const targetWorkspaceId = req.params.workspaceId || req.query.workspaceId;

            let query = {};

            if (targetWorkspaceId) {
                const isObjectId = isValidObjectId(targetWorkspaceId);
                const wsQuery = isObjectId ? { _id: targetWorkspaceId } : { slug: targetWorkspaceId };
                const workspace = await workspaceModel.findOne(wsQuery);
                if (!workspace) {
                    return res.status(404).json({
                        message: 'Workspace not found'
                    });
                }

                if (!isWorkspaceMember(workspace, userId)) {
                    return res.status(403).json({
                        message: 'You are not authorized to access projects in this workspace'
                    });
                }

                query.workspace = workspace._id;
            } else {
                // Return projects across all workspaces the user has access to
                const userWorkspaces = await workspaceModel.find({
                    $or: [
                        { owner: userId },
                        { 'members.user': userId }
                    ]
                }).select('_id');

                const workspaceIds = userWorkspaces.map(w => w._id);
                query.workspace = { $in: workspaceIds };
            }

            // Optional filters
            if (req.query.status) {
                query.status = req.query.status;
            }

            if (req.query.search) {
                const searchRegex = new RegExp(req.query.search.trim(), 'i');
                query.$or = [
                    { name: searchRegex },
                    { key: searchRegex },
                    { description: searchRegex }
                ];
            }

            const projects = await projectModel.find(query)
                .populate('lead', 'name email')
                .populate('workspace', 'name slug')
                .sort({ updatedAt: -1 });

            return res.status(200).json({
                message: 'Projects fetched successfully',
                count: projects.length,
                projects
            });
        } catch (error) {
            console.error('Error fetching projects:', error);
            return res.status(500).json({
                message: 'Internal server error while fetching projects'
            });
        }
    }
);

const taskRouter = require('./task.routes');

// Mount nested tasks router on /:projectId/tasks
router.use('/:projectId/tasks', taskRouter);

/**
 * GET /api/projects/key/:key
 * Get project details by key
 */
router.get(
    '/key/:key',
    authMiddleware,
    async (req, res) => {
        try {
            const { key } = req.params;
            const userId = req.userId;

            if (!key) {
                return res.status(400).json({ message: 'Project key is required' });
            }

            // Find workspaces accessible to this user
            const userWorkspaces = await workspaceModel.find({
                $or: [
                    { owner: userId },
                    { 'members.user': userId }
                ]
            }).select('_id');
            const wsIds = userWorkspaces.map(w => w._id);

            const project = await projectModel.findOne({
                key: key.toUpperCase().trim(),
                workspace: { $in: wsIds }
            })
                .populate('lead', 'name email')
                .populate('workspace', 'name slug owner members');

            if (!project) {
                return res.status(404).json({ message: 'Project not found' });
            }

            const totalTasks = await taskModel.countDocuments({ project: project._id });
            const completedTasks = await taskModel.countDocuments({
                project: project._id,
                status: 'Done'
            });

            return res.status(200).json({
                message: 'Project details fetched successfully',
                project,
                stats: {
                    totalTasks,
                    completedTasks,
                    openTasks: totalTasks - completedTasks
                }
            });
        } catch (error) {
            console.error('Error fetching project by key:', error);
            return res.status(500).json({ message: 'Internal server error while fetching project' });
        }
    }
);

/**
 * GET /api/projects/:projectId
 * Get project details
 */
router.get(
    '/:projectId',
    authMiddleware,
    async (req, res) => {
        try {
            const { projectId } = req.params;
            const userId = req.userId;

            if (!isValidObjectId(projectId)) {
                return res.status(400).json({
                    message: 'Invalid project ID format'
                });
            }

            const project = await projectModel.findById(projectId)
                .populate('lead', 'name email')
                .populate('workspace', 'name slug owner members');

            if (!project) {
                return res.status(404).json({
                    message: 'Project not found'
                });
            }

            // Authorization check on workspace membership
            if (!isWorkspaceMember(project.workspace, userId)) {
                return res.status(403).json({
                    message: 'You are not authorized to view this project'
                });
            }

            // Also compute task statistics for the project
            const totalTasks = await taskModel.countDocuments({ project: project._id });
            const completedTasks = await taskModel.countDocuments({
                project: project._id,
                status: 'Done'
            });

            return res.status(200).json({
                message: 'Project details fetched successfully',
                project,
                stats: {
                    totalTasks,
                    completedTasks,
                    openTasks: totalTasks - completedTasks
                }
            });
        } catch (error) {
            console.error('Error fetching project:', error);
            return res.status(500).json({
                message: 'Internal server error while fetching project'
            });
        }
    }
);

/**
 * PUT/PATCH /api/projects/:projectId
 * Update project details
 */
const updateProjectHandler = async (req, res) => {
    try {
        const { projectId } = req.params;
        const userId = req.userId;

        if (!isValidObjectId(projectId)) {
            return res.status(400).json({
                message: 'Invalid project ID format'
            });
        }

        const project = await projectModel.findById(projectId);
        if (!project) {
            return res.status(404).json({
                message: 'Project not found'
            });
        }

        const workspace = await workspaceModel.findById(project.workspace);
        if (!workspace) {
            return res.status(404).json({
                message: 'Associated workspace not found'
            });
        }

        // Authorization check: User must be workspace owner/admin or project lead
        const isLead = project.lead.toString() === userId.toString();
        const isAdminOrOwner = isWorkspaceAdminOrOwner(workspace, userId);

        if (!isLead && !isAdminOrOwner) {
            return res.status(403).json({
                message: 'Only the project lead, workspace owner, or workspace admin can update this project'
            });
        }

        const { name, description, status, lead, key, priority, techStack, githubRepo } = req.body;

        if (name && name.trim()) {
            project.name = name.trim();
        }

        if (description !== undefined) {
            project.description = description.trim();
        }

        if (priority !== undefined) {
            const validPriorities = ['Low', 'Medium', 'High', 'Urgent'];
            if (validPriorities.includes(priority)) {
                project.priority = priority;
            }
        }

        if (githubRepo !== undefined) {
            project.githubRepo = githubRepo.trim();
        }

        if (techStack !== undefined) {
            if (Array.isArray(techStack)) {
                project.techStack = techStack.map(t => String(t).trim()).filter(Boolean);
            } else if (typeof techStack === 'string') {
                project.techStack = techStack.split(',').map(t => t.trim()).filter(Boolean);
            }
        }

        if (status) {
            const validStatuses = ['Active', 'Planning', 'On Hold', 'Completed', 'Archived'];
            if (!validStatuses.includes(status)) {
                return res.status(400).json({
                    message: `Invalid status. Allowed values: ${validStatuses.join(', ')}`
                });
            }
            project.status = status;
        }

        if (lead) {
            if (!isValidObjectId(lead)) {
                return res.status(400).json({
                    message: 'Invalid project lead user ID'
                });
            }
            if (!isWorkspaceMember(workspace, lead)) {
                return res.status(400).json({
                    message: 'Designated project lead must be a member or owner of the workspace'
                });
            }
            project.lead = lead;
        }

        if (key && key.trim().toUpperCase() !== project.key) {
            const cleanKey = key.trim().toUpperCase();
            if (!/^[A-Z][A-Z0-9_]{1,9}$/.test(cleanKey)) {
                return res.status(400).json({
                    message: 'Project key must start with an uppercase letter and contain only uppercase alphanumeric characters (2-10 chars)'
                });
            }

            const collision = await projectModel.findOne({
                workspace: workspace._id,
                key: cleanKey,
                _id: { $ne: project._id }
            });

            if (collision) {
                return res.status(400).json({
                    message: `A project with key '${cleanKey}' already exists in this workspace`
                });
            }

            project.key = cleanKey;
        }

        await project.save();

        // Log activity
        await logActivity({
            workspaceId: workspace._id,
            projectId: project._id,
            actorId: userId,
            action: 'PROJECT_UPDATED',
            resourceType: 'Project',
            details: { name: project.name, key: project.key, status: project.status }
        });

        const updatedProject = await projectModel.findById(project._id)
            .populate('lead', 'name email')
            .populate('workspace', 'name slug');

        return res.status(200).json({
            message: 'Project updated successfully',
            project: updatedProject
        });
    } catch (error) {
        console.error('Error updating project:', error);
        return res.status(500).json({
            message: 'Internal server error while updating project'
        });
    }
};

router.put(
    '/:projectId',
    authMiddleware,
    [
        body('name').optional().trim().isLength({ min: 2, max: 100 }).withMessage('Project name must be between 2 and 100 characters'),
        body('key').optional().trim().toUpperCase(),
        body('description').optional().trim().isLength({ max: 2000 }),
        body('status').optional().isIn(['Active', 'Planning', 'On Hold', 'Completed', 'Archived']).withMessage('Invalid status'),
        handleValidationErrors
    ],
    updateProjectHandler
);

router.patch(
    '/:projectId',
    authMiddleware,
    [
        body('name').optional().trim().isLength({ min: 2, max: 100 }).withMessage('Project name must be between 2 and 100 characters'),
        body('key').optional().trim().toUpperCase(),
        body('description').optional().trim().isLength({ max: 2000 }),
        body('status').optional().isIn(['Active', 'Planning', 'On Hold', 'Completed', 'Archived']).withMessage('Invalid status'),
        handleValidationErrors
    ],
    updateProjectHandler
);

/**
 * DELETE /api/projects/:projectId
 * Delete project with appropriate authorization and safe cascade deletion of associated tasks
 */
router.delete(
    '/:projectId',
    authMiddleware,
    async (req, res) => {
        try {
            const { projectId } = req.params;
            const userId = req.userId;

            if (!isValidObjectId(projectId)) {
                return res.status(400).json({
                    message: 'Invalid project ID format'
                });
            }

            const project = await projectModel.findById(projectId);
            if (!project) {
                return res.status(404).json({
                    message: 'Project not found'
                });
            }

            const workspace = await workspaceModel.findById(project.workspace);
            if (!workspace) {
                return res.status(404).json({
                    message: 'Associated workspace not found'
                });
            }

            // Authorization: Workspace Owner, Workspace Admin, or Project Lead can delete project
            const isLead = project.lead.toString() === userId.toString();
            const isAdminOrOwner = isWorkspaceAdminOrOwner(workspace, userId);

            if (!isLead && !isAdminOrOwner) {
                return res.status(403).json({
                    message: 'Only the project lead, workspace owner, or workspace admin can delete this project'
                });
            }

            // Safely delete all associated comments, tasks, and sprints to prevent orphaned data
            await commentModel.deleteMany({ project: project._id });
            await sprintModel.deleteMany({ project: project._id });
            const taskDeleteResult = await taskModel.deleteMany({ project: project._id });

            // Delete the project document
            await projectModel.findByIdAndDelete(project._id);

            // Log activity
            await logActivity({
                workspaceId: workspace._id,
                projectId: project._id,
                actorId: userId,
                action: 'PROJECT_DELETED',
                resourceType: 'Project',
                details: { name: project.name, key: project.key }
            });

            return res.status(200).json({
                message: 'Project and associated tasks deleted successfully',
                deletedProjectId: project._id,
                deletedTasksCount: taskDeleteResult.deletedCount
            });
        } catch (error) {
            console.error('Error deleting project:', error);
            return res.status(500).json({
                message: 'Internal server error while deleting project'
            });
        }
    }
);

/**
 * Helper to fetch a project with workspace & authorization check
 */
const findProjectWithWorkspace = async (projectIdOrKey, userId) => {
    let query = {};
    if (isValidObjectId(projectIdOrKey)) {
        query._id = projectIdOrKey;
    } else {
        query.key = projectIdOrKey.toUpperCase().trim();
    }

    const project = await projectModel.findOne(query);
    if (!project) return { errorStatus: 404, message: 'Project not found' };

    const workspace = await workspaceModel.findById(project.workspace);
    if (!workspace || !isWorkspaceMember(workspace, userId)) {
        return { errorStatus: 403, message: 'You are not authorized to access this project' };
    }

    return { project, workspace };
};

/**
 * POST /api/projects/:projectId/sprints
 * Create a new planned sprint in this project
 */
router.post(
    '/:projectId/sprints',
    authMiddleware,
    [
        body('name').optional().trim().isLength({ max: 100 }).withMessage('Sprint name cannot exceed 100 characters'),
        body('goal').optional().trim().isLength({ max: 2000 }).withMessage('Goal cannot exceed 2000 characters'),
        handleValidationErrors
    ],
    async (req, res) => {
        try {
            const { projectId } = req.params;
            const userId = req.userId;

            const { project, workspace, errorStatus, message } = await findProjectWithWorkspace(projectId, userId);
            if (errorStatus) return res.status(errorStatus).json({ message });

            if (!isWorkspaceWriter(workspace, userId)) {
                return res.status(403).json({ message: 'Workspace Viewers cannot create sprints' });
            }

            const totalExistingSprints = await sprintModel.countDocuments({ project: project._id });
            const sprintNumber = totalExistingSprints + 1;
            const sprintName = req.body.name?.trim() || `Sprint ${sprintNumber}`;

            const { goal = '', startDate = null, endDate = null } = req.body;

            if (startDate && endDate && new Date(endDate) <= new Date(startDate)) {
                return res.status(400).json({ message: 'Sprint end date must be after start date' });
            }

            const sprint = await sprintModel.create({
                name: sprintName,
                goal: goal.trim(),
                project: project._id,
                workspace: workspace._id,
                startDate: startDate ? new Date(startDate) : null,
                endDate: endDate ? new Date(endDate) : null,
                status: 'Planned',
                order: sprintNumber,
                sprintNumber,
                createdBy: userId
            });

            await logActivity({
                workspaceId: workspace._id,
                projectId: project._id,
                actorId: userId,
                action: 'SPRINT_CREATED',
                resourceType: 'Sprint',
                details: { name: sprint.name, sprintNumber }
            });

            return res.status(201).json({
                message: `Sprint "${sprint.name}" created successfully`,
                sprint
            });
        } catch (error) {
            console.error('Error creating sprint in project:', error);
            return res.status(500).json({ message: 'Internal server error while creating sprint' });
        }
    }
);

/**
 * GET /api/projects/:projectId/sprints
 * List sprints in this project with computed issue counts & story points
 */
router.get(
    '/:projectId/sprints',
    authMiddleware,
    async (req, res) => {
        try {
            const { projectId } = req.params;
            const userId = req.userId;

            const { project, workspace, errorStatus, message } = await findProjectWithWorkspace(projectId, userId);
            if (errorStatus) return res.status(errorStatus).json({ message });

            const query = { project: project._id };
            if (req.query.status) {
                const statuses = req.query.status.split(',').map(s => s.trim());
                query.status = statuses.length > 1 ? { $in: statuses } : statuses[0];
            }

            const sprints = await sprintModel.find(query).sort({ order: 1, createdAt: 1 });

            // Compute metrics for each sprint
            const sprintsWithMetrics = await Promise.all(
                sprints.map(async (s) => {
                    const tasks = await taskModel.find({ sprint: s._id });

                    let totalStoryPoints = 0;
                    let completedStoryPoints = 0;
                    let completedIssues = 0;

                    tasks.forEach((t) => {
                        const pts = typeof t.storyPoints === 'number' && !isNaN(t.storyPoints) ? t.storyPoints : 0;
                        totalStoryPoints += pts;
                        if (t.status === 'Done') {
                            completedIssues += 1;
                            completedStoryPoints += pts;
                        }
                    });

                    const totalIssues = tasks.length;
                    const remainingIssues = totalIssues - completedIssues;
                    const remainingStoryPoints = totalStoryPoints - completedStoryPoints;
                    const completionPercentage = totalIssues > 0 ? Math.round((completedIssues / totalIssues) * 100) : 0;

                    return {
                        _id: s._id,
                        id: s._id,
                        name: s.name,
                        goal: s.goal,
                        status: s.status,
                        startDate: s.startDate,
                        endDate: s.endDate,
                        startedAt: s.startedAt,
                        completedAt: s.completedAt,
                        order: s.order,
                        sprintNumber: s.sprintNumber,
                        initialCommitment: s.initialCommitment || { issueCount: 0, storyPoints: 0 },
                        totalIssues,
                        completedIssues,
                        remainingIssues,
                        totalStoryPoints,
                        completedStoryPoints,
                        remainingStoryPoints,
                        completionPercentage,
                        createdAt: s.createdAt,
                        updatedAt: s.updatedAt
                    };
                })
            );

            return res.status(200).json({
                message: 'Project sprints fetched successfully',
                count: sprintsWithMetrics.length,
                sprints: sprintsWithMetrics
            });
        } catch (error) {
            console.error('Error fetching project sprints:', error);
            return res.status(500).json({ message: 'Internal server error while fetching project sprints' });
        }
    }
);

/**
 * GET /api/projects/:projectId/backlog
 * List backlog issues (tasks where sprint is null)
 */
router.get(
    '/:projectId/backlog',
    authMiddleware,
    async (req, res) => {
        try {
            const { projectId } = req.params;
            const userId = req.userId;

            const { project, workspace, errorStatus, message } = await findProjectWithWorkspace(projectId, userId);
            if (errorStatus) return res.status(errorStatus).json({ message });

            const backlogTasks = await taskModel.find({
                project: project._id,
                sprint: null
            })
                .populate('assignee', 'name email avatar')
                .populate('reporter', 'name email avatar')
                .populate('project', 'name key')
                .sort({ backlogOrder: 1, createdAt: -1 });

            let totalStoryPoints = 0;
            backlogTasks.forEach((t) => {
                if (typeof t.storyPoints === 'number' && !isNaN(t.storyPoints)) {
                    totalStoryPoints += t.storyPoints;
                }
            });

            return res.status(200).json({
                message: 'Backlog tasks fetched successfully',
                totalIssues: backlogTasks.length,
                totalStoryPoints,
                tasks: backlogTasks
            });
        } catch (error) {
            console.error('Error fetching project backlog:', error);
            return res.status(500).json({ message: 'Internal server error while fetching project backlog' });
        }
    }
);

/**
 * PATCH /api/projects/:projectId/backlog/reorder
 * Reorder backlog issues and persist ordering
 */
router.patch(
    '/:projectId/backlog/reorder',
    authMiddleware,
    [
        body('taskIds').isArray().withMessage('taskIds must be an array of task IDs'),
        handleValidationErrors
    ],
    async (req, res) => {
        try {
            const { projectId } = req.params;
            const userId = req.userId;

            const { project, workspace, errorStatus, message } = await findProjectWithWorkspace(projectId, userId);
            if (errorStatus) return res.status(errorStatus).json({ message });

            if (!isWorkspaceWriter(workspace, userId)) {
                return res.status(403).json({ message: 'Workspace Viewers cannot reorder backlog' });
            }

            const { taskIds } = req.body;
            const validTaskIds = taskIds.filter(isValidObjectId);

            const bulkOps = validTaskIds.map((taskId, index) => ({
                updateOne: {
                    filter: { _id: taskId, project: project._id },
                    update: { $set: { backlogOrder: index } }
                }
            }));

            if (bulkOps.length > 0) {
                await taskModel.bulkWrite(bulkOps);
            }

            return res.status(200).json({
                message: 'Backlog ordering updated successfully',
                updatedCount: bulkOps.length
            });
        } catch (error) {
            console.error('Error reordering backlog:', error);
            return res.status(500).json({ message: 'Internal server error while reordering backlog' });
        }
    }
);

// Project Analytics & Export delegates
router.get('/:projectId/analytics', (req, res, next) => {
    const qs = req.url.includes('?') ? req.url.slice(req.url.indexOf('?')) : '';
    req.url = `/projects/${req.params.projectId}${qs}`;
    analyticsRouter(req, res, next);
});

router.get('/:projectId/export', (req, res, next) => {
    const qs = req.url.includes('?') ? req.url.slice(req.url.indexOf('?')) : '';
    req.url = `/projects/${req.params.projectId}/export${qs}`;
    analyticsRouter(req, res, next);
});

module.exports = router;
