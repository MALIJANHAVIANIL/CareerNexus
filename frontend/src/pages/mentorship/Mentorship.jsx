import React, { useState, useEffect } from "react";
import { useLocation } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import { useNotifications } from "../../context/NotificationContext";
import {
  Search,
  Building,
  GraduationCap,
  Calendar,
  Sparkles,
  Send,
  CheckCircle,
  Clock,
  Filter,
  User,
  MessageSquare,
  Award
} from "lucide-react";
import Card, { CardBody } from "../../components/common/Card";
import Button from "../../components/common/Button";
import EmptyState from "../../components/common/EmptyState";
import confetti from "canvas-confetti";
import { mentorshipApi } from "../../api/mentorship";

export const Mentorship = () => {
  const { user } = useAuth();
  const { showToast, addNotification } = useNotifications();
  const location = useLocation();

  // Tabs: explore, requested
  const [activeTab, setActiveTab] = useState("explore");

  // Search & Filter State
  const [search, setSearch] = useState("");
  const [selectedCompany, setSelectedCompany] = useState("");
  const [selectedDomain, setSelectedDomain] = useState("");

  const [mentorsList, setMentorsList] = useState([]);
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);

  // Selected mentor for details pane
  const [selectedMentor, setSelectedMentor] = useState(null);

  // Request Modal state
  const [showRequestModal, setShowRequestModal] = useState(false);
  const [requestType, setRequestType] = useState("guidance"); // 'resume' | 'mock' | 'guidance' | 'project'
  const [message, setMessage] = useState("");
  const [sending, setSending] = useState(false);

  const loadMentorsData = async () => {
    setLoading(true);
    try {
      const [allMentors, backendRequests] = await Promise.all([
        mentorshipApi.getMentors(),
        mentorshipApi.getRequests("student")
      ]);

      setMentorsList(allMentors);
      setRequests(backendRequests.map(r => ({
        id: r.id,
        mentorId: r.mentorId,
        type: r.type,
        message: r.message,
        status: r.status?.toLowerCase() || "pending",
        requestedDate: new Date(r.requestedAt || new Date()).toLocaleDateString()
      })));

      const stateMentorId = location.state?.mentorId;
      if (stateMentorId) {
        const found = allMentors.find(m => String(m.id) === String(stateMentorId));
        if (found) {
          setSelectedMentor(found);
          window.history.replaceState({}, document.title);
        } else if (allMentors.length > 0) {
          setSelectedJob(allMentors[0]);
        }
      } else if (allMentors.length > 0) {
        setSelectedMentor(allMentors[0]);
      }
    } catch (err) {
      console.error("Failed to load mentorship data:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadMentorsData();
  }, [user]);

  // Sync URL tab params
  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const tabParam = params.get("tab");
    if (tabParam === "requests") setActiveTab("requests");
  }, [location]);

  // Handle redirect from dashboard with state.mentorId
  useEffect(() => {
    if (location.state?.mentorId && mentorsList.length > 0) {
      const found = mentorsList.find((m) => String(m.id) === String(location.state.mentorId));
      if (found) {
        setSelectedMentor(found);
        window.history.replaceState({}, document.title);
      }
    }
  }, [location.state, mentorsList]);

  // Reset selected mentor when active tab/filters change
  useEffect(() => {
    const mentorsForTab = getFilteredMentorsForTab(activeTab);
    if (mentorsForTab.length > 0) {
      setSelectedMentor(mentorsForTab[0]);
    } else {
      setSelectedMentor(null);
    }
  }, [activeTab, search, selectedCompany, selectedDomain, requests]);

  const handleRequestClick = () => {
    if (user?.role !== "student") {
      showToast("Only students can request alumni mentorship.", "warning");
      return;
    }
    setShowRequestModal(true);
  };

  const submitRequest = async (e) => {
    e.preventDefault();
    if (!message.trim()) return;

    setSending(true);
    try {
      await mentorshipApi.sendMentorshipRequest({
        mentorId: selectedMentor.id,
        type: requestType,
        message: message.trim()
      });

      confetti({
        particleCount: 100,
        spread: 60,
        origin: { y: 0.65 },
        colors: ["#990000", "#111827", "#f59e0b"]
      });

      showToast(`Mentorship request sent to ${selectedMentor.name}!`, "success");
      addNotification("mentor", "Mentorship Requested", `Requested mentorship with ${selectedMentor.name} for ${requestType === 'resume' ? 'Resume Review' : requestType === 'mock' ? 'Mock Interview' : requestType === 'project' ? 'Project Review' : 'Career Guidance'}`);

      setShowRequestModal(false);
      setMessage("");
      loadMentorsData();
    } catch (err) {
      showToast(err.message || "Failed to send request.", "error");
    } finally {
      setSending(false);
    }
  };

  const getFilteredMentorsForTab = (tab) => {
    return mentorsList.filter((mentor) => {
      const matchesSearch =
        mentor.name?.toLowerCase().includes(search.toLowerCase()) ||
        mentor.company?.toLowerCase().includes(search.toLowerCase()) ||
        mentor.domain?.toLowerCase().includes(search.toLowerCase());

      const matchesCompany = selectedCompany ? mentor.company === selectedCompany : true;
      const matchesDomain = selectedDomain ? mentor.domain === selectedDomain : true;

      if (tab === "requests") {
        return matchesSearch && matchesCompany && matchesDomain && requests.some(r => r.mentorId === mentor.id);
      }
      return matchesSearch && matchesCompany && matchesDomain;
    });
  };

  const filteredMentors = getFilteredMentorsForTab(activeTab);

  const hasRequested = (mentorId) => requests.some(r => r.mentorId === mentorId);
  const getRequestStatus = (mentorId) => requests.find(r => r.mentorId === mentorId)?.status || "";
  const getRequestTypeLabel = (mentorId) => {
    const type = requests.find(r => r.mentorId === mentorId)?.type || "";
    const labels = {
      resume: "Resume Review",
      mock: "Mock Interview",
      project: "Project Review",
      guidance: "Career Guidance"
    };
    return labels[type] || "Career Guidance";
  };

  // Unique companies and domains for select options
  const uniqueCompanies = Array.from(new Set(mentorsList.map(m => m.company).filter(Boolean)));
  const uniqueDomains = Array.from(new Set(mentorsList.map(m => m.domain).filter(Boolean)));

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Search Header Banner */}
      <div className="bg-white border border-gray-150 rounded-2xl p-5 shadow-sm space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          {/* Search Box */}
          <div className="relative">
            <Search className="absolute left-3.5 top-3.5 h-4 w-4 text-gray-400" />
            <input
              type="text"
              placeholder="Search mentors by name, company, skills..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-gray-300 text-xs focus:outline-none focus:ring-1 focus:ring-brand-red focus:border-brand-red hover:border-gray-400 transition bg-white"
            />
          </div>

          {/* Filter by Company */}
          <div className="relative">
            <Building className="absolute left-3.5 top-3.5 h-4 w-4 text-gray-400" />
            <select
              value={selectedCompany}
              onChange={(e) => setSelectedCompany(e.target.value)}
              className="w-full pl-10 pr-8 py-2.5 rounded-xl border border-gray-300 text-xs focus:outline-none focus:ring-1 focus:ring-brand-red focus:border-brand-red hover:border-gray-400 transition appearance-none bg-white font-medium text-gray-700 font-sans"
            >
              <option value="">All Companies</option>
              {uniqueCompanies.map((c) => (
                <option key={c} value={c}>{c}</option>
              ))}
            </select>
          </div>

          {/* Filter by Domain */}
          <div className="relative">
            <Filter className="absolute left-3.5 top-3.5 h-4 w-4 text-gray-400" />
            <select
              value={selectedDomain}
              onChange={(e) => setSelectedDomain(e.target.value)}
              className="w-full pl-10 pr-8 py-2.5 rounded-xl border border-gray-300 text-xs focus:outline-none focus:ring-1 focus:ring-brand-red focus:border-brand-red hover:border-gray-400 transition appearance-none bg-white font-medium text-gray-700 font-sans"
            >
              <option value="">All Tech Domains</option>
              {uniqueDomains.map((d) => (
                <option key={d} value={d}>{d}</option>
              ))}
            </select>
          </div>
        </div>

        {/* Navigation Tabs */}
        <div className="border-t border-gray-100 pt-3 flex gap-2">
          {["explore", "requests"].map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`px-4 py-1.5 rounded-lg text-xs font-bold font-outfit uppercase transition-all ${
                activeTab === tab
                  ? "bg-brand-red text-white"
                  : "bg-gray-50 text-gray-500 hover:bg-gray-100"
              }`}
            >
              {tab === "explore" ? "Mentor Directory" : "Sent Requests"}
            </button>
          ))}
        </div>
      </div>

      {/* Main split grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
        {/* Left Side List: 1/3 layout on desktop */}
        <div className="lg:col-span-1 space-y-3.5 max-h-[70vh] overflow-y-auto pr-1">
          {filteredMentors.length === 0 ? (
            <EmptyState
              title={`No mentors found`}
              message="No mentors match your current keyword searches or filter selections."
            />
          ) : (
            filteredMentors.map((mentor) => (
              <Card
                key={mentor.id}
                onClick={() => setSelectedMentor(mentor)}
                hover
                className={`cursor-pointer border-gray-150 ${selectedMentor?.id === mentor.id ? "ring-1.5 ring-brand-red bg-red-50/5" : "bg-white"}`}
              >
                <CardBody className="p-4 flex gap-3">
                  <img
                    src={mentor.avatar || "https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?w=150"}
                    alt={mentor.name}
                    className="h-11 w-11 rounded-xl object-cover border border-gray-250 flex-shrink-0"
                  />
                  <div className="flex-1 min-w-0">
                    <div className="flex justify-between items-start gap-1">
                      <h4 className="text-xs font-extrabold text-gray-955 truncate font-outfit">{mentor.name}</h4>
                      {hasRequested(mentor.id) && (
                        <span className="text-[7px] font-extrabold bg-amber-50 text-amber-600 border border-amber-200 px-1.5 py-0.5 rounded font-outfit uppercase flex-shrink-0">
                          {getRequestStatus(mentor.id)}
                        </span>
                      )}
                    </div>
                    <p className="text-[10px] font-bold text-gray-550 mt-0.5">{mentor.title}</p>
                    <p className="text-[10px] text-gray-400 flex items-center gap-1 mt-1 font-sans">
                      <Building size={11} /> {mentor.company}
                    </p>
                    <div className="flex justify-between items-center mt-3 pt-2 border-t border-gray-50">
                      <span className="text-[9px] font-bold text-brand-red bg-red-50 px-2 py-0.5 rounded font-outfit">
                        {mentor.domain}
                      </span>
                      <div className="flex items-center gap-2">
                        <span className="text-[9px] font-bold text-gray-500 bg-gray-100 px-1.5 py-0.5 rounded font-outfit">{mentor.experience}</span>
                        <span className="text-[9px] font-bold text-gray-450 font-outfit">Class of {mentor.graduationYear || mentor.year || 2024}</span>
                      </div>
                    </div>
                  </div>
                </CardBody>
              </Card>
            ))
          )}
        </div>

        {/* Right Side Details: 2/3 layout on desktop */}
        <div className="lg:col-span-2">
          {selectedMentor ? (
            <Card hover={false} className="sticky top-24 bg-white border-gray-150">
              {/* Mentor Header Details */}
              <div className="p-6 border-b border-gray-100 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div className="flex items-center gap-4">
                  <img
                    src={selectedMentor.avatar || "https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?w=150"}
                    alt={selectedMentor.name}
                    className="h-16 w-16 rounded-2xl object-cover border border-gray-200 shadow-xs flex-shrink-0"
                  />
                  <div>
                    <h3 className="text-base font-extrabold text-gray-900 font-outfit leading-tight">{selectedMentor.name}</h3>
                    <p className="text-xs text-gray-500 mt-1 font-semibold font-sans flex items-center gap-1.5">
                      <Building size={13} className="text-gray-400" /> {selectedMentor.title} at <span className="text-gray-700 font-bold">{selectedMentor.company}</span>
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-2 w-full sm:w-auto flex-shrink-0">
                  {hasRequested(selectedMentor.id) ? (
                    <div className="flex items-center gap-1.5 py-2 px-3 bg-amber-50 text-amber-800 rounded-lg text-xs font-bold border border-amber-100 font-outfit uppercase">
                      <Clock size={14} className="text-amber-500" /> Request Pending
                    </div>
                  ) : (
                    <Button
                      variant="primary"
                      onClick={handleRequestClick}
                      className="bg-brand-red hover:bg-brand-darkRed text-white px-4 py-2 text-xs"
                    >
                      Request Mentorship
                    </Button>
                  )}
                </div>
              </div>

              {/* Mentor Stats & Bio Details */}
              <div className="p-6 space-y-6">
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 p-4 bg-gray-50 rounded-xl border border-gray-150">
                  <div>
                    <span className="text-[9px] uppercase font-bold text-gray-400 font-outfit tracking-wide block">Alumni Branch</span>
                    <span className="text-xs font-bold text-gray-800 mt-0.5 block">{selectedMentor.department || selectedMentor.branch || "Computer Science"}</span>
                  </div>
                  <div>
                    <span className="text-[9px] uppercase font-bold text-gray-400 font-outfit tracking-wide block">Graduation Year</span>
                    <span className="text-xs font-bold text-brand-red mt-0.5 block">{selectedMentor.graduationYear || selectedMentor.year || 2024}</span>
                  </div>
                  <div>
                    <span className="text-[9px] uppercase font-bold text-gray-400 font-outfit tracking-wide block">Core Domain</span>
                    <span className="text-xs font-bold text-gray-800 mt-0.5 block">{selectedMentor.domain}</span>
                  </div>
                  <div>
                    <span className="text-[9px] uppercase font-bold text-gray-400 font-outfit tracking-wide block">Total Experience</span>
                    <span className="text-xs font-bold text-gray-850 mt-0.5 block">{selectedMentor.experience}</span>
                  </div>
                </div>

                {activeTab === "requests" && (
                  <div className="p-4 bg-amber-50/20 border border-amber-250/20 rounded-xl space-y-2">
                    <h4 className="text-xs font-bold text-amber-700 font-outfit uppercase tracking-wider flex items-center gap-1">
                      <Clock size={13} /> Your Sent Request details
                    </h4>
                    <p className="text-[10px] text-gray-500 font-sans">
                      <span className="font-bold text-gray-700">Area of Assistance: </span> 
                      {getRequestTypeLabel(selectedMentor.id)}
                    </p>
                    <p className="text-[10px] text-gray-500 font-sans mt-1">
                      <span className="font-bold text-gray-700">Your message: </span>
                      <span className="italic font-mono">"{requests.find(r => r.mentorId === selectedMentor.id)?.message}"</span>
                    </p>
                  </div>
                )}

                {/* About Mentor */}
                <div className="space-y-2">
                  <h4 className="text-xs font-bold text-gray-955 font-outfit uppercase tracking-wide flex items-center gap-1">
                    <User size={13} className="text-brand-red" /> Alumni Biography
                  </h4>
                  <p className="text-xs text-gray-500 font-sans leading-relaxed">
                    {selectedMentor.bio || selectedMentor.summary || "Alumni mentor specializing in technology leadership, career planning, and systems architectures."}
                  </p>
                </div>

                {/* Key Skills */}
                {selectedMentor.skills && (
                  <div className="space-y-2.5">
                    <h4 className="text-xs font-bold text-gray-955 font-outfit uppercase tracking-wide flex items-center gap-1">
                      <Award size={13} className="text-brand-red" /> Verified Mentorship Areas
                    </h4>
                    <div className="flex flex-wrap gap-1.5 pt-0.5">
                      {selectedMentor.skills.map((skill, idx) => (
                        <span key={idx} className="bg-gray-100 text-gray-800 text-[10px] font-bold px-2.5 py-1 rounded-md border border-gray-200/50">
                          {skill}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </Card>
          ) : (
            <div className="h-full flex items-center justify-center p-10 border border-dashed border-gray-200 bg-white/50 rounded-2xl">
              <p className="text-xs text-gray-400 font-outfit">Select an alumni profile from directory to view verification details.</p>
            </div>
          )}
        </div>
      </div>

      {/* Request Mentorship Modal Form */}
      {showRequestModal && selectedMentor && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-gray-900/60 backdrop-blur-xs animate-fade-in">
          <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full overflow-hidden border border-gray-150 p-6 flex flex-col gap-4 animate-slide-up">
            <h3 className="text-sm font-bold text-gray-955 font-outfit uppercase tracking-wider border-b border-gray-50 pb-2 flex items-center gap-1.5">
              <Send size={15} className="text-brand-red" /> Request Mentorship with {selectedMentor.name}
            </h3>

            <form onSubmit={submitRequest} className="space-y-4">
              <div>
                <label className="block text-[10px] font-bold text-gray-650 mb-1.5 font-outfit uppercase">Area of Assistance Required</label>
                <select
                  value={requestType}
                  onChange={(e) => setRequestType(e.target.value)}
                  className="w-full border border-gray-300 rounded-lg text-xs py-2.5 px-3 focus:outline-none focus:ring-1 focus:ring-brand-red focus:border-brand-red bg-white font-semibold text-gray-700 font-sans"
                >
                  <option value="guidance">Career Development Guidance</option>
                  <option value="resume">Resume Review & ATS Optimization</option>
                  <option value="mock">Technical Mock Interview Session</option>
                  <option value="project">College Project Architectural Review</option>
                </select>
              </div>

              <div>
                <label className="block text-[10px] font-bold text-gray-650 mb-1.5 font-outfit uppercase">Why do you want this alumni as your mentor?</label>
                <textarea
                  required
                  rows="4"
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  placeholder="Outline your questions and what you hope to learn from their corporate tech background..."
                  className="w-full border border-gray-300 rounded-lg text-xs py-2.5 px-3 focus:outline-none focus:ring-1 focus:ring-brand-red focus:border-brand-red font-sans bg-white"
                />
              </div>

              <div className="flex justify-end gap-3 pt-3 border-t border-gray-100">
                <Button variant="outline" size="sm" type="button" onClick={() => setShowRequestModal(false)} className="text-xs py-1.5 px-3">
                  Cancel
                </Button>
                <Button type="submit" size="sm" loading={sending} className="bg-brand-red text-white hover:bg-brand-darkRed text-xs py-1.5 px-3">
                  Submit Request
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Mentorship;
