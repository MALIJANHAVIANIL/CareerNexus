import React from "react";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider } from "./context/AuthContext";
import { NotificationProvider, useNotifications } from "./context/NotificationContext";
import ProtectedLayout from "./components/layout/ProtectedLayout";
import Toast from "./components/common/Toast";

// Phase 1 Pages
import SplashScreen from "./pages/auth/SplashScreen";
import WelcomeScreen from "./pages/auth/WelcomeScreen";
import StudentRegister from "./pages/auth/StudentRegister";
import AlumniRegister from "./pages/auth/AlumniRegister";
import HRRegister from "./pages/auth/HRRegister";
import Login from "./pages/auth/Login";
import ForgotPassword from "./pages/auth/ForgotPassword";

// Dashboard Placeholders
import StudentDashboard from "./pages/dashboard/StudentDashboard";
import AlumniDashboard from "./pages/dashboard/AlumniDashboard";
import TPODashboard from "./pages/dashboard/TPODashboard";
import HRDashboard from "./pages/dashboard/HRDashboard";
import Profile from "./pages/profile/Profile";
import JobBoard from "./pages/jobs/JobBoard";
import Mentorship from "./pages/mentorship/Mentorship";
import EventHub from "./pages/events/EventHub";
import ChatDashboard from "./pages/chat/ChatDashboard";
import { ChatProvider } from "./context/ChatContext";

const ToastContainer = () => {
  const { toast, closeToast } = useNotifications();
  if (!toast) return null;
  return <Toast message={toast.message} type={toast.type} onClose={closeToast} />;
};

export const App = () => {
  return (
    <BrowserRouter>
      <AuthProvider>
        <NotificationProvider>
          <ChatProvider>
            <Routes>
              {/* Public Routes */}
              <Route path="/" element={<SplashScreen />} />
              <Route path="/welcome" element={<WelcomeScreen />} />
              <Route path="/register/student" element={<StudentRegister />} />
              <Route path="/register/alumni" element={<AlumniRegister />} />
              <Route path="/register/hr" element={<HRRegister />} />
              <Route path="/login" element={<Login />} />
              <Route path="/forgot-password" element={<ForgotPassword />} />

              {/* Protected Routes */}
              <Route element={<ProtectedLayout />}>
                <Route path="/student/dashboard" element={<StudentDashboard />} />
                <Route path="/alumni/dashboard" element={<AlumniDashboard />} />
                <Route path="/tpo/dashboard" element={<TPODashboard />} />
                <Route path="/hr/dashboard" element={<HRDashboard />} />
                <Route path="/profile" element={<Profile />} />
                <Route path="/student/jobs" element={<JobBoard />} />
                <Route path="/student/mentorship" element={<Mentorship />} />
                <Route path="/student/events" element={<EventHub />} />
                <Route path="/student/chat" element={<ChatDashboard />} />
              </Route>

              {/* Fallback */}
              <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
          </ChatProvider>

          {/* Toast Notification Container */}
          <ToastContainer />

        </NotificationProvider>
      </AuthProvider>
    </BrowserRouter>
  );
};

export default App;
