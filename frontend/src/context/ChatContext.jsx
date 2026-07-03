import React, { createContext, useContext, useState, useEffect, useRef } from "react";
import { chatApi } from "../api/chat";
import { useAuth } from "./AuthContext";
import { useNotifications } from "./NotificationContext";

const ChatContext = createContext(null);

export const ChatProvider = ({ children }) => {
  const { user } = useAuth();
  const { addNotification } = useNotifications();
  const [conversations, setConversations] = useState([]);
  const [activeChat, setActiveChat] = useState(null); // Full chat object
  const [unreadCounts, setUnreadCounts] = useState({});
  const [loading, setLoading] = useState(false);

  const activeChatRef = useRef(activeChat);
  useEffect(() => {
    activeChatRef.current = activeChat;
  }, [activeChat]);

  const fetchConversations = async () => {
    if (!user) {
      setConversations([]);
      setActiveChat(null);
      return;
    }
    setLoading(true);
    try {
      const data = await chatApi.getConversations();
      setConversations(data);
      if (data.length > 0 && !activeChat) {
        // Default to first chat
        setActiveChat(data[0]);
        // Initialize other chats with a mock unread count for premium feel
        const mockUnreads = {};
        data.forEach((c, idx) => {
          mockUnreads[c.chatId] = idx === 0 ? 0 : 2;
        });
        setUnreadCounts(mockUnreads);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchConversations();
  }, [user]);

  const selectChat = (chatId) => {
    const found = conversations.find(c => c.chatId === chatId);
    if (found) {
      setActiveChat(found);
      setUnreadCounts(prev => ({
        ...prev,
        [chatId]: 0
      }));
    }
  };

  const sendMessage = async (chatId, text) => {
    if (!user) return;
    try {
      const { chat, message } = await chatApi.sendMessage(chatId, text);
      
      // Update conversations state
      setConversations(prev => prev.map(c => c.chatId === chatId ? chat : c));
      
      // Update active chat if currently viewing it
      if (activeChatRef.current?.chatId === chatId) {
        setActiveChat(chat);
      }

      // Check if we should trigger an auto reply
      const isMentor = user.role === "alumni";
      const otherUserId = isMentor ? chat.studentId : chat.mentorId;
      const otherUserName = isMentor ? chat.studentName || "Alex Rivera" : chat.mentorName || "Sarah Chen";

      // Trigger automatic reply after a delay
      chatApi.triggerAutoReply(chatId, otherUserId, otherUserName).then((autoMsg) => {
        if (autoMsg) {
          // Re-fetch or update state
          chatApi.getChatById(chatId).then((updatedChat) => {
            setConversations(prev => prev.map(c => c.chatId === chatId ? updatedChat : c));
            
            // If active chat is still the same, update it
            if (activeChatRef.current?.chatId === chatId) {
              setActiveChat(updatedChat);
            } else {
              // Otherwise increment unread badge count
              setUnreadCounts(prev => ({
                ...prev,
                [chatId]: (prev[chatId] || 0) + 1
              }));
            }
            
            // Trigger a push notification for new message
            addNotification("mentorship", "New Message", `${otherUserName}: ${autoMsg.text.replace(/\[.*\]\s/, "")}`);
          });
        }
      });

    } catch (e) {
      console.error(e);
    }
  };

  const startChat = async (mentorId, mentorName, mentorAvatar, mentorTitle) => {
    if (!user) return;
    try {
      const newChat = await chatApi.createConversation(mentorId, mentorName, mentorAvatar, mentorTitle);
      
      setConversations(prev => {
        const alreadyExists = prev.some(c => c.chatId === newChat.chatId);
        if (alreadyExists) return prev;
        return [...prev, newChat];
      });
      
      setActiveChat(newChat);
      setUnreadCounts(prev => ({
        ...prev,
        [newChat.chatId]: 0
      }));
      return newChat;
    } catch (e) {
      console.error(e);
    }
  };

  return (
    <ChatContext.Provider
      value={{
        conversations,
        activeChat,
        unreadCounts,
        loading,
        selectChat,
        sendMessage,
        startChat,
        refreshChats: fetchConversations
      }}
    >
      {children}
    </ChatContext.Provider>
  );
};

export const useChat = () => {
  const context = useContext(ChatContext);
  if (!context) {
    throw new Error("useChat must be used within a ChatProvider");
  }
  return context;
};

export default ChatContext;
