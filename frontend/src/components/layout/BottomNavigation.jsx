import React from "react";
import { NavLink } from "react-router-dom";
import { Home, Briefcase, MessageSquare, Calendar, User } from "lucide-react";
import { useAuth } from "../../context/AuthContext";

export const BottomNavigation = () => {
  const { user } = useAuth();

  const getDashboardLink = () => {
    if (user?.role === "alumni") return "/alumni-dashboard";
    if (user?.role === "hr") return "/hr-dashboard";
    return "/dashboard";
  };

  const navItems = [
    { label: "Home", path: getDashboardLink(), icon: <Home size={20} /> },
    { label: "Jobs", path: "/jobs", icon: <Briefcase size={20} /> },
    { label: "Chats", path: "/chat", icon: <MessageSquare size={20} /> },
    { label: "Events", path: "/events", icon: <Calendar size={20} /> },
    { label: "Profile", path: "/profile", icon: <User size={20} /> }
  ];

  return (
    <nav className="md:hidden fixed bottom-0 left-0 right-0 z-40 bg-white/95 backdrop-blur-md border-t border-gray-150 shadow-lg px-4 py-2 flex items-center justify-around pb-safe">
      {navItems.map((item) => (
        <NavLink
          key={item.label}
          to={item.path}
          className={({ isActive }) =>
            `flex flex-col items-center gap-1 py-1 px-3 text-center transition-all duration-200 ${
              isActive
                ? "text-brand-red font-bold scale-105"
                : "text-gray-400 font-semibold"
            }`
          }
        >
          <span className="flex items-center justify-center">{item.icon}</span>
          <span className="text-[10px] font-outfit leading-none">{item.label}</span>
        </NavLink>
      ))}
    </nav>
  );
};

export default BottomNavigation;
