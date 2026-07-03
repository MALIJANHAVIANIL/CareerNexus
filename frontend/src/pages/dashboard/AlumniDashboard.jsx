import React, { useState } from "react";
import { useAuth } from "../../context/AuthContext";
import { useNotifications } from "../../context/NotificationContext";
import {
  Users,
  BookOpen,
  Calendar,
  MessageSquare,
  User,
  Sparkles,
  CheckCircle,
  XCircle,
  PlusCircle,
  Clock,
  ArrowRight,
  ChevronRight,
  TrendingUp,
  MapPin,
  ExternalLink,
  FileText
} from "lucide-react";
import Card, { CardBody, CardHeader } from "../../components/common/Card";
import Button from "../../components/common/Button";

export const AlumniDashboard = () => {
  const { user } = useAuth();
  const { showToast } = useNotifications();

  // 1. Mock Request State
  const [requests, setRequests] = useState([
    {
      id: "req-1",
      studentName: "Bhavesh Patil",
      department: "Computer Engineering",
      cgpa: 8.45,
      rollNumber: "7350151961",
      message: "Hi, I saw your profile at Microsoft! I am preparing for backend roles and would love to get your advice on system design resources.",
      avatar: "https://cdn-icons-png.flaticon.com/512/149/149071.png"
    },
    {
      id: "req-2",
      studentName: "Anjali Kulkarni",
      department: "Information Technology",
      cgpa: 9.12,
      rollNumber: "7350151988",
      message: "Hello! I am aiming for cloud certifications and need help choosing between AWS Developer and DevOps Engineer tracks. Looking forward to connecting.",
      avatar: "https://cdn-icons-png.flaticon.com/512/149/149071.png"
    }
  ]);

  // 2. Mock Mentees State
  const [mentees, setMentees] = useState([
    { id: "mentee-1", name: "Rohan Sawant", department: "Computer Engineering", activeTopic: "Spring Boot APIs", lastActive: "2 hours ago" },
    { id: "mentee-2", name: "Priya Rao", department: "Information Technology", activeTopic: "AWS Lambda Setup", lastActive: "1 day ago" }
  ]);

  // 3. Mock Prep Guides State
  const [guides, setGuides] = useState([
    { id: "guide-1", company: "Microsoft", role: "Software Architect", date: "June 12, 2026", views: 245 },
    { id: "guide-2", company: "Google", role: "Frontend Dev", date: "May 28, 2026", views: 189 }
  ]);

  // 4. Mock Webinars State
  const [webinars, setWebinars] = useState([
    { id: "web-1", title: "Microservices Architecture Patterns", date: "July 15, 2026 • 6:00 PM", status: "Scheduled", registered: 42 },
    { id: "web-2", title: "Preparation Strategy for Tier 1 Companies", date: "July 29, 2026 • 5:00 PM", status: "Draft", registered: 0 }
  ]);

  // Modal State for Prep Guide Sharing
  const [showShareModal, setShowShareModal] = useState(false);
  const [guideCompany, setGuideCompany] = useState("");
  const [guideRole, setGuideRole] = useState("");
  const [guideContent, setGuideContent] = useState("");
  const [submitting, setSubmitting] = useState(false);

  // Handlers
  const handleAcceptRequest = (reqId, name) => {
    setRequests(prev => prev.filter(r => r.id !== reqId));
    setMentees(prev => [
      ...prev,
      { id: `mentee-${Date.now()}`, name, department: "Computer Engineering", activeTopic: "Resume Review", lastActive: "Just now" }
    ]);
    showToast(`Mentorship connection accepted with ${name}!`, "success");
  };

  const handleDeclineRequest = (reqId, name) => {
    setRequests(prev => prev.filter(r => r.id !== reqId));
    showToast(`Mentorship request from ${name} declined.`, "info");
  };

  const handleShareGuide = (e) => {
    e.preventDefault();
    if (!guideCompany || !guideRole || !guideContent) {
      showToast("Please fill in all experience details", "warning");
      return;
    }

    setSubmitting(true);
    setTimeout(() => {
      setGuides(prev => [
        {
          id: `guide-${Date.now()}`,
          company: guideCompany,
          role: guideRole,
          date: "Just now",
          views: 0
        },
        ...prev
      ]);
      showToast("Interview experience guide published successfully!", "success");
      setGuideCompany("");
      setGuideRole("");
      setGuideContent("");
      setShowShareModal(false);
      setSubmitting(false);
    }, 800);
  };

  return (
    <div className="space-y-6">
      {/* Alumni Welcome Banner */}
      <div className="bg-gradient-to-r from-brand-black to-red-950 text-white rounded-2xl p-6 md:p-8 shadow-md relative overflow-hidden border border-brand-red/10">
        <div className="absolute right-0 bottom-0 top-0 w-1/3 bg-radial-gradient from-brand-red/20 to-transparent pointer-events-none" />
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-2">
            <span className="bg-brand-red text-white text-[10px] font-extrabold uppercase px-2.5 py-1 rounded-full flex items-center gap-1 w-fit">
              <Sparkles size={9} /> Mentor Workspace
            </span>
            <h2 className="text-2xl md:text-3xl font-extrabold font-outfit">Welcome, {user?.name || "Alumni"}</h2>
            <p className="text-sm text-gray-300 font-sans mt-1">
              Current Company: <span className="text-white font-bold">{user?.company || "N/A"}</span> • Designation: {user?.designation || "N/A"}
            </p>
          </div>
          <div className="flex-shrink-0">
            <Button
              variant="primary"
              onClick={() => setShowShareModal(true)}
              iconBefore={<PlusCircle size={17} />}
              className="bg-brand-red hover:bg-brand-darkRed text-white"
            >
              Share Prep Guide
            </Button>
          </div>
        </div>
      </div>

      {/* QUICK STATS */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        {[
          { label: "Active Mentees", count: mentees.length, icon: <Users size={20} className="text-white" />, bg: "bg-brand-red" },
          { label: "Pending Requests", count: requests.length, icon: <MessageSquare size={20} className="text-white" />, bg: "bg-brand-black" },
          { label: "Guides Shared", count: guides.length, icon: <BookOpen size={20} className="text-white" />, bg: "bg-brand-red" },
          { label: "Webinars Hosted", count: webinars.length, icon: <Calendar size={20} className="text-white" />, bg: "bg-brand-black" }
        ].map((stat, idx) => (
          <Card key={idx} hover={false} className="bg-white border-gray-150 shadow-xs">
            <CardBody className="p-5 flex items-center justify-between">
              <div className="space-y-1">
                <p className="text-[10px] font-extrabold text-gray-400 font-outfit uppercase tracking-wider">{stat.label}</p>
                <p className="text-2xl font-black text-brand-black font-outfit">{stat.count}</p>
              </div>
              <div className={`p-3 rounded-xl ${stat.bg} shadow-md`}>
                {stat.icon}
              </div>
            </CardBody>
          </Card>
        ))}
      </div>

      {/* MAIN CONTENT SPLIT GRID */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Left column: Requests Queue */}
        <div className="lg:col-span-2 space-y-6">
          <Card hover={false} className="bg-white border-gray-150 shadow-sm">
            <CardHeader className="bg-white border-b border-gray-100 flex justify-between items-center py-4 px-5">
              <h3 className="text-sm font-bold text-gray-900 font-outfit uppercase tracking-wider flex items-center gap-1.5">
                <Users size={16} className="text-brand-red" /> Connection Requests ({requests.length})
              </h3>
            </CardHeader>
            <CardBody className="p-0">
              {requests.length === 0 ? (
                <div className="p-10 text-center text-gray-400 text-sm flex flex-col items-center gap-2">
                  <CheckCircle size={32} className="text-emerald-500 opacity-75" />
                  <p className="font-semibold text-gray-700">Inbox Clean!</p>
                  <p className="text-xs">No pending student mentorship requests at this time.</p>
                </div>
              ) : (
                <div className="divide-y divide-gray-100">
                  {requests.map((req) => (
                    <div key={req.id} className="p-5 flex flex-col sm:flex-row justify-between items-start gap-4 hover:bg-gray-50/50 transition">
                      <div className="flex gap-4 items-start">
                        <img src={req.avatar} alt={req.studentName} className="h-10 w-10 rounded-xl object-cover border border-gray-100 flex-shrink-0" />
                        <div className="space-y-1.5 min-w-0">
                          <div>
                            <h4 className="text-xs font-bold text-gray-955 font-outfit flex items-center gap-2">
                              {req.studentName} 
                              <span className="text-[9px] font-bold bg-red-50 text-brand-red px-1.5 py-0.5 rounded font-mono">GPA: {req.cgpa.toFixed(2)}</span>
                            </h4>
                            <p className="text-[10px] text-gray-500 font-sans">{req.department} • PRN: {req.rollNumber}</p>
                          </div>
                          <p className="text-[11px] text-gray-700 font-sans italic bg-gray-50/80 p-2.5 rounded-lg border border-gray-100 leading-relaxed break-words">
                            "{req.message}"
                          </p>
                        </div>
                      </div>
                      <div className="flex sm:flex-col gap-2 w-full sm:w-auto justify-end">
                        <button
                          onClick={() => handleAcceptRequest(req.id, req.studentName)}
                          className="flex-1 sm:flex-initial px-3.5 py-1.5 bg-brand-red hover:bg-brand-darkRed text-white text-[10px] font-bold rounded-lg transition-all flex items-center justify-center gap-1"
                        >
                          Accept
                        </button>
                        <button
                          onClick={() => handleDeclineRequest(req.id, req.studentName)}
                          className="flex-1 sm:flex-initial px-3.5 py-1.5 border border-gray-200 hover:bg-red-50 hover:text-red-600 text-gray-600 text-[10px] font-bold rounded-lg transition-all flex items-center justify-center gap-1 bg-white"
                        >
                          Decline
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardBody>
          </Card>
        </div>

        {/* Right column: Mentees & Webinars */}
        <div className="space-y-6">
          
          {/* Active Mentees Card */}
          <Card hover={false} className="bg-white border-gray-150 shadow-sm">
            <CardHeader className="bg-white border-b border-gray-100 py-4 px-5">
              <h3 className="text-xs font-bold text-gray-900 font-outfit uppercase tracking-wider flex items-center gap-1.5">
                <Users size={15} className="text-brand-red" /> Active Mentees ({mentees.length})
              </h3>
            </CardHeader>
            <CardBody className="p-4 space-y-3">
              {mentees.length === 0 ? (
                <p className="text-center text-xs text-gray-400 py-4">No active student connections yet.</p>
              ) : (
                mentees.map((mentee) => (
                  <div key={mentee.id} className="p-3 bg-gray-50 rounded-xl border border-gray-150 flex justify-between items-center gap-3">
                    <div className="min-w-0">
                      <h4 className="text-xs font-bold text-gray-950 font-outfit truncate">{mentee.name}</h4>
                      <p className="text-[10px] text-gray-500 font-sans truncate">{mentee.department}</p>
                      <p className="text-[9px] text-brand-red font-bold font-sans mt-0.5">Topic: {mentee.activeTopic}</p>
                    </div>
                    <button
                      onClick={() => showToast(`Opening chat with ${mentee.name} (Phase 2 feature)`, "info")}
                      className="px-2.5 py-1 bg-white border border-gray-200 hover:border-brand-red text-[9px] font-bold text-brand-red hover:bg-brand-red hover:text-white rounded-lg transition-all flex items-center gap-1"
                    >
                      Chat <ChevronRight size={10} />
                    </button>
                  </div>
                ))
              )}
            </CardBody>
          </Card>

          {/* Prep Guides shared list */}
          <Card hover={false} className="bg-white border-gray-150 shadow-sm">
            <CardHeader className="bg-white border-b border-gray-100 py-4 px-5">
              <h3 className="text-xs font-bold text-gray-900 font-outfit uppercase tracking-wider flex items-center gap-1.5">
                <BookOpen size={15} className="text-brand-red" /> Shared Guides ({guides.length})
              </h3>
            </CardHeader>
            <CardBody className="p-4 space-y-3">
              {guides.map((g) => (
                <div key={g.id} className="flex justify-between items-center border-b border-gray-100 pb-3 last:border-0 last:pb-0">
                  <div>
                    <h4 className="text-xs font-bold text-gray-905 font-outfit">{g.company}</h4>
                    <p className="text-[10px] text-gray-500 font-sans">{g.role} • {g.date}</p>
                  </div>
                  <span className="text-[9px] font-bold text-gray-400 bg-gray-50 px-2 py-0.5 rounded border border-gray-200">
                    {g.views} views
                  </span>
                </div>
              ))}
            </CardBody>
          </Card>

          {/* Hosted webinars */}
          <Card hover={false} className="bg-white border-gray-150 shadow-sm">
            <CardHeader className="bg-white border-b border-gray-100 py-4 px-5">
              <h3 className="text-xs font-bold text-gray-900 font-outfit uppercase tracking-wider flex items-center gap-1.5">
                <Calendar size={15} className="text-brand-red" /> Upcoming Webinars ({webinars.length})
              </h3>
            </CardHeader>
            <CardBody className="p-4 space-y-3">
              {webinars.map((web) => (
                <div key={web.id} className="p-3 bg-gray-50/50 border border-gray-150 rounded-xl space-y-1">
                  <div className="flex justify-between items-start gap-2">
                    <h4 className="text-[11px] font-bold text-gray-950 font-outfit leading-snug truncate max-w-[80%]">{web.title}</h4>
                    <span className={`text-[8px] font-extrabold uppercase px-1.5 py-0.5 rounded ${
                      web.status === "Scheduled" ? "bg-emerald-50 text-emerald-700" : "bg-gray-100 text-gray-600"
                    }`}>{web.status}</span>
                  </div>
                  <p className="text-[9px] text-gray-500 font-sans">{web.date}</p>
                  {web.status === "Scheduled" && (
                    <p className="text-[9px] font-bold text-brand-red bg-red-50 w-fit px-1.5 py-0.5 rounded mt-1">
                      {web.registered} students registered
                    </p>
                  )}
                </div>
              ))}
            </CardBody>
          </Card>

        </div>

      </div>

      {/* Share Guide Modal */}
      {showShareModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="fixed inset-0 bg-gray-900/60 backdrop-blur-xs" onClick={() => setShowShareModal(false)} />
          <div className="bg-white rounded-2xl shadow-xl max-w-lg w-full overflow-hidden border border-gray-150 z-10 p-6 flex flex-col gap-4 animate-slide-up">
            <h3 className="text-lg font-bold text-gray-955 font-outfit">Share Interview Experience</h3>
            <form onSubmit={handleShareGuide} className="space-y-4">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[10px] font-bold text-gray-500 uppercase mb-1 font-outfit">Target Company</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Microsoft"
                    value={guideCompany}
                    onChange={(e) => setGuideCompany(e.target.value)}
                    className="block w-full border border-gray-300 rounded-lg text-sm py-2 px-3 focus:outline-none focus:ring-1 focus:ring-brand-red bg-white"
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-bold text-gray-500 uppercase mb-1 font-outfit">Job Role / Profile</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Software Engineer"
                    value={guideRole}
                    onChange={(e) => setGuideRole(e.target.value)}
                    className="block w-full border border-gray-300 rounded-lg text-sm py-2 px-3 focus:outline-none focus:ring-1 focus:ring-brand-red bg-white"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[10px] font-bold text-gray-500 uppercase mb-1 font-outfit">Interview Rounds & Preparation Advice</label>
                <textarea
                  required
                  rows="5"
                  placeholder="Detail the online test topics, coding questions asked, technical round patterns, and key concepts that helped you clear the interview..."
                  value={guideContent}
                  onChange={(e) => setGuideContent(e.target.value)}
                  className="block w-full border border-gray-300 rounded-lg text-sm py-2 px-3 focus:outline-none focus:ring-1 focus:ring-brand-red font-sans"
                />
              </div>

              <div className="flex justify-end gap-3 pt-3 border-t border-gray-100">
                <Button variant="outline" size="sm" onClick={() => setShowShareModal(false)}>
                  Cancel
                </Button>
                <Button type="submit" size="sm" loading={submitting} className="bg-brand-red text-white hover:bg-brand-darkRed">
                  Publish Guide
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default AlumniDashboard;
