import React, { useState } from "react";
import { Navigate, Outlet, useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import { useNotifications } from "../../context/NotificationContext";
import { Menu, LogOut, Home, Sparkles } from "lucide-react";
import Logo from "../shared/Logo";
import Navbar from "./Navbar";

export const ProtectedLayout = () => {
  const { isAuthenticated, loading, user, logout } = useAuth();
  const { showToast } = useNotifications();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();

  if (loading) {
    return (
      <div className="h-screen w-screen flex flex-col items-center justify-center bg-white">
        <div className="animate-spin rounded-full h-12 w-12 border-4 border-brand-red border-t-transparent"></div>
        <p className="mt-4 text-sm font-semibold text-gray-500 font-outfit">Loading session details...</p>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  // Cross-role verification redirects
  const pathname = location.pathname;
  if (user?.role === "student" && pathname !== "/student/dashboard") {
    // If they are on a subpath, let them stay, but default dashboard is /student/dashboard
    if (pathname === "/alumni/dashboard" || pathname === "/tpo/dashboard" || pathname === "/hr/dashboard") {
      return <Navigate to="/student/dashboard" replace />;
    }
  }
  if (user?.role === "alumni" && pathname !== "/alumni/dashboard") {
    if (pathname === "/student/dashboard" || pathname === "/tpo/dashboard" || pathname === "/hr/dashboard") {
      return <Navigate to="/alumni/dashboard" replace />;
    }
  }
  if (user?.role === "tpo" && pathname !== "/tpo/dashboard") {
    if (pathname === "/student/dashboard" || pathname === "/alumni/dashboard" || pathname === "/hr/dashboard") {
      return <Navigate to="/tpo/dashboard" replace />;
    }
  }
  if (user?.role === "hr" && pathname !== "/hr/dashboard") {
    if (pathname === "/student/dashboard" || pathname === "/alumni/dashboard" || pathname === "/tpo/dashboard") {
      return <Navigate to="/hr/dashboard" replace />;
    }
  }

  const handlePlaceholderClick = (moduleName) => {
    showToast(`The ${moduleName} module is under development and will launch in Phase 2.`, "info");
  };

  const getDashboardPath = () => {
    if (user?.role === "alumni") return "/alumni/dashboard";
    if (user?.role === "tpo") return "/tpo/dashboard";
    if (user?.role === "hr") return "/hr/dashboard";
    return "/student/dashboard";
  };

  // Reusable Sidebar Nav for Phase 1
  const renderSidebar = () => {
    const studentLinks = ["Jobs", "Mentorship", "Events", "Chat", "Profile"];
    const alumniLinks = ["Mentorship", "Interview Experiences", "Events", "Chat", "Profile"];
    const tpoLinks = ["Students", "Alumni", "Companies", "Jobs", "Events", "Analytics"];
    const hrLinks = ["Jobs", "Events", "Chat", "Profile"];

    const activeLinks =
      user?.role === "alumni"
        ? alumniLinks
        : user?.role === "tpo"
        ? tpoLinks
        : user?.role === "hr"
        ? hrLinks
        : studentLinks;

    return (
      <div className="h-full flex flex-col justify-between p-4 bg-brand-black text-white w-64 border-r border-gray-800">
        <div className="space-y-6">
          <div className="py-4 px-2">
            <Logo size="sm" dark={true} />
          </div>

          <div className="p-3 bg-gray-900/50 rounded-xl border border-gray-800 flex items-center gap-3">
            {user?.avatar && (user.avatar.startsWith("data:application/pdf") || user.avatarType === "application/pdf") ? (
              <div className="h-8 w-8 rounded-lg bg-red-950/40 text-brand-red border border-brand-red/35 flex items-center justify-center font-bold text-[8px] font-outfit">PDF</div>
            ) : (
              <img
                src={user?.avatar || "https://cdn-icons-png.flaticon.com/512/149/149071.png"}
                alt="Profile"
                className="h-8 w-8 rounded-lg"
              />
            )}
            <div className="min-w-0">
              <h4 className="text-xs font-bold truncate font-outfit">{user?.name}</h4>
              <p className="text-[9px] text-gray-400 capitalize">{user?.role}</p>
            </div>
          </div>

          <nav className="space-y-1">
            <button
              onClick={() => {
                navigate(getDashboardPath());
                setSidebarOpen(false);
              }}
              className={`w-full flex items-center gap-3 px-4 py-2.5 text-xs font-bold rounded-lg transition-colors ${
                pathname === getDashboardPath()
                  ? "bg-brand-red text-white"
                  : "text-gray-400 hover:bg-gray-850 hover:text-white"
              }`}
            >
              <Home size={16} />
              <span>Dashboard</span>
            </button>

            {activeLinks.map((link) => {
              const isProfile = link === "Profile" && pathname === "/profile";
              const isJobs = link === "Jobs" && pathname === "/student/jobs" && user?.role === "student";
              const isMentorship = link === "Mentorship" && pathname === "/student/mentorship" && user?.role === "student";
              const isEvents = link === "Events" && pathname === "/student/events" && user?.role === "student";
              const isChat = link === "Chat" && pathname === "/student/chat";
              const isActive = isProfile || isJobs || isMentorship || isEvents || isChat;

              return (
                <button
                  key={link}
                  onClick={() => {
                    if (link === "Profile") {
                      navigate("/profile");
                      setSidebarOpen(false);
                    } else if (link === "Jobs" && user?.role === "student") {
                      navigate("/student/jobs");
                      setSidebarOpen(false);
                    } else if (link === "Mentorship" && user?.role === "student") {
                      navigate("/student/mentorship");
                      setSidebarOpen(false);
                    } else if (link === "Events" && user?.role === "student") {
                      navigate("/student/events");
                      setSidebarOpen(false);
                    } else if (link === "Chat") {
                      navigate("/student/chat");
                      setSidebarOpen(false);
                    } else {
                      handlePlaceholderClick(link);
                    }
                  }}
                  className={`w-full flex items-center justify-between px-4 py-2.5 text-xs font-bold rounded-lg transition-colors ${
                    isActive
                      ? "bg-brand-red text-white"
                      : "text-gray-400 hover:bg-gray-850 hover:text-white"
                  }`}
                >
                  <span>{link}</span>
                  {!isActive && (link !== "Profile" && !(link === "Jobs" && user?.role === "student") && !(link === "Mentorship" && user?.role === "student") && !(link === "Events" && user?.role === "student") && !(link === "Chat")) && (
                    <span className="text-[8px] bg-red-950/20 text-brand-red px-1.5 py-0.5 rounded font-extrabold">P2</span>
                  )}
                </button>
              );
            })}
          </nav>
        </div>

        <button
          onClick={logout}
          className="flex items-center gap-3 px-4 py-2.5 text-xs font-bold text-red-400 hover:bg-red-950/10 rounded-lg transition"
        >
          <LogOut size={16} />
          <span>Sign Out</span>
        </button>
      </div>
    );
  };

  return (
    <div className="h-screen w-screen overflow-hidden flex bg-gray-50">
      {/* Desktop Sidebar */}
      <div className="hidden md:flex">
        {renderSidebar()}
      </div>

      {/* Mobile Drawer */}
      {sidebarOpen && (
        <div className="fixed inset-0 z-50 flex md:hidden animate-fade-in">
          <div className="fixed inset-0 bg-gray-900/50 backdrop-blur-xs" onClick={() => setSidebarOpen(false)} />
          <div className="relative w-64 max-w-xs bg-brand-black flex flex-col h-full animate-slide-in-right">
            {renderSidebar()}
          </div>
        </div>
      )}

      {/* Content pane */}
      <div className="flex-1 flex flex-col overflow-hidden relative">
        <Navbar onMenuClick={() => setSidebarOpen(true)} showSidebarButton={true} />
        
        <main className="flex-1 overflow-y-auto p-4 md:p-6 pb-20 md:pb-6">
          <div className="max-w-6xl mx-auto">
            <Outlet />
          </div>
        </main>

        {/* Mobile Bottom Bar for Phase 1 */}
        <nav className="md:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-gray-150 py-2.5 px-4 flex justify-around items-center z-45 pb-safe shadow-lg">
          <button
            onClick={() => navigate(getDashboardPath())}
            className={`flex flex-col items-center gap-0.5 ${pathname === getDashboardPath() ? "text-brand-red font-bold" : "text-gray-400"}`}
          >
            <Home size={18} />
            <span className="text-[9px] font-outfit">Home</span>
          </button>
          
          <button
            onClick={() => handlePlaceholderClick("Modules")}
            className="flex flex-col items-center gap-0.5 text-gray-400"
          >
            <Sparkles size={18} />
            <span className="text-[9px] font-outfit">Modules</span>
          </button>

          <button
            onClick={logout}
            className="flex flex-col items-center gap-0.5 text-red-500 font-bold"
          >
            <LogOut size={18} />
            <span className="text-[9px] font-outfit">Logout</span>
          </button>
        </nav>
      </div>
    </div>
  );
};

export default ProtectedLayout;
