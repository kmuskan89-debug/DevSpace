const activityModel = require('../models/activity.model');

/**
 * Safely records an audit activity log entry
 */
const logActivity = async ({
    workspaceId,
    projectId = null,
    taskId = null,
    actorId,
    action,
    resourceType,
    details = {}
}) => {
    try {
        if (!workspaceId || !actorId || !action || !resourceType) {
            return null;
        }

        return await activityModel.create({
            workspace: workspaceId,
            project: projectId,
            task: taskId,
            actor: actorId,
            action,
            resourceType,
            details
        });
    } catch (err) {
        console.error('Failed to log activity record:', err);
        return null;
    }
};

module.exports = { logActivity };

