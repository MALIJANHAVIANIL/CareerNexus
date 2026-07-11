import apiClient from "./client";

const mapBackendConversationToFrontend = (conv) => {
  if (!conv) return null;
  return {
    chatId: conv.chatId,
    studentId: conv.studentId,
    studentName: conv.studentName,
    studentAvatar: conv.studentAvatar || "https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?w=150",
    studentTitle: conv.studentTitle,
    mentorId: conv.mentorId,
    mentorName: conv.mentorName,
    mentorAvatar: conv.mentorAvatar || "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150",
    mentorTitle: conv.mentorTitle,
    messages: (conv.messages || []).map((m) => ({
      senderId: m.senderId,
      text: m.content,
      timestamp: m.timestamp
    }))
  };
};

export const chatApi = {
  getConversations: async () => {
    const res = await apiClient.get("/api/chat/conversations");
    return (res.data || []).map(mapBackendConversationToFrontend);
  },

  getChatById: async (chatId) => {
    const list = await chatApi.getConversations();
    const chat = list.find((c) => c.chatId === chatId);
    if (!chat) {
      // Return a skeleton conversation
      const otherId = chatId.split("-")[1];
      return {
        chatId,
        studentId: 1,
        studentName: "Student",
        studentAvatar: "https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?w=150",
        studentTitle: "Computer Engineering Student",
        mentorId: parseInt(otherId, 10),
        mentorName: "Mentor",
        mentorAvatar: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150",
        mentorTitle: "Industry Mentor",
        messages: []
      };
    }
    return chat;
  },

  sendMessage: async (chatId, text) => {
    const otherUserId = chatId.split("-")[1];
    const res = await apiClient.post("/api/chat/send", {
      recipientId: parseInt(otherUserId, 10),
      content: text
    });

    const newMessage = {
      senderId: res.data.senderId,
      text: res.data.content,
      timestamp: res.data.timestamp
    };

    // Refetch updated conversation to return correct full state
    const updatedChat = await chatApi.getChatById(chatId);

    return { chat: updatedChat, message: newMessage };
  },

  createConversation: async (mentorId, mentorName, mentorAvatar, mentorTitle) => {
    // Send a system greeting message to start the database conversation trace
    await apiClient.post("/api/chat/send", {
      recipientId: parseInt(mentorId, 10),
      content: "Hello! I would like to connect with you for mentorship."
    });

    const list = await chatApi.getConversations();
    return list.find((c) => c.chatId === `chat-${mentorId}`) || {
      chatId: `chat-${mentorId}`,
      studentId: 1,
      studentName: "Student",
      studentAvatar: "https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?w=150",
      studentTitle: "Computer Engineering Student",
      mentorId: parseInt(mentorId, 10),
      mentorName,
      mentorAvatar,
      mentorTitle,
      messages: []
    };
  },

  triggerAutoReply: async (chatId, senderId, senderName) => {
    // Return a local auto reply or let it wait
    return null;
  }
};
