import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';

// Layouts
import AuthLayout from '../layouts/AuthLayout';
import DashboardLayout from '../layouts/DashboardLayout';
import WorkspaceLayout from '../layouts/WorkspaceLayout';

// Public Landing & Auth Pages
import LandingPage from '../pages/LandingPage';
import LoginPage from '../pages/auth/LoginPage';
import RegisterPage from '../pages/auth/RegisterPage';
import ForgotPasswordPage from '../pages/auth/ForgotPasswordPage';

// Dashboard Page
import DashboardPage from '../pages/dashboard/DashboardPage';

// Workspace Sub-Pages
import WorkspaceOverviewPage from '../pages/workspace/WorkspaceOverviewPage';
import WorkspaceProjectsPage from '../pages/workspace/WorkspaceProjectsPage';
import ProjectDetailPage from '../pages/workspace/ProjectDetailPage';
import ProjectBoardPage from '../pages/workspace/ProjectBoardPage';
import WorkspaceMembersPage from '../pages/workspace/WorkspaceMembersPage';
import WorkspaceActivityPage from '../pages/workspace/WorkspaceActivityPage';
import WorkspaceSettingsPage from '../pages/workspace/WorkspaceSettingsPage';

// User Global Pages
import NotificationsPage from '../pages/user/NotificationsPage';
import UserSettingsPage from '../pages/user/UserSettingsPage';

export function AppRoutes() {
  return (
    <Routes>
      {/* Root Public Landing Page */}
      <Route path="/" element={<LandingPage />} />

      {/* Auth Routes */}
      <Route element={<AuthLayout />}>
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />
        <Route path="/forgot-password" element={<ForgotPasswordPage />} />
      </Route>

      {/* App Workspace & Dashboard Routes */}
      <Route element={<DashboardLayout />}>
        <Route path="/dashboard" element={<DashboardPage />} />

        {/* Nested Workspace Routes */}
        <Route path="/workspace/:workspaceId" element={<WorkspaceLayout />}>
          <Route index element={<WorkspaceOverviewPage />} />
          <Route path="projects" element={<WorkspaceProjectsPage />} />
          <Route path="projects/:projectId" element={<ProjectDetailPage />} />
          <Route path="projects/:projectId/board" element={<ProjectBoardPage />} />
          <Route path="projects/:projectId/tasks" element={<ProjectBoardPage />} />
          <Route path="projects/:projectId/activity" element={<ProjectDetailPage />} />
          <Route path="members" element={<WorkspaceMembersPage />} />
          <Route path="activity" element={<WorkspaceActivityPage />} />
          <Route path="settings" element={<WorkspaceSettingsPage />} />
        </Route>

        <Route path="/notifications" element={<NotificationsPage />} />
        <Route path="/settings" element={<UserSettingsPage />} />
      </Route>

      {/* Fallback to Dashboard */}
      <Route path="*" element={<Navigate to="/dashboard" replace />} />
    </Routes>
  );
}

export default AppRoutes;
