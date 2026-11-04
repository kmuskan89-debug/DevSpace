import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import api from '../utils/axios';
import { useAuth } from './AuthContext';

const NotificationContext = createContext(null);

export function NotificationProvider({ children }) {
  const { isAuthenticated } = useAuth();
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  const fetchUnreadCount = useCallback(async () => {
    if (!isAuthenticated) {
      setUnreadCount(0);
      return;
    }
    try {
      const res = await api.get('/notifications/unread-count');
      setUnreadCount(res.data?.unreadCount || 0);
    } catch (err) {
      // Quiet fail for badge polling
      console.warn('Failed to fetch unread notification count:', err?.message);
    }
  }, [isAuthenticated]);

  const fetchNotifications = useCallback(async () => {
    if (!isAuthenticated) {
      setNotifications([]);
      setUnreadCount(0);
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const res = await api.get('/notifications?limit=50');
      const fetched = res.data?.notifications || [];
      setNotifications(fetched);
      setUnreadCount(res.data?.unreadCount ?? fetched.filter((n) => !n.read).length);
    } catch (err) {
      console.error('Failed to fetch notifications:', err);
      setError(err?.response?.data?.message || 'Failed to load notifications');
    } finally {
      setIsLoading(false);
    }
  }, [isAuthenticated]);

  useEffect(() => {
    fetchNotifications();
  }, [fetchNotifications]);

  const markAsRead = async (notificationId) => {
    try {
      const res = await api.patch(`/notifications/${notificationId}/read`);
      setNotifications((prev) =>
        prev.map((n) => (n._id === notificationId ? { ...n, read: true } : n))
      );
      setUnreadCount((prev) => Math.max(0, prev - 1));
      return res.data;
    } catch (err) {
      console.error('Failed to mark notification as read:', err);
      throw err;
    }
  };

  const markAllAsRead = async () => {
    try {
      await api.patch('/notifications/read-all');
      setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
      setUnreadCount(0);
    } catch (err) {
      console.error('Failed to mark all as read:', err);
      throw err;
    }
  };

  const deleteNotification = async (notificationId) => {
    try {
      await api.delete(`/notifications/${notificationId}`);
      setNotifications((prev) => {
        const item = prev.find((n) => n._id === notificationId);
        if (item && !item.read) {
          setUnreadCount((c) => Math.max(0, c - 1));
        }
        return prev.filter((n) => n._id !== notificationId);
      });
    } catch (err) {
      console.error('Failed to delete notification:', err);
      throw err;
    }
  };

  return (
    <NotificationContext.Provider
      value={{
        notifications,
        unreadCount,
        isLoading,
        error,
        fetchNotifications,
        fetchUnreadCount,
        markAsRead,
        markAllAsRead,
        deleteNotification
      }}
    >
      {children}
    </NotificationContext.Provider>
  );
}

export function useNotifications() {
  const context = useContext(NotificationContext);
  if (!context) {
    throw new Error('useNotifications must be used within a NotificationProvider');
  }
  return context;
}

export default NotificationContext;

