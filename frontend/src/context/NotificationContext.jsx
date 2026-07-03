import React, { createContext, useContext, useState, useEffect } from "react";
import { notificationsApi } from "../api/notifications";
import { useAuth } from "./AuthContext";

const NotificationContext = createContext(null);

export const NotificationProvider = ({ children }) => {
  const { user } = useAuth();
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(false);
  const [toast, setToast] = useState(null); // { message, type }

  const fetchNotifications = async () => {
    if (!user) {
      setNotifications([]);
      return;
    }
    setLoading(true);
    try {
      const data = await notificationsApi.getNotifications();
      setNotifications(data);
    } catch (e) {
      console.error("Failed to load notifications", e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchNotifications();
  }, [user]);

  const showToast = (message, type = "success") => {
    setToast({ message, type });
    // Auto clear toast
    setTimeout(() => {
      setToast(null);
    }, 4000);
  };

  const markAsRead = async (id) => {
    try {
      const updated = await notificationsApi.markAsRead(id);
      setNotifications(prev => prev.map(n => n.id === id ? { ...n, read: true } : n));
    } catch (e) {
      console.error(e);
    }
  };

  const markAllAsRead = async () => {
    try {
      await notificationsApi.markAllAsRead();
      setNotifications(prev => prev.map(n => ({ ...n, read: true })));
      showToast("All notifications marked as read", "info");
    } catch (e) {
      console.error(e);
    }
  };

  const addNotification = async (type, title, message) => {
    if (!user) return;
    try {
      const newNotif = await notificationsApi.addNotification({
        userId: user.id,
        type,
        title,
        message
      });
      setNotifications(prev => [newNotif, ...prev]);
      showToast(`${title}: ${message}`, type === "job" ? "success" : "info");
    } catch (e) {
      console.error(e);
    }
  };

  const unreadCount = notifications.filter((n) => !n.read).length;

  return (
    <NotificationContext.Provider
      value={{
        notifications,
        unreadCount,
        loading,
        toast,
        showToast,
        markAsRead,
        markAllAsRead,
        addNotification,
        closeToast: () => setToast(null)
      }}
    >
      {children}
    </NotificationContext.Provider>
  );
};

export const useNotifications = () => {
  const context = useContext(NotificationContext);
  if (!context) {
    throw new Error("useNotifications must be used within a NotificationProvider");
  }
  return context;
};
