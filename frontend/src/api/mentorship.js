import { mockMentors, mockMentorshipRequests } from "./mockData";

const delay = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

const getStoredRequests = () => {
  const reqs = localStorage.getItem("cn_mentorship_requests");
  if (!reqs) {
    localStorage.setItem("cn_mentorship_requests", JSON.stringify(mockMentorshipRequests));
    return mockMentorshipRequests;
  }
  return JSON.parse(reqs);
};

export const mentorshipApi = {
  getMentors: async () => {
    await delay(400);
    return mockMentors;
  },

  sendRequest: async (mentorId, domain, message) => {
    await delay(700);
    const userStr = localStorage.getItem("cn_user");
    if (!userStr) throw new Error("Please log in first.");
    const user = JSON.parse(userStr);

    const reqs = getStoredRequests();
    
    // Check if request already exists
    const exists = reqs.some((r) => r.mentorId === mentorId && r.studentId === user.id && r.status === "pending");
    if (exists) throw new Error("You already have a pending request for this mentor.");

    const newRequest = {
      id: `req-${Date.now()}`,
      studentId: user.id,
      studentName: user.name,
      studentAvatar: user.avatar,
      studentTitle: user.title || "Student",
      mentorId,
      domain,
      message,
      status: "pending",
      date: new Date().toISOString().split("T")[0]
    };

    reqs.unshift(newRequest);
    localStorage.setItem("cn_mentorship_requests", JSON.stringify(reqs));
    return newRequest;
  },

  getRequests: async (role, userId) => {
    await delay(300);
    const reqs = getStoredRequests();
    if (role === "alumni") {
      // In real app, we map alumni's mentor ID. Here, user-2 is Sarah Chen.
      return reqs.filter((r) => r.mentorId === userId || r.mentorId === "user-2"); 
    }
    return reqs.filter((r) => r.studentId === userId);
  },

  updateRequestStatus: async (requestId, status) => {
    await delay(500);
    const reqs = getStoredRequests();
    const idx = reqs.findIndex((r) => r.id === requestId);
    if (idx === -1) throw new Error("Request not found");

    reqs[idx].status = status;
    localStorage.setItem("cn_mentorship_requests", JSON.stringify(reqs));

    // If approved, create a new mock chat room automatically!
    if (status === "approved") {
      const chats = JSON.parse(localStorage.getItem("cn_chats") || "[]");
      const request = reqs[idx];
      const mentor = mockMentors.find((m) => m.id === request.mentorId || m.name === "Sarah Chen");
      
      const chatId = `chat-approved-${request.id}`;
      const chatExists = chats.some((c) => c.chatId === chatId);
      
      if (!chatExists) {
        const newChat = {
          chatId,
          studentId: request.studentId,
          mentorId: request.mentorId,
          mentorName: mentor ? mentor.name : "Sarah Chen",
          mentorAvatar: mentor ? mentor.avatar : "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150",
          mentorTitle: mentor ? mentor.title : "Senior Engineer at Google",
          messages: [
            {
              senderId: request.mentorId,
              text: `Hello ${request.studentName}! I have approved your mentorship request. Let's schedule some time to chat.`,
              timestamp: new Date().toISOString()
            }
          ]
        };
        chats.unshift(newChat);
        localStorage.setItem("cn_chats", JSON.stringify(chats));
      }
    }

    return reqs[idx];
  }
};
