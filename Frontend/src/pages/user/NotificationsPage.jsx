import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Bell,
  CheckCircle2,
  CheckSquare,
  MessageSquare,
  UserPlus,
  Trash2,
  ArrowRight,
  Inbox,
  Clock,
  Kanban
} from 'lucide-react';
import Card from '../../components/common/Card';
import Button from '../../components/common/Button';
import Tabs from '../../components/common/Tabs';
import Avatar from '../../components/common/Avatar';
import EmptyState from '../../components/common/EmptyState';
import SkeletonLoader from '../../components/common/SkeletonLoader';
import { useToast } from '../../components/common/Toast';
import { useNotifications } from '../../context/NotificationContext';

export function NotificationsPage() {
  const navigate = useNavigate();
  const { addToast } = useToast();
  const {
    notifications,
    unreadCount,
    isLoading,
    markAsRead,
    markAllAsRead,
    deleteNotification
  } = useNotifications();

  const [activeTab, setActiveTab] = useState('all');

  const handleMarkAllRead = async () => {
    try {
      await markAllAsRead();
      addToast('All notifications marked as read', 'success');
    } catch (err) {
      addToast('Failed to mark all as read', 'danger');
    }
  };

  const handleNotificationClick = async (n) => {
    if (!n.read) {
      try {
        await markAsRead(n._id);
      } catch (err) {
        console.warn('Failed to mark notification read:', err);
      }
    }
    if (n.link) {
      navigate(n.link);
    }
  };

  const handleDelete = async (e, id) => {
    e.stopPropagation();
    try {
      await deleteNotification(id);
      addToast('Notification dismissed', 'info');
    } catch (err) {
      addToast('Failed to delete notification', 'danger');
    }
  };

  const filteredNotifications = notifications.filter((n) => {
    if (activeTab === 'unread') return !n.read;
    if (activeTab === 'task') {
      return (
        n.type === 'TASK_ASSIGNED' ||
        n.type === 'TASK_UPDATED' ||
        n.type === 'task' ||
        n.type?.startsWith?.('TASK_')
      );
    }
    if (activeTab === 'comments') return n.type === 'COMMENT_ADDED';
    if (activeTab === 'invitations') {
      return (
        n.type === 'WORKSPACE_INVITATION' ||
        n.type === 'ROLE_UPDATED' ||
        n.type === 'MEMBER_JOINED'
      );
    }
    return true;
  });

  const tabOptions = [
    { id: 'all', label: 'All', badge: notifications.length },
    { id: 'unread', label: 'Unread', badge: unreadCount },
    { id: 'task', label: 'Tasks', icon: CheckSquare },
    { id: 'comments', label: 'Comments', icon: MessageSquare },
    { id: 'invitations', label: 'Team & Invites', icon: UserPlus }
  ];

  const getNotificationIcon = (type) => {
    switch (type) {
      case 'TASK_ASSIGNED':
      case 'TASK_UPDATED':
      case 'task':
        return <CheckSquare className="w-3.5 h-3.5 text-[#252525] dark:text-[#F2F2F2]" />;
      case 'COMMENT_ADDED':
        return <MessageSquare className="w-3.5 h-3.5 text-[#252525] dark:text-[#F2F2F2]" />;
      case 'WORKSPACE_INVITATION':
      case 'ROLE_UPDATED':
      case 'MEMBER_JOINED':
        return <UserPlus className="w-3.5 h-3.5 text-[#252525] dark:text-[#F2F2F2]" />;
      case 'SPRINT_STARTED':
      case 'SPRINT_COMPLETED':
        return <Kanban className="w-3.5 h-3.5 text-[#252525] dark:text-[#F2F2F2]" />;
      default:
        return <Bell className="w-3.5 h-3.5 text-[#252525] dark:text-[#F2F2F2]" />;
    }
  };

  const formatTimestamp = (createdAt) => {
    if (!createdAt) return 'Just now';
    const date = new Date(createdAt);
    const now = new Date();
    const diffMs = now - date;
    const diffMins = Math.floor(diffMs / 60000);
    if (diffMins < 1) return 'Just now';
    if (diffMins < 60) return `${diffMins}m ago`;
    const diffHours = Math.floor(diffMins / 60);
    if (diffHours < 24) return `${diffHours}h ago`;
    const diffDays = Math.floor(diffHours / 24);
    if (diffDays < 7) return `${diffDays}d ago`;
    return date.toLocaleDateString(undefined, {
      month: 'short',
      day: 'numeric'
    });
  };

  return (
    <div className="space-y-5 max-w-4xl">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-[#E8E8E5] dark:border-[#353535]">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl font-semibold text-[#252525] dark:text-[#F2F2F2] my-0 tracking-tight">
              Notifications
            </h1>
            {unreadCount > 0 && (
              <span className="px-2 py-0.5 rounded text-xs font-mono font-medium bg-[#252525] dark:bg-[#F2F2F2] text-[#FFFFFF] dark:text-[#191919]">
                {unreadCount} unread
              </span>
            )}
          </div>
          <p className="text-xs text-[#777777] dark:text-[#A0A0A0] mt-0.5">
            Stay updated on task assignments, comments, team invites, and project updates.
          </p>
        </div>

        <Button
          variant="outline"
          size="sm"
          icon={CheckCircle2}
          onClick={handleMarkAllRead}
          disabled={unreadCount === 0}
          className="h-8 text-xs shrink-0"
        >
          Mark all as read
        </Button>
      </div>

      {/* Tabs */}
      <Tabs tabs={tabOptions} activeTab={activeTab} onChange={setActiveTab} />

      {/* Notifications List */}
      <div className="space-y-2">
        {isLoading && notifications.length === 0 ? (
          <div className="space-y-2">
            <SkeletonLoader variant="card" count={3} />
          </div>
        ) : filteredNotifications.length > 0 ? (
          filteredNotifications.map((n) => {
            const isUnread = !n.read;
            return (
              <div
                key={n._id}
                onClick={() => handleNotificationClick(n)}
                className={`p-3.5 rounded-lg border transition-all cursor-pointer group flex items-start gap-3 ${
                  isUnread
                    ? 'border-[#252525] dark:border-[#F2F2F2] bg-[#FFFFFF] dark:bg-[#222222] shadow-xs'
                    : 'border-[#E8E8E5] dark:border-[#353535] bg-[#FFFFFF] dark:bg-[#202020] hover:border-[#D0D0CC] dark:hover:border-[#444444]'
                }`}
              >
                {/* Type Icon */}
                <div
                  className={`w-7 h-7 rounded-md flex items-center justify-center shrink-0 mt-0.5 ${
                    isUnread
                      ? 'bg-[#F1F1EF] dark:bg-[#2A2A2A] border border-[#E8E8E5] dark:border-[#353535]'
                      : 'bg-[#F7F7F5] dark:bg-[#1A1A1A] border border-[#E8E8E5] dark:border-[#303030]'
                  }`}
                >
                  {getNotificationIcon(n.type)}
                </div>

                {/* Content */}
                <div className="flex-1 min-w-0 space-y-1">
                  <div className="flex items-center justify-between gap-2">
                    <div className="flex items-center gap-2 min-w-0">
                      <span className="text-xs font-semibold text-[#252525] dark:text-[#F2F2F2] truncate">
                        {n.title}
                      </span>
                      {isUnread && (
                        <span className="w-1.5 h-1.5 rounded-full bg-[#252525] dark:bg-[#F2F2F2] shrink-0" />
                      )}
                    </div>
                    <span className="text-[10px] font-mono text-[#999999] dark:text-[#666666] shrink-0 flex items-center gap-1">
                      <Clock className="w-2.5 h-2.5" />
                      {formatTimestamp(n.createdAt)}
                    </span>
                  </div>

                  <p className="text-xs text-[#555555] dark:text-[#B0B0B0] leading-relaxed my-0">
                    {n.message}
                  </p>

                  {n.workspace?.name && (
                    <div className="pt-1 flex items-center gap-2 text-[10px] font-mono text-[#777777] dark:text-[#A0A0A0]">
                      <span>Workspace: {n.workspace.name}</span>
                    </div>
                  )}
                </div>

                {/* Dismiss Button & Arrow */}
                <div className="flex items-center gap-1 shrink-0 self-center pl-1">
                  <button
                    type="button"
                    onClick={(e) => handleDelete(e, n._id)}
                    className="p-1.5 rounded text-[#999999] hover:text-[#D83B01] dark:hover:text-[#F87171] opacity-0 group-hover:opacity-100 transition-opacity hover:bg-[#FDF3F2] dark:hover:bg-[#2D1818] cursor-pointer"
                    title="Dismiss"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                  <ArrowRight className="w-3.5 h-3.5 text-[#999999] group-hover:text-[#252525] dark:group-hover:text-[#F2F2F2] transition-colors" />
                </div>
              </div>
            );
          })
        ) : (
          <EmptyState
            icon={Inbox}
            title={activeTab === 'unread' ? 'No unread notifications' : 'All caught up'}
            description={
              activeTab === 'unread'
                ? 'You have reviewed all current notifications.'
                : 'Workspace updates, assigned tasks, and invitations will appear here.'
            }
            className="py-12"
          />
        )}
      </div>
    </div>
  );
}

export default NotificationsPage;
