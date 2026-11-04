const express = require('express');
const router = express.Router();
const mongoose = require('mongoose');

const workspaceModel = require('../models/workspace.model');
const projectModel = require('../models/project.model');
const taskModel = require('../models/task.model');
const sprintModel = require('../models/sprint.model');
const activityModel = require('../models/activity.model');
const authMiddleware = require('../middleware/auth.middleware');
const { isWorkspaceMember } = require('../middleware/workspaceAuth');

const isValidObjectId = (id) => mongoose.Types.ObjectId.isValid(id);

/**
 * Helper to compute date range filter based on period query param
 */
const getDateRangeFilter = (period, startDate, endDate) => {
    const filter = {};
    const now = new Date();

    if (startDate || endDate) {
        if (startDate) {
            const start = new Date(startDate);
            if (!isNaN(start.getTime())) filter.$gte = start;
        }
        if (endDate) {
            const end = new Date(endDate);
            if (!isNaN(end.getTime())) filter.$lte = end;
        }
        return Object.keys(filter).length > 0 ? filter : null;
    }

    if (period === '7d') {
        filter.$gte = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
        return filter;
    }
    if (period === '30d') {
        filter.$gte = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
        return filter;
    }
    if (period === '90d') {
        filter.$gte = new Date(now.getTime() - 90 * 24 * 60 * 60 * 1000);
        return filter;
    }

    return null; // 'all' or undefined
};

/**
 * Sanitize cell to prevent CSV injection (formula injection with =, +, -, @)
 */
const sanitizeCsvCell = (val) => {
    if (val === null || val === undefined) return '""';
    let str = String(val).trim();
    if (/^[=+\-@\t\r]/.test(str)) {
        str = `'${str}`;
    }
    return `"${str.replace(/"/g, '""')}"`;
};

/**
 * Format array of objects to CSV string
 */
const formatCsv = (headers, rows) => {
    const headerLine = headers.map(h => sanitizeCsvCell(h.label)).join(',');
    const dataLines = rows.map(row => {
        return headers.map(h => sanitizeCsvCell(row[h.key] ?? '')).join(',');
    });
    return [headerLine, ...dataLines].join('\r\n');
};

/**
 * GET /api/analytics/workspaces/:workspaceId
 * Comprehensive analytics for a workspace
 */
router.get('/workspaces/:workspaceId', authMiddleware, async (req, res) => {
    try {
        const { workspaceId } = req.params;
        const userId = req.userId;
        const { period, startDate, endDate } = req.query;

        const isObjectId = isValidObjectId(workspaceId);
        const wsQuery = isObjectId ? { _id: workspaceId } : { slug: workspaceId };
        const workspace = await workspaceModel.findOne(wsQuery).populate('members.user', 'name email avatar');

        if (!workspace) {
            return res.status(404).json({ message: 'Workspace not found' });
        }

        if (!isWorkspaceMember(workspace, userId)) {
            return res.status(403).json({ message: 'You are not authorized to view analytics for this workspace' });
        }

        const dateRange = getDateRangeFilter(period, startDate, endDate);
        const taskBaseQuery = { workspace: workspace._id };
        if (dateRange) {
            taskBaseQuery.createdAt = dateRange;
        }

        const now = new Date();

        // 1. Fetch projects in workspace
        const projects = await projectModel.find({ workspace: workspace._id })
            .populate('lead', 'name email avatar')
            .sort({ updatedAt: -1 });

        // 2. Fetch tasks for metrics
        const tasks = await taskModel.find(taskBaseQuery)
            .select('title issueKey status priority type project assignee dueDate createdAt updatedAt storyPoints')
            .populate('project', 'name key')
            .populate('assignee', 'name email avatar');

        // 3. Fetch sprints in workspace
        const sprintBaseQuery = { workspace: workspace._id };
        if (dateRange) {
            sprintBaseQuery.createdAt = dateRange;
        }
        const sprints = await sprintModel.find(sprintBaseQuery).sort({ createdAt: -1 });

        // 4. Fetch recent workspace activities
        const activities = await activityModel.find({ workspace: workspace._id })
            .populate('actor', 'name email avatar')
            .populate('project', 'name key')
            .populate('task', 'title issueKey')
            .sort({ createdAt: -1 })
            .limit(10);

        // Compute Task Metrics
        const totalTasks = tasks.length;
        let completedTasks = 0;
        let pendingTasks = 0;
        let inProgressTasks = 0;
        let overdueTasks = 0;

        const byStatus = { 'To Do': 0, 'In Progress': 0, 'Code Review': 0, 'Done': 0 };
        const byPriority = { Lowest: 0, Low: 0, Medium: 0, High: 0, Highest: 0 };
        const byType = { Task: 0, Bug: 0, Story: 0, Epic: 0 };

        tasks.forEach((t) => {
            // Status groupings
            if (t.status === 'Done') {
                completedTasks++;
                byStatus['Done'] = (byStatus['Done'] || 0) + 1;
            } else if (t.status === 'To Do') {
                pendingTasks++;
                byStatus['To Do'] = (byStatus['To Do'] || 0) + 1;
            } else {
                inProgressTasks++;
                if (t.status === 'Code Review' || t.status === 'In Review') {
                    byStatus['Code Review'] = (byStatus['Code Review'] || 0) + 1;
                } else {
                    byStatus['In Progress'] = (byStatus['In Progress'] || 0) + 1;
                }
            }

            // Overdue check
            if (t.dueDate && new Date(t.dueDate) < now && t.status !== 'Done') {
                overdueTasks++;
            }

            // Priority distribution
            if (byPriority[t.priority] !== undefined) {
                byPriority[t.priority]++;
            } else {
                byPriority[t.priority] = 1;
            }

            // Type distribution
            if (byType[t.type] !== undefined) {
                byType[t.type]++;
            } else {
                byType[t.type] = 1;
            }
        });

        const overallProgress = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0;

        // Compute Sprint Metrics
        const activeSprints = sprints.filter((s) => s.status === 'Active').length;
        const completedSprints = sprints.filter((s) => s.status === 'Completed').length;
        const plannedSprints = sprints.filter((s) => s.status === 'Planned').length;

        // Compute Project Breakdown
        const projectBreakdown = projects.map((p) => {
            const pTasks = tasks.filter((t) => t.project?._id?.toString() === p._id.toString() || t.project?.toString() === p._id.toString());
            const pCompleted = pTasks.filter((t) => t.status === 'Done').length;
            const pInProgress = pTasks.filter((t) => t.status !== 'Done' && t.status !== 'To Do').length;
            const pTotal = pTasks.length;
            const pProgress = pTotal > 0 ? Math.round((pCompleted / pTotal) * 100) : 0;

            return {
                id: p._id,
                name: p.name,
                key: p.key,
                status: p.status,
                priority: p.priority,
                lead: p.lead ? { name: p.lead.name, email: p.lead.email, avatar: p.lead.avatar } : null,
                totalTasks: pTotal,
                completedTasks: pCompleted,
                inProgressTasks: pInProgress,
                progress: pProgress
            };
        });

        // Compute Team Workload Metrics
        const memberList = workspace.members || [];
        const teamWorkload = memberList.map((m) => {
            const u = m.user;
            if (!u) return null;
            const uId = u._id.toString();

            const userTasks = tasks.filter((t) => t.assignee && (t.assignee._id?.toString() === uId || t.assignee.toString() === uId));
            const uCompleted = userTasks.filter((t) => t.status === 'Done').length;
            const uPending = userTasks.filter((t) => t.status === 'To Do').length;
            const uInProgress = userTasks.filter((t) => t.status !== 'Done' && t.status !== 'To Do').length;
            const uOverdue = userTasks.filter((t) => t.dueDate && new Date(t.dueDate) < now && t.status !== 'Done').length;

            const uPriority = { Highest: 0, High: 0, Medium: 0, Low: 0, Lowest: 0 };
            userTasks.forEach((t) => {
                if (uPriority[t.priority] !== undefined) uPriority[t.priority]++;
            });

            const workloadShare = totalTasks > 0 ? Math.round((userTasks.length / totalTasks) * 100) : 0;

            return {
                user: {
                    _id: u._id,
                    name: u.name,
                    email: u.email,
                    avatar: u.avatar
                },
                role: m.role,
                assignedTasks: userTasks.length,
                completedTasks: uCompleted,
                pendingTasks: uPending,
                inProgressTasks: uInProgress,
                overdueTasks: uOverdue,
                workloadShare,
                byPriority: uPriority
            };
        }).filter(Boolean);

        return res.status(200).json({
            message: 'Workspace analytics retrieved successfully',
            analytics: {
                workspace: {
                    id: workspace._id,
                    name: workspace.name,
                    slug: workspace.slug
                },
                period: period || 'all',
                overview: {
                    totalProjects: projects.length,
                    totalTasks,
                    completedTasks,
                    pendingTasks,
                    inProgressTasks,
                    overdueTasks,
                    overallProgress,
                    activeSprints,
                    completedSprints,
                    plannedSprints,
                    totalSprints: sprints.length
                },
                distribution: {
                    byStatus,
                    byPriority,
                    byType
                },
                projectBreakdown,
                teamWorkload,
                recentActivity: activities
            }
        });
    } catch (error) {
        console.error('Error fetching workspace analytics:', error);
        return res.status(500).json({ message: 'Internal server error while fetching workspace analytics' });
    }
});

/**
 * GET /api/analytics/projects/:projectId
 * Comprehensive project-level analytics & issue completion trends
 */
router.get('/projects/:projectId', authMiddleware, async (req, res) => {
    try {
        const { projectId } = req.params;
        const userId = req.userId;
        const { period, startDate, endDate } = req.query;

        if (!isValidObjectId(projectId)) {
            return res.status(400).json({ message: 'Invalid project ID format' });
        }

        const project = await projectModel.findById(projectId).populate('lead', 'name email avatar');
        if (!project) {
            return res.status(404).json({ message: 'Project not found' });
        }

        const workspace = await workspaceModel.findById(project.workspace).populate('members.user', 'name email avatar');
        if (!workspace || !isWorkspaceMember(workspace, userId)) {
            return res.status(403).json({ message: 'You are not authorized to view analytics for this project' });
        }

        const dateRange = getDateRangeFilter(period, startDate, endDate);
        const taskQuery = { project: project._id };
        if (dateRange) {
            taskQuery.createdAt = dateRange;
        }

        const now = new Date();

        // 1. Fetch project tasks
        const tasks = await taskModel.find(taskQuery)
            .populate('assignee', 'name email avatar')
            .populate('reporter', 'name email avatar')
            .populate('sprint', 'name status');

        // 2. Fetch project sprints
        const sprints = await sprintModel.find({ project: project._id }).sort({ order: 1, createdAt: -1 });

        // Compute Task Metrics
        const totalTasks = tasks.length;
        let completedTasks = 0;
        let incompleteTasks = 0;
        let inProgressTasks = 0;
        let overdueTasks = 0;

        const byStatus = { 'To Do': 0, 'In Progress': 0, 'Code Review': 0, 'Done': 0 };
        const byPriority = { Lowest: 0, Low: 0, Medium: 0, High: 0, Highest: 0 };
        const byType = { Task: 0, Bug: 0, Story: 0, Epic: 0 };

        tasks.forEach((t) => {
            if (t.status === 'Done') {
                completedTasks++;
                byStatus['Done'] = (byStatus['Done'] || 0) + 1;
            } else {
                incompleteTasks++;
                if (t.status === 'To Do') {
                    byStatus['To Do'] = (byStatus['To Do'] || 0) + 1;
                } else {
                    inProgressTasks++;
                    if (t.status === 'Code Review' || t.status === 'In Review') {
                        byStatus['Code Review'] = (byStatus['Code Review'] || 0) + 1;
                    } else {
                        byStatus['In Progress'] = (byStatus['In Progress'] || 0) + 1;
                    }
                }
            }

            if (t.dueDate && new Date(t.dueDate) < now && t.status !== 'Done') {
                overdueTasks++;
            }

            if (byPriority[t.priority] !== undefined) byPriority[t.priority]++;
            else byPriority[t.priority] = 1;

            if (byType[t.type] !== undefined) byType[t.type]++;
            else byType[t.type] = 1;
        });

        const completionPercentage = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0;

        // Recently created (latest 5)
        const recentlyCreated = [...tasks]
            .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
            .slice(0, 5)
            .map((t) => ({
                id: t._id,
                issueKey: t.issueKey,
                title: t.title,
                type: t.type,
                status: t.status,
                priority: t.priority,
                createdAt: t.createdAt
            }));

        // Recently updated (latest 5)
        const recentlyUpdated = [...tasks]
            .sort((a, b) => new Date(b.updatedAt) - new Date(a.updatedAt))
            .slice(0, 5)
            .map((t) => ({
                id: t._id,
                issueKey: t.issueKey,
                title: t.title,
                type: t.type,
                status: t.status,
                priority: t.priority,
                updatedAt: t.updatedAt
            }));

        // Completion trend over time (real completion dates from updatedAt of Done tasks)
        // Group by day for the past 14 days
        const daysCount = 14;
        const trendData = [];
        for (let i = daysCount - 1; i >= 0; i--) {
            const d = new Date(now.getFullYear(), now.getMonth(), now.getDate() - i);
            const dateStr = d.toISOString().split('T')[0];
            const nextD = new Date(d.getTime() + 24 * 60 * 60 * 1000);

            const completedOnDay = tasks.filter((t) => {
                if (t.status !== 'Done') return false;
                const updated = new Date(t.updatedAt);
                return updated >= d && updated < nextD;
            }).length;

            const createdOnDay = tasks.filter((t) => {
                const created = new Date(t.createdAt);
                return created >= d && created < nextD;
            }).length;

            trendData.push({
                date: dateStr,
                label: d.toLocaleDateString(undefined, { month: 'short', day: 'numeric' }),
                completed: completedOnDay,
                created: createdOnDay
            });
        }

        // Assignee Workload Distribution for this Project
        const assigneeMap = {};
        tasks.forEach((t) => {
            const key = t.assignee ? t.assignee._id.toString() : 'unassigned';
            const name = t.assignee ? t.assignee.name : 'Unassigned';
            const avatar = t.assignee ? t.assignee.avatar : '';

            if (!assigneeMap[key]) {
                assigneeMap[key] = {
                    id: key,
                    name,
                    avatar,
                    total: 0,
                    completed: 0,
                    inProgress: 0,
                    pending: 0,
                    overdue: 0
                };
            }

            assigneeMap[key].total++;
            if (t.status === 'Done') assigneeMap[key].completed++;
            else if (t.status === 'To Do') assigneeMap[key].pending++;
            else assigneeMap[key].inProgress++;

            if (t.dueDate && new Date(t.dueDate) < now && t.status !== 'Done') {
                assigneeMap[key].overdue++;
            }
        });

        const assigneeDistribution = Object.values(assigneeMap).map((a) => ({
            ...a,
            share: totalTasks > 0 ? Math.round((a.total / totalTasks) * 100) : 0
        }));

        return res.status(200).json({
            message: 'Project analytics retrieved successfully',
            analytics: {
                project: {
                    id: project._id,
                    name: project.name,
                    key: project.key,
                    lead: project.lead
                },
                overview: {
                    totalTasks,
                    completedTasks,
                    incompleteTasks,
                    inProgressTasks,
                    overdueTasks,
                    completionPercentage
                },
                distribution: {
                    byStatus,
                    byPriority,
                    byType
                },
                recentlyCreated,
                recentlyUpdated,
                completionTrend: trendData,
                assigneeDistribution,
                sprintsSummary: {
                    total: sprints.length,
                    active: sprints.filter((s) => s.status === 'Active').length,
                    completed: sprints.filter((s) => s.status === 'Completed').length,
                    planned: sprints.filter((s) => s.status === 'Planned').length
                }
            }
        });
    } catch (error) {
        console.error('Error fetching project analytics:', error);
        return res.status(500).json({ message: 'Internal server error while fetching project analytics' });
    }
});

/**
 * GET /api/analytics/sprints/:sprintId
 * Detailed sprint report with actual burndown data
 */
router.get('/sprints/:sprintId', authMiddleware, async (req, res) => {
    try {
        const { sprintId } = req.params;
        const userId = req.userId;

        if (!isValidObjectId(sprintId)) {
            return res.status(400).json({ message: 'Invalid sprint ID format' });
        }

        const sprint = await sprintModel.findById(sprintId)
            .populate('project', 'name key workspace')
            .populate('createdBy', 'name email avatar');

        if (!sprint) {
            return res.status(404).json({ message: 'Sprint not found' });
        }

        const workspace = await workspaceModel.findById(sprint.workspace);
        if (!workspace || !isWorkspaceMember(workspace, userId)) {
            return res.status(403).json({ message: 'You are not authorized to view this sprint report' });
        }

        // Fetch all tasks associated with this sprint
        const tasks = await taskModel.find({ sprint: sprint._id })
            .populate('assignee', 'name email avatar')
            .sort({ status: 1, priority: -1 });

        const totalIssues = tasks.length;
        const completedIssues = tasks.filter((t) => t.status === 'Done').length;
        const incompleteIssues = totalIssues - completedIssues;

        const totalStoryPoints = tasks.reduce((sum, t) => sum + (t.storyPoints || 0), 0);
        const completedStoryPoints = tasks
            .filter((t) => t.status === 'Done')
            .reduce((sum, t) => sum + (t.storyPoints || 0), 0);
        const remainingStoryPoints = Math.max(0, totalStoryPoints - completedStoryPoints);

        const completionPercentage = totalStoryPoints > 0
            ? Math.round((completedStoryPoints / totalStoryPoints) * 100)
            : (totalIssues > 0 ? Math.round((completedIssues / totalIssues) * 100) : 0);

        // Distributions
        const byStatus = {};
        const byPriority = {};
        const byType = {};

        tasks.forEach((t) => {
            byStatus[t.status] = (byStatus[t.status] || 0) + 1;
            byPriority[t.priority] = (byPriority[t.priority] || 0) + 1;
            byType[t.type] = (byType[t.type] || 0) + 1;
        });

        // Sprint History / Events from Activity Log
        const sprintActivities = await activityModel.find({ sprint: sprint._id })
            .populate('actor', 'name email avatar')
            .sort({ createdAt: -1 })
            .limit(15);

        // Sprint Burndown Calculation (Real data only)
        let burndown = {
            hasBurndown: false,
            reason: ''
        };

        if (sprint.status === 'Planned') {
            burndown = {
                hasBurndown: false,
                reason: 'Sprint has not started yet. Burndown tracking begins when sprint is active.'
            };
        } else if (!sprint.startedAt) {
            burndown = {
                hasBurndown: false,
                reason: 'Sprint start timestamp is not available.'
            };
        } else {
            const startDate = new Date(sprint.startedAt);
            const endDate = sprint.completedAt ? new Date(sprint.completedAt) : (sprint.endDate ? new Date(sprint.endDate) : new Date(startDate.getTime() + 14 * 24 * 60 * 60 * 1000));
            const now = new Date();
            const effectiveCurrent = sprint.completedAt ? new Date(sprint.completedAt) : (now < endDate ? now : endDate);

            // Compute total sprint duration in days
            const totalDurationDays = Math.max(1, Math.ceil((endDate.getTime() - startDate.getTime()) / (24 * 60 * 60 * 1000)));
            const initialCommittedPoints = (sprint.initialCommitment?.storyPoints !== undefined && sprint.initialCommitment.storyPoints > 0)
                ? sprint.initialCommitment.storyPoints
                : totalStoryPoints;

            const daysSinceStart = Math.max(0, Math.ceil((effectiveCurrent.getTime() - startDate.getTime()) / (24 * 60 * 60 * 1000)));

            const burndownPoints = [];
            for (let dayIdx = 0; dayIdx <= totalDurationDays; dayIdx++) {
                const dayDate = new Date(startDate.getTime() + dayIdx * 24 * 60 * 60 * 1000);
                const dayEnd = new Date(dayDate.getFullYear(), dayDate.getMonth(), dayDate.getDate(), 23, 59, 59, 999);

                // Ideal line: linearly decreasing from initial committed points to 0
                const ideal = Math.max(0, Math.round(initialCommittedPoints - (initialCommittedPoints / totalDurationDays) * dayIdx));

                // Actual line: only computed up to daysSinceStart
                let actual = null;
                if (dayIdx <= daysSinceStart) {
                    // Points completed on or before dayEnd
                    const pointsCompletedByDay = tasks
                        .filter((t) => t.status === 'Done' && new Date(t.updatedAt) <= dayEnd)
                        .reduce((sum, t) => sum + (t.storyPoints || 0), 0);

                    actual = Math.max(0, totalStoryPoints - pointsCompletedByDay);
                }

                burndownPoints.push({
                    day: dayIdx,
                    date: dayDate.toISOString().split('T')[0],
                    label: dayDate.toLocaleDateString(undefined, { month: 'short', day: 'numeric' }),
                    ideal,
                    actual
                });
            }

            burndown = {
                hasBurndown: true,
                initialCommitment: sprint.initialCommitment || { issueCount: totalIssues, storyPoints: initialCommittedPoints },
                totalDurationDays,
                data: burndownPoints
            };
        }

        return res.status(200).json({
            message: 'Sprint report retrieved successfully',
            report: {
                sprint: {
                    id: sprint._id,
                    name: sprint.name,
                    goal: sprint.goal,
                    status: sprint.status,
                    startDate: sprint.startDate,
                    endDate: sprint.endDate,
                    startedAt: sprint.startedAt,
                    completedAt: sprint.completedAt,
                    sprintNumber: sprint.sprintNumber
                },
                project: sprint.project,
                commitment: {
                    originalIssues: sprint.initialCommitment?.issueCount ?? totalIssues,
                    originalStoryPoints: sprint.initialCommitment?.storyPoints ?? totalStoryPoints,
                    currentIssues: totalIssues,
                    currentStoryPoints: totalStoryPoints,
                    completedStoryPoints,
                    remainingStoryPoints,
                    completedIssues,
                    incompleteIssues,
                    completionPercentage
                },
                distributions: {
                    byStatus,
                    byPriority,
                    byType
                },
                burndown,
                history: sprintActivities,
                issues: tasks.map((t) => ({
                    id: t._id,
                    issueKey: t.issueKey,
                    title: t.title,
                    type: t.type,
                    status: t.status,
                    priority: t.priority,
                    storyPoints: t.storyPoints,
                    assignee: t.assignee ? { name: t.assignee.name, email: t.assignee.email, avatar: t.assignee.avatar } : null
                }))
            }
        });
    } catch (error) {
        console.error('Error fetching sprint report:', error);
        return res.status(500).json({ message: 'Internal server error while fetching sprint report' });
    }
});

/**
 * GET /api/analytics/workspaces/:workspaceId/team
 * Team-level workload analytics
 */
router.get('/workspaces/:workspaceId/team', authMiddleware, async (req, res) => {
    try {
        const { workspaceId } = req.params;
        const userId = req.userId;

        const isObjectId = isValidObjectId(workspaceId);
        const wsQuery = isObjectId ? { _id: workspaceId } : { slug: workspaceId };
        const workspace = await workspaceModel.findOne(wsQuery).populate('members.user', 'name email avatar');

        if (!workspace) {
            return res.status(404).json({ message: 'Workspace not found' });
        }

        if (!isWorkspaceMember(workspace, userId)) {
            return res.status(403).json({ message: 'You are not authorized to view team workload for this workspace' });
        }

        const now = new Date();
        const tasks = await taskModel.find({ workspace: workspace._id })
            .select('title issueKey status priority type assignee dueDate storyPoints')
            .populate('assignee', 'name email avatar');

        const totalTasks = tasks.length;
        const memberList = workspace.members || [];

        const teamWorkload = memberList.map((m) => {
            const u = m.user;
            if (!u) return null;
            const uId = u._id.toString();

            const userTasks = tasks.filter((t) => t.assignee && (t.assignee._id?.toString() === uId || t.assignee.toString() === uId));
            const completed = userTasks.filter((t) => t.status === 'Done').length;
            const pending = userTasks.filter((t) => t.status === 'To Do').length;
            const inProgress = userTasks.filter((t) => t.status !== 'Done' && t.status !== 'To Do').length;
            const overdue = userTasks.filter((t) => t.dueDate && new Date(t.dueDate) < now && t.status !== 'Done').length;

            const priorityCounts = { Highest: 0, High: 0, Medium: 0, Low: 0, Lowest: 0 };
            userTasks.forEach((t) => {
                if (priorityCounts[t.priority] !== undefined) priorityCounts[t.priority]++;
            });

            return {
                user: {
                    id: u._id,
                    name: u.name,
                    email: u.email,
                    avatar: u.avatar
                },
                role: m.role,
                totalAssigned: userTasks.length,
                completed,
                pending,
                inProgress,
                overdue,
                workloadShare: totalTasks > 0 ? Math.round((userTasks.length / totalTasks) * 100) : 0,
                byPriority: priorityCounts
            };
        }).filter(Boolean);

        return res.status(200).json({
            message: 'Team workload analytics retrieved successfully',
            workspace: { id: workspace._id, name: workspace.name },
            totalTasks,
            teamWorkload
        });
    } catch (error) {
        console.error('Error fetching team workload:', error);
        return res.status(500).json({ message: 'Internal server error while fetching team workload' });
    }
});

/**
 * GET /api/analytics/workspaces/:workspaceId/export
 * Export workspace data as CSV
 * Query params: type: 'tasks' | 'projects' | 'team' | 'sprints'
 */
router.get('/workspaces/:workspaceId/export', authMiddleware, async (req, res) => {
    try {
        const { workspaceId } = req.params;
        const userId = req.userId;
        const type = req.query.type || 'tasks';

        const isObjectId = isValidObjectId(workspaceId);
        const wsQuery = isObjectId ? { _id: workspaceId } : { slug: workspaceId };
        const workspace = await workspaceModel.findOne(wsQuery).populate('members.user', 'name email');

        if (!workspace) {
            return res.status(404).json({ message: 'Workspace not found' });
        }

        if (!isWorkspaceMember(workspace, userId)) {
            return res.status(403).json({ message: 'You are not authorized to export data for this workspace' });
        }

        const dateStr = new Date().toISOString().split('T')[0];
        let csvContent = '';
        let filename = `workspace-${type}-${dateStr}.csv`;

        if (type === 'projects') {
            const projects = await projectModel.find({ workspace: workspace._id }).populate('lead', 'name email');
            const headers = [
                { key: 'key', label: 'Key' },
                { key: 'name', label: 'Project Name' },
                { key: 'status', label: 'Status' },
                { key: 'priority', label: 'Priority' },
                { key: 'lead', label: 'Lead' },
                { key: 'createdAt', label: 'Created At' }
            ];
            const rows = projects.map((p) => ({
                key: p.key,
                name: p.name,
                status: p.status,
                priority: p.priority,
                lead: p.lead?.name || '',
                createdAt: p.createdAt ? new Date(p.createdAt).toISOString() : ''
            }));
            csvContent = formatCsv(headers, rows);
        } else if (type === 'team') {
            const tasks = await taskModel.find({ workspace: workspace._id }).populate('assignee', 'name email');
            const headers = [
                { key: 'name', label: 'Member Name' },
                { key: 'email', label: 'Email' },
                { key: 'role', label: 'Role' },
                { key: 'assigned', label: 'Assigned Tasks' },
                { key: 'completed', label: 'Completed Tasks' },
                { key: 'pending', label: 'Pending Tasks' },
                { key: 'overdue', label: 'Overdue Tasks' }
            ];
            const now = new Date();
            const rows = workspace.members.map((m) => {
                const u = m.user;
                if (!u) return null;
                const uTasks = tasks.filter((t) => t.assignee?._id?.toString() === u._id.toString());
                const completed = uTasks.filter((t) => t.status === 'Done').length;
                const pending = uTasks.filter((t) => t.status === 'To Do').length;
                const overdue = uTasks.filter((t) => t.dueDate && new Date(t.dueDate) < now && t.status !== 'Done').length;
                return {
                    name: u.name,
                    email: u.email,
                    role: m.role,
                    assigned: uTasks.length,
                    completed,
                    pending,
                    overdue
                };
            }).filter(Boolean);
            csvContent = formatCsv(headers, rows);
        } else if (type === 'sprints') {
            const sprints = await sprintModel.find({ workspace: workspace._id }).populate('project', 'name key');
            const headers = [
                { key: 'name', label: 'Sprint Name' },
                { key: 'project', label: 'Project' },
                { key: 'status', label: 'Status' },
                { key: 'startDate', label: 'Start Date' },
                { key: 'endDate', label: 'End Date' },
                { key: 'goal', label: 'Goal' }
            ];
            const rows = sprints.map((s) => ({
                name: s.name,
                project: s.project?.name || '',
                status: s.status,
                startDate: s.startDate ? new Date(s.startDate).toISOString().split('T')[0] : '',
                endDate: s.endDate ? new Date(s.endDate).toISOString().split('T')[0] : '',
                goal: s.goal || ''
            }));
            csvContent = formatCsv(headers, rows);
        } else {
            // Default: tasks
            const tasks = await taskModel.find({ workspace: workspace._id })
                .populate('project', 'name key')
                .populate('assignee', 'name email')
                .populate('reporter', 'name email')
                .populate('sprint', 'name')
                .sort({ createdAt: -1 });

            const headers = [
                { key: 'issueKey', label: 'Issue Key' },
                { key: 'title', label: 'Title' },
                { key: 'project', label: 'Project' },
                { key: 'type', label: 'Type' },
                { key: 'status', label: 'Status' },
                { key: 'priority', label: 'Priority' },
                { key: 'assignee', label: 'Assignee' },
                { key: 'storyPoints', label: 'Story Points' },
                { key: 'dueDate', label: 'Due Date' },
                { key: 'sprint', label: 'Sprint' },
                { key: 'createdAt', label: 'Created At' }
            ];

            const rows = tasks.map((t) => ({
                issueKey: t.issueKey,
                title: t.title,
                project: t.project?.name || '',
                type: t.type,
                status: t.status,
                priority: t.priority,
                assignee: t.assignee?.name || 'Unassigned',
                storyPoints: t.storyPoints !== null && t.storyPoints !== undefined ? t.storyPoints : '',
                dueDate: t.dueDate ? new Date(t.dueDate).toISOString().split('T')[0] : '',
                sprint: t.sprint?.name || 'Backlog',
                createdAt: t.createdAt ? new Date(t.createdAt).toISOString() : ''
            }));

            csvContent = formatCsv(headers, rows);
        }

        res.setHeader('Content-Type', 'text/csv; charset=utf-8');
        res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
        return res.status(200).send(csvContent);
    } catch (error) {
        console.error('Error exporting workspace CSV:', error);
        return res.status(500).json({ message: 'Internal server error while exporting CSV' });
    }
});

/**
 * GET /api/analytics/projects/:projectId/export
 * Export project tasks as CSV
 */
router.get('/projects/:projectId/export', authMiddleware, async (req, res) => {
    try {
        const { projectId } = req.params;
        const userId = req.userId;

        if (!isValidObjectId(projectId)) {
            return res.status(400).json({ message: 'Invalid project ID format' });
        }

        const project = await projectModel.findById(projectId);
        if (!project) {
            return res.status(404).json({ message: 'Project not found' });
        }

        const workspace = await workspaceModel.findById(project.workspace);
        if (!workspace || !isWorkspaceMember(workspace, userId)) {
            return res.status(403).json({ message: 'You are not authorized to export data for this project' });
        }

        const tasks = await taskModel.find({ project: project._id })
            .populate('assignee', 'name email')
            .populate('sprint', 'name')
            .sort({ issueKey: 1 });

        const headers = [
            { key: 'issueKey', label: 'Issue Key' },
            { key: 'title', label: 'Title' },
            { key: 'type', label: 'Type' },
            { key: 'status', label: 'Status' },
            { key: 'priority', label: 'Priority' },
            { key: 'assignee', label: 'Assignee' },
            { key: 'storyPoints', label: 'Story Points' },
            { key: 'dueDate', label: 'Due Date' },
            { key: 'sprint', label: 'Sprint' },
            { key: 'createdAt', label: 'Created Date' }
        ];

        const rows = tasks.map((t) => ({
            issueKey: t.issueKey,
            title: t.title,
            type: t.type,
            status: t.status,
            priority: t.priority,
            assignee: t.assignee?.name || 'Unassigned',
            storyPoints: t.storyPoints !== null && t.storyPoints !== undefined ? t.storyPoints : '',
            dueDate: t.dueDate ? new Date(t.dueDate).toISOString().split('T')[0] : '',
            sprint: t.sprint?.name || 'Backlog',
            createdAt: t.createdAt ? new Date(t.createdAt).toISOString() : ''
        }));

        const csvContent = formatCsv(headers, rows);
        const filename = `${project.key}-issues-${new Date().toISOString().split('T')[0]}.csv`;

        res.setHeader('Content-Type', 'text/csv; charset=utf-8');
        res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
        return res.status(200).send(csvContent);
    } catch (error) {
        console.error('Error exporting project CSV:', error);
        return res.status(500).json({ message: 'Internal server error while exporting CSV' });
    }
});

module.exports = router;

