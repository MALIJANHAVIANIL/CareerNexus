import React, { useState, useEffect } from "react";
import { useAuth } from "../../context/AuthContext";
import { useNotifications } from "../../context/NotificationContext";
import { useLocation } from "react-router-dom";
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
  FileText,
  Award
} from "lucide-react";
import Card, { CardBody, CardHeader } from "../../components/common/Card";
import Button from "../../components/common/Button";
import { mentorshipApi } from "../../api/mentorship";
import { eventsApi } from "../../api/events";
import { interviewsApi } from "../../api/interviews";

export const AlumniDashboard = () => {
  const { user } = useAuth();
  const { showToast } = useNotifications();
  const location = useLocation();

  const [loading, setLoading] = useState(true);
  const [requests, setRequests] = useState([]);
  const [mentees, setMentees] = useState([]);
  const [guides, setGuides] = useState([]);
  const [webinars, setWebinars] = useState([]);

  // Modal State for Prep Guide Sharing
  const [showShareModal, setShowShareModal] = useState(false);
  const [guideCompany, setGuideCompany] = useState("");
  const [guideRole, setGuideRole] = useState("");
  const [guideContent, setGuideContent] = useState("");
  const [submitting, setSubmitting] = useState(false);

  // Success Story Modal State
  const [showSuccessStoryModal, setShowSuccessStoryModal] = useState(false);
  const [storyCompany, setStoryCompany] = useState("");
  const [storyRole, setStoryRole] = useState("");
  const [storyPackage, setStoryPackage] = useState("");
  const [storyQuote, setStoryQuote] = useState("");

  useEffect(() => {
    if (showSuccessStoryModal && user) {
      setStoryCompany(user.company || "");
      setStoryRole(user.designation || "");
    }
  }, [showSuccessStoryModal, user]);

  const handleShareSuccessStory = (e) => {
    e.preventDefault();
    if (!storyCompany || !storyRole || !storyPackage || !storyQuote) {
      showToast("Please fill in all story fields", "warning");
      return;
    }

    try {
      const storiesData = localStorage.getItem("cn_success_stories");
      const stories = storiesData ? JSON.parse(storiesData) : [];
      
      const newStory = {
        name: user?.name || "Alumni User",
        role: storyRole,
        company: storyCompany,
        package: storyPackage,
        image: user?.avatar || "https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?w=150",
        quote: storyQuote
      };

      stories.unshift(newStory);
      localStorage.setItem("cn_success_stories", JSON.stringify(stories));

      showToast("Placement success story published successfully!", "success");
      setStoryPackage("");
      setStoryQuote("");
      setShowSuccessStoryModal(false);
    } catch (err) {
      showToast("Failed to share success story.", "error");
    }
  };

  const loadAlumniData = async () => {
    try {
      // 1. Fetch mentorship requests
      const allReqs = await mentorshipApi.getRequests("alumni");
      const pendingReqs = allReqs.filter(r => r.status?.toLowerCase() === "pending");
      const approvedMentees = allReqs.filter(r => r.status?.toLowerCase() === "approved");
      
      setRequests(pendingReqs.map(r => ({
        id: r.id,
        studentName: r.studentName || "Student Candidate",
        department: r.studentBranch || "Computer Engineering",
        cgpa: r.studentCgpa || 8.0,
        rollNumber: r.studentPrn || "N/A",
        message: r.message,
        avatar: r.studentAvatar || "https://cdn-icons-png.flaticon.com/512/149/149071.png"
      })));

      setMentees(approvedMentees.map(r => ({
        id: r.id,
        name: r.studentName || "Student Candidate",
        department: r.studentBranch || "Computer Engineering",
        activeTopic: r.type === "resume" ? "Resume Review" : r.type === "mock" ? "Mock Interview" : r.type === "project" ? "Project Review" : "Career Guidance",
        lastActive: "Just now"
      })));

      // 2. Fetch shared guides (interview experiences)
      const allGuides = await interviewsApi.getInterviews();
      const myGuides = allGuides.filter(g => g.authorName === user?.name || g.authorEmail === user?.email || g.authorName === "Alumni User");
      setGuides(myGuides.map(g => ({
        id: g.id,
        company: g.company,
        role: g.role,
        date: new Date(g.createdAt || new Date()).toLocaleDateString(),
        views: g.views || 0
      })));

      // 3. Fetch events
      const allEvents = await eventsApi.getEvents();
      const myEvents = allEvents.filter(e => e.speaker === user?.name || e.speaker === "Alumni User");
      setWebinars(myEvents.map(e => ({
        id: e.id,
        title: e.title,
        date: `${e.date} • ${e.time || ""}`,
        status: new Date(e.date) > new Date() ? "Scheduled" : "Completed",
        registered: 42 // Seeded drive registrants
      })));
    } catch (err) {
      console.warn("Failed to load alumni dashboard data:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (user) {
      loadAlumniData();
    }
  }, [user]);

  // Handlers
  const handleAcceptRequest = async (reqId, name) => {
    try {
      await mentorshipApi.updateRequestStatus(reqId, "APPROVED");
      showToast(`Mentorship connection accepted with ${name}!`, "success");
      loadAlumniData();
    } catch (err) {
      showToast(err.message || "Failed to accept request.", "error");
    }
  };

  const handleDeclineRequest = async (reqId, name) => {
    try {
      await mentorshipApi.updateRequestStatus(reqId, "REJECTED");
      showToast(`Mentorship request from ${name} declined.`, "info");
      loadAlumniData();
    } catch (err) {
      showToast(err.message || "Failed to decline request.", "error");
    }
  };

  const handleShareGuide = async (e) => {
    e.preventDefault();
    if (!guideCompany || !guideRole || !guideContent) {
      showToast("Please fill in all experience details", "warning");
      return;
    }

    setSubmitting(true);
    try {
      await interviewsApi.shareExperience({
        company: guideCompany,
        role: guideRole,
        experience: guideContent,
        difficulty: "Medium",
        rounds: 3,
        isAnonymous: false
      });
      showToast("Interview experience guide published successfully!", "success");
      setGuideCompany("");
      setGuideRole("");
      setGuideContent("");
      setShowShareModal(false);
      loadAlumniData();
    } catch (err) {
      showToast(err.message || "Failed to share prep guide.", "error");
    } finally {
      setSubmitting(false);
    }
  };

  const searchParams = new URLSearchParams(location.search);
  const activeTab = searchParams.get("tab") || "dashboard";

  const renderMentorshipTab = () => {
    return (
      <div className="space-y-6">
        <div className="bg-gradient-to-r from-brand-black to-red-950 text-white rounded-2xl p-6 shadow-md border border-brand-red/10">
          <h2 className="text-xl md:text-2xl font-extrabold font-outfit">Student Mentorship Hub</h2>
          <p className="text-xs text-gray-300 font-sans mt-1">
            Accept pending student mentorship requests and guide active candidates in resume/project review.
          </p>
        </div>

        {/* Requests Table */}
        <Card hover={false} className="bg-white border-gray-150 shadow-sm">
          <CardHeader className="bg-white border-b border-gray-100 py-4 px-5">
            <h3 className="text-sm font-bold text-gray-900 font-outfit uppercase tracking-wider">
              Pending Connections ({requests.length})
            </h3>
          </CardHeader>
          <CardBody className="p-0">
            {requests.length === 0 ? (
              <p className="p-8 text-center text-xs text-gray-400 font-medium">No pending mentorship requests.</p>
            ) : (
              <div className="divide-y divide-gray-100">
                {requests.map((req) => (
                  <div key={req.id} className="p-5 flex flex-col sm:flex-row justify-between items-start gap-4 hover:bg-gray-50/55 transition">
                    <div className="flex gap-4 items-start">
                      <img src={req.avatar} alt={req.studentName} className="h-10 w-10 rounded-xl object-cover border border-gray-100 flex-shrink-0" />
                      <div className="space-y-1.5 min-w-0 flex-1">
                        <h4 className="text-xs font-bold text-gray-955 font-outfit flex items-center gap-2">
                          {req.studentName} 
                          <span className="text-[9px] font-bold bg-red-50 text-brand-red px-1.5 py-0.5 rounded font-mono">GPA: {req.cgpa.toFixed(2)}</span>
                        </h4>
                        <p className="text-[10px] text-gray-500 font-sans">{req.department} • PRN: {req.rollNumber}</p>
                        <p className="text-[11px] text-gray-700 font-sans italic bg-gray-50/80 p-2.5 rounded-lg border border-gray-100 leading-relaxed">
                          "{req.message}"
                        </p>
                      </div>
                    </div>
                    <div className="flex sm:flex-col gap-2 w-full sm:w-auto justify-end">
                      <button
                        onClick={() => handleAcceptRequest(req.id, req.studentName)}
                        className="px-3.5 py-1.5 bg-brand-red hover:bg-brand-darkRed text-white text-[10px] font-bold rounded-lg transition-all"
                      >
                        Accept
                      </button>
                      <button
                        onClick={() => handleDeclineRequest(req.id, req.studentName)}
                        className="px-3.5 py-1.5 border border-gray-200 hover:bg-red-50 hover:text-red-600 text-gray-600 text-[10px] font-bold rounded-lg bg-white transition-all"
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

        {/* Active Mentees list */}
        <Card hover={false} className="bg-white border-gray-150 shadow-sm">
          <CardHeader className="bg-white border-b border-gray-100 py-4 px-5">
            <h3 className="text-sm font-bold text-gray-900 font-outfit uppercase tracking-wider">
              My Active Mentees ({mentees.length})
            </h3>
          </CardHeader>
          <CardBody className="p-4 space-y-3.5">
            {mentees.length === 0 ? (
              <p className="text-center text-xs text-gray-400 py-6">You have no active mentees at the moment.</p>
            ) : (
              mentees.map((mentee) => (
                <div key={mentee.id} className="p-4 bg-gray-50 rounded-xl border border-gray-150 flex justify-between items-center gap-3">
                  <div className="min-w-0">
                    <h4 className="text-xs font-bold text-gray-950 font-outfit">{mentee.name}</h4>
                    <p className="text-[10px] text-gray-500 font-sans mt-0.5">{mentee.department}</p>
                    <span className="inline-flex text-[9px] font-extrabold bg-red-50 text-brand-red px-2 py-0.5 rounded uppercase mt-2">
                      Topic: {mentee.activeTopic}
                    </span>
                  </div>
                  <button
                    onClick={() => {
                      showToast(`Opening mentor-mentee chat room...`, "success");
                    }}
                    className="px-3.5 py-1.5 bg-white border border-gray-200 hover:border-brand-red text-[10px] font-bold text-brand-red rounded-lg transition-all"
                  >
                    Open Chat
                  </button>
                </div>
              ))
            )}
          </CardBody>
        </Card>
      </div>
    );
  };

  const renderInterviewExperiencesTab = () => {
    return (
      <div className="space-y-6">
        <div className="bg-gradient-to-r from-brand-black to-red-950 text-white rounded-2xl p-6 shadow-md flex justify-between items-center border border-brand-red/10">
          <div>
            <h2 className="text-xl md:text-2xl font-extrabold font-outfit">Interview Experiences Directory</h2>
            <p className="text-xs text-gray-300 font-sans mt-1">
              Share interview patterns, coding rounds structures, and placement preparation resources.
            </p>
          </div>
          <Button
            variant="primary"
            onClick={() => setShowShareModal(true)}
            iconBefore={<PlusCircle size={15} />}
            className="bg-brand-red hover:bg-brand-darkRed text-white text-xs py-2"
          >
            Share Guide
          </Button>
        </div>

        <Card hover={false} className="bg-white border-gray-150 shadow-sm">
          <CardHeader className="bg-white border-b border-gray-100 py-4 px-5">
            <h3 className="text-sm font-bold text-gray-900 font-outfit uppercase tracking-wider">
              My Published Prep Guides ({guides.length})
            </h3>
          </CardHeader>
          <CardBody className="p-4 space-y-4">
            {guides.length === 0 ? (
              <p className="text-center text-xs text-gray-400 py-6">You have not shared any interview experience guides yet.</p>
            ) : (
              guides.map((g) => (
                <div key={g.id} className="p-4 bg-gray-50 rounded-xl border border-gray-150 flex justify-between items-center">
                  <div className="space-y-1">
                    <h4 className="text-xs font-bold text-gray-950 font-outfit">
                      {g.role} Placement Guide
                    </h4>
                    <p className="text-[10px] text-gray-500 font-sans">
                      Target Company: <strong className="text-brand-red font-outfit uppercase">{g.company}</strong> • Shared on {g.date}
                    </p>
                  </div>
                  <div className="text-right">
                    <span className="text-[10px] font-bold bg-gray-100 text-gray-600 px-2 py-0.5 rounded font-outfit">
                      {g.views} reads
                    </span>
                  </div>
                </div>
              ))
            )}
          </CardBody>
        </Card>
      </div>
    );
  };

  const renderEventsTab = () => {
    return (
      <div className="space-y-6">
        <div className="bg-gradient-to-r from-brand-black to-red-950 text-white rounded-2xl p-6 shadow-md border border-brand-red/10">
          <h2 className="text-xl md:text-2xl font-extrabold font-outfit">Pre-Placement Events & Webinars</h2>
          <p className="text-xs text-gray-300 font-sans mt-1">
            Track schedules of coding bootcamps, resume building seminars, or mentor mock interview events.
          </p>
        </div>

        <Card hover={false} className="bg-white border-gray-150 shadow-sm">
          <CardHeader className="bg-white border-b border-gray-100 py-4 px-5">
            <h3 className="text-sm font-bold text-gray-900 font-outfit uppercase tracking-wider">
              My Hosted Webinars & Sessions ({webinars.length})
            </h3>
          </CardHeader>
          <CardBody className="p-4 space-y-4">
            {webinars.length === 0 ? (
              <p className="text-center text-xs text-gray-400 py-6 font-medium">You are not registered as a speaker for any sessions.</p>
            ) : (
              webinars.map((web) => (
                <div key={web.id} className="p-4 bg-gray-50 rounded-xl border border-gray-150 flex justify-between items-center">
                  <div className="space-y-1">
                    <h4 className="text-xs font-bold text-gray-950 font-outfit">{web.title}</h4>
                    <p className="text-[10px] text-gray-400 font-semibold">{web.date}</p>
                  </div>
                  <div className="text-right flex flex-col items-end gap-1.5">
                    <span className={`text-[8px] font-extrabold uppercase px-1.5 py-0.5 rounded ${
                      web.status === "Scheduled" ? "bg-red-50 text-brand-red" : "bg-gray-150 text-gray-500"
                    }`}>
                      {web.status}
                    </span>
                    <span className="text-[10px] text-gray-500 font-sans">
                      {web.registered} students registered
                    </span>
                  </div>
                </div>
              ))
            )}
          </CardBody>
        </Card>
      </div>
    );
  };

  if (loading) {
    return (
      <div className="h-[60vh] flex flex-col items-center justify-center bg-transparent">
        <div className="animate-spin rounded-full h-10 w-10 border-4 border-brand-red border-t-transparent"></div>
        <p className="mt-4 text-xs font-semibold text-gray-500 font-outfit">Loading mentor workspace...</p>
      </div>
    );
  }

  if (activeTab === "mentorship") {
    return renderMentorshipTab();
  }
  if (activeTab === "interviewexperiences") {
    return renderInterviewExperiencesTab();
  }
  if (activeTab === "events") {
    return renderEventsTab();
  }

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
          <div className="flex-shrink-0 flex items-center gap-3">
            <Button
              variant="outline"
              onClick={() => setShowSuccessStoryModal(true)}
              iconBefore={<Award size={17} />}
              className="bg-white border-brand-red text-brand-red hover:bg-red-50 text-xs font-bold"
            >
              Share Success Story
            </Button>
            <Button
              variant="primary"
              onClick={() => setShowShareModal(true)}
              iconBefore={<PlusCircle size={17} />}
              className="bg-brand-red hover:bg-brand-darkRed text-white text-xs font-bold"
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

      {/* Share Success Story Modal */}
      {showSuccessStoryModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="fixed inset-0 bg-gray-900/60 backdrop-blur-xs" onClick={() => setShowSuccessStoryModal(false)} />
          <div className="bg-white rounded-2xl shadow-xl max-w-lg w-full overflow-hidden border border-gray-150 z-10 p-6 flex flex-col gap-4 animate-slide-up">
            <h3 className="text-lg font-bold text-gray-955 font-outfit">Share Placement Success Story</h3>
            <form onSubmit={handleShareSuccessStory} className="space-y-4">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[10px] font-bold text-gray-500 uppercase mb-1 font-outfit">Company Placed At</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. TCS"
                    value={storyCompany}
                    onChange={(e) => setStoryCompany(e.target.value)}
                    className="block w-full border border-gray-300 rounded-lg text-sm py-2 px-3 focus:outline-none focus:ring-1 focus:ring-brand-red bg-white"
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-bold text-gray-500 uppercase mb-1 font-outfit">Designation / Role</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Java Developer"
                    value={storyRole}
                    onChange={(e) => setStoryRole(e.target.value)}
                    className="block w-full border border-gray-300 rounded-lg text-sm py-2 px-3 focus:outline-none focus:ring-1 focus:ring-brand-red bg-white"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 gap-3">
                <div>
                  <label className="block text-[10px] font-bold text-gray-500 uppercase mb-1 font-outfit">CTC Package Secured</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. 7.5 LPA or 12.5 LPA"
                    value={storyPackage}
                    onChange={(e) => setStoryPackage(e.target.value)}
                    className="block w-full border border-gray-300 rounded-lg text-sm py-2 px-3 focus:outline-none focus:ring-1 focus:ring-brand-red bg-white"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[10px] font-bold text-gray-500 uppercase mb-1 font-outfit">Success Message / Quote</label>
                <textarea
                  required
                  rows="4"
                  placeholder="Share a brief quote about how you prepared, what helped you succeed, and any advice for your junior candidates..."
                  value={storyQuote}
                  onChange={(e) => setStoryQuote(e.target.value)}
                  className="block w-full border border-gray-300 rounded-lg text-sm py-2 px-3 focus:outline-none focus:ring-1 focus:ring-brand-red font-sans"
                />
              </div>

              <div className="flex justify-end gap-3 pt-3 border-t border-gray-100">
                <Button variant="outline" size="sm" onClick={() => setShowSuccessStoryModal(false)}>
                  Cancel
                </Button>
                <Button type="submit" size="sm" className="bg-brand-red text-white hover:bg-brand-darkRed">
                  Publish Story
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
