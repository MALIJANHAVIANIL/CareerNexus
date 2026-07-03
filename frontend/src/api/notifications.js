import { mockNotifications } from "./mockData";

const delay = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

const getStoredNotifications = () => {
  const notifs = localStorage.getItem("cn_notifications");
  if (!notifs) {
    localStorage.setItem("cn_notifications", JSON.stringify(mockNotifications));
    return mockNotifications;
  }
  return JSON.parse(notifs);
};

export const notificationsApi = {
  getNotifications: async () => {
    await delay(300);
    const userStr = localStorage.getItem("cn_user");
    if (!userStr) return [];
    const user = JSON.parse(userStr);

    const notifs = getStoredNotifications();
    return notifs.filter((n) => n.userId === user.id || n.userId === "all" || !n.userId);
  },

  markAsRead: async (notifId) => {
    await delay(100);
    const notifs = getStoredNotifications();
    const idx = notifs.findIndex((n) => n.id === notifId);
    if (idx > -1) {
      notifs[idx].read = true;
      localStorage.setItem("cn_notifications", JSON.stringify(notifs));
    }
    return notifs;
  },

  markAllAsRead: async () => {
    await delay(200);
    const notifs = getStoredNotifications();
    const updated = notifs.map((n) => ({ ...n, read: true }));
    localStorage.setItem("cn_notifications", JSON.stringify(updated));
    return updated;
  },

  addNotification: async (notificationData) => {
    const notifs = getStoredNotifications();
    const newNotif = {
      id: `notif-${Date.now()}`,
      read: false,
      timestamp: "Just now",
      ...notificationData
    };
    notifs.unshift(newNotif);
    localStorage.setItem("cn_notifications", JSON.stringify(notifs));
    return newNotif;
  }
};
