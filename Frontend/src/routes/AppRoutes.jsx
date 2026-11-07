import React, { Suspense, lazy } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';

// Layouts & Guards
import AuthLayout from '../layouts/AuthLayout';
import DashboardLayout from '../layouts/DashboardLayout';
import WorkspaceLayout from '../layouts/WorkspaceLayout';
import ProtectedRoute from '../components/common/ProtectedRoute';
import LoadingState from '../components/common/LoadingState';

// Critical Initial Pages (Eagerly loaded for zero interaction delay)
import LandingPage from '../pages/LandingPage';
import LoginPage from '../pages/auth/LoginPage';
import RegisterPage from '../pages/auth/RegisterPage';

// Lazy Loaded Auth Pages
const ForgotPasswordPage = lazy(() => import('../pages/auth/ForgotPasswordPage'));
const AcceptInvitePage = lazy(() => import('../pages/auth/AcceptInvitePage'));

// Lazy Loaded Dashboard Page
const DashboardPage = lazy(() => import('../pages/dashboard/DashboardPage'));

// Lazy Loaded Workspace Sub-Pages
const WorkspaceOverviewPage = lazy(() => import('../pages/workspace/WorkspaceOverviewPage'));
const WorkspaceProjectsPage = lazy(() => import('../pages/workspace/WorkspaceProjectsPage'));
const WorkspaceBacklogPage = lazy(() => import('../pages/workspace/WorkspaceBacklogPage'));
const WorkspaceTasksPage = lazy(() => import('../pages/workspace/WorkspaceTasksPage'));
const ProjectDetailPage = lazy(() => import('../pages/workspace/ProjectDetailPage'));
const ProjectBoardPage = lazy(() => import('../pages/workspace/ProjectBoardPage'));
const ProjectBacklogPage = lazy(() => import('../pages/workspace/ProjectBacklogPage'));
const ProjectReportsPage = lazy(() => import('../pages/workspace/ProjectReportsPage'));
const ProjectSettingsPage = lazy(() => import('../pages/workspace/ProjectSettingsPage'));
const WorkspaceMembersPage = lazy(() => import('../pages/workspace/WorkspaceMembersPage'));
const WorkspaceActivityPage = lazy(() => import('../pages/workspace/WorkspaceActivityPage'));
const WorkspaceSettingsPage = lazy(() => import('../pages/workspace/WorkspaceSettingsPage'));

// Lazy Loaded User Global Pages
const NotificationsPage = lazy(() => import('../pages/user/NotificationsPage'));
const UserSettingsPage = lazy(() => import('../pages/user/UserSettingsPage'));

export function AppRoutes() {
  return (
    <Suspense fallback={<LoadingState message="Loading..." className="py-24" />}>
      <Routes>
        {/* Root Public Landing Page */}
        <Route path="/" element={<LandingPage />} />

        {/* Auth Routes */}
        <Route element={<AuthLayout />}>
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />
          <Route path="/forgot-password" element={<ForgotPasswordPage />} />
          <Route path="/invite/:token" element={<AcceptInvitePage />} />
        </Route>

        {/* Protected App Workspace & Dashboard Routes */}
        <Route element={<ProtectedRoute />}>
          <Route element={<DashboardLayout />}>
            <Route path="/dashboard" element={<DashboardPage />} />

            {/* Nested Workspace Routes */}
            <Route path="/workspace/:workspaceId" element={<WorkspaceLayout />}>
              <Route index element={<WorkspaceOverviewPage />} />
              <Route path="analytics" element={<WorkspaceOverviewPage />} />
              <Route path="projects" element={<WorkspaceProjectsPage />} />
              <Route path="backlog" element={<WorkspaceBacklogPage />} />
              <Route path="tasks" element={<WorkspaceTasksPage />} />
              <Route path="projects/:projectId" element={<ProjectDetailPage />} />
              <Route path="projects/:projectId/board" element={<ProjectBoardPage />} />
              <Route path="projects/:projectId/tasks" element={<ProjectBoardPage />} />
              <Route path="projects/:projectId/backlog" element={<ProjectBacklogPage />} />
              <Route path="projects/:projectId/reports" element={<ProjectReportsPage />} />
              <Route path="projects/:projectId/settings" element={<ProjectSettingsPage />} />
              <Route path="projects/:projectId/activity" element={<ProjectDetailPage />} />
              <Route path="members" element={<WorkspaceMembersPage />} />
              <Route path="activity" element={<WorkspaceActivityPage />} />
              <Route path="settings" element={<WorkspaceSettingsPage />} />
            </Route>

            <Route path="/notifications" element={<NotificationsPage />} />
            <Route path="/settings" element={<UserSettingsPage />} />
          </Route>
        </Route>

        {/* Fallback to Dashboard */}
        <Route path="*" element={<Navigate to="/dashboard" replace />} />
      </Routes>
    </Suspense>
  );
}

export default AppRoutes;
