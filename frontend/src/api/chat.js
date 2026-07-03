import { mockChats } from "./mockData";

const delay = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

const getStoredChats = () => {
  const chats = localStorage.getItem("cn_chats");
  if (!chats) {
    localStorage.setItem("cn_chats", JSON.stringify(mockChats));
    return mockChats;
  }
  return JSON.parse(chats);
};

export const chatApi = {
  getConversations: async () => {
    await delay(300);
    const userStr = localStorage.getItem("cn_user");
    if (!userStr) return [];
    const user = JSON.parse(userStr);

    const chats = getStoredChats();
    // Return chats where the user is either student or mentor
    return chats.filter((c) => c.studentId === user.id || c.mentorId === user.id);
  },

  getChatById: async (chatId) => {
    await delay(150);
    const chats = getStoredChats();
    const chat = chats.find((c) => c.chatId === chatId);
    if (!chat) throw new Error("Conversation not found");
    return chat;
  },

  sendMessage: async (chatId, text) => {
    await delay(200);
    const userStr = localStorage.getItem("cn_user");
    if (!userStr) throw new Error("Please log in first.");
    const user = JSON.parse(userStr);

    const chats = getStoredChats();
    const idx = chats.findIndex((c) => c.chatId === chatId);
    if (idx === -1) throw new Error("Conversation not found");

    const newMessage = {
      senderId: user.id,
      text,
      timestamp: new Date().toISOString()
    };

    chats[idx].messages.push(newMessage);
    localStorage.setItem("cn_chats", JSON.stringify(chats));

    return { chat: chats[idx], message: newMessage };
  },

  createConversation: async (mentorId, mentorName, mentorAvatar, mentorTitle) => {
    await delay(200);
    const userStr = localStorage.getItem("cn_user");
    if (!userStr) throw new Error("Please log in first.");
    const user = JSON.parse(userStr);

    const chats = getStoredChats();
    // Check if conversation already exists
    let chat = chats.find((c) => (c.studentId === user.id && c.mentorId === mentorId) || (c.studentId === mentorId && c.mentorId === user.id));
    
    if (!chat) {
      chat = {
        chatId: `chat-${Date.now()}`,
        studentId: user.role === "student" ? user.id : mentorId,
        studentName: user.role === "student" ? user.name : "Alex Rivera",
        studentAvatar: user.role === "student" ? user.avatar : "https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?w=150",
        studentTitle: user.role === "student" ? user.title : "Computer Science Student at State University",
        mentorId: user.role === "alumni" ? user.id : mentorId,
        mentorName: user.role === "alumni" ? user.name : mentorName,
        mentorAvatar: user.role === "alumni" ? user.avatar : mentorAvatar,
        mentorTitle: user.role === "alumni" ? user.title : mentorTitle,
        messages: []
      };
      chats.push(chat);
      localStorage.setItem("cn_chats", JSON.stringify(chats));
    }
    return chat;
  },

  // Mock auto-reply for premium dynamic UX
  triggerAutoReply: async (chatId, senderId, senderName) => {
    await delay(1500);
    const chats = getStoredChats();
    const idx = chats.findIndex((c) => c.chatId === chatId);
    if (idx === -1) return null;

    const replies = [
      "Thanks for the message! I'm currently reviewing my calendar.",
      "That sounds interesting! Let's talk more about this during our next session.",
      "I would suggest reading through the Google coding guidelines first. Let me know what you think!",
      "Great question. Let's discuss this in detail. Can you send me a list of your preferred topics?",
      "I'll look at your resume shortly and provide feedback directly in the profiles tab."
    ];
    const randomText = replies[Math.floor(Math.random() * replies.length)];

    const autoMessage = {
      senderId, // Represents the other user (e.g. the mentor or student)
      text: `[Auto-Reply from ${senderName}] ${randomText}`,
      timestamp: new Date().toISOString()
    };

    chats[idx].messages.push(autoMessage);
    localStorage.setItem("cn_chats", JSON.stringify(chats));
    
    return autoMessage;
  }
};
