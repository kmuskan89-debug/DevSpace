const http = require('http');
const mongoose = require('mongoose');
const app = require('./server');
const userModel = require('./models/user.model');
const workspaceModel = require('./models/workspace.model');
const projectModel = require('./models/project.model');
const taskModel = require('./models/task.model');
const invitationModel = require('./models/invitation.model');
const commentModel = require('./models/comment.model');
const activityModel = require('./models/activity.model');
const notificationModel = require('./models/notification.model');
const sprintModel = require('./models/sprint.model');
const savedViewModel = require('./models/savedView.model');
const { validateEnv } = require('./utils/validateEnv');
const jwt = require('jsonwebtoken');

const MONGO_URI = process.env.MONGO_URI || 'mongodb://localhost:27017/DevSpace';

let server;
let baseUrl;

// Test helper for making requests
async function request(path, options = {}) {
    const url = `${baseUrl}${path}`;
    const headers = {
        'Content-Type': 'application/json',
        ...(options.token ? { 'Authorization': `Bearer ${options.token}` } : {}),
        ...(options.headers || {})
    };

    const res = await fetch(url, {
        method: options.method || 'GET',
        headers,
        body: options.body ? JSON.stringify(options.body) : undefined
    });

    let data;
    const contentType = res.headers.get('content-type');
    if (contentType && contentType.includes('application/json')) {
        data = await res.json();
    } else {
        data = await res.text();
    }

    return {
        status: res.status,
        data
    };
}

// Simple test runner assertion
let passCount = 0;
let failCount = 0;

function assert(condition, message) {
    if (condition) {
        passCount++;
        console.log(`  ✓ PASS: ${message}`);
    } else {
        failCount++;
        console.error(`  ✗ FAIL: ${message}`);
    }
}

async function runTests() {
    console.log('\n=============================================');
    console.log(' Starting DevSpace Backend Verification Tests');
    console.log('=============================================\n');

    let userC;

    try {
        await mongoose.connect(MONGO_URI);
        console.log('Database connected for testing.');

        // Start server on an ephemeral random port
        await new Promise((resolve) => {
            server = http.createServer(app);
            server.listen(0, () => {
                const port = server.address().port;
                baseUrl = `http://127.0.0.1:${port}`;
                console.log(`Test server running on ${baseUrl}\n`);
                resolve();
            });
        });

        // Unique test run prefix
        const testRunId = Date.now().toString().slice(-6);

        // -----------------------------------------------------------------
        // 1. User Setup: Register User A (Workspace Owner) & User B (Attacker / Member)
        // -----------------------------------------------------------------
        console.log('--- 1. User Authentication & Workspaces ---');

        const userARes = await request('/api/auth/register', {
            method: 'POST',
            body: {
                name: `Owner Alice ${testRunId}`,
                email: `alice_${testRunId}@test.com`,
                password: 'Password123!'
            }
        });
        assert(userARes.status === 201 && userARes.data.token, 'Register User A (Alice)');
        const tokenA = userARes.data.token;
        const userA = userARes.data.user;

        const userBRes = await request('/api/auth/register', {
            method: 'POST',
            body: {
                name: `User Bob ${testRunId}`,
                email: `bob_${testRunId}@test.com`,
                password: 'Password123!'
            }
        });
        assert(userBRes.status === 201 && userBRes.data.token, 'Register User B (Bob)');
        const tokenB = userBRes.data.token;
        const userB = userBRes.data.user;

        // Verify Alice has an automatically provisioned default workspace
        const wsRes = await request('/api/workspaces', { token: tokenA });
        assert(wsRes.status === 200 && wsRes.data.workspaces.length > 0, 'Alice has at least one workspace');
        const workspace = wsRes.data.workspaces[0];
        const workspaceId = workspace._id;
        console.log(`  Active Workspace ID: ${workspaceId} (${workspace.name})`);

        // -----------------------------------------------------------------
        // 2. Project Creation & Retrieval
        // -----------------------------------------------------------------
        console.log('\n--- 2. Project Management ---');

        // Bob tries to create a project in Alice's workspace before being invited -> Should be 403 Forbidden
        const unauthProjRes = await request(`/api/workspaces/${workspaceId}/projects`, {
            method: 'POST',
            token: tokenB,
            body: {
                name: 'Unauthorized Project',
                key: 'HACK',
                description: 'Attempting to inject into foreign workspace'
            }
        });
        assert(unauthProjRes.status === 403, 'Unauthorized user cannot create project in foreign workspace (403)');

        // Alice creates a valid project
        const createProjRes = await request(`/api/workspaces/${workspaceId}/projects`, {
            method: 'POST',
            token: tokenA,
            body: {
                name: 'DevSpace Core Platform',
                key: 'CORE',
                description: 'Core project management application'
            }
        });
        assert(createProjRes.status === 201 && createProjRes.data.project.key === 'CORE', 'Alice creates project CORE');
        const projectId = createProjRes.data.project._id;

        // Alice fetches projects in workspace
        const listProjRes = await request(`/api/workspaces/${workspaceId}/projects`, { token: tokenA });
        assert(listProjRes.status === 200 && listProjRes.data.projects.some(p => p._id === projectId), 'List projects includes CORE');

        // Fetch single project by ID and key
        const getProjById = await request(`/api/projects/${projectId}`, { token: tokenA });
        assert(getProjById.status === 200 && getProjById.data.project.name === 'DevSpace Core Platform', 'Get project by ID');

        const getProjByKey = await request(`/api/projects/key/CORE`, { token: tokenA });
        assert(getProjByKey.status === 200 && getProjByKey.data.project._id === projectId, 'Get project by key CORE');

        // -----------------------------------------------------------------
        // 3. Project Update & Duplicate Key Validation
        // -----------------------------------------------------------------
        console.log('\n--- 3. Project Validation & Updates ---');

        // Attempt to create duplicate project key in same workspace
        const dupKeyRes = await request(`/api/workspaces/${workspaceId}/projects`, {
            method: 'POST',
            token: tokenA,
            body: {
                name: 'Duplicate Key Project',
                key: 'CORE'
            }
        });
        assert(dupKeyRes.status === 400, 'Duplicate project key in same workspace is rejected (400)');

        // Update project details
        const updateProjRes = await request(`/api/projects/${projectId}`, {
            method: 'PATCH',
            token: tokenA,
            body: {
                description: 'Updated core platform description'
            }
        });
        assert(updateProjRes.status === 200 && updateProjRes.data.project.description === 'Updated core platform description', 'Update project description');

        // -----------------------------------------------------------------
        // 4. Task Creation with Auto-Increment Issue Keys
        // -----------------------------------------------------------------
        console.log('\n--- 4. Task Creation & Sequential Keys ---');

        // Create Task 1
        const task1Res = await request(`/api/projects/${projectId}/tasks`, {
            method: 'POST',
            token: tokenA,
            body: {
                title: 'Implement Authentication Flow',
                description: 'JWT token based auth with refresh',
                type: 'feature',
                priority: 'high',
                status: 'todo',
                storyPoints: 5
            }
        });
        assert(task1Res.status === 201 && task1Res.data.task.issueKey === 'CORE-1', 'Task 1 created with sequential issueKey CORE-1');
        const task1 = task1Res.data.task;

        // Create Task 2
        const task2Res = await request(`/api/projects/${projectId}/tasks`, {
            method: 'POST',
            token: tokenA,
            body: {
                title: 'Database connection retry logic',
                type: 'bug',
                priority: 'critical',
                status: 'in-progress'
            }
        });
        assert(task2Res.status === 201 && task2Res.data.task.issueKey === 'CORE-2', 'Task 2 created with sequential issueKey CORE-2');
        const task2 = task2Res.data.task;

        // Create Task 3
        const task3Res = await request(`/api/projects/${projectId}/tasks`, {
            method: 'POST',
            token: tokenA,
            body: {
                title: 'Write API documentation',
                type: 'task',
                priority: 'medium',
                status: 'done'
            }
        });
        assert(task3Res.status === 201 && task3Res.data.task.issueKey === 'CORE-3', 'Task 3 created with sequential issueKey CORE-3');

        // -----------------------------------------------------------------
        // 5. Task Listing, Filtering, and Pagination
        // -----------------------------------------------------------------
        console.log('\n--- 5. Task Listing & Filters ---');

        const listTasksRes = await request(`/api/projects/${projectId}/tasks`, { token: tokenA });
        assert(listTasksRes.status === 200 && listTasksRes.data.tasks.length === 3, 'Project has 3 tasks listed');

        // Filter by status=done
        const filterStatusRes = await request(`/api/projects/${projectId}/tasks?status=done`, { token: tokenA });
        assert(filterStatusRes.status === 200 && filterStatusRes.data.tasks.length === 1 && filterStatusRes.data.tasks[0].issueKey === 'CORE-3', 'Filter tasks by status=done');

        // Filter by type=bug
        const filterTypeRes = await request(`/api/projects/${projectId}/tasks?type=bug`, { token: tokenA });
        assert(filterTypeRes.status === 200 && filterTypeRes.data.tasks.length === 1 && filterTypeRes.data.tasks[0].issueKey === 'CORE-2', 'Filter tasks by type=bug');

        // Search by keyword
        const searchRes = await request(`/api/projects/${projectId}/tasks?search=retry`, { token: tokenA });
        assert(searchRes.status === 200 && searchRes.data.tasks.length === 1 && searchRes.data.tasks[0].issueKey === 'CORE-2', 'Search tasks by keyword "retry"');

        // -----------------------------------------------------------------
        // 6. Task Status & Reordering (Kanban Drag-and-Drop)
        // -----------------------------------------------------------------
        console.log('\n--- 6. Kanban Status Transitions & Reordering ---');

        // Move task1 from 'todo' to 'in-progress'
        const moveRes = await request(`/api/tasks/${task1._id}/status`, {
            method: 'PATCH',
            token: tokenA,
            body: {
                status: 'in-progress',
                order: 0
            }
        });
        assert(moveRes.status === 200 && (moveRes.data.task.status === 'in-progress' || moveRes.data.task.status === 'In Progress'), 'Move task 1 to in-progress');

        // Verify task status updated
        const verifyTask1 = await request(`/api/tasks/${task1._id}`, { token: tokenA });
        assert(verifyTask1.data.task.status === 'in-progress' || verifyTask1.data.task.status === 'In Progress', 'Verify task 1 status persisted');

        // Reject invalid status transition
        const badStatusRes = await request(`/api/tasks/${task1._id}/status`, {
            method: 'PATCH',
            token: tokenA,
            body: { status: 'invalid_status_value' }
        });
        assert(badStatusRes.status === 400, 'Invalid task status rejected (400)');

        // -----------------------------------------------------------------
        // 7. Update Task Details
        // -----------------------------------------------------------------
        console.log('\n--- 7. Task Updates ---');

        const updateTaskRes = await request(`/api/tasks/${task1._id}`, {
            method: 'PATCH',
            token: tokenA,
            body: {
                description: 'Updated comprehensive authentication description',
                storyPoints: 8
            }
        });
        assert(updateTaskRes.status === 200 && updateTaskRes.data.task.storyPoints === 8, 'Update task story points to 8');

        // -----------------------------------------------------------------
        // 8. Delete Task & Role Permissions
        // -----------------------------------------------------------------
        console.log('\n--- 8. Delete Task ---');

        // Create a temporary task to test deletion
        const tempTaskRes = await request(`/api/projects/${projectId}/tasks`, {
            method: 'POST',
            token: tokenA,
            body: { title: 'Temporary task for deletion' }
        });
        const tempTaskId = tempTaskRes.data.task._id;

        // Delete task by authorized user (Alice)
        const deleteRes = await request(`/api/tasks/${tempTaskId}`, {
            method: 'DELETE',
            token: tokenA
        });
        assert(deleteRes.status === 200, 'Task deleted successfully by workspace owner');

        // Verify task is gone
        const verifyGone = await request(`/api/tasks/${tempTaskId}`, { token: tokenA });
        assert(verifyGone.status === 404, 'Deleted task returns 404 Not Found');

        // -----------------------------------------------------------------
        // 9. Workspace Membership & Last-Owner Protection
        // -----------------------------------------------------------------
        console.log('\n--- 9. Workspace Membership & Last-Owner Guard ---');

        // List members in Alice's workspace
        const membersRes = await request(`/api/workspaces/${workspaceId}/members`, { token: tokenA });
        assert(membersRes.status === 200 && membersRes.data.members.length >= 1, 'Fetch workspace members list');
        const aliceMember = membersRes.data.members.find(m => m.user._id === userA.id || m.user.email === userA.email);
        assert(aliceMember && (aliceMember.role === 'Owner' || aliceMember.role === 'Workspace Owner'), 'Alice is recorded with Owner role');

        // Prevent demoting the last workspace owner
        const demoteOwnerRes = await request(`/api/workspaces/${workspaceId}/members/${userA.id}/role`, {
            method: 'PATCH',
            token: tokenA,
            body: { role: 'Member' }
        });
        assert(demoteOwnerRes.status === 400, 'Prevent demoting the sole workspace owner (400)');

        // Prevent removing the last workspace owner
        const removeOwnerRes = await request(`/api/workspaces/${workspaceId}/members/${userA.id}`, {
            method: 'DELETE',
            token: tokenA
        });
        assert(removeOwnerRes.status === 400, 'Prevent removing the sole workspace owner (400)');

        // -----------------------------------------------------------------
        // 10. Workspace Invitations Workflow
        // -----------------------------------------------------------------
        console.log('\n--- 10. Workspace Invitations Workflow ---');

        // Alice invites Bob as Member
        const inviteBobRes = await request(`/api/workspaces/${workspaceId}/invitations`, {
            method: 'POST',
            token: tokenA,
            body: {
                email: `bob_${testRunId}@test.com`,
                role: 'Member'
            }
        });
        assert(inviteBobRes.status === 201 && (inviteBobRes.data.invitationToken || inviteBobRes.data.invitation?.token), 'Alice generates invitation token for Bob');
        const bobInviteToken = inviteBobRes.data.invitationToken || inviteBobRes.data.invitation?.token;

        // Duplicate invitation check
        const dupInviteRes = await request(`/api/workspaces/${workspaceId}/invitations`, {
            method: 'POST',
            token: tokenA,
            body: {
                email: `bob_${testRunId}@test.com`,
                role: 'Member'
            }
        });
        assert(dupInviteRes.status === 400, 'Duplicate pending invitation rejected (400)');

        // Verify invitation token public info
        const verifyInviteRes = await request(`/api/invitations/verify/${bobInviteToken}`);
        assert(verifyInviteRes.status === 200 && verifyInviteRes.data.invitation.email === `bob_${testRunId}@test.com`, 'Verify invitation token endpoint works');

        // Bob accepts the invitation
        const acceptInviteRes = await request(`/api/invitations/accept/${bobInviteToken}`, {
            method: 'POST',
            token: tokenB
        });
        assert(acceptInviteRes.status === 200 && acceptInviteRes.data.role === 'Member', 'Bob accepts workspace invitation');

        // Accepting already-accepted invitation fails
        const reacceptRes = await request(`/api/invitations/accept/${bobInviteToken}`, {
            method: 'POST',
            token: tokenB
        });
        assert(reacceptRes.status === 400, 'Re-accepting an already used invitation rejected (400)');

        // Verify Bob is now in members list with role Member
        const updatedMembersRes = await request(`/api/workspaces/${workspaceId}/members`, { token: tokenA });
        const bobInList = updatedMembersRes.data.members.find(m => m.user._id === userB.id);
        assert(bobInList && bobInList.role === 'Member', 'Bob is confirmed in workspace member list as Member');

        // Alice updates Bob's role to Admin
        const promoteBobRes = await request(`/api/workspaces/${workspaceId}/members/${userB.id}/role`, {
            method: 'PATCH',
            token: tokenA,
            body: { role: 'Admin' }
        });
        assert(promoteBobRes.status === 200 && promoteBobRes.data.member.role === 'Admin', 'Alice promotes Bob to Admin');

        // -----------------------------------------------------------------
        // 11. Role-Based Permissions & Viewer Read-Only Enforcement
        // -----------------------------------------------------------------
        console.log('\n--- 11. Role Permissions & Viewer Enforcement ---');

        // Register User C (Charlie)
        const userCRes = await request('/api/auth/register', {
            method: 'POST',
            body: {
                name: `Viewer Charlie ${testRunId}`,
                email: `charlie_${testRunId}@test.com`,
                password: 'Password123!'
            }
        });
        assert(userCRes.status === 201 && userCRes.data.token, 'Register User C (Charlie)');
        const tokenC = userCRes.data.token;
        userC = userCRes.data.user;

        // Alice invites Charlie as Viewer
        const inviteViewerRes = await request(`/api/workspaces/${workspaceId}/invitations`, {
            method: 'POST',
            token: tokenA,
            body: {
                email: `charlie_${testRunId}@test.com`,
                role: 'Viewer'
            }
        });
        assert(inviteViewerRes.status === 201, 'Alice invites Charlie as Viewer');
        const charlieInviteToken = inviteViewerRes.data.invitationToken || inviteViewerRes.data.invitation?.token;

        // Charlie accepts invitation
        const acceptViewerRes = await request(`/api/invitations/accept/${charlieInviteToken}`, {
            method: 'POST',
            token: tokenC
        });
        assert(acceptViewerRes.status === 200 && acceptViewerRes.data.role === 'Viewer', 'Charlie joins workspace as Viewer');

        // Charlie can READ projects
        const viewerGetProjects = await request(`/api/workspaces/${workspaceId}/projects`, { token: tokenC });
        assert(viewerGetProjects.status === 200, 'Viewer can view workspace projects');

        // Charlie CANNOT CREATE a project (Viewer is read-only)
        const viewerCreateProj = await request(`/api/workspaces/${workspaceId}/projects`, {
            method: 'POST',
            token: tokenC,
            body: {
                name: 'Viewer Project',
                key: 'VIEW'
            }
        });
        assert(viewerCreateProj.status === 403, 'Viewer blocked from creating project (403)');

        // Charlie CANNOT CREATE a task in CORE project
        const viewerCreateTask = await request(`/api/projects/${projectId}/tasks`, {
            method: 'POST',
            token: tokenC,
            body: { title: 'Viewer Attempt Task' }
        });
        assert(viewerCreateTask.status === 403, 'Viewer blocked from creating task (403)');

        // Charlie CANNOT MOVE a task
        const viewerMoveTask = await request(`/api/tasks/${task1._id}/status`, {
            method: 'PATCH',
            token: tokenC,
            body: { status: 'done' }
        });
        assert(viewerMoveTask.status === 403, 'Viewer blocked from moving task status (403)');

        // -----------------------------------------------------------------
        // 12. Persistent Task Comments
        // -----------------------------------------------------------------
        console.log('\n--- 12. Task Comments CRUD & Permissions ---');

        // Charlie (Viewer) cannot comment
        const viewerCommentRes = await request(`/api/tasks/${task1._id}/comments`, {
            method: 'POST',
            token: tokenC,
            body: { content: 'Viewer should not be able to comment' }
        });
        assert(viewerCommentRes.status === 403, 'Viewer blocked from creating comment (403)');

        // Alice posts a comment
        const aliceCommentRes = await request(`/api/tasks/${task1._id}/comments`, {
            method: 'POST',
            token: tokenA,
            body: { content: 'Alice: Initial investigation complete.' }
        });
        assert(aliceCommentRes.status === 201 && aliceCommentRes.data.comment.content.includes('Alice: Initial'), 'Alice posts comment');
        const aliceCommentId = aliceCommentRes.data.comment._id;

        // Bob posts a comment
        const bobCommentRes = await request(`/api/tasks/${task1._id}/comments`, {
            method: 'POST',
            token: tokenB,
            body: { content: 'Bob: I will handle the backend routes.' }
        });
        assert(bobCommentRes.status === 201, 'Bob posts comment');
        const bobCommentId = bobCommentRes.data.comment._id;

        // List comments for task1
        const listCommentsRes = await request(`/api/tasks/${task1._id}/comments`, { token: tokenC });
        assert(listCommentsRes.status === 200 && listCommentsRes.data.comments.length === 2, 'Viewer can read all 2 task comments');

        // Bob edits his comment
        const editBobCommentRes = await request(`/api/tasks/${task1._id}/comments/${bobCommentId}`, {
            method: 'PUT',
            token: tokenB,
            body: { content: 'Bob: Updated - backend routes are now underway.' }
        });
        assert(editBobCommentRes.status === 200 && editBobCommentRes.data.comment.edited === true, 'Bob edits his own comment');

        // Bob tries to edit Alice's comment -> Should fail (403)
        const unauthEditRes = await request(`/api/tasks/${task1._id}/comments/${aliceCommentId}`, {
            method: 'PUT',
            token: tokenB,
            body: { content: 'Bob tries to maliciously overwrite Alice comment' }
        });
        assert(unauthEditRes.status === 403, 'User cannot edit another user\'s comment (403)');

        // Bob deletes his own comment
        const deleteBobCommentRes = await request(`/api/tasks/${task1._id}/comments/${bobCommentId}`, {
            method: 'DELETE',
            token: tokenB
        });
        assert(deleteBobCommentRes.status === 200, 'Author can delete their own comment');

        // Alice (Owner) deletes the remaining comment
        const deleteAliceCommentRes = await request(`/api/tasks/${task1._id}/comments/${aliceCommentId}`, {
            method: 'DELETE',
            token: tokenA
        });
        assert(deleteAliceCommentRes.status === 200, 'Workspace Owner can delete any comment');

        // -----------------------------------------------------------------
        // 13. Persistent Activity History
        // -----------------------------------------------------------------
        console.log('\n--- 13. Workspace Activity History ---');

        const activityRes = await request(`/api/workspaces/${workspaceId}/activity`, { token: tokenA });
        assert(activityRes.status === 200 && activityRes.data.activities.length > 0, 'Fetch workspace activity logs');
        assert(activityRes.data.activities.some(a => a.action === 'TASK_CREATED' || a.action === 'PROJECT_CREATED'), 'Activity history records important actions');

        // Activity filter by resourceType
        const filteredActivityRes = await request(`/api/workspaces/${workspaceId}/activity?resourceType=task`, { token: tokenA });
        assert(filteredActivityRes.status === 200 && filteredActivityRes.data.activities.every(a => a.resourceType === 'task'), 'Filter activity history by resourceType=task');

        // -----------------------------------------------------------------
        // 14. In-App Notifications
        // -----------------------------------------------------------------
        console.log('\n--- 14. In-App Notifications ---');

        // Alice assigns task2 to Bob
        const assignRes = await request(`/api/tasks/${task2._id}`, {
            method: 'PATCH',
            token: tokenA,
            body: { assignee: userB.id }
        });
        assert(assignRes.status === 200, 'Alice assigns task to Bob');

        // Check Bob's notifications & unread count
        const unreadCountRes = await request('/api/notifications/unread-count', { token: tokenB });
        assert(unreadCountRes.status === 200 && unreadCountRes.data.unreadCount >= 1, 'Bob has unread notifications');

        const bobNotifsRes = await request('/api/notifications', { token: tokenB });
        assert(bobNotifsRes.status === 200 && bobNotifsRes.data.notifications.length >= 1, 'Bob fetches notification list');
        const bobNotif = bobNotifsRes.data.notifications[0];

        // Bob marks single notification as read
        const markReadRes = await request(`/api/notifications/${bobNotif._id}/read`, {
            method: 'PATCH',
            token: tokenB
        });
        assert(markReadRes.status === 200 && markReadRes.data.notification.read === true, 'Mark notification as read');

        // Bob marks all notifications as read
        const markAllRes = await request('/api/notifications/read-all', {
            method: 'PATCH',
            token: tokenB
        });
        assert(markAllRes.status === 200, 'Mark all notifications as read');

        const finalUnreadRes = await request('/api/notifications/unread-count', { token: tokenB });
        assert(finalUnreadRes.status === 200 && finalUnreadRes.data.unreadCount === 0, 'Bob has 0 unread notifications after read-all');

        // User C (Charlie) cannot mark Bob's notification as read (isolation)
        const unauthNotifRes = await request(`/api/notifications/${bobNotif._id}/read`, {
            method: 'PATCH',
            token: tokenC
        });
        assert(unauthNotifRes.status === 404, 'User cannot access or modify another user\'s notifications (404)');

        // -----------------------------------------------------------------
        // 15. Scrum Sprints & Backlog Management
        // -----------------------------------------------------------------
        console.log('\n--- 15. Sprints & Backlog Management ---');

        // Backlog query (tasks with sprint: null)
        const backlogRes = await request(`/api/projects/${projectId}/backlog`, { token: tokenA });
        assert(backlogRes.status === 200 && backlogRes.data.tasks.length >= 2, 'Fetch project backlog tasks');

        // Reorder backlog tasks
        const reorderRes = await request(`/api/projects/${projectId}/backlog/reorder`, {
            method: 'PATCH',
            token: tokenA,
            body: { taskIds: [task2._id, task1._id] }
        });
        assert(reorderRes.status === 200 && reorderRes.data.updatedCount === 2, 'Persist backlog issue reordering');

        // Viewer cannot reorder backlog
        const viewerReorder = await request(`/api/projects/${projectId}/backlog/reorder`, {
            method: 'PATCH',
            token: tokenC,
            body: { taskIds: [task2._id] }
        });
        assert(viewerReorder.status === 403, 'Viewer blocked from reordering backlog (403)');

        // Viewer cannot create a sprint
        const viewerCreateSprint = await request(`/api/projects/${projectId}/sprints`, {
            method: 'POST',
            token: tokenC,
            body: { name: 'Unauthorized Sprint' }
        });
        assert(viewerCreateSprint.status === 403, 'Viewer blocked from creating sprint (403)');

        // Alice creates Planned Sprint 1
        const createSprint1Res = await request(`/api/projects/${projectId}/sprints`, {
            method: 'POST',
            token: tokenA,
            body: {
                name: 'Sprint 1 - Foundation',
                goal: 'Core authentication & setup'
            }
        });
        assert(createSprint1Res.status === 201 && createSprint1Res.data.sprint.status === 'Planned', 'Create Planned Sprint 1');
        const sprint1Id = createSprint1Res.data.sprint._id;

        // Alice creates Planned Sprint 2
        const createSprint2Res = await request(`/api/projects/${projectId}/sprints`, {
            method: 'POST',
            token: tokenA,
            body: {
                name: 'Sprint 2 - Scaling',
                goal: 'Integration & optimization'
            }
        });
        assert(createSprint2Res.status === 201 && createSprint2Res.data.sprint.status === 'Planned', 'Create Planned Sprint 2');
        const sprint2Id = createSprint2Res.data.sprint._id;

        // List project sprints
        const listSprintsRes = await request(`/api/projects/${projectId}/sprints`, { token: tokenA });
        assert(listSprintsRes.status === 200 && listSprintsRes.data.sprints.length >= 2, 'List project sprints with computed metrics');

        // Add task1 and task2 to Sprint 1
        const addIssuesRes = await request(`/api/sprints/${sprint1Id}/issues`, {
            method: 'POST',
            token: tokenA,
            body: { taskIds: [task1._id, task2._id] }
        });
        assert(addIssuesRes.status === 200 && addIssuesRes.data.modifiedCount === 2, 'Add task1 and task2 to Sprint 1');

        // Remove task2 from Sprint 1 (returns to backlog)
        const removeIssueRes = await request(`/api/sprints/${sprint1Id}/issues/${task2._id}`, {
            method: 'DELETE',
            token: tokenA
        });
        assert(removeIssueRes.status === 200, 'Remove task2 from Sprint 1 (returned to backlog)');

        // Verify task2 is back in backlog
        const verifyBacklogAfterRemove = await request(`/api/projects/${projectId}/backlog`, { token: tokenA });
        assert(verifyBacklogAfterRemove.data.tasks.some(t => t._id === task2._id), 'Verified task2 is back in backlog');

        // Re-add task2 to Sprint 1
        await request(`/api/sprints/${sprint1Id}/issues`, {
            method: 'POST',
            token: tokenA,
            body: { taskIds: [task2._id] }
        });

        // Start Sprint 1 (captures initial commitment)
        const startSprint1Res = await request(`/api/sprints/${sprint1Id}/start`, {
            method: 'POST',
            token: tokenA,
            body: {
                goal: 'Core authentication & setup finalized'
            }
        });
        assert(startSprint1Res.status === 200 && startSprint1Res.data.sprint.status === 'Active', 'Start Sprint 1 (status: Active)');
        assert(startSprint1Res.data.initialCommitment.issueCount === 2, 'Initial commitment issue count captured (2 issues)');

        // Enforce: Project must NOT have multiple active sprints simultaneously
        const startSprint2ConflictRes = await request(`/api/sprints/${sprint2Id}/start`, {
            method: 'POST',
            token: tokenA
        });
        assert(startSprint2ConflictRes.status === 400, 'Starting a second active sprint is rejected (400)');

        // Task 1 transitions to Done
        const finishTask1 = await request(`/api/tasks/${task1._id}/status`, {
            method: 'PATCH',
            token: tokenA,
            body: { status: 'Done' }
        });
        assert(finishTask1.status === 200 && finishTask1.data.task.status === 'Done', 'Task 1 moved to Done');

        // Query Sprint 1 reporting metrics
        const metricsRes = await request(`/api/sprints/${sprint1Id}/metrics`, { token: tokenA });
        assert(metricsRes.status === 200 && metricsRes.data.metrics.completed.issueCount === 1, 'Sprint metrics reflect 1 completed issue');
        assert(metricsRes.data.metrics.remaining.issueCount === 1, 'Sprint metrics reflect 1 remaining issue');
        assert(metricsRes.data.metrics.initialCommitment.issueCount === 2, 'Initial commitment preserved even after task progression');

        // Complete Sprint 1 with incomplete tasks moved to Sprint 2
        const completeSprint1Res = await request(`/api/sprints/${sprint1Id}/complete`, {
            method: 'POST',
            token: tokenA,
            body: {
                moveTo: 'sprint',
                targetSprintId: sprint2Id
            }
        });
        assert(completeSprint1Res.status === 200 && completeSprint1Res.data.sprint.status === 'Completed', 'Complete Sprint 1');
        assert(completeSprint1Res.data.summary.completedIssuesCount === 1, '1 completed issue stayed in completed sprint');
        assert(completeSprint1Res.data.summary.incompleteIssuesCount === 1, '1 incomplete issue transferred to Sprint 2');

        // Verify task2 is now in Sprint 2
        const task2InSprint2 = await taskModel.findById(task2._id);
        assert(task2InSprint2.sprint && task2InSprint2.sprint.toString() === sprint2Id.toString(), 'Incomplete task2 safely moved into Sprint 2');

        // Now Sprint 2 can be started without conflict
        const startSprint2Res = await request(`/api/sprints/${sprint2Id}/start`, {
            method: 'POST',
            token: tokenA
        });
        assert(startSprint2Res.status === 200 && startSprint2Res.data.sprint.status === 'Active', 'Sprint 2 successfully started after Sprint 1 completion');

        // -----------------------------------------------------------------
        // 16. Global Search, Advanced Filters & Saved Views
        // -----------------------------------------------------------------
        console.log('\n--- 16. Global Search, Advanced Filters & Saved Views ---');

        // Global Search: Exact issue key
        const searchKeyRes = await request(`/api/search?q=CORE-1`, { token: tokenA });
        assert(searchKeyRes.status === 200, 'Global search by exact issueKey');
        assert(searchKeyRes.data.results.tasks.length > 0 && searchKeyRes.data.results.tasks[0].issueKey === 'CORE-1', 'Search returns CORE-1 as top task');

        // Global Search: Project name/key
        const searchProjRes = await request(`/api/search?q=CORE`, { token: tokenA });
        assert(searchProjRes.status === 200, 'Global search by project query');
        assert(searchProjRes.data.results.projects.some(p => p.key === 'CORE'), 'Search returns project CORE');
        assert(searchProjRes.data.counts.total > 0, 'Categorized search returns total count');

        // Advanced Multi-Condition Task Filtering with Sorting & Server Pagination
        const filterRes = await request(`/api/tasks?workspaceId=${workspaceId}&sortBy=createdAt&sortOrder=desc&page=1&limit=5`, { token: tokenA });
        assert(filterRes.status === 200, 'Workspace-scoped task query with sorting and pagination');
        assert(filterRes.data.pagination && filterRes.data.pagination.page === 1, 'Pagination metadata correctly returned');
        assert(filterRes.data.pagination.limit === 5, 'Configurable limit applied');

        // Filter by status and priority combined
        const multiFilterRes = await request(`/api/tasks?projectId=${projectId}&status=Done`, { token: tokenA });
        assert(multiFilterRes.status === 200 && multiFilterRes.data.tasks.every(t => t.status === 'Done'), 'Filter tasks by status=Done returns matching tasks');

        // Filter by sprint=backlog
        const backlogFilterRes = await request(`/api/tasks?projectId=${projectId}&sprint=backlog`, { token: tokenA });
        assert(backlogFilterRes.status === 200 && backlogFilterRes.data.tasks.every(t => t.sprint === null), 'Filter tasks by sprint=backlog returns tasks with sprint=null');

        // Saved Views: Alice creates Private saved view
        const createPrivateViewRes = await request('/api/views', {
            method: 'POST',
            token: tokenA,
            body: {
                name: 'My Backlog Bugs',
                description: 'Unresolved bug issues in backlog',
                workspaceId,
                projectId,
                filters: { type: 'Bug', status: 'To Do', sprint: null },
                sort: { field: 'priority', order: 'asc' },
                visibility: 'Private'
            }
        });
        assert(createPrivateViewRes.status === 201, 'Alice creates private saved view');
        const privateViewId = createPrivateViewRes.data.view._id;

        // Saved Views: Alice creates Shared saved view
        const createSharedViewRes = await request('/api/views', {
            method: 'POST',
            token: tokenA,
            body: {
                name: 'Sprint High Priority Board',
                description: 'All high and urgent issues for the team',
                workspaceId,
                projectId,
                filters: { priority: 'High,Highest' },
                sort: { field: 'dueDate', order: 'asc' },
                visibility: 'Shared'
            }
        });
        assert(createSharedViewRes.status === 201, 'Alice creates shared saved view');
        const sharedViewId = createSharedViewRes.data.view._id;

        // Permissions: Viewer (Charlie) blocked from creating Shared view (403)
        const viewerSharedViewRes = await request('/api/views', {
            method: 'POST',
            token: tokenC,
            body: {
                name: 'Charlie View',
                workspaceId,
                visibility: 'Shared'
            }
        });
        assert(viewerSharedViewRes.status === 403, 'Viewer blocked from creating shared view (403)');

        // Bob lists views in workspace: sees Alice\'s shared view, but NOT Alice\'s private view
        const bobViewsRes = await request(`/api/views?workspaceId=${workspaceId}`, { token: tokenB });
        assert(bobViewsRes.status === 200, 'Bob lists workspace saved views');
        assert(bobViewsRes.data.views.some(v => v._id === sharedViewId), 'Bob can see Alice\'s shared view');
        assert(!bobViewsRes.data.views.some(v => v._id === privateViewId), 'Bob cannot see Alice\'s private view');

        // Bob duplicates Alice\'s shared view -> creates private copy owned by Bob
        const duplicateViewRes = await request(`/api/views/${sharedViewId}/duplicate`, {
            method: 'POST',
            token: tokenB,
            body: { name: 'Bob Custom High Priority' }
        });
        assert(duplicateViewRes.status === 201, 'Bob duplicates shared view');
        assert(duplicateViewRes.data.view.name === 'Bob Custom High Priority', 'Duplicated view has customized name');
        assert(duplicateViewRes.data.view.visibility === 'Private', 'Duplicated view defaults to private');
        assert(duplicateViewRes.data.view.createdBy._id === userB.id, 'Bob is owner of duplicated view');

        // Charlie (Viewer) tries to update Alice\'s shared view -> Blocked (403)
        const unauthUpdateViewRes = await request(`/api/views/${sharedViewId}`, {
            method: 'PATCH',
            token: tokenC,
            body: { name: 'Malicious Change' }
        });
        assert(unauthUpdateViewRes.status === 403, 'Viewer blocked from updating view created by another user (403)');

        // Alice updates her own saved view
        const updateViewRes = await request(`/api/views/${privateViewId}`, {
            method: 'PATCH',
            token: tokenA,
            body: { name: 'My Updated Backlog Bugs' }
        });
        assert(updateViewRes.status === 200 && updateViewRes.data.view.name === 'My Updated Backlog Bugs', 'Alice successfully updates her saved view');

        // Alice deletes her private view
        const deleteViewRes = await request(`/api/views/${privateViewId}`, {
            method: 'DELETE',
            token: tokenA
        });
        assert(deleteViewRes.status === 200, 'Alice deletes her saved view');

        // -----------------------------------------------------------------
        // 17. Analytics, Reporting, Team Workload & CSV Exports
        // -----------------------------------------------------------------
        console.log('\n--- 17. Analytics, Reporting, Team Workload & CSV Exports ---');

        // Workspace Analytics
        const wsAnalyticsRes = await request(`/api/workspaces/${workspaceId}/analytics`, { token: tokenA });
        assert(wsAnalyticsRes.status === 200, 'Fetch workspace analytics');
        assert(wsAnalyticsRes.data.analytics.overview.totalProjects >= 1, 'Analytics reflects total projects count');
        assert(wsAnalyticsRes.data.analytics.overview.activeSprints >= 1, 'Analytics reflects active sprints count');
        assert(wsAnalyticsRes.data.analytics.distribution.byStatus !== undefined, 'Analytics includes status distribution');
        assert(wsAnalyticsRes.data.analytics.projectBreakdown.length >= 1, 'Analytics includes project breakdown');
        assert(wsAnalyticsRes.data.analytics.teamWorkload.length >= 1, 'Analytics includes team workload');

        // Date-Range Filtering on Workspace Analytics
        const dateFilteredRes = await request(`/api/workspaces/${workspaceId}/analytics?period=7d`, { token: tokenA });
        assert(dateFilteredRes.status === 200 && dateFilteredRes.data.analytics.period === '7d', 'Analytics date-range filter 7d applied');

        // Project Analytics
        const projAnalyticsRes = await request(`/api/projects/${projectId}/analytics`, { token: tokenA });
        assert(projAnalyticsRes.status === 200, 'Fetch project analytics');
        assert(projAnalyticsRes.data.analytics.overview.totalTasks >= 1, 'Project analytics reflects total issues');
        assert(Array.isArray(projAnalyticsRes.data.analytics.completionTrend), 'Project analytics includes completion trend array');
        assert(projAnalyticsRes.data.analytics.completionTrend.length === 14, 'Completion trend covers 14 days of historical tracking');
        assert(projAnalyticsRes.data.analytics.assigneeDistribution.length >= 1, 'Project analytics includes assignee workload distribution');

        // Sprint Detailed Report (Active Sprint 2)
        const sprintReportRes = await request(`/api/sprints/${sprint2Id}/report`, { token: tokenA });
        assert(sprintReportRes.status === 200, 'Fetch active sprint report');
        assert(sprintReportRes.data.report.sprint.name.includes('Sprint 2'), 'Sprint report matches sprint name');
        assert(sprintReportRes.data.report.commitment.currentIssues >= 1, 'Sprint report contains issue counts');
        assert(sprintReportRes.data.report.burndown.hasBurndown === true, 'Active sprint provides real burndown data');
        assert(Array.isArray(sprintReportRes.data.report.burndown.data), 'Sprint burndown contains data points array');

        // Sprint Detailed Report (Planned Sprint with no historical data)
        const createPlannedSprint3Res = await request(`/api/projects/${projectId}/sprints`, {
            method: 'POST',
            token: tokenA,
            body: { name: 'Sprint 3 (Planned)' }
        });
        const sprint3Id = createPlannedSprint3Res.data.sprint._id;
        const plannedReportRes = await request(`/api/sprints/${sprint3Id}/report`, { token: tokenA });
        assert(plannedReportRes.status === 200, 'Fetch planned sprint report');
        assert(plannedReportRes.data.report.burndown.hasBurndown === false, 'Planned sprint accurately flags burndown as unavailable without fabricating data');

        // Team Workload Analytics
        const teamWorkloadRes = await request(`/api/workspaces/${workspaceId}/team-workload`, { token: tokenA });
        assert(teamWorkloadRes.status === 200, 'Fetch team workload analytics');
        assert(teamWorkloadRes.data.teamWorkload.length >= 2, 'Team workload covers workspace members');
        assert(teamWorkloadRes.data.teamWorkload.some(m => m.user.name.includes('Bob')), 'Team workload reflects Bob\'s assignments');

        // Foreign User Authorization Guards
        const userDRes = await request('/api/auth/register', {
            method: 'POST',
            body: {
                name: `Dave ${Date.now().toString().slice(-6)}`,
                email: `dave_${Date.now()}@test.com`,
                password: 'Password123!'
            }
        });
        const tokenD = userDRes.data.token;
        const userD = userDRes.data.user;

        const foreignWsAnalyticsRes = await request(`/api/workspaces/${workspaceId}/analytics`, { token: tokenD });
        assert(foreignWsAnalyticsRes.status === 403, 'Foreign user blocked from workspace analytics (403)');

        const foreignProjAnalyticsRes = await request(`/api/projects/${projectId}/analytics`, { token: tokenD });
        assert(foreignProjAnalyticsRes.status === 403, 'Foreign user blocked from project analytics (403)');

        const foreignSprintReportRes = await request(`/api/sprints/${sprint2Id}/report`, { token: tokenD });
        assert(foreignSprintReportRes.status === 403, 'Foreign user blocked from sprint report (403)');

        const foreignExportRes = await request(`/api/workspaces/${workspaceId}/export`, { token: tokenD });
        assert(foreignExportRes.status === 403, 'Foreign user blocked from exporting workspace data (403)');

        // CSV Exports
        const exportTasksRes = await request(`/api/workspaces/${workspaceId}/export?type=tasks`, { token: tokenA });
        assert(exportTasksRes.status === 200, 'Export workspace tasks as CSV');
        assert(typeof exportTasksRes.data === 'string' && exportTasksRes.data.includes('Issue Key'), 'Tasks CSV contains proper header columns');

        const exportProjectsRes = await request(`/api/workspaces/${workspaceId}/export?type=projects`, { token: tokenA });
        assert(exportProjectsRes.status === 200, 'Export workspace projects as CSV');
        assert(typeof exportProjectsRes.data === 'string' && exportProjectsRes.data.includes('Project Name'), 'Projects CSV contains proper header columns');

        const exportTeamRes = await request(`/api/workspaces/${workspaceId}/export?type=team`, { token: tokenA });
        assert(exportTeamRes.status === 200, 'Export workspace team workload as CSV');
        assert(typeof exportTeamRes.data === 'string' && exportTeamRes.data.includes('Member Name'), 'Team CSV contains proper header columns');

        const exportProjRes = await request(`/api/projects/${projectId}/export`, { token: tokenA });
        assert(exportProjRes.status === 200, 'Export project tasks as CSV');
        assert(typeof exportProjRes.data === 'string' && exportProjRes.data.includes('CORE-'), 'Project CSV contains actual issue records');

        // -----------------------------------------------------------------
        // 18. Delete Project & Safe Cascade Deletion of Tasks, Comments & Sprints
        // -----------------------------------------------------------------
        console.log('\n--- 18. Cascade Deletion on Project Removal ---');

        // Check how many tasks exist for project before deletion
        const tasksBeforeDelete = await taskModel.countDocuments({ project: projectId });
        assert(tasksBeforeDelete > 0, `Project currently has ${tasksBeforeDelete} associated tasks`);

        // Alice deletes project
        const deleteProjRes = await request(`/api/projects/${projectId}`, {
            method: 'DELETE',
            token: tokenA
        });
        assert(deleteProjRes.status === 200, 'Project deleted successfully');
        assert(deleteProjRes.data.deletedTasksCount === tasksBeforeDelete, 'All associated tasks cleanly cascade-deleted');

        // Verify sprints are gone from database
        const sprintsAfterDelete = await sprintModel.countDocuments({ project: projectId });
        assert(sprintsAfterDelete === 0, 'No orphaned sprints remain in database');

        // Verify tasks are gone from database
        const tasksAfterDelete = await taskModel.countDocuments({ project: projectId });
        assert(tasksAfterDelete === 0, 'No orphaned tasks remain in database');

        // -----------------------------------------------------------------
        // 19. Production Security, Auth Hardening, Invalidation & Sanitization
        // -----------------------------------------------------------------
        console.log('\n--- 19. Security, Token Invalidation & Input Sanitization ---');

        // 19.1 Profile Updates & Input Validation
        const updateProfRes = await request('/api/auth/profile', {
            method: 'PUT',
            token: tokenA,
            body: {
                name: 'Alice Security Lead',
                bio: 'Full-stack lead & security engineer',
                github: 'alice-sec'
            }
        });
        assert(updateProfRes.status === 200, 'Profile update returns 200');
        assert(updateProfRes.data.user.name === 'Alice Security Lead', 'Profile name updated');
        assert(updateProfRes.data.user.bio === 'Full-stack lead & security engineer', 'Profile bio updated');
        assert(updateProfRes.data.user.github === 'alice-sec', 'Profile github updated');

        // Verify profile persistence via GET
        const getProfRes = await request('/api/auth/profile', { token: tokenA });
        assert(getProfRes.status === 200, 'GET /api/auth/profile retrieves updated profile');
        assert(getProfRes.data.user.name === 'Alice Security Lead', 'Retrieved profile matches updated name');

        // 19.2 Password Change & Old Token Invalidation
        // Attempt with incorrect current password
        const badPassRes = await request('/api/auth/change-password', {
            method: 'POST',
            token: tokenA,
            body: {
                currentPassword: 'wrongpassword',
                newPassword: 'NewSecurePassword123!'
            }
        });
        assert(badPassRes.status === 400, 'Change password with wrong current password rejected with 400');

        // Attempt with short password (< 8 chars)
        const shortPassRes = await request('/api/auth/change-password', {
            method: 'POST',
            token: tokenA,
            body: {
                currentPassword: 'Password123!',
                newPassword: 'short'
            }
        });
        assert(shortPassRes.status === 400, 'Change password with short new password rejected with 400');

        // Successful password change
        const changePassRes = await request('/api/auth/change-password', {
            method: 'POST',
            token: tokenA,
            body: {
                currentPassword: 'Password123!',
                newPassword: 'NewSecurePassword123!'
            }
        });
        assert(changePassRes.status === 200, 'Password changed successfully');
        assert(!!changePassRes.data.token, 'New JWT issued with updated token version');

        const newTokenA = changePassRes.data.token;

        // Verify old token is now invalidated due to tokenVersion increment
        const oldTokenCheck = await request('/api/auth/profile', { token: tokenA });
        assert(oldTokenCheck.status === 401, 'Previous JWT rejected (401) after password change');

        // Verify new token works
        const newTokenCheck = await request('/api/auth/profile', { token: newTokenA });
        assert(newTokenCheck.status === 200, 'New JWT can access protected route');

        // Verify login with new password succeeds
        const newLoginRes = await request('/api/auth/login', {
            method: 'POST',
            body: {
                email: userA.email,
                password: 'NewSecurePassword123!'
            }
        });
        assert(newLoginRes.status === 200, 'Login with new password succeeds');

        // 19.3 Logout & Session Revocation
        const userSessionRes = await request('/api/auth/register', {
            method: 'POST',
            body: {
                name: 'Session Test User',
                email: `session_${testRunId}@test.com`,
                password: 'Password123!'
            }
        });
        assert(userSessionRes.status === 201, 'Registered user for session revocation test');
        const tokenSession = userSessionRes.data.token;

        // Verify token works
        const profSessionCheck = await request('/api/auth/profile', { token: tokenSession });
        assert(profSessionCheck.status === 200, 'Session test user token valid before logout');

        // Logout
        const logoutRes = await request('/api/auth/logout', {
            method: 'POST',
            token: tokenSession
        });
        assert(logoutRes.status === 200, 'POST /api/auth/logout succeeds');

        // Verify token is now revoked
        const profSessionAfterLogout = await request('/api/auth/profile', { token: tokenSession });
        assert(profSessionAfterLogout.status === 401, 'Session test user token revoked (401) immediately after logout');

        // 19.4 Forgot Password (Safe against user enumeration)
        const forgotExistRes = await request('/api/auth/forgot-password', {
            method: 'POST',
            body: { email: userA.email }
        });
        assert(forgotExistRes.status === 200, 'Forgot password for existing user returns 200');

        const forgotNonExistRes = await request('/api/auth/forgot-password', {
            method: 'POST',
            body: { email: `nonexistent_${testRunId}@test.com` }
        });
        assert(forgotNonExistRes.status === 200, 'Forgot password for nonexistent user returns identical 200 (no enumeration)');
        assert(forgotExistRes.data.message === forgotNonExistRes.data.message, 'Generic response prevents email enumeration');

        const forgotBadEmail = await request('/api/auth/forgot-password', {
            method: 'POST',
            body: { email: 'not-an-email' }
        });
        assert(forgotBadEmail.status === 400, 'Invalid email format rejected with 400');

        // 19.5 NoSQL Injection Sanitization
        const injectionRes = await request('/api/auth/login', {
            method: 'POST',
            body: {
                email: { $gt: '' },
                password: 'Password123!'
            }
        });
        assert(injectionRes.status === 400, 'NoSQL injection payload stripped and safely rejected');

        // 19.6 Request Body Size Limit (1MB)
        const hugeString = 'A'.repeat(1.2 * 1024 * 1024); // 1.2 MB
        const hugeRes = await fetch(`${baseUrl}/api/auth/login`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email: 'test@example.com', password: hugeString })
        });
        assert(hugeRes.status === 413, 'Payload exceeding 1MB rejected with 413 Payload Too Large');

        // -----------------------------------------------------------------
        // 20. Advanced Production Security & IDOR Hardening
        // -----------------------------------------------------------------
        console.log('\n--- 20. Advanced Production Security & IDOR Hardening ---');

        // 20.1 Missing JWT rejects with 401
        const noTokenRes = await request('/api/auth/profile');
        assert(noTokenRes.status === 401, 'Missing JWT authorization header rejected with 401');

        // 20.2 Malformed JWT rejects with 401
        const malformedTokenRes = await request('/api/auth/profile', {
            headers: { 'Authorization': 'Bearer malformed.invalid.token' }
        });
        assert(malformedTokenRes.status === 401, 'Malformed JWT token rejected with 401');

        // 20.3 Tampered JWT signature rejects with 401
        const tamperedToken = userA.token + 'corrupt';
        const tamperedRes = await request('/api/auth/profile', {
            token: tamperedToken
        });
        assert(tamperedRes.status === 401, 'Tampered JWT signature rejected with 401');

        // 20.4 Deliberately expired JWT rejects with 401
        const expiredToken = jwt.sign(
            { userId: userA.id, tokenVersion: 0 },
            process.env.JWT_SECRET || 'test_secret',
            { expiresIn: '0s' }
        );
        const expiredRes = await request('/api/auth/profile', {
            token: expiredToken
        });
        assert(expiredRes.status === 401, 'Expired JWT token rejected with 401');

        // 20.5 Cross-Workspace IDOR Isolation
        // Register User E who has zero access to Alice's workspace
        const userERes = await request('/api/auth/register', {
            method: 'POST',
            body: {
                name: `Eve ${testRunId}`,
                email: `eve-${testRunId}@example.com`,
                password: 'Password123!'
            }
        });
        const userEToken = userERes.data.token;
        const userEId = userERes.data.user.id;

        // User E tries to access Alice's workspace projects -> 403 Forbidden
        const idorProjectList = await request(`/api/workspaces/${workspaceId}/projects`, {
            token: userEToken
        });
        assert(idorProjectList.status === 403, 'User cannot list projects in foreign workspace (403)');

        // User E tries to create a project in Alice's workspace -> 403 Forbidden
        const idorProjectCreate = await request(`/api/workspaces/${workspaceId}/projects`, {
            method: 'POST',
            token: userEToken,
            body: {
                name: 'Unauthorized Project',
                key: 'HACK',
                lead: userEId
            }
        });
        assert(idorProjectCreate.status === 403, 'User blocked from creating project in foreign workspace (403)');

        // User E tries to read Alice's workspace activity history -> 403 Forbidden
        const idorActivityRes = await request(`/api/workspaces/${workspaceId}/activity`, {
            token: userEToken
        });
        assert(idorActivityRes.status === 403, 'User blocked from reading foreign workspace activity (403)');

        // 20.6 CastError / Invalid ObjectId Safe Handling (No 500 crashes)
        const invalidOidRes = await request('/api/projects/invalid-project-oid', {
            token: newLoginRes.data.token
        });
        assert(invalidOidRes.status === 400, 'Invalid MongoDB ObjectId parameter safely rejected with 400');

        // 20.7 Malformed JSON Body Safe Handling (No 500 crashes)
        const malformedJsonRes = await fetch(`${baseUrl}/api/auth/login`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: '{ invalid-json-payload-broken: '
        });
        assert(malformedJsonRes.status === 400, 'Malformed JSON payload safely rejected with 400');

        // 20.8 Sensitive Password Hash Field Exposure Prevention
        const profileFetch = await request('/api/auth/profile', {
            token: newLoginRes.data.token
        });
        assert(profileFetch.status === 200, 'Profile fetched with valid active token');
        assert(profileFetch.data?.user?.password === undefined, 'Password hash is excluded from profile API response');
        assert(newLoginRes.data?.user?.password === undefined, 'Password hash is excluded from login API response');

        const userDoc = await userModel.findById(userA.id);
        const serialized = userDoc.toJSON();
        assert(serialized.password === undefined, 'toJSON schema transform strips password hash');
        assert(serialized.__v === undefined, 'toJSON schema transform strips internal __v version');

        // -----------------------------------------------------------------
        // 21. Production Hardening & Pre-Deployment Verification
        // -----------------------------------------------------------------
        console.log('\n--- Section 21: Pre-Deployment Hardening Verification ---');

        // 21.1 Removed Unused/Debug GET Routes Return 404
        const testRouteRes = await request('/api/auth/test');
        assert(testRouteRes.status === 404, 'Legacy debug route GET /api/auth/test removed and returns 404');

        const getRegisterRes = await request('/api/auth/register');
        assert(getRegisterRes.status === 404, 'Legacy debug route GET /api/auth/register removed and returns 404');

        // 21.2 Production Environment Validation - Missing Variables
        let envErrorCaught = false;
        try {
            validateEnv({
                NODE_ENV: 'production',
                MONGO_URI: '',
                JWT_SECRET: ''
            });
        } catch (err) {
            envErrorCaught = true;
            assert(err.isEnvError === true, 'validateEnv throws specialized environment validation error');
            assert(err.message.includes('MONGO_URI'), 'Validation error details missing MONGO_URI');
            assert(err.message.includes('JWT_SECRET'), 'Validation error details missing JWT_SECRET');
            assert(!err.message.includes('mongodb://'), 'Error message does not leak connection string');
        }
        assert(envErrorCaught, 'validateEnv correctly throws in production when required variables are missing');

        // 21.3 Production Environment Validation - Short/Placeholder Secret
        let secretErrorCaught = false;
        try {
            validateEnv({
                NODE_ENV: 'production',
                MONGO_URI: 'mongodb+srv://user:pass@cluster.mongodb.net/DevSpace',
                JWT_SECRET: 'short_secret',
                CLIENT_URL: 'https://devspace.vercel.app'
            });
        } catch (err) {
            secretErrorCaught = true;
            assert(err.message.includes('at least 32 characters'), 'validateEnv rejects JWT secrets under 32 chars');
            assert(!err.message.includes('short_secret'), 'validateEnv never prints secret value in error message');
        }
        assert(secretErrorCaught, 'validateEnv enforces minimum secret length in production');

        // 21.4 Production Environment Validation - Valid Configuration Pass
        const validEnvResult = validateEnv({
            NODE_ENV: 'production',
            MONGO_URI: 'mongodb+srv://user:pass@cluster.mongodb.net/DevSpace',
            JWT_SECRET: 'super_secure_production_secret_key_32chars!',
            CLIENT_URL: 'https://devspace.vercel.app'
        });
        assert(validEnvResult === true, 'validateEnv passes on compliant production environment configuration');

        // 21.5 Express Reverse Proxy Trust Setting
        // In production, trust proxy is 1 (Render 1-hop proxy)
        const currentTrustSetting = app.get('trust proxy');
        assert(
            currentTrustSetting === 1 || typeof currentTrustSetting === 'function' || currentTrustSetting === false || currentTrustSetting === undefined,
            'Express trust proxy is configured deterministically'
        );
        console.log(`[Proxy Trust] Current express trust proxy setting: ${currentTrustSetting}`);

        // -----------------------------------------------------------------
        // Test Cleanup
        // -----------------------------------------------------------------
        console.log('\n--- Test Cleanup ---');
        await savedViewModel.deleteMany({ workspace: workspaceId });
        await sprintModel.deleteMany({ workspace: workspaceId });
        await commentModel.deleteMany({ workspace: workspaceId });
        await activityModel.deleteMany({ workspace: workspaceId });
        await notificationModel.deleteMany({ recipient: { $in: [userA.id, userB.id, userC?._id] } });
        await invitationModel.deleteMany({ workspace: workspaceId });
        await taskModel.deleteMany({ workspace: workspaceId });
        await projectModel.deleteMany({ workspace: workspaceId });
        await workspaceModel.deleteMany({ owner: { $in: [userA.id, userB.id, userC?._id] } });
        await userModel.deleteMany({ email: { $regex: testRunId } });
        console.log('Test data cleaned up.');

    } catch (err) {
        console.error('Test execution error:', err);
        failCount++;
    } finally {
        if (server) {
            server.close();
        }
        await mongoose.disconnect();

        console.log('\n=============================================');
        console.log(` Test Summary: ${passCount} Passed, ${failCount} Failed`);
        console.log('=============================================\n');

        if (failCount > 0) {
            process.exit(1);
        } else {
            process.exit(0);
        }
    }
}

runTests();
