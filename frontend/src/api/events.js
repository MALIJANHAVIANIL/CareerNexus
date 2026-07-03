import { mockEvents } from "./mockData";

const delay = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

const getStoredEvents = () => {
  const evts = localStorage.getItem("cn_events");
  if (!evts) {
    localStorage.setItem("cn_events", JSON.stringify(mockEvents));
    return mockEvents;
  }
  return JSON.parse(evts);
};

export const eventsApi = {
  getEvents: async () => {
    await delay(300);
    return getStoredEvents();
  },

  getEventById: async (eventId) => {
    await delay(100);
    const evts = getStoredEvents();
    const evt = evts.find((e) => e.id === eventId);
    if (!evt) throw new Error("Event not found");
    return evt;
  },

  registerForEvent: async (eventId) => {
    await delay(500);
    const userStr = localStorage.getItem("cn_user");
    if (!userStr) throw new Error("Please log in first.");
    const user = JSON.parse(userStr);

    const evts = getStoredEvents();
    const idx = evts.findIndex((e) => e.id === eventId);
    if (idx === -1) throw new Error("Event not found");

    if (!evts[idx].registeredUsers) evts[idx].registeredUsers = [];

    const regIdx = evts[idx].registeredUsers.indexOf(user.id);
    if (regIdx > -1) {
      evts[idx].registeredUsers.splice(regIdx, 1); // Unregister
    } else {
      evts[idx].registeredUsers.push(user.id);
    }

    localStorage.setItem("cn_events", JSON.stringify(evts));
    return evts[idx];
  },

  createEvent: async (eventData) => {
    await delay(700);
    const evts = getStoredEvents();
    const newEvent = {
      id: `evt-${Date.now()}`,
      registeredUsers: [],
      image: "https://images.unsplash.com/photo-1540575467063-178a50c2df87?w=600", // Default event header
      ...eventData
    };
    evts.unshift(newEvent);
    localStorage.setItem("cn_events", JSON.stringify(evts));
    return newEvent;
  }
};
