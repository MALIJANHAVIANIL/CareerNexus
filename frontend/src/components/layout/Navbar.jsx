import React, { useState, useRef, useEffect } from "react";
import { Bell, LogOut, User, Menu, X, CheckSquare, Sparkles } from "lucide-react";
import { useAuth } from "../../context/AuthContext";
import { useNotifications } from "../../context/NotificationContext";
import { useNavigate } from "react-router-dom";
import Logo from "../shared/Logo";

export const Navbar = ({ onMenuClick, showSidebarButton = true }) => {
  const { user, logout } = useAuth();
  const { notifications, unreadCount, markAsRead, markAllAsRead } = useNotifications();
  const [showNotifDropdown, setShowNotifDropdown] = useState(false);
  const [showProfileDropdown, setShowProfileDropdown] = useState(false);
  const navigate = useNavigate();

  const notifRef = useRef(null);
  const profileRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (notifRef.current && !notifRef.current.contains(e.target)) {
        setShowNotifDropdown(false);
      }
      if (profileRef.current && !profileRef.current.contains(e.target)) {
        setShowProfileDropdown(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  const handleNotificationClick = (notif) => {
    markAsRead(notif.id);
    setShowNotifDropdown(false);
    if (notif.type === "job") {
      navigate("/jobs");
    } else if (notif.type === "mentorship") {
      navigate("/chat");
    } else if (notif.type === "event") {
      navigate("/events");
    }
  };

  return (
    <header className="sticky top-0 z-40 bg-white/80 backdrop-blur-md border-b border-gray-150 py-3.5 px-4 md:px-6 flex items-center justify-between">
      {/* Left side: Hamburger on mobile, Brand on desktop */}
      <div className="flex items-center gap-3">
        {showSidebarButton && (
          <button
            onClick={onMenuClick}
            className="md:hidden p-1.5 text-gray-500 hover:text-brand-black hover:bg-gray-100 rounded-lg transition-colors"
          >
            <Menu size={22} />
          </button>
        )}
        <Logo size="sm" className="md:hidden" showText={false} />
        <span className="hidden md:inline-flex text-lg font-bold text-gray-800 font-outfit select-none capitalize">
          Welcome back, {user?.name?.split(" ")[0]}!
        </span>
      </div>

      {/* Right side: Bell & User actions */}
      <div className="flex items-center gap-4">
        {/* Notification Bell */}
        <div ref={notifRef} className="relative">
          <button
            onClick={() => setShowNotifDropdown(!showNotifDropdown)}
            className="p-2 text-gray-500 hover:text-brand-black hover:bg-gray-100 rounded-xl relative transition-colors focus:outline-none"
          >
            <Bell size={20} />
            {unreadCount > 0 && (
              <span className="absolute top-1.5 right-1.5 h-4.5 min-w-4.5 px-1 bg-brand-red text-white text-[10px] font-extrabold rounded-full flex items-center justify-center animate-pulse border border-white">
                {unreadCount}
              </span>
            )}
          </button>

          {showNotifDropdown && (
            <div className="absolute right-0 mt-2.5 w-80 md:w-96 bg-white rounded-2xl shadow-xl border border-gray-100 py-2 z-50 animate-slide-up">
              <div className="px-4 py-2 border-b border-gray-50 flex items-center justify-between">
                <span className="font-bold text-gray-900 font-outfit">Notifications</span>
                {unreadCount > 0 && (
                  <button
                    onClick={markAllAsRead}
                    className="text-xs text-brand-red font-semibold hover:underline flex items-center gap-1"
                  >
                    <CheckSquare size={13} />
                    Mark all read
                  </button>
                )}
              </div>
              <div className="max-h-80 overflow-y-auto">
                {notifications.length === 0 ? (
                  <div className="p-6 text-center text-gray-400 text-sm font-sans flex flex-col items-center gap-2">
                    <Bell size={28} className="opacity-40" />
                    <span>No new alerts</span>
                  </div>
                ) : (
                  notifications.map((notif) => (
                    <div
                      key={notif.id}
                      onClick={() => handleNotificationClick(notif)}
                      className={`px-4 py-3 hover:bg-gray-50/70 border-b border-gray-50 cursor-pointer flex gap-3 transition-colors ${
                        !notif.read ? "bg-red-50/10 font-medium" : ""
                      }`}
                    >
                      <div className="flex-1">
                        <div className="flex justify-between items-center mb-0.5">
                          <span className="text-xs font-bold font-outfit text-gray-900 capitalize">
                            {notif.title}
                          </span>
                          <span className="text-[10px] text-gray-400 font-sans">{notif.timestamp}</span>
                        </div>
                        <p className="text-xs text-gray-500 leading-normal font-sans">{notif.message}</p>
                      </div>
                      {!notif.read && (
                        <span className="h-2 w-2 rounded-full bg-brand-red flex-shrink-0 mt-2" />
                      )}
                    </div>
                  ))
                )}
              </div>
            </div>
          )}
        </div>

        {/* User Profile Action */}
        <div ref={profileRef} className="relative">
          <button
            onClick={() => setShowProfileDropdown(!showProfileDropdown)}
            className="flex items-center gap-2 focus:outline-none"
          >
            {user?.avatar && (user.avatar.startsWith("data:application/pdf") || user.avatarType === "application/pdf") ? (
              <div className="h-9 w-9 rounded-xl border-2 border-brand-red/25 bg-red-50 text-brand-red flex items-center justify-center font-bold text-[10px] shadow-inner font-outfit">PDF</div>
            ) : (
              <img
                src={user?.avatar || "https://cdn-icons-png.flaticon.com/512/149/149071.png"}
                alt={user?.name || "Avatar"}
                className="h-9 w-9 rounded-xl object-cover border-2 border-brand-red/10 shadow-inner"
              />
            )}
          </button>

          {showProfileDropdown && (
            <div className="absolute right-0 mt-2.5 w-56 bg-white rounded-2xl shadow-xl border border-gray-100 py-1.5 z-50 animate-slide-up">
              <div className="px-4 py-3 border-b border-gray-50">
                <p className="text-sm font-bold text-gray-900 font-outfit truncate">{user?.name}</p>
                <p className="text-xs text-gray-400 capitalize font-sans">{user?.role} Account</p>
              </div>

              <button
                onClick={() => {
                  setShowProfileDropdown(false);
                  navigate("/profile");
                }}
                className="w-full text-left px-4 py-2.5 text-sm font-semibold text-gray-700 hover:bg-gray-50 hover:text-gray-900 flex items-center gap-2.5 transition-colors"
              >
                <User size={16} className="text-gray-400" />
                My Profile
              </button>

              <button
                onClick={handleLogout}
                className="w-full text-left px-4 py-2.5 text-sm font-semibold text-red-600 hover:bg-red-50 flex items-center gap-2.5 transition-colors border-t border-gray-50"
              >
                <LogOut size={16} />
                Logout
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};

export default Navbar;
