import React from "react";
import { NavLink } from "react-router-dom";
import { Home, Briefcase, MessageSquare, Calendar, User, LogOut } from "lucide-react";
import { useAuth } from "../../context/AuthContext";
import Logo from "../shared/Logo";

export const Sidebar = ({ onClose }) => {
  const { user, logout } = useAuth();

  const getDashboardLink = () => {
    if (user?.role === "alumni") return "/alumni-dashboard";
    if (user?.role === "hr") return "/hr-dashboard";
    return "/dashboard";
  };

  const navItems = [
    { label: "Dashboard", path: getDashboardLink(), icon: <Home size={18} /> },
    { label: "Jobs", path: "/jobs", icon: <Briefcase size={18} /> },
    { label: "Chat & Mentors", path: "/chat", icon: <MessageSquare size={18} /> },
    { label: "Events", path: "/events", icon: <Calendar size={18} /> },
    { label: "My Profile", path: "/profile", icon: <User size={18} /> }
  ];

  return (
    <aside className="h-screen w-64 bg-brand-black text-white flex flex-col justify-between border-r border-gray-800 z-50 flex-shrink-0">
      {/* Top section: logo and navigation */}
      <div>
        {/* Brand header */}
        <div className="py-6 px-6 border-b border-gray-800 flex items-center justify-between">
          <Logo size="md" />
        </div>

        {/* User Card */}
        <div className="mx-4 my-5 p-4 rounded-xl bg-gray-900/50 border border-gray-800 flex items-center gap-3">
          <img
            src={user?.avatar || "https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?w=150"}
            alt={user?.name || "Avatar"}
            className="h-9 w-9 rounded-lg object-cover"
          />
          <div className="flex-1 min-w-0">
            <h4 className="text-sm font-bold truncate font-outfit">{user?.name}</h4>
            <p className="text-[10px] text-gray-400 capitalize font-sans leading-none mt-0.5">{user?.role} Mode</p>
          </div>
        </div>

        {/* Navigation items */}
        <nav className="px-3 space-y-1.5">
          {navItems.map((item) => (
            <NavLink
              key={item.label}
              to={item.path}
              onClick={onClose}
              className={({ isActive }) =>
                `flex items-center gap-3.5 px-4 py-3 text-sm font-semibold rounded-xl transition-all duration-200 ${
                  isActive
                    ? "bg-brand-red text-white shadow-md shadow-red-900/20"
                    : "text-gray-400 hover:bg-gray-800 hover:text-white"
                }`
              }
            >
              {item.icon}
              <span className="font-outfit">{item.label}</span>
            </NavLink>
          ))}
        </nav>
      </div>

      {/* Bottom section: logout */}
      <div className="p-4 border-t border-gray-800">
        <button
          onClick={logout}
          className="w-full flex items-center gap-3 px-4 py-3 text-sm font-semibold text-gray-400 hover:bg-red-950/20 hover:text-red-400 rounded-xl transition-all duration-200"
        >
          <LogOut size={18} />
          <span className="font-outfit">Sign Out</span>
        </button>
      </div>
    </aside>
  );
};

export default Sidebar;
