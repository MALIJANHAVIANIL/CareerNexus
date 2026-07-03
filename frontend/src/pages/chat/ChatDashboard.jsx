import React, { useState, useEffect, useRef } from "react";
import {
  MessageSquare,
  Users,
  Send,
  Search,
  CheckCheck,
  Building,
  User,
  Sparkles,
  MapPin,
  Clock,
  ArrowLeft
} from "lucide-react";
import { useAuth } from "../../context/AuthContext";
import { useChat } from "../../context/ChatContext";
import { useNotifications } from "../../context/NotificationContext";
import Card, { CardBody } from "../../components/common/Card";
import Button from "../../components/common/Button";

// Comprehensive Mock Alumni Contact List
const ALUMNI_CONTACTS = [
  {
    id: "mentor-1",
    name: "Vikramaditya Roy",
    company: "Microsoft Corporation",
    title: "Senior Software Architect",
    avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&q=80&w=150"
  },
  {
    id: "mentor-2",
    name: "Pooja Deshmukh",
    company: "Amazon Web Services (AWS)",
    title: "Cloud Infrastructure Engineer",
    avatar: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&q=80&w=150"
  },
  {
    id: "mentor-3",
    name: "Amit Patil",
    company: "NVIDIA Graphics",
    title: "AI Research Scientist",
    avatar: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&q=80&w=150"
  },
  {
    id: "mentor-4",
    name: "Janhavi Kulkarni",
    company: "Google India",
    title: "Frontend Engineer",
    avatar: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?auto=format&fit=crop&q=80&w=150"
  },
  {
    id: "mentor-5",
    name: "Rohan Mehta",
    company: "JPMorgan Chase & Co.",
    title: "Software Engineer",
    avatar: "https://images.unsplash.com/photo-1522075469751-3a6694fb2f61?auto=format&fit=crop&q=80&w=150"
  },
  {
    id: "mentor-6",
    name: "Sneha Nair",
    company: "Meta India",
    title: "Technical Product Manager",
    avatar: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=150"
  }
];

export const ChatDashboard = () => {
  const { user } = useAuth();
  const { conversations, activeChat, unreadCounts, selectChat, sendMessage, startChat, loading: chatsLoading } = useChat();
  const { showToast } = useNotifications();

  // Left sidebar tabs: 'chats' | 'contacts'
  const [leftTab, setLeftTab] = useState("chats");
  
  // Search query states
  const [chatSearch, setChatSearch] = useState("");
  const [contactSearch, setContactSearch] = useState("");
  
  // Message text input
  const [typedMessage, setTypedMessage] = useState("");
  const messagesEndRef = useRef(null);

  // Auto-scroll to message window bottom
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [activeChat?.messages]);

  const handleSendChat = (e) => {
    e.preventDefault();
    if (!typedMessage.trim() || !activeChat) return;

    sendMessage(activeChat.chatId, typedMessage.trim());
    setTypedMessage("");
  };

  const handleContactClick = async (contact) => {
    try {
      const activeObj = await startChat(contact.id, contact.name, contact.avatar, `${contact.title} at ${contact.company}`);
      if (activeObj) {
        showToast(`Conversation started with ${contact.name}!`, "success");
      }
      setLeftTab("chats");
    } catch (err) {
      showToast("Could not start conversation.", "error");
    }
  };

  // Filters for active conversations list
  const filteredConversations = conversations.filter((conv) => {
    const isMentor = user?.role === "alumni";
    const nameToCheck = isMentor ? conv.studentName : conv.mentorName;
    const titleToCheck = isMentor ? conv.studentTitle : conv.mentorTitle;
    
    const term = chatSearch.toLowerCase();
    return (
      (nameToCheck?.toLowerCase().includes(term) ||
      titleToCheck?.toLowerCase().includes(term) ||
      conv.messages.some(m => m.text.toLowerCase().includes(term)))
    );
  });

  // Filters for contact list
  const filteredContacts = ALUMNI_CONTACTS.filter((contact) => {
    const term = contactSearch.toLowerCase();
    return (
      contact.name.toLowerCase().includes(term) ||
      contact.company.toLowerCase().includes(term) ||
      contact.title.toLowerCase().includes(term)
    );
  });

  return (
    <div className="space-y-4 animate-fade-in">
      {/* Banner info */}
      <div className="bg-white border border-gray-150 rounded-2xl p-5 shadow-sm flex justify-between items-center">
        <div className="flex flex-col gap-0.5">
          <h2 className="text-xl font-extrabold text-gray-900 font-outfit">Alumni Messaging Hub</h2>
          <p className="text-xs text-gray-500 font-sans">Engage in real-time career guidance, portfolio discussions, and mock coaching.</p>
        </div>
      </div>

      {/* Main chat UI container */}
      <div className="grid grid-cols-1 md:grid-cols-3 bg-white border border-gray-150 rounded-2xl shadow-sm overflow-hidden h-[70vh] relative">
        
        {/* Left Column: Conversations / Contacts toggle lists */}
        <div className="border-r border-gray-150 flex flex-col md:col-span-1 h-full bg-white">
          
          {/* Sub-tabs toggles */}
          <div className="flex border-b border-gray-150 bg-gray-50/50">
            <button
              onClick={() => setLeftTab("chats")}
              className={`flex-1 py-3 text-xs font-bold font-outfit uppercase border-b-2 text-center transition flex items-center justify-center gap-1.5 ${
                leftTab === "chats"
                  ? "border-brand-red text-brand-red font-black bg-white"
                  : "border-transparent text-gray-400 hover:text-gray-600 hover:bg-gray-50"
              }`}
            >
              <MessageSquare size={13} />
              Chats
            </button>
            <button
              onClick={() => setLeftTab("contacts")}
              className={`flex-1 py-3 text-xs font-bold font-outfit uppercase border-b-2 text-center transition flex items-center justify-center gap-1.5 ${
                leftTab === "contacts"
                  ? "border-brand-red text-brand-red font-black bg-white"
                  : "border-transparent text-gray-400 hover:text-gray-600 hover:bg-gray-50"
              }`}
            >
              <Users size={13} />
              Alumni Contacts
            </button>
          </div>

          {/* Search bar inside Left Column */}
          <div className="p-3 bg-gray-50/20 border-b border-gray-100 relative">
            <Search className="absolute left-6.5 top-6.5 h-3.5 w-3.5 text-gray-400" />
            {leftTab === "chats" ? (
              <input
                type="text"
                placeholder="Search chats..."
                value={chatSearch}
                onChange={(e) => setChatSearch(e.target.value)}
                className="w-full pl-9 pr-4 py-2 bg-white rounded-xl border border-gray-250 text-xs focus:outline-none focus:ring-1 focus:ring-brand-red focus:border-brand-red hover:border-gray-300"
              />
            ) : (
              <input
                type="text"
                placeholder="Search alumni directory..."
                value={contactSearch}
                onChange={(e) => setContactSearch(e.target.value)}
                className="w-full pl-9 pr-4 py-2 bg-white rounded-xl border border-gray-250 text-xs focus:outline-none focus:ring-1 focus:ring-brand-red focus:border-brand-red hover:border-gray-300"
              />
            )}
          </div>

          {/* Directory Listings */}
          <div className="flex-1 overflow-y-auto divide-y divide-gray-50">
            {leftTab === "chats" ? (
              chatsLoading ? (
                <div className="p-4 space-y-3">
                  {[1, 2].map(i => (
                    <div key={i} className="animate-pulse flex items-center gap-3">
                      <div className="h-10 w-10 bg-gray-200 rounded-xl" />
                      <div className="flex-1 space-y-2">
                        <div className="h-3 bg-gray-200 rounded w-1/3" />
                        <div className="h-2.5 bg-gray-200 rounded w-2/3" />
                      </div>
                    </div>
                  ))}
                </div>
              ) : filteredConversations.length === 0 ? (
                <div className="p-8 text-center text-gray-400 text-xs flex flex-col items-center gap-2 font-outfit mt-4">
                  <MessageSquare size={28} className="opacity-40 text-brand-red" />
                  <span>No active conversations.</span>
                  <button
                    onClick={() => setLeftTab("contacts")}
                    className="text-brand-red font-bold hover:underline uppercase text-[9px] mt-1 tracking-wider"
                  >
                    Browse Contacts Directory
                  </button>
                </div>
              ) : (
                filteredConversations.map((conv) => {
                  const isMentor = user?.role === "alumni";
                  const chatName = isMentor ? conv.studentName || "Alex Rivera" : conv.mentorName || "Sarah Chen";
                  const chatAvatar = isMentor ? conv.studentAvatar : conv.mentorAvatar;
                  const chatTitle = isMentor ? conv.studentTitle : conv.mentorTitle;
                  const lastMsg = conv.messages[conv.messages.length - 1];
                  const unreadCount = unreadCounts[conv.chatId] || 0;

                  return (
                    <div
                      key={conv.chatId}
                      onClick={() => selectChat(conv.chatId)}
                      className={`p-3.5 flex gap-3 hover:bg-gray-50/50 cursor-pointer transition-all border-l-4 ${
                        activeChat?.chatId === conv.chatId
                          ? "bg-red-50/5 border-brand-red"
                          : "border-transparent"
                      }`}
                    >
                      <img
                        src={chatAvatar || "https://cdn-icons-png.flaticon.com/512/149/149071.png"}
                        alt={chatName}
                        className="h-10 w-10 rounded-xl object-cover border border-gray-150 flex-shrink-0"
                      />
                      <div className="flex-1 min-w-0">
                        <div className="flex justify-between items-start">
                          <h4 className="text-xs font-extrabold text-gray-955 truncate font-outfit leading-tight">
                            {chatName}
                          </h4>
                          <span className="text-[8px] text-gray-400 font-sans uppercase flex-shrink-0">
                            {lastMsg
                              ? new Date(lastMsg.timestamp).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })
                              : ""}
                          </span>
                        </div>
                        <p className="text-[10px] text-gray-450 font-bold truncate mt-0.5">{chatTitle}</p>
                        <div className="flex justify-between items-center mt-1.5">
                          <p className="text-[11px] text-gray-400 truncate font-sans leading-relaxed flex-1 mr-2">
                            {lastMsg ? lastMsg.text : "Empty message list."}
                          </p>
                          {unreadCount > 0 && (
                            <span className="h-4.5 min-w-[18px] px-1 rounded-full bg-brand-red text-white text-[9px] font-black font-outfit flex items-center justify-center flex-shrink-0 shadow-xs">
                              {unreadCount}
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })
              )
            ) : (
              // Contacts tab listing
              filteredContacts.length === 0 ? (
                <div className="p-8 text-center text-gray-400 text-xs mt-4">
                  <span>No alumni contacts found.</span>
                </div>
              ) : (
                filteredContacts.map((contact) => (
                  <div
                    key={contact.id}
                    onClick={() => handleContactClick(contact)}
                    className="p-3.5 flex gap-3 hover:bg-gray-50/60 cursor-pointer transition-all items-center"
                  >
                    <img
                      src={contact.avatar}
                      alt={contact.name}
                      className="h-10 w-10 rounded-xl object-cover border border-gray-150 flex-shrink-0"
                    />
                    <div className="flex-1 min-w-0">
                      <h4 className="text-xs font-extrabold text-gray-955 font-outfit leading-tight">
                        {contact.name}
                      </h4>
                      <p className="text-[10px] font-bold text-brand-red mt-0.5 font-outfit uppercase">
                        {contact.company}
                      </p>
                      <p className="text-[10px] text-gray-400 font-medium truncate font-sans">
                        {contact.title}
                      </p>
                    </div>
                  </div>
                ))
              )
            )}
          </div>
        </div>

        {/* Right Column: Chat Window and Input form */}
        <div className="flex flex-col md:col-span-2 bg-gray-50/40 h-full">
          {activeChat ? (
            <>
              {/* Active User Header */}
              <div className="px-5 py-3 border-b border-gray-150 bg-white flex items-center justify-between shadow-2xs z-10">
                <div className="flex items-center gap-3">
                  <img
                    src={
                      (user?.role === "alumni" ? activeChat.studentAvatar : activeChat.mentorAvatar) ||
                      "https://cdn-icons-png.flaticon.com/512/149/149071.png"
                    }
                    alt="Active contact"
                    className="h-10 w-10 rounded-xl object-cover border border-gray-200"
                  />
                  <div>
                    <h4 className="text-xs font-extrabold text-gray-900 font-outfit leading-snug">
                      {user?.role === "alumni" ? activeChat.studentName : activeChat.mentorName}
                    </h4>
                    <p className="text-[10px] text-emerald-500 font-bold font-outfit uppercase tracking-wider flex items-center gap-1 mt-0.5">
                      <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse" /> Active Connection
                    </p>
                  </div>
                </div>
              </div>

              {/* Message History window */}
              <div className="flex-1 overflow-y-auto p-4 space-y-4.5 bg-slate-50/50">
                {activeChat.messages.length === 0 ? (
                  <div className="h-full flex items-center justify-center text-center p-8 text-gray-400 font-outfit text-xs">
                    Start conversation by sending your introductory message below.
                  </div>
                ) : (
                  activeChat.messages.map((msg, index) => {
                    const isMe = msg.senderId === user?.id;
                    return (
                      <div key={index} className={`flex ${isMe ? "justify-end" : "justify-start"} animate-fade-in`}>
                        <div
                          className={`max-w-[75%] rounded-2xl p-3 shadow-3xs font-sans text-xs ${
                            isMe
                              ? "bg-brand-red text-white rounded-tr-none"
                              : "bg-white text-gray-800 border border-gray-150 rounded-tl-none"
                          }`}
                        >
                          <p className="leading-relaxed whitespace-pre-wrap break-words">{msg.text}</p>
                          <span
                            className={`text-[8px] block text-right mt-1.5 font-outfit font-bold ${
                              isMe ? "text-red-100" : "text-gray-400"
                            }`}
                          >
                            {new Date(msg.timestamp).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                          </span>
                        </div>
                      </div>
                    );
                  })
                )}
                <div ref={messagesEndRef} />
              </div>

              {/* Send Message Input Form */}
              <form onSubmit={handleSendChat} className="p-3.5 bg-white border-t border-gray-150 flex gap-2.5 items-center">
                <input
                  type="text"
                  placeholder="Type your message here..."
                  value={typedMessage}
                  onChange={(e) => setTypedMessage(e.target.value)}
                  className="flex-1 border border-gray-300 rounded-xl px-4 py-2.5 text-xs focus:outline-none focus:ring-1 focus:ring-brand-red focus:border-brand-red bg-white font-sans"
                />
                <Button
                  type="submit"
                  className="bg-brand-red hover:bg-brand-darkRed text-white p-2.5 rounded-xl flex items-center justify-center"
                >
                  <Send size={15} />
                </Button>
              </form>
            </>
          ) : (
            // No Active Chat Empty State
            <div className="h-full flex flex-col items-center justify-center text-center p-8 text-gray-400 gap-3">
              <MessageSquare size={44} className="opacity-35 text-brand-red" />
              <h4 className="text-xs font-bold text-gray-900 font-outfit uppercase tracking-wider">Select a Conversation</h4>
              <p className="text-[11px] text-gray-500 max-w-xs font-sans leading-relaxed">
                Click on an active chat from the left sidebar, or switch to the **Alumni Contacts** tab to start messaging a new mentor.
              </p>
              <button
                onClick={() => setLeftTab("contacts")}
                className="bg-brand-black text-white text-[9px] font-bold uppercase tracking-wider px-3.5 py-1.5 rounded-lg hover:bg-brand-red transition-all font-outfit mt-2 shadow-xs"
              >
                Open Contacts List
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ChatDashboard;
