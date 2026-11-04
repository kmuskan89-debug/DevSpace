const express = require('express');
const router = express.Router();
const mongoose = require('mongoose');
const { body, param } = require('express-validator');

const sprintModel = require('../models/sprint.model');
const taskModel = require('../models/task.model');
const projectModel = require('../models/project.model');
const workspaceModel = require('../models/workspace.model');
const authMiddleware = require('../middleware/auth.middleware');
const analyticsRouter = require('./analytics.routes');
const {
    isWorkspaceMember,
    isWorkspaceWriter,
    isWorkspaceAdminOrOwner,
    handleValidationErrors
} = require('../middleware/workspaceAuth');
const { logActivity } = require('../utils/activityLogger');
const { createNotification } = require('../utils/notificationService');

const isValidObjectId = (id) => mongoose.Types.ObjectId.isValid(id);

/**
 * Helper to fetch a sprint by ID with project and workspace populated
 */
const findSprintWithAuth = async (sprintId, userId) => {
    if (!isValidObjectId(sprintId)) return { errorStatus: 400, message: 'Invalid sprint ID' };

    const sprint = await sprintModel.findById(sprintId)
        .populate('project', 'name key lead workspace')
        .populate('workspace');

    if (!sprint) {
        return { errorStatus: 404, message: 'Sprint not found' };
    }

    const workspace = sprint.workspace;
    if (!workspace || !isWorkspaceMember(workspace, userId)) {
        return { errorStatus: 403, message: 'You are not authorized to access this sprint' };
    }

    return { sprint, workspace };
};

/**
 * Compute progress metrics for a given sprint
 */
const computeSprintMetrics = async (sprintId) => {
    const tasks = await taskModel.find({ sprint: sprintId });

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
    const issueCompletionPercentage = totalIssues > 0 ? Math.round((completedIssues / totalIssues) * 100) : 0;
    const pointsCompletionPercentage = totalStoryPoints > 0 ? Math.round((completedStoryPoints / totalStoryPoints) * 100) : 0;

    return {
        totalIssues,
        completedIssues,
        remainingIssues,
        totalStoryPoints,
        completedStoryPoints,
        remainingStoryPoints,
        issueCompletionPercentage,
        pointsCompletionPercentage,
        tasks
    };
};

/**
 * GET /api/sprints/:sprintId
 * Get sprint details with populated tasks and metrics
 */
router.get('/:sprintId', authMiddleware, async (req, res) => {
    try {
        const { sprint, workspace, errorStatus, message } = await findSprintWithAuth(req.params.sprintId, req.userId);
        if (errorStatus) return res.status(errorStatus).json({ message });

        const metrics = await computeSprintMetrics(sprint._id);

        const populatedTasks = await taskModel.find({ sprint: sprint._id })
            .populate('assignee', 'name email avatar')
            .populate('reporter', 'name email avatar')
            .populate('project', 'name key')
            .sort({ order: 1, createdAt: -1 });

        return res.status(200).json({
            message: 'Sprint details fetched successfully',
            sprint,
            metrics: {
                totalIssues: metrics.totalIssues,
                completedIssues: metrics.completedIssues,
                remainingIssues: metrics.remainingIssues,
                totalStoryPoints: metrics.totalStoryPoints,
                completedStoryPoints: metrics.completedStoryPoints,
                remainingStoryPoints: metrics.remainingStoryPoints,
                issueCompletionPercentage: metrics.issueCompletionPercentage,
                pointsCompletionPercentage: metrics.pointsCompletionPercentage,
                initialCommitment: sprint.initialCommitment || { issueCount: 0, storyPoints: 0 }
            },
            tasks: populatedTasks
        });
    } catch (error) {
        console.error('Error fetching sprint details:', error);
        return res.status(500).json({ message: 'Internal server error while fetching sprint details' });
    }
});

/**
 * GET /api/sprints/:sprintId/metrics
 * Dedicated sprint reporting metrics endpoint
 */
router.get('/:sprintId/metrics', authMiddleware, async (req, res) => {
    try {
        const { sprint, errorStatus, message } = await findSprintWithAuth(req.params.sprintId, req.userId);
        if (errorStatus) return res.status(errorStatus).json({ message });

        const metrics = await computeSprintMetrics(sprint._id);

        return res.status(200).json({
            message: 'Sprint reporting metrics fetched successfully',
            sprint: {
                _id: sprint._id,
                name: sprint.name,
                goal: sprint.goal,
                status: sprint.status,
                startDate: sprint.startDate,
                endDate: sprint.endDate,
                startedAt: sprint.startedAt,
                completedAt: sprint.completedAt,
                initialCommitment: sprint.initialCommitment || { issueCount: 0, storyPoints: 0 }
            },
            metrics: {
                initialCommitment: sprint.initialCommitment || { issueCount: 0, storyPoints: 0 },
                currentTotal: {
                    issueCount: metrics.totalIssues,
                    storyPoints: metrics.totalStoryPoints
                },
                completed: {
                    issueCount: metrics.completedIssues,
                    storyPoints: metrics.completedStoryPoints
                },
                remaining: {
                    issueCount: metrics.remainingIssues,
                    storyPoints: metrics.remainingStoryPoints
                },
                completionPercentage: {
                    issues: metrics.issueCompletionPercentage,
                    storyPoints: metrics.pointsCompletionPercentage
                }
            }
        });
    } catch (error) {
        console.error('Error fetching sprint metrics:', error);
        return res.status(500).json({ message: 'Internal server error while fetching sprint metrics' });
    }
});

/**
 * PATCH /api/sprints/:sprintId
 * Update sprint name, goal, dates
 */
router.patch(
    '/:sprintId',
    authMiddleware,
    [
        body('name').optional().trim().isLength({ min: 1, max: 100 }).withMessage('Sprint name must be between 1 and 100 characters'),
        body('goal').optional().trim().isLength({ max: 2000 }).withMessage('Goal cannot exceed 2000 characters'),
        handleValidationErrors
    ],
    async (req, res) => {
        try {
            const { sprint, workspace, errorStatus, message } = await findSprintWithAuth(req.params.sprintId, req.userId);
            if (errorStatus) return res.status(errorStatus).json({ message });

            if (!isWorkspaceWriter(workspace, req.userId)) {
                return res.status(403).json({ message: 'Workspace Viewers cannot modify sprints' });
            }

            const { name, goal, startDate, endDate } = req.body;

            if (name !== undefined) {
                if (!name.trim()) return res.status(400).json({ message: 'Sprint name cannot be empty' });
                sprint.name = name.trim();
            }

            if (goal !== undefined) {
                sprint.goal = goal.trim();
            }

            if (startDate !== undefined) {
                sprint.startDate = startDate ? new Date(startDate) : null;
            }

            if (endDate !== undefined) {
                sprint.endDate = endDate ? new Date(endDate) : null;
            }

            // Enforce valid date ordering
            if (sprint.startDate && sprint.endDate && new Date(sprint.endDate) < new Date(sprint.startDate)) {
                return res.status(400).json({ message: 'Sprint end date must be on or after the start date' });
            }

            await sprint.save();

            await logActivity({
                workspaceId: workspace._id,
                projectId: sprint.project._id,
                actorId: req.userId,
                action: 'SPRINT_UPDATED',
                resourceType: 'Sprint',
                details: { name: sprint.name, status: sprint.status }
            });

            return res.status(200).json({
                message: 'Sprint updated successfully',
                sprint
            });
        } catch (error) {
            console.error('Error updating sprint:', error);
            return res.status(500).json({ message: 'Internal server error while updating sprint' });
        }
    }
);

/**
 * DELETE /api/sprints/:sprintId
 * Delete a sprint. All associated issues return safely to the backlog.
 */
router.delete('/:sprintId', authMiddleware, async (req, res) => {
    try {
        const { sprint, workspace, errorStatus, message } = await findSprintWithAuth(req.params.sprintId, req.userId);
        if (errorStatus) return res.status(errorStatus).json({ message });

        if (!isWorkspaceWriter(workspace, req.userId)) {
            return res.status(403).json({ message: 'Workspace Viewers cannot delete sprints' });
        }

        // Return all issues in this sprint to the backlog so no work is lost
        const taskUpdateResult = await taskModel.updateMany(
            { sprint: sprint._id },
            { $set: { sprint: null } }
        );

        await sprintModel.findByIdAndDelete(sprint._id);

        await logActivity({
            workspaceId: workspace._id,
            projectId: sprint.project._id,
            actorId: req.userId,
            action: 'SPRINT_DELETED',
            resourceType: 'Sprint',
            details: { name: sprint.name, unassignedTasksCount: taskUpdateResult.modifiedCount }
        });

        return res.status(200).json({
            message: 'Sprint deleted successfully. Associated tasks returned to backlog.',
            deletedSprintId: sprint._id,
            returnedToBacklogCount: taskUpdateResult.modifiedCount
        });
    } catch (error) {
        console.error('Error deleting sprint:', error);
        return res.status(500).json({ message: 'Internal server error while deleting sprint' });
    }
});

/**
 * POST /api/sprints/:sprintId/issues
 * Add one or more issues to this sprint
 */
router.post(
    '/:sprintId/issues',
    authMiddleware,
    [
        body('taskIds').isArray({ min: 1 }).withMessage('taskIds must be a non-empty array of task IDs'),
        handleValidationErrors
    ],
    async (req, res) => {
        try {
            const { sprint, workspace, errorStatus, message } = await findSprintWithAuth(req.params.sprintId, req.userId);
            if (errorStatus) return res.status(errorStatus).json({ message });

            if (!isWorkspaceWriter(workspace, req.userId)) {
                return res.status(403).json({ message: 'Workspace Viewers cannot add issues to sprints' });
            }

            if (sprint.status === 'Completed') {
                return res.status(400).json({ message: 'Cannot add issues to an already completed sprint' });
            }

            const { taskIds } = req.body;
            const validTaskIds = taskIds.filter(isValidObjectId);

            if (validTaskIds.length === 0) {
                return res.status(400).json({ message: 'No valid task IDs provided' });
            }

            // Update tasks belonging to this project to point to this sprint
            const updateResult = await taskModel.updateMany(
                {
                    _id: { $in: validTaskIds },
                    project: sprint.project._id
                },
                {
                    $set: { sprint: sprint._id }
                }
            );

            await logActivity({
                workspaceId: workspace._id,
                projectId: sprint.project._id,
                actorId: req.userId,
                action: 'SPRINT_ISSUES_ADDED',
                resourceType: 'Sprint',
                details: { sprintName: sprint.name, count: updateResult.modifiedCount }
            });

            return res.status(200).json({
                message: `Successfully added ${updateResult.modifiedCount} issue(s) to sprint`,
                modifiedCount: updateResult.modifiedCount,
                sprintId: sprint._id
            });
        } catch (error) {
            console.error('Error adding issues to sprint:', error);
            return res.status(500).json({ message: 'Internal server error while adding issues to sprint' });
        }
    }
);

/**
 * DELETE /api/sprints/:sprintId/issues/:taskId
 * Remove an issue from this sprint (moves back to backlog)
 */
router.delete('/:sprintId/issues/:taskId', authMiddleware, async (req, res) => {
    try {
        const { sprint, workspace, errorStatus, message } = await findSprintWithAuth(req.params.sprintId, req.userId);
        if (errorStatus) return res.status(errorStatus).json({ message });

        if (!isWorkspaceWriter(workspace, req.userId)) {
            return res.status(403).json({ message: 'Workspace Viewers cannot remove issues from sprints' });
        }

        const { taskId } = req.params;
        const taskQuery = isValidObjectId(taskId) ? { _id: taskId } : { issueKey: taskId.toUpperCase() };

        const task = await taskModel.findOne({
            ...taskQuery,
            sprint: sprint._id
        });

        if (!task) {
            return res.status(404).json({ message: 'Task not found in this sprint' });
        }

        task.sprint = null;
        await task.save();

        await logActivity({
            workspaceId: workspace._id,
            projectId: sprint.project._id,
            actorId: req.userId,
            action: 'SPRINT_ISSUE_REMOVED',
            resourceType: 'Sprint',
            details: { sprintName: sprint.name, issueKey: task.issueKey, title: task.title }
        });

        return res.status(200).json({
            message: `Task ${task.issueKey || task._id} removed from sprint and returned to backlog`,
            taskId: task._id
        });
    } catch (error) {
        console.error('Error removing issue from sprint:', error);
        return res.status(500).json({ message: 'Internal server error while removing issue from sprint' });
    }
});

/**
 * POST /api/sprints/:sprintId/start
 * Start a planned sprint. Enforces:
 * 1. Sprint must be in Planned status.
 * 2. Only ONE active sprint allowed per project.
 * 3. Captures initial commitment snapshot (issue count and story points).
 */
router.post(
    '/:sprintId/start',
    authMiddleware,
    async (req, res) => {
        try {
            const { sprint, workspace, errorStatus, message } = await findSprintWithAuth(req.params.sprintId, req.userId);
            if (errorStatus) return res.status(errorStatus).json({ message });

            if (!isWorkspaceWriter(workspace, req.userId)) {
                return res.status(403).json({ message: 'Workspace Viewers cannot start sprints' });
            }

            if (sprint.status === 'Active') {
                return res.status(400).json({ message: 'Sprint is already active' });
            }

            if (sprint.status === 'Completed') {
                return res.status(400).json({ message: 'Cannot start a sprint that has already been completed' });
            }

            // Enforce: Project must NOT have multiple active sprints
            const activeSprint = await sprintModel.findOne({
                project: sprint.project._id,
                status: 'Active',
                _id: { $ne: sprint._id }
            });

            if (activeSprint) {
                return res.status(400).json({
                    message: `Another sprint ("${activeSprint.name}") is currently active for this project. Please complete it before starting a new sprint.`
                });
            }

            const { startDate, endDate, goal } = req.body;

            const now = new Date();
            sprint.startDate = startDate ? new Date(startDate) : (sprint.startDate || now);
            sprint.endDate = endDate ? new Date(endDate) : (sprint.endDate || new Date(now.getTime() + 14 * 24 * 60 * 60 * 1000));

            if (sprint.endDate <= sprint.startDate) {
                return res.status(400).json({ message: 'Sprint end date must be after start date' });
            }

            if (goal !== undefined) {
                sprint.goal = goal.trim();
            }

            // Capture initial commitment snapshot at sprint start
            const sprintTasks = await taskModel.find({ sprint: sprint._id });
            const initialStoryPoints = sprintTasks.reduce((sum, t) => {
                const pts = typeof t.storyPoints === 'number' && !isNaN(t.storyPoints) ? t.storyPoints : 0;
                return sum + pts;
            }, 0);

            sprint.initialCommitment = {
                issueCount: sprintTasks.length,
                storyPoints: initialStoryPoints
            };

            sprint.status = 'Active';
            sprint.startedAt = now;
            await sprint.save();

            await logActivity({
                workspaceId: workspace._id,
                projectId: sprint.project._id,
                actorId: req.userId,
                action: 'SPRINT_STARTED',
                resourceType: 'Sprint',
                details: {
                    name: sprint.name,
                    committedIssues: sprint.initialCommitment.issueCount,
                    committedStoryPoints: sprint.initialCommitment.storyPoints,
                    startDate: sprint.startDate,
                    endDate: sprint.endDate
                }
            });

            return res.status(200).json({
                message: `Sprint "${sprint.name}" is now active!`,
                sprint,
                initialCommitment: sprint.initialCommitment
            });
        } catch (error) {
            console.error('Error starting sprint:', error);
            return res.status(500).json({ message: 'Internal server error while starting sprint' });
        }
    }
);

/**
 * POST /api/sprints/:sprintId/complete
 * Complete an active sprint. Handles unfinished issues:
 * User selects whether unfinished issues return to the backlog or move into another planned sprint.
 */
router.post(
    '/:sprintId/complete',
    authMiddleware,
    async (req, res) => {
        try {
            const { sprint, workspace, errorStatus, message } = await findSprintWithAuth(req.params.sprintId, req.userId);
            if (errorStatus) return res.status(errorStatus).json({ message });

            if (!isWorkspaceWriter(workspace, req.userId)) {
                return res.status(403).json({ message: 'Workspace Viewers cannot complete sprints' });
            }

            if (sprint.status !== 'Active') {
                return res.status(400).json({
                    message: `Cannot complete sprint because it is currently "${sprint.status}". Only Active sprints can be completed.`
                });
            }

            const { moveTo = 'backlog', targetSprintId } = req.body;

            // Find all tasks in this sprint
            const allSprintTasks = await taskModel.find({ sprint: sprint._id });
            const incompleteTasks = allSprintTasks.filter((t) => t.status !== 'Done');
            const completedTasks = allSprintTasks.filter((t) => t.status === 'Done');

            let moveDestination = 'backlog';
            let targetSprint = null;

            if (incompleteTasks.length > 0) {
                if (moveTo === 'sprint' && targetSprintId) {
                    if (!isValidObjectId(targetSprintId)) {
                        return res.status(400).json({ message: 'Invalid target sprint ID format' });
                    }

                    targetSprint = await sprintModel.findOne({
                        _id: targetSprintId,
                        project: sprint.project._id,
                        status: 'Planned'
                    });

                    if (!targetSprint) {
                        return res.status(400).json({
                            message: 'Target sprint not found or is not an eligible planned sprint in this project'
                        });
                    }

                    // Move unfinished issues to target planned sprint
                    await taskModel.updateMany(
                        {
                            sprint: sprint._id,
                            status: { $ne: 'Done' }
                        },
                        {
                            $set: { sprint: targetSprint._id }
                        }
                    );
                    moveDestination = `sprint: ${targetSprint.name}`;
                } else {
                    // Default: Return unfinished issues to backlog
                    await taskModel.updateMany(
                        {
                            sprint: sprint._id,
                            status: { $ne: 'Done' }
                        },
                        {
                            $set: { sprint: null }
                        }
                    );
                }
            }

            // Mark sprint completed
            sprint.status = 'Completed';
            sprint.completedAt = new Date();
            await sprint.save();

            await logActivity({
                workspaceId: workspace._id,
                projectId: sprint.project._id,
                actorId: req.userId,
                action: 'SPRINT_COMPLETED',
                resourceType: 'Sprint',
                details: {
                    name: sprint.name,
                    completedIssuesCount: completedTasks.length,
                    incompleteIssuesCount: incompleteTasks.length,
                    movedTo: moveDestination
                }
            });

            return res.status(200).json({
                message: `Sprint "${sprint.name}" completed successfully!`,
                sprint,
                summary: {
                    completedIssuesCount: completedTasks.length,
                    incompleteIssuesCount: incompleteTasks.length,
                    movedTo: moveDestination,
                    targetSprint: targetSprint ? { _id: targetSprint._id, name: targetSprint.name } : null
                }
            });
        } catch (error) {
            console.error('Error completing sprint:', error);
            return res.status(500).json({ message: 'Internal server error while completing sprint' });
        }
    }
);

// Sprint Detailed Report delegate
router.get('/:sprintId/report', (req, res, next) => {
    const qs = req.url.includes('?') ? req.url.slice(req.url.indexOf('?')) : '';
    req.url = `/sprints/${req.params.sprintId}${qs}`;
    analyticsRouter(req, res, next);
});

module.exports = router;
