import apiClient from "./client";

const mapBackendEventToFrontend = (evt, registeredIds = []) => {
  if (!evt) return null;
  return {
    id: evt.id.toString(),
    title: evt.title,
    description: evt.description,
    speaker: evt.speaker,
    date: evt.startTime ? evt.startTime.split("T")[0] : "Upcoming",
    time: evt.startTime ? evt.startTime.split("T")[1].substring(0, 5) : "14:00",
    location: evt.location,
    company: evt.companyName || "CareerNexus",
    image: "https://images.unsplash.com/photo-1540575467063-178a50c2df87?w=600",
    registeredUsers: registeredIds
  };
};

export const eventsApi = {
  getEvents: async () => {
    const res = await apiClient.get("/api/events");
    let registeredIds = [];
    const userStr = localStorage.getItem("cn_user");
    if (userStr) {
      const user = JSON.parse(userStr);
      try {
        const regRes = await apiClient.get("/api/events/registered");
        registeredIds = (regRes.data || []).map((e) => e.id.toString());
      } catch (err) {
        console.warn("Failed to fetch registered events:", err);
      }
    }

    return (res.data || []).map((evt) => {
      const user = userStr ? JSON.parse(userStr) : null;
      const isRegistered = registeredIds.includes(evt.id.toString());
      return mapBackendEventToFrontend(evt, isRegistered && user ? [user.id] : []);
    });
  },

  getEventById: async (eventId) => {
    const res = await apiClient.get(`/api/events/${eventId}`);
    return mapBackendEventToFrontend(res.data);
  },

  registerForEvent: async (eventId) => {
    const userStr = localStorage.getItem("cn_user");
    if (!userStr) throw new Error("Please log in first.");
    const user = JSON.parse(userStr);

    await apiClient.post(`/api/events/${eventId}/register`);

    // Verify status by refetching registered list
    const regRes = await apiClient.get("/api/events/registered");
    const registeredIds = (regRes.data || []).map((e) => e.id.toString());
    const isRegistered = registeredIds.includes(eventId.toString());

    const evtRes = await apiClient.get(`/api/events/${eventId}`);
    return mapBackendEventToFrontend(evtRes.data, isRegistered ? [user.id] : []);
  },

  createEvent: async (eventData) => {
    let startIso = eventData.startTime;
    let endIso = eventData.endTime;

    if (!startIso) {
      const start = new Date();
      start.setDate(start.getDate() + 3);
      startIso = start.toISOString().substring(0, 16);
      const end = new Date(start);
      end.setHours(end.getHours() + 2);
      endIso = end.toISOString().substring(0, 16);
    }

    const payload = {
      title: eventData.title,
      description: eventData.description,
      companyId: null,
      speaker: eventData.speaker || "Guest Speaker",
      startTime: startIso,
      endTime: endIso,
      location: eventData.location || "Online"
    };

    const res = await apiClient.post("/api/events", payload);
    return mapBackendEventToFrontend(res.data);
  }
};
