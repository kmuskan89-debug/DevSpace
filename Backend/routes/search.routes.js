const express = require('express');
const router = express.Router();
const mongoose = require('mongoose');

const taskModel = require('../models/task.model');
const projectModel = require('../models/project.model');
const workspaceModel = require('../models/workspace.model');
const authMiddleware = require('../middleware/auth.middleware');
const { isWorkspaceMember } = require('../middleware/workspaceAuth');

const isValidObjectId = (id) => mongoose.Types.ObjectId.isValid(id);

/**
 * Escape special regex characters to avoid regex injection
 */
const escapeRegex = (str) => {
    return str.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
};

/**
 * GET /api/search
 * Global search across tasks and projects
 * Query params:
 *   q: search term (required)
 *   workspaceId: optional scope to specific workspace
 *   limit: max results per category (default: 15)
 */
router.get(
    '/',
    authMiddleware,
    async (req, res) => {
        try {
            const userId = req.userId;
            const queryText = (req.query.q || '').trim();
            const { workspaceId } = req.query;
            const limit = Math.min(50, Math.max(1, parseInt(req.query.limit, 10) || 15));

            if (!queryText) {
                return res.status(200).json({
                    query: '',
                    results: {
                        tasks: [],
                        projects: []
                    },
                    counts: {
                        tasks: 0,
                        projects: 0,
                        total: 0
                    }
                });
            }

            // Determine authorized workspaces
            let authorizedWorkspaceIds = [];

            if (workspaceId) {
                if (!isValidObjectId(workspaceId)) {
                    return res.status(400).json({ message: 'Invalid workspace ID format' });
                }
                const ws = await workspaceModel.findById(workspaceId);
                if (!ws || !isWorkspaceMember(ws, userId)) {
                    return res.status(403).json({ message: 'You are not authorized to search this workspace' });
                }
                authorizedWorkspaceIds = [ws._id];
            } else {
                const workspaces = await workspaceModel.find({
                    $or: [
                        { owner: userId },
                        { 'members.user': userId }
                    ]
                }).select('_id');
                authorizedWorkspaceIds = workspaces.map((w) => w._id);
            }

            if (authorizedWorkspaceIds.length === 0) {
                return res.status(200).json({
                    query: queryText,
                    results: {
                        tasks: [],
                        projects: []
                    },
                    counts: {
                        tasks: 0,
                        projects: 0,
                        total: 0
                    }
                });
            }

            const cleanQ = escapeRegex(queryText);
            const searchRegex = new RegExp(cleanQ, 'i');
            const upperQ = queryText.toUpperCase();

            // 1. Search Projects
            const projectQuery = {
                workspace: { $in: authorizedWorkspaceIds },
                $or: [
                    { key: upperQ },
                    { name: searchRegex },
                    { description: searchRegex },
                    { techStack: searchRegex }
                ]
            };

            const projectsPromise = projectModel.find(projectQuery)
                .populate('workspace', 'name slug color icon')
                .populate('lead', 'name email avatar')
                .sort({ updatedAt: -1 })
                .limit(limit);

            // 2. Search Tasks / Issues
            const taskQuery = {
                workspace: { $in: authorizedWorkspaceIds },
                $or: [
                    { issueKey: upperQ },
                    { issueKey: searchRegex },
                    { title: searchRegex },
                    { description: searchRegex },
                    { labels: searchRegex }
                ]
            };

            const tasksPromise = taskModel.find(taskQuery)
                .populate('project', 'name key lead')
                .populate('workspace', 'name slug')
                .populate('sprint', 'name status')
                .populate('assignee', 'name email avatar')
                .populate('reporter', 'name email avatar')
                .sort({ updatedAt: -1 })
                .limit(limit);

            const [projects, tasks] = await Promise.all([projectsPromise, tasksPromise]);

            // Prioritize exact issueKey or project key matches at the top of their lists
            const sortedProjects = [...projects].sort((a, b) => {
                if (a.key === upperQ) return -1;
                if (b.key === upperQ) return 1;
                return 0;
            });

            const sortedTasks = [...tasks].sort((a, b) => {
                if (a.issueKey === upperQ) return -1;
                if (b.issueKey === upperQ) return 1;
                return 0;
            });

            return res.status(200).json({
                query: queryText,
                results: {
                    projects: sortedProjects,
                    tasks: sortedTasks
                },
                counts: {
                    projects: sortedProjects.length,
                    tasks: sortedTasks.length,
                    total: sortedProjects.length + sortedTasks.length
                }
            });
        } catch (error) {
            console.error('Error during global search:', error);
            return res.status(500).json({
                message: 'Internal server error while searching'
            });
        }
    }
);

module.exports = router;

