import apiClient from "./client";

const mapBackendMentorToFrontend = (m) => {
  if (!m) return null;
  return {
    id: m.id.toString(),
    name: m.user.fullName,
    email: m.user.email,
    company: m.currentCompany || "Technology Corp",
    title: m.currentRole || "Industry Expert",
    domain: m.industry || "Software Engineering",
    rating: 4.8,
    avatar: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150",
    skills: m.skills ? m.skills.split(",").map(s => s.trim()) : ["Software Engineering", "System Design"],
    experience: m.graduationYear ? `${new Date().getFullYear() - m.graduationYear}+ years` : "3+ years"
  };
};

const mapBackendRequestToFrontend = (r) => {
  if (!r) return null;
  return {
    id: r.id.toString(),
    studentId: r.studentId.toString(),
    studentName: r.studentName,
    studentAvatar: "https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?w=150",
    studentTitle: "Student",
    mentorId: r.mentorId.toString(),
    mentorName: r.mentorName,
    domain: "Software Engineering",
    message: r.message,
    status: r.status ? r.status.toLowerCase() : "pending",
    date: r.createdAt ? r.createdAt.split("T")[0] : "Just now"
  };
};

export const mentorshipApi = {
  getMentors: async () => {
    const res = await apiClient.get("/api/users/mentors");
    return (res.data || []).map(mapBackendMentorToFrontend);
  },

  sendRequest: async (mentorId, domain, message) => {
    const res = await apiClient.post("/api/mentorship/request", {
      mentorId: parseInt(mentorId, 10),
      message: `[Domain: ${domain}] ${message}`
    });
    return mapBackendRequestToFrontend(res.data);
  },

  getRequests: async (role, userId) => {
    const endpoint = role === "alumni" ? "/api/mentorship/mentor/requests" : "/api/mentorship/student/requests";
    const res = await apiClient.get(endpoint);
    return (res.data || []).map(mapBackendRequestToFrontend);
  },

  updateRequestStatus: async (requestId, status) => {
    const backendStatus = status === "approved" ? "APPROVED" : "REJECTED";
    const res = await apiClient.put(`/api/mentorship/request/${requestId}/respond`, {
      status: backendStatus,
      response: `Request has been ${status}`
    });

    const mapped = mapBackendRequestToFrontend(res.data);

    // If approved, initialize a chat conversation automatically
    if (status === "approved") {
      try {
        await apiClient.post("/api/chat/send", {
          recipientId: parseInt(mapped.studentId, 10),
          content: "Hello! I have approved your mentorship request. Let's schedule some time to chat."
        });
      } catch (err) {
        console.warn("Failed to automatically start chat conversation:", err);
      }
    }

    return mapped;
  }
};
