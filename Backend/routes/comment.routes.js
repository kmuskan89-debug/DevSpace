const express = require('express');
const router = express.Router({ mergeParams: true });
const mongoose = require('mongoose');
const { body } = require('express-validator');

const commentModel = require('../models/comment.model');
const taskModel = require('../models/task.model');
const workspaceModel = require('../models/workspace.model');
const authMiddleware = require('../middleware/auth.middleware');
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
 * GET /api/tasks/:taskId/comments
 * List all comments for a task
 */
router.get('/', authMiddleware, async (req, res) => {
    try {
        const userId = req.userId;
        const { taskId } = req.params;

        const taskQuery = isValidObjectId(taskId) ? { _id: taskId } : { issueKey: taskId.toUpperCase() };
        const task = await taskModel.findOne(taskQuery);

        if (!task) {
            return res.status(404).json({ message: 'Task not found' });
        }

        const workspace = await workspaceModel.findById(task.workspace);
        if (!workspace || !isWorkspaceMember(workspace, userId)) {
            return res.status(403).json({
                message: 'You are not authorized to view comments on this task'
            });
        }

        const comments = await commentModel.find({ task: task._id })
            .populate('author', 'name email avatar')
            .sort({ createdAt: 1 });

        return res.status(200).json({
            message: 'Comments fetched successfully',
            count: comments.length,
            comments
        });
    } catch (error) {
        console.error('Error fetching task comments:', error);
        return res.status(500).json({
            message: 'Internal server error while fetching comments'
        });
    }
});

/**
 * POST /api/tasks/:taskId/comments
 * Add a new comment to a task
 */
router.post(
    '/',
    authMiddleware,
    [
        body('content')
            .trim()
            .isLength({ min: 1, max: 5000 })
            .withMessage('Comment content must be between 1 and 5000 characters'),
        handleValidationErrors
    ],
    async (req, res) => {
        try {
            const userId = req.userId;
            const { taskId } = req.params;
            const { content } = req.body;

            const taskQuery = isValidObjectId(taskId) ? { _id: taskId } : { issueKey: taskId.toUpperCase() };
            const task = await taskModel.findOne(taskQuery).populate('project', 'name key lead');

            if (!task) {
                return res.status(404).json({ message: 'Task not found' });
            }

            const workspace = await workspaceModel.findById(task.workspace);
            if (!workspace || !isWorkspaceMember(workspace, userId)) {
                return res.status(403).json({
                    message: 'You are not authorized to access this workspace'
                });
            }

            // Viewers have read-only access and cannot comment
            if (!isWorkspaceWriter(workspace, userId)) {
                return res.status(403).json({
                    message: 'Workspace Viewers have read-only access and cannot post comments'
                });
            }

            const comment = await commentModel.create({
                task: task._id,
                project: task.project._id,
                workspace: task.workspace,
                author: userId,
                content: content.trim()
            });

            const populatedComment = await commentModel.findById(comment._id)
                .populate('author', 'name email avatar');

            // Log activity
            await logActivity({
                workspaceId: task.workspace,
                projectId: task.project._id,
                taskId: task._id,
                actorId: userId,
                action: 'COMMENT_ADDED',
                resourceType: 'Comment',
                details: {
                    taskTitle: task.title,
                    issueKey: task.issueKey,
                    commentSnippet: content.slice(0, 100)
                }
            });

            // Notify Assignee and Reporter if they are not the commenter
            const recipientsToNotify = new Set();
            if (task.assignee && task.assignee.toString() !== userId.toString()) {
                recipientsToNotify.add(task.assignee.toString());
            }
            if (task.reporter && task.reporter.toString() !== userId.toString()) {
                recipientsToNotify.add(task.reporter.toString());
            }

            for (const recipientId of recipientsToNotify) {
                await createNotification({
                    recipientId,
                    senderId: userId,
                    workspaceId: task.workspace,
                    type: 'COMMENT_ADDED',
                    title: `New Comment on ${task.issueKey}`,
                    message: `${populatedComment.author?.name || 'Someone'} commented: "${content.slice(0, 80)}..."`,
                    link: `/workspace/${workspace.slug || workspace._id}/projects/${task.project._id}/board`
                });
            }

            return res.status(201).json({
                message: 'Comment added successfully',
                comment: populatedComment
            });
        } catch (error) {
            console.error('Error adding comment:', error);
            return res.status(500).json({
                message: 'Internal server error while adding comment'
            });
        }
    }
);

/**
 * PUT /api/tasks/:taskId/comments/:commentId
 * Edit an existing comment (author only)
 */
router.put(
    '/:commentId',
    authMiddleware,
    [
        body('content')
            .trim()
            .isLength({ min: 1, max: 5000 })
            .withMessage('Comment content must be between 1 and 5000 characters'),
        handleValidationErrors
    ],
    async (req, res) => {
        try {
            const userId = req.userId;
            const { commentId } = req.params;
            const { content } = req.body;

            if (!isValidObjectId(commentId)) {
                return res.status(400).json({ message: 'Invalid comment ID format' });
            }

            const comment = await commentModel.findById(commentId);
            if (!comment) {
                return res.status(404).json({ message: 'Comment not found' });
            }

            // Only author can edit their comment
            if (comment.author.toString() !== userId.toString()) {
                return res.status(403).json({
                    message: 'You can only edit your own comments'
                });
            }

            comment.content = content.trim();
            comment.edited = true;
            comment.editedAt = new Date();
            await comment.save();

            const updatedComment = await commentModel.findById(comment._id)
                .populate('author', 'name email avatar');

            return res.status(200).json({
                message: 'Comment updated successfully',
                comment: updatedComment
            });
        } catch (error) {
            console.error('Error updating comment:', error);
            return res.status(500).json({
                message: 'Internal server error while updating comment'
            });
        }
    }
);

/**
 * DELETE /api/tasks/:taskId/comments/:commentId
 * Delete a comment (Author, Project Lead, Workspace Admin, Workspace Owner)
 */
router.delete('/:commentId', authMiddleware, async (req, res) => {
    try {
        const userId = req.userId;
        const { commentId } = req.params;

        if (!isValidObjectId(commentId)) {
            return res.status(400).json({ message: 'Invalid comment ID format' });
        }

        const comment = await commentModel.findById(commentId)
            .populate('task', 'title issueKey project')
            .populate('project', 'lead');

        if (!comment) {
            return res.status(404).json({ message: 'Comment not found' });
        }

        const workspace = await workspaceModel.findById(comment.workspace);
        if (!workspace) {
            return res.status(404).json({ message: 'Workspace not found' });
        }

        // Authorization: Author, Project Lead, Workspace Admin, or Workspace Owner
        const isAuthor = comment.author.toString() === userId.toString();
        const isLead = comment.project?.lead?.toString() === userId.toString();
        const isAdminOrOwner = isWorkspaceAdminOrOwner(workspace, userId);

        if (!isAuthor && !isLead && !isAdminOrOwner) {
            return res.status(403).json({
                message: 'You are not authorized to delete this comment'
            });
        }

        await commentModel.findByIdAndDelete(comment._id);

        return res.status(200).json({
            message: 'Comment deleted successfully',
            deletedCommentId: comment._id
        });
    } catch (error) {
        console.error('Error deleting comment:', error);
        return res.status(500).json({
            message: 'Internal server error while deleting comment'
        });
    }
});

module.exports = router;

