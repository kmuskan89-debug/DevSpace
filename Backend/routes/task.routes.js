const express = require('express');
const router = express.Router({ mergeParams: true });
const mongoose = require('mongoose');
const { body, query, param } = require('express-validator');

const taskModel = require('../models/task.model');
const projectModel = require('../models/project.model');
const sprintModel = require('../models/sprint.model');
const workspaceModel = require('../models/workspace.model');
const commentModel = require('../models/comment.model');
const authMiddleware = require('../middleware/auth.middleware');
const commentRouter = require('./comment.routes');
const {
    getWorkspaceRole,
    isWorkspaceMember,
    isWorkspaceWriter,
    isWorkspaceAdminOrOwner,
    handleValidationErrors
} = require('../middleware/workspaceAuth');
const { logActivity } = require('../utils/activityLogger');
const { createNotification } = require('../utils/notificationService');

const isValidObjectId = (id) => mongoose.Types.ObjectId.isValid(id);

/**
 * Helper to fetch a task by ID or issueKey with workspace/project populated
 */
const findTaskByIdOrKey = async (taskIdOrKey, projectId = null) => {
    let query = {};
    if (isValidObjectId(taskIdOrKey)) {
        query._id = taskIdOrKey;
    } else {
        query.issueKey = taskIdOrKey.trim().toUpperCase();
    }

    if (projectId && isValidObjectId(projectId)) {
        query.project = projectId;
    }

    return await taskModel.findOne(query)
        .populate('project', 'name key lead workspace')
        .populate('workspace')
        .populate('sprint', 'name status goal startDate endDate')
        .populate('assignee', 'name email avatar')
        .populate('reporter', 'name email avatar');
};

// Mount nested comments router on /:taskId/comments
router.use('/:taskId/comments', commentRouter);

/**
 * POST /api/tasks or POST /api/projects/:projectId/tasks
 * Create a new task with concurrency-safe issue key generation
 */
router.post(
    '/',
    authMiddleware,
    [
        body('title')
            .trim()
            .isLength({ min: 1, max: 255 })
            .withMessage('Task title is required and cannot exceed 255 characters'),
        body('description')
            .optional()
            .trim()
            .isLength({ max: 10000 })
            .withMessage('Description cannot exceed 10000 characters'),
        body('type')
            .optional()
            .customSanitizer((v) => {
                if (!v) return 'Task';
                const s = String(v).toLowerCase().trim();
                if (s === 'bug') return 'Bug';
                if (s === 'feature' || s === 'story') return 'Story';
                if (s === 'epic') return 'Epic';
                if (s === 'task') return 'Task';
                return v;
            })
            .isIn(['Task', 'Bug', 'Story', 'Epic'])
            .withMessage('Type must be Task, Bug, Story, or Epic'),
        body('status')
            .optional()
            .customSanitizer((v) => {
                if (!v) return 'To Do';
                const s = String(v).toLowerCase().trim();
                if (s === 'todo' || s === 'to do' || s === 'to-do') return 'To Do';
                if (s === 'in-progress' || s === 'in progress') return 'In Progress';
                if (s === 'in-review' || s === 'in review') return 'In Review';
                if (s === 'code review' || s === 'code-review') return 'Code Review';
                if (s === 'done') return 'Done';
                return v;
            })
            .isIn(['To Do', 'In Progress', 'In Review', 'Code Review', 'Done'])
            .withMessage('Status must be To Do, In Progress, In Review, Code Review, or Done'),
        body('priority')
            .optional()
            .customSanitizer((v) => {
                if (!v) return 'Medium';
                const s = String(v).toLowerCase().trim();
                if (s === 'lowest') return 'Lowest';
                if (s === 'low') return 'Low';
                if (s === 'medium') return 'Medium';
                if (s === 'high') return 'High';
                if (s === 'critical' || s === 'highest' || s === 'urgent') return 'Highest';
                return v;
            })
            .isIn(['Lowest', 'Low', 'Medium', 'High', 'Highest'])
            .withMessage('Priority must be Lowest, Low, Medium, High, or Highest'),
        body('assignee')
            .optional({ nullable: true })
            .custom((val) => {
                if (val && !isValidObjectId(val)) {
                    throw new Error('Invalid assignee user ID');
                }
                return true;
            }),
        body('storyPoints')
            .optional({ nullable: true })
            .isFloat({ min: 0 })
            .withMessage('Story points must be a non-negative number'),
        body('dueDate')
            .optional({ nullable: true })
            .isISO8601()
            .withMessage('Due date must be a valid ISO 8601 date'),
        handleValidationErrors
    ],
    async (req, res) => {
        try {
            const userId = req.userId;
            const projectId = req.params.projectId || req.body.project;

            if (!projectId) {
                return res.status(400).json({
                    message: 'Project ID is required'
                });
            }

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

            // Authorization check: User must be a member of the project's workspace
            if (!isWorkspaceMember(workspace, userId)) {
                return res.status(403).json({
                    message: 'You are not authorized to access this workspace'
                });
            }

            // Viewers have read-only access and cannot create tasks
            if (!isWorkspaceWriter(workspace, userId)) {
                return res.status(403).json({
                    message: 'Workspace Viewers have read-only access and cannot create tasks'
                });
            }

            const {
                title,
                description,
                type = 'Task',
                status = 'To Do',
                priority = 'Medium',
                assignee,
                labels,
                dueDate,
                storyPoints,
                estimate,
                branch,
                subtasks,
                comments
            } = req.body;

            // Validate assignee if provided
            let validAssignee = null;
            if (assignee) {
                if (!isWorkspaceMember(workspace, assignee)) {
                    return res.status(400).json({
                        message: 'Assignee must be a member or owner of the workspace'
                    });
                }
                validAssignee = assignee;
            }

            // Format labels array
            let formattedLabels = [];
            if (Array.isArray(labels)) {
                formattedLabels = labels.map(l => String(l).trim()).filter(Boolean);
            } else if (typeof labels === 'string' && labels.trim()) {
                formattedLabels = labels.split(',').map(l => l.trim()).filter(Boolean);
            }

            // Concurrency-safe atomic increment of taskCounter on project
            const updatedProject = await projectModel.findByIdAndUpdate(
                project._id,
                { $inc: { taskCounter: 1 } },
                { returnDocument: 'after' }
            );

            const issueKey = `${updatedProject.key}-${updatedProject.taskCounter}`;

            // Check optional sprint assignment
            let validSprint = null;
            if (req.body.sprint && isValidObjectId(req.body.sprint)) {
                const s = await sprintModel.findOne({ _id: req.body.sprint, project: project._id });
                if (s) validSprint = s._id;
            }

            const task = await taskModel.create({
                title: title.trim(),
                description: description?.trim() || '',
                issueKey,
                project: project._id,
                workspace: workspace._id,
                type,
                status,
                priority,
                sprint: validSprint,
                assignee: validAssignee,
                reporter: userId,
                labels: formattedLabels,
                dueDate: dueDate ? new Date(dueDate) : null,
                storyPoints: storyPoints !== undefined && storyPoints !== null ? Number(storyPoints) : null,
                estimate: estimate?.trim() || '',
                branch: branch?.trim() || '',
                subtasks: Array.isArray(subtasks) ? subtasks : [],
                comments: Array.isArray(comments) ? comments : []
            });

            const populatedTask = await taskModel.findById(task._id)
                .populate('project', 'name key')
                .populate('workspace', 'name slug')
                .populate('sprint', 'name status goal startDate endDate')
                .populate('assignee', 'name email avatar')
                .populate('reporter', 'name email avatar');

            // Log activity
            await logActivity({
                workspaceId: workspace._id,
                projectId: project._id,
                taskId: task._id,
                actorId: userId,
                action: 'TASK_CREATED',
                resourceType: 'Task',
                details: { title: task.title, issueKey: task.issueKey, type, priority, status }
            });

            // Notify assignee if assigned to someone else
            if (validAssignee && validAssignee.toString() !== userId.toString()) {
                await createNotification({
                    recipientId: validAssignee,
                    senderId: userId,
                    workspaceId: workspace._id,
                    type: 'TASK_ASSIGNED',
                    title: 'New Task Assigned',
                    message: `You were assigned to ${task.issueKey}: "${task.title}".`,
                    link: `/workspace/${workspace.slug || workspace._id}/projects/${project._id}/board`
                });
            }

            return res.status(201).json({
                message: 'Task created successfully',
                task: populatedTask
            });
        } catch (error) {
            console.error('Error creating task:', error);
            if (error.code === 11000) {
                return res.status(400).json({
                    message: 'A task with this issue key already exists'
                });
            }
            return res.status(500).json({
                message: 'Internal server error while creating task'
            });
        }
    }
);

/**
 * GET /api/tasks or GET /api/projects/:projectId/tasks
 * List tasks for a project or workspace with advanced filters, sorting, and pagination
 */
router.get(
    '/',
    authMiddleware,
    async (req, res) => {
        try {
            const userId = req.userId;
            const projectId = req.params.projectId || req.query.projectId || req.query.project;
            const workspaceId = req.query.workspaceId || req.query.workspace;

            const queryFilters = {};

            // 1. Authorization and Scope Resolution
            if (projectId) {
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
                if (!workspace || !isWorkspaceMember(workspace, userId)) {
                    return res.status(403).json({
                        message: 'You are not authorized to view tasks in this project'
                    });
                }

                queryFilters.project = project._id;
            } else if (workspaceId) {
                if (!isValidObjectId(workspaceId)) {
                    return res.status(400).json({
                        message: 'Invalid workspace ID format'
                    });
                }

                const workspace = await workspaceModel.findById(workspaceId);
                if (!workspace || !isWorkspaceMember(workspace, userId)) {
                    return res.status(403).json({
                        message: 'You are not authorized to view tasks in this workspace'
                    });
                }

                queryFilters.workspace = workspace._id;
            } else {
                // Find all workspaces where user is owner or member
                const workspaces = await workspaceModel.find({
                    $or: [
                        { owner: userId },
                        { 'members.user': userId }
                    ]
                }).select('_id');
                const authorizedWsIds = workspaces.map((w) => w._id);

                if (authorizedWsIds.length === 0) {
                    return res.status(200).json({
                        message: 'Tasks fetched successfully',
                        tasks: [],
                        pagination: {
                            total: 0,
                            page: 1,
                            limit: 20,
                            totalPages: 0,
                            hasNextPage: false,
                            hasPrevPage: false
                        }
                    });
                }

                queryFilters.workspace = { $in: authorizedWsIds };
            }

            // 2. Advanced Task Filters

            // Filter: Status (single or comma-separated)
            if (req.query.status) {
                const mapStatus = (s) => {
                    const l = s.toLowerCase().trim();
                    if (l === 'todo' || l === 'to do' || l === 'to-do') return 'To Do';
                    if (l === 'in-progress' || l === 'in progress') return 'In Progress';
                    if (l === 'in-review' || l === 'in review') return 'In Review';
                    if (l === 'code review' || l === 'code-review') return 'Code Review';
                    if (l === 'done') return 'Done';
                    return s;
                };
                const statuses = req.query.status.split(',').map(s => mapStatus(s.trim()));
                queryFilters.status = statuses.length > 1 ? { $in: statuses } : statuses[0];
            }

            // Filter: Priority (single or comma-separated)
            if (req.query.priority) {
                const mapPriority = (p) => {
                    const l = p.toLowerCase().trim();
                    if (l === 'lowest') return 'Lowest';
                    if (l === 'low') return 'Low';
                    if (l === 'medium') return 'Medium';
                    if (l === 'high') return 'High';
                    if (l === 'critical' || l === 'highest' || l === 'urgent') return 'Highest';
                    return p;
                };
                const priorities = req.query.priority.split(',').map(p => mapPriority(p.trim()));
                queryFilters.priority = priorities.length > 1 ? { $in: priorities } : priorities[0];
            }

            // Filter: Type (single or comma-separated)
            if (req.query.type) {
                const mapType = (t) => {
                    const l = t.toLowerCase().trim();
                    if (l === 'bug') return 'Bug';
                    if (l === 'feature' || l === 'story') return 'Story';
                    if (l === 'epic') return 'Epic';
                    if (l === 'task') return 'Task';
                    return t;
                };
                const types = req.query.type.split(',').map(t => mapType(t.trim()));
                queryFilters.type = types.length > 1 ? { $in: types } : types[0];
            }

            // Filter: Assignee
            if (req.query.assignee) {
                const assigneeVal = req.query.assignee.trim();
                if (assigneeVal.toLowerCase() === 'unassigned' || assigneeVal.toLowerCase() === 'none') {
                    queryFilters.assignee = null;
                } else if (assigneeVal.toLowerCase() === 'assigned') {
                    queryFilters.assignee = { $ne: null };
                } else if (assigneeVal.includes(',')) {
                    const ids = assigneeVal.split(',').map(id => id.trim()).filter(isValidObjectId);
                    if (ids.length > 0) queryFilters.assignee = { $in: ids };
                } else if (isValidObjectId(assigneeVal)) {
                    queryFilters.assignee = assigneeVal;
                }
            }

            // Filter: Reporter
            if (req.query.reporter) {
                const reporterVal = req.query.reporter.trim();
                if (reporterVal.includes(',')) {
                    const ids = reporterVal.split(',').map(id => id.trim()).filter(isValidObjectId);
                    if (ids.length > 0) queryFilters.reporter = { $in: ids };
                } else if (isValidObjectId(reporterVal)) {
                    queryFilters.reporter = reporterVal;
                }
            }

            // Filter: Sprint
            if (req.query.sprint !== undefined && req.query.sprint !== '') {
                const sprintVal = String(req.query.sprint).trim();
                if (sprintVal === 'null' || sprintVal === 'none' || sprintVal === 'backlog') {
                    queryFilters.sprint = null;
                } else if (sprintVal === 'assigned' || sprintVal === 'has-sprint') {
                    queryFilters.sprint = { $ne: null };
                } else if (isValidObjectId(sprintVal)) {
                    queryFilters.sprint = sprintVal;
                }
            }

            // Filter: Labels
            if (req.query.labels) {
                const labelList = req.query.labels.split(',').map(l => l.trim()).filter(Boolean);
                if (labelList.length > 0) {
                    queryFilters.labels = { $in: labelList };
                }
            }

            // Filter: Due Date (Presets or Range)
            const dueDatePreset = req.query.dueDate;
            if (dueDatePreset) {
                const now = new Date();
                if (dueDatePreset === 'overdue') {
                    queryFilters.dueDate = { $lt: now };
                    // If not explicitly filtering by status, overdue usually means not yet Done
                    if (!queryFilters.status) {
                        queryFilters.status = { $ne: 'Done' };
                    }
                } else if (dueDatePreset === 'today') {
                    const startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 0, 0, 0);
                    const endOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 23, 59, 59, 999);
                    queryFilters.dueDate = { $gte: startOfToday, $lte: endOfToday };
                } else if (dueDatePreset === 'this-week') {
                    const startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 0, 0, 0);
                    const in7Days = new Date(startOfToday.getTime() + 7 * 24 * 60 * 60 * 1000);
                    queryFilters.dueDate = { $gte: startOfToday, $lte: in7Days };
                } else if (dueDatePreset === 'has-due-date' || dueDatePreset === 'set') {
                    queryFilters.dueDate = { $ne: null };
                } else if (dueDatePreset === 'no-due-date' || dueDatePreset === 'unset') {
                    queryFilters.dueDate = null;
                }
            } else if (req.query.dueDateFrom || req.query.dueDateTo) {
                const dateCond = {};
                if (req.query.dueDateFrom) {
                    const d = new Date(req.query.dueDateFrom);
                    if (!isNaN(d.getTime())) dateCond.$gte = d;
                }
                if (req.query.dueDateTo) {
                    const d = new Date(req.query.dueDateTo);
                    if (!isNaN(d.getTime())) dateCond.$lte = d;
                }
                if (Object.keys(dateCond).length > 0) {
                    queryFilters.dueDate = dateCond;
                }
            }

            // Filter: Creation Date Range
            if (req.query.createdAtFrom || req.query.createdAtTo) {
                const createdCond = {};
                if (req.query.createdAtFrom) {
                    const d = new Date(req.query.createdAtFrom);
                    if (!isNaN(d.getTime())) createdCond.$gte = d;
                }
                if (req.query.createdAtTo) {
                    const d = new Date(req.query.createdAtTo);
                    if (!isNaN(d.getTime())) createdCond.$lte = d;
                }
                if (Object.keys(createdCond).length > 0) {
                    queryFilters.createdAt = createdCond;
                }
            }

            // Search by title, description, issueKey, or labels with escaped regex
            if (req.query.search) {
                const rawSearch = req.query.search.trim();
                const cleanSearch = rawSearch.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
                const searchRegex = new RegExp(cleanSearch, 'i');
                const upperSearch = rawSearch.toUpperCase();
                queryFilters.$or = [
                    { issueKey: upperSearch },
                    { issueKey: searchRegex },
                    { title: searchRegex },
                    { description: searchRegex },
                    { labels: searchRegex }
                ];
            }

            // 3. Sorting & Pagination
            const allowedSortFields = ['createdAt', 'updatedAt', 'dueDate', 'priority', 'issueKey', 'order', 'title'];
            const sortField = allowedSortFields.includes(req.query.sortBy) ? req.query.sortBy : 'createdAt';
            const sortOrder = (req.query.sortOrder || 'desc').toLowerCase() === 'asc' ? 1 : -1;

            const sortObj = {};
            sortObj[sortField] = sortOrder;
            if (sortField !== 'createdAt') {
                sortObj.createdAt = -1;
            }

            // Pagination setup
            const page = Math.max(1, parseInt(req.query.page, 10) || 1);
            const limit = Math.min(100, Math.max(1, parseInt(req.query.limit, 10) || 20));
            const skip = (page - 1) * limit;

            const [tasks, total] = await Promise.all([
                taskModel.find(queryFilters)
                    .populate('assignee', 'name email avatar')
                    .populate('reporter', 'name email avatar')
                    .populate('project', 'name key')
                    .populate('workspace', 'name slug')
                    .populate('sprint', 'name status goal startDate endDate')
                    .sort(sortObj)
                    .skip(skip)
                    .limit(limit),
                taskModel.countDocuments(queryFilters)
            ]);

            const totalPages = Math.ceil(total / limit) || (total === 0 ? 0 : 1);

            return res.status(200).json({
                message: 'Tasks fetched successfully',
                tasks,
                pagination: {
                    total,
                    page,
                    limit,
                    totalPages,
                    hasNextPage: page < totalPages,
                    hasPrevPage: page > 1
                }
            });
        } catch (error) {
            console.error('Error fetching tasks:', error);
            return res.status(500).json({
                message: 'Internal server error while fetching tasks'
            });
        }
    }
);

/**
 * GET /api/tasks/:taskIdOrKey or GET /api/projects/:projectId/tasks/:taskIdOrKey
 * Get a task by Mongo ID or human-readable issue key (e.g. DEV-101)
 */
router.get(
    '/:taskIdOrKey',
    authMiddleware,
    async (req, res) => {
        try {
            const userId = req.userId;
            const { taskIdOrKey, projectId } = req.params;

            const task = await findTaskByIdOrKey(taskIdOrKey, projectId);
            if (!task) {
                return res.status(404).json({
                    message: 'Task not found'
                });
            }

            // Authorization: verify workspace membership
            const workspace = task.workspace;
            if (!isWorkspaceMember(workspace, userId)) {
                return res.status(403).json({
                    message: 'You are not authorized to view this task'
                });
            }

            return res.status(200).json({
                message: 'Task fetched successfully',
                task
            });
        } catch (error) {
            console.error('Error fetching task:', error);
            return res.status(500).json({
                message: 'Internal server error while fetching task'
            });
        }
    }
);

/**
 * PUT/PATCH /api/tasks/:taskId
 * Update task details
 */
const updateTaskHandler = async (req, res) => {
    try {
        const userId = req.userId;
        const { taskIdOrKey, taskId } = req.params;
        const idToLookup = taskId || taskIdOrKey;

        const task = await findTaskByIdOrKey(idToLookup, req.params.projectId);
        if (!task) {
            return res.status(404).json({
                message: 'Task not found'
            });
        }

        const workspace = task.workspace;
        if (!isWorkspaceMember(workspace, userId)) {
            return res.status(403).json({
                message: 'You are not authorized to update this task'
            });
        }

        // Viewers have read-only access
        if (!isWorkspaceWriter(workspace, userId)) {
            return res.status(403).json({
                message: 'Workspace Viewers have read-only access and cannot edit tasks'
            });
        }

        const {
            title,
            description,
            type,
            status,
            priority,
            assignee,
            labels,
            dueDate,
            storyPoints,
            estimate
        } = req.body;

        if (title !== undefined) {
            if (!title.trim()) {
                return res.status(400).json({
                    message: 'Task title cannot be empty'
                });
            }
            task.title = title.trim();
        }

        if (description !== undefined) {
            task.description = description.trim();
        }

        if (type !== undefined) {
            const validTypes = ['Task', 'Bug', 'Story', 'Epic'];
            if (!validTypes.includes(type)) {
                return res.status(400).json({
                    message: `Invalid type. Allowed values: ${validTypes.join(', ')}`
                });
            }
            task.type = type;
        }

        if (status !== undefined) {
            const validStatuses = ['To Do', 'In Progress', 'In Review', 'Code Review', 'Done'];
            if (!validStatuses.includes(status)) {
                return res.status(400).json({
                    message: `Invalid status. Allowed values: ${validStatuses.join(', ')}`
                });
            }
            task.status = status;
        }

        if (priority !== undefined) {
            const validPriorities = ['Lowest', 'Low', 'Medium', 'High', 'Highest'];
            if (!validPriorities.includes(priority)) {
                return res.status(400).json({
                    message: `Invalid priority. Allowed values: ${validPriorities.join(', ')}`
                });
            }
            task.priority = priority;
        }

        if (assignee !== undefined) {
            if (assignee === null || assignee === '') {
                task.assignee = null;
            } else {
                if (!isValidObjectId(assignee)) {
                    return res.status(400).json({
                        message: 'Invalid assignee user ID'
                    });
                }
                if (!isWorkspaceMember(workspace, assignee)) {
                    return res.status(400).json({
                        message: 'Assignee must be a member or owner of the workspace'
                    });
                }
                task.assignee = assignee;
            }
        }

        if (labels !== undefined) {
            if (Array.isArray(labels)) {
                task.labels = labels.map(l => String(l).trim()).filter(Boolean);
            } else if (typeof labels === 'string') {
                task.labels = labels.split(',').map(l => l.trim()).filter(Boolean);
            }
        }

        if (dueDate !== undefined) {
            task.dueDate = dueDate ? new Date(dueDate) : null;
        }

        if (storyPoints !== undefined) {
            task.storyPoints = (storyPoints === null || storyPoints === '') ? null : Number(storyPoints);
        }

        if (estimate !== undefined) {
            task.estimate = estimate.trim();
        }

        if (req.body.branch !== undefined) {
            task.branch = req.body.branch.trim();
        }

        if (req.body.subtasks !== undefined && Array.isArray(req.body.subtasks)) {
            task.subtasks = req.body.subtasks;
        }

        if (req.body.comments !== undefined && Array.isArray(req.body.comments)) {
            task.comments = req.body.comments;
        }

        if (req.body.sprint !== undefined) {
            if (req.body.sprint === null || req.body.sprint === '' || req.body.sprint === 'backlog') {
                task.sprint = null;
            } else if (isValidObjectId(req.body.sprint)) {
                const s = await sprintModel.findOne({ _id: req.body.sprint, project: task.project._id });
                if (s) {
                    task.sprint = s._id;
                }
            }
        }

        await task.save();

        // Log activity
        await logActivity({
            workspaceId: workspace._id,
            projectId: task.project._id,
            taskId: task._id,
            actorId: userId,
            action: 'TASK_UPDATED',
            resourceType: 'Task',
            details: { title: task.title, issueKey: task.issueKey, status: task.status }
        });

        const updatedTask = await taskModel.findById(task._id)
            .populate('project', 'name key')
            .populate('workspace', 'name slug')
            .populate('sprint', 'name status goal startDate endDate')
            .populate('assignee', 'name email avatar')
            .populate('reporter', 'name email avatar');

        return res.status(200).json({
            message: 'Task updated successfully',
            task: updatedTask
        });
    } catch (error) {
        console.error('Error updating task:', error);
        return res.status(500).json({
            message: 'Internal server error while updating task'
        });
    }
};

router.put(
    '/:taskId',
    authMiddleware,
    updateTaskHandler
);

router.patch(
    '/:taskId',
    authMiddleware,
    updateTaskHandler
);

/**
 * PATCH /api/tasks/:taskId/status
 * Dedicated endpoint to transition task status
 */
router.patch(
    '/:taskId/status',
    authMiddleware,
    [
        body('status')
            .trim()
            .customSanitizer((v) => {
                if (!v) return v;
                const s = String(v).toLowerCase().trim();
                if (s === 'todo' || s === 'to do' || s === 'to-do') return 'To Do';
                if (s === 'in-progress' || s === 'in progress') return 'In Progress';
                if (s === 'in-review' || s === 'in review') return 'In Review';
                if (s === 'code review' || s === 'code-review') return 'Code Review';
                if (s === 'done') return 'Done';
                return v;
            })
            .isIn(['To Do', 'In Progress', 'In Review', 'Code Review', 'Done'])
            .withMessage('Status must be To Do, In Progress, In Review, Code Review, or Done'),
        handleValidationErrors
    ],
    async (req, res) => {
        try {
            const userId = req.userId;
            const { taskId } = req.params;
            const { status } = req.body;

            const task = await findTaskByIdOrKey(taskId, req.params.projectId);
            if (!task) {
                return res.status(404).json({
                    message: 'Task not found'
                });
            }

            if (!isWorkspaceMember(task.workspace, userId)) {
                return res.status(403).json({
                    message: 'You are not authorized to update this task'
                });
            }

            // Viewers have read-only access
            if (!isWorkspaceWriter(task.workspace, userId)) {
                return res.status(403).json({
                    message: 'Workspace Viewers have read-only access and cannot transition task status'
                });
            }

            const oldStatus = task.status;
            task.status = status;
            await task.save();

            // Log activity
            await logActivity({
                workspaceId: task.workspace._id,
                projectId: task.project._id,
                taskId: task._id,
                actorId: userId,
                action: 'TASK_STATUS_CHANGED',
                resourceType: 'Task',
                details: {
                    title: task.title,
                    issueKey: task.issueKey,
                    oldStatus,
                    newStatus: status
                }
            });

            // Notify Assignee and Reporter if someone else changed the status
            const notifyList = new Set();
            if (task.assignee && task.assignee._id?.toString() !== userId.toString()) {
                notifyList.add(task.assignee._id.toString());
            }
            if (task.reporter && task.reporter._id?.toString() !== userId.toString()) {
                notifyList.add(task.reporter._id.toString());
            }

            for (const recipientId of notifyList) {
                await createNotification({
                    recipientId,
                    senderId: userId,
                    workspaceId: task.workspace._id,
                    type: 'TASK_STATUS_CHANGED',
                    title: `Status Changed: ${task.issueKey}`,
                    message: `Task "${task.title}" was moved from ${oldStatus} to ${status}.`,
                    link: `/workspace/${task.workspace.slug || task.workspace._id}/projects/${task.project._id}/board`
                });
            }

            const updatedTask = await taskModel.findById(task._id)
                .populate('project', 'name key')
                .populate('assignee', 'name email avatar')
                .populate('reporter', 'name email avatar');

            return res.status(200).json({
                message: `Task status updated to ${status}`,
                task: updatedTask
            });
        } catch (error) {
            console.error('Error changing task status:', error);
            return res.status(500).json({
                message: 'Internal server error while changing task status'
            });
        }
    }
);

/**
 * PATCH /api/tasks/:taskId/assign
 * Dedicated endpoint to assign or reassign a task
 */
router.patch(
    '/:taskId/assign',
    authMiddleware,
    [
        body('assignee')
            .optional({ nullable: true })
            .custom((val) => {
                if (val && !isValidObjectId(val)) {
                    throw new Error('Invalid assignee user ID');
                }
                return true;
            }),
        handleValidationErrors
    ],
    async (req, res) => {
        try {
            const userId = req.userId;
            const { taskId } = req.params;
            const { assignee } = req.body;

            const task = await findTaskByIdOrKey(taskId, req.params.projectId);
            if (!task) {
                return res.status(404).json({
                    message: 'Task not found'
                });
            }

            if (!isWorkspaceMember(task.workspace, userId)) {
                return res.status(403).json({
                    message: 'You are not authorized to update this task'
                });
            }

            // Viewers have read-only access
            if (!isWorkspaceWriter(task.workspace, userId)) {
                return res.status(403).json({
                    message: 'Workspace Viewers have read-only access and cannot assign tasks'
                });
            }

            if (assignee) {
                if (!isWorkspaceMember(task.workspace, assignee)) {
                    return res.status(400).json({
                        message: 'Assignee must be a member or owner of the workspace'
                    });
                }
                task.assignee = assignee;
            } else {
                task.assignee = null;
            }

            await task.save();

            // Log activity
            await logActivity({
                workspaceId: task.workspace._id,
                projectId: task.project._id,
                taskId: task._id,
                actorId: userId,
                action: 'TASK_ASSIGNED',
                resourceType: 'Task',
                details: {
                    title: task.title,
                    issueKey: task.issueKey,
                    assignedTo: assignee || 'Unassigned'
                }
            });

            // Notify new assignee
            if (assignee && assignee.toString() !== userId.toString()) {
                await createNotification({
                    recipientId: assignee,
                    senderId: userId,
                    workspaceId: task.workspace._id,
                    type: 'TASK_ASSIGNED',
                    title: 'Task Assigned To You',
                    message: `You were assigned to ${task.issueKey}: "${task.title}".`,
                    link: `/workspace/${task.workspace.slug || task.workspace._id}/projects/${task.project._id}/board`
                });
            }

            const updatedTask = await taskModel.findById(task._id)
                .populate('project', 'name key')
                .populate('assignee', 'name email avatar')
                .populate('reporter', 'name email avatar');

            return res.status(200).json({
                message: assignee ? 'Task assigned successfully' : 'Task unassigned successfully',
                task: updatedTask
            });
        } catch (error) {
            console.error('Error assigning task:', error);
            return res.status(500).json({
                message: 'Internal server error while assigning task'
            });
        }
    }
);

/**
 * DELETE /api/tasks/:taskId
 * Delete task with role-based authorization check
 */
router.delete(
    '/:taskId',
    authMiddleware,
    async (req, res) => {
        try {
            const userId = req.userId;
            const { taskId } = req.params;

            const task = await findTaskByIdOrKey(taskId, req.params.projectId);
            if (!task) {
                return res.status(404).json({
                    message: 'Task not found'
                });
            }

            const workspace = task.workspace;
            if (!isWorkspaceMember(workspace, userId)) {
                return res.status(403).json({
                    message: 'You are not authorized to access this task'
                });
            }

            // Role-based authorization for task deletion:
            // Workspace Owner, Workspace Admin, Project Lead, or Task Reporter can delete
            const isReporter = task.reporter?._id?.toString() === userId.toString();
            const isLead = task.project?.lead?.toString() === userId.toString();
            const isAdminOrOwner = isWorkspaceAdminOrOwner(workspace, userId);

            if (!isReporter && !isLead && !isAdminOrOwner) {
                return res.status(403).json({
                    message: 'Only the reporter, project lead, workspace owner, or workspace admin can delete this task'
                });
            }

            // Delete associated comments
            await commentModel.deleteMany({ task: task._id });
            await taskModel.findByIdAndDelete(task._id);

            // Log activity
            await logActivity({
                workspaceId: workspace._id,
                projectId: task.project._id,
                taskId: task._id,
                actorId: userId,
                action: 'TASK_DELETED',
                resourceType: 'Task',
                details: { title: task.title, issueKey: task.issueKey }
            });

            return res.status(200).json({
                message: 'Task deleted successfully',
                deletedTaskId: task._id,
                deletedIssueKey: task.issueKey
            });
        } catch (error) {
            console.error('Error deleting task:', error);
            return res.status(500).json({
                message: 'Internal server error while deleting task'
            });
        }
    }
);

module.exports = router;
