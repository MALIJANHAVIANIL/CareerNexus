import apiClient from "./client";

const mapBackendNotificationToFrontend = (n) => {
  if (!n) return null;
  const typeTitles = {
    CHAT: "New Message",
    APPLICATION_STATUS: "Application Update",
    SYSTEM: "System Alert"
  };
  return {
    id: n.id.toString(),
    title: typeTitles[n.type] || "Notification",
    text: n.message,
    message: n.message,
    read: n.isRead,
    timestamp: n.createdAt ? n.createdAt.split("T")[0] : "Just now",
    type: n.type ? n.type.toLowerCase() : "system",
    category: n.type ? n.type.toLowerCase() : "system"
  };
};

export const notificationsApi = {
  getNotifications: async () => {
    const res = await apiClient.get("/api/notifications");
    return (res.data || []).map(mapBackendNotificationToFrontend);
  },

  markAsRead: async (notifId) => {
    await apiClient.put(`/api/notifications/${notifId}/read`);
    return await notificationsApi.getNotifications();
  },

  markAllAsRead: async () => {
    const list = await notificationsApi.getNotifications();
    for (const notif of list) {
      if (!notif.read) {
        try {
          await apiClient.put(`/api/notifications/${notif.id}/read`);
        } catch (err) {
          console.warn("Failed to mark notification as read:", err);
        }
      }
    }
    return await notificationsApi.getNotifications();
  },

  addNotification: async (notificationData) => {
    // Client-side addition for immediate local UI preview, usually done by backend trigger
    return {
      id: `notif-${Date.now()}`,
      read: false,
      timestamp: "Just now",
      ...notificationData
    };
  }
};
